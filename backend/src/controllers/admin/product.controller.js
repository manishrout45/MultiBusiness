const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');

const monitorProducts = async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT p.*, b.business_name, b.owner_id
      FROM products p
      JOIN businesses b ON b.id = p.business_id
      WHERE 1=1`;
    const params = [];
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY p.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body.status;
    const reason = req.body.reason || req.body.rejection_reason || null;

    const allowed = ['draft', 'pending', 'published', 'rejected', 'out_of_stock'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const [rows] = await db.query(
      `SELECT p.*, b.owner_id, b.business_name
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.id = ?`,
      [id]
    );
    const product = rows[0];
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query('UPDATE products SET status = ? WHERE id = ?', [status, id]);

    const publishLabel = status === 'published' ? 'approved' : status;
    await createNotification({
      userId: product.owner_id,
      title: `Product ${publishLabel}`,
      message: reason
        ? `${product.name}: ${reason}`
        : `Your product "${product.name}" is now ${status}.`,
      type: 'product',
      link: '/vendor/products',
    });

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product status updated', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

const removeProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT p.*, b.owner_id, b.business_name
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       WHERE p.id = ?`,
      [id]
    );
    const product = rows[0];
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    try {
      await db.query('DELETE FROM products WHERE id = ?', [id]);
    } catch {
      await db.query('UPDATE products SET status = ? WHERE id = ?', ['rejected', id]);
    }

    await createNotification({
      userId: product.owner_id,
      title: 'Product removed',
      message: `Your product "${product.name}" was removed from the marketplace.`,
      type: 'product',
      link: '/vendor/products',
    });

    res.json({ message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  monitorProducts,
  updateProductStatus,
  removeProduct,
};
