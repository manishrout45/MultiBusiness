const config = require('../config/constants');

const authorizeAdminOrManager = (req, res, next) => {
  const allowed = [config.roles.SUPER_ADMIN, config.roles.BUSINESS_MANAGER];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== config.roles.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

module.exports = { authorizeAdminOrManager, authorizeSuperAdmin };
