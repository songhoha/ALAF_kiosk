const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const { authenticateToken, isAdmin } = require("../middlewares/authMiddleware");

const itemController = require("../controllers/itemController");
const requestController = require("../controllers/requestController");
const kioskController = require("../controllers/kioskController");
const authController = require("../controllers/authController");

// --- [인증] ---
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// --- [분실물 등록 & 조회] ---
// ✅✅✅ 키오스크 등록은 로그인 없이도 가능해야 하므로 authenticateToken 제거
router.post("/items", upload.single("image"), itemController.registerItem);

router.get("/items", itemController.getItems);
router.get("/items/:id", itemController.getItemDetail);

// --- [회수 신청 & 승인] ---
// 회수 신청은 "회원"만 가능 => 토큰 필요
router.post(
  "/requests",
  authenticateToken,
  upload.single("proof_image"),
  requestController.createRequest
);

// 관리자 조회/처리 => 토큰 + 관리자 권한 필요
router.get(
  "/admin/requests",
  authenticateToken,
  isAdmin,
  requestController.getAdminRequests
);

router.post(
  "/admin/requests/:requestId/process",
  authenticateToken,
  isAdmin,
  requestController.processRequest
);

// --- [키오스크] 승인된 회수 목록(= 잠금장치 열 수 있는 목록) ---
// ✅ 이건 "승인된 내 목록"이라 로그인 필요 (토큰 유지)
router.get("/kiosk/approved", authenticateToken, kioskController.getApprovedItems);

module.exports = router;