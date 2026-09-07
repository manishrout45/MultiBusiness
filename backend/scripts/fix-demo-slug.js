require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/config/db');

(async () => {
  await db.query(
    `UPDATE businesses
     SET slug = 'demo-retail-store'
     WHERE id = 1 AND (slug IS NULL OR slug = '')`
  );
  const [b] = await db.query(
    'SELECT id, business_name, slug, status FROM businesses WHERE id = 1'
  );
  console.log('business', b[0]);
  const [p] = await db.query(
    `SELECT id, name, status FROM products WHERE business_id = 1 AND status = 'published'`
  );
  console.log(
    'published',
    p.length,
    p.map((x) => x.name).join(' | ')
  );
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
