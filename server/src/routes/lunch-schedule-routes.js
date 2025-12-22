const express = require("express");
const router = express.Router();
const LunchScheduleController = require("../controllers/LunchScheduleController");
const authMiddleware = require("../middlewares/auth-middleware");

// Apply authentication cho tất cả routes
router.use(authMiddleware);

// Tạo hoặc cập nhật lịch ăn trưa theo tuần
router.post("/", LunchScheduleController.createOrUpdateSchedule);

// Lấy lịch ăn trưa theo tuần
router.get("/week", LunchScheduleController.getScheduleByWeek);

// Lấy tất cả lịch ăn trưa của user
router.get("/", LunchScheduleController.getAllSchedules);

// Tạo lịch tự động từ lịch sử ăn uống
router.post("/generate", LunchScheduleController.generateScheduleFromHistory);

// Xóa lịch ăn trưa
router.delete("/:scheduleId", LunchScheduleController.deleteSchedule);

module.exports = router;

