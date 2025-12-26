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

// Topic API functions
export const topicApi = {
  // Get all topics (no pagination)
  getAll: async () => {
    const response = await apiClient.get("/topics");
    return response.data;
  },

  // Get trending topics
  getTrending: async (limit = 5) => {
    const response = await apiClient.get("/topics/trending", {
      params: { limit },
    });
    return response.data;
  },
};

export default topicApi;
