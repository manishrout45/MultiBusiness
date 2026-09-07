const db = require('../../config/db');

const listCommissions = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT cs.*, c.name AS category_name, b.business_name
       FROM commission_settings cs
       LEFT JOIN categories c ON c.id = cs.category_id
       LEFT JOIN businesses b ON b.id = cs.business_id
       ORDER BY cs.id ASC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const updateCommission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rate } = req.body;
    const [rows] = await db.query(
      'SELECT * FROM commission_settings WHERE id = ?',
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Commission setting not found' });
    }
    await db.query('UPDATE commission_settings SET rate = ? WHERE id = ?', [
      rate,
      id,
    ]);
    const [updated] = await db.query(
      'SELECT * FROM commission_settings WHERE id = ?',
      [id]
    );
    res.json({ message: 'Commission updated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const earningsReport = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.id,
              b.business_name AS vendorName,
              COUNT(o.id) AS orderCount,
              COALESCE(SUM(o.total_amount), 0) AS grossSales,
              COALESCE(SUM(o.commission_amount), 0) AS commissionAmount,
              COALESCE(SUM(o.total_amount - o.commission_amount), 0) AS vendorPayout
       FROM businesses b
       LEFT JOIN orders o
         ON o.business_id = b.id
        AND o.order_status NOT IN ('cancelled')
        AND MONTH(o.created_at) = MONTH(CURRENT_DATE())
        AND YEAR(o.created_at) = YEAR(CURRENT_DATE())
       GROUP BY b.id, b.business_name
       HAVING orderCount > 0
       ORDER BY commissionAmount DESC`
    );
    res.json({
      data: rows.map((r) => ({
        id: String(r.id),
        vendorName: r.vendorName,
        orderCount: Number(r.orderCount) || 0,
        grossSales: Number(r.grossSales) || 0,
        commissionAmount: Number(r.commissionAmount) || 0,
        vendorPayout: Number(r.vendorPayout) || 0,
        period: 'This month',
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCommissions,
  updateCommission,
  earningsReport,
};
