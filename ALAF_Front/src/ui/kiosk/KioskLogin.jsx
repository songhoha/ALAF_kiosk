import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, Loader2 } from "lucide-react";

const MAIN_API = process.env.REACT_APP_MAIN_API || "http://192.168.45.133:8080";

const KioskLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");       // ✅ email
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMsg("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const res = await fetch(`${MAIN_API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // ✅ 서버 스펙에 맞춤
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "로그인 실패");
      }

      // ✅ 토큰 + 사용자정보 넘기고 승인목록으로 이동
      navigate("/kiosk/recovery-list", {
        state: { token: data.token, user: data.user },
      });
    } catch (err) {
      console.error(err);
      setMsg(`로그인 실패: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
      <div style={{ padding: "10px 15px", background: "white", display: "flex", alignItems: "center", height: 50, borderBottom: "1px solid #eee" }}>
        <button onClick={() => navigate("/kiosk")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ marginLeft: 10, fontSize: 18 }}>회수 로그인</h1>
      </div>

      <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <input
          placeholder="이메일 (예: admin@test.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 14, fontSize: 18, borderRadius: 12, border: "1px solid #ccc", marginBottom: 12 }}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 14, fontSize: 18, borderRadius: 12, border: "1px solid #ccc", marginBottom: 16 }}
        />

        {msg && <div style={{ marginBottom: 10, color: "red", fontSize: 14, textAlign: "center" }}>{msg}</div>}

        <button
          onClick={handleLogin}
          disabled={busy}
          style={{
            padding: 16,
            fontSize: 20,
            fontWeight: "bold",
            borderRadius: 14,
            border: "none",
            background: "#4834d4",
            color: "white",
            cursor: busy ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {busy ? <Loader2 className="spin" size={24} /> : <LogIn size={24} />}
          로그인
        </button>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
      `}</style>
    </div>
  );
};

export default KioskLogin;