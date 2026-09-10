require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');
const { ensureFreePlan } = require('../src/services/freeListing.service');

(async () => {
  await ensureFreePlan();

  await db.query(
    `INSERT INTO platform_settings (setting_key, setting_value)
     SELECT 'free_listing_quota', '20'
     WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE setting_key = 'free_listing_quota')`
  );

  console.log('Migration 007: free listing plan + quota=20');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
