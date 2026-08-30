const db = require('../config/db');

const Review = {
  findByProduct: async (productId) => {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS user_name FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.status = 'approved'`,
      [productId]
    );
    return rows;
  },

  create: async ({ userId, productId, businessId, rating, comment }) => {
    const [result] = await db.query(
      `INSERT INTO reviews (user_id, product_id, business_id, rating, comment, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, productId, businessId, rating, comment]
    );
    return result.insertId;
  },
};

module.exports = Review;
