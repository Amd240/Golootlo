const express = require("express");
const router = express.Router();
const {
  getProducts,
  getRelatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { getReviews, createReview, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Reviews & ratings
router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", protect, createReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

module.exports = router;
