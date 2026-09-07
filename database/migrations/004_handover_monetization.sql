-- Pending subscriptions, wallet top-ups, lead charges, auth OTPs

ALTER TABLE business_subscriptions
  MODIFY status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'active';

CREATE TABLE IF NOT EXISTS wallet_topups (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  gateway_order_id VARCHAR(100) NOT NULL,
  receipt VARCHAR(100) NOT NULL,
  payment_id VARCHAR(100) NULL,
  status ENUM('pending','completed','failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wallet_topup_gateway (gateway_order_id),
  UNIQUE KEY uk_wallet_topup_receipt (receipt),
  INDEX idx_wallet_topup_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lead_charges (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  business_id INT UNSIGNED NOT NULL,
  inquiry_id INT UNSIGNED NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','charged','waived') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lead_business (business_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_otps (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  channel ENUM('phone','email') NOT NULL,
  destination VARCHAR(191) NOT NULL,
  code_hash VARCHAR(128) NOT NULL,
  purpose VARCHAR(40) NOT NULL DEFAULT 'login',
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otp_lookup (channel, destination, purpose),
  INDEX idx_otp_expires (expires_at)
) ENGINE=InnoDB;

-- Best-effort unique reference for idempotent wallet credits (ignore if exists / duplicates)
-- ALTER TABLE wallet_transactions ADD UNIQUE KEY uk_wallet_tx_reference (reference_id);
