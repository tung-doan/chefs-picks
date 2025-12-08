const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/user-model");
const Dish = require("../models/Dish");
const Category = require("../models/Category");
const FavoriteFood = require("../models/favoriteFood");
const { connectDB } = require("../config/db-config");

const clearDatabase = async () => {
  try {
    await connectDB();
    console.log("\n🗑️  Clearing database...\n");

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      Dish.deleteMany({}),
      Category.deleteMany({}),
      FavoriteFood.deleteMany({}),
    ]);

    console.log("✅ Users cleared");
    console.log("✅ Dishes cleared");
    console.log("✅ Dishes cleared");
    console.log("✅ Favorites cleared");

    console.log("\n✅ Database cleared successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Clear database failed:", error);
    process.exit(1);
  }
};

clearDatabase();
