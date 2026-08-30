const db = require('../../config/db');

const monitorOrders = async (req, res, next) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT o.*,
             u.name AS customer_name,
             u.email AS customer_email,
             b.business_name,
             b.city AS business_city
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      JOIN businesses b ON b.id = o.business_id
    `;
    const params = [];
    if (status) {
      sql += ' WHERE o.order_status = ?';
      params.push(status);
    }
    sql += ' ORDER BY o.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  monitorOrders,
};
