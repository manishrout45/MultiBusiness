const db = require('../../config/db');

const getAnalytics = async (req, res, next) => {
  try {
    const [vendorPerformance] = await db.query(
      `SELECT b.id AS business_id,
              b.business_name,
              b.city,
              b.status,
              COUNT(o.id) AS orders,
              COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled') THEN o.total_amount ELSE 0 END), 0) AS revenue,
              COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled') THEN o.commission_amount ELSE 0 END), 0) AS commission,
              COALESCE(AVG(r.rating), 0) AS avg_rating
       FROM businesses b
       LEFT JOIN orders o ON o.business_id = b.id
       LEFT JOIN reviews r ON r.business_id = b.id AND r.status = 'approved'
       GROUP BY b.id, b.business_name, b.city, b.status
       ORDER BY revenue DESC`
    );

    const [[totals]] = await db.query(
      `SELECT
         COUNT(DISTINCT business_id) AS active_vendors,
         COUNT(*) AS total_orders,
         COALESCE(SUM(CASE WHEN order_status NOT IN ('cancelled') THEN total_amount ELSE 0 END), 0) AS total_revenue
       FROM orders`
    );

    res.json({
      data: {
        totals: {
          activeVendors: Number(totals.active_vendors) || 0,
          totalOrders: Number(totals.total_orders) || 0,
          totalRevenue: Number(totals.total_revenue) || 0,
        },
        vendorPerformance,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalytics,
};
