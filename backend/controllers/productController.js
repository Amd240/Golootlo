const Product = require("../models/Product");

// @route  GET /api/products
// Backward compatible: with no ?page param, returns the full array as before.
// Pass ?page=1&limit=10 to opt into a paginated response shape:
//   { products, page, totalPages, totalCount }
const getProducts = async (req, res, next) => {
  try {
    const { category, search, page, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    if (page) {
      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

      const [products, totalCount] = await Promise.all([
        Product.find(filter)
          .populate("category", "name icon")
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Product.countDocuments(filter),
      ]);

      return res.json({
        products,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
      });
    }

    const products = await Product.find(filter).populate("category", "name icon").sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products/:id/related
// Simple "recommendations": other products in the same category, best-rated first.
const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate("category", "name icon")
      .sort({ rating: -1 })
      .limit(8);

    res.json(related);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name icon");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getRelatedProducts, getProductById, createProduct, updateProduct, deleteProduct };
