const db = require('../config/db');

const Wishlist = {
  findByUser: async (userId) => {
    const [rows] = await db.query(
      `SELECT w.*, p.name, p.price, p.sale_price, p.stock, p.status AS product_status,
              p.business_id, b.business_name, b.slug AS business_slug,
              (SELECT pi.file_path FROM product_images pi
                WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       JOIN businesses b ON b.id = p.business_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return rows;
  },

  add: async (userId, productId) => {
    await db.query(
      'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );
  },

  remove: async (userId, productId) => {
    await db.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [
      userId,
      productId,
    ]);
  },

  hasProduct: async (userId, productId) => {
    const [rows] = await db.query(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1',
      [userId, productId]
    );
    return Boolean(rows[0]);
  },
};

module.exports = Wishlist;
