const db = require('../../config/db');
const {
  getOrCreateWallet,
  createPendingTopUp,
  completeTopUp,
} = require('../../services/monetization.service');
const {
  createPaymentOrder,
  verifyPayment,
  isPaymentConfigured,
} = require('../../services/payment.service');

const getWallet = async (req, res, next) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id);
    const [tx] = await db.query(
      `SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50`,
      [wallet.id]
    );
    res.json({ data: { ...wallet, transactions: tx } });
  } catch (err) {
    next(err);
  }
};

/** Start a paid wallet top-up (requires payment gateway). */
const topUpWallet = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }
    if (!isPaymentConfigured()) {
      return res.status(501).json({
        message:
          'Wallet top-up requires payment gateway. Set PAYMENT_GATEWAY_KEY and PAYMENT_GATEWAY_SECRET.',
      });
    }

    const receipt = `wallet_${req.user.id}_${Date.now()}`;
    const gateway = await createPaymentOrder({
      amount,
      orderId: receipt,
      customer: { id: req.user.id },
    });

    if (!gateway.gatewayOrderId) {
      return res.status(502).json({
        message: 'Payment gateway did not return an order id',
        data: gateway,
      });
    }

    await createPendingTopUp({
      userId: req.user.id,
      amount,
      gatewayOrderId: gateway.gatewayOrderId,
      receipt,
    });

    res.status(201).json({
      message: 'Complete payment to credit wallet',
      data: {
        amount,
        receipt,
        gateway,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** Confirm gateway payment and credit wallet (idempotent). */
const confirmTopUp = async (req, res, next) => {
  try {
    const { paymentId, signature, gatewayOrderId } = req.body;
    if (!paymentId || !signature || !gatewayOrderId) {
      return res.status(400).json({
        message: 'paymentId, signature, and gatewayOrderId are required',
      });
    }

    const result = await verifyPayment({
      paymentId,
      orderId: gatewayOrderId,
      signature,
    });
    if (!result.verified) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const completed = await completeTopUp({
      userId: req.user.id,
      gatewayOrderId,
      paymentId,
    });

    res.json({
      message: completed.alreadyCompleted
        ? 'Wallet top-up already credited'
        : 'Wallet credited',
      data: completed.wallet,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWallet, topUpWallet, confirmTopUp };
