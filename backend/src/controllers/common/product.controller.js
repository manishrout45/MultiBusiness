const Product = require('../../models/Product');
const db = require('../../config/db');

const searchProducts = async (req, res, next) => {
  try {
    const { q, categoryId, businessId, minPrice, maxPrice, sort, limit, offset } = req.query;
    const rows = await Product.search({
      query: q,
      categoryId: categoryId || null,
      businessId: businessId || null,
      minPrice: minPrice != null && minPrice !== '' ? Number(minPrice) : null,
      maxPrice: maxPrice != null && maxPrice !== '' ? Number(maxPrice) : null,
      sort: sort || 'newest',
      limit: Number(limit) || 24,
      offset: Number(offset) || 0,
    });
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.status !== 'published') {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query('UPDATE products SET views = views + 1 WHERE id = ?', [product.id]);

    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const config = require('../../config/constants');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret);
        await db.query(
          'INSERT INTO product_visitors (product_id, visitor_id, ip_address) VALUES (?, ?, ?)',
          [product.id, decoded.id, req.ip]
        );
      } catch {
        // ignore visitor tracking failures
      }
    }

    const [images] = await db.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [product.id]
    );
    const [variations] = await db.query(
      'SELECT * FROM product_variations WHERE product_id = ?',
      [product.id]
    );
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS user_name FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [product.id]
    );

    const [business] = await db.query(
      'SELECT id, business_name, slug, city, phone, whatsapp, latitude, longitude FROM businesses WHERE id = ?',
      [product.business_id]
    );

    res.json({
      data: {
        ...product,
        images,
        variations,
        reviews,
        business: business[0] || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchProducts, getProduct };
