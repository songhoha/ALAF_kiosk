import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Box, RefreshCw } from "lucide-react";

const MAIN_API = process.env.REACT_APP_MAIN_API || "http://192.168.45.133:8080";

const KioskRecoveryList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = location.state?.token || null;
  const user = location.state?.user || null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) navigate("/kiosk/login");
  }, [token, navigate]);

  const fetchApproved = async () => {
    if (!token) return;

    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`${MAIN_API}/api/kiosk/approved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `조회 실패 (${res.status})`);
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr(e.message || "오류");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSelect = (row) => {
    // ✅ 회수 락커 화면으로 넘길 최소 정보
    navigate("/kiosk/retrieval-locker", {
      state: {
        requestId: row.request_id,
        itemId: row.item_id,
        title: row.name,
        imageUrl: row.image_url ? `${MAIN_API}${row.image_url}` : null,
        lockerNumber: row.locker_number || 1,
        token,
      },
    });
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
      <div style={{ padding: "15px", background: "white", display: "flex", alignItems: "center", height: 60, boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
        <button onClick={() => navigate("/kiosk")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <ArrowLeft size={30} color="#333" />
        </button>

        <h1 style={{ marginLeft: 15, fontSize: 20, margin: "0 0 0 15px", flex: 1 }}>
          <span style={{ color: "#4834d4" }}>{user?.email || "사용자"}</span> 승인된 회수 목록
        </h1>

        <button
          onClick={fetchApproved}
          disabled={loading}
          style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          <RefreshCw size={18} />
          새로고침
        </button>
      </div>

      {err && (
        <div style={{ margin: 12, padding: 12, borderRadius: 12, background: "rgba(231,76,60,0.12)", color: "#2c3e50" }}>
          {err}
        </div>
      )}

      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {loading ? (
          <div style={{ color: "#666" }}>불러오는 중…</div>
        ) : items.length === 0 ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
            <Box size={50} style={{ marginBottom: 10 }} />
            <p>승인된 회수 물건이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {items.map((row) => {
              const img = row.image_url ? `${MAIN_API}${row.image_url}` : null;
              return (
                <div
                  key={`${row.item_id}-${row.request_id}`}
                  onClick={() => handleSelect(row)}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 15,
                    border: "1px solid #eee",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 15,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    transition: "transform 0.1s",
                  }}
                >
                  <div style={{ width: "100%", aspectRatio: "1/1", background: "#f1f2f6", borderRadius: 15, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {img ? <img src={img} alt={row.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#ccc" }}>No Image</span>}
                  </div>

                  <div style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", color: "#2c3e50", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {row.name}
                  </div>

                  <div style={{ fontSize: 13, color: "#777" }}>보관함 #{row.locker_number || 1}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskRecoveryList;