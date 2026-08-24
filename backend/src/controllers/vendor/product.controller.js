const db = require('../../config/db');
const Business = require('../../models/Business');
const Product = require('../../models/Product');

const requireOwnedBusiness = async (userId) => {
  const business = await Business.findByOwner(userId);
  return business;
};

const listProducts = async (req, res, next) => {
  try {
    const business = await requireOwnedBusiness(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const products = await Product.findByBusiness(business.id);
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const business = await requireOwnedBusiness(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }
    if (business.status !== 'approved') {
      return res.status(403).json({
        message: 'Vendor must be approved before creating products',
        status: business.status,
      });
    }

    const name = req.body.name;
    const price = req.body.price;
    const categoryId = req.body.category_id ?? req.body.categoryId;
    if (!name || price == null) {
      return res.status(400).json({ message: 'name and price are required' });
    }

    const id = await Product.create({
      businessId: business.id,
      categoryId: categoryId || null,
      name,
      description: req.body.description || null,
      price,
      salePrice: req.body.sale_price ?? req.body.salePrice ?? null,
      stock: req.body.stock ?? 0,
      sku: req.body.sku || null,
      deliveryAvailable: req.body.delivery_available ?? req.body.deliveryAvailable ?? true,
    });

    const product = await Product.findById(id);
    res.status(201).json({ message: 'Product created', data: product });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const business = await requireOwnedBusiness(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product || product.business_id !== business.id) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const name = req.body.name ?? product.name;
    const description = req.body.description !== undefined ? req.body.description : product.description;
    const price = req.body.price ?? product.price;
    const salePrice = req.body.sale_price ?? req.body.salePrice ?? product.sale_price;
    const stock = req.body.stock ?? product.stock;
    const sku = req.body.sku !== undefined ? req.body.sku : product.sku;
    const categoryId = req.body.category_id ?? req.body.categoryId ?? product.category_id;
    const deliveryAvailable = req.body.delivery_available ?? req.body.deliveryAvailable;
    const deliveryValue = deliveryAvailable === undefined
      ? product.delivery_available
      : (deliveryAvailable ? 1 : 0);
    const requestedStatus = req.body.status || product.status;
    const vendorAllowed = ['draft', 'pending', 'out_of_stock'];
    const status = vendorAllowed.includes(requestedStatus)
      ? requestedStatus
      : (product.status === 'published' ? 'published' : 'pending');

    await db.query(
      `UPDATE products SET
        category_id = ?, name = ?, description = ?, price = ?, sale_price = ?,
        stock = ?, sku = ?, delivery_available = ?, status = ?
       WHERE id = ? AND business_id = ?`,
      [categoryId, name, description, price, salePrice, stock, sku, deliveryValue, status, product.id, business.id]
    );

    const updated = await Product.findById(product.id);
    res.json({ message: 'Product updated', data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const business = await requireOwnedBusiness(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product || product.business_id !== business.id) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.query('DELETE FROM products WHERE id = ? AND business_id = ?', [product.id, business.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
