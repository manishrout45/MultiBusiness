// Notification service — in-app + optional role broadcast
const db = require('../config/db');

const createNotification = async ({ userId, title, message, type = 'info', link = null }) => {
  const [result] = await db.query(
    `INSERT INTO notifications (user_id, title, message, type, link)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, title, message, type, link]
  );
  return result.insertId;
};

const notifyUsersByRoles = async ({
  roles = [],
  title,
  message,
  type = 'info',
  link = null,
  limit = 500,
}) => {
  if (!roles.length) return 0;
  const placeholders = roles.map(() => '?').join(',');
  const [users] = await db.query(
    `SELECT id FROM users
     WHERE role IN (${placeholders}) AND status = 'active'
     ORDER BY id DESC
     LIMIT ?`,
    [...roles, Number(limit)]
  );
  for (const user of users) {
    await createNotification({
      userId: user.id,
      title,
      message,
      type,
      link,
    });
  }
  return users.length;
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
  notifyUsersByRoles,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
