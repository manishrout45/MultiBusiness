-- Per-category theme color (hex), editable from admin dashboard
ALTER TABLE categories
  ADD COLUMN theme_color VARCHAR(7) NULL DEFAULT '#152651' AFTER image;

-- Default colors for marketplace categories (safe to re-run: only fills NULL)
UPDATE categories SET theme_color = '#16A34A' WHERE slug = 'grocery-store' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#7C3AED' WHERE slug = 'cloth-store' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#2563EB' WHERE slug = 'electronic-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#0891B2' WHERE slug = 'mobile-accessories' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#DC2626' WHERE slug = 'pharmacy' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#EA580C' WHERE slug = 'restaurant-cafe' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#DB2777' WHERE slug = 'beauty-cosmetics' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#78716C' WHERE slug = 'hardware-store' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#D97706' WHERE slug = 'bakery-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#4F46E5' WHERE slug = 'book-store' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#64748B' WHERE slug = 'xerox-print-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#0D9488' WHERE slug = 'tour-travel-agency' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#152651' WHERE slug = 'real-estate' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#CA8A04' WHERE slug = 'jewellery-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#9333EA' WHERE slug = 'footwear-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#E11D48' WHERE slug = 'gift-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#1D4ED8' WHERE slug = 'computer-laptop-store' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#B45309' WHERE slug = 'furniture-store' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#475569' WHERE slug = 'watch-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#BE185D' WHERE slug = 'salon-beauty-parlour' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#0284C7' WHERE slug = 'car-wash-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#1E40AF' WHERE slug = 'car-showroom' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#059669' WHERE slug = 'bike-showroom' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#57534E' WHERE slug = 'bike-service-repair' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#F59E0B' WHERE slug = 'paint-sanitary-shop' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#A855F7' WHERE slug = 'home-decor' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#6366F1' WHERE slug = 'photo-studio' AND (theme_color IS NULL OR theme_color = '#152651');
UPDATE categories SET theme_color = '#0F766E' WHERE slug = 'hotel' AND (theme_color IS NULL OR theme_color = '#152651');
