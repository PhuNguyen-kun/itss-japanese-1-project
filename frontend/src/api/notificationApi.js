import { apiClient } from "./axiosConfig";

// Notification API functions
export const notificationApi = {
  // Get all notifications with optional filtering
  getAll: async (params = {}) => {
    const response = await apiClient.get("/notifications", { params });
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.patch("/notifications/mark-all-read");
    return response.data;
  },

  // Delete a notification
  delete: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};
