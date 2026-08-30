-- Add vendor approval audit trail and business slug (run on existing MySQL databases)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS slug VARCHAR(220) NULL UNIQUE AFTER business_name;

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
