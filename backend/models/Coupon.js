const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null }, // null = never expires
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Checks whether this coupon can currently be applied to an order of the given amount.
// Returns { valid, message, discountAmount }.
couponSchema.methods.checkValidity = function (orderAmount) {
  if (!this.active) return { valid: false, message: "This coupon is no longer active" };
  if (this.expiresAt && this.expiresAt < new Date()) {
    return { valid: false, message: "This coupon has expired" };
  }
  if (this.maxUses !== null && this.usedCount >= this.maxUses) {
    return { valid: false, message: "This coupon has reached its usage limit" };
  }
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount for this coupon is PKR${this.minOrderAmount}`,
    };
  }

  const discountAmount =
    this.discountType === "percentage"
      ? Math.round(((orderAmount * this.discountValue) / 100) * 100) / 100
      : Math.min(this.discountValue, orderAmount);

  return { valid: true, discountAmount };
};

module.exports = mongoose.model("Coupon", couponSchema);
