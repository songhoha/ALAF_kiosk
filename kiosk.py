from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from time import sleep, time
import threading

BASE = Path(__file__).resolve().parent
STATIC = BASE / "static"
STATIC.mkdir(exist_ok=True)
LATEST_IMG = BASE / "latest.jpg"

app = FastAPI()

# ✅ CORS (React에서 다른 포트로 호출하니까 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 개발용. 배포 시 특정 origin으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")

# ===== GPIO (릴레이) =====
GPIO_PIN = 17
relay = None
GPIO_OK = False

try:
    from gpiozero import OutputDevice
    relay = OutputDevice(GPIO_PIN, active_high=False, initial_value=False)
    GPIO_OK = True
except Exception as e:
    GPIO_OK = False
    print("[GPIO INIT ERROR]", repr(e))

# ===== 카메라 캡처 동시 실행 방지 =====
_capture_lock = threading.Lock()
_last_capture_ts = 0.0
MIN_INTERVAL_SEC = 0.8  # 너무 빠른 연타 방지(원하면 0.3으로 줄여도 됨)

def capture_pi_camera() -> dict:
    import shutil
    import subprocess

    cmd = None
    if shutil.which("rpicam-still"):
        cmd = ["rpicam-still", "-n", "-t", "200", "-o", str(LATEST_IMG)]
    elif shutil.which("libcamera-still"):
        cmd = ["libcamera-still", "-n", "-t", "200", "-o", str(LATEST_IMG)]

    if cmd is None:
        return {"ok": False, "error": "rpicam-still 또는 libcamera-still 이 설치되어 있지 않습니다."}

    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.returncode != 0:
        return {"ok": False, "error": "camera command failed", "stderr": p.stderr.strip()}
    return {"ok": True, "saved": str(LATEST_IMG)}

@app.get("/", response_class=HTMLResponse)
def home():
    index = STATIC / "index.html"
    if not index.exists():
        return HTMLResponse("<h3>static/index.html not found</h3>", status_code=500)
    html = index.read_text(encoding="utf-8")
    return HTMLResponse(content=html, media_type="text/html; charset=utf-8")

@app.post("/api/camera/capture")
def api_camera_capture():
    global _last_capture_ts

    now = time()

    # ✅ 너무 빠르면 429
    if now - _last_capture_ts < MIN_INTERVAL_SEC:
        return JSONResponse({"ok": False, "error": "too many requests"}, status_code=429)

    # ✅ 촬영 중복 실행이면 409
    if not _capture_lock.acquire(blocking=False):
        return JSONResponse({"ok": False, "error": "camera is busy"}, status_code=409)

    try:
        _last_capture_ts = now
        res = capture_pi_camera()
        if not res.get("ok"):
            print("[CAPTURE ERROR]", res)
            return JSONResponse(res, status_code=500)

        ts = int(time())
        return {"ok": True, "image_url": f"/image?ts={ts}"}
    finally:
        _capture_lock.release()

@app.get("/image")
def get_image():
    if not LATEST_IMG.exists():
        return JSONResponse({"ok": False, "error": "no image yet"}, status_code=404)
    return FileResponse(str(LATEST_IMG), media_type="image/jpeg")

# ---- 잠금장치 API ----
@app.post("/api/locker/open/1")
def locker_open():
    if not GPIO_OK or relay is None:
        return JSONResponse({"ok": False, "error": "GPIO not available"}, status_code=500)
    relay.on()
    sleep(1.0)
    relay.off()
    return {"ok": True, "action": "pulse_open", "seconds": 1.0, "gpio": GPIO_PIN}

@app.post("/api/locker/on/1")
def locker_on():
    if not GPIO_OK or relay is None:
        return JSONResponse({"ok": False, "error": "GPIO not available"}, status_code=500)
    relay.on()
    return {"ok": True, "action": "on", "gpio": GPIO_PIN}

@app.post("/api/locker/off/1")
def locker_off():
    if not GPIO_OK or relay is None:
        return JSONResponse({"ok": False, "error": "GPIO not available"}, status_code=500)
    relay.off()
    return {"ok": True, "action": "off", "gpio": GPIO_PIN}