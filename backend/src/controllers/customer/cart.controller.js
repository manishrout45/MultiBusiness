const db = require('../../config/db');
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');

const resolveStock = async (product, variationId) => {
  if (!variationId) return Number(product.stock);
  const [rows] = await db.query(
    'SELECT stock FROM product_variations WHERE id = ? AND product_id = ?',
    [variationId, product.id]
  );
  if (!rows[0]) {
    const err = new Error('Invalid size/variation for this product');
    err.statusCode = 400;
    throw err;
  }
  return Number(rows[0].stock);
};

const getCart = async (req, res, next) => {
  try {
    const items = await Cart.getItems(req.user.id);
    const total = items.reduce((sum, item) => {
      const base = item.sale_price != null ? Number(item.sale_price) : Number(item.price);
      const unitPrice = base + Number(item.price_adjustment || 0);
      return sum + unitPrice * Number(item.quantity);
    }, 0);
    res.json({ data: items, total: Math.round(total * 100) / 100 });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity) || 1;
    const variationId = req.body.variationId != null ? Number(req.body.variationId) : null;
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: 'quantity must be at least 1' });
    }
    const product = await Product.findById(productId);
    if (!product || product.status !== 'published') {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [variations] = await db.query(
      'SELECT id FROM product_variations WHERE product_id = ?',
      [productId]
    );
    if (variations.length && !variationId) {
      return res.status(400).json({ message: 'Select a size/variation' });
    }

    const available = await resolveStock(product, variationId);
    if (available < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    await Cart.addItem(req.user.id, productId, quantity, variationId);
    const items = await Cart.getItems(req.user.id);
    res.status(201).json({ message: 'Added to cart', data: items });
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);
    if (!itemId) {
      return res.status(400).json({ message: 'itemId is required' });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'quantity must be at least 1' });
    }
    const [rows] = await db.query(
      'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, req.user.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    const product = await Product.findById(rows[0].product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const available = await resolveStock(product, rows[0].variation_id);
    if (available < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    await Cart.updateItem(itemId, quantity);
    const items = await Cart.getItems(req.user.id);
    res.json({ message: 'Cart updated', data: items });
  } catch (err) {
    next(err);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    if (!itemId) {
      return res.status(400).json({ message: 'itemId is required' });
    }
    const [rows] = await db.query(
      'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, req.user.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    await Cart.removeItem(itemId);
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
};
