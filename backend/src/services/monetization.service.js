const db = require('../config/db');

const getSetting = async (key, fallback = null) => {
  const [rows] = await db.query(
    'SELECT setting_value FROM platform_settings WHERE setting_key = ? LIMIT 1',
    [key]
  );
  return rows[0]?.setting_value ?? fallback;
};

const ensureLeadChargesTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS lead_charges (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      business_id INT UNSIGNED NOT NULL,
      inquiry_id INT UNSIGNED NULL,
      amount DECIMAL(10,2) NOT NULL,
      status ENUM('pending','charged','waived') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_lead_business (business_id)
    ) ENGINE=InnoDB
  `);
};

const ensureWalletTopupsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS wallet_topups (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      gateway_order_id VARCHAR(100) NOT NULL,
      receipt VARCHAR(100) NOT NULL,
      payment_id VARCHAR(100) NULL,
      status ENUM('pending','completed','failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_wallet_topup_gateway (gateway_order_id),
      UNIQUE KEY uk_wallet_topup_receipt (receipt),
      INDEX idx_wallet_topup_user (user_id)
    ) ENGINE=InnoDB
  `);
};

const recordLeadCharge = async ({ businessId, inquiryId, amount }) => {
  await ensureLeadChargesTable();
  const [result] = await db.query(
    `INSERT INTO lead_charges (business_id, inquiry_id, amount, status)
     VALUES (?, ?, ?, 'pending')`,
    [businessId, inquiryId || null, amount]
  );
  return result.insertId;
};

const markLeadChargeStatus = async (chargeId, status) => {
  await ensureLeadChargesTable();
  await db.query('UPDATE lead_charges SET status = ? WHERE id = ?', [status, chargeId]);
};

const setFeatured = async (businessId, isFeatured) => {
  await db.query('UPDATE businesses SET is_featured = ? WHERE id = ?', [
    isFeatured ? 1 : 0,
    businessId,
  ]);
};

const setVerifiedBadge = async (businessId, isVerified) => {
  await db.query('UPDATE businesses SET is_verified = ? WHERE id = ?', [
    isVerified ? 1 : 0,
    businessId,
  ]);
};

const getOrCreateWallet = async (userId) => {
  const [rows] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);
  if (rows[0]) return rows[0];
  const [result] = await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0)', [userId]);
  return { id: result.insertId, user_id: userId, balance: 0 };
};

const findWalletTxByReference = async (referenceId) => {
  if (!referenceId) return null;
  const [rows] = await db.query(
    `SELECT * FROM wallet_transactions WHERE reference_id = ? LIMIT 1`,
    [referenceId]
  );
  return rows[0] || null;
};

const creditWallet = async (userId, amount, description, referenceId = null) => {
  if (referenceId) {
    const existing = await findWalletTxByReference(referenceId);
    if (existing) {
      return { credited: false, duplicate: true, transaction: existing };
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    if (referenceId) {
      const [existingRows] = await conn.query(
        `SELECT * FROM wallet_transactions WHERE reference_id = ? LIMIT 1 FOR UPDATE`,
        [referenceId]
      );
      if (existingRows[0]) {
        await conn.rollback();
        return { credited: false, duplicate: true, transaction: existingRows[0] };
      }
    }

    const [wallets] = await conn.query(
      'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    let wallet = wallets[0];
    if (!wallet) {
      const [created] = await conn.query(
        'INSERT INTO wallets (user_id, balance) VALUES (?, 0)',
        [userId]
      );
      wallet = { id: created.insertId, user_id: userId, balance: 0 };
    }

    await conn.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [
      amount,
      wallet.id,
    ]);
    const [result] = await conn.query(
      `INSERT INTO wallet_transactions (wallet_id, amount, type, description, reference_id)
       VALUES (?, ?, 'credit', ?, ?)`,
      [wallet.id, amount, description, referenceId]
    );
    await conn.commit();
    return { credited: true, duplicate: false, transactionId: result.insertId };
  } catch (err) {
    await conn.rollback();
    if (referenceId && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      const existing = await findWalletTxByReference(referenceId);
      return { credited: false, duplicate: true, transaction: existing };
    }
    throw err;
  } finally {
    conn.release();
  }
};

const debitWallet = async (userId, amount, description, referenceId = null) => {
  if (referenceId) {
    const existing = await findWalletTxByReference(referenceId);
    if (existing) {
      return { debited: false, duplicate: true, transaction: existing };
    }
  }

  const wallet = await getOrCreateWallet(userId);
  if (Number(wallet.balance) < Number(amount)) {
    const err = new Error('Insufficient wallet balance');
    err.statusCode = 400;
    throw err;
  }
  await db.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, wallet.id]);
  const [result] = await db.query(
    `INSERT INTO wallet_transactions (wallet_id, amount, type, description, reference_id)
     VALUES (?, ?, 'debit', ?, ?)`,
    [wallet.id, amount, description, referenceId]
  );
  return { debited: true, duplicate: false, transactionId: result.insertId };
};

const createPendingTopUp = async ({ userId, amount, gatewayOrderId, receipt }) => {
  await ensureWalletTopupsTable();
  const [result] = await db.query(
    `INSERT INTO wallet_topups (user_id, amount, gateway_order_id, receipt, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [userId, amount, gatewayOrderId, receipt]
  );
  return result.insertId;
};

const completeTopUp = async ({ userId, gatewayOrderId, paymentId }) => {
  await ensureWalletTopupsTable();
  const [rows] = await db.query(
    `SELECT * FROM wallet_topups
     WHERE gateway_order_id = ? AND user_id = ?
     LIMIT 1`,
    [gatewayOrderId, userId]
  );
  const topup = rows[0];
  if (!topup) {
    const err = new Error('Wallet top-up session not found. Start top-up again.');
    err.statusCode = 404;
    throw err;
  }
  if (topup.status === 'completed') {
    const wallet = await getOrCreateWallet(userId);
    return { alreadyCompleted: true, topup, wallet };
  }

  const ref = `topup_${paymentId || topup.gateway_order_id}`;
  const creditResult = await creditWallet(
    userId,
    Number(topup.amount),
    'Wallet top-up',
    ref
  );

  await db.query(
    `UPDATE wallet_topups
     SET status = 'completed', payment_id = ?
     WHERE id = ?`,
    [paymentId || null, topup.id]
  );

  const wallet = await getOrCreateWallet(userId);
  return {
    alreadyCompleted: Boolean(creditResult.duplicate),
    topup,
    wallet,
    creditResult,
  };
};

module.exports = {
  getSetting,
  recordLeadCharge,
  markLeadChargeStatus,
  setFeatured,
  setVerifiedBadge,
  getOrCreateWallet,
  creditWallet,
  debitWallet,
  createPendingTopUp,
  completeTopUp,
  ensureWalletTopupsTable,
  ensureLeadChargesTable,
};
