const db = require('../../config/db');
const Business = require('../../models/Business');

const listReviews = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT r.*, u.name AS customer_name, p.name AS product_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.business_id = ?
       ORDER BY r.created_at DESC`,
      [business.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listReviews,
};
