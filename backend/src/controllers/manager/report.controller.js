const db = require('../../config/db');

const generateReports = async (req, res, next) => {
  try {
    const [salesByCity] = await db.query(
      `SELECT b.city,
              COUNT(o.id) AS orders,
              COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled') THEN o.total_amount ELSE 0 END), 0) AS revenue,
              COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled') THEN o.commission_amount ELSE 0 END), 0) AS commission
       FROM orders o
       JOIN businesses b ON b.id = o.business_id
       GROUP BY b.city
       ORDER BY revenue DESC`
    );

    const [salesByCategory] = await db.query(
      `SELECT c.id AS category_id,
              c.name AS category_name,
              COUNT(DISTINCT o.id) AS orders,
              COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled') THEN oi.total_price ELSE 0 END), 0) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       GROUP BY c.id, c.name
       ORDER BY revenue DESC`
    );

    const [[summary]] = await db.query(
      `SELECT
         COUNT(*) AS total_orders,
         COALESCE(SUM(CASE WHEN order_status NOT IN ('cancelled') THEN total_amount ELSE 0 END), 0) AS gross_revenue,
         COALESCE(SUM(CASE WHEN order_status NOT IN ('cancelled') THEN commission_amount ELSE 0 END), 0) AS total_commission
       FROM orders`
    );

    res.json({
      data: {
        summary: {
          totalOrders: Number(summary.total_orders) || 0,
          grossRevenue: Number(summary.gross_revenue) || 0,
          totalCommission: Number(summary.total_commission) || 0,
        },
        salesByCity,
        salesByCategory,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateReports,
};
