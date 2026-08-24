const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorizeAdminOrManager, authorizeSuperAdmin } = require('../middleware/adminAccess');
const admin = require('../controllers/admin');

router.use(authenticate);

// Platform overview — super admin only (business managers use vendor/catalog sections)
router.get('/dashboard', authorizeAdminOrManager, admin.dashboardController.getDashboard);
router.get('/users', authorizeSuperAdmin, admin.userController.listUsers);
router.patch('/users/:id/status', authorizeSuperAdmin, admin.userController.updateUserStatus);
router.get('/managers', authorizeSuperAdmin, admin.managerController.listManagers);
router.post('/managers', authorizeSuperAdmin, admin.managerController.createManager);
router.patch('/managers/:id', authorizeSuperAdmin, admin.managerController.updateManager);
router.get('/commissions', authorizeSuperAdmin, admin.commissionController.listCommissions);
router.patch('/commissions/:id', authorizeSuperAdmin, admin.commissionController.updateCommission);
router.get('/reports/sales', authorizeSuperAdmin, admin.reportController.salesReport);
router.get('/reports/revenue', authorizeSuperAdmin, admin.reportController.revenueReport);
router.get('/subscriptions', authorizeSuperAdmin, admin.subscriptionController.listPlans);
router.patch('/subscriptions/:id', authorizeSuperAdmin, admin.subscriptionController.updatePlan);
router.get('/settings', authorizeSuperAdmin, admin.settingsController.getSettings);
router.patch('/settings', authorizeSuperAdmin, admin.settingsController.updateSettings);

// Vendor & catalog management — super admin + business manager
router.get('/businesses/pending', authorizeAdminOrManager, admin.businessController.listPending);
router.get('/vendors', authorizeAdminOrManager, admin.businessController.listVendors);
router.get('/vendors/:id', authorizeAdminOrManager, admin.businessController.getVendorDetails);
router.put('/vendor/:id/status', authorizeAdminOrManager, admin.businessController.updateVendorStatus);
router.put('/vendors/:id/status', authorizeAdminOrManager, admin.businessController.updateVendorStatus);
router.patch('/businesses/:id/approve', authorizeAdminOrManager, admin.businessController.approveBusiness);
router.patch('/businesses/:id/reject', authorizeAdminOrManager, admin.businessController.rejectBusiness);
router.patch('/businesses/:id/feature', authorizeAdminOrManager, admin.businessController.featureBusiness);
router.patch('/businesses/:id/verify', authorizeAdminOrManager, admin.businessController.verifyBusiness);
router.get('/categories', authorizeAdminOrManager, admin.categoryController.listCategories);
router.post('/categories', authorizeAdminOrManager, admin.categoryController.createCategory);
router.patch('/categories/:id', authorizeAdminOrManager, admin.categoryController.updateCategory);
router.delete('/categories/:id', authorizeAdminOrManager, admin.categoryController.deleteCategory);
router.get('/products', authorizeAdminOrManager, admin.productController.monitorProducts);
router.patch('/products/:id/status', authorizeAdminOrManager, admin.productController.updateProductStatus);
router.delete('/products/:id', authorizeAdminOrManager, admin.productController.removeProduct);

const manager = require('../controllers/manager');
router.get('/orders', authorizeAdminOrManager, manager.orderController.monitorOrders);
router.get('/reviews', authorizeAdminOrManager, manager.reviewController.listReviews);
router.patch('/reviews/:id/moderate', authorizeAdminOrManager, manager.reviewController.moderateReview);
router.get('/announcements', authorizeAdminOrManager, manager.promotionController.listPromotions);
router.post('/announcements', authorizeAdminOrManager, manager.promotionController.createPromotion);
router.patch('/announcements/:id', authorizeAdminOrManager, manager.promotionController.updatePromotion);
router.get('/offers', authorizeAdminOrManager, manager.adController.listAds);
router.post('/offers', authorizeAdminOrManager, manager.adController.createAd);
router.patch('/offers/:id', authorizeAdminOrManager, manager.adController.updateAd);

module.exports = router;
