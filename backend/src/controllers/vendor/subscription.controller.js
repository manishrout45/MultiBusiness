const db = require('../../config/db');
const Business = require('../../models/Business');
const {
  createPaymentOrder,
  isPaymentConfigured,
  verifyPayment,
} = require('../../services/payment.service');

const ensurePendingStatus = async () => {
  try {
    await db.query(
      `ALTER TABLE business_subscriptions
       MODIFY status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'active'`
    );
  } catch (_) {
    /* already migrated */
  }
};

const getSubscription = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT bs.*, sp.name AS plan_name, sp.slug, sp.monthly_fee, sp.yearly_fee, sp.features, sp.max_products
       FROM business_subscriptions bs
       JOIN subscription_plans sp ON sp.id = bs.plan_id
       WHERE bs.business_id = ?
       ORDER BY bs.created_at DESC
       LIMIT 1`,
      [business.id]
    );

    res.json({ data: rows[0] || null });
  } catch (err) {
    next(err);
  }
};

const subscribe = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const planId = req.body.plan_id || req.body.planId;
    if (!planId) {
      return res.status(400).json({ message: 'plan_id is required' });
    }

    const [plans] = await db.query(
      'SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1',
      [planId]
    );
    if (!plans[0]) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    const billing = (req.body.billing || 'monthly').toLowerCase();
    const months = billing === 'yearly' ? 12 : 1;
    const fee =
      billing === 'yearly'
        ? Number(plans[0].yearly_fee || 0)
        : Number(plans[0].monthly_fee || 0);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    const formatDate = (d) => d.toISOString().slice(0, 10);

    const isFree = fee <= 0;
    if (!isFree && !isPaymentConfigured()) {
      return res.status(501).json({
        message:
          'Paid subscriptions require payment gateway. Set PAYMENT_GATEWAY_KEY and PAYMENT_GATEWAY_SECRET, or choose a free plan.',
      });
    }

    await ensurePendingStatus();

    await db.query(
      `UPDATE business_subscriptions SET status = 'cancelled'
       WHERE business_id = ? AND status IN ('active', 'pending')`,
      [business.id]
    );

    const status = isFree ? 'active' : 'pending';
    const [result] = await db.query(
      `INSERT INTO business_subscriptions (business_id, plan_id, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [business.id, planId, formatDate(startDate), formatDate(endDate), status]
    );

    let gateway = null;
    if (!isFree) {
      gateway = await createPaymentOrder({
        amount: fee,
        orderId: `sub_${result.insertId}`,
        customer: { id: req.user.id },
      });
    }

    const [rows] = await db.query(
      `SELECT bs.*, sp.name AS plan_name, sp.monthly_fee, sp.yearly_fee
       FROM business_subscriptions bs
       JOIN subscription_plans sp ON sp.id = bs.plan_id
       WHERE bs.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: isFree
        ? 'Subscribed successfully'
        : 'Subscription pending payment. Complete gateway checkout, then call /vendor/subscription/confirm.',
      data: rows[0],
      payment: gateway,
    });
  } catch (err) {
    next(err);
  }
};

const confirmSubscription = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const subscriptionId = Number(
      req.body.subscriptionId || req.body.subscription_id || req.body.id
    );
    const { paymentId, signature, gatewayOrderId } = req.body;
    if (!subscriptionId || !paymentId || !signature || !gatewayOrderId) {
      return res.status(400).json({
        message: 'subscriptionId, paymentId, signature, and gatewayOrderId are required',
      });
    }

    await ensurePendingStatus();

    const [rows] = await db.query(
      `SELECT bs.*, sp.name AS plan_name, sp.monthly_fee, sp.yearly_fee
       FROM business_subscriptions bs
       JOIN subscription_plans sp ON sp.id = bs.plan_id
       WHERE bs.id = ? AND bs.business_id = ?`,
      [subscriptionId, business.id]
    );
    const sub = rows[0];
    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    if (sub.status === 'active') {
      return res.json({ message: 'Subscription already active', data: sub });
    }
    if (sub.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot confirm subscription with status "${sub.status}"`,
      });
    }

    const result = await verifyPayment({
      paymentId,
      orderId: gatewayOrderId,
      signature,
    });
    if (!result.verified) {
      return res.status(400).json({ message: result.message || 'Payment verification failed' });
    }

    await db.query(
      `UPDATE business_subscriptions SET status = 'active' WHERE id = ?`,
      [subscriptionId]
    );
    await db.query(
      `UPDATE business_subscriptions SET status = 'cancelled'
       WHERE business_id = ? AND id <> ? AND status = 'active'`,
      [business.id, subscriptionId]
    );

    const [updated] = await db.query(
      `SELECT bs.*, sp.name AS plan_name, sp.monthly_fee, sp.yearly_fee, sp.slug, sp.features
       FROM business_subscriptions bs
       JOIN subscription_plans sp ON sp.id = bs.plan_id
       WHERE bs.id = ?`,
      [subscriptionId]
    );

    res.json({ message: 'Subscription activated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubscription,
  subscribe,
  confirmSubscription,
};
