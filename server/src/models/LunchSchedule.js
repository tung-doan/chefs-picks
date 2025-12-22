const mongoose = require("mongoose");

const lunchScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
      index: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    meals: [
      {
        date: {
          type: Date,
          required: true,
        },
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          default: null,
        },
        notes: {
          type: String,
          default: "",
          trim: true,
          maxlength: [500, "Notes cannot exceed 500 characters"],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index để prevent duplicate schedules cho cùng một tuần
lunchScheduleSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

// Indexes for query optimization
lunchScheduleSchema.index({ userId: 1, isActive: 1, weekStartDate: -1 });
lunchScheduleSchema.index({ "meals.date": 1 });

// Static method: Tìm schedule theo userId và weekStartDate
lunchScheduleSchema.statics.findByUserAndWeek = async function (userId, weekStartDate) {
  return await this.findOne({
    userId,
    weekStartDate,
    isActive: true,
  }).populate("meals.dishId");
};

// Static method: Tạo hoặc cập nhật schedule
lunchScheduleSchema.statics.createOrUpdate = async function (userId, weekStartDate, weekEndDate, meals) {
  const existing = await this.findOne({ userId, weekStartDate });
  
  if (existing) {
    existing.weekEndDate = weekEndDate;
    existing.meals = meals;
    return await existing.save();
  }
  
  return await this.create({
    userId,
    weekStartDate,
    weekEndDate,
    meals,
  });
};

// Prevent model overwrite during hot reload
module.exports = mongoose.models.LunchSchedule || mongoose.model("LunchSchedule", lunchScheduleSchema);

