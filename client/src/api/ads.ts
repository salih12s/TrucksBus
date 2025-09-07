import apiClient from "./client";

export interface AdImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
}

export interface Ad {
  id: number;
  title: string;
  description?: string;
  price?: number;
  year?: number;
  mileage?: number;
  location?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  viewCount: number;
  isPromoted: boolean;
  promotedUntil?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  brand?: {
    id: number;
    name: string;
    slug: string;
  };
  model?: {
    id: number;
    name: string;
    slug: string;
  };
  variant?: {
    id: number;
    name: string;
    slug: string;
  };
  images: AdImage[];
}

export interface GetMyAdsResponse {
  ads: Ad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetMyAdsParams {
  status?: string;
  page?: number;
  limit?: number;
}

// Kullanıcının kendi ilanlarını getir
export const getMyAds = async (
  params?: GetMyAdsParams
): Promise<GetMyAdsResponse> => {
  const response = await apiClient.get("/ads/user/my-ads", { params });
  return response.data as GetMyAdsResponse;
};

// İlan detayını getir
export const getAdById = async (id: string): Promise<Ad> => {
  const response = await apiClient.get(`/ads/${id}`);
  return response.data as Ad;
};

// İlan sil
export const deleteAd = async (id: string): Promise<void> => {
  await apiClient.delete(`/ads/${id}`);
};

// İlan güncelle
export const updateAd = async (id: string, data: Partial<Ad>): Promise<Ad> => {
  const response = await apiClient.put(`/ads/${id}`, data);
  return response.data as Ad;
};
