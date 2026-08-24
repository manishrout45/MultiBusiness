const authController = require('../controllers/auth/auth.controller');
const { validate } = require('../middleware/validate');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth.validator');

const router = require('express').Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-mobile', authController.verifyMobile);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);
router.get('/me', require('../middleware/auth').authenticate, authController.getProfile);

module.exports = router;
