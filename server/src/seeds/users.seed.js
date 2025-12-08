const bcrypt = require("bcryptjs");
const User = require("../models/user-model");

const users = [
  {
    name: "Test User",
    email: "testuser@example.com",
    password: "123456",
    role: "user",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "123456",
    role: "user",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "123456",
    role: "user",
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
  },
];

const seedUsers = async () => {
  try {
    console.log("🔄 Seeding users...");

    // Clear existing users
    await User.deleteMany({
      email: { $in: users.map((u) => u.email) },
    });

    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);

    console.log(`✅ Seeded ${createdUsers.length} users`);
    console.log("\n📋 User Credentials:");
    console.log("==========================================");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${createdUsers[index]._id}`);
      console.log("");
    });

    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
};

module.exports = seedUsers;
