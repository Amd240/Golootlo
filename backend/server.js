const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

dotenv.config();
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow serving /uploads images
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded images statically, e.g. http://localhost:5000/uploads/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/auth/addresses", require("./routes/addressRoutes"));
app.use("/api/payment-methods", require("./routes/paymentMethodRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));

app.get("/", (req, res) => {
  res.send("Golootlo API is running");
});

app.use(notFound);
app.use(errorHandler);

// Only start listening when run directly (`node server.js` / `npm run dev`),
// so test files can `require('./server')` to get `app` for supertest without
// binding a real port or needing a live MongoDB connection.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
