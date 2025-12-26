import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Comment API functions
export const commentApi = {
  // Get comments by story ID
  getByStoryId: async (storyId, params = {}) => {
    const response = await apiClient.get(`/comments/stories/${storyId}/comments`, {
      params,
    });
    return response.data;
  },

  // Get comment by ID
  getById: async (id) => {
    const response = await apiClient.get(`/comments/${id}`);
    return response.data;
  },

  // Create new comment
  create: async (storyId, commentData) => {
    const response = await apiClient.post(
      `/comments/stories/${storyId}/comments`,
      commentData
    );
    return response.data;
  },

  // Update comment
  update: async (id, commentData) => {
    const response = await apiClient.put(`/comments/${id}`, commentData);
    return response.data;
  },

  // Delete comment
  delete: async (id) => {
    const response = await apiClient.delete(`/comments/${id}`);
    return response.data;
  },
};

export default commentApi;

