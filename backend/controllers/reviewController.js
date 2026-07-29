const Review = require("../models/Review");
const Product = require("../models/Product");

// Recalculates and saves a product's average rating + review count
const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
};

// @route  GET /api/products/:id/reviews
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/products/:id/reviews  (auth required)
// Creates a review, or updates the user's existing review for this product
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = await Review.findOneAndUpdate(
      { product: req.params.id, user: req.user._id },
      { rating, comment: comment || "", userName: req.user.name },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await recalcProductRating(req.params.id);

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/products/:id/reviews/:reviewId  (auth required, owner only)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    await recalcProductRating(req.params.id);

    res.json({ message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, createReview, deleteReview };
