const Business = require('../../models/Business');
const Order = require('../../models/Order');
const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');
const { calculateCommission } = require('../../services/commission.service');

const STATUS_ALIASES = {
  pending: 'placed',
  confirmed: 'accepted',
  processing: 'packed',
  placed: 'placed',
  accepted: 'accepted',
  packed: 'packed',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
  returned: 'returned',
  return: 'returned',
};

const restoreStockForOrder = async (orderId) => {
  const [items] = await db.query(
    'SELECT product_id, variation_id, quantity FROM order_items WHERE order_id = ?',
    [orderId]
  );
  for (const item of items) {
    await db.query('UPDATE products SET stock = stock + ? WHERE id = ?', [
      item.quantity,
      item.product_id,
    ]);
    if (item.variation_id) {
      await db.query('UPDATE product_variations SET stock = stock + ? WHERE id = ?', [
        item.quantity,
        item.variation_id,
      ]);
    }
    await db.query(
      `UPDATE products SET status = 'published'
       WHERE id = ? AND status = 'out_of_stock' AND stock > 0`,
      [item.product_id]
    );
  }
};

const listOrders = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const orders = await Order.findByBusiness(business.id);
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const requested = String(
      req.body.order_status || req.body.status || req.body.orderStatus || ''
    ).toLowerCase();
    const status = STATUS_ALIASES[requested];
    if (!status) {
      return res.status(400).json({
        message:
          'Invalid status. Allowed: pending, confirmed, processing, shipped, delivered, cancelled, returned',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.business_id !== business.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previous = order.order_status;
    await Order.updateStatus(order.id, status);

    // Restore stock when cancelling or marking returned (once)
    if (
      ['cancelled', 'returned'].includes(status) &&
      !['cancelled', 'returned'].includes(previous)
    ) {
      await restoreStockForOrder(order.id);
      if (status === 'returned') {
        await db.query(`UPDATE orders SET payment_status = 'refunded' WHERE id = ?`, [
          order.id,
        ]);
      }
    }

    const updated = await Order.findById(order.id);
    const commissionInfo = calculateCommission(order.total_amount);

    await createNotification({
      userId: order.customer_id,
      title: 'Order status updated',
      message: `Your order ${order.order_number} is now ${status}.`,
      type: 'order',
      link: `/orders/${order.id}`,
    });

    res.json({
      message: 'Order status updated',
      data: { ...updated, commissionInfo },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listOrders,
  updateOrderStatus,
};
