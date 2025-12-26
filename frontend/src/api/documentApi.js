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
    const baseURL = apiClient.defaults.baseURL.replace("/api", "");
    return `${baseURL}${fileUrl}`;
  },
};

export default documentApi;
