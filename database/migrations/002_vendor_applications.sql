-- Vendor applications + role catalog for existing MySQL databases
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
