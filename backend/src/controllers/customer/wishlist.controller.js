const Wishlist = require('../../models/Wishlist');
const Product = require('../../models/Product');

const listWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findByUser(req.user.id);
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const productId = Number(req.body.productId);
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    const product = await Product.findById(productId);
    if (!product || product.status !== 'published') {
      return res.status(404).json({ message: 'Product not found' });
    }
    await Wishlist.add(req.user.id, productId);
    const items = await Wishlist.findByUser(req.user.id);
    res.status(201).json({ message: 'Added to wishlist', data: items });
  } catch (err) {
    next(err);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }
    await Wishlist.remove(req.user.id, productId);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listWishlist,
  addToWishlist,
  removeFromWishlist,
};
