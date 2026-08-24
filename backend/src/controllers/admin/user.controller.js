const User = require('../../models/User');

const listUsers = async (req, res, next) => {
  try {
    const { role, status, limit, offset } = req.query;
    const users = await User.list({
      role: role || undefined,
      status: status || undefined,
      limit: limit || 50,
      offset: offset || 0,
    });
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.updateStatus(id, status);
    const updated = await User.findById(id);
    res.json({ message: 'User status updated', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  updateUserStatus,
};
