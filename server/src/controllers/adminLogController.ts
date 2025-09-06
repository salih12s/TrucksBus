import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthenticatedRequest } from "../middleware/auth";

export interface AdminLogEntry {
  id: number;
  adminId: number;
  adminEmail: string;
  action: string;
  targetUserId?: number;
  targetUserEmail?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export class AdminLogController {
  // Log admin activity
  static async logActivity(
    adminId: number,
    adminEmail: string,
    action: string,
    details?: string,
    targetUserId?: number,
    targetUserEmail?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
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
      console.error("Failed to log admin activity:", error);
    }
  }

  // Get admin logs (Admin only)
  static async getAdminLogs(req: AuthenticatedRequest, res: Response) {
    try {
      // Admin kontrolü
      if (req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Access denied. Admin role required." });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const logs = await prisma.adminLog.findMany({
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const total = await prisma.adminLog.count();

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get admin logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
