const db = require('../../config/db');
const Category = require('../../models/Category');

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{6})$/;

function normalizeThemeColor(value) {
  if (!value || typeof value !== 'string') return '#152651';
  const v = value.trim();
  if (HEX_COLOR_RE.test(v)) return v.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v.toUpperCase()}`;
  return '#152651';
}

const listCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, parent_id: parentId, description, image, theme_color: themeColor } = req.body;
    const slug = slugify(name);
    const existing = await Category.findBySlug(slug);
    if (existing) {
      return res.status(409).json({ message: 'Category slug already exists' });
    }
    const id = await Category.create({
      name,
      slug,
      parentId,
      description,
      themeColor: normalizeThemeColor(themeColor),
    });
    if (image) {
      await db.query('UPDATE categories SET image = ? WHERE id = ?', [image, id]);
    }
    const category = await Category.findById(id);
    res.status(201).json({ message: 'Category created', data: category });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, parent_id: parentId, description, image, is_active: isActive, theme_color: themeColor } = req.body;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    let slug = category.slug;
    if (name && name !== category.name) {
      slug = slugify(name);
      const existing = await Category.findBySlug(slug);
      if (existing && existing.id !== Number(id)) {
        return res.status(409).json({ message: 'Category slug already exists' });
      }
    }
    await db.query(
      `UPDATE categories SET
         name = COALESCE(?, name),
         slug = ?,
         parent_id = COALESCE(?, parent_id),
         description = COALESCE(?, description),
         image = COALESCE(?, image),
         theme_color = COALESCE(?, theme_color),
         is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name || null,
        slug,
        parentId !== undefined ? parentId : null,
        description !== undefined ? description : null,
        image !== undefined ? image : null,
        themeColor !== undefined ? normalizeThemeColor(themeColor) : null,
        isActive !== undefined ? isActive : null,
        id,
      ]
    );
    const updated = await Category.findById(id);
    res.json({ message: 'Category updated', data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
