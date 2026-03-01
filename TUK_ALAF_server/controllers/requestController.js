const pool = require('../config/db');

/**
 * 4. 회수 신청 (사용자 -> 관리자 제출용) + 48시간 잠금
 *  - Item.status 를 프로젝트 표준 상태값으로 통일: '회수신청중'
 */
exports.createRequest = async (req, res) => {
  const { item_id, proof_description, proof_detail_address } = req.body;
  const requester_id = req.user.id;
  const proofImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 아이템 잠금/상태 확인 (동시성 방지)
    const [items] = await conn.query(
      `SELECT locked_until, status FROM Item WHERE item_id = ? FOR UPDATE`,
      [item_id]
    );

    if (items.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: '해당 물건이 존재하지 않습니다.' });
    }

    const item = items[0];
    const now = new Date();

    // 이미 잠겨있으면(48시간 이내) 거절
    if (item.locked_until && new Date(item.locked_until) > now) {
      await conn.rollback();
      return res.status(409).json({
        message: '이미 다른 사용자가 회수 신청 중인 물건입니다. (48시간 잠금)',
        locked_until: item.locked_until,
      });
    }

    // 이미 회수완료/승인 상태면 신청 불가(안전장치)
    if (item.status === '회수완료' || item.status === '회수승인') {
      await conn.rollback();
      return res.status(409).json({ message: '이미 처리된 물건입니다.' });
    }

    // 1) 신청서 저장
    await conn.query(
      `INSERT INTO RetrievalRequest
       (item_id, requester_id, proof_description, proof_detail_address, proof_image_url, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [item_id, requester_id, proof_description || null, proof_detail_address || null, proofImageUrl]
    );

    // 2) 아이템 잠금 + 상태 변경 (표준값: '회수신청중')
    await conn.query(
      `UPDATE Item
       SET locked_until = DATE_ADD(NOW(), INTERVAL 48 HOUR),
           status = '회수신청중'
       WHERE item_id = ?`,
      [item_id]
    );

    await conn.commit();
    return res.status(201).json({
      message: '회수 신청 완료. 관리자 승인을 기다리세요 (48시간 동안 선점됨).',
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: '서버 에러 발생' });
  } finally {
    conn.release();
  }
};

/**
 * 5. 관리자 - 신청 내역 조회 (PENDING만)
 */
exports.getAdminRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, m.name AS requester_name, m.email,
              i.name AS item_name, i.image_url AS original_image,
              i.locker_number
       FROM RetrievalRequest r
       JOIN Member m ON r.requester_id = m.member_id
       JOIN Item i ON r.item_id = i.item_id
       WHERE r.status = 'PENDING'
       ORDER BY r.requested_at ASC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * 6. 관리자 - 승인/거절 처리
 *  - APPROVE: RetrievalRequest=APPROVED, Item.status='회수승인'
 *  - REJECT : RetrievalRequest=REJECTED, Item.status='보관중', locked_until=NULL
 */
exports.processRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'APPROVE' | 'REJECT'

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [reqData] = await conn.query(
      `SELECT item_id FROM RetrievalRequest WHERE request_id = ?`,
      [requestId]
    );

    if (reqData.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: '신청 내역 없음' });
    }

    const itemId = reqData[0].item_id;

    if (action === 'APPROVE') {
      await conn.query(
        `UPDATE RetrievalRequest SET status = 'APPROVED' WHERE request_id = ?`,
        [requestId]
      );
      await conn.query(
        `UPDATE Item SET status = '회수승인' WHERE item_id = ?`,
        [itemId]
      );
    } else if (action === 'REJECT') {
      await conn.query(
        `UPDATE RetrievalRequest SET status = 'REJECTED' WHERE request_id = ?`,
        [requestId]
      );
      await conn.query(
        `UPDATE Item SET status = '보관중', locked_until = NULL WHERE item_id = ?`,
        [itemId]
      );
    } else {
      await conn.rollback();
      return res.status(400).json({ message: 'action은 APPROVE 또는 REJECT 여야 합니다.' });
    }

    await conn.commit();
    return res.json({ message: `신청이 ${action} 처리되었습니다.` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

/**
 * ✅ (추가) 키오스크/사용자 - 승인된 회수 목록 조회
 *  - 로그인 토큰 필요
 *  - 키오스크는 이것만 보여야 함
 */
exports.getMyApproved = async (req, res) => {
  const requester_id = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT r.request_id, r.status AS request_status, r.requested_at,
              i.item_id, i.name, i.image_url, i.locker_number, i.status AS item_status
       FROM RetrievalRequest r
       JOIN Item i ON r.item_id = i.item_id
       WHERE r.requester_id = ?
         AND r.status = 'APPROVED'
         AND i.status = '회수승인'
       ORDER BY r.requested_at DESC`,
      [requester_id]
    );

    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ (추가) 키오스크 - 회수 완료 처리
 *  - request_id 기준으로 COLLECTED 처리 + Item.status='회수완료'
 */
exports.collectApproved = async (req, res) => {
  const requester_id = req.user.id;
  const { requestId } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT request_id, item_id, status, requester_id
       FROM RetrievalRequest
       WHERE request_id = ? FOR UPDATE`,
      [requestId]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: '요청 없음' });
    }

    const rr = rows[0];

    // 본인 요청만 처리
    if (rr.requester_id !== requester_id) {
      await conn.rollback();
      return res.status(403).json({ message: '권한 없음' });
    }

    // 승인된 건만 회수 완료 가능
    if (rr.status !== 'APPROVED') {
      await conn.rollback();
      return res.status(409).json({ message: '승인된 요청만 회수 완료 처리할 수 있습니다.' });
    }

    await conn.query(
      `UPDATE RetrievalRequest SET status = 'COLLECTED' WHERE request_id = ?`,
      [requestId]
    );

    await conn.query(
      `UPDATE Item
       SET status = '회수완료', locked_until = NULL, is_retrieved = TRUE
       WHERE item_id = ?`,
      [rr.item_id]
    );

    await conn.commit();
    return res.json({ message: '회수 완료 처리됨' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};