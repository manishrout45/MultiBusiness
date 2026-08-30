const { validationResult } = require('express-validator');

/** express-validator result middleware (auth / form validators) */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path || e.param,
        message: e.msg,
      })),
    });
  }
  next();
};

/** Simple required-body-field check for JSON APIs */
const validateBody = (fields = []) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body?.[field];
    return value === undefined || value === null || (typeof value === 'string' && !value.trim());
  });
  if (missing.length) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }
  next();
};

module.exports = { validate, validateBody };
