const jwt = require('jsonwebtoken');
const config = require('../config/constants');

/** Attach req.user when a valid Bearer token is present; otherwise continue anonymously. */
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { optionalAuth };
