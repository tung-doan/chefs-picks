const LunchSchedule = require("../models/LunchSchedule");
const Dish = require("../models/Dish");
const FavoriteFood = require("../models/FavoriteFood");

class LunchScheduleController {
  // Tạo hoặc cập nhật lịch ăn trưa theo tuần
  static async createOrUpdateSchedule(req, res) {
    try {
      const { weekStartDate, meals } = req.body;
      const userId = req.user._id;

      if (!weekStartDate) {
        return res.status(400).json({
          success: false,
          message: "weekStartDate là bắt buộc",
        });
      }

      // Validate weekStartDate
      const startDate = new Date(weekStartDate);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "weekStartDate không hợp lệ",
        });
      }

      // Tính weekEndDate (7 ngày sau)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      // Validate meals array
      if (!Array.isArray(meals)) {
        return res.status(400).json({
          success: false,
          message: "meals phải là một mảng",
        });
      }

      // Validate và populate dishId nếu có
      const validatedMeals = [];
      for (const meal of meals) {
        if (!meal.date) {
          return res.status(400).json({
            success: false,
            message: "Mỗi meal phải có date",
          });
        }

        const mealDate = new Date(meal.date);
        if (isNaN(mealDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: `Date không hợp lệ: ${meal.date}`,
          });
        }

        // Normalize date to start of day in UTC to avoid timezone issues
        // This ensures the date stored matches the date sent from client
        const normalizedDate = new Date(Date.UTC(
          mealDate.getUTCFullYear(),
          mealDate.getUTCMonth(),
          mealDate.getUTCDate(),
          0, 0, 0, 0
        ));

        // Validate dishId nếu có
        if (meal.dishId) {
          const dish = await Dish.findById(meal.dishId);
          if (!dish) {
            return res.status(404).json({
              success: false,
              message: `Món ăn không tồn tại: ${meal.dishId}`,
            });
          }
        }

        validatedMeals.push({
          date: normalizedDate,
          dishId: meal.dishId || null,
          notes: meal.notes || "",
        });
      }

      // Tạo hoặc cập nhật schedule
      const schedule = await LunchSchedule.createOrUpdate(
        userId,
        startDate,
        endDate,
        validatedMeals
      );

      // Populate dishId để trả về thông tin đầy đủ
      await schedule.populate("meals.dishId");

      res.status(200).json({
        success: true,
        message: "Lịch ăn trưa đã được lưu",
        data: schedule,
      });
    } catch (error) {
      console.error("Create/Update schedule error:", error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Lịch cho tuần này đã tồn tại. Vui lòng sử dụng cập nhật.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Lỗi khi lưu lịch ăn trưa",
        error: error.message,
      });
    }
  }

  // Lấy lịch ăn trưa theo tuần
  static async getScheduleByWeek(req, res) {
    try {
      const { weekStartDate } = req.query;
      const userId = req.user._id;

      if (!weekStartDate) {
        return res.status(400).json({
          success: false,
          message: "weekStartDate là bắt buộc",
        });
      }

      const startDate = new Date(weekStartDate);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "weekStartDate không hợp lệ",
        });
      }

      // Tìm schedule và populate dishId
      const schedule = await LunchSchedule.findOne({
        userId,
        weekStartDate: startDate,
        isActive: true,
      }).populate("meals.dishId");

      if (!schedule) {
        return res.status(200).json({
          success: true,
          message: "Chưa có lịch cho tuần này",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      console.error("Get schedule error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy lịch ăn trưa",
        error: error.message,
      });
    }
  }

  // Lấy tất cả lịch ăn trưa của user (có pagination)
  static async getAllSchedules(req, res) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const schedules = await LunchSchedule.find({
        userId,
        isActive: true,
      })
        .sort({ weekStartDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate("meals.dishId")
        .lean();

      const totalCount = await LunchSchedule.countDocuments({
        userId,
        isActive: true,
      });

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        success: true,
        data: {
          schedules,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get all schedules error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách lịch",
        error: error.message,
      });
    }
  }

  // Tạo lịch tự động dựa trên lịch sử ăn uống (favorites)
  static async generateScheduleFromHistory(req, res) {
    try {
      const { weekStartDate } = req.body;
      const userId = req.user._id;

      if (!weekStartDate) {
        return res.status(400).json({
          success: false,
          message: "weekStartDate là bắt buộc",
        });
      }

      const startDate = new Date(weekStartDate);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "weekStartDate không hợp lệ",
        });
      }

      // Lấy danh sách favorites của user
      const favorites = await FavoriteFood.find({ userId })
        .populate("dishId")
        .lean();

      if (favorites.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Chưa có lịch sử ăn uống. Vui lòng thêm món yêu thích trước.",
          data: null,
        });
      }

      // Tạo meals cho 7 ngày dựa trên favorites
      const meals = [];
      const favoriteDishes = favorites.map((f) => f.dishId).filter(Boolean);

      for (let i = 0; i < 7; i++) {
        const mealDate = new Date(startDate);
        mealDate.setDate(mealDate.getDate() + i);

        // Chọn ngẫu nhiên một món từ favorites
        const randomDish =
          favoriteDishes[Math.floor(Math.random() * favoriteDishes.length)];

        meals.push({
          date: mealDate,
          dishId: randomDish ? randomDish._id : null,
          notes: "",
        });
      }

      // Tính weekEndDate
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      // Tạo hoặc cập nhật schedule
      const schedule = await LunchSchedule.createOrUpdate(
        userId,
        startDate,
        endDate,
        meals
      );

      await schedule.populate("meals.dishId");

      res.status(200).json({
        success: true,
        message: "Lịch ăn trưa đã được tạo tự động từ lịch sử",
        data: schedule,
      });
    } catch (error) {
      console.error("Generate schedule error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo lịch tự động",
        error: error.message,
      });
    }
  }

  // Xóa lịch ăn trưa (soft delete)
  static async deleteSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const userId = req.user._id;

      const schedule = await LunchSchedule.findOneAndUpdate(
        { _id: scheduleId, userId },
        { isActive: false },
        { new: true }
      );

      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lịch ăn trưa",
        });
      }

      res.status(200).json({
        success: true,
        message: "Đã xóa lịch ăn trưa",
      });
    } catch (error) {
      console.error("Delete schedule error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa lịch ăn trưa",
        error: error.message,
      });
    }
  }
}

module.exports = LunchScheduleController;

