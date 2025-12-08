const FavoriteFood = require("../models/favoriteFood");
const User = require("../models/user-model");
const Dish = require("../models/Dish");

const seedFavorites = async () => {
  try {
    console.log("🔄 Seeding favorites...");

    // Clear existing favorites
    await FavoriteFood.deleteMany({});

    // Get users and dishes
    const users = await User.find({ role: "user" }).limit(3);
    const dishes = await Dish.find().limit(10);

    if (users.length === 0 || dishes.length === 0) {
      console.log("⚠️  No users or dishes found. Skipping favorites seed.");
      return [];
    }

    // Create favorites for each user
    const favoritesData = [];

    // User 1: testuser@example.com - likes curry and ramen
    if (users[0]) {
      favoritesData.push(
        { userId: users[0]._id, dishId: dishes[0]._id }, // Butter Chicken Curry
        { userId: users[0]._id, dishId: dishes[2]._id }, // Miso Ramen
        { userId: users[0]._id, dishId: dishes[3]._id } // Shoyu Ramen
      );
    }

    // User 2: john@example.com - likes bowls and sets
    if (users[1]) {
      favoritesData.push(
        { userId: users[1]._id, dishId: dishes[4]._id }, // Beef Bowl
        { userId: users[1]._id, dishId: dishes[5]._id }, // Chicken & Egg Bowl
        { userId: users[1]._id, dishId: dishes[8]._id }, // Pork Cutlet Set
        { userId: users[1]._id, dishId: dishes[9]._id } // Tempura Set
      );
    }

    // User 3: jane@example.com - likes healthy options
    if (users[2]) {
      favoritesData.push(
        { userId: users[2]._id, dishId: dishes[6]._id }, // Fresh Salad Bowl
        { userId: users[2]._id, dishId: dishes[7]._id }, // Tofu Salad
        { userId: users[2]._id, dishId: dishes[1]._id } // Green Curry
      );
    }

    // Create favorites
    const createdFavorites = await FavoriteFood.insertMany(favoritesData);

    // Update dish favorite counts
    for (const favorite of createdFavorites) {
      await Dish.findByIdAndUpdate(favorite.dishId, {
        $inc: { favoriteCount: 1 },
      });
    }

    console.log(`✅ Seeded ${createdFavorites.length} favorites`);
    console.log("\n📋 Favorites Summary:");
    console.log("==========================================");

    // Show favorites by user
    for (const user of users) {
      const userFavorites = createdFavorites.filter(
        (f) => f.userId.toString() === user._id.toString()
      );

      if (userFavorites.length > 0) {
        console.log(`\n👤 ${user.name} (${user.email}):`);

        for (const favorite of userFavorites) {
          const dish = dishes.find(
            (d) => d._id.toString() === favorite.dishId.toString()
          );
          if (dish) {
            console.log(`${dish.name} (¥${dish.price})`);
          }
        }
      }
    }
    console.log("\n==========================================\n");

    return createdFavorites;
  } catch (error) {
    console.error("❌ Error seeding favorites:", error);
    throw error;
  }
};

module.exports = seedFavorites;
