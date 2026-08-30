const db = require('../../config/db');

const AD_TYPES = ['homepage_banner', 'category_banner', 'product_promo', 'push'];
const AD_STATUSES = ['pending', 'active', 'expired', 'rejected'];

const listAds = async (req, res, next) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT a.*,
             b.business_name
      FROM advertisements a
      LEFT JOIN businesses b ON b.id = a.business_id
    `;
    const params = [];
    if (status) {
      sql += ' WHERE a.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY a.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const createAd = async (req, res, next) => {
  try {
    const title = req.body.title;
    const adType = req.body.ad_type ?? req.body.adType;
    if (!title || !adType) {
      return res.status(400).json({ message: 'title and ad_type are required' });
    }
    if (!AD_TYPES.includes(adType)) {
      return res.status(400).json({
        message: `ad_type must be one of: ${AD_TYPES.join(', ')}`,
      });
    }

    const businessId = req.body.business_id ?? req.body.businessId ?? null;
    const imagePath = req.body.image_path ?? req.body.imagePath ?? null;
    const linkUrl = req.body.link_url ?? req.body.linkUrl ?? null;
    const startDate = req.body.start_date ?? req.body.startDate ?? null;
    const endDate = req.body.end_date ?? req.body.endDate ?? null;
    const amount = req.body.amount ?? null;
    const status = req.body.status || 'pending';
    if (!AD_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${AD_STATUSES.join(', ')}`,
      });
    }

    const [result] = await db.query(
      `INSERT INTO advertisements
       (business_id, title, ad_type, image_path, link_url, start_date, end_date, amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [businessId, title, adType, imagePath, linkUrl, startDate, endDate, amount, status]
    );

    const [rows] = await db.query('SELECT * FROM advertisements WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Advertisement created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateAd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);
    if (!existing[0]) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const title = req.body.title ?? existing[0].title;
    const status = req.body.status ?? existing[0].status;
    if (!AD_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${AD_STATUSES.join(', ')}`,
      });
    }
    const linkUrl = req.body.link_url ?? req.body.linkUrl ?? existing[0].link_url;

    await db.query(
      'UPDATE advertisements SET title = ?, status = ?, link_url = ? WHERE id = ?',
      [title, status, linkUrl, id]
    );
    const [rows] = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);
    res.json({ message: 'Offer updated', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listAds,
  createAd,
  updateAd,
};
