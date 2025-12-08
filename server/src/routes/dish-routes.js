const express = require("express");
const router = express.Router();
const DishController = require("../controllers/dish-controller");

// API gợi ý ngẫu nhiên 3 món ăn (public, không cần auth)
router.get("/random-suggestions", DishController.getRandomSuggestions);

module.exports = router;