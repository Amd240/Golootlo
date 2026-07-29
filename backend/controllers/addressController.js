const User = require("../models/User");

// @route  GET /api/auth/addresses
const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/auth/addresses
const addAddress = async (req, res, next) => {
  try {
    const { fullName, addressLine, city, postalCode, phone } = req.body;
    if (!fullName || !addressLine || !city) {
      return res.status(400).json({ message: "fullName, addressLine, and city are required" });
    }

    const user = await User.findById(req.user._id);
    user.addresses.push({ fullName, addressLine, city, postalCode, phone });
    await user.save();

    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/auth/addresses/:addressId
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    const { fullName, addressLine, city, postalCode, phone } = req.body;
    if (fullName !== undefined) address.fullName = fullName;
    if (addressLine !== undefined) address.addressLine = addressLine;
    if (city !== undefined) address.city = city;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (phone !== undefined) address.phone = phone;

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/auth/addresses/:addressId
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    address.deleteOne();
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
