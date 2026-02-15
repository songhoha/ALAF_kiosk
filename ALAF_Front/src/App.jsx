import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import WebHome from "./ui/web/WebHome";
import WebDetail from "./ui/web/WebDetail";
import WebRegister from "./ui/web/WebRegister";
import WebMyPage from "./ui/web/WebMyPage";
import WebSignup from "./ui/web/WebSignup";

import KioskHome from "./ui/kiosk/KioskHome";
import KioskRegister from "./ui/kiosk/KioskRegister";
import KioskCapture from "./ui/kiosk/KioskCapture";
import KioskLocker from "./ui/kiosk/KioskLocker";
import KioskConfirm from "./ui/kiosk/KioskConfirm";
import KioskLogin from "./ui/kiosk/KioskLogin";
import KioskRecoveryList from "./ui/kiosk/KioskRecoveryList";
import KioskRetrievalLocker from "./ui/kiosk/KioskRetrievalLocker";

import { ItemProvider } from "./context/ItemContext";
import { UserProvider } from "./context/UserContext";

import "./App.css";

function App() {
  return (
    <UserProvider>
      <ItemProvider>
        <BrowserRouter>
          <Routes>
            {/* Web */}
            <Route path="/" element={<WebHome />} />
            <Route path="/detail/:id" element={<WebDetail />} />
            <Route path="/register" element={<WebRegister />} />
            <Route path="/mypage" element={<WebMyPage />} />
            <Route path="/signup" element={<WebSignup />} />

            {/* Kiosk */}
            <Route path="/kiosk" element={<KioskHome />} />
            <Route path="/kiosk/register" element={<KioskRegister />} />
            <Route path="/kiosk/capture" element={<KioskCapture />} />
            <Route path="/kiosk/locker" element={<KioskLocker />} />
            <Route path="/kiosk/confirm" element={<KioskConfirm />} />

            <Route path="/kiosk/login" element={<KioskLogin />} />
            {/* ✅ 여기 핵심: recovery-list 로 통일 */}
            <Route path="/kiosk/recovery-list" element={<KioskRecoveryList />} />
            <Route path="/kiosk/retrieval-locker" element={<KioskRetrievalLocker />} />
          </Routes>
        </BrowserRouter>
      </ItemProvider>
    </UserProvider>
  );
}

export default App;