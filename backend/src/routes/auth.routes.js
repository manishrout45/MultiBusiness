const authController = require('../controllers/auth/auth.controller');
const aadhaarController = require('../controllers/auth/aadhaar.controller');
const { authenticate } = require('../middleware/auth');
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
router.post('/google', authController.googleLogin);
router.post('/phone/send-otp', authController.sendPhoneOtp);
router.post('/phone/verify-otp', authController.verifyPhoneOtp);
router.post('/email/send-otp', authController.sendEmailOtp);
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-mobile', authController.verifyMobile);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);
router.get('/me', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);
router.get('/sessions', authenticate, authController.listSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);

router.get('/aadhaar/status', authenticate, aadhaarController.getAadhaarStatus);
router.post('/aadhaar/send-otp', authenticate, aadhaarController.sendAadhaarOtp);
router.post('/aadhaar/verify-otp', authenticate, aadhaarController.verifyAadhaarOtp);

module.exports = router;
