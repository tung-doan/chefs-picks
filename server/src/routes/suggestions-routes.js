const express = require("express");
const router = express.Router();
const SuggestionController = require("../controllers/SuggestionController");

// GET /api/suggestions
router.get("/", SuggestionController.getSuggestions);

module.exports = router;
