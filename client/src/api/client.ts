import axios from "axios";
// import { getTokenFromStorage } from "../utils/tokenUtils"; // ❌ DISABLED - No interceptors

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

// ❌ INTERCEPTORS DISABLED FOR STABILITY
// Interceptor'lar network sorunlarına neden oluyor
// Token gerektiğinde manuel olarak eklenecek

/*
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = getTokenFromStorage();
      if (token && config.headers && !config.url?.includes('/public/')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Token interceptor error:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
*/

// ❌ RESPONSE INTERCEPTOR DISABLED FOR STABILITY
// Token refresh sorunları network hatalarına sebep oluyor
// Auth gerektiğinde manuel olarak handle edilecek

/*
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post<{ accessToken: string }>(
            `${API_BASE_URL}/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
*/

// ✅ Simple video upload client - NO INTERCEPTORS
export const videoUploadClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 300000, // 5 dakika - Video upload için
  // Content-Type header'ı FormData için otomatik set edilecek
});

// ❌ NO INTERCEPTORS FOR VIDEO CLIENT - Manual token handling

export default apiClient;
