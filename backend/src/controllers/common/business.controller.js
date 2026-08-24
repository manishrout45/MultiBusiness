const Business = require('../../models/Business');
const Product = require('../../models/Product');
const db = require('../../config/db');
const { directionsUrl, embedUrl } = require('../../utils/maps');

const searchBusinesses = async (req, res, next) => {
  try {
    const { q, categoryId, city, limit, offset } = req.query;
    const rows = await Business.search({
      query: q,
      categoryId,
      city,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
    });
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business || business.status !== 'approved') {
      return res.status(404).json({ message: 'Business not found' });
    }

    const [reviews] = await db.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS review_count
       FROM reviews WHERE business_id = ? AND status = 'approved'`,
      [business.id]
    );
    const [gallery] = await db.query(
      'SELECT * FROM business_gallery WHERE business_id = ? ORDER BY created_at DESC',
      [business.id]
    );

    res.json({
      data: {
        ...business,
        avg_rating: reviews[0]?.avg_rating || 0,
        review_count: reviews[0]?.review_count || 0,
        gallery,
        directionsUrl: directionsUrl(business.latitude, business.longitude),
        embedUrl: embedUrl(
          business.latitude,
          business.longitude,
          process.env.GOOGLE_MAPS_API_KEY
        ),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getBusinessProducts = async (req, res, next) => {
  try {
    const products = await Product.findByBusiness(req.params.id);
    res.json({ data: products.filter((p) => p.status === 'published') });
  } catch (err) {
    next(err);
  }
};

const featuredBusinesses = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM businesses
       WHERE status = 'approved' AND is_featured = 1
       ORDER BY updated_at DESC LIMIT 12`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchBusinesses,
  getBusiness,
  getBusinessProducts,
  featuredBusinesses,
};
