import asyncio
import time as _t
import base64
import collections
import glob as _glob
import threading
import time
import numpy as np
import cv2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ultralytics import YOLO

# ============================================================
# Constants — every tunable threshold lives here.
# ============================================================

# --- Model paths ---
MODEL_PATH = "/home/museum/artful-accessibility/jetson-inference/weights/best.engine"
PERSON_MODEL_PATH = "/home/museum/artful-accessibility/jetson-inference/yolov8n.engine"

# --- Detection classes ---
WHEELCHAIR_CLASSES = {"wheelchair", "people_wheelchair", "push_wheelchair"}
PERSON_CLASSES = {"person"}
PRESENCE_CLASSES = WHEELCHAIR_CLASSES | PERSON_CLASSES
COCO_PERSON_ID = 0

# --- Inference sizes ---
CHAIR_IMGSZ = 640
PERSON_IMGSZ = 256

# --- Confidence thresholds ---
CONF_THRESHOLD = 0.5       # wheelchair classes
PRESENCE_THRESHOLD = 0.40  # any person / wheelchair-occupant class

# --- Presence filtering (museum-corridor tuning) ---
# Ignore boxes smaller than this fraction of the frame area — filters out
# distant passers-by so only someone actually approaching the painting
# counts as "present".
MIN_BOX_AREA_RATIO = 0.04

# Region of interest a box's centre must fall inside to count, expressed as
# fractions of frame width/height (0.0-1.0). Defaults to the full frame.
# Tune these while watching the faint rectangle drawn on /stream.
ROI_X1 = 0.0
ROI_Y1 = 0.0
ROI_X2 = 1.0
ROI_Y2 = 1.0

# --- Colors (BGR) ---
COLOR_WHEELCHAIR = (0, 255, 0)
COLOR_PERSON = (255, 180, 0)
COLOR_ROI = (0, 200, 255)

# --- Health metrics ---
FPS_WINDOW = 30  # rolling average over this many frames

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO(MODEL_PATH)
person_model = YOLO(PERSON_MODEL_PATH)

_by_id = _glob.glob("/dev/v4l/by-id/*index0")
_device = _by_id[0] if _by_id else 0
camera = cv2.VideoCapture(_device)
if not camera.isOpened():
    print("ERROR: no camera could be opened at", _device)
else:
    print("Camera opened successfully at:", _device)


def _box_metrics(xyxy, frame_shape):
    """Return (area_ratio, in_roi) for a box given the frame it came from."""
    h, w = frame_shape[:2]
    x1, y1, x2, y2 = xyxy
    area_ratio = max(0.0, (x2 - x1)) * max(0.0, (y2 - y1)) / float(w * h)
    cx, cy = (x1 + x2) / 2.0, (y1 + y2) / 2.0
    in_roi = (ROI_X1 * w <= cx <= ROI_X2 * w) and (ROI_Y1 * h <= cy <= ROI_Y2 * h)
    return area_ratio, in_roi


def _draw_roi(frame):
    h, w = frame.shape[:2]
    x1, y1 = int(ROI_X1 * w), int(ROI_Y1 * h)
    x2, y2 = int(ROI_X2 * w), int(ROI_Y2 * h)
    overlay = frame.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), COLOR_ROI, 2)
    cv2.addWeighted(overlay, 0.25, frame, 0.75, 0, frame)


_start_time = time.time()
_frame_times = collections.deque(maxlen=FPS_WINDOW)
_camera_ok = False


def _current_fps():
    if len(_frame_times) < 2:
        return 0.0
    span = _frame_times[-1] - _frame_times[0]
    if span <= 0:
        return 0.0
    return round((len(_frame_times) - 1) / span, 2)


class ImageRequest(BaseModel):
    image: str


@app.post("/detect")
def detect(req: ImageRequest):
    img_b64 = req.image
    if "," in img_b64:
        img_b64 = img_b64.split(",")[1]

    img_data = base64.b64decode(img_b64)
    img_arr = np.frombuffer(img_data, dtype=np.uint8)
    img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)

    results = model.predict(img, imgsz=CHAIR_IMGSZ, verbose=False)

    detected = False
    best_conf = 0.0
    present = False
    present_conf = 0.0
    best_present_area = -1.0
    predictions = []

    for r in results:
        for box in r.boxes:
            cls_name = model.names[int(box.cls[0])]
            conf = float(box.conf[0])
            predictions.append({"class": cls_name, "confidence": round(conf, 3)})

            area_ratio, in_roi = _box_metrics(box.xyxy[0], img.shape)
            passes_filter = area_ratio >= MIN_BOX_AREA_RATIO and in_roi

            if cls_name in WHEELCHAIR_CLASSES and conf >= CONF_THRESHOLD and passes_filter:
                detected = True
                best_conf = max(best_conf, conf)
            if cls_name in PRESENCE_CLASSES and conf >= PRESENCE_THRESHOLD and passes_filter:
                if area_ratio > best_present_area:
                    best_present_area = area_ratio
                    present_conf = conf
                present = True

    return {"detected": detected, "confidence": round(best_conf, 3),
            "present": present, "present_confidence": round(present_conf, 3),
            "predictions": predictions}


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_PATH}


