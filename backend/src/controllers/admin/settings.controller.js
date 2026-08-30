const db = require('../../config/db');

const getSettings = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM platform_settings ORDER BY setting_key ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ message: 'Body must be a key-value object' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        `INSERT INTO platform_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value == null ? null : String(value)]
      );
    }

    const [rows] = await db.query(
      'SELECT * FROM platform_settings ORDER BY setting_key ASC'
    );
    res.json({ message: 'Settings updated', data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
