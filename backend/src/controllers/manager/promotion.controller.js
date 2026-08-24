const db = require('../../config/db');

const listPromotions = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*,
              c.name AS category_name,
              u.name AS created_by_name
       FROM promotions p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN users u ON u.id = p.created_by
       ORDER BY p.created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const createPromotion = async (req, res, next) => {
  try {
    const title = req.body.title;
    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const description = req.body.description || null;
    const region = req.body.region || null;
    const categoryId = req.body.category_id ?? req.body.categoryId ?? null;
    const startDate = req.body.start_date ?? req.body.startDate ?? null;
    const endDate = req.body.end_date ?? req.body.endDate ?? null;
    const isActive = req.body.is_active ?? req.body.isActive;
    const activeValue = isActive === undefined || isActive === true || isActive === 1 ? 1 : 0;

    const [result] = await db.query(
      `INSERT INTO promotions
       (title, description, region, category_id, start_date, end_date, created_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, region, categoryId, startDate, endDate, req.user.id, activeValue]
    );

    const [rows] = await db.query('SELECT * FROM promotions WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Promotion created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM promotions WHERE id = ?', [id]);
    if (!existing[0]) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const title = req.body.title ?? existing[0].title;
    const description =
      req.body.description !== undefined ? req.body.description : existing[0].description;
    const isActive = req.body.is_active ?? req.body.isActive;
    const activeValue =
      isActive === undefined ? existing[0].is_active : isActive === true || isActive === 1 ? 1 : 0;

    await db.query(
      'UPDATE promotions SET title = ?, description = ?, is_active = ? WHERE id = ?',
      [title, description, activeValue, id]
    );
    const [rows] = await db.query('SELECT * FROM promotions WHERE id = ?', [id]);
    res.json({ message: 'Announcement updated', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPromotions,
  createPromotion,
  updatePromotion,
};
