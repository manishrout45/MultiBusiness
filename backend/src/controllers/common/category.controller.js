const Category = require('../../models/Category');

const listCategories = async (req, res, next) => {
  try {
    const rows = await Category.findAll();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCategories, getCategory };
