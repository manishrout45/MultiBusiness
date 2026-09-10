const crypto = require('crypto');
const db = require('../config/db');

const KYC_ROLES = new Set(['vendor', 'business_manager']);

const providerName = () =>
  String(process.env.AADHAAR_KYC_PROVIDER || 'mock').trim().toLowerCase() || 'mock';

const isMock = () => {
  const p = providerName();
  if (p === 'mock') return true;
  // Cheapest path: stay on mock until real keys exist
  return !String(process.env.AADHAAR_KYC_API_KEY || '').trim();
};

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const normalizeAadhaar = (raw) => String(raw || '').replace(/\D/g, '');

const maskAadhaar = (digits) => {
  const d = normalizeAadhaar(digits);
  if (d.length !== 12) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${d.slice(-4)}`;
};

const assertEligibleRole = (role) => {
  if (!KYC_ROLES.has(role)) {
    const err = new Error('Aadhaar verification is only required for vendors and business managers');
    err.statusCode = 403;
    err.code = 'AADHAAR_NOT_REQUIRED';
    throw err;
  }
};

const sendOtp = async ({ userId, role, aadhaarNumber }) => {
  assertEligibleRole(role);
  const digits = normalizeAadhaar(aadhaarNumber);
  if (digits.length !== 12) {
    const err = new Error('Enter a valid 12-digit Aadhaar number');
    err.statusCode = 400;
    throw err;
  }

  // Expire previous pending
  await db.query(
    `UPDATE aadhaar_verifications
     SET status = 'expired'
     WHERE user_id = ? AND status = 'pending'`,
    [userId]
  );

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const provider = isMock() ? 'mock' : providerName();
  const providerRef = `ref_${crypto.randomBytes(8).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Real provider hook (later): call Cashfree/Surepass send-OTP here using AADHAAR_KYC_API_KEY
  if (!isMock()) {
    const err = new Error(
      'Real Aadhaar provider keys are set but provider adapter is not configured yet. Set AADHAAR_KYC_PROVIDER=mock for now.'
    );
    err.statusCode = 501;
    throw err;
  }

  const [result] = await db.query(
    `INSERT INTO aadhaar_verifications
     (user_id, aadhaar_hash, aadhaar_masked, provider, provider_ref, otp_hash, status, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [userId, sha256(digits), maskAadhaar(digits), provider, providerRef, sha256(code), expiresAt]
  );

  return {
    verificationId: result.insertId,
    maskedAadhaar: maskAadhaar(digits),
    expiresIn: 300,
    provider,
    // Mock only — never returned by a real provider
    ...(isMock() ? { devOtp: code } : {}),
  };
};

const verifyOtp = async ({ userId, role, verificationId, code }) => {
  assertEligibleRole(role);
  const otp = String(code || '').trim();
  if (!/^\d{6}$/.test(otp)) {
    const err = new Error('Enter the 6-digit OTP');
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await db.query(
    `SELECT * FROM aadhaar_verifications
     WHERE id = ? AND user_id = ? AND status = 'pending'
     LIMIT 1`,
    [verificationId, userId]
  );
  const row = rows[0];
  if (!row) {
    const err = new Error('Verification session not found. Request a new OTP.');
    err.statusCode = 404;
    throw err;
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.query(`UPDATE aadhaar_verifications SET status = 'expired' WHERE id = ?`, [row.id]);
    const err = new Error('OTP expired. Request a new one.');
    err.statusCode = 400;
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  await db.query(`UPDATE aadhaar_verifications SET attempts = attempts + 1 WHERE id = ?`, [
    row.id,
  ]);

  if (row.attempts >= 5) {
    await db.query(`UPDATE aadhaar_verifications SET status = 'failed' WHERE id = ?`, [row.id]);
    const err = new Error('Too many invalid attempts. Request a new OTP.');
    err.statusCode = 429;
    throw err;
  }

  if (sha256(otp) !== row.otp_hash) {
    const err = new Error('Invalid OTP');
    err.statusCode = 400;
    err.code = 'INVALID_OTP';
    throw err;
  }

  await db.query(
    `UPDATE aadhaar_verifications
     SET status = 'verified', verified_at = NOW(), otp_hash = NULL
     WHERE id = ?`,
    [row.id]
  );
  await db.query(
    `UPDATE users
     SET aadhaar_verified = 1,
         aadhaar_masked = ?,
         aadhaar_verified_at = NOW()
     WHERE id = ?`,
    [row.aadhaar_masked, userId]
  );

  return {
    verified: true,
    maskedAadhaar: row.aadhaar_masked,
    provider: row.provider,
  };
};

module.exports = {
  KYC_ROLES,
  isMock,
  sendOtp,
  verifyOtp,
  maskAadhaar,
  normalizeAadhaar,
};
