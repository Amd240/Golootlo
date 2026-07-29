const Coupon = require("../models/Coupon");

// @route  GET /api/coupons   (admin)
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/coupons   (admin)
// { code, discountType, discountValue, minOrderAmount?, maxUses?, expiresAt? }
const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A coupon with this code already exists" });
    }
    next(error);
  }
};

// @route  PUT /api/coupons/:id   (admin)
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/coupons/:id   (admin)
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/coupons/validate   (any logged-in user)
// { code, orderAmount } -> { valid, discountAmount, message? }
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code || orderAmount == null) {
      return res.status(400).json({ message: "code and orderAmount are required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ valid: false, message: "Coupon not found" });
    }

    const result = coupon.checkValidity(orderAmount);
    res.json(result.valid ? { ...result, code: coupon.code } : result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
