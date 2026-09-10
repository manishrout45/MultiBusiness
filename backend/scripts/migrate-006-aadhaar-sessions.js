require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');

async function addColumn(sql) {
  try {
    await db.query(sql);
    console.log('OK:', sql.slice(0, 72));
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Skip (exists):', sql.slice(0, 72));
      return;
    }
    throw err;
  }
}

(async () => {
  await addColumn(
    `ALTER TABLE users ADD COLUMN aadhaar_verified TINYINT(1) NOT NULL DEFAULT 0`
  );
  await addColumn(
    `ALTER TABLE users ADD COLUMN aadhaar_masked VARCHAR(20) NULL`
  );
  await addColumn(
    `ALTER TABLE users ADD COLUMN aadhaar_verified_at DATETIME NULL`
  );

  await db.query(`
    CREATE TABLE IF NOT EXISTS aadhaar_verifications (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      aadhaar_hash VARCHAR(64) NOT NULL,
      aadhaar_masked VARCHAR(20) NOT NULL,
      provider VARCHAR(40) NOT NULL DEFAULT 'mock',
      provider_ref VARCHAR(100) NULL,
      otp_hash VARCHAR(128) NULL,
      status ENUM('pending','verified','failed','expired') NOT NULL DEFAULT 'pending',
      attempts INT UNSIGNED NOT NULL DEFAULT 0,
      expires_at DATETIME NOT NULL,
      verified_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_aadhaar_user (user_id),
      INDEX idx_aadhaar_status (status),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      session_id VARCHAR(64) NOT NULL,
      device_id VARCHAR(100) NOT NULL,
      device_label VARCHAR(150) NULL,
      user_agent VARCHAR(255) NULL,
      ip_address VARCHAR(64) NULL,
      last_seen_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      revoked_at DATETIME NULL,
      UNIQUE KEY uk_session_id (session_id),
      INDEX idx_sessions_user (user_id),
      INDEX idx_sessions_user_device (user_id, device_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // Demo vendor + manager already trusted for local testing
  await db.query(
    `UPDATE users
     SET aadhaar_verified = 1, aadhaar_masked = 'XXXX-XXXX-0000', aadhaar_verified_at = NOW()
     WHERE email IN ('vendor@marketplace.com', 'manager@marketplace.com')
       AND aadhaar_verified = 0`
  );

  console.log('Migration 006 applied (aadhaar + device sessions)');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
