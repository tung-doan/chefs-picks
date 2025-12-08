const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes để tối ưu query
dishSchema.index({ name: "text", description: "text" }); // Full-text search
dishSchema.index({ restaurantId: 1, isAvailable: 1 });
dishSchema.index({ categoryId: 1, price: 1 });
dishSchema.index({ isAvailable: 1, favoriteCount: -1 }); // Popular available dishes
dishSchema.index({ price: 1 }); // Price sorting

module.exports = mongoose.model("Dish", dishSchema);
