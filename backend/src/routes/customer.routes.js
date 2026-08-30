const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validateBody } = require('../middleware/validate');
const config = require('../config/constants');
const customer = require('../controllers/customer');

router.use(authenticate, authorize(config.roles.CUSTOMER));

router.get('/profile', customer.profileController.getProfile);
router.put('/profile', customer.profileController.updateProfile);
router.get('/wishlist', customer.wishlistController.listWishlist);
router.post('/wishlist', customer.wishlistController.addToWishlist);
router.delete('/wishlist/:productId', customer.wishlistController.removeFromWishlist);
router.get('/cart', customer.cartController.getCart);
router.post('/cart', customer.cartController.addToCart);
router.patch('/cart/:itemId', customer.cartController.updateCartItem);
router.delete('/cart/:itemId', customer.cartController.removeFromCart);
router.post(
  '/checkout',
  validateBody(['shippingAddress', 'phone', 'paymentMethod']),
  customer.orderController.checkout
);
router.get('/orders', customer.orderController.listOrders);
router.get('/orders/:id', customer.orderController.getOrder);
router.get('/orders/:id/track', customer.orderController.trackOrder);
router.post('/reviews', validateBody(['rating']), customer.reviewController.createReview);
router.get('/purchase-history', customer.orderController.purchaseHistory);
router.post('/support', customer.supportController.createTicket);
router.get('/support', customer.supportController.listTickets);
router.get('/notifications', customer.notificationController.listNotifications);
router.patch('/notifications/:id/read', customer.notificationController.markRead);
router.patch('/notifications/read-all', customer.notificationController.markAllRead);
router.post('/inquiries', customer.inquiryController.createInquiry);
router.get('/wallet', customer.walletController.getWallet);
router.post('/wallet/topup', customer.walletController.topUpWallet);
router.get('/orders/:id/invoice', customer.orderController.getInvoice);

module.exports = router;
