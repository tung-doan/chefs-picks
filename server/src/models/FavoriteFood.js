const mongoose = require("mongoose");

const favoriteFoodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index để prevent duplicate và tối ưu query
favoriteFoodSchema.index({ userId: 1, dishId: 1 }, { unique: true });

// Additional indexes
favoriteFoodSchema.index({ userId: 1, createdAt: -1 });
favoriteFoodSchema.index({ dishId: 1, createdAt: -1 });

// Static method: Kiểm tra trùng lặp
favoriteFoodSchema.statics.checkDuplicate = async function (userId, dishId) {
  const exists = await this.findOne({ userId, dishId }).lean();
  return !!exists;
};

module.exports = mongoose.model("FavoriteFood", favoriteFoodSchema);
