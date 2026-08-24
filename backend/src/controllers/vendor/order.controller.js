const Business = require('../../models/Business');
const Order = require('../../models/Order');
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

    const requested = req.body.order_status || req.body.status || req.body.orderStatus;
    const status = STATUS_ALIASES[requested];
    if (!status) {
      return res.status(400).json({
        message:
          'Invalid status. Allowed: pending, confirmed, processing, shipped, delivered, cancelled',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.business_id !== business.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.updateStatus(order.id, status);
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
