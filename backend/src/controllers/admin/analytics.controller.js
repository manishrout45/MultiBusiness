const db = require('../../config/db');

function dayLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

const getAnalytics = async (req, res, next) => {
  try {
    const [userGrowthRows] = await db.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS value
       FROM users
       WHERE role = 'customer'
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );
    const [vendorGrowthRows] = await db.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS value
       FROM businesses
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );
    const [orderSeriesRows] = await db.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS value
       FROM orders
       WHERE order_status NOT IN ('cancelled')
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );
    const [revenueSeriesRows] = await db.query(
      `SELECT DATE(created_at) AS day,
              COALESCE(SUM(total_amount), 0) AS value
       FROM orders
       WHERE order_status NOT IN ('cancelled')
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );
    const [commissionSeriesRows] = await db.query(
      `SELECT DATE(created_at) AS day,
              COALESCE(SUM(commission_amount), 0) AS value
       FROM orders
       WHERE order_status NOT IN ('cancelled')
       GROUP BY DATE(created_at)
       ORDER BY day DESC
       LIMIT 30`
    );

    const [topCategories] = await db.query(
      `SELECT c.name, COUNT(b.id) AS businessCount
       FROM categories c
       LEFT JOIN businesses b ON b.category_id = c.id AND b.status = 'approved'
       GROUP BY c.id, c.name
       ORDER BY businessCount DESC
       LIMIT 10`
    );
    const [topVendors] = await db.query(
      `SELECT b.id, b.business_name AS name,
              COUNT(o.id) AS orderCount,
              COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled') THEN o.total_amount ELSE 0 END), 0) AS revenue
       FROM businesses b
       LEFT JOIN orders o ON o.business_id = b.id
       GROUP BY b.id, b.business_name
       ORDER BY revenue DESC
       LIMIT 10`
    );
    const [topProducts] = await db.query(
      `SELECT p.id, p.name, b.business_name AS businessName,
              COALESCE(SUM(oi.quantity), 0) AS unitsSold,
              COALESCE(SUM(oi.total_price), 0) AS revenue
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       LEFT JOIN order_items oi ON oi.product_id = p.id
       GROUP BY p.id, p.name, b.business_name
       ORDER BY unitsSold DESC
       LIMIT 10`
    );

    const [[totals]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
         (SELECT COUNT(*) FROM businesses WHERE status = 'approved') AS vendors,
         (SELECT COUNT(*) FROM orders WHERE order_status NOT IN ('cancelled')) AS orders,
         (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status NOT IN ('cancelled')) AS revenue,
         (SELECT COALESCE(SUM(commission_amount), 0) FROM orders WHERE order_status NOT IN ('cancelled')) AS commissions,
         (SELECT COUNT(*) FROM products) AS products,
         (SELECT COUNT(*) FROM reviews WHERE status = 'approved') AS reviews`
    );

    const mapSeries = (rows) =>
      [...rows]
        .reverse()
        .map((r) => ({ label: dayLabel(r.day), value: Number(r.value) || 0 }));

    res.json({
      data: {
        userGrowth: mapSeries(userGrowthRows),
        vendorGrowth: mapSeries(vendorGrowthRows),
        orderSeries: mapSeries(orderSeriesRows),
        revenueSeries: mapSeries(revenueSeriesRows),
        commissionSeries: mapSeries(commissionSeriesRows),
        topCategories: topCategories.map((c) => ({
          name: c.name,
          businessCount: Number(c.businessCount) || 0,
        })),
        topVendors: topVendors.map((v) => ({
          id: String(v.id),
          name: v.name,
          orderCount: Number(v.orderCount) || 0,
          revenue: Number(v.revenue) || 0,
        })),
        topProducts: topProducts.map((p) => ({
          id: String(p.id),
          name: p.name,
          businessName: p.businessName,
          unitsSold: Number(p.unitsSold) || 0,
          revenue: Number(p.revenue) || 0,
        })),
        totals: {
          customers: Number(totals.customers) || 0,
          vendors: Number(totals.vendors) || 0,
          orders: Number(totals.orders) || 0,
          revenue: Number(totals.revenue) || 0,
          commissions: Number(totals.commissions) || 0,
          products: Number(totals.products) || 0,
          reviews: Number(totals.reviews) || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPlatformStats = async (req, res, next) => {
  try {
    const [[stats]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM businesses WHERE status = 'approved') AS vendors,
         (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
         (SELECT COUNT(*) FROM orders WHERE order_status = 'delivered') AS ordersDelivered,
         (SELECT COUNT(*) FROM products WHERE status = 'published') AS products,
         (SELECT COUNT(*) FROM reviews WHERE status = 'approved') AS reviews,
         (SELECT COUNT(DISTINCT city) FROM businesses WHERE status = 'approved' AND city IS NOT NULL) AS cities`
    );
    res.json({
      data: {
        vendors: Number(stats.vendors) || 0,
        customers: Number(stats.customers) || 0,
        ordersDelivered: Number(stats.ordersDelivered) || 0,
        products: Number(stats.products) || 0,
        reviews: Number(stats.reviews) || 0,
        cities: Number(stats.cities) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, getPlatformStats };
