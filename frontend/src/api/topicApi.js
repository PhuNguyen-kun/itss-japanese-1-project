import { apiClient } from "./axiosConfig";

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
