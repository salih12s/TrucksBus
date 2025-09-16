import { API_BASE_URL } from "./client";

export interface FavoriteResponse {
  success: boolean;
  message?: string;
  isFavorited?: boolean;
}

// Check if ad is favorited
export const checkFavorite = async (
  adId: number,
  token: string
): Promise<FavoriteResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/check/${adId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, isFavorited: data.isFavorited };
    } else if (response.status === 404) {
      return { success: true, isFavorited: false };
    } else {
      return { success: false, isFavorited: false };
    }
  } catch (error) {
    console.error("Favori kontrol hatası:", error);
    return { success: false, isFavorited: false };
  }
};

// Add to favorites
export const addToFavorites = async (
  adId: number,
  token: string
): Promise<FavoriteResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adId }),
    });

    if (response.ok) {
      return { success: true, message: "Favorilere eklendi" };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Favorilere eklenemedi",
      };
    }
  } catch (error) {
    console.error("Favorilere ekleme hatası:", error);
    return { success: false, message: "Favorilere eklenemedi" };
  }
};

// Remove from favorites
export const removeFromFavorites = async (
  adId: number,
  token: string
): Promise<FavoriteResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${adId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return { success: true, message: "Favorilerden çıkarıldı" };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Favorilerden çıkarılamadı",
      };
    }
  } catch (error) {
    console.error("Favorilerden çıkarma hatası:", error);
    return { success: false, message: "Favorilerden çıkarılamadı" };
  }
};

// Get user's favorites
export const getUserFavorites = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Favoriler yüklenemedi");
    }
  } catch (error) {
    console.error("Favoriler yükleme hatası:", error);
    throw error;
  }
};
