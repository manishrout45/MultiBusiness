const db = require('../../config/db');
const Business = require('../../models/Business');
const { createNotification } = require('../../services/notification.service');

const listInquiries = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      `SELECT i.*, u.name AS customer_name, p.name AS product_name
       FROM inquiries i
       LEFT JOIN users u ON u.id = i.customer_id
       LEFT JOIN products p ON p.id = i.product_id
       WHERE i.business_id = ?
       ORDER BY i.created_at DESC`,
      [business.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const replyInquiry = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const reply = req.body.reply || req.body.message;
    if (!reply) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const [rows] = await db.query(
      'SELECT * FROM inquiries WHERE id = ? AND business_id = ?',
      [req.params.id, business.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const inquiry = rows[0];
    await db.query(
      `UPDATE inquiries SET reply = ?, status = 'replied' WHERE id = ?`,
      [reply, inquiry.id]
    );

    if (inquiry.customer_id) {
      await createNotification({
        userId: inquiry.customer_id,
        title: 'Inquiry reply',
        message: `${business.business_name} replied to your inquiry.`,
        type: 'inquiry',
        link: `/inquiries/${inquiry.id}`,
      });
    }

    const [updated] = await db.query('SELECT * FROM inquiries WHERE id = ?', [inquiry.id]);
    res.json({ message: 'Inquiry replied', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listInquiries,
  replyInquiry,
};
