const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getAddresses, addAddress, updateAddress, deleteAddress } = require("../controllers/addressController");

router.use(protect);

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);

module.exports = router;
