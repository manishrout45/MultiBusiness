const db = require('../../config/db');
const {
  createNotification,
  getUserNotifications,
} = require('../../services/notification.service');

const listNotifications = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const notifications = await getUserNotifications(req.user.id, limit);
    res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
};

const sendNotification = async (req, res, next) => {
  try {
    const userId = req.body.userId ?? req.body.user_id;
    const title = req.body.title;
    const message = req.body.message;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }

    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!users[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notificationId = await createNotification({
      userId,
      title,
      message,
      type: req.body.type || 'info',
      link: req.body.link || null,
    });

    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [notificationId]);
    res.status(201).json({ message: 'Notification sent', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listNotifications,
  sendNotification,
};
