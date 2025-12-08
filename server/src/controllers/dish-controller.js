const Dish = require("../models/Dish");

class DishController {
  // API gợi ý ngẫu nhiên 3 món ăn
  static async getRandomSuggestions(req, res) {
    try {
      // Sử dụng aggregation với $sample để lấy ngẫu nhiên 3 món
      // Chỉ lấy các món đang có sẵn (isAvailable: true)
      const randomDishes = await Dish.aggregate([
        {
          $match: {
            isAvailable: true,
          },
        },
        {
          $sample: { size: 3 },
        },
        {
          $lookup: {
            from: "restaurants",
            localField: "restaurantId",
            foreignField: "_id",
            as: "restaurant",
          },
        },
        {
          $unwind: {
            path: "$restaurant",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            image: 1,
            rating: 1,
            ingredients: 1,
            favoriteCount: 1,
            restaurant: {
              _id: "$restaurant._id",
              name: "$restaurant.name",
              address: "$restaurant.address",
              phone: "$restaurant.phone",
              rating: "$restaurant.rating",
              image: "$restaurant.image",
              // Thêm các trường khác của restaurant nếu cần
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

      // Kiểm tra nếu không đủ 3 món
      if (randomDishes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy món ăn nào",
        });
      }

      res.status(200).json({
        success: true,
        message: "Gợi ý món ăn ngẫu nhiên",
        data: randomDishes,
        count: randomDishes.length,
      });
    } catch (error) {
      console.error("Error getting random suggestions:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy gợi ý món ăn",
        error: error.message,
      });
    }
  }
}

module.exports = DishController;