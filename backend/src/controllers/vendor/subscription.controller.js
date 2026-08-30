const db = require('../../config/db');
const Business = require('../../models/Business');

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
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const formatDate = (d) => d.toISOString().slice(0, 10);

    await db.query(
      `UPDATE business_subscriptions SET status = 'cancelled'
       WHERE business_id = ? AND status = 'active'`,
      [business.id]
    );

    const [result] = await db.query(
      `INSERT INTO business_subscriptions (business_id, plan_id, start_date, end_date, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [business.id, planId, formatDate(startDate), formatDate(endDate)]
    );

    const [rows] = await db.query(
      `SELECT bs.*, sp.name AS plan_name, sp.monthly_fee, sp.yearly_fee
       FROM business_subscriptions bs
       JOIN subscription_plans sp ON sp.id = bs.plan_id
       WHERE bs.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Subscribed successfully', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubscription,
  subscribe,
};
