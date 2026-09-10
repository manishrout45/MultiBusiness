require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');

(async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS review_images (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      review_id INT UNSIGNED NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_review_images_review (review_id),
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS content_reports (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      reporter_id INT UNSIGNED NOT NULL,
      target_type ENUM('product','business','user','review') NOT NULL,
      target_id INT UNSIGNED NOT NULL,
      reason VARCHAR(100) NOT NULL,
      details TEXT NULL,
      status ENUM('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
      resolved_by INT UNSIGNED NULL,
      resolution_note TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_reports_status (status),
      INDEX idx_reports_target (target_type, target_id),
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_threads (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      customer_id INT UNSIGNED NOT NULL,
      business_id INT UNSIGNED NULL,
      assignee_id INT UNSIGNED NULL,
      subject VARCHAR(200) NULL,
      status ENUM('open','closed') NOT NULL DEFAULT 'open',
      last_message_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_chat_customer (customer_id),
      INDEX idx_chat_business (business_id),
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      thread_id INT UNSIGNED NOT NULL,
      sender_id INT UNSIGNED NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_chat_msg_thread (thread_id),
      FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  console.log('Migration 008: review images + reports + chat');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
