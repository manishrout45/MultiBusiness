const db = require('../config/db');

const Cart = {
  getItems: async (userId) => {
    const [rows] = await db.query(
      `SELECT c.*, p.name, p.price, p.sale_price, p.stock AS product_stock, p.business_id,
              b.business_name, b.owner_id,
              pv.variation_name, pv.variation_value, pv.stock AS variation_stock,
              pv.price_adjustment,
              (SELECT pi.file_path FROM product_images pi
                WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       JOIN businesses b ON b.id = p.business_id
       LEFT JOIN product_variations pv ON pv.id = c.variation_id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows.map((row) => ({
      ...row,
      stock:
        row.variation_id != null
          ? Number(row.variation_stock ?? 0)
          : Number(row.product_stock ?? 0),
    }));
  },

  addItem: async (userId, productId, quantity = 1, variationId = null) => {
    const [existing] = await db.query(
      `SELECT id, quantity FROM cart_items
       WHERE user_id = ? AND product_id = ?
         AND ((? IS NULL AND variation_id IS NULL) OR variation_id = ?)`,
      [userId, productId, variationId, variationId]
    );
    if (existing[0]) {
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [
        quantity,
        existing[0].id,
      ]);
      return existing[0].id;
    }
    const [result] = await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity, variation_id)
       VALUES (?, ?, ?, ?)`,
      [userId, productId, quantity, variationId]
    );
    return result.insertId;
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
