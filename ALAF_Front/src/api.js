// src/api.js
import axios from "axios";
import { HW_API, MAIN_API } from "./config";

export const mainApi = axios.create({
  baseURL: MAIN_API,
  withCredentials: false,
  timeout: 20000,
});

export async function hwCapture() {
  const r = await fetch(`${HW_API}/api/camera/capture`, { method: "POST" });
  if (!r.ok) throw new Error("촬영 실패");
  return await r.json(); // { ok:true, image_url:"/image?ts=..." }
}

export async function hwGetLatestImageBlob() {
  const r = await fetch(`${HW_API}/image`, { cache: "no-store" });
  if (!r.ok) throw new Error("이미지 다운로드 실패");
  return await r.blob();
}

export async function hwLockerOpen(lockerNo = 1) {
  const r = await fetch(`${HW_API}/api/locker/open/${lockerNo}`, { method: "POST" });
  if (!r.ok) throw new Error("보관함 열기 실패");
  return await r.json();
}

export async function hwLockerOn(lockerNo = 1) {
  const r = await fetch(`${HW_API}/api/locker/on/${lockerNo}`, { method: "POST" });
  if (!r.ok) throw new Error("보관함 ON 실패");
  return await r.json();
}

export async function hwLockerOff(lockerNo = 1) {
  const r = await fetch(`${HW_API}/api/locker/off/${lockerNo}`, { method: "POST" });
  if (!r.ok) throw new Error("보관함 OFF 실패");
  return await r.json();
}