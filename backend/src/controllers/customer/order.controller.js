const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');
const Cart = require('../../models/Cart');
const Order = require('../../models/Order');
const { calculateCommission } = require('../../services/commission.service');
const { createNotification } = require('../../services/notification.service');
const { createPaymentOrder } = require('../../services/payment.service');
const { debitWallet } = require('../../services/monetization.service');
const { buildInvoiceHtml } = require('../../utils/invoice');
const { sendEmail } = require('../../services/email.service');
const { sendSMS } = require('../../services/sms.service');

const PAYMENT_METHODS = ['upi', 'credit_card', 'debit_card', 'net_banking', 'cod', 'wallet'];

const getUnitPrice = (item) =>
  item.sale_price != null ? Number(item.sale_price) : Number(item.price);

const checkout = async (req, res, next) => {
  try {
    const { shippingAddress, phone, paymentMethod } = req.body;
    if (!shippingAddress || !phone || !paymentMethod) {
      return res.status(400).json({
        message: 'shippingAddress, phone, and paymentMethod are required',
      });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        message: `paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}`,
      });
    }

    const [cartItems] = await db.query(
      `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.sale_price, p.stock,
              p.business_id, b.owner_id, b.business_name
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       JOIN businesses b ON b.id = p.business_id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    for (const item of cartItems) {
      if (Number(item.stock) < Number(item.quantity)) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}`,
        });
      }
    }

    const grandTotal = cartItems.reduce(
      (sum, item) => sum + getUnitPrice(item) * Number(item.quantity),
      0
    );

    if (paymentMethod === 'wallet') {
      await debitWallet(req.user.id, grandTotal, 'Order payment', `checkout_${Date.now()}`);
    }

    const grouped = {};
    for (const item of cartItems) {
      const businessId = item.business_id;
      if (!grouped[businessId]) {
        grouped[businessId] = {
          businessId,
          ownerId: item.owner_id,
          businessName: item.business_name,
          items: [],
        };
      }
      grouped[businessId].items.push(item);
    }

    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid';
    const createdOrders = [];

    for (const group of Object.values(grouped)) {
      const totalAmount = group.items.reduce((sum, item) => {
        return sum + getUnitPrice(item) * Number(item.quantity);
      }, 0);
      const roundedTotal = Math.round(totalAmount * 100) / 100;
      const { commissionAmount } = calculateCommission(roundedTotal);
      const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`;

      const orderId = await Order.create({
        orderNumber,
        customerId: req.user.id,
        businessId: group.businessId,
        totalAmount: roundedTotal,
        commissionAmount,
        paymentMethod,
        shippingAddress,
        phone,
      });

      if (paymentStatus === 'paid') {
        await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', [
          'paid',
          orderId,
        ]);
      }

      for (const item of group.items) {
        const unitPrice = getUnitPrice(item);
        const lineTotal = Math.round(unitPrice * Number(item.quantity) * 100) / 100;
        await db.query(
          `INSERT INTO order_items
           (order_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.name, item.quantity, unitPrice, lineTotal]
        );
        await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
          item.quantity,
          item.product_id,
        ]);
      }

      await db.query(
        `INSERT INTO payments (order_id, amount, currency, status)
         VALUES (?, ?, 'INR', ?)`,
        [orderId, roundedTotal, paymentStatus === 'paid' ? 'success' : 'pending']
      );

      if (paymentMethod !== 'cod' && paymentMethod !== 'wallet') {
        await createPaymentOrder({
          amount: roundedTotal,
          orderId: orderNumber,
          customer: { id: req.user.id },
        });
      }

      await createNotification({
        userId: group.ownerId,
        title: 'New order received',
        message: `Order ${orderNumber} for ${group.businessName} — ₹${roundedTotal}`,
        type: 'order',
        link: `/vendor/orders/${orderId}`,
      });

      const order = await Order.findById(orderId);
      const [orderItems] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
      createdOrders.push({ ...order, items: orderItems });
    }

    await Cart.clear(req.user.id);

    const [userRows] = await db.query('SELECT email, phone FROM users WHERE id = ?', [
      req.user.id,
    ]);
    const email = userRows[0]?.email;
    const userPhone = userRows[0]?.phone || phone;
    if (email) {
      await sendEmail({
        to: email,
        subject: 'Order confirmation',
        text: `Your order(s) were placed: ${createdOrders.map((o) => o.order_number).join(', ')}`,
        html: `<p>Your order(s) were placed:</p><ul>${createdOrders
          .map((o) => `<li>${o.order_number} — ₹${o.total_amount}</li>`)
          .join('')}</ul>`,
      });
    }
    await sendSMS({
      to: userPhone,
      message: `Order confirmed: ${createdOrders.map((o) => o.order_number).join(', ')}`,
    });

    res.status(201).json({
      message: 'Checkout successful',
      data: createdOrders,
    });
  } catch (err) {
    next(err);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const orders = await Order.findByCustomer(req.user.id);
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || Number(order.customer_id) !== Number(req.user.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const [businessRows] = await db.query(
      'SELECT id, business_name, slug, phone, city FROM businesses WHERE id = ?',
      [order.business_id]
    );
    res.json({
      data: {
        ...order,
        items,
        business: businessRows[0] || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || Number(order.customer_id) !== Number(req.user.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({
      data: {
        orderNumber: order.order_number,
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        trackingNumber: order.tracking_number,
        updatedAt: order.updated_at,
        createdAt: order.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

const purchaseHistory = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, oi.product_id, oi.product_name, oi.quantity, oi.unit_price, oi.total_price,
              b.business_name
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN businesses b ON b.id = o.business_id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || Number(order.customer_id) !== Number(req.user.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const [businessRows] = await db.query('SELECT * FROM businesses WHERE id = ?', [
      order.business_id,
    ]);
    const html = buildInvoiceHtml(order, items, businessRows[0] || {});
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkout,
  listOrders,
  getOrder,
  trackOrder,
  purchaseHistory,
  getInvoice,
};
