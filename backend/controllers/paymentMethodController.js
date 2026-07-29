const PaymentMethod = require("../models/PaymentMethod");

// @route  GET /api/payment-methods
const getPaymentMethods = async (req, res, next) => {
  try {
    const methods = await PaymentMethod.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/payment-methods
const addPaymentMethod = async (req, res, next) => {
  try {
    const { cardNumber, cardName, expiry } = req.body;
    if (!cardNumber || !cardName || !expiry) {
      return res.status(400).json({ message: "cardNumber, cardName, and expiry are required" });
    }

    const last4 = cardNumber.replace(/\s/g, "").slice(-4);
    const method = await PaymentMethod.create({ user: req.user._id, last4, cardName, expiry });
    res.status(201).json(method);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/payment-methods/:id
const deletePaymentMethod = async (req, res, next) => {
  try {
    const method = await PaymentMethod.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!method) return res.status(404).json({ message: "Payment method not found" });
    res.json({ message: "Payment method removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPaymentMethods, addPaymentMethod, deletePaymentMethod };
