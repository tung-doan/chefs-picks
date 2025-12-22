const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
categorySchema.index({ name: "text", description: "text" });

// Static method: Get active categories
categorySchema.statics.getActiveCategories = async function () {
  return this.find({ isActive: true }).sort({ name: 1 }).lean();
};

// Prevent model overwrite during hot reload
module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
