require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');

(async () => {
  await db.query(
    `UPDATE users
     SET email_verified = 1
     WHERE email IN (?, ?, ?, ?)`,
    [
      'admin@marketplace.com',
      'manager@marketplace.com',
      'vendor@marketplace.com',
      'customer@marketplace.com',
    ]
  );
  const [rows] = await db.query(
    `SELECT email, email_verified FROM users ORDER BY id ASC LIMIT 12`
  );
  console.log(rows);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
