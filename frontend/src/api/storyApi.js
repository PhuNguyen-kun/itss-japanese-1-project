import { apiClient } from "./axiosConfig";

// Story API functions
export const storyApi = {
  // Get all stories (with optional user_id filter)
  getAll: async (params = {}) => {
    const response = await apiClient.get("/stories", { params });
    return response.data;
  },

  // Get story by ID
  getById: async (id) => {
    const response = await apiClient.get(`/stories/${id}`);
    return response.data;
  },

  // Create new story (supports both JSON and FormData)
  create: async (storyData) => {
    const config = {};
    if (storyData instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }
    const response = await apiClient.post("/stories", storyData, config);
    return response.data;
  },

  // Update story (supports both JSON and FormData)
  update: async (id, storyData) => {
    const config = {};
    if (storyData instanceof FormData) {
      config.headers = {
        "Content-Type": "multipart/form-data",
      };
    }
    const response = await apiClient.put(`/stories/${id}`, storyData, config);
    return response.data;
  },

  // Delete story
  delete: async (id) => {
    const response = await apiClient.delete(`/stories/${id}`);
    return response.data;
  },

  // Get trending stories
  getTrending: async (limit = 20) => {
    const response = await apiClient.get("/stories/trending", {
      params: { limit },
    });
    return response.data;
  },
};

export default storyApi;
