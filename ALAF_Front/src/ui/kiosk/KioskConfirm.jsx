import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const KioskConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state ?? null;

  if (!data) return <div style={{padding:20}}>정보가 없습니다.</div>;

  const safe = {
    title: data.title ?? '',
    category: data.category ?? '',
    date: data.date ?? '',
    location: data.location ?? '',
    desc: data.desc ?? '',
    imageUrl: data.imageUrl ?? ''
  };

  return (
    <div style={{ height: '100vh', padding: 20, background: 'white', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, color:'#2ecc71', marginBottom:10 }}>
          <CheckCircle size={40} />
          <h1 style={{ fontSize: 28, margin: 0 }}>등록이 완료되었습니다</h1>
        </div>
        <p style={{ fontSize: 16, color: '#7f8c8d', margin:0 }}>
          보관함에 물건을 넣고 문을 닫아주세요.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 20, background: '#f8f9fa', borderRadius: 15, padding: 15, border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ flex: '0 0 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', background:'black', borderRadius:10, overflow:'hidden' }}>
          {safe.imageUrl ? (
            <img src={safe.imageUrl} alt="등록물건" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{color:'white'}}>이미지 없음</span>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
          <div>
            <span style={{ fontSize: 12, background: '#e9ecef', padding: '4px 8px', borderRadius: 5, color: '#495057' }}>
              {safe.category}
            </span>
            <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 5, color:'#2c3e50' }}>{safe.title}</div>
          </div>

          <div style={{ fontSize: 16, color:'#555' }}>
            <div><b>습득일:</b> {safe.date}</div>
            <div><b>장소:</b> {safe.location}</div>
          </div>

          <div style={{ fontSize: 14, color:'#777', background:'white', padding:10, borderRadius:8, flex:1, overflowY:'auto' }}>
            {safe.desc}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/kiosk')}
        style={{
          marginTop: 20, padding: 15, background: '#2c3e50', color: 'white',
          fontSize: 20, fontWeight: 'bold', borderRadius: 15, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
        }}
      >
        <Home size={24} /> 처음으로 돌아가기
      </button>
    </div>
  );
};

export default KioskConfirm;