import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const savedStoryApi = {
  // Get all saved stories
  getAll: async (params) => {
    const response = await apiClient.get("/saved-stories", { params });
    return response.data;
  },

  // Save a story
  save: async (storyId) => {
    const response = await apiClient.post(`/saved-stories/${storyId}`);
    return response.data;
  },

  // Unsave a story
  unsave: async (storyId) => {
    const response = await apiClient.delete(`/saved-stories/${storyId}`);
    return response.data;
  },

  // Check if story is saved
  checkIfSaved: async (storyId) => {
    const response = await apiClient.get(`/saved-stories/${storyId}/check`);
    return response.data;
  },
};

export default savedStoryApi;

