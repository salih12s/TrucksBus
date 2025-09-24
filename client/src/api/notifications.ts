import apiClient from "./client";
import { getTokenFromStorage } from "../utils/tokenUtils";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  message?: string;
}

export const notificationAPI = {
  // Kullanıcının bildirimlerini getir
  getNotifications: async (): Promise<NotificationResponse> => {
    const token = getTokenFromStorage();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await apiClient.get("/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as NotificationResponse;
  },

  // Bildirimi okundu olarak işaretle
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const token = getTokenFromStorage();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await apiClient.put(
      `/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as { success: boolean };
  },

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const token = getTokenFromStorage();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await apiClient.put(
      "/notifications/mark-all-read",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as { success: boolean };
  },

  // Bildirimi sil
  deleteNotification: async (
    notificationId: string
  ): Promise<{ success: boolean }> => {
    const token = getTokenFromStorage();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await apiClient.delete(
      `/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as { success: boolean };
  },
};

export default notificationAPI;
