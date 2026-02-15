import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Unlock, LogOut } from 'lucide-react';
import { hwLockerPulse, hwLockerOff } from './hwApi';

const KioskRetrievalLocker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state;

  const [count, setCount] = useState(30);
  const [err, setErr] = useState(null);

  // 들어오자마자 보관함 열기
  useEffect(() => {
    const open = async () => {
      try {
        setErr(null);
        // item.locker_number 같은 값이 있다면 그걸 쓰면 됨
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
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = async () => {
    try { await hwLockerOff(1); } catch (e) {}
    alert("회수가 완료되었습니다. 안녕히 가세요!");
    navigate('/kiosk');
  };

  if (!item) return null;

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#4834d4', color:'white', padding:20, boxSizing:'border-box' }}>
      <div style={{ marginBottom: 20, padding: 30, background:'rgba(255,255,255,0.1)', borderRadius:'50%' }}>
        <Unlock size={80} color="#a29bfe" />
      </div>

      <h1 style={{ fontSize: 32, margin: 0, fontWeight: 'bold' }}>보관함이 열렸습니다!</h1>

      <p style={{ fontSize: 20, marginTop: 15, color: '#d1d8e0', textAlign:'center' }}>
        물건(<b style={{color:'white'}}>{item.title}</b>)을 <b>꺼내고</b><br/>
        문을 닫아주세요.
      </p>

      {err && (
        <div style={{ marginTop: 14, background:'rgba(231,76,60,0.2)', padding:12, borderRadius:12, border:'1px solid rgba(231,76,60,0.35)' }}>
          {err}
        </div>
      )}

      <div style={{ margin:'30px 0', fontSize: 80, fontWeight: 'bold', fontFamily:'monospace', color:'#ffeb3b' }}>
        {count}
      </div>

      <p style={{ fontSize: 16, color: '#d1d8e0', marginBottom: 40 }}>
        초 후 자동으로 종료됩니다.
      </p>

      <button
        onClick={handleFinish}
        style={{
          padding:'20px 60px', background:'white', color:'#4834d4',
          fontSize:24, fontWeight:'bold', borderRadius:50, border:'none',
          cursor:'pointer', display:'flex', alignItems:'center', gap:15,
          boxShadow:'0 5px 20px rgba(0,0,0,0.2)'
        }}
      >
        <LogOut size={30} />
        회수 완료
      </button>
    </div>
  );
};

export default KioskRetrievalLocker;