import asyncio
import time as _t
import base64
import collections
import json
import os
import threading
import time
from typing import Optional

import numpy as np
import cv2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ultralytics import YOLO

from camera_resolve import resolve_camera_device

# ============================================================
# Constants — every tunable threshold lives here.
# ============================================================

# --- Model paths ---
MODEL_PATH = "/home/museum/artful-accessibility/jetson-inference/weights/best.engine"
PERSON_MODEL_PATH = "/home/museum/artful-accessibility/jetson-inference/yolov8n.engine"

# --- Camera configuration ---
# One entry per physical camera. Adding a second camera is a config edit
# here (device_glob = its own /dev/v4l/by-id/... path) plus a systemd
# restart — never a Python change. If this file is missing or unreadable,
# the server falls back to exactly today's single-camera behaviour: one
# camera, glob "/dev/v4l/by-id/*index0", falling back to device index 0
# if that never enumerates.
CAMERAS_CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cameras.json")
DEFAULT_CAMERAS_CONFIG = [
    {"label": "default", "device_glob": "/dev/v4l/by-id/*index0", "allow_index_fallback": True}
]

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

# Both engines run on the Jetson's single GPU. ultralytics/TensorRT execution
# isn't safe under concurrent calls from multiple threads, so every camera
# worker serializes its predict() calls through this lock. Frame capture
# (cv2.VideoCapture.read) still happens independently per camera thread —
# only the GPU inference step is serialized.
model = YOLO(MODEL_PATH)
person_model = YOLO(PERSON_MODEL_PATH)
_inference_lock = threading.Lock()


def load_cameras_config():
    try:
        with open(CAMERAS_CONFIG_PATH) as f:
            cfg = json.load(f)
        if not isinstance(cfg, list) or not cfg:
            raise ValueError("cameras.json must be a non-empty JSON list")
        return cfg
    except FileNotFoundError:
        print(f"cameras.json not found at {CAMERAS_CONFIG_PATH}; using single default camera", flush=True)
        return DEFAULT_CAMERAS_CONFIG
    except Exception as e:
        print(f"ERROR reading cameras.json ({e}); using single default camera", flush=True)
        return DEFAULT_CAMERAS_CONFIG


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

    with _inference_lock:
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
    return {"status": "ok", "model": MODEL_PATH, "cameras": len(workers)}


