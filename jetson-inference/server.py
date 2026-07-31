import asyncio
import time as _t
import base64
import numpy as np
import cv2
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ultralytics import YOLO

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "/home/museum/artful-accessibility/jetson-inference/weights/best.engine"
model = YOLO(MODEL_PATH)

PERSON_MODEL_PATH = "/home/museum/artful-accessibility/jetson-inference/yolov8n.engine"
person_model = YOLO(PERSON_MODEL_PATH)
COCO_PERSON_ID = 0
CHAIR_IMGSZ = 640
PERSON_IMGSZ = 256

import glob as _glob
_by_id = _glob.glob("/dev/v4l/by-id/*index0")
_device = _by_id[0] if _by_id else 0
camera = cv2.VideoCapture(_device)
if not camera.isOpened():
    print("ERROR: no camera could be opened at", _device)
else:
    print("Camera opened successfully at:", _device)

WHEELCHAIR_CLASSES = {"wheelchair", "people_wheelchair", "push_wheelchair"}
PERSON_CLASSES = {"person"}
PRESENCE_CLASSES = WHEELCHAIR_CLASSES | PERSON_CLASSES
CONF_THRESHOLD = 0.5
PRESENCE_THRESHOLD = 0.40


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
    predictions = []

    for r in results:
        for box in r.boxes:
            cls_name = model.names[int(box.cls[0])]
            conf = float(box.conf[0])
            predictions.append({"class": cls_name, "confidence": round(conf, 3)})
            if cls_name in WHEELCHAIR_CLASSES and conf >= CONF_THRESHOLD:
                detected = True
                best_conf = max(best_conf, conf)
            if cls_name in PRESENCE_CLASSES and conf >= PRESENCE_THRESHOLD:
                present = True
                present_conf = max(present_conf, conf)

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


import threading, time

latest_status = {"detected": False, "confidence": 0.0,
                 "present": False, "present_confidence": 0.0, "ts": 0.0}
latest_raw = None
latest_annotated = None


def inference_loop():
    global camera, latest_status, latest_raw, latest_annotated
    fails = 0
    while True:
        ret, frame = camera.read()
        if not ret:
            fails += 1
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

        ok, raw_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if ok:
            latest_raw = raw_buf.tobytes()

        p_results = person_model.predict(frame, imgsz=PERSON_IMGSZ, verbose=False)
        results = model.predict(frame, imgsz=CHAIR_IMGSZ, verbose=False)
        detected = False
        best_conf = 0.0
        present = False
        present_conf = 0.0

        for r in results:
            for box in r.boxes:
                cls_name = model.names[int(box.cls[0])]
                conf = float(box.conf[0])
                is_chair = cls_name in WHEELCHAIR_CLASSES and conf >= CONF_THRESHOLD
                is_present = cls_name in PRESENCE_CLASSES and conf >= PRESENCE_THRESHOLD
                if is_chair:
                    detected = True
                    best_conf = max(best_conf, conf)
                if is_present:
                    present = True
                    present_conf = max(present_conf, conf)
                if is_chair or is_present:
                    color = (0, 255, 0) if is_chair else (255, 180, 0)
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
                present = True
                present_conf = max(present_conf, conf)
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 180, 0), 2)
                cv2.putText(frame, f"person {conf:.2f}", (x1, max(y1 - 10, 0)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 180, 0), 2)

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
    return latest_status
