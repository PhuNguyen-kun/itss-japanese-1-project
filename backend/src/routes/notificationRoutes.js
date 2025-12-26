const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/auth");
const {
  validateGetNotifications,
} = require("../validators/notificationValidator");

// All notification routes require authentication
router.use(authMiddleware);

// Get user's notifications with optional filtering
router.get(
  "/",
  validateGetNotifications,
  notificationController.getUserNotifications
);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Mark specific notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
