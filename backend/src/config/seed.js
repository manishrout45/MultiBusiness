require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'marketplace_db',
    multipleStatements: true,
  });

  const adminHash = await bcrypt.hash('Admin@123', 10);
  const managerHash = await bcrypt.hash('Manager@123', 10);
  const vendorHash = await bcrypt.hash('Vendor@123', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);

  console.log('Seeding subscription plans...');
  await connection.query(`
    INSERT IGNORE INTO subscription_plans (name, slug, monthly_fee, yearly_fee, features, max_products) VALUES
    ('Basic', 'basic', 499.00, 4990.00, '["Digital storefront","Product listings","Business profile"]', 50),
    ('Standard', 'standard', 999.00, 9990.00, '["Everything in Basic","Analytics dashboard","Priority support"]', 200),
    ('Premium', 'premium', 1999.00, 19990.00, '["Everything in Standard","Marketing tools","Featured listing discount"]', 500),
    ('Enterprise', 'enterprise', 4999.00, 49990.00, '["Everything in Premium","Dedicated manager","Custom integrations"]', NULL)
  `);

  console.log('Seeding categories...');
  await connection.query(`
    INSERT IGNORE INTO categories (name, slug, description, theme_color) VALUES
    ('Retail Store', 'retail-store', 'General retail and shops', '#152651'),
    ('Restaurant', 'restaurant', 'Food and dining', '#EA580C'),
    ('Real Estate', 'real-estate', 'Property and real estate', '#152651'),
    ('Agency', 'agency', 'Agencies and consultancies', '#6366F1'),
    ('Coaching Center', 'coaching-center', 'Education and coaching', '#4F46E5'),
    ('Hospital', 'hospital', 'Healthcare and hospitals', '#DC2626'),
    ('Travel Agency', 'travel-agency', 'Travel and tourism', '#0D9488'),
    ('Caterer', 'caterer', 'Catering services', '#D97706'),
    ('Freelancer', 'freelancer', 'Freelance professionals', '#64748B'),
    ('Service Provider', 'service-provider', 'General service providers', '#57534E'),
    ('Electronics', 'electronics', 'Electronics and gadgets', '#2563EB'),
    ('Fashion', 'fashion', 'Clothing and fashion', '#7C3AED'),
    ('Home Services', 'home-services', 'Home repair and services', '#A855F7'),
    ('Grocery Store', 'grocery-store', 'Daily essentials and groceries', '#16A34A'),
    ('Cloth Store', 'cloth-store', 'Clothing and apparel', '#7C3AED'),
    ('Electronic Shop', 'electronic-shop', 'Electronics and appliances', '#2563EB'),
    ('Mobile & Accessories', 'mobile-accessories', 'Phones and accessories', '#0891B2'),
    ('Pharmacy', 'pharmacy', 'Medicines and healthcare products', '#DC2626'),
    ('Restaurant & Cafe', 'restaurant-cafe', 'Dining and cafes', '#EA580C'),
    ('Beauty & Cosmetics', 'beauty-cosmetics', 'Beauty and personal care', '#DB2777'),
    ('Hardware Store', 'hardware-store', 'Tools and hardware', '#78716C'),
    ('Bakery Shop', 'bakery-shop', 'Bakery and confectionery', '#D97706'),
    ('Book Store', 'book-store', 'Books and stationery', '#4F46E5'),
    ('Xerox Print Shop', 'xerox-print-shop', 'Printing and photocopy', '#64748B'),
    ('Tour & Travel Agency', 'tour-travel-agency', 'Tours and travel', '#0D9488'),
    ('Jewellery Shop', 'jewellery-shop', 'Jewellery and ornaments', '#CA8A04'),
    ('Footwear Shop', 'footwear-shop', 'Shoes and footwear', '#9333EA'),
    ('Gift Shop', 'gift-shop', 'Gifts and souvenirs', '#E11D48'),
    ('Computer & Laptop Store', 'computer-laptop-store', 'Computers and laptops', '#1D4ED8'),
    ('Furniture Store', 'furniture-store', 'Furniture and fittings', '#B45309'),
    ('Watch Shop', 'watch-shop', 'Watches and timepieces', '#475569'),
    ('Salon & Beauty Parlour', 'salon-beauty-parlour', 'Salon and grooming', '#BE185D'),
    ('Car Wash Shop', 'car-wash-shop', 'Car wash services', '#0284C7'),
    ('Car Showroom', 'car-showroom', 'Cars and automobiles', '#1E40AF'),
    ('Bike Showroom', 'bike-showroom', 'Bikes and two-wheelers', '#059669'),
    ('Bike Service Centre / Repair', 'bike-service-repair', 'Bike repair and service', '#57534E'),
    ('Paint & Sanitary Shop', 'paint-sanitary-shop', 'Paints and sanitaryware', '#F59E0B'),
    ('Home Decor', 'home-decor', 'Home decoration', '#A855F7'),
    ('Photo Studio', 'photo-studio', 'Photography services', '#6366F1'),
    ('Hotel', 'hotel', 'Hotels and lodging', '#0F766E')
  `);

  console.log('Seeding users...');
  await connection.query(
    `INSERT INTO users (name, email, phone, password, role, email_verified, status)
     VALUES (?, ?, ?, ?, 'super_admin', 1, 'active')
     ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'super_admin', status = 'active'`,
    ['Super Admin', 'admin@marketplace.com', '9999999999', adminHash]
  );

  await connection.query(
    `INSERT INTO users (name, email, phone, password, role, email_verified, status)
     VALUES (?, ?, ?, ?, 'business_manager', 1, 'active')
     ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'business_manager', status = 'active'`,
    ['Odisha Manager', 'manager@marketplace.com', '9888888888', managerHash]
  );

  await connection.query(
    `INSERT INTO users (name, email, phone, password, role, email_verified, status)
     VALUES (?, ?, ?, ?, 'vendor', 1, 'active')
     ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'vendor', status = 'active'`,
    ['Demo Vendor', 'vendor@marketplace.com', '9777777777', vendorHash]
  );

  await connection.query(
    `INSERT INTO users (name, email, phone, password, role, email_verified, status)
     VALUES (?, ?, ?, ?, 'customer', 1, 'active')
     ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'customer', status = 'active'`,
    ['Demo Customer', 'customer@marketplace.com', '9666666666', customerHash]
  );

  const [vendors] = await connection.query(`SELECT id FROM users WHERE email = 'vendor@marketplace.com' LIMIT 1`);
  const [customers] = await connection.query(`SELECT id FROM users WHERE email = 'customer@marketplace.com' LIMIT 1`);
  const [cats] = await connection.query(`SELECT id FROM categories WHERE slug = 'retail-store' LIMIT 1`);
  const vendorId = vendors[0]?.id;
  const customerId = customers[0]?.id;
  const categoryId = cats[0]?.id;

  if (vendorId && categoryId) {
    const [existingBiz] = await connection.query(`SELECT id FROM businesses WHERE owner_id = ? LIMIT 1`, [vendorId]);
    let businessId = existingBiz[0]?.id;

    if (!businessId) {
      const [bizResult] = await connection.query(
        `INSERT INTO businesses
         (owner_id, business_name, business_type, category_id, description, address, city, state, pincode,
          phone, whatsapp, email, website, gst_number, latitude, longitude, is_featured, is_verified, status)
         VALUES (?, 'Demo Retail Store', 'Retail Store', ?, 'Sample storefront for marketplace demo',
                 '123 Market Road', 'Bhubaneswar', 'Odisha', '751001', '9777777777', '9777777777',
                 'vendor@marketplace.com', 'https://example.com', '22AAAAA0000A1Z5', 20.2961, 85.8245, 1, 1, 'approved')`,
        [vendorId, categoryId]
      );
      businessId = bizResult.insertId;
    }

    const [existingProducts] = await connection.query(`SELECT id FROM products WHERE business_id = ? LIMIT 1`, [businessId]);
    if (!existingProducts[0]) {
      await connection.query(
        `INSERT INTO products
         (business_id, category_id, name, slug, description, price, sale_price, stock, sku, delivery_available, status, views)
         VALUES
         (?, ?, 'Organic Honey 500g', 'organic-honey-500g', 'Pure organic honey from local farms', 499.00, 449.00, 100, 'HON-500', 1, 'published', 25),
         (?, ?, 'Handwoven Cotton Scarf', 'handwoven-cotton-scarf', 'Traditional Odisha handloom scarf', 799.00, NULL, 50, 'SCF-001', 1, 'published', 12),
         (?, ?, 'Spice Gift Box', 'spice-gift-box', 'Assorted regional spices gift set', 999.00, 899.00, 30, 'SPZ-BOX', 1, 'published', 40)`,
        [businessId, categoryId, businessId, categoryId, businessId, categoryId]
      );
    }

    await connection.query(
      `INSERT INTO commission_settings (category_id, business_id, rate)
       SELECT NULL, NULL, 5.00 FROM DUAL
       WHERE NOT EXISTS (SELECT 1 FROM commission_settings WHERE category_id IS NULL AND business_id IS NULL)`
    );
  }

  await connection.query(`
    INSERT INTO platform_settings (setting_key, setting_value) VALUES
    ('site_name', 'Multi-Business Marketplace'),
    ('default_commission', '5'),
    ('support_email', 'support@marketplace.com'),
    ('support_phone', '1800-000-0000'),
    ('lead_fee', '50')
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
  `);

  if (customerId) {
    await connection.query(
      `INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 500.00)`,
      [customerId]
    );
  }

  await connection.end();
  console.log('Seed completed.');
  console.log('Demo logins:');
  console.log('  admin@marketplace.com / Admin@123');
  console.log('  manager@marketplace.com / Manager@123');
  console.log('  vendor@marketplace.com / Vendor@123');
  console.log('  customer@marketplace.com / Customer@123');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
