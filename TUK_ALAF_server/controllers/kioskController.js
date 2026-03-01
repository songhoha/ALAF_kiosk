const pool = require("../config/db");

// ✅ 키오스크: "승인된 회수요청" + "아이템 상태가 회수승인"인 것만 반환
exports.getApprovedItems = async (req, res) => {
  try {
    const requesterId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        r.request_id,
        r.status AS request_status,
        i.item_id,
        i.name,
        i.image_url,
        i.locker_number,
        i.status AS item_status
      FROM RetrievalRequest r
      JOIN Item i ON r.item_id = i.item_id
      WHERE r.requester_id = ?
        AND r.status = 'APPROVED'
        AND i.status = '회수승인'
      ORDER BY r.requested_at DESC
      `,
      [requesterId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "키오스크 승인목록 조회 실패" });
  }
};