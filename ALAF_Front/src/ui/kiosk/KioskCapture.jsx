import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ItemContext } from "../../context/ItemContext";
import { KIOSK_SERVER } from "../../config";
import { ArrowLeft, Camera, RefreshCw, Check } from "lucide-react";

const KioskCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useContext(ItemContext);

  const formData = location.state;

  useEffect(() => {
    if (!formData) {
      alert("잘못된 접근입니다.");
      navigate("/kiosk");
    }
  }, [formData, navigate]);

  const [previewUrl, setPreviewUrl] = useState(null); // 라즈베리파이 이미지 URL
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const capturePhoto = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const res = await axios.post(`${KIOSK_SERVER}/api/camera/capture`, {}, { timeout: 15000 });

      if (res.data?.ok && res.data?.image_url) {
        setPreviewUrl(`${KIOSK_SERVER}${res.data.image_url}`);
      } else {
        alert(`촬영 실패: ${JSON.stringify(res.data)}`);
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 429) alert("너무 빠르게 눌렀어요. 1초 후 다시 시도해주세요.");
      else alert(`촬영 실패: status=${status ?? "NO_RESPONSE"}`);
      console.error(e);
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => setPreviewUrl(null);

  // ✅ 라즈베리파이 이미지 URL → File로 변환
  const imageUrlToFile = async (url) => {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`image fetch failed: ${r.status}`);
    const blob = await r.blob();
    return new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
  };

  const handleImageRegister = async () => {
    if (!previewUrl) return alert("사진을 촬영해주세요!");
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1) 라즈베리파이에서 찍은 이미지 파일로 가져오기
      const imageFile = await imageUrlToFile(previewUrl);

      // 2) 메인서버(8080)로 업로드 포함 등록
      const success = await addItem(formData, imageFile);

      if (success) {
        navigate("/kiosk/locker", {
          state: { ...formData, imageUrl: previewUrl }, // 확인 화면은 라즈베리파이 URL로 보여도 됨
        });
      }
    } catch (e) {
      console.error(e);
      alert("등록 실패: 서버/네트워크 상태를 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "black" }}>
      <div style={{ padding: "10px 15px", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", height: 50, position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <ArrowLeft size={24} color="white" />
        </button>
        <h1 style={{ marginLeft: 10, fontSize: 18, color: "white", margin: "0 0 0 10px" }}>이미지 촬영 (2/2)</h1>
      </div>

      <div style={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
        {!previewUrl ? (
          <div style={{ color: "white", textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 18, marginBottom: 10 }}>촬영 버튼을 눌러 사진을 찍어주세요</div>
            <div style={{ opacity: 0.7, fontSize: 14 }}>
              카메라 서버: <b>{KIOSK_SERVER}</b>
            </div>
          </div>
        ) : (
          <img src={previewUrl} alt="Capture" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}

        <div style={{ position: "absolute", bottom: 20, display: "flex", justifyContent: "center", gap: 20, width: "100%" }}>
          <button
            onClick={previewUrl ? retakePhoto : capturePhoto}
            disabled={isCapturing || isSubmitting}
            style={{
              width: 70, height: 70, borderRadius: "50%",
              background: "white", border: "5px solid #ccc",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", opacity: isCapturing || isSubmitting ? 0.6 : 1
            }}
          >
            {previewUrl ? <RefreshCw size={30} color="#555" /> : <Camera size={40} color="#333" />}
          </button>

          {previewUrl && (
            <button
              onClick={handleImageRegister}
              disabled={isSubmitting}
              style={{
                height: 70, padding: "0 30px", borderRadius: 35,
                background: "#2ecc71", border: "none", color: "white",
                fontSize: 20, fontWeight: "bold",
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <Check size={30} /> {isSubmitting ? "등록 중..." : "이미지 등록"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskCapture;