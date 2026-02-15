import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';

const KioskRegister = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    categoryName: '전자기기',          // ✅ 문자열로 유지 (서버에서 category_id로 매핑/생성)
    title: '',
    foundDate: new Date().toISOString().split('T')[0], // ✅ 서버 스키마에 맞춰 found_date 의미
    locationText: '',                  // ✅ place_id 대신 텍스트로 보냄
    desc: '',
    userId: ''                         // (선택) 습득자 계정/포인트 적립용
  });

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleToCapture = () => {
    if (!inputs.title || !inputs.locationText) {
      alert("물건 이름과 장소는 필수입니다!");
      return;
    }
    navigate('/kiosk/capture', { state: inputs });
  };

  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 'bold', marginBottom: 4, color: '#333' };
  const inputStyle = {
    padding: '8px 10px', fontSize: 14, borderRadius: 8,
    border: '1px solid #ccc', width: '100%', marginBottom: 10, boxSizing:'border-box'
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', height: 50, boxSizing:'border-box' }}>
        <button onClick={() => navigate('/kiosk')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <ArrowLeft size={24} color="#333" />
        </button>
        <h1 style={{ marginLeft: 10, fontSize: 18, margin: '0 0 0 10px' }}>정보 입력 (1/2)</h1>
      </div>

      <div style={{ flex: 1, padding: 15, overflowY: 'auto', background: '#f8f9fa' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>카테고리</label>
            <select name="categoryName" value={inputs.categoryName} onChange={handleChange} style={inputStyle}>
              <option>전자기기</option>
              <option>지갑/카드</option>
              <option>가방</option>
              <option>의류</option>
              <option>기타</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>습득일</label>
            <input type="date" name="foundDate" value={inputs.foundDate} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <label style={labelStyle}>물건 이름</label>
        <input name="title" placeholder="예: 아이폰 15" value={inputs.title} onChange={handleChange} style={inputStyle} />

        <label style={labelStyle}>장소</label>
        <input name="locationText" placeholder="예: 304호 / 학생회관 1층" value={inputs.locationText} onChange={handleChange} style={inputStyle} />

        <label style={labelStyle}>특징</label>
        <textarea
          name="desc" placeholder="특징 입력" value={inputs.desc} onChange={handleChange}
          style={{ ...inputStyle, height: 60, resize: 'none' }}
        />

        <div style={{ background: '#e1f5fe', padding: 10, borderRadius: 8, marginBottom: 15 }}>
          <label style={{ ...labelStyle, color: '#0277bd', marginBottom: 2 }}>ID (포인트 적립)</label>
          <input name="userId" placeholder="선택사항" value={inputs.userId} onChange={handleChange} style={{ ...inputStyle, marginBottom: 0 }} />
        </div>

        <button
          onClick={handleToCapture}
          style={{
            width: '100%', padding: 15, background: '#2c3e50', color: 'white',
            fontSize: 18, fontWeight: 'bold', borderRadius: 10, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}
        >
          <Camera size={24} /> 이미지 촬영하러 가기
        </button>
      </div>
    </div>
  );
};

export default KioskRegister;