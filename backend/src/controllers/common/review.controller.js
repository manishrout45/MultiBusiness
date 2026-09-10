const db = require('../../config/db');

/** Public approved reviews for a business (by id or slug). */
const listBusinessReviews = async (req, res, next) => {
  try {
    const { businessId, slug } = req.query;
    if (!businessId && !slug) {
      return res.status(400).json({ message: 'businessId or slug is required' });
    }

    let bizId = businessId;
    if (!bizId && slug) {
      const [biz] = await db.query(
        'SELECT id FROM businesses WHERE slug = ? AND status = ? LIMIT 1',
        [slug, 'approved']
      );
      if (!biz[0]) {
        return res.status(404).json({ message: 'Business not found' });
      }
      bizId = biz[0].id;
    }

    const [rows] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.product_id,
              u.name AS user_name, p.name AS product_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.business_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC
       LIMIT 100`,
      [bizId]
    );

    const ids = rows.map((r) => r.id);
    let imagesByReview = {};
    if (ids.length) {
      const [images] = await db.query(
        `SELECT review_id, id, file_path FROM review_images WHERE review_id IN (?)`,
        [ids]
      );
      for (const img of images) {
        if (!imagesByReview[img.review_id]) imagesByReview[img.review_id] = [];
        imagesByReview[img.review_id].push({ id: img.id, file_path: img.file_path });
      }
    }

    const data = rows.map((r) => ({
      ...r,
      images: imagesByReview[r.id] || [],
    }));

    const avg =
      data.length > 0
        ? Math.round((data.reduce((s, r) => s + Number(r.rating), 0) / data.length) * 10) / 10
        : 0;

    res.json({
      data,
      meta: { averageRating: avg, count: data.length },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listBusinessReviews };
