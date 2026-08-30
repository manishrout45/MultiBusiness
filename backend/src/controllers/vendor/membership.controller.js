const db = require('../../config/db');
const Business = require('../../models/Business');

const listPlans = async (req, res, next) => {
  try {
    const [plans] = await db.query(
      'SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY monthly_fee ASC'
    );

    const business = await Business.findByOwner(req.user.id);
    let membershipOffers = [];
    if (business) {
      const [offers] = await db.query(
        `SELECT * FROM offers
         WHERE business_id = ? AND title LIKE 'Membership:%'
         ORDER BY created_at DESC`,
        [business.id]
      );
      membershipOffers = offers;
    }

    res.json({
      data: {
        subscriptionPlans: plans,
        membershipOffers,
      },
    });
  } catch (err) {
    next(err);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const title = req.body.title || req.body.name;
    const discountType = req.body.discount_type || req.body.discountType || 'percent';
    const discountValue = req.body.discount_value ?? req.body.discountValue ?? req.body.fee ?? 0;
    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const membershipTitle = title.startsWith('Membership:') ? title : `Membership: ${title}`;

    const [result] = await db.query(
      `INSERT INTO offers
       (business_id, title, description, discount_type, discount_value, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business.id,
        membershipTitle,
        req.body.description || null,
        discountType,
        discountValue,
        req.body.start_date || req.body.startDate || null,
        req.body.end_date || req.body.endDate || null,
        1,
      ]
    );

    const [rows] = await db.query('SELECT * FROM offers WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Membership plan created as offer', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPlans,
  createPlan,
};
