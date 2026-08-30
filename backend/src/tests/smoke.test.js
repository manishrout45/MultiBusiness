/**
 * Smoke tests for marketplace API helpers (no DB required).
 * Run: node src/tests/smoke.test.js
 */
const assert = require('assert');
const { calculateCommission } = require('../services/commission.service');
const { convenienceFee } = require('../services/payment.service');
const { directionsUrl } = require('../utils/maps');
const { toCsv, buildInvoiceHtml } = require('../utils/invoice');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth.utils');

async function run() {
  const commission = calculateCommission(1000, 5);
  assert.strictEqual(commission.commissionAmount, 50);
  assert.strictEqual(commission.vendorAmount, 950);

  const fee = convenienceFee(1000, 2);
  assert.strictEqual(fee.fee, 20);
  assert.strictEqual(fee.total, 1020);

  assert.ok(directionsUrl(20.2, 85.8).includes('destination=20.2,85.8'));

  const csv = toCsv([{ a: 1, b: 'x,y' }]);
  assert.ok(csv.includes('"x,y"'));

  const html = buildInvoiceHtml(
    {
      order_number: 'ORD-1',
      shipping_address: 'Test',
      phone: '999',
      payment_method: 'cod',
      payment_status: 'pending',
      total_amount: 100,
      commission_amount: 5,
    },
    [{ product_name: 'Item', quantity: 1, unit_price: 100, total_price: 100 }],
    { business_name: 'Shop' }
  );
  assert.ok(html.includes('ORD-1'));

  const hashed = await hashPassword('Admin@123');
  assert.ok(await comparePassword('Admin@123', hashed));

  const token = generateToken({ id: 1, role: 'customer', email: 'a@b.com' });
  assert.ok(typeof token === 'string' && token.length > 20);

  console.log('All smoke tests passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
