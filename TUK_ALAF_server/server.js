const path = require("path");
const express = require("express");
const cors = require("cors");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const app = express();

/* 기본 미들웨어 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 업로드 폴더 서빙 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ✅ API 라우터 통합 */
const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);

/* 헬스 체크 */
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});