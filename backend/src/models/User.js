// User model — placeholder for MySQL queries
const db = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ name, email, phone, password, role }) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, password, role || 'customer']
    );
    return result.insertId;
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  },

  updatePassword: async (id, password) => {
    await db.query('UPDATE users SET password = ? WHERE id = ?', [password, id]);
  },

  setResetToken: async (id, token, expires) => {
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [token, expires, id]
    );
  },

  findByResetToken: async (token) => {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  clearResetToken: async (id) => {
    await db.query(
      'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [id]
    );
  },

  list: async ({ role, status, limit = 50, offset = 0 } = {}) => {
    let sql = 'SELECT id, name, email, phone, role, status, email_verified, phone_verified, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(sql, params);
    return rows;
  },

  updateProfile: async (id, { name, phone, avatar }) => {
    await db.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?',
      [name || null, phone || null, avatar || null, id]
    );
  },
};

module.exports = User;
