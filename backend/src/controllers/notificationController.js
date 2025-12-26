const notificationService = require("../services/notificationService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { HTTP_STATUS } = require("../constants");

class NotificationController {
  /**
   * Get all notifications for the authenticated user
   */
  getUserNotifications = asyncHandler(async (req, res) => {
    const { notifications, pagination } =
      await notificationService.getUserNotifications(req.user.id, req.query);
    return responseOkWithPagination(
      res,
      notifications,
      pagination,
      "Notifications retrieved successfully"
    );
  });

  /**
   * Get unread notification count
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    const result = await notificationService.getUnreadCount(req.user.id);
    return responseOk(res, result, "Unread count retrieved successfully");
  });

  /**
   * Mark a notification as read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    return responseOk(res, notification, "Notification marked as read");
  });

  /**
   * Mark all notifications as read
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user.id);
    return responseOk(res, result, "All notifications marked as read");
  });

  /**
   * Delete a notification
   */
  deleteNotification = asyncHandler(async (req, res) => {
    const result = await notificationService.deleteNotification(
      req.params.id,
      req.user.id
    );
    return responseOk(res, result, "Notification deleted successfully");
  });
}

module.exports = new NotificationController();
