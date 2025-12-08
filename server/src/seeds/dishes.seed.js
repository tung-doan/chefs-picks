const mongoose = require("mongoose");
const Dish = require("../models/Dish");
const Category = require("../models/Category");

const seedDishes = async () => {
  try {
    console.log("🔄 Seeding dishes...");

    // Clear existing dishes
    await Dish.deleteMany({});

    // Get categories
    const categories = await Category.find();

    if (categories.length === 0) {
      console.log("⚠️  No categories found. Please seed categories first.");
      return [];
    }

    // Create category map
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Dishes data with category names
    const dishesData = [
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Curry",
        name: "Butter Chicken Curry",
        description:
          "Rich and creamy butter chicken curry with aromatic spices",
        price: 780,
        rating: 4.6,
        image:
          "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
        ingredients: ["chicken", "butter", "cream", "tomato", "spices"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Curry",
        name: "Green Curry",
        description: "Spicy Thai green curry with coconut milk",
        price: 890,
        rating: 4.1,
        image:
          "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400",
        ingredients: ["chicken", "coconut milk", "green curry paste", "basil"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Ramen",
        name: "Miso Ramen",
        description: "Rich miso broth with tender noodles and toppings",
        price: 820,
        rating: 4.4,
        image:
          "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400",
        ingredients: ["noodles", "miso", "pork", "egg", "green onion"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Ramen",
        name: "Shoyu Ramen",
        description: "Classic soy sauce based ramen with traditional toppings",
        price: 750,
        rating: 4.3,
        image:
          "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
        ingredients: ["noodles", "shoyu", "pork", "egg", "nori"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Rice Bowl",
        name: "Beef Bowl",
        description: "Tender beef slices over steamed rice",
        price: 680,
        rating: 4.2,
        image:
          "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400",
        ingredients: ["beef", "rice", "onion", "soy sauce"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Rice Bowl",
        name: "Chicken & Egg Bowl",
        description: "Chicken and egg simmered in savory sauce over rice",
        price: 760,
        rating: 4.2,
        image:
          "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400",
        ingredients: ["chicken", "egg", "rice", "dashi", "green onion"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Salad",
        name: "Fresh Salad Bowl",
        description: "Fresh mixed greens with seasonal vegetables",
        price: 620,
        rating: 4.0,
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        ingredients: ["lettuce", "tomato", "cucumber", "carrot", "dressing"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Salad",
        name: "Tofu Salad",
        description: "Healthy tofu salad with sesame dressing",
        price: 580,
        rating: 3.9,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        ingredients: ["tofu", "mixed greens", "sesame", "soy sauce"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Set Meal",
        name: "Pork Cutlet Set",
        description: "Crispy breaded pork cutlet with rice and miso soup",
        price: 980,
        rating: 4.5,
        image:
          "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400",
        ingredients: ["pork", "panko", "rice", "cabbage", "miso soup"],
        isAvailable: true,
        favoriteCount: 0,
      },
      {
        restaurantId: new mongoose.Types.ObjectId(),
        categoryName: "Tempura",
        name: "Tempura Set",
        description: "Assorted tempura with dipping sauce",
        price: 850,
        rating: 4.3,
        image:
          "https://images.unsplash.com/photo-1545247181-516773cae754?w=400",
        ingredients: ["shrimp", "vegetables", "tempura batter", "sauce"],
        isAvailable: true,
        favoriteCount: 0,
      },
    ];

    // Map categoryName to categoryId
    const dishes = dishesData.map((dish) => ({
      ...dish,
      categoryId: categoryMap[dish.categoryName],
      categoryName: undefined, // Remove temporary field
    }));

    // Create dishes
    const createdDishes = await Dish.insertMany(dishes);

    console.log(`✅ Seeded ${createdDishes.length} dishes`);
    console.log("\n📋 Dish Details:");
    console.log("==========================================");

    for (const dish of createdDishes) {
      const category = categories.find(
        (c) => c._id.toString() === dish.categoryId.toString()
      );
      console.log(`${dish.name}`);
      console.log(`   ID: ${dish._id}`);
      console.log(`   Category: ${category?.name || "N/A"}`);
      console.log(`   Price: ¥${dish.price}`);
      console.log(`   Rating: ${dish.rating}`);
      console.log("");
    }

    return createdDishes;
  } catch (error) {
    console.error("❌ Error seeding dishes:", error);
    throw error;
  }
};

module.exports = seedDishes;
