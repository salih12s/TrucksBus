import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// Helper function to safely parse query/params that can be string or string[]
const parseStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

const parseIntParam = (param: string | string[] | undefined): number => {
  const str = parseStringParam(param);
  return parseInt(str) || 0;
};

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Bildirim oluşturma helper fonksiyonu
export const createNotification = async (
  userId: number,
  title: string,
  message: string,
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO",
  relatedId?: number
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedId,
      },
    });
    return notification;
  } catch (error) {
    console.error("Bildirim oluşturulurken hata:", error);
    throw error;
  }
};

// Kullanıcının bildirimlerini getir
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Kullanıcı kimliği bulunamadı",
      });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Son 50 bildirim
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Bildirimler getirilirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// Bildirimi okundu olarak işaretle
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Kullanıcı kimliği bulunamadı",
      });
      return;
    }

    await prisma.notification.update({
      where: {
        id: parseInt(notificationId),
        userId, // Sadece kendi bildirimini güncelleyebilir
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: "Bildirim okundu olarak işaretlendi",
    });
  } catch (error) {
    console.error("Bildirim güncellenirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Kullanıcı kimliği bulunamadı",
      });
      return;
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: "Tüm bildirimler okundu olarak işaretlendi",
    });
  } catch (error) {
    console.error("Bildirimler güncellenirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// Bildirimi sil
export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Kullanıcı kimliği bulunamadı",
      });
      return;
    }

    await prisma.notification.delete({
      where: {
        id: parseInt(notificationId),
        userId, // Sadece kendi bildirimini silebilir
      },
    });

    res.json({
      success: true,
      message: "Bildirim silindi",
    });
  } catch (error) {
    console.error("Bildirim silinirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};
