import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("[Axios] No token found for request:", config.url);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[Axios] Authorization header set for:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[Axios] Unauthorized request - clearing token and user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
