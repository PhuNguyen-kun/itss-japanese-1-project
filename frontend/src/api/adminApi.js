import { apiClient } from "./axiosConfig";

// Admin API functions
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  },

  // Get activity trend
  getActivityTrend: async () => {
    const response = await apiClient.get("/admin/dashboard/activity-trend");
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const response = await apiClient.get("/admin/dashboard/recent-activities", {
      params: { limit },
    });
    return response.data;
  },

  // Get all users with pagination and filtering
  getUsers: async (params = {}) => {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Toggle user status (suspend/activate)
  toggleUserStatus: async (userId) => {
    const response = await apiClient.patch(
      `/admin/users/${userId}/toggle-status`
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get all topics with pagination and filtering
  getTopics: async (params = {}) => {
    const response = await apiClient.get("/admin/topics", { params });
    return response.data;
  },

  // Get topic by ID
  getTopicById: async (topicId) => {
    const response = await apiClient.get(`/admin/topics/${topicId}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await apiClient.get("/admin/topics/categories");
    return response.data;
  },

  // Create topic
  createTopic: async (topicData) => {
    const response = await apiClient.post("/admin/topics", topicData);
    return response.data;
  },

  // Update topic
  updateTopic: async (topicId, topicData) => {
    const response = await apiClient.put(`/admin/topics/${topicId}`, topicData);
    return response.data;
  },

  // Delete topic
  deleteTopic: async (topicId) => {
    const response = await apiClient.delete(`/admin/topics/${topicId}`);
    return response.data;
  },

  // Toggle pin topic
  togglePinTopic: async (topicId) => {
    const response = await apiClient.patch(
      `/admin/topics/${topicId}/toggle-pin`
    );
    return response.data;
  },

  // Get stories by date
  getStoriesByDate: async (date) => {
    const response = await apiClient.get("/admin/dashboard/stories-by-date", {
      params: { date },
    });
    return response.data;
  },

  // Delete story
  deleteStory: async (storyId) => {
    const response = await apiClient.delete(`/admin/stories/${storyId}`);
    return response.data;
  },
};

export default adminApi;
