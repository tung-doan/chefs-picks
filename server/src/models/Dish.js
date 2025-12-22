const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
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
      required: [true, "Dish name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"],
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
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
      min: [0, "Favorite count cannot be negative"],
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

// Virtual để format price
dishSchema.virtual("formattedPrice").get(function () {
  return this.price.toLocaleString("vi-VN") + "đ";
});

// Middleware để đảm bảo rating luôn hợp lệ
dishSchema.pre("save", function (next) {
  if (this.rating < 0) this.rating = 0;
  if (this.rating > 5) this.rating = 5;
  next();
});

// Prevent model overwrite during hot reload
module.exports = mongoose.models.Dish || mongoose.model("Dish", dishSchema);