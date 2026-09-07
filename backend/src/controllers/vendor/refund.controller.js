const db = require('../../config/db');
const Business = require('../../models/Business');
const { createNotification } = require('../../services/notification.service');
const { creditWallet } = require('../../services/monetization.service');

const listRefunds = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT r.*, o.order_number, o.customer_id, o.total_amount, o.payment_method
       FROM refunds r
       JOIN orders o ON o.id = r.order_id
       WHERE o.business_id = ?
       ORDER BY r.created_at DESC`,
      [business.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const handleRefund = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const action = (req.body.action || req.body.status || '').toLowerCase();
    if (!['approve', 'approved', 'reject', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'action must be approve or reject' });
    }

    const status = action.startsWith('approve') ? 'approved' : 'rejected';

    const [rows] = await db.query(
      `SELECT r.*, o.business_id, o.customer_id, o.order_number, o.payment_method, o.payment_status
       FROM refunds r
       JOIN orders o ON o.id = r.order_id
       WHERE r.id = ? AND o.business_id = ?`,
      [req.params.id, business.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    const refund = rows[0];
    if (['approved', 'processed', 'rejected'].includes(refund.status) && status === 'approved') {
      return res.status(409).json({
        message: `Refund already ${refund.status}`,
        data: refund,
      });
    }

    if (status === 'rejected') {
      await db.query('UPDATE refunds SET status = ? WHERE id = ?', ['rejected', refund.id]);
      await createNotification({
        userId: refund.customer_id,
        title: 'Refund rejected',
        message: `Your refund request for order ${refund.order_number} was rejected.`,
        type: 'refund',
        link: `/orders/${refund.order_id}`,
      });
      const [updated] = await db.query('SELECT * FROM refunds WHERE id = ?', [refund.id]);
      return res.json({ message: 'Refund rejected', data: updated[0] });
    }

    // Approve: mark order refunded and credit customer wallet (idempotent by reference)
    await db.query(
      `UPDATE orders SET payment_status = 'refunded', order_status = 'returned' WHERE id = ?`,
      [refund.order_id]
    );

    await creditWallet(
      refund.customer_id,
      Number(refund.amount),
      `Refund for order ${refund.order_number}`,
      `refund_${refund.id}`
    );

    await db.query('UPDATE refunds SET status = ? WHERE id = ?', ['processed', refund.id]);

    await createNotification({
      userId: refund.customer_id,
      title: 'Refund approved',
      message: `₹${refund.amount} was credited to your wallet for order ${refund.order_number}.`,
      type: 'refund',
      link: `/orders/${refund.order_id}`,
    });

    const [updated] = await db.query('SELECT * FROM refunds WHERE id = ?', [refund.id]);
    res.json({
      message: 'Refund approved and wallet credited',
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listRefunds,
  handleRefund,
};
