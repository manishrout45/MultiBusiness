const db = require('../../config/db');
const Business = require('../../models/Business');
const { calculateCommission } = require('../../services/commission.service');

const getDashboard = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [[productCount]] = await db.query(
      'SELECT COUNT(*) AS count FROM products WHERE business_id = ?',
      [business.id]
    );
    const [[orderCount]] = await db.query(
      'SELECT COUNT(*) AS count FROM orders WHERE business_id = ?',
      [business.id]
    );
    const [[pendingCount]] = await db.query(
      `SELECT COUNT(*) AS count FROM orders
       WHERE business_id = ? AND order_status IN ('placed', 'accepted', 'packed', 'shipped')`,
      [business.id]
    );
    const [[revenueRow]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue,
              COALESCE(SUM(commission_amount), 0) AS commission
       FROM orders
       WHERE business_id = ? AND order_status NOT IN ('cancelled') AND payment_status = 'paid'`,
      [business.id]
    );

    const revenue = Number(revenueRow.revenue) || 0;
    const commission = Number(revenueRow.commission) || 0;
    const commissionBreakdown = calculateCommission(revenue);

    res.json({
      data: {
        products: Number(productCount.count) || 0,
        orders: Number(orderCount.count) || 0,
        pendingOrders: Number(pendingCount.count) || 0,
        revenue,
        commission,
        vendorAmount: Math.round((revenue - commission) * 100) / 100,
        commissionBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
};
