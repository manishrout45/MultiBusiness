const db = require('../config/db');

const getSetting = async (key, fallback = null) => {
  const [rows] = await db.query(
    'SELECT setting_value FROM platform_settings WHERE setting_key = ? LIMIT 1',
    [key]
  );
  return rows[0]?.setting_value ?? fallback;
};

const recordLeadCharge = async ({ businessId, inquiryId, amount }) => {
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

  const [result] = await db.query(
    `INSERT INTO lead_charges (business_id, inquiry_id, amount, status)
     VALUES (?, ?, ?, 'pending')`,
    [businessId, inquiryId || null, amount]
  );
  return result.insertId;
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

const creditWallet = async (userId, amount, description, referenceId = null) => {
  const wallet = await getOrCreateWallet(userId);
  await db.query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, wallet.id]);
  await db.query(
    `INSERT INTO wallet_transactions (wallet_id, amount, type, description, reference_id)
     VALUES (?, ?, 'credit', ?, ?)`,
    [wallet.id, amount, description, referenceId]
  );
};

const debitWallet = async (userId, amount, description, referenceId = null) => {
  const wallet = await getOrCreateWallet(userId);
  if (Number(wallet.balance) < Number(amount)) {
    const err = new Error('Insufficient wallet balance');
    err.statusCode = 400;
    throw err;
  }
  await db.query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, wallet.id]);
  await db.query(
    `INSERT INTO wallet_transactions (wallet_id, amount, type, description, reference_id)
     VALUES (?, ?, 'debit', ?, ?)`,
    [wallet.id, amount, description, referenceId]
  );
};

module.exports = {
  getSetting,
  recordLeadCharge,
  setFeatured,
  setVerifiedBadge,
  getOrCreateWallet,
  creditWallet,
  debitWallet,
};
