const crypto = require('crypto');

const createPaymentOrder = async ({ amount, currency = 'INR', orderId, customer }) => {
  if (!process.env.PAYMENT_GATEWAY_KEY) {
    console.log('[Payment stub]', { amount, currency, orderId, customer: customer?.email });
    return {
      stub: true,
      provider: 'stub',
      paymentId: `stub_${orderId}`,
      orderId,
      amount,
      currency,
      status: 'created',
    };
  }

  // Razorpay-compatible order create (requires PAYMENT_GATEWAY_KEY as key_id)
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
      receipt: String(orderId),
      notes: { marketplace_order_id: String(orderId) },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Payment gateway error: ${text}`);
  }

  const data = await response.json();
  return {
    provider: 'razorpay',
    paymentId: data.id,
    orderId,
    amount,
    currency,
    status: data.status,
    raw: data,
  };
};

const verifyPayment = async ({ paymentId, orderId, signature }) => {
  if (!process.env.PAYMENT_GATEWAY_SECRET) {
    return { stub: true, verified: true, paymentId, orderId };
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.PAYMENT_GATEWAY_SECRET)
    .update(payload)
    .digest('hex');

  return {
    verified: expected === signature,
    paymentId,
    orderId,
  };
};

const convenienceFee = (amount, percent = 0) => {
  const fee = Math.round(Number(amount) * Number(percent) * 100) / 10000;
  return { amount: Number(amount), fee, total: Number(amount) + fee };
};

module.exports = { createPaymentOrder, verifyPayment, convenienceFee };
