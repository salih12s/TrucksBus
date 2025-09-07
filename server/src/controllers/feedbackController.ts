import { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth";
import { createNotification } from "./notificationController";

const prisma = new PrismaClient();

export const createFeedback = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, priority } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Geri bildirim göndermek için giriş yapmalısınız",
      });
      return;
    }

    if (!title || !description || !category || !priority) {
      res.status(400).json({
        success: false,
        message: "Tüm alanlar zorunludur",
      });
      return;
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        subject: title,
        content: description,
        category,
        priority,
        status: "OPEN",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Geri bildiriminiz başarıyla gönderildi",
      data: feedback,
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Geri bildirim gönderilirken bir hata oluştu",
    });
  }
};

export const getUserFeedbacks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Geri bildirimleri görüntülemek için giriş yapmalısınız",
      });
      return;
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        subject: true,
        content: true,
        category: true,
        priority: true,
        status: true,
        adminResponse: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Get user feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Geri bildirimler yüklenirken bir hata oluştu",
    });
  }
};

export const getAllFeedbacks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get all feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Geri bildirimler yüklenirken bir hata oluştu",
    });
  }
};

export const updateFeedbackStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const feedback = await prisma.feedback.update({
      where: { id: Number(id) },
      data: {
        status,
        adminResponse,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // If admin responded, create a notification for the user
    if (adminResponse && status === "RESPONDED") {
      await createNotification(
        feedback.userId,
        "Geri Bildiriminize Yanıt Verildi",
        `"${feedback.subject}" konulu geri bildiriminize yanıt verildi.`,
        "SUCCESS",
        feedback.id
      );
    }

    res.json({
      success: true,
      message: "Geri bildirim güncellendi",
      data: feedback,
    });
  } catch (error) {
    console.error("Update feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Geri bildirim güncellenirken bir hata oluştu",
    });
  }
};
