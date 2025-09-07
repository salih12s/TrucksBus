import apiClient from "./client";

export interface DopingPackage {
  id: string;
  name: string;
  description: string;
  originalPrice?: number;
  price: number;
  isActive: boolean;
  duration: number; // gün cinsinden
  features: string[];
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDoping {
  id: string;
  userId: number;
  packageId: string;
  isActive: boolean;
  activatedAt: string;
  expiresAt: string;
  package: DopingPackage;
}

export interface ActivateDopingRequest {
  packageId: string;
}

export interface DopingResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// Tüm doping paketlerini getir
export const getDopingPackages = async (): Promise<DopingPackage[]> => {
  const response = await apiClient.get("/doping/packages");
  return response.data as DopingPackage[];
};

// Kullanıcının aktif dopinglerini getir
export const getUserDopings = async (): Promise<UserDoping[]> => {
  const response = await apiClient.get("/doping/user-dopings");
  return response.data as UserDoping[];
};

// Doping paketlerini aktif et
export const activateDoping = async (
  data: ActivateDopingRequest
): Promise<DopingResponse> => {
  const response = await apiClient.post("/doping/activate", data);
  return response.data as DopingResponse;
};

// Dopingi deaktif et
export const deactivateDoping = async (
  dopingId: number
): Promise<DopingResponse> => {
  const response = await apiClient.delete(`/doping/deactivate/${dopingId}`);
  return response.data as DopingResponse;
};

// Kullanıcının ilanlarını doping için getir
export const getAdsForDoping = async (): Promise<
  { id: number; title: string }[]
> => {
  const response = await apiClient.get("/doping/user-ads");
  return response.data as { id: number; title: string }[];
};
