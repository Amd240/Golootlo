const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getPaymentMethods, addPaymentMethod, deletePaymentMethod } = require("../controllers/paymentMethodController");

router.use(protect);

router.get("/", getPaymentMethods);
router.post("/", addPaymentMethod);
router.delete("/:id", deletePaymentMethod);

module.exports = router;
