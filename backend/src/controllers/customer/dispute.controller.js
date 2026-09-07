const db = require('../../config/db');
const Order = require('../../models/Order');
const { createNotification, notifyUsersByRoles } = require('../../services/notification.service');

const listDisputes = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, o.order_number, b.business_name
       FROM disputes d
       LEFT JOIN orders o ON o.id = d.order_id
       LEFT JOIN businesses b ON b.id = d.business_id
       WHERE d.raised_by = ?
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const createDispute = async (req, res, next) => {
  try {
    const description = (req.body.description || req.body.message || '').trim();
    if (!description) {
      return res.status(400).json({ message: 'description is required' });
    }

    let orderId = req.body.orderId != null ? Number(req.body.orderId) : null;
    let businessId = req.body.businessId != null ? Number(req.body.businessId) : null;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || Number(order.customer_id) !== Number(req.user.id)) {
        return res.status(404).json({ message: 'Order not found' });
      }
      businessId = businessId || order.business_id;
    }

    if (businessId) {
      const [biz] = await db.query('SELECT id FROM businesses WHERE id = ?', [businessId]);
      if (!biz[0]) {
        return res.status(404).json({ message: 'Business not found' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO disputes (order_id, business_id, raised_by, description, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [orderId, businessId, req.user.id, description]
    );

    await notifyUsersByRoles({
      roles: ['super_admin', 'business_manager'],
      title: 'New dispute opened',
      message: description.slice(0, 120),
      type: 'dispute',
      link: '/manager/disputes',
    });

    if (businessId) {
      const [ownerRows] = await db.query(
        'SELECT owner_id FROM businesses WHERE id = ?',
        [businessId]
      );
      if (ownerRows[0]) {
        await createNotification({
          userId: ownerRows[0].owner_id,
          title: 'Dispute opened',
          message: description.slice(0, 120),
          type: 'dispute',
          link: '/vendor/orders',
        });
      }
    }

    const [rows] = await db.query('SELECT * FROM disputes WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Dispute created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listDisputes,
  createDispute,
};
