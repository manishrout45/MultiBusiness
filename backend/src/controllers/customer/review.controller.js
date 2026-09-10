const Review = require('../../models/Review');
const Product = require('../../models/Product');
const db = require('../../config/db');
const { getUploadedFileUrl } = require('../../middleware/upload');

const createReview = async (req, res, next) => {
  try {
    const productId = Number(req.body.productId);
    const rating = Number(req.body.rating);
    const comment = req.body.comment || null;
    const businessId = req.body.businessId != null ? Number(req.body.businessId) : null;

    if (!productId && !businessId) {
      return res.status(400).json({ message: 'productId or businessId is required' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    let resolvedBusinessId = businessId;
    let resolvedProductId = productId || null;

    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      resolvedBusinessId = product.business_id;
      resolvedProductId = product.id;
    } else {
      const [businessRows] = await db.query('SELECT id FROM businesses WHERE id = ?', [
        businessId,
      ]);
      if (!businessRows[0]) {
        return res.status(404).json({ message: 'Business not found' });
      }
    }

    const [eligible] = await db.query(
      `SELECT o.id
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.customer_id = ?
         AND o.business_id = ?
         AND o.order_status = 'delivered'
         AND (? IS NULL OR oi.product_id = ?)
       LIMIT 1`,
      [req.user.id, resolvedBusinessId, resolvedProductId, resolvedProductId]
    );
    if (!eligible[0]) {
      return res.status(403).json({
        message: 'You can rate a product or business after a delivered order.',
      });
    }

    const reviewId = await Review.create({
      userId: req.user.id,
      productId: resolvedProductId,
      businessId: resolvedBusinessId,
      rating,
      comment,
    });

    const files = Array.isArray(req.files) ? req.files : [];
    const photoUrls = [];
    if (Array.isArray(req.body.photos)) {
      for (const url of req.body.photos) {
        if (typeof url === 'string' && url.startsWith('http')) photoUrls.push(url.slice(0, 500));
      }
    } else if (typeof req.body.photos === 'string' && req.body.photos.startsWith('http')) {
      photoUrls.push(req.body.photos.slice(0, 500));
    }
    for (const file of files.slice(0, 5)) {
      const url = getUploadedFileUrl(file);
      if (url) photoUrls.push(String(url).slice(0, 500));
    }
    for (const url of photoUrls.slice(0, 5)) {
      await db.query('INSERT INTO review_images (review_id, file_path) VALUES (?, ?)', [
        reviewId,
        url,
      ]);
    }

    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    const [images] = await db.query(
      'SELECT id, file_path FROM review_images WHERE review_id = ?',
      [reviewId]
    );
    res.status(201).json({
      message: 'Review submitted',
      data: { ...rows[0], images },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
};
