const db = require('../config/db');
const crypto = require('crypto');

let ensured = false;

async function ensureOtpTable() {
  if (ensured) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS auth_otps (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      channel ENUM('phone','email') NOT NULL,
      destination VARCHAR(191) NOT NULL,
      code_hash VARCHAR(128) NOT NULL,
      purpose VARCHAR(40) NOT NULL DEFAULT 'login',
      expires_at DATETIME NOT NULL,
      consumed_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_otp_lookup (channel, destination, purpose),
      INDEX idx_otp_expires (expires_at)
    ) ENGINE=InnoDB
  `);
  ensured = true;
}

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code).trim()).digest('hex');
}

async function saveOtp({ channel, destination, code, purpose = 'login', ttlMs = 5 * 60 * 1000 }) {
  await ensureOtpTable();
  const ttlSeconds = Math.max(60, Math.round(ttlMs / 1000));
  await db.query(
    `UPDATE auth_otps SET consumed_at = NOW()
     WHERE channel = ? AND destination = ? AND purpose = ? AND consumed_at IS NULL`,
    [channel, destination, purpose]
  );
  // Use MySQL NOW() so expiry matches DB clock (avoids Node vs Hostinger TZ skew)
  await db.query(
    `INSERT INTO auth_otps (channel, destination, code_hash, purpose, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))`,
    [channel, destination, hashCode(code), purpose, ttlSeconds]
  );
  return new Date(Date.now() + ttlSeconds * 1000);
}

async function consumeOtp({ channel, destination, code, purpose = 'login' }) {
  await ensureOtpTable();
  const [rows] = await db.query(
    `SELECT id, code_hash, expires_at,
            (expires_at > NOW()) AS is_valid_time
     FROM auth_otps
     WHERE channel = ? AND destination = ? AND purpose = ?
       AND consumed_at IS NULL
     ORDER BY id DESC
     LIMIT 1`,
    [channel, destination, purpose]
  );
  const row = rows[0];
  if (!row) return { ok: false, reason: 'missing' };

  const stillValid =
    row.is_valid_time === 1 ||
    row.is_valid_time === true ||
    row.is_valid_time === '1';
  if (!stillValid) {
    await db.query('UPDATE auth_otps SET consumed_at = NOW() WHERE id = ?', [row.id]);
    return { ok: false, reason: 'expired' };
  }
  if (row.code_hash !== hashCode(code)) {
    return { ok: false, reason: 'invalid' };
  }
  await db.query('UPDATE auth_otps SET consumed_at = NOW() WHERE id = ?', [row.id]);
  return { ok: true };
}

module.exports = { saveOtp, consumeOtp, ensureOtpTable };
