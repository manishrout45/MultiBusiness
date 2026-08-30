const db = require('../../config/db');
const Business = require('../../models/Business');

const listOffers = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      'SELECT * FROM offers WHERE business_id = ? ORDER BY created_at DESC',
      [business.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const title = req.body.title;
    const discountType = req.body.discount_type || req.body.discountType;
    const discountValue = req.body.discount_value ?? req.body.discountValue;
    if (!title || !discountType || discountValue == null) {
      return res.status(400).json({ message: 'title, discount_type, and discount_value are required' });
    }

    const [result] = await db.query(
      `INSERT INTO offers
       (business_id, title, description, discount_type, discount_value, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        business.id,
        title,
        req.body.description || null,
        discountType,
        discountValue,
        req.body.start_date || req.body.startDate || null,
        req.body.end_date || req.body.endDate || null,
        req.body.is_active ?? req.body.isActive ?? 1,
      ]
    );

    const [rows] = await db.query('SELECT * FROM offers WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Offer created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listOffers,
  createOffer,
};
