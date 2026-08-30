const db = require('../../config/db');

const publicOffers = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, b.business_name FROM offers o
       JOIN businesses b ON b.id = o.business_id
       WHERE o.is_active = 1 AND b.status = 'approved'
         AND (o.start_date IS NULL OR o.start_date <= CURDATE())
         AND (o.end_date IS NULL OR o.end_date >= CURDATE())
       ORDER BY o.created_at DESC LIMIT 50`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { publicOffers };
