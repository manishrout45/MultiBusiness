const db = require('../../config/db');
const Order = require('../../models/Order');
const { createNotification } = require('../../services/notification.service');

const listRefunds = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, o.order_number, o.business_id, o.total_amount, b.business_name
       FROM refunds r
       JOIN orders o ON o.id = r.order_id
       LEFT JOIN businesses b ON b.id = o.business_id
       WHERE o.customer_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const createRefund = async (req, res, next) => {
  try {
    const orderId = Number(req.body.orderId || req.body.order_id);
    const reason = (req.body.reason || '').trim();
    if (!orderId || !reason) {
      return res.status(400).json({ message: 'orderId and reason are required' });
    }

    const order = await Order.findById(orderId);
    if (!order || Number(order.customer_id) !== Number(req.user.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (['cancelled'].includes(order.order_status)) {
      return res.status(400).json({ message: 'Cannot refund a cancelled order' });
    }
    if (order.payment_status === 'refunded') {
      return res.status(400).json({ message: 'Order is already refunded' });
    }

    const [existing] = await db.query(
      `SELECT id FROM refunds
       WHERE order_id = ? AND status IN ('requested', 'approved', 'processed')
       LIMIT 1`,
      [orderId]
    );
    if (existing[0]) {
      return res.status(409).json({ message: 'A refund request already exists for this order' });
    }

    const maxAmount = Number(order.total_amount);
    let amount = req.body.amount != null ? Number(req.body.amount) : maxAmount;
    if (!amount || amount <= 0 || amount > maxAmount) {
      return res.status(400).json({
        message: `amount must be between 0.01 and ${maxAmount}`,
      });
    }

    const [result] = await db.query(
      `INSERT INTO refunds (order_id, reason, amount, status)
       VALUES (?, ?, ?, 'requested')`,
      [orderId, reason, amount]
    );

    const [ownerRows] = await db.query(
      'SELECT owner_id, business_name FROM businesses WHERE id = ?',
      [order.business_id]
    );
    if (ownerRows[0]) {
      await createNotification({
        userId: ownerRows[0].owner_id,
        title: 'Refund requested',
        message: `Customer requested ₹${amount} refund for order ${order.order_number}`,
        type: 'refund',
        link: '/vendor/refunds',
      });
    }

    const [rows] = await db.query('SELECT * FROM refunds WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Refund requested', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listRefunds,
  createRefund,
};
