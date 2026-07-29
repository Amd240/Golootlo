const Coupon = require("../models/Coupon");

describe("Coupon.checkValidity", () => {
  test("applies a percentage discount correctly", () => {
    const coupon = new Coupon({
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
    });

    const result = coupon.checkValidity(1000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(100);
  });

  test("applies a fixed discount, capped at the order amount", () => {
    const coupon = new Coupon({
      code: "FLAT500",
      discountType: "fixed",
      discountValue: 500,
    });

    expect(coupon.checkValidity(1000).discountAmount).toBe(500);
    // Order smaller than the discount shouldn't go negative
    expect(coupon.checkValidity(200).discountAmount).toBe(200);
  });

  test("rejects an inactive coupon", () => {
    const coupon = new Coupon({
      code: "OLD",
      discountType: "fixed",
      discountValue: 100,
      active: false,
    });

    const result = coupon.checkValidity(1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/no longer active/i);
  });

  test("rejects an expired coupon", () => {
    const coupon = new Coupon({
      code: "EXPIRED",
      discountType: "fixed",
      discountValue: 100,
      expiresAt: new Date("2020-01-01"),
    });

    const result = coupon.checkValidity(1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/expired/i);
  });

  test("rejects a coupon that has hit its usage limit", () => {
    const coupon = new Coupon({
      code: "LIMITED",
      discountType: "fixed",
      discountValue: 100,
      maxUses: 5,
      usedCount: 5,
    });

    const result = coupon.checkValidity(1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/usage limit/i);
  });

  test("rejects an order below the coupon's minimum amount", () => {
    const coupon = new Coupon({
      code: "BIGORDERS",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 2000,
    });

    const result = coupon.checkValidity(1000);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/minimum order amount/i);
  });
});
