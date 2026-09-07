require('dotenv').config();
const db = require('./src/config/db');

(async () => {
  const [ping] = await db.query('SELECT 1 AS ok');
  const [fees] = await db.query(
    `SELECT setting_key, setting_value FROM platform_settings
     WHERE setting_key IN ('delivery_fee', 'platform_fee')`
  );
  const [cols] = await db.query(`SHOW COLUMNS FROM orders LIKE 'delivery_fee'`);
  const [varCol] = await db.query(`SHOW COLUMNS FROM order_items LIKE 'variation_id'`);
  const [biz] = await db.query(
    `SELECT COUNT(*) AS c FROM businesses
     WHERE status = 'approved' AND latitude IS NOT NULL AND longitude IS NOT NULL`
  );
  const [prods] = await db.query(
    `SELECT COUNT(*) AS c FROM products WHERE status = 'published'`
  );
  console.log(
    JSON.stringify(
      {
        dbOk: ping[0].ok,
        fees,
        hasDeliveryCol: cols.length > 0,
        hasVariationCol: varCol.length > 0,
        approvedBizWithCoords: biz[0].c,
        publishedProducts: prods[0].c,
      },
      null,
      2
    )
  );
  process.exit(0);
})().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});
