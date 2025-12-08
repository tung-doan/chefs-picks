const Category = require("../models/Category");

const categories = [
  {
    name: "Curry",
    description: "Delicious curry dishes with rich flavors",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
    isActive: true,
  },
  {
    name: "Ramen",
    description: "Japanese noodle soup dishes",
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400",
    isActive: true,
  },
  {
    name: "Rice Bowl",
    description: "Rice bowls with various toppings",
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400",
    isActive: true,
  },
  {
    name: "Salad",
    description: "Fresh and healthy salads",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    isActive: true,
  },
  {
    name: "Set Meal",
    description: "Complete meal sets",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400",
    isActive: true,
  },
  {
    name: "Sushi",
    description: "Fresh sushi and sashimi",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    isActive: true,
  },
  {
    name: "Tempura",
    description: "Crispy fried dishes",
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=400",
    isActive: true,
  },
  {
    name: "Dessert",
    description: "Sweet treats and desserts",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    isActive: true,
  },
];

const seedCategories = async () => {
  try {
    console.log("🔄 Seeding categories...");

    // Clear existing categories
    await Category.deleteMany({});

    // Create categories
    const createdCategories = await Category.insertMany(categories);

    console.log(`✅ Seeded ${createdCategories.length} categories`);
    console.log("\n📋 Category IDs:");
    console.log("==========================================");
    createdCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   ID: ${category._id}`);
      console.log(`   Active: ${category.isActive}`);
      console.log("");
    });

    return createdCategories;
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};

module.exports = seedCategories;
