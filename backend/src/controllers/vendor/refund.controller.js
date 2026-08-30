const db = require('../../config/db');
const Business = require('../../models/Business');
const { createNotification } = require('../../services/notification.service');

const listRefunds = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT r.*, o.order_number, o.customer_id, o.total_amount
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
      `SELECT r.*, o.business_id, o.customer_id, o.order_number
       FROM refunds r
       JOIN orders o ON o.id = r.order_id
       WHERE r.id = ? AND o.business_id = ?`,
      [req.params.id, business.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    const refund = rows[0];
    await db.query('UPDATE refunds SET status = ? WHERE id = ?', [status, refund.id]);

    if (status === 'approved') {
      await db.query(
        `UPDATE orders SET payment_status = 'refunded', order_status = 'returned' WHERE id = ?`,
        [refund.order_id]
      );
    }

    await createNotification({
      userId: refund.customer_id,
      title: `Refund ${status}`,
      message: `Your refund request for order ${refund.order_number} was ${status}.`,
      type: 'refund',
      link: `/orders/${refund.order_id}`,
    });

    const [updated] = await db.query('SELECT * FROM refunds WHERE id = ?', [refund.id]);
    res.json({ message: `Refund ${status}`, data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listRefunds,
  handleRefund,
};
