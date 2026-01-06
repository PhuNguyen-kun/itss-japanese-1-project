import { apiClient } from "./axiosConfig";

// Auth API functions
export const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (username, password) => {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await apiClient.get(`/auth/users/${userId}`);
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put("/auth/profile", profileData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const response = await apiClient.post("/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Search users
  searchUsers: async (query, limit = 10) => {
    const response = await apiClient.get("/auth/users/search", {
      params: { q: query, limit },
    });
    return response.data;
  },
};

export default authApi;
