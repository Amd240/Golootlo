const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

// @route  POST /api/orders  { shippingAddress, paymentMethod, couponCode? }
// Creates an order from the user's current cart, then clears the cart
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (!coupon) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      const result = coupon.checkValidity(subtotal);
      if (!result.valid) {
        return res.status(400).json({ message: result.message });
      }
      discountAmount = result.discountAmount;
      appliedCouponCode = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }

    const totalAmount = Math.max(subtotal - discountAmount, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      couponCode: appliedCouponCode,
      discountAmount,
      shippingAddress,
      paymentMethod,
    });

    // Clear the cart after successful checkout
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// @route  GET /api/orders  (current user's orders)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// @route  GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

// @route  PUT /api/orders/:id/status  { status }
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };
