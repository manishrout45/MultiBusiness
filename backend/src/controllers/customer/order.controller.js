const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');
const Cart = require('../../models/Cart');
const Order = require('../../models/Order');
const { calculateCommissionForBusiness } = require('../../services/commission.service');
const { createNotification, notifyUsersByRoles } = require('../../services/notification.service');
const {
  createPaymentOrder,
  verifyPayment,
  isPaymentConfigured,
} = require('../../services/payment.service');
const { debitWallet, getSetting } = require('../../services/monetization.service');
const { buildInvoiceHtml } = require('../../utils/invoice');
const { sendEmail } = require('../../services/email.service');
const { sendSMS } = require('../../services/sms.service');

const PAYMENT_METHODS = ['upi', 'credit_card', 'debit_card', 'net_banking', 'cod', 'wallet'];

const getUnitPrice = (item) => {
  const base = item.sale_price != null ? Number(item.sale_price) : Number(item.price);
  return base + Number(item.price_adjustment || 0);
};

const decrementStock = async (productId, quantity, variationId = null) => {
  await db.query('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [
    quantity,
    productId,
  ]);
  await db.query(
    `UPDATE products SET status = 'out_of_stock' WHERE id = ? AND stock <= 0`,
    [productId]
  );
  if (variationId) {
    await db.query(
      'UPDATE product_variations SET stock = GREATEST(stock - ?, 0) WHERE id = ?',
      [quantity, variationId]
    );
  }
};

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

    const needsGateway = !['cod', 'wallet'].includes(paymentMethod);
    if (needsGateway && !isPaymentConfigured()) {
      return res.status(501).json({
        message:
          'Online payment is not configured. Use paymentMethod "cod" or "wallet", or set PAYMENT_GATEWAY_KEY and PAYMENT_GATEWAY_SECRET.',
      });
    }

    const cartItems = await Cart.getItems(req.user.id);

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    for (const item of cartItems) {
      if (Number(item.stock) < Number(item.quantity)) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}${
            item.variation_value ? ` (${item.variation_value})` : ''
          }`,
        });
      }
    }

    const deliveryFee = Math.max(0, Number(await getSetting('delivery_fee', '40')) || 0);
    const platformFee = Math.max(0, Number(await getSetting('platform_fee', '0')) || 0);

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

    let grandTotal = 0;
    for (const group of Object.values(grouped)) {
      const subtotal = group.items.reduce(
        (sum, item) => sum + getUnitPrice(item) * Number(item.quantity),
        0
      );
      grandTotal += subtotal + deliveryFee + platformFee;
    }
    grandTotal = Math.round(grandTotal * 100) / 100;

    if (paymentMethod === 'wallet') {
      await debitWallet(req.user.id, grandTotal, 'Order payment', `checkout_${Date.now()}`);
    }

    const paymentStatus = paymentMethod === 'wallet' ? 'paid' : 'pending';
    const createdOrders = [];
    const gatewayPayments = [];

    for (const group of Object.values(grouped)) {
      const subtotal = Math.round(
        group.items.reduce(
          (sum, item) => sum + getUnitPrice(item) * Number(item.quantity),
          0
        ) * 100
      ) / 100;
      const roundedTotal = Math.round((subtotal + deliveryFee + platformFee) * 100) / 100;
      const { commissionAmount } = await calculateCommissionForBusiness(
        subtotal,
        group.businessId
      );
      const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`;

      const orderId = await Order.create({
        orderNumber,
        customerId: req.user.id,
        businessId: group.businessId,
        totalAmount: roundedTotal,
        subtotalAmount: subtotal,
        commissionAmount,
        deliveryFee,
        platformFee,
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
        const label = item.variation_value
          ? `${item.name} (${item.variation_value})`
          : item.name;
        await db.query(
          `INSERT INTO order_items
           (order_id, product_id, product_name, quantity, unit_price, total_price, variation_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            label,
            item.quantity,
            unitPrice,
            lineTotal,
            item.variation_id || null,
          ]
        );
        await decrementStock(item.product_id, item.quantity, item.variation_id || null);
      }

      await db.query(
        `INSERT INTO payments (order_id, amount, currency, status)
         VALUES (?, ?, 'INR', ?)`,
        [orderId, roundedTotal, paymentStatus === 'paid' ? 'success' : 'pending']
      );

      if (paymentMethod !== 'cod' && paymentMethod !== 'wallet') {
        const gateway = await createPaymentOrder({
          amount: roundedTotal,
          orderId: orderNumber,
          customer: { id: req.user.id },
        });
        if (gateway.gatewayOrderId) {
          await db.query(
            `UPDATE payments SET gateway_payment_id = ?, gateway_response = ? WHERE order_id = ?`,
            [gateway.gatewayOrderId, JSON.stringify(gateway.raw || gateway), orderId]
          );
        }
        gatewayPayments.push({
          orderId,
          orderNumber,
          amount: roundedTotal,
          ...gateway,
        });
      }

      await createNotification({
        userId: group.ownerId,
        title: 'New order received',
        message: `Order ${orderNumber} for ${group.businessName} — ₹${roundedTotal}`,
        type: 'order',
        link: `/vendor/orders/${orderId}`,
      });

      await createNotification({
        userId: req.user.id,
        title: 'Order placed',
        message: `Your order ${orderNumber} was placed successfully — ₹${roundedTotal}`,
        type: 'order',
        link: `/orders/${orderId}`,
      });

      await notifyUsersByRoles({
        roles: ['super_admin', 'business_manager'],
        title: 'New marketplace order',
        message: `Order ${orderNumber} at ${group.businessName} — ₹${roundedTotal}`,
        type: 'order',
        link: '/admin/dashboard#orders',
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
      message:
        paymentMethod === 'cod'
          ? 'Order placed. Pay on delivery.'
          : paymentMethod === 'wallet'
            ? 'Order paid with wallet.'
            : 'Order created. Complete online payment, then call /customer/payments/confirm.',
      data: createdOrders,
      payment: {
        status: paymentStatus,
        method: paymentMethod,
        gateway: gatewayPayments,
      },
    });
  } catch (err) {
    next(err);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, gatewayOrderId } = req.body;
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        message: 'orderId, paymentId, and signature are required',
      });
    }

    const order = await Order.findById(orderId);
    if (!order || Number(order.customer_id) !== Number(req.user.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.payment_status === 'paid') {
      return res.json({ message: 'Already paid', data: order });
    }

    const [payRows] = await db.query(
      'SELECT gateway_payment_id FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1',
      [order.id]
    );
    const razorpayOrderId = gatewayOrderId || payRows[0]?.gateway_payment_id || order.order_number;

    const result = await verifyPayment({
      paymentId,
      orderId: razorpayOrderId,
      signature,
    });
    if (!result.verified) {
      return res.status(400).json({ message: result.message || 'Payment verification failed' });
    }

    await db.query(`UPDATE orders SET payment_status = 'paid' WHERE id = ?`, [order.id]);
    await db.query(
      `UPDATE payments SET status = 'success', gateway_payment_id = ?, gateway_response = ?
       WHERE order_id = ?`,
      [paymentId, JSON.stringify(result), order.id]
    );

    const updated = await Order.findById(order.id);
    res.json({ message: 'Payment confirmed', data: updated });
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
  confirmPayment,
  listOrders,
  getOrder,
  trackOrder,
  purchaseHistory,
  getInvoice,
};
