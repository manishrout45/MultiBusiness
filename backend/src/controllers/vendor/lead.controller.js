const db = require('../../config/db');
const Business = require('../../models/Business');

const listLeads = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT pv.*, p.name AS product_name, p.business_id, u.name AS visitor_name, u.email AS visitor_email
       FROM product_visitors pv
       JOIN products p ON p.id = pv.product_id
       LEFT JOIN users u ON u.id = pv.visitor_id
       WHERE p.business_id = ?
       ORDER BY pv.visited_at DESC`,
      [business.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listLeads,
};
