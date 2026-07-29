const Wishlist = require("../models/Wishlist");

// @route  GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: error.message });
  }
};

// @route  POST /api/wishlist  { productId }
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate("products");
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to add to wishlist", error: error.message });
  }
};

// @route  DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter((id) => id.toString() !== req.params.productId);
    await wishlist.save();
    await wishlist.populate("products");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove from wishlist", error: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
