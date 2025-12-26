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

// Reaction API functions
export const reactionApi = {
  // Get reactions by target (story or comment)
  getByTarget: async (targetType, targetId, params = {}) => {
    const response = await apiClient.get(`/reactions/${targetType}/${targetId}`, {
      params,
    });
    return response.data;
  },

  // Create or update reaction
  create: async (reactionData) => {
    const response = await apiClient.post("/reactions", reactionData);
    return response.data;
  },

  // Delete reaction
  delete: async (id) => {
    const response = await apiClient.delete(`/reactions/${id}`);
    return response.data;
  },
};

export default reactionApi;

