const express = require("express");
const router = express.Router();
const savedStoryController = require("../controllers/savedStoryController");
const authMiddleware = require("../middlewares/auth");

// All routes require authentication
router.use(authMiddleware);

// Get all saved stories for current user
router.get("/", savedStoryController.getSavedStories);

// Check if story is saved
router.get("/:storyId/check", savedStoryController.checkIfSaved);

// Save a story
router.post("/:storyId", savedStoryController.saveStory);

// Unsave a story
router.delete("/:storyId", savedStoryController.unsaveStory);

module.exports = router;

