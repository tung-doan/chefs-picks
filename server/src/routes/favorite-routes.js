const express = require("express");
const router = express.Router();
const FavoriteController = require("../controllers/FavoriteController");
const authMiddleware = require("../middlewares/auth-middleware");

// Apply authentication cho tất cả routes
router.use(authMiddleware);

// Add favorite explicitly
router.post("/", FavoriteController.addFavorite);

// Remove favorite
router.delete("/:dishId", FavoriteController.removeFavorite);

// Get user's favorites with pagination & filters
router.get("/", FavoriteController.getFavorites);

// Check single favorite
router.get("/check/:dishId", FavoriteController.checkFavorite);

// Check multiple favorites (batch)
router.post("/check-multiple", FavoriteController.checkMultipleFavorites);

// Get statistics
router.get("/stats", FavoriteController.getFavoriteStats);

// Get popular dishes
router.get("/popular", FavoriteController.getPopularDishes);

module.exports = router;
