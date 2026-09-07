-- Delivery / platform fee columns + variation on order lines
-- Apply via: node scripts/migrate-005-order-fees.js

ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN platform_fee DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN subtotal_amount DECIMAL(12, 2) NULL;
ALTER TABLE order_items ADD COLUMN variation_id INT UNSIGNED NULL;

INSERT INTO platform_settings (setting_key, setting_value)
SELECT 'delivery_fee', '40'
WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE setting_key = 'delivery_fee');

INSERT INTO platform_settings (setting_key, setting_value)
SELECT 'platform_fee', '0'
WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE setting_key = 'platform_fee');
