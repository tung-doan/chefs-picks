const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");

// Định nghĩa các đường dẫn đơn giản
router.post("/add", historyController.createHistory);
router.get("/user/:userId", historyController.getHistoryByUser);

module.exports = router;