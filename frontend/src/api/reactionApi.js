import { apiClient } from "./axiosConfig";

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