class CameraWorker:
    """Owns exactly one physical camera end-to-end: device resolution,
    capture, both models' inference, and its own latest status/frame.

    A failure here (camera won't open, read fails, inference throws) is
    contained to this worker: it's reported in this camera's own status and
    retried in the background. It never stops other workers or the server.
    """

    def __init__(self, index, config):
        self.index = index
        self.label = config.get("label") or f"cam{index}"
        self.device_glob = config["device_glob"]
        self.allow_index_fallback = bool(config.get("allow_index_fallback", False))
        self.max_attempts = int(config.get("max_attempts", 10))

        self.resolved_device = None
        self.camera = None
        self.camera_ok = False
        self.last_error = None

        self.latest_status = {"detected": False, "confidence": 0.0,
                               "present": False, "present_confidence": 0.0, "ts": 0.0}
        self.latest_raw = None
        self.latest_annotated = None
        self._frame_times = collections.deque(maxlen=FPS_WINDOW)
        self._start_time = time.time()

        self.thread = threading.Thread(target=self._run, daemon=True, name=f"camera-{self.label}")

    def start(self):
        self.thread.start()

    def _log(self, msg):
        print(f"[camera:{self.label}] {msg}", flush=True)

    def _resolve_and_open(self):
        device = resolve_camera_device(
            by_id_pattern=self.device_glob,
            max_attempts=self.max_attempts,
            allow_index_fallback=self.allow_index_fallback,
            log=self._log,
        )
        if device is None:
            self.resolved_device = None
            self.camera = None
            self.camera_ok = False
            self.last_error = "camera not found"
            return False
        cam = cv2.VideoCapture(device)
        if not cam.isOpened():
            self._log(f"ERROR: could not open camera at {device}")
            self.resolved_device = device
            self.camera = None
            self.camera_ok = False
            self.last_error = "failed to open device"
            return False
        self._log(f"camera opened at {device}")
        self.resolved_device = device
        self.camera = cam
        self.last_error = None
        return True

    def _run(self):
        # An exception anywhere in _run_inner (bad frame, model hiccup, a
        # device that vanishes mid-read) is caught here so this camera keeps
        # retrying forever instead of silently going dead — and so it can
        # never take the process, or any other camera's thread, down with it.
        while True:
            try:
                self._run_inner()
            except Exception as e:
                self.camera_ok = False
                self.last_error = f"worker crashed: {e}"
                self._log(f"CRASHED, recovering: {e}")
                time.sleep(1.0)

    def _run_inner(self):
        if self.camera is None:
            if not self._resolve_and_open():
                time.sleep(3.0)  # keep retrying in the background, no restart needed
                return

        fails = 0
        while True:
            ret, frame = self.camera.read()
            if not ret:
                fails += 1
                self.camera_ok = False
                self.last_error = "camera read failed"
                self._frame_times.clear()
                try:
                    self.camera.release()
                except Exception:
                    pass
                time.sleep(0.3)
                # Reopen at the same already-resolved path, matching the
                # original single-camera behaviour: a transient read failure
                # re-opens the known device, it doesn't re-glob from scratch.
                self.camera = cv2.VideoCapture(self.resolved_device) if self.resolved_device is not None else None
                if fails % 20 == 0:
                    self._log(f"camera read failing, retry {fails}")
                continue
            fails = 0
            self.camera_ok = True
            self.last_error = None
            self._frame_times.append(time.time())

            ok, raw_buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ok:
                self.latest_raw = raw_buf.tobytes()

            with _inference_lock:
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

            self.latest_status = {"detected": detected, "confidence": round(best_conf, 3),
                                   "present": present, "present_confidence": round(present_conf, 3),
                                   "ts": time.time()}

            ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if ok:
                self.latest_annotated = buf.tobytes()

    def _current_fps(self):
        if len(self._frame_times) < 2:
            return 0.0
        span = self._frame_times[-1] - self._frame_times[0]
        if span <= 0:
            return 0.0
        return round((len(self._frame_times) - 1) / span, 2)

    def status_dict(self):
        return {
            **self.latest_status,
            "fps": self._current_fps(),
            "uptime_seconds": round(time.time() - self._start_time, 1),
            "camera_ok": self.camera_ok,
            "device": self.resolved_device,
            "label": self.label,
            "error": self.last_error,
        }

    async def mjpeg_generator(self):
        while True:
            if self.latest_annotated is not None:
                yield (b"--frame\r\n"
                       b"Content-Type: image/jpeg\r\n\r\n" + self.latest_annotated + b"\r\n")
            await asyncio.sleep(0.04)


workers = [CameraWorker(i, cfg) for i, cfg in enumerate(load_cameras_config())]
for _w in workers:
    _w.start()


def _find_worker(device: Optional[str]):
    """None (no ?device= param) -> first/only configured camera, preserving
    the original single-camera endpoints for every existing caller. A
    device that doesn't match any configured, resolved camera returns None
    so the caller can report 'unknown camera' instead of crashing."""
    if not workers:
        return None
    if device is None:
        return workers[0]
    for w in workers:
        if w.resolved_device == device:
            return w
    return None


def _unknown_camera_status(device: Optional[str]):
    return {"detected": False, "confidence": 0.0, "present": False, "present_confidence": 0.0,
            "ts": 0.0, "fps": 0.0, "uptime_seconds": 0.0, "camera_ok": False,
            "device": device, "label": None, "error": "unknown camera"}


@app.get("/cameras")
def cameras():
    return {"cameras": [
        {**w.status_dict(), "index": w.index, "configured_glob": w.device_glob}
        for w in workers
    ]}


@app.get("/capture")
def capture(device: Optional[str] = None):
    w = _find_worker(device)
    if w is None:
        return {"error": "unknown camera"}
    for _ in range(25):
        if w.latest_raw is not None:
            return {"image": base64.b64encode(w.latest_raw).decode()}
        _t.sleep(0.1)
    return {"error": "no frame available from inference loop"}


@app.get("/stream")
async def stream(device: Optional[str] = None):
    w = _find_worker(device)
    if w is None:
        async def _empty():
            if False:
                yield b""  # pragma: no cover - keeps this an async generator
        return StreamingResponse(_empty(), media_type="multipart/x-mixed-replace; boundary=frame")
    return StreamingResponse(w.mjpeg_generator(),
                             media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/status")
def status(device: Optional[str] = None):
    w = _find_worker(device)
    if w is None:
        return _unknown_camera_status(device)
    return w.status_dict()
