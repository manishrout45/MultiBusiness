const db = require('../../config/db');
const {
  getOrCreateWallet,
  creditWallet,
  debitWallet,
} = require('../../services/monetization.service');

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

const topUpWallet = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }
    await creditWallet(req.user.id, amount, 'Wallet top-up (stub)', `topup_${Date.now()}`);
    const wallet = await getOrCreateWallet(req.user.id);
    res.json({ message: 'Wallet credited', data: wallet });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWallet, topUpWallet, debitWallet };
