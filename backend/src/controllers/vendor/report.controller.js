const db = require('../../config/db');
const Business = require('../../models/Business');
const { calculateCommission } = require('../../services/commission.service');

const salesReports = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [[summary]] = await db.query(
      `SELECT
         COUNT(*) AS total_orders,
         COALESCE(SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END), 0) AS delivered_orders,
         COALESCE(SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled_orders,
         COALESCE(SUM(CASE WHEN order_status NOT IN ('cancelled') THEN total_amount ELSE 0 END), 0) AS gross_revenue,
         COALESCE(SUM(CASE WHEN order_status NOT IN ('cancelled') THEN commission_amount ELSE 0 END), 0) AS total_commission,
         COALESCE(SUM(CASE WHEN payment_status = 'paid' AND order_status NOT IN ('cancelled') THEN total_amount ELSE 0 END), 0) AS paid_revenue
       FROM orders
       WHERE business_id = ?`,
      [business.id]
    );

    const grossRevenue = Number(summary.gross_revenue) || 0;
    const totalCommission = Number(summary.total_commission) || 0;
    const commissionBreakdown = calculateCommission(grossRevenue);

    res.json({
      data: {
        totalOrders: Number(summary.total_orders) || 0,
        deliveredOrders: Number(summary.delivered_orders) || 0,
        cancelledOrders: Number(summary.cancelled_orders) || 0,
        grossRevenue,
        paidRevenue: Number(summary.paid_revenue) || 0,
        totalCommission,
        vendorAmount: Math.round((grossRevenue - totalCommission) * 100) / 100,
        commissionBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  salesReports,
};
