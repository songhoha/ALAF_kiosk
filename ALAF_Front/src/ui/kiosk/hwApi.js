// src/ui/kiosk/hwApi.js

const HW_BASE = (process.env.REACT_APP_HW_BASE || "http://192.168.45.11:8000").replace(/\/$/, "");

// 공통 fetch(JSON)
async function postJSON(path) {
  const res = await fetch(`${HW_BASE}${path}`, { method: "POST" });
  const text = await res.text();

  // FastAPI는 json, 에러시에도 json일 수 있는데 가끔 text일 수 있음
  let data = null;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error || data?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// 카메라 캡처: { ok:true, image_url:"/image?ts=..." }
export async function hwCapture() {
  return await postJSON("/api/camera/capture");
}

// 이미지 URL 만들기
export function hwImageUrl(image_url) {
  // image_url이 "/image?ts=..." 형태라고 가정
  if (!image_url) return "";
  if (image_url.startsWith("http")) return image_url;
  return `${HW_BASE}${image_url}`;
}

// 잠금장치
export async function hwLockerPulse(lockerNo = 1) {
  return await postJSON(`/api/locker/open/${lockerNo}`);
}
export async function hwLockerOn(lockerNo = 1) {
  return await postJSON(`/api/locker/on/${lockerNo}`);
}
export async function hwLockerOff(lockerNo = 1) {
  return await postJSON(`/api/locker/off/${lockerNo}`);
}