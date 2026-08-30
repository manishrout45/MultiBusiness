const db = require('../config/db');

const Order = {
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0] || null;
  },

  findByCustomer: async (customerId) => {
    const [rows] = await db.query(
      `SELECT o.*, b.business_name, b.slug AS business_slug
       FROM orders o
       JOIN businesses b ON b.id = o.business_id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [customerId]
    );
    return rows;
  },

  findByBusiness: async (businessId) => {
    const [rows] = await db.query(
      `SELECT o.*, u.name AS customer_name
       FROM orders o
       JOIN users u ON u.id = o.customer_id
       WHERE o.business_id = ?
       ORDER BY o.created_at DESC`,
      [businessId]
    );
    return rows;
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO orders
       (order_number, customer_id, business_id, total_amount, commission_amount,
        payment_method, payment_status, order_status, shipping_address, phone)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'placed', ?, ?)`,
      [
        data.orderNumber, data.customerId, data.businessId, data.totalAmount,
        data.commissionAmount, data.paymentMethod, data.shippingAddress, data.phone,
      ]
    );
    return result.insertId;
  },

  updateStatus: async (id, orderStatus) => {
    await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [orderStatus, id]);
  },
};

module.exports = Order;
