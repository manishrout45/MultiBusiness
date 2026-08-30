const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');

const listPendingProducts = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*,
              b.business_name,
              b.owner_id,
              c.name AS category_name
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const approveProduct = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, b.owner_id, b.business_name
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query(`UPDATE products SET status = 'published' WHERE id = ?`, [req.params.id]);
    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

    await createNotification({
      userId: rows[0].owner_id,
      title: 'Product approved',
      message: `Your product "${rows[0].name}" has been published.`,
      type: 'product',
      link: `/products/${rows[0].id}`,
    });

    res.json({ message: 'Product approved', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const rejectProduct = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, b.owner_id
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query(`UPDATE products SET status = 'rejected' WHERE id = ?`, [req.params.id]);
    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

    const reason = req.body.reason || req.body.rejection_reason || '';
    await createNotification({
      userId: rows[0].owner_id,
      title: 'Product rejected',
      message: reason
        ? `Your product "${rows[0].name}" was rejected: ${reason}`
        : `Your product "${rows[0].name}" was rejected.`,
      type: 'product',
      link: `/products/${rows[0].id}`,
    });

    res.json({ message: 'Product rejected', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPendingProducts,
  approveProduct,
  rejectProduct,
};
