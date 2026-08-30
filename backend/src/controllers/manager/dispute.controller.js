const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');

const listDisputes = async (req, res, next) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT d.*,
             u.name AS raised_by_name,
             u.email AS raised_by_email,
             b.business_name,
             o.order_number
      FROM disputes d
      JOIN users u ON u.id = d.raised_by
      LEFT JOIN businesses b ON b.id = d.business_id
      LEFT JOIN orders o ON o.id = d.order_id
    `;
    const params = [];
    if (status) {
      sql += ' WHERE d.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY d.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const status = req.body.status;
    const resolution = req.body.resolution ?? null;
    const allowed = ['open', 'investigating', 'resolved', 'closed'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const [rows] = await db.query('SELECT * FROM disputes WHERE id = ?', [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    await db.query(
      'UPDATE disputes SET status = ?, resolution = ? WHERE id = ?',
      [status, resolution, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM disputes WHERE id = ?', [req.params.id]);

    await createNotification({
      userId: rows[0].raised_by,
      title: 'Dispute updated',
      message: resolution
        ? `Your dispute is now ${status}: ${resolution}`
        : `Your dispute is now ${status}.`,
      type: 'dispute',
      link: `/disputes/${rows[0].id}`,
    });

    res.json({ message: 'Dispute updated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listDisputes,
  resolveDispute,
};
