const db = require('../config/db');

const Cart = {
  getItems: async (userId) => {
    const [rows] = await db.query(
      `SELECT c.*, p.name, p.price, p.sale_price, p.stock, p.business_id, b.business_name,
              (SELECT pi.file_path FROM product_images pi
                WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       JOIN businesses b ON b.id = p.business_id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  },

  addItem: async (userId, productId, quantity = 1) => {
    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, productId, quantity]
    );
  },

  updateItem: async (itemId, quantity) => {
    await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
  },

  removeItem: async (itemId) => {
    await db.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
  },

  clear: async (userId) => {
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  },
};

module.exports = Cart;
