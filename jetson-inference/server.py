import asyncio
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

MODEL_PATH = "/home/rosen/runs/detect/wheelchair_detector/weights/best.engine"
model = YOLO(MODEL_PATH)

import glob as _glob
_by_id = _glob.glob("/dev/v4l/by-id/*index0")
_device = _by_id[0] if _by_id else 0
camera = cv2.VideoCapture(_device)
if not camera.isOpened():
    print("ERROR: no camera could be opened at", _device)
else:
    print("Camera opened successfully at:", _device)

WHEELCHAIR_CLASSES = {"wheelchair", "people_wheelchair", "push_wheelchair"}
CONF_THRESHOLD = 0.5


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

    results = model.predict(img, imgsz=256, verbose=False)

    detected = False
    best_conf = 0.0
    predictions = []

    for r in results:
        for box in r.boxes:
            cls_name = model.names[int(box.cls[0])]
            conf = float(box.conf[0])
            predictions.append({"class": cls_name, "confidence": round(conf, 3)})
            if cls_name in WHEELCHAIR_CLASSES and conf >= CONF_THRESHOLD:
                detected = True
                best_conf = max(best_conf, conf)

    return {"detected": detected, "confidence": round(best_conf, 3), "predictions": predictions}


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_PATH}

@app.get("/capture")
def capture():
    global camera
    for attempt in range(5):
        ret, frame = camera.read()
        if ret:
            _, buffer = cv2.imencode('.jpg', frame)
            img_b64 = base64.b64encode(buffer).decode()
            return {"image": img_b64}
        camera.release()
        camera = cv2.VideoCapture(0)
    return {"error": "camera read failed after 5 attempts"}


latest_status = {"detected": False, "confidence": 0.0}

async def mjpeg_generator():
    global camera, latest_status
    while True:
        ret, frame = camera.read()
        if not ret:
            camera.release()
            camera = cv2.VideoCapture(0)
            await asyncio.sleep(0.05)
            continue

        results = model.predict(frame, imgsz=256, verbose=False)
        detected = False
        best_conf = 0.0
        for r in results:
            for box in r.boxes:
                cls_name = model.names[int(box.cls[0])]
                conf = float(box.conf[0])
                if cls_name in WHEELCHAIR_CLASSES and conf >= CONF_THRESHOLD:
                    detected = True
                    best_conf = max(best_conf, conf)
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, f"{cls_name} {conf:.2f}", (x1, max(y1 - 10, 0)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        latest_status = {"detected": detected, "confidence": round(best_conf, 3)}

        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


@app.get("/stream")
async def stream():
    return StreamingResponse(mjpeg_generator(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/status")
def status():
    return latest_status
