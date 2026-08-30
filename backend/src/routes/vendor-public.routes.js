const router = require('express').Router();
const { optionalAuth } = require('../middleware/optionalAuth');
const { upload } = require('../middleware/upload');
const registerController = require('../controllers/vendor/register.controller');

router.post(
  '/register',
  optionalAuth,
  (req, res, next) => {
    req.uploadFolder = 'businesses';
    next();
  },
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 },
  ]),
  registerController.register
);

module.exports = router;
