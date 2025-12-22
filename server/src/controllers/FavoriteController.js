const FavoriteFood = require("../models/FavoriteFood");
const Dish = require("../models/Dish");
const Category = require("../models/Category");

class FavoriteController {
  // Thêm món yêu thích
  static async addFavorite(req, res) {
    try {
      const { dishId } = req.body;
      const userId = req.user._id;

      if (!dishId) {
        return res.status(400).json({
          success: false,
          message: "dishId là bắt buộc",
        });
      }

      // Check duplicate
      const exists = await FavoriteFood.checkDuplicate(userId, dishId);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Món ăn đã có trong danh sách yêu thích",
        });
      }

      // Validate dish
      const dish = await Dish.findById(dishId);
      if (!dish) {
        return res.status(404).json({
          success: false,
          message: "Món ăn không tồn tại",
        });
      }

      // Create favorite
      const favorite = await FavoriteFood.create({
        userId,
        dishId,
      });

      // Increment dish favorite count
      await Dish.findByIdAndUpdate(dishId, {
        $inc: { favoriteCount: 1 },
      });

      res.status(201).json({
        success: true,
        message: "Đã thêm vào yêu thích",
        data: favorite,
      });
    } catch (error) {
      console.error("Add favorite error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi thêm yêu thích",
        error: error.message,
      });
    }
  }

  // Xóa món yêu thích
  static async removeFavorite(req, res) {
    try {
      const { dishId } = req.params;
      const userId = req.user._id;

      const favorite = await FavoriteFood.findOneAndDelete({ userId, dishId });

      if (!favorite) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy món yêu thích",
        });
      }

      // Decrement dish favorite count
      await Dish.findByIdAndUpdate(dishId, {
        $inc: { favoriteCount: -1 },
      });

      res.status(200).json({
        success: true,
        message: "Đã xóa khỏi yêu thích",
      });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa yêu thích",
        error: error.message,
      });
    }
  }

  // Lấy danh sách yêu thích với pagination
  static async getFavorites(req, res) {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const category = req.query.category;
      const sortBy = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
      const search = req.query.search;

      // Build aggregation pipeline
      const matchStage = { userId };

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "dishes",
            localField: "dishId",
            foreignField: "_id",
            as: "dish",
          },
        },
        { $unwind: "$dish" },
      ];

      // Filter by category
      if (category) {
        pipeline.push({
          $lookup: {
            from: "categories",
            localField: "dish.categoryId",
            foreignField: "_id",
            as: "category",
          },
        });
        pipeline.push({
          $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
        });
        pipeline.push({
          $match: { "category.name": category },
        });
      }

      // Filter by search
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "dish.name": { $regex: search, $options: "i" } },
              { "dish.description": { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      // Count total before pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await FavoriteFood.aggregate(countPipeline);
      const totalCount = countResult[0]?.total || 0;

      // Sort
      const sortField =
        sortBy === "name"
          ? "dish.name"
          : sortBy === "price"
          ? "dish.price"
          : sortBy === "rating"
          ? "dish.rating"
          : "createdAt";

      pipeline.push({ $sort: { [sortField]: sortOrder } });

      // Pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      pipeline.push({
        $project: {
          _id: 1,
          userId: 1,
          dishId: 1,
          createdAt: 1,
          updatedAt: 1,
          dish: {
            _id: 1,
            name: 1,
            categoryId: 1,
            price: 1,
            rating: 1,
            image: 1,
            description: 1,
            isAvailable: 1,
            favoriteCount: 1,
          },
        },
      });

      const favorites = await FavoriteFood.aggregate(pipeline);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        success: true,
        data: {
          favorites,
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
      console.error("Get favorites error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách yêu thích",
        error: error.message,
      });
    }
  }

  // Kiểm tra món ăn có trong yêu thích không
  static async checkFavorite(req, res) {
    try {
      const { dishId } = req.params;
      const userId = req.user._id;

      const isFavorite = await FavoriteFood.checkDuplicate(userId, dishId);

      res.status(200).json({
        success: true,
        data: { isFavorite },
      });
    } catch (error) {
      console.error("Check favorite error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra yêu thích",
        error: error.message,
      });
    }
  }

  // Kiểm tra nhiều món cùng lúc
  static async checkMultipleFavorites(req, res) {
    try {
      const { dishIds } = req.body;
      const userId = req.user._id;

      if (!Array.isArray(dishIds) || dishIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "dishIds phải là mảng không rỗng",
        });
      }

      const favorites = await FavoriteFood.find({
        userId,
        dishId: { $in: dishIds },
      })
        .select("dishId")
        .lean();

      const favoriteDishIds = favorites.map((f) => f.dishId.toString());

      const result = dishIds.reduce((acc, dishId) => {
        acc[dishId] = favoriteDishIds.includes(dishId.toString());
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Check multiple favorites error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra danh sách yêu thích",
        error: error.message,
      });
    }
  }

  // Thống kê yêu thích
  static async getFavoriteStats(req, res) {
    try {
      const userId = req.user._id;

      const stats = await FavoriteFood.aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: "dishes",
            localField: "dishId",
            foreignField: "_id",
            as: "dish",
          },
        },
        { $unwind: "$dish" },
        {
          $lookup: {
            from: "categories",
            localField: "dish.categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$category.name",
            count: { $sum: 1 },
            avgPrice: { $avg: "$dish.price" },
            avgRating: { $avg: "$dish.rating" },
            totalSpent: { $sum: "$dish.price" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const totalFavorites = stats.reduce((sum, stat) => sum + stat.count, 0);

      res.status(200).json({
        success: true,
        data: {
          totalFavorites,
          byCategory: stats,
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê",
        error: error.message,
      });
    }
  }

  // Món ăn phổ biến
  static async getPopularDishes(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const dishes = await Dish.find({ isAvailable: true })
        .sort({ favoriteCount: -1 })
        .limit(limit)
        .select("name categoryId price rating image favoriteCount")
        .populate("categoryId", "name")
        .lean();

      res.status(200).json({
        success: true,
        data: dishes,
      });
    } catch (error) {
      console.error("Get popular dishes error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy món phổ biến",
        error: error.message,
      });
    }
  }
}

module.exports = FavoriteController;
