module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  defaultCommissionRate: Number(process.env.DEFAULT_COMMISSION_RATE) || 5,
  /** Active now: cloudinary. After deploy: digitalocean (Spaces). */
  storageProvider: (process.env.STORAGE_PROVIDER || 'cloudinary').toLowerCase(),
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10485760,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  roles: {
    SUPER_ADMIN: 'super_admin',
    BUSINESS_MANAGER: 'business_manager',
    VENDOR: 'vendor',
    CUSTOMER: 'customer',
  },
  businessTypes: [
    'Retail Store',
    'Restaurant',
    'Real Estate',
    'Agency',
    'Coaching Center',
    'Hospital',
    'Travel Agency',
    'Caterer',
    'Freelancer',
    'Service Provider',
  ],
  subscriptionPlans: {
    basic: { name: 'Basic', monthlyFee: 499 },
    standard: { name: 'Standard', monthlyFee: 999 },
    premium: { name: 'Premium', monthlyFee: 1999 },
    enterprise: { name: 'Enterprise', monthlyFee: 4999 },
  },
};
