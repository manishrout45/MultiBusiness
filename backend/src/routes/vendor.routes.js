const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireApprovedVendor } = require('../middleware/vendorApproval');
const { upload } = require('../middleware/upload');
const config = require('../config/constants');
const vendor = require('../controllers/vendor');

router.use(authenticate, authorize(config.roles.VENDOR));

router.get('/dashboard', vendor.dashboardController.getDashboard);
router.get('/profile', vendor.businessController.getProfile);
router.put('/profile', vendor.businessController.updateProfile);
router.post('/profile/logo', (req, res, next) => {
  req.uploadFolder = 'businesses';
  next();
}, upload.single('logo'), vendor.businessController.uploadLogo);
router.post('/profile/cover', (req, res, next) => {
  req.uploadFolder = 'businesses';
  next();
}, upload.single('cover'), vendor.businessController.uploadCover);
router.get('/gallery', vendor.galleryController.listGallery);
router.post('/gallery', (req, res, next) => {
  req.uploadFolder = 'businesses';
  next();
}, upload.single('media'), vendor.galleryController.addMedia);
router.delete('/gallery/:id', vendor.galleryController.deleteMedia);

router.get('/products', vendor.productController.listProducts);
router.post('/products', requireApprovedVendor, vendor.productController.createProduct);
router.put('/products/:id', requireApprovedVendor, vendor.productController.updateProduct);
router.delete('/products/:id', requireApprovedVendor, vendor.productController.deleteProduct);

router.get('/orders', vendor.orderController.listOrders);
router.patch('/orders/:id/status', vendor.orderController.updateOrderStatus);
router.get('/inquiries', vendor.inquiryController.listInquiries);
router.post('/inquiries/:id/reply', vendor.inquiryController.replyInquiry);
router.get('/leads', vendor.leadController.listLeads);
router.get('/reviews', vendor.reviewController.listReviews);
router.get('/offers', vendor.offerController.listOffers);
router.post('/offers', requireApprovedVendor, vendor.offerController.createOffer);
router.get('/refunds', vendor.refundController.listRefunds);
router.patch('/refunds/:id', vendor.refundController.handleRefund);
router.get('/analytics', vendor.analyticsController.getAnalytics);
router.get('/sales-reports', vendor.reportController.salesReports);
router.get('/subscription', vendor.subscriptionController.getSubscription);
router.post('/subscription', vendor.subscriptionController.subscribe);
router.get('/memberships', vendor.membershipController.listPlans);
router.post('/memberships', requireApprovedVendor, vendor.membershipController.createPlan);
router.get('/notifications', vendor.notificationController.listNotifications);
router.patch('/notifications/:id/read', vendor.notificationController.markRead);
router.patch('/notifications/read-all', vendor.notificationController.markAllRead);
router.get('/export/customers', vendor.exportController.exportCustomers);
router.get('/export/sales', vendor.exportController.exportSales);

module.exports = router;
