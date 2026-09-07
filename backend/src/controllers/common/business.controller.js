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
    const key = req.params.id;
    const [byId] = await db.query(
      `SELECT * FROM businesses
       WHERE status = 'approved' AND (id = ? OR slug = ?)
       LIMIT 1`,
      [key, key]
    );
    const business = byId[0];
    if (!business) {
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
    const [products] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              (SELECT pi.file_path FROM product_images pi
                WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.business_id = ? AND p.status = 'published'
       ORDER BY p.created_at DESC`,
      [business.id]
    );

    res.json({
      data: {
        ...business,
        avg_rating: reviews[0]?.avg_rating || 0,
        review_count: reviews[0]?.review_count || 0,
        gallery,
        products,
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
    const key = req.params.id;
    const [bizRows] = await db.query(
      `SELECT id FROM businesses
       WHERE status = 'approved' AND (id = ? OR slug = ?)
       LIMIT 1`,
      [key, key]
    );
    if (!bizRows[0]) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const [products] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              (SELECT pi.file_path FROM product_images pi
                WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.business_id = ? AND p.status = 'published'
       ORDER BY p.created_at DESC`,
      [bizRows[0].id]
    );
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
};

const featuredBusinesses = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*,
              c.name AS category_name,
              c.slug AS category_slug,
              (SELECT AVG(r.rating) FROM reviews r
                WHERE r.business_id = b.id AND r.status = 'approved') AS avg_rating,
              (SELECT COUNT(*) FROM reviews r
                WHERE r.business_id = b.id AND r.status = 'approved') AS review_count,
              (SELECT COUNT(*) FROM products p
                WHERE p.business_id = b.id AND p.status = 'published') AS product_count
       FROM businesses b
       LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.status = 'approved' AND b.is_featured = 1
       ORDER BY b.updated_at DESC LIMIT 12`
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
