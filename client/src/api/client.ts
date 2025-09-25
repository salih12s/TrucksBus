import axios from "axios";
import { getTokenFromStorage } from "../utils/tokenUtils";

// 🔧 Güvenilir API URL belirleme
const getApiBaseUrl = () => {
  // Development environment check
  if (import.meta.env.DEV || window.location.hostname === "localhost") {
    return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  }

  // Production fallback
  return (
    import.meta.env.VITE_API_URL ||
    "https://trucksbus-production.up.railway.app/api"
  );
};

export const API_BASE_URL = getApiBaseUrl();

console.log("🔧 API Client Config:", {
  baseURL: API_BASE_URL,
  env: import.meta.env.VITE_API_URL,
  isDev: import.meta.env.DEV,
  hostname: window.location.hostname,
});

// Create axios instance with optimized config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // ✅ FIXED - Keep false for stability
  timeout: 30000, // 30 saniye normal timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ REQUEST INTERCEPTOR - Add token to protected requests
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = getTokenFromStorage();
      if (token && config.headers && !config.url?.includes("/public/")) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Token added to request:", config.url);
      }
    } catch (error) {
      console.warn("Token interceptor error:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("🚫 401 Unauthorized - Redirecting to login");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Video upload client with token support
export const videoUploadClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 300000, // 5 dakika - Video upload için
  // Content-Type header'ı FormData için otomatik set edilecek
});

// ✅ Add token to video upload requests
videoUploadClient.interceptors.request.use(
  (config) => {
    try {
      const token = getTokenFromStorage();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Token added to video upload request:", config.url);
      }
    } catch (error) {
      console.warn("Video upload token interceptor error:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle video upload 401 errors
videoUploadClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "🚫 401 Unauthorized in video upload - Redirecting to login"
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
