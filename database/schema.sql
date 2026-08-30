-- Multi-Business Marketplace Platform — MySQL Schema
-- Database: marketplace_db

CREATE DATABASE IF NOT EXISTS marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marketplace_db;

-- Users (all roles)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'business_manager', 'vendor', 'customer') NOT NULL DEFAULT 'customer',
  email_verified TINYINT(1) DEFAULT 0,
  phone_verified TINYINT(1) DEFAULT 0,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  avatar VARCHAR(255) NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  parent_id INT UNSIGNED NULL,
  description TEXT NULL,
  image VARCHAR(255) NULL,
  theme_color VARCHAR(7) NULL DEFAULT '#152651',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Business managers assignment (region / category)
CREATE TABLE IF NOT EXISTS manager_assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  manager_id INT UNSIGNED NOT NULL,
  region VARCHAR(100) NULL,
  category_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Businesses / Vendors
CREATE TABLE IF NOT EXISTS businesses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id INT UNSIGNED NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NULL UNIQUE,
  business_type VARCHAR(100) NOT NULL,
  category_id INT UNSIGNED NULL,
  description TEXT NULL,
  logo VARCHAR(255) NULL,
  cover_image VARCHAR(255) NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NULL,
  pincode VARCHAR(20) NULL,
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NULL,
  email VARCHAR(191) NULL,
  website VARCHAR(255) NULL,
  gst_number VARCHAR(50) NULL,
  registration_number VARCHAR(100) NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  facebook_url VARCHAR(255) NULL,
  instagram_url VARCHAR(255) NULL,
  linkedin_url VARCHAR(255) NULL,
  youtube_url VARCHAR(255) NULL,
  twitter_url VARCHAR(255) NULL,
  working_hours JSON NULL,
  is_featured TINYINT(1) DEFAULT 0,
  is_verified TINYINT(1) DEFAULT 0,
  status ENUM('pending', 'recommended', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  rejection_reason TEXT NULL,
  recommended_by INT UNSIGNED NULL,
  approved_by INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_business_status (status),
  INDEX idx_business_city (city),
  INDEX idx_business_featured (is_featured)
) ENGINE=InnoDB;

-- Vendor approval audit trail
CREATE TABLE IF NOT EXISTS vendor_approvals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  previous_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  action_by INT UNSIGNED NULL,
  reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_vendor_approval_business (business_id)
) ENGINE=InnoDB;

-- Role catalog (JWT still uses users.role enum)
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (slug, name, description) VALUES
  ('super_admin', 'Super Admin', 'Full platform control'),
  ('business_manager', 'Business Manager', 'Manages businesses, categories, and regions'),
  ('vendor', 'Vendor', 'Manages own business'),
  ('customer', 'Customer', 'Marketplace shopper');

-- Vendor applications (Become a Seller)
CREATE TABLE IF NOT EXISTS vendor_applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  business_id INT UNSIGNED NULL,
  owner_name VARCHAR(150) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NULL,
  pincode VARCHAR(20) NULL,
  gst_number VARCHAR(50) NULL,
  logo VARCHAR(255) NULL,
  cover_image VARCHAR(255) NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL,
  INDEX idx_vendor_app_status (status),
  INDEX idx_vendor_app_user (user_id)
) ENGINE=InnoDB;

-- Business documents for verification
CREATE TABLE IF NOT EXISTS business_documents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Business gallery
CREATE TABLE IF NOT EXISTS business_gallery (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  media_type ENUM('image', 'video') DEFAULT 'image',
  file_path VARCHAR(255) NOT NULL,
  caption VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Certifications & awards
CREATE TABLE IF NOT EXISTS business_certifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  issuer VARCHAR(200) NULL,
  file_path VARCHAR(255) NULL,
  issued_at DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Products / Services
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NULL,
  description TEXT NULL,
  price DECIMAL(12, 2) NOT NULL,
  sale_price DECIMAL(12, 2) NULL,
  stock INT DEFAULT 0,
  sku VARCHAR(100) NULL,
  delivery_available TINYINT(1) DEFAULT 1,
  status ENUM('draft', 'pending', 'published', 'rejected', 'out_of_stock') DEFAULT 'draft',
  views INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_product_status (status),
  INDEX idx_product_business (business_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  media_type ENUM('image', 'video') DEFAULT 'image',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_variations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  variation_name VARCHAR(100) NOT NULL,
  variation_value VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(12, 2) DEFAULT 0,
  stock INT DEFAULT 0,
  sku VARCHAR(100) NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlists (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cart
CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  variation_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_cart (user_id, product_id, variation_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT UNSIGNED NOT NULL,
  business_id INT UNSIGNED NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  commission_amount DECIMAL(12, 2) DEFAULT 0,
  payment_method ENUM('upi', 'credit_card', 'debit_card', 'net_banking', 'cod', 'wallet') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  order_status ENUM('placed', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'placed',
  shipping_address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  tracking_number VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  INDEX idx_order_status (order_status),
  INDEX idx_order_customer (customer_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  gateway_payment_id VARCHAR(191) NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  gateway_response JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

-- Wallet
CREATE TABLE IF NOT EXISTS wallets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  balance DECIMAL(12, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wallet_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  description VARCHAR(255) NULL,
  reference_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  business_id INT UNSIGNED NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  monthly_fee DECIMAL(10, 2) NOT NULL,
  yearly_fee DECIMAL(10, 2) NULL,
  features JSON NULL,
  max_products INT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS business_subscriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  plan_id INT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
) ENGINE=InnoDB;

-- Commission settings
CREATE TABLE IF NOT EXISTS commission_settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NULL,
  business_id INT UNSIGNED NULL,
  rate DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Offers & Discounts
CREATE TABLE IF NOT EXISTS offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  discount_type ENUM('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Advertisements
CREATE TABLE IF NOT EXISTS advertisements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  ad_type ENUM('homepage_banner', 'category_banner', 'product_promo', 'push') NOT NULL,
  image_path VARCHAR(255) NULL,
  link_url VARCHAR(255) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  amount DECIMAL(10, 2) NULL,
  status ENUM('pending', 'active', 'expired', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Customer inquiries / leads
CREATE TABLE IF NOT EXISTS inquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NULL,
  product_id INT UNSIGNED NULL,
  name VARCHAR(150) NULL,
  email VARCHAR(191) NULL,
  phone VARCHAR(20) NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'replied', 'closed') DEFAULT 'new',
  reply TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Product visitors (lead tracking)
CREATE TABLE IF NOT EXISTS product_visitors (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  visitor_id INT UNSIGNED NULL,
  ip_address VARCHAR(45) NULL,
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Refunds / Returns
CREATE TABLE IF NOT EXISTS refunds (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  reason TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('requested', 'approved', 'rejected', 'processed') DEFAULT 'requested',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  assigned_to INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Disputes & Complaints
CREATE TABLE IF NOT EXISTS disputes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NULL,
  business_id INT UNSIGNED NULL,
  raised_by INT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
  resolution TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL,
  FOREIGN KEY (raised_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  link VARCHAR(255) NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Platform settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Promotions / Campaigns
CREATE TABLE IF NOT EXISTS promotions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  region VARCHAR(100) NULL,
  category_id INT UNSIGNED NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  created_by INT UNSIGNED NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
