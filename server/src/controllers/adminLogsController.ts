import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../config/database";

// Admin log oluşturma helper fonksiyonu
export const createAdminLog = async (
  adminId: number,
  adminEmail: string,
  action: string,
  details?: string,
  targetUserId?: number,
  targetUserEmail?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        adminEmail,
        action,
        details,
        targetUserId,
        targetUserEmail,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Admin log creation failed:", error);
    // Log creation hatası sistemin çalışmasını etkilememeli
  }
};

// Tüm admin loglarını getir
export const getAllAdminLogs = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    // Admin kontrolü
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin erişimi gerekli" });
    }

    const logs = await prisma.adminLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 1000, // Son 1000 log
    });

    // Admin aktivitesi logla
    await createAdminLog(
      req.user.id,
      req.user.email,
      "VIEW_ADMIN_LOGS",
      "Admin loglarını görüntüledi",
      undefined,
      undefined,
      req.ip,
      req.get("User-Agent")
    );

    res.json(logs);
  } catch (error) {
    console.error("Get admin logs error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Belirli bir admin'in loglarını getir
export const getAdminLogsByAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    // Admin kontrolü
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin erişimi gerekli" });
    }

    const { adminId } = req.params;

    const logs = await prisma.adminLog.findMany({
      where: {
        adminId: parseInt(adminId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Admin aktivitesi logla
    await createAdminLog(
      req.user.id,
      req.user.email,
      "VIEW_SPECIFIC_ADMIN_LOGS",
      `Admin ID ${adminId} loglarını görüntüledi`,
      undefined,
      undefined,
      req.ip,
      req.get("User-Agent")
    );

    res.json(logs);
  } catch (error) {
    console.error("Get admin logs by admin error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Belirli bir tarih aralığındaki logları getir
export const getAdminLogsByDateRange = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    // Admin kontrolü
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin erişimi gerekli" });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Başlangıç ve bitiş tarihi gerekli" });
    }

    const logs = await prisma.adminLog.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Admin aktivitesi logla
    await createAdminLog(
      req.user.id,
      req.user.email,
      "VIEW_ADMIN_LOGS_BY_DATE",
      `${startDate} - ${endDate} arası logları görüntüledi`,
      undefined,
      undefined,
      req.ip,
      req.get("User-Agent")
    );

    res.json(logs);
  } catch (error) {
    console.error("Get admin logs by date range error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Admin log istatistikleri
export const getAdminLogStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    // Admin kontrolü
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin erişimi gerekli" });
    }

    const totalLogs = await prisma.adminLog.count();

    const logsByAction = await prisma.adminLog.groupBy({
      by: ["action"],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
    });

    const logsByAdmin = await prisma.adminLog.groupBy({
      by: ["adminEmail"],
      _count: {
        adminEmail: true,
      },
      orderBy: {
        _count: {
          adminEmail: "desc",
        },
      },
    });

    const todayLogs = await prisma.adminLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const stats = {
      totalLogs,
      todayLogs,
      logsByAction,
      logsByAdmin,
    };

    // Admin aktivitesi logla
    await createAdminLog(
      req.user.id,
      req.user.email,
      "VIEW_ADMIN_LOG_STATS",
      "Admin log istatistiklerini görüntüledi",
      undefined,
      undefined,
      req.ip,
      req.get("User-Agent")
    );

    res.json(stats);
  } catch (error) {
    console.error("Get admin log stats error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
