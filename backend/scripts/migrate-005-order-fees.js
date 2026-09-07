require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');

async function addColumn(sql) {
  try {
    await db.query(sql);
    console.log('OK:', sql.slice(0, 70));
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Skip (exists):', sql.slice(0, 70));
      return;
    }
    throw err;
  }
}

(async () => {
  await addColumn(
    `ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0`
  );
  await addColumn(
    `ALTER TABLE orders ADD COLUMN platform_fee DECIMAL(12, 2) NOT NULL DEFAULT 0`
  );
  await addColumn(
    `ALTER TABLE orders ADD COLUMN subtotal_amount DECIMAL(12, 2) NULL`
  );
  await addColumn(
    `ALTER TABLE order_items ADD COLUMN variation_id INT UNSIGNED NULL`
  );

  await db.query(
    `INSERT INTO platform_settings (setting_key, setting_value)
     SELECT 'delivery_fee', '40'
     WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE setting_key = 'delivery_fee')`
  );
  await db.query(
    `INSERT INTO platform_settings (setting_key, setting_value)
     SELECT 'platform_fee', '0'
     WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE setting_key = 'platform_fee')`
  );

  console.log('Migration 005 applied');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
