const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const managerRoutes = require('./routes/manager.routes');
const vendorPublicRoutes = require('./routes/vendor-public.routes');
const vendorRoutes = require('./routes/vendor.routes');
const customerRoutes = require('./routes/customer.routes');
const commonRoutes = require('./routes/common.routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { rateLimit } = require('./middleware/rateLimit');
const { verifyPayment } = require('./services/payment.service');
const db = require('./config/db');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', rateLimit({ windowMs: 60_000, max: 200 }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Multi-Business Marketplace API' });
});

app.post('/api/payments/webhook', async (req, res, next) => {
  try {
    const { paymentId, orderId, signature, orderNumber } = req.body;
    const result = await verifyPayment({ paymentId, orderId, signature });
    if (!result.verified) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    if (orderNumber) {
      await db.query(`UPDATE orders SET payment_status = 'paid' WHERE order_number = ?`, [
        orderNumber,
      ]);
    }
    res.json({ message: 'Payment verified', data: result });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 30 }), authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/vendor', vendorPublicRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api', commonRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