@app.get("/capture")
def capture():
    for _ in range(25):
        if latest_raw is not None:
            return {"image": base64.b64encode(latest_raw).decode()}
        _t.sleep(0.1)
    return {"error": "no frame available from inference loop"}


latest_status = {"detected": False, "confidence": 0.0,
                 "present": False, "present_confidence": 0.0, "ts": 0.0}
latest_raw = None
latest_annotated = None


def inference_loop():
    global camera, latest_status, latest_raw, latest_annotated, _camera_ok
    fails = 0
    while True:
        ret, frame = camera.read()
        if not ret:
            fails += 1
            _camera_ok = False
            _frame_times.clear()
            try:
                camera.release()
            except Exception:
                pass
            time.sleep(0.3)
            camera = cv2.VideoCapture(_device)
            if fails % 20 == 0:
                print("camera read failing, retry", fails, flush=True)
            continue
        fails = 0
        _camera_ok = True
        _frame_times.append(time.time())

        ok, raw_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if ok:
            latest_raw = raw_buf.tobytes()

        p_results = person_model.predict(frame, imgsz=PERSON_IMGSZ, verbose=False)
        results = model.predict(frame, imgsz=CHAIR_IMGSZ, verbose=False)
        detected = False
        best_conf = 0.0
        present = False
        present_conf = 0.0
        best_present_area = -1.0

        for r in results:
            for box in r.boxes:
                cls_name = model.names[int(box.cls[0])]
                conf = float(box.conf[0])
                area_ratio, in_roi = _box_metrics(box.xyxy[0], frame.shape)
                passes_filter = area_ratio >= MIN_BOX_AREA_RATIO and in_roi

                is_chair = cls_name in WHEELCHAIR_CLASSES and conf >= CONF_THRESHOLD and passes_filter
                is_present = cls_name in PRESENCE_CLASSES and conf >= PRESENCE_THRESHOLD and passes_filter
                if is_chair:
                    detected = True
                    best_conf = max(best_conf, conf)
                if is_present:
                    if area_ratio > best_present_area:
                        best_present_area = area_ratio
                        present_conf = conf
                    present = True
                if is_chair or is_present:
                    color = COLOR_WHEELCHAIR if is_chair else COLOR_PERSON
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"{cls_name} {conf:.2f}", (x1, max(y1 - 10, 0)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        for r in p_results:
            for box in r.boxes:
                if int(box.cls[0]) != COCO_PERSON_ID:
                    continue
                conf = float(box.conf[0])
                if conf < PRESENCE_THRESHOLD:
                    continue
                area_ratio, in_roi = _box_metrics(box.xyxy[0], frame.shape)
                if area_ratio < MIN_BOX_AREA_RATIO or not in_roi:
                    continue
                if area_ratio > best_present_area:
                    best_present_area = area_ratio
                    present_conf = conf
                present = True
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), COLOR_PERSON, 2)
                cv2.putText(frame, f"person {conf:.2f}", (x1, max(y1 - 10, 0)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR_PERSON, 2)

        _draw_roi(frame)

        latest_status = {"detected": detected, "confidence": round(best_conf, 3),
                         "present": present, "present_confidence": round(present_conf, 3),
                         "ts": time.time()}

        ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        if ok:
            latest_annotated = buf.tobytes()


threading.Thread(target=inference_loop, daemon=True).start()


async def mjpeg_generator():
    while True:
        if latest_annotated is not None:
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + latest_annotated + b"\r\n")
        await asyncio.sleep(0.04)


@app.get("/stream")
async def stream():
    return StreamingResponse(mjpeg_generator(),
                             media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/status")
def status():
    return {
        **latest_status,
        "fps": _current_fps(),
        "uptime_seconds": round(time.time() - _start_time, 1),
        "camera_ok": _camera_ok,
    }
