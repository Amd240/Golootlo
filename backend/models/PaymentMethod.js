const mongoose = require("mongoose");

// No real payment processing happens anywhere in this project, so we only ever
// store the last 4 digits for display purposes - never a full card number.
const paymentMethodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    last4: { type: String, required: true, maxlength: 4 },
    cardName: { type: String, required: true },
    expiry: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
