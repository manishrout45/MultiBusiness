const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
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

const markRead = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Notification id is required' });
    }
    await markAsRead(req.user.id, id);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listNotifications,
  markRead,
  markAllRead,
};
