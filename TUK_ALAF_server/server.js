const path = require("path");
const express = require("express");
const cors = require("cors");

/* ==============================
   1. .env 강제 로드
============================== */
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

/* ==============================
   2. 필수 환경변수 체크
============================== */
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error("❌ .env 로드 실패");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_NAME:", process.env.DB_NAME);
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET이 설정되지 않았습니다.");
  process.exit(1);
}

console.log("✅ ENV OK:",
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_NAME
);

const app = express();

/* ==============================
   3. CORS 설정 (외부 네트워크 허용)
============================== */
app.use(cors({
  origin: "*",        // ngrok / 외부 테스트 위해 일단 전체 허용
  credentials: false
}));

/* ==============================
   4. 기본 미들웨어
============================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==============================
   5. 업로드 폴더 정적 서빙
============================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   6. API 라우터 통합
============================== */
const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

/* ==============================
   7. 헬스 체크
============================== */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ==============================
   8. 404 처리
============================== */
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

/* ==============================
   9. 글로벌 에러 핸들러
============================== */
app.use((err, req, res, next) => {
  console.error("🔥 서버 에러:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ==============================
   10. 서버 실행
============================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});