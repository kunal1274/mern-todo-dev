// src/api/index.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Attach a request interceptor to set the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // or "token"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
