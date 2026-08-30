const db = require('../config/db');

const Category = {
  findAll: async () => {
    const [rows] = await db.query(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC'
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  findBySlug: async (slug) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  create: async ({ name, slug, parentId, description, themeColor }) => {
    const [result] = await db.query(
      'INSERT INTO categories (name, slug, parent_id, description, theme_color) VALUES (?, ?, ?, ?, ?)',
      [name, slug, parentId || null, description || null, themeColor || '#152651']
    );
    return result.insertId;
  },
};

module.exports = Category;
