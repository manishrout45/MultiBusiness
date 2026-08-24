const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const config = require('../config/constants');
const manager = require('../controllers/manager');

router.use(authenticate, authorize(config.roles.BUSINESS_MANAGER, config.roles.SUPER_ADMIN));

router.get('/dashboard', manager.dashboardController.getDashboard);
router.get('/vendors', manager.vendorController.listVendors);
router.get('/vendors/:id', manager.vendorController.getVendor);
router.patch('/vendors/:id/verify', manager.vendorController.verifyDocuments);
router.patch('/vendors/:id/recommend', manager.vendorController.recommendApproval);
router.get('/products/pending', manager.productController.listPendingProducts);
router.patch('/products/:id/approve', manager.productController.approveProduct);
router.patch('/products/:id/reject', manager.productController.rejectProduct);
router.get('/orders', manager.orderController.monitorOrders);
router.get('/disputes', manager.disputeController.listDisputes);
router.patch('/disputes/:id', manager.disputeController.resolveDispute);
router.get('/complaints', manager.complaintController.listComplaints);
router.patch('/complaints/:id', manager.complaintController.handleComplaint);
router.get('/promotions', manager.promotionController.listPromotions);
router.post('/promotions', manager.promotionController.createPromotion);
router.patch('/promotions/:id', manager.promotionController.updatePromotion);
router.get('/ads', manager.adController.listAds);
router.post('/ads', manager.adController.createAd);
router.patch('/ads/:id', manager.adController.updateAd);
router.get('/reviews', manager.reviewController.listReviews);
router.patch('/reviews/:id/moderate', manager.reviewController.moderateReview);
router.get('/reports', manager.reportController.generateReports);
router.get('/analytics', manager.analyticsController.getAnalytics);
router.get('/notifications', manager.notificationController.listNotifications);
router.post('/notifications', manager.notificationController.sendNotification);
router.get('/support', manager.supportController.listTickets);
router.patch('/support/:id', manager.supportController.updateTicket);

module.exports = router;
