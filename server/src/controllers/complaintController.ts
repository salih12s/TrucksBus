import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth";

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

export const createComplaint = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { adId, reason, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    // Validate required fields
    if (!adId || !reason) {
      res.status(400).json({ error: "İlan ID ve şikayet sebebi gerekli" });
      return;
    }

    // Check if ad exists
    const ad = await prisma.ad.findUnique({
      where: { id: parseInt(adId) },
    });

    if (!ad) {
      res.status(404).json({ error: "İlan bulunamadı" });
      return;
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        adId: parseInt(adId),
        userId,
        reason,
        description: description || null,
        status: "OPEN",
      },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Şikayet başarıyla oluşturuldu",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ error: "Şikayet oluşturulurken hata oluştu" });
  }
};

export const getComplaints = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    const whereClause = isAdmin ? {} : { userId };

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ complaints });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({ error: "Şikayetler getirilirken hata oluştu" });
  }
};

export const getComplaintById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(id) },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!complaint) {
      res.status(404).json({ error: "Şikayet bulunamadı" });
      return;
    }

    // Check authorization
    if (!isAdmin && complaint.userId !== userId) {
      res.status(403).json({ error: "Bu şikayeti görme yetkiniz yok" });
      return;
    }

    res.json({ complaint });
  } catch (error) {
    console.error("Get complaint by ID error:", error);
    res.status(500).json({ error: "Şikayet getirilirken hata oluştu" });
  }
};

export const updateComplaintStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!userId || !isAdmin) {
      res.status(403).json({ error: "Admin yetkisi gerekli" });
      return;
    }

    if (!status) {
      res.status(400).json({ error: "Durum bilgisi gerekli" });
      return;
    }

    const validStatuses = ["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Geçersiz durum bilgisi" });
      return;
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(id) },
    });

    if (!complaint) {
      res.status(404).json({ error: "Şikayet bulunamadı" });
      return;
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminResponse: adminResponse || null,
        updatedAt: new Date(),
      },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create notification for user if admin responded
    if (adminResponse && complaint.userId) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: "Şikayetinize Yanıt Verildi",
          message: `Şikayetiniz "${
            status === "RESOLVED" ? "çözüldü" : "güncellendi"
          }". Admin yanıtı: ${adminResponse}`,
          type: "COMPLAINT_UPDATE",
          isRead: false,
        },
      });
    }

    res.json({
      message: "Şikayet durumu başarıyla güncellendi",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("Update complaint status error:", error);
    res
      .status(500)
      .json({ error: "Şikayet durumu güncellenirken hata oluştu" });
  }
};

export const deleteComplaint = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(id) },
    });

    if (!complaint) {
      res.status(404).json({ error: "Şikayet bulunamadı" });
      return;
    }

    // Only admin or complaint owner can delete
    if (!isAdmin && complaint.userId !== userId) {
      res.status(403).json({ error: "Bu şikayeti silme yetkiniz yok" });
      return;
    }

    await prisma.complaint.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Şikayet başarıyla silindi" });
  } catch (error) {
    console.error("Delete complaint error:", error);
    res.status(500).json({ error: "Şikayet silinirken hata oluştu" });
  }
};
