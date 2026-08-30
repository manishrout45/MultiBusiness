// Notification service — in-app + push stubs
const db = require('../config/db');

const createNotification = async ({ userId, title, message, type = 'info', link = null }) => {
  const [result] = await db.query(
    `INSERT INTO notifications (user_id, title, message, type, link)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, title, message, type, link]
  );
  return result.insertId;
};

const getUserNotifications = async (userId, limit = 50) => {
  const [rows] = await db.query(
    `SELECT * FROM notifications WHERE user_id = ?
     ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows;
};

const markAsRead = async (userId, notificationId) => {
  await db.query(
    `UPDATE notifications SET is_read = 1
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

const markAllAsRead = async (userId) => {
  await db.query(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
