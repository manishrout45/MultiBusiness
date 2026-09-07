const db = require('../../config/db');
const Business = require('../../models/Business');
const Product = require('../../models/Product');
const { notifyUsersByRoles } = require('../../services/notification.service');

const requireOwnedBusiness = async (userId) => {
  const business = await Business.findByOwner(userId);
  return business;
};

const loadVariations = async (productId) => {
  const [rows] = await db.query(
    `SELECT id, variation_name, variation_value, price_adjustment, stock, sku
     FROM product_variations
     WHERE product_id = ?
     ORDER BY id ASC`,
    [productId]
  );
  return rows;
};

const attachVariations = async (products) => {
  if (!products.length) return products;
  const ids = products.map((p) => p.id);
  const [rows] = await db.query(
    `SELECT * FROM product_variations WHERE product_id IN (?) ORDER BY id ASC`,
    [ids]
  );
  const byProduct = {};
  for (const row of rows) {
    if (!byProduct[row.product_id]) byProduct[row.product_id] = [];
    byProduct[row.product_id].push(row);
  }
  return products.map((p) => ({
    ...p,
    variations: byProduct[p.id] || [],
  }));
};

const syncVariations = async (productId, variations) => {
  if (!Array.isArray(variations)) return;
  await db.query('DELETE FROM product_variations WHERE product_id = ?', [productId]);
  for (const variation of variations) {
    const name = variation.name || variation.variation_name || 'Size';
    const value = variation.value || variation.variation_value;
    if (!value) continue;
    await db.query(
      `INSERT INTO product_variations
       (product_id, variation_name, variation_value, price_adjustment, stock, sku)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        productId,
        name,
        value,
        Number(variation.priceAdjustment ?? variation.price_adjustment ?? 0),
        Number(variation.stock ?? 0),
        variation.sku || null,
      ]
    );
  }
};

const listProducts = async (req, res, next) => {
  try {
    const business = await requireOwnedBusiness(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const products = await Product.findByBusiness(business.id);
    const withVariations = await attachVariations(products);
    res.json({ data: withVariations });
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

    const variations = req.body.variations || [];
    let stock = Number(req.body.stock ?? 0);
    if (Array.isArray(variations) && variations.length) {
      stock = variations.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    }

    const id = await Product.create({
      businessId: business.id,
      categoryId: categoryId || null,
      name,
      description: req.body.description || null,
      price,
      salePrice: req.body.sale_price ?? req.body.salePrice ?? null,
      stock,
      sku: req.body.sku || null,
      deliveryAvailable: req.body.delivery_available ?? req.body.deliveryAvailable ?? true,
    });

    await syncVariations(id, variations);

    const product = await Product.findById(id);
    product.variations = await loadVariations(id);

    await notifyUsersByRoles({
      roles: ['super_admin', 'business_manager'],
      title: 'New product pending review',
      message: `${business.business_name || 'A vendor'} added “${name}”`,
      type: 'product',
      link: '/admin/dashboard#vendors',
    });

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
    const description =
      req.body.description !== undefined ? req.body.description : product.description;
    const price = req.body.price ?? product.price;
    const salePrice = req.body.sale_price ?? req.body.salePrice ?? product.sale_price;
    let stock = req.body.stock ?? product.stock;
    const sku = req.body.sku !== undefined ? req.body.sku : product.sku;
    const categoryId = req.body.category_id ?? req.body.categoryId ?? product.category_id;
    const deliveryAvailable = req.body.delivery_available ?? req.body.deliveryAvailable;
    const deliveryValue =
      deliveryAvailable === undefined ? product.delivery_available : deliveryAvailable ? 1 : 0;
    const requestedStatus = req.body.status || product.status;
    const vendorAllowed = ['draft', 'pending', 'out_of_stock', 'published'];
    let status = vendorAllowed.includes(requestedStatus)
      ? requestedStatus
      : product.status === 'published'
        ? 'published'
        : 'pending';

    if (Array.isArray(req.body.variations)) {
      await syncVariations(product.id, req.body.variations);
      stock = req.body.variations.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    }

    if (Number(stock) <= 0) {
      status = 'out_of_stock';
    } else if (status === 'out_of_stock' && product.status === 'published') {
      status = 'published';
    }

    await db.query(
      `UPDATE products SET
        category_id = ?, name = ?, description = ?, price = ?, sale_price = ?,
        stock = ?, sku = ?, delivery_available = ?, status = ?
       WHERE id = ? AND business_id = ?`,
      [
        categoryId,
        name,
        description,
        price,
        salePrice,
        stock,
        sku,
        deliveryValue,
        status,
        product.id,
        business.id,
      ]
    );

    const updated = await Product.findById(product.id);
    updated.variations = await loadVariations(product.id);
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

    await db.query('DELETE FROM products WHERE id = ? AND business_id = ?', [
      product.id,
      business.id,
    ]);
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
