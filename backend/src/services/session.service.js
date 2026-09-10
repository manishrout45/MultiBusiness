const crypto = require('crypto');
const db = require('../config/db');

/** Reads MAX_DEVICES_PER_USER from .env on every call (any positive integer). */
const MAX_DEVICES = () => {
  const raw = process.env.MAX_DEVICES_PER_USER;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1) return Math.floor(n);
  return 2; // only if env missing/invalid
};

const hashToken = (value) =>
  crypto.createHash('sha256').update(String(value)).digest('hex');

const listActive = async (userId) => {
  const [rows] = await db.query(
    `SELECT id, session_id, device_id, device_label, user_agent, ip_address,
            last_seen_at, created_at
     FROM user_sessions
     WHERE user_id = ? AND revoked_at IS NULL
     ORDER BY created_at ASC, last_seen_at ASC`,
    [userId]
  );
  return rows;
};

const revokeSessionRow = async (id) => {
  await db.query('UPDATE user_sessions SET revoked_at = NOW() WHERE id = ?', [id]);
};

const revokeBySessionId = async (sessionId) => {
  await db.query(
    'UPDATE user_sessions SET revoked_at = NOW() WHERE session_id = ? AND revoked_at IS NULL',
    [sessionId]
  );
};

const revokeOldest = async (userId) => {
  const active = await listActive(userId);
  if (!active.length) return null;
  await revokeSessionRow(active[0].id);
  return active[0];
};

/**
 * Register or refresh a device session. Enforces MAX_DEVICES_PER_USER from env.
 * @returns {{ sessionId, replacedOldest?: boolean }}
 */
const createOrRefreshSession = async ({
  userId,
  deviceId,
  deviceLabel,
  userAgent,
  ip,
  force = false,
}) => {
  const cleanDeviceId = String(deviceId || '').trim().slice(0, 100);
  if (!cleanDeviceId) {
    const err = new Error('deviceId is required');
    err.statusCode = 400;
    err.code = 'DEVICE_ID_REQUIRED';
    throw err;
  }

  const [existing] = await db.query(
    `SELECT * FROM user_sessions
     WHERE user_id = ? AND device_id = ? AND revoked_at IS NULL
     LIMIT 1`,
    [userId, cleanDeviceId]
  );

  if (existing[0]) {
    const sessionId = existing[0].session_id;
    await db.query(
      `UPDATE user_sessions
       SET last_seen_at = NOW(),
           device_label = COALESCE(?, device_label),
           user_agent = COALESCE(?, user_agent),
           ip_address = COALESCE(?, ip_address)
       WHERE id = ?`,
      [deviceLabel || null, userAgent || null, ip || null, existing[0].id]
    );
    return { sessionId, replacedOldest: false };
  }

  let active = await listActive(userId);
  let replacedOldest = false;

  if (active.length >= MAX_DEVICES()) {
    if (!force) {
      const err = new Error(
        `This account is already signed in on ${MAX_DEVICES()} devices. Sign out from another device, or continue to replace the oldest session.`
      );
      err.statusCode = 403;
      err.code = 'DEVICE_LIMIT';
      err.devices = active.map((s) => ({
        deviceId: s.device_id,
        deviceLabel: s.device_label,
        lastSeenAt: s.last_seen_at,
      }));
      throw err;
    }
    // Force: kick oldest until there is room for this device
    while ((await listActive(userId)).length >= MAX_DEVICES()) {
      const kicked = await revokeOldest(userId);
      if (!kicked) break;
      replacedOldest = true;
    }
    active = await listActive(userId);
  }

  const sessionId = crypto.randomUUID();
  try {
    await db.query(
      `INSERT INTO user_sessions
       (user_id, session_id, device_id, device_label, user_agent, ip_address, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        sessionId,
        cleanDeviceId,
        deviceLabel || null,
        userAgent ? String(userAgent).slice(0, 255) : null,
        ip || null,
      ]
    );
  } catch (err) {
    // Unique quirks with revoked_at NULL — retry as refresh
    if (err.code === 'ER_DUP_ENTRY') {
      const [again] = await db.query(
        `SELECT session_id FROM user_sessions
         WHERE user_id = ? AND device_id = ? AND revoked_at IS NULL LIMIT 1`,
        [userId, cleanDeviceId]
      );
      if (again[0]) return { sessionId: again[0].session_id, replacedOldest };
    }
    throw err;
  }

  return { sessionId, replacedOldest };
};

const assertSessionActive = async (userId, sessionId) => {
  if (!sessionId) {
    const err = new Error('Session expired. Please sign in again.');
    err.statusCode = 401;
    err.code = 'SESSION_REQUIRED';
    throw err;
  }
  const [rows] = await db.query(
    `SELECT id FROM user_sessions
     WHERE user_id = ? AND session_id = ? AND revoked_at IS NULL
     LIMIT 1`,
    [userId, sessionId]
  );
  if (!rows[0]) {
    const err = new Error('Signed out on this device (limit or remote logout). Please sign in again.');
    err.statusCode = 401;
    err.code = 'SESSION_REVOKED';
    throw err;
  }
  await db.query('UPDATE user_sessions SET last_seen_at = NOW() WHERE id = ?', [
    rows[0].id,
  ]);
};

module.exports = {
  MAX_DEVICES,
  hashToken,
  listActive,
  revokeSessionRow,
  revokeBySessionId,
  revokeOldest,
  createOrRefreshSession,
  assertSessionActive,
};
