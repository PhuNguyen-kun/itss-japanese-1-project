import { apiClient } from "./axiosConfig";

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

