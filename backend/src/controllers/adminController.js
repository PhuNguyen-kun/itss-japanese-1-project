const adminService = require("../services/adminService");
const { responseOk } = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");

class AdminController {
  // Get dashboard statistics
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    return responseOk(res, stats, "Dashboard stats retrieved successfully");
  });

  // Get activity trend
  getActivityTrend = asyncHandler(async (req, res) => {
    const trend = await adminService.getActivityTrend();
    return responseOk(res, trend, "Activity trend retrieved successfully");
  });

  // Get recent activities
  getRecentActivities = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await adminService.getRecentActivities(limit);
    return responseOk(res, activities, "Recent activities retrieved successfully");
  });

  // Get all users with pagination and filtering
  getUsers = asyncHandler(async (req, res) => {
    const result = await adminService.getUsers(req.query);
    return responseOk(res, result, "Users retrieved successfully");
  });

  // Get user by ID
  getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await adminService.getUserById(userId);
    return responseOk(res, user, "User retrieved successfully");
  });

  // Update user
  updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await adminService.updateUser(userId, req.body);
    return responseOk(res, user, "ユーザー情報を更新しました");
  });

  // Toggle user status (suspend/activate)
  toggleUserStatus = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await adminService.toggleUserStatus(userId);
    const message = user.status === "active" ? "ユーザーを有効化しました" : "ユーザーを無効化しました";
    return responseOk(res, user, message);
  });

  // Delete user
  deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    await adminService.deleteUser(userId);
    return responseOk(res, null, "ユーザーを削除しました");
  });

  // Get all topics with pagination
  getTopics = asyncHandler(async (req, res) => {
    const result = await adminService.getTopics(req.query);
    return responseOk(res, result, "Topics retrieved successfully");
  });

  // Get topic by ID
  getTopicById = asyncHandler(async (req, res) => {
    const topicId = req.params.id;
    const topic = await adminService.getTopicById(topicId);
    return responseOk(res, topic, "Topic retrieved successfully");
  });

  // Get all categories
  getCategories = asyncHandler(async (req, res) => {
    const result = await adminService.getCategories();
    return responseOk(res, result, "Categories retrieved successfully");
  });

  // Create topic
  createTopic = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const topic = await adminService.createTopic(userId, req.body);
    return responseOk(res, topic, "トピックを作成しました");
  });

  // Update topic
  updateTopic = asyncHandler(async (req, res) => {
    const topicId = req.params.id;
    const topic = await adminService.updateTopic(topicId, req.body);
    return responseOk(res, topic, "トピックを更新しました");
  });

  // Delete topic
  deleteTopic = asyncHandler(async (req, res) => {
    const topicId = req.params.id;
    await adminService.deleteTopic(topicId);
    return responseOk(res, null, "トピックを削除しました");
  });

  // Toggle pin topic
  togglePinTopic = asyncHandler(async (req, res) => {
    const topicId = req.params.id;
    const result = await adminService.togglePinTopic(topicId);
    const message = result.is_pinned ? "トピックをピン留めしました" : "トピックのピン留めを解除しました";
    return responseOk(res, result, message);
  });

  // Get stories by date
  getStoriesByDate = asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!date) {
      return responseOk(res, [], "Date parameter is required");
    }
    const stories = await adminService.getStoriesByDate(date);
    return responseOk(res, stories, "Stories retrieved successfully");
  });

  // Delete story
  deleteStory = asyncHandler(async (req, res) => {
    const storyId = req.params.id;
    await adminService.deleteStory(storyId);
    return responseOk(res, null, "ストーリーを削除しました");
  });
}

module.exports = new AdminController();

