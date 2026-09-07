const crypto = require('crypto');

function isPaymentConfigured() {
  return Boolean(process.env.PAYMENT_GATEWAY_KEY && process.env.PAYMENT_GATEWAY_SECRET);
}

const createPaymentOrder = async ({ amount, currency = 'INR', orderId, customer }) => {
  if (!isPaymentConfigured()) {
    return {
      configured: false,
      provider: 'none',
      orderId,
      amount: Number(amount),
      currency,
      status: 'awaiting_gateway_config',
      message:
        'Online payment is not configured. Use COD or wallet, or set PAYMENT_GATEWAY_KEY and PAYMENT_GATEWAY_SECRET.',
    };
  }

  const key = process.env.PAYMENT_GATEWAY_KEY;
  const secret = process.env.PAYMENT_GATEWAY_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const baseUrl = process.env.PAYMENT_GATEWAY_URL || 'https://api.razorpay.com/v1';

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: String(orderId).slice(0, 40),
      notes: {
        marketplace_order_id: String(orderId),
        customer_id: customer?.id ? String(customer.id) : undefined,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Payment gateway error: ${text}`);
  }

  const data = await response.json();
  return {
    configured: true,
    provider: 'razorpay',
    keyId: key,
    gatewayOrderId: data.id,
    paymentId: data.id,
    orderId,
    amount: Number(amount),
    currency,
    status: data.status,
    raw: data,
  };
};

const verifyPayment = async ({ paymentId, orderId, signature }) => {
  if (!isPaymentConfigured()) {
    return {
      configured: false,
      verified: false,
      paymentId,
      orderId,
      message: 'Payment gateway is not configured',
    };
  }

  if (!paymentId || !orderId || !signature) {
    return { configured: true, verified: false, paymentId, orderId };
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.PAYMENT_GATEWAY_SECRET)
    .update(payload)
    .digest('hex');

  return {
    configured: true,
    verified: expected === signature,
    paymentId,
    orderId,
  };
};

const convenienceFee = (amount, percent = 0) => {
  const fee = Math.round(Number(amount) * Number(percent) * 100) / 10000;
  return { amount: Number(amount), fee, total: Number(amount) + fee };
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  convenienceFee,
  isPaymentConfigured,
};
