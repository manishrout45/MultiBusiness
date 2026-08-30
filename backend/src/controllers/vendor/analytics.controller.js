const db = require('../../config/db');
const Business = require('../../models/Business');
const { calculateCommission } = require('../../services/commission.service');

const getAnalytics = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [salesByDay] = await db.query(
      `SELECT DATE(created_at) AS day,
              COUNT(*) AS orders,
              COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(commission_amount), 0) AS commission
       FROM orders
       WHERE business_id = ?
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         AND order_status NOT IN ('cancelled')
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      [business.id]
    );

    const [topProducts] = await db.query(
      `SELECT p.id, p.name, SUM(oi.quantity) AS units_sold, SUM(oi.total_price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE o.business_id = ?
         AND o.order_status NOT IN ('cancelled')
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 10`,
      [business.id]
    );

    const [[visitorRow]] = await db.query(
      `SELECT COUNT(*) AS visitor_count
       FROM product_visitors pv
       JOIN products p ON p.id = pv.product_id
       WHERE p.business_id = ?`,
      [business.id]
    );

    const totalRevenue = salesByDay.reduce((sum, row) => sum + Number(row.revenue || 0), 0);

    res.json({
      data: {
        salesByDay,
        topProducts,
        visitorCount: Number(visitorRow.visitor_count) || 0,
        commissionBreakdown: calculateCommission(totalRevenue),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalytics,
};
