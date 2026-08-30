const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireApprovedVendor } = require('../middleware/vendorApproval');
const config = require('../config/constants');
const common = require('../controllers/common');
const vendorProducts = require('../controllers/vendor/product.controller');

router.get('/businesses', common.businessController.searchBusinesses);
router.get('/businesses/:id', common.businessController.getBusiness);
router.get('/businesses/:id/products', common.businessController.getBusinessProducts);
router.get('/products', common.productController.searchProducts);
router.post(
  '/products',
  authenticate,
  authorize(config.roles.VENDOR),
  requireApprovedVendor,
  vendorProducts.createProduct
);
router.put(
  '/products/:id',
  authenticate,
  authorize(config.roles.VENDOR),
  requireApprovedVendor,
  vendorProducts.updateProduct
);
router.delete(
  '/products/:id',
  authenticate,
  authorize(config.roles.VENDOR),
  requireApprovedVendor,
  vendorProducts.deleteProduct
);
router.get('/products/:id', common.productController.getProduct);
router.get('/categories', common.categoryController.listCategories);
router.get('/categories/:slug', common.categoryController.getCategory);
router.get('/featured', common.businessController.featuredBusinesses);
router.get('/offers', common.offerController.publicOffers);

module.exports = router;
