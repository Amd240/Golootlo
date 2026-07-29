const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Category = require("./models/Category");
const Product = require("./models/Product");

dotenv.config();
connectDB();

const categoryData = [
  { name: "Electronics", icon: "🎧" },
  { name: "Footwear", icon: "👟" },
  { name: "Bags", icon: "🎒" },
  { name: "Accessories", icon: "🕶️" },
  { name: "Clothing", icon: "🧥" },
];

const seed = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();

    const categories = await Category.insertMany(categoryData);
    const catId = (name) => categories.find((c) => c.name === name)._id;

    const products = [
      {
        name: "Wireless Headphones",
        price: 59.99,
        category: catId("Electronics"),
        description: "Over-ear Bluetooth headphones with noise cancellation and 30hr battery life.",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"],
        rating: 4.5,
      },
      {
        name: "Running Shoes",
        price: 74.99,
        category: catId("Footwear"),
        description: "Lightweight and comfortable running shoes for all terrains.",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
        rating: 4.3,
      },
      {
        name: "Smart Watch",
        price: 129.99,
        category: catId("Electronics"),
        description: "Feature-packed smartwatch with health tracking, GPS and 7-day battery.",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
        rating: 4.7,
      },
      {
        name: "Leather Backpack",
        price: 89.99,
        category: catId("Bags"),
        description: "Durable leather backpack with a padded laptop compartment.",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
        rating: 4.4,
      },
      {
        name: "Sunglasses",
        price: 24.99,
        category: catId("Accessories"),
        description: "UV-protected polarized sunglasses.",
        images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"],
        rating: 4.2,
      },
      {
        name: "Denim Jacket",
        price: 54.99,
        category: catId("Clothing"),
        description: "Classic fit denim jacket with a modern slim cut.",
        images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600"],
        rating: 4.3,
      },
    ];

    await Product.insertMany(products);
    console.log(`Seeded ${categories.length} categories and ${products.length} products`);
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();