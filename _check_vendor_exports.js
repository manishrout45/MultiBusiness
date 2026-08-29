const vendor = require('./backend/src/controllers/vendor');
const needed = {
  dashboardController: ['getDashboard'],
  businessController: ['getProfile', 'updateProfile', 'uploadLogo', 'uploadCover'],
  galleryController: ['listGallery', 'addMedia', 'deleteMedia'],
  productController: ['listProducts', 'createProduct', 'updateProduct', 'deleteProduct'],
  orderController: ['listOrders', 'updateOrderStatus'],
  inquiryController: ['listInquiries', 'replyInquiry'],
  leadController: ['listLeads'],
  reviewController: ['listReviews'],
  offerController: ['listOffer', 'createOffer'],
  refundController: ['listRefunds', 'handleRefund'],
  analyticsController: ['getAnalytics'],
  reportController: ['salesReports'],
  subscriptionController: ['getSubscription', 'subscribe'],
  membershipController: ['listPlans', 'createPlan'],
  notificationController: ['listNotifications', 'markRead', 'markAllRead'],
  exportController: ['exportCustomers', 'exportSales'],
};

for (const [ctrl, methods] of Object.entries(needed)) {
  const obj = vendor[ctrl];
  if (!obj) {
    console.log('MISSING CTRL', ctrl);
    continue;
  }
  for (const m of methods) {
    if (typeof obj[m] !== 'function') console.log('MISSING', ctrl + '.' + m, 'have', Object.keys(obj));
  }
}
