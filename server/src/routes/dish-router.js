const express = require("express");
const mongoose = require("mongoose");
const Dish = require("../models/Dish");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");

const Order = require("../models/Order");

const router = express.Router();

// Helper function để validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET all dishes (có pagination)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const dishes = await Dish.find({ isAvailable: true })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const total = await Dish.countDocuments({ isAvailable: true });

    res.json({
      dishes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET dishes by restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const dishes = await Dish.find({
      restaurantId,
      isAvailable: true,
    }).select("-__v");

    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET dishes by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const dishes = await Dish.find({ categoryId })
      .sort({ price: 1 })
      .select("-__v");

    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Search dishes
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const dishes = await Dish.find(
      { $text: { $search: q }, isAvailable: true },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .select("-__v");

    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET popular dishes
router.get("/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const dishes = await Dish.find({ isAvailable: true })
      .sort({ favoriteCount: -1 })
      .limit(limit)
      .select("-__v");

    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET dishes by price range
router.get("/price", async (req, res) => {
  try {
    const min = parseFloat(req.query.min) || 0;
    const max = parseFloat(req.query.max) || 100000;

    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({ message: "Invalid price range" });
    }

    if (min < 0 || max < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    if (min > max) {
      return res.status(400).json({ message: "Min price cannot exceed max price" });
    }

    const dishes = await Dish.find({
      price: { $gte: min, $lte: max },
      isAvailable: true,
    })
      .sort({ price: 1 })
      .select("-__v");

    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single dish by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid dish ID" });
    }

    const dish = await Dish.findById(id)
      .populate("restaurantId", "name address")
      .populate("categoryId", "name")
      .select("-__v");

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    res.json(dish);
  } catch (err) {
    console.error("Error fetching dish:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// POST: Tạo đơn hàng mới (Lưu lịch sử ăn uống)
router.post("/order", async (req, res) => {
  try {
    const { userId, dishId, restaurantId, price } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào cơ bản
    if (!userId || !dishId || !restaurantId || !price) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
    }

    // 2. Kiểm tra ID có hợp lệ không
    if (!isValidObjectId(userId) || !isValidObjectId(dishId) || !isValidObjectId(restaurantId)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // 3. Tạo bản ghi đơn hàng mới
    const newOrder = new Order({
      userId,
      dishId,
      restaurantId,
      price
    });

    // 4. Lưu vào database
    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công và đã ghi vào lịch sử",
      order: savedOrder
    });

  } catch (err) {
    console.error("Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;