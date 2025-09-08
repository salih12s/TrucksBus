import apiClient from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: "USER" | "CORPORATE";
  // Corporate fields
  companyName?: string;
  taxId?: string;
  tradeRegistryNo?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: string;
    companyName?: string;
    taxId?: string;
    tradeRegistryNo?: string;
    address?: string;
    city?: string;
    country?: string;
    isVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);

    // Store tokens in localStorage
    const { accessToken, refreshToken } = response.data.tokens;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return response.data;
  },

  // Register user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);

    // Store tokens in localStorage
    const { accessToken, refreshToken } = response.data.tokens;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Always clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // Refresh token
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{ accessToken: string }>(
      "/auth/refresh",
      { refreshToken }
    );

    // Update access token
    localStorage.setItem("accessToken", response.data.accessToken);

    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Update password
  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      "/auth/update-password",
      data
    );
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<{
    totalAds: number;
    activeAds: number;
    pendingAds: number;
    totalViews: number;
    activeDopings: number;
  }> => {
    const response = await apiClient.get<{
      totalAds: number;
      activeAds: number;
      pendingAds: number;
      totalViews: number;
      activeDopings: number;
    }>("/auth/stats");
    return response.data;
  },
};
