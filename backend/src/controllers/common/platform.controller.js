const db = require('../../config/db');

const THEME_KEYS = {
  primary: 'theme_primary',
  secondary: 'theme_secondary',
  light: 'theme_light',
  festiveTheme: 'festive_theme',
};

async function readSettingsMap(keys) {
  const [rows] = await db.query(
    `SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN (${keys
      .map(() => '?')
      .join(',')})`,
    keys
  );
  const map = {};
  for (const row of rows) {
    map[row.setting_key] = row.setting_value;
  }
  return map;
}

const getPublicTheme = async (req, res, next) => {
  try {
    const map = await readSettingsMap(Object.values(THEME_KEYS));
    res.json({
      data: {
        primary: map.theme_primary || null,
        secondary: map.theme_secondary || null,
        light: map.theme_light || null,
        festiveTheme: map.festive_theme || 'none',
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateTheme = async (req, res, next) => {
  try {
    const pairs = [
      [THEME_KEYS.primary, req.body.primary],
      [THEME_KEYS.secondary, req.body.secondary],
      [THEME_KEYS.light, req.body.light],
      [THEME_KEYS.festiveTheme, req.body.festiveTheme ?? req.body.festive_theme],
    ];

    for (const [key, value] of pairs) {
      if (value === undefined) continue;
      await db.query(
        `INSERT INTO platform_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value == null ? null : String(value)]
      );
    }

    const map = await readSettingsMap(Object.values(THEME_KEYS));
    res.json({
      message: 'Theme updated',
      data: {
        primary: map.theme_primary || null,
        secondary: map.theme_secondary || null,
        light: map.theme_light || null,
        festiveTheme: map.festive_theme || 'none',
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPublicBanners = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, image_path, link_url, ad_type, status, start_date, end_date
       FROM advertisements
       WHERE ad_type = 'homepage_banner'
         AND status = 'active'
         AND (start_date IS NULL OR start_date <= NOW())
         AND (end_date IS NULL OR end_date >= NOW())
       ORDER BY created_at DESC
       LIMIT 12`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getPublicAnnouncements = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, description, region, category_id, start_date, end_date, is_active, created_at
       FROM promotions
       WHERE is_active = 1
         AND (start_date IS NULL OR start_date <= CURDATE())
         AND (end_date IS NULL OR end_date >= CURDATE())
       ORDER BY created_at DESC
       LIMIT 10`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicTheme,
  updateTheme,
  getPublicBanners,
  getPublicAnnouncements,
};
