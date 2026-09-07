const jwt = require('jsonwebtoken');
const config = require('../config/constants');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate };
