const Order = require("../models/Order");

// Hàm lưu lịch sử khi đặt hàng
exports.createHistory = async (req, res) => {
  try {
    const { userId, dishId, restaurantId, price } = req.body;

    const newOrder = new Order({
      userId,
      dishId,
      restaurantId,
      price,
      orderDate: new Date()
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: "Lưu lịch sử thành công!",
      order: savedOrder
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi lưu lịch sử", error: err.message });
  }
};

// Hàm lấy danh sách lịch sử của một User
exports.getHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await Order.find({ userId })
      .populate("dishId", "name image") // Lấy thông tin món ăn từ Model Dish
      .populate("restaurantId", "name") // Lấy tên nhà hàng từ Model Restaurant
      .sort({ orderDate: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy lịch sử", error: err.message });
  }
};