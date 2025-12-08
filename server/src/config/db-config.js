const mongoose = require("mongoose");


const uri = process.env.MONGO_URI;

const connectDB = async () => {
  if (!uri) {
    console.error("MongoDB connection error: MONGO_URI is not set in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, uri };
