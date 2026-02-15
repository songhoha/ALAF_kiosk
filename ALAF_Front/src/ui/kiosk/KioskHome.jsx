import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const KIOSK_API = process.env.REACT_APP_KIOSK_API || "";   // 예: http://192.168.45.11:8000 (라즈베리파이)
const MAIN_API  = process.env.REACT_APP_API_BASE || "";   // 예: http://localhost:8080 (중앙 Node)

async function ping(url) {
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

const KioskHome = () => {
  const navigate = useNavigate();

  const [kioskOk, setKioskOk] = useState(true);
  const [mainOk, setMainOk] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkServers = async () => {
    setChecking(true);

    // ✅ 라즈베리파이 서버: /health 같은 엔드포인트가 있으면 그걸로
    // 없으면 /api/camera/capture 같은 걸 GET으로 치면 안 되니까, 가벼운 GET 엔드포인트를 하나 만들어 두는 게 좋음.
    const kioskHealthUrl = `${KIOSK_API}/health`; // 없으면 라즈베리파이 서버에 추가 추천
    const mainHealthUrl  = `${MAIN_API}/health`;  // 없으면 Node 서버에 추가 추천

    // health가 없을 수 있으니, 임시로 루트(/)라도 열리면 OK로 처리 가능
    const kioskAlive = KIOSK_API ? (await ping(kioskHealthUrl) || await ping(`${KIOSK_API}/`)) : true;
    const mainAlive  = MAIN_API  ? (await ping(mainHealthUrl)  || await ping(`${MAIN_API}/`))  : true;

    setKioskOk(kioskAlive);
    setMainOk(mainAlive);
    setChecking(false);
  };

  useEffect(() => {
    checkServers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buttonStyle = {
    flex: 1,
    margin: '10px',
    borderRadius: 20,
    border: 'none',
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    transition: 'transform 0.1s',
  };

  // 등록/회수는 둘 다 중앙서버 필요.
  // 등록은 추가로 키오스크(카메라/락커)도 필요.
  const canRegister = kioskOk && mainOk;
  const canPickup = mainOk; // 회수는 락커 열어야 하니까 실제론 kioskOk도 필요할 수 있음(너 플로우에 맞춰 조절)

  const StatusBadge = ({ ok, label }) => (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'8px 12px', borderRadius:999,
      background: ok ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
      color:'#2c3e50', fontSize:14, border:'1px solid rgba(0,0,0,0.06)'
    }}>
      {ok ? <Wifi size={18} /> : <WifiOff size={18} />}
      <b>{label}</b>
      <span style={{ color: ok ? '#27ae60' : '#c0392b' }}>
        {ok ? '연결됨' : '끊김'}
      </span>
    </div>
  );

  return (
    <div style={{ height: '100vh', padding: 15, display: 'flex', flexDirection: 'column', background: '#f8f9fa', boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: 10, flexShrink: 0 }}>
        <h1 style={{ fontSize: 28, color: '#2c3e50', margin: 0 }}>ALAF KIOSK</h1>

        {/* ✅ 서버 상태 표시 */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:10, flexWrap:'wrap' }}>
          <StatusBadge ok={kioskOk} label="키오스크 서버" />
          <StatusBadge ok={mainOk} label="중앙 서버" />
          <button
            onClick={checkServers}
            disabled={checking}
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'8px 12px', borderRadius:999,
              border:'1px solid #ddd', background:'#fff', cursor:'pointer',
              opacity: checking ? 0.7 : 1
            }}
          >
            <RefreshCw size={18} /> {checking ? '확인중…' : '재확인'}
          </button>
        </div>

        {/* 안내 문구 */}
        {(!kioskOk || !mainOk) && (
          <div style={{ marginTop: 10, color:'#c0392b', fontSize: 14 }}>
            서버 연결이 불안정합니다. (라즈베리파이/Node 서버 실행 상태와 IP/포트를 확인하세요)
          </div>
        )}
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <button
          onClick={() => navigate('/kiosk/register')}
          disabled={!canRegister}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)',
            opacity: canRegister ? 1 : 0.5,
            cursor: canRegister ? 'pointer' : 'not-allowed'
          }}
        >
          <Upload size={60} />
          <div>분실물 등록</div>
        </button>

        <button
          onClick={() => navigate('/kiosk/login')}
          disabled={!canPickup}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, #4834d4 0%, #686de0 100%)',
            opacity: canPickup ? 1 : 0.5,
            cursor: canPickup ? 'pointer' : 'not-allowed'
          }}
        >
          <Search size={60} />
          <div>분실물 회수</div>
        </button>
      </div>
    </div>
  );
};

export default KioskHome;