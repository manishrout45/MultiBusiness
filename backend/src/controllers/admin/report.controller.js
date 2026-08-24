const db = require('../../config/db');

const salesReport = async (req, res, next) => {
  try {
    const { period = 'day' } = req.query;
    const groupBy =
      period === 'month'
        ? "DATE_FORMAT(created_at, '%Y-%m')"
        : 'DATE(created_at)';

    const [rows] = await db.query(
      `SELECT
         ${groupBy} AS period,
         COUNT(*) AS order_count,
         COALESCE(SUM(total_amount), 0) AS total_amount,
         COALESCE(SUM(commission_amount), 0) AS commission_amount
       FROM orders
       WHERE order_status NOT IN ('cancelled')
       GROUP BY ${groupBy}
       ORDER BY period ASC`
    );

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const revenueReport = async (req, res, next) => {
  try {
    const [[totals]] = await db.query(
      `SELECT
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(SUM(commission_amount), 0) AS total_commission,
         COUNT(*) AS order_count
       FROM orders
       WHERE payment_status = 'paid' OR order_status = 'delivered'`
    );

    const [byPeriod] = await db.query(
      `SELECT
         DATE_FORMAT(created_at, '%Y-%m') AS period,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(SUM(commission_amount), 0) AS total_commission,
         COUNT(*) AS order_count
       FROM orders
       WHERE payment_status = 'paid' OR order_status = 'delivered'
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY period ASC`
    );

    res.json({
      data: {
        totalRevenue: Number(totals.total_revenue) || 0,
        totalCommission: Number(totals.total_commission) || 0,
        orderCount: Number(totals.order_count) || 0,
        byPeriod,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  salesReport,
  revenueReport,
};
