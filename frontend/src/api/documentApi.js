import { apiClient } from "./axiosConfig";

const documentApi = {
  /**
   * Upload a new document
   */
  upload: async (formData) => {
    const response = await apiClient.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get all documents with filters
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get("/documents", { params });
    return response.data;
  },

  /**
   * Get my uploaded documents
   */
  getMy: async (params = {}) => {
    const response = await apiClient.get("/documents/my", { params });
    return response.data;
  },

  /**
   * Get saved documents
   */
  getSaved: async (params = {}) => {
    const response = await apiClient.get("/documents/saved", { params });
    return response.data;
  },

  /**
   * Get a single document by ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  /**
   * Delete a document
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  /**
   * Save/bookmark a document
   */
  save: async (id) => {
    const response = await apiClient.post(`/documents/${id}/save`);
    return response.data;
  },

  /**
   * Unsave/remove bookmark from a document
   */
  unsave: async (id) => {
    const response = await apiClient.delete(`/documents/${id}/save`);
    return response.data;
  },

  /**
   * Download a document
   */
  download: (fileUrl) => {
    // Get base URL from environment or use default
    const envBaseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    const serverBaseURL = envBaseURL.replace("/api", "");
    return `${serverBaseURL}${fileUrl}`;
  },
};

export default documentApi;
