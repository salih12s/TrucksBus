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
    return response.data;
  },

  // Register user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      console.log("🚀 Sending registration request with data:", data);
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data
      );
      console.log("✅ Registration successful:", response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      console.error("❌ Registration failed:", {
        status: err.response?.status,
        data: err.response?.data,
        error: err.message,
      });
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  // Refresh token
  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>(
      "/auth/refresh",
      { refreshToken }
    );
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

// Get current user - separate export
export const getCurrentUser = async (): Promise<{
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
}> => {
  const response = await apiClient.get<{
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
  }>("/auth/me");
  return response.data;
};
