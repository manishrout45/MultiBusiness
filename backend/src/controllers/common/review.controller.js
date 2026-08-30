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

    const avg =
      rows.length > 0
        ? Math.round((rows.reduce((s, r) => s + Number(r.rating), 0) / rows.length) * 10) / 10
        : 0;

    res.json({
      data: rows,
      meta: { averageRating: avg, count: rows.length },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listBusinessReviews };
