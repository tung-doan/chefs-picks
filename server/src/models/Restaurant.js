const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"],
    },
    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },
  },
  { timestamps: true }
);

// Prevent model overwrite during hot reload
module.exports = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);

