import apiClient from "./client";

interface ApiResponse<T> {
  [key: string]: T;
}

export interface Package {
  name: string;
  adLimit: number;
  price: number;
  originalPrice: number;
  features: string[];
}

export interface PackageDetails {
  trucks: Package;
  trucks_plus: Package;
  trucksbus: Package;
}

export interface Subscription {
  id: number;
  userId: number;
  packageType: string;
  packageName: string;
  adLimit: number;
  adsUsed: number;
  remainingAds: number;
  price: number;
  isActive: boolean;
  isTrial: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export const subscriptionApi = {
  // Tüm paketleri getir
  getPackages: async (): Promise<PackageDetails> => {
    const response = await apiClient.get<ApiResponse<PackageDetails>>(
      "/subscriptions/packages"
    );
    return response.data.packages;
  },

  // Kullanıcının aktif paketini getir
  getMySubscription: async (): Promise<Subscription | null> => {
    const response = await apiClient.get<ApiResponse<Subscription | null>>(
      "/subscriptions/my-subscription"
    );
    return response.data.subscription;
  },

  // Yeni paket satın al
  subscribe: async (
    packageType: string
  ): Promise<{ subscription: Subscription; message: string }> => {
    const response = await apiClient.post<{
      subscription: Subscription;
      message: string;
    }>("/subscriptions/subscribe", {
      packageType,
    });
    return {
      subscription: response.data.subscription,
      message: response.data.message,
    };
  },
};
