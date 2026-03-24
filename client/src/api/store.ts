import apiClient from "./client";

export interface Store {
    id: number;
    userId: number;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
    workingHours: Record<string, { open: string; close: string; closed?: boolean }> | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        firstName: string | null;
        lastName: string | null;
        companyName: string | null;
        profileImageUrl: string | null;
        createdAt: string;
        role: string;
        _count: { ads: number };
    };
}

export interface StoreAd {
    id: number;
    title: string;
    price: number | null;
    currency: string;
    year: number | null;
    mileage: number | null;
    status: string;
    createdAt: string;
    images: { id: number; url: string; imageUrl?: string; isPrimary: boolean; displayOrder: number }[];
    category: { id: number; name: string; slug: string };
    brand: { id: number; name: string; slug: string } | null;
    model: { id: number; name: string; slug: string } | null;
    city: { id: number; name: string } | null;
}

export interface StoreAdsResponse {
    ads: StoreAd[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const storeApi = {
    getBySlug: (slug: string) =>
        apiClient.get<Store>(`/store/${slug}`).then((r) => r.data),

    getByUserId: (userId: number) =>
        apiClient.get<Store>(`/store/user/${userId}`).then((r) => r.data),

    getAds: (slug: string, params: Record<string, string | number> = {}) =>
        apiClient
            .get<StoreAdsResponse>(`/store/${slug}/ads`, { params })
            .then((r) => r.data),

    getMyStore: () =>
        apiClient.get<Store>("/store/my/store").then((r) => r.data),

    upsert: (formData: FormData) =>
        apiClient
            .post<Store>("/store", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data),
};
