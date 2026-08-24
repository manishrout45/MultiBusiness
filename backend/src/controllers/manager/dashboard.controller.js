const db = require('../../config/db');

const getDashboard = async (req, res, next) => {
  try {
    const [[usersRow]] = await db.query('SELECT COUNT(*) AS count FROM users');
    const [businessesByStatus] = await db.query(
      `SELECT status, COUNT(*) AS count
       FROM businesses
       GROUP BY status`
    );
    const [[productsRow]] = await db.query('SELECT COUNT(*) AS count FROM products');
    const [[ordersRow]] = await db.query('SELECT COUNT(*) AS count FROM orders');
    const [[revenueRow]] = await db.query(
      `SELECT
         COALESCE(SUM(total_amount), 0) AS revenue,
         COALESCE(SUM(commission_amount), 0) AS commissions
       FROM orders
       WHERE payment_status = 'paid' OR order_status = 'delivered'`
    );

    const businesses = {
      pending: 0,
      recommended: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
    };
    for (const row of businessesByStatus) {
      businesses[row.status] = Number(row.count) || 0;
    }

    res.json({
      data: {
        users: Number(usersRow.count) || 0,
        businesses,
        products: Number(productsRow.count) || 0,
        orders: Number(ordersRow.count) || 0,
        revenue: Number(revenueRow.revenue) || 0,
        commissions: Number(revenueRow.commissions) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
};
