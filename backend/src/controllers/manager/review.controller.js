const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');

const listReviews = async (req, res, next) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT r.*,
             u.name AS user_name,
             u.email AS user_email,
             b.business_name,
             p.name AS product_name
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      JOIN businesses b ON b.id = r.business_id
      LEFT JOIN products p ON p.id = r.product_id
    `;
    const params = [];
    if (status) {
      sql += ' WHERE r.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY r.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const moderateReview = async (req, res, next) => {
  try {
    const status = req.body.status;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'status must be approved or rejected',
      });
    }

    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);

    await createNotification({
      userId: rows[0].user_id,
      title: 'Review moderated',
      message: `Your review has been ${status}.`,
      type: 'review',
      link: `/reviews/${rows[0].id}`,
    });

    res.json({ message: 'Review moderated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listReviews,
  moderateReview,
};
