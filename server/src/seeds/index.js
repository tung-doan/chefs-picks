const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const seedUsers = require("./users.seed");
const seedDishes = require("./dishes.seed");
const seedCategories = require("./categories.seed");
const seedFavorites = require("./favorites.seed");

const { connectDB } = require("../config/db-config");

const runSeeds = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("\n📦 Starting seed process...\n");

    // Run seeds in order
    await seedUsers();
    await seedCategories();
    await seedDishes();
    await seedFavorites();

    console.log("\n✅ All seeds completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed process failed:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeds();
}

module.exports = runSeeds;
