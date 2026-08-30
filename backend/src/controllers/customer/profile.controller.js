const db = require('../../config/db');

const PROFILE_FIELDS =
  'id, name, email, phone, role, status, avatar, email_verified, phone_verified, created_at, updated_at';

const getProfile = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT ${PROFILE_FIELDS} FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    await db.query(
      `UPDATE users
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           avatar = COALESCE(?, avatar)
       WHERE id = ?`,
      [name || null, phone || null, avatar || null, req.user.id]
    );
    const [rows] = await db.query(
      `SELECT ${PROFILE_FIELDS} FROM users WHERE id = ?`,
      [req.user.id]
    );
    res.json({ message: 'Profile updated', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
