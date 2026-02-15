import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Unlock, Lock } from 'lucide-react';
import { hwLockerPulse, hwLockerOff } from './hwApi';

const KioskLocker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;

  const [count, setCount] = useState(30);
  const [err, setErr] = useState(null);

  // 들어오자마자 보관함 열기(펄스)
  useEffect(() => {
    const open = async () => {
      try {
        setErr(null);
        await hwLockerPulse(1);
      } catch (e) {
        setErr(`보관함 열기 실패: ${e.message}`);
      }
    };
    open();
  }, []);

  // 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCloseLocker();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseLocker = async () => {
    // 대부분 솔레노이드는 "열 때만 펄스"면 되고, 잠금은 off 상태 유지가 맞음
    try {
      await hwLockerOff(1);
    } catch (e) {
      // 잠금 off 실패해도 UX는 진행
    }
    alert("보관 완료 처리되었습니다.");
    navigate('/kiosk/confirm', { state: data });
  };

  if (!data) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center', background:'#2c3e50', color:'white', padding:20, boxSizing:'border-box' }}>
      <div style={{ marginBottom: 20, padding: 30, background:'rgba(255,255,255,0.1)', borderRadius:'50%' }}>
        <Unlock size={80} color="#2ecc71" />
      </div>

      <h1 style={{ fontSize: 34, margin: 0, fontWeight:'bold' }}>보관함이 열렸습니다!</h1>
      <p style={{ fontSize: 18, marginTop: 12, color:'#bdc3c7', textAlign:'center' }}>
        물건을 넣고 문을 닫아주세요.
      </p>

      {err && (
        <div style={{ marginTop: 14, background:'rgba(231,76,60,0.2)', padding:12, borderRadius:12, border:'1px solid rgba(231,76,60,0.35)' }}>
          {err}
        </div>
      )}

      <div style={{ margin:'30px 0', fontSize: 80, fontWeight:'bold', fontFamily:'monospace', color:'#f1c40f' }}>
        {count}
      </div>

      <p style={{ fontSize: 16, color:'#ecf0f1', marginBottom: 26 }}>
        초 후 자동으로 다음 단계로 넘어갑니다.
      </p>

      <button
        onClick={handleCloseLocker}
        style={{
          padding:'20px 50px', background:'#2ecc71', color:'white',
          fontSize:22, fontWeight:'bold', borderRadius:50, border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', gap:12,
          boxShadow:'0 5px 20px rgba(46,204,113,0.4)'
        }}
      >
        <Lock size={28} />
        보관 완료 (다음)
      </button>
    </div>
  );
};

export default KioskLocker;