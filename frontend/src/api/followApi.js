import { apiClient } from "./axiosConfig";

// Follow API functions
export const followApi = {
  // Follow a user
  follow: async (userId) => {
    const response = await apiClient.post(`/follows/${userId}/follow`);
    return response.data;
  },

  // Unfollow a user
  unfollow: async (userId) => {
    const response = await apiClient.delete(`/follows/${userId}/unfollow`);
    return response.data;
  },

  // Get followers list
  getFollowers: async (userId, params = {}) => {
    const response = await apiClient.get(`/follows/${userId}/followers`, {
      params,
    });
    return response.data;
  },

  // Get following list
  getFollowing: async (userId, params = {}) => {
    const response = await apiClient.get(`/follows/${userId}/following`, {
      params,
    });
    return response.data;
  },

  // Check if following a user
  checkIfFollowing: async (userId) => {
    const response = await apiClient.get(`/follows/${userId}/check`);
    return response.data;
  },
};

export default followApi;
