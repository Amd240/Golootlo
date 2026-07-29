const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const {
  getDashboardStats,
  getAllUsers,
  setUserRole,
  deleteUser,
  getAllOrders,
} = require("../controllers/adminController");

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", setUserRole);
router.delete("/users/:id", deleteUser);
router.get("/orders", getAllOrders);

module.exports = router;
