const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/adminAuth");

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard stats
router.get("/dashboard/stats", adminController.getDashboardStats);

// Activity trend
router.get("/dashboard/activity-trend", adminController.getActivityTrend);

// Recent activities
router.get("/dashboard/recent-activities", adminController.getRecentActivities);

// User management
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.patch("/users/:id/toggle-status", adminController.toggleUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// Topic management
router.get("/topics", adminController.getTopics);
router.get("/topics/categories", adminController.getCategories);
router.get("/topics/:id", adminController.getTopicById);
router.post("/topics", adminController.createTopic);
router.put("/topics/:id", adminController.updateTopic);
router.delete("/topics/:id", adminController.deleteTopic);
router.patch("/topics/:id/toggle-pin", adminController.togglePinTopic);

// Dashboard - Get stories by date
router.get("/dashboard/stories-by-date", adminController.getStoriesByDate);

// Story management
router.delete("/stories/:id", adminController.deleteStory);

module.exports = router;

