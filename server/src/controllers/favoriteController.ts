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

// Get user's favorites
export const getFavorites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        ad: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            category: true,
            brand: true,
            model: true,
            city: true,
            district: true,
            images: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Add to favorites
export const addToFavorites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { adId } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    if (!adId) {
      res.status(400).json({ error: "İlan ID gerekli" });
      return;
    }

    // Check if ad exists and is active
    const ad = await prisma.ad.findFirst({
      where: {
        id: parseInt(adId),
        status: "APPROVED",
      },
    });

    if (!ad) {
      res.status(404).json({ error: "İlan bulunamadı" });
      return;
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId,
          adId: parseInt(adId),
        },
      },
    });

    if (existingFavorite) {
      res.status(400).json({ error: "İlan zaten favorilerde" });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        adId: parseInt(adId),
      },
      include: {
        ad: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            category: true,
            brand: true,
            model: true,
            city: true,
            district: true,
            images: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "İlan favorilere eklendi",
      favorite,
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove from favorites
export const removeFromFavorites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { adId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId,
          adId: parseIntParam(adId),
        },
      },
    });

    if (!favorite) {
      res.status(404).json({ error: "Favori bulunamadı" });
      return;
    }

    await prisma.favorite.delete({
      where: {
        userId_adId: {
          userId,
          adId: parseIntParam(adId),
        },
      },
    });

    res.json({ message: "İlan favorilerden kaldırıldı" });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Check if ad is favorited
export const checkFavorite = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { adId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Kullanıcı girişi gerekli" });
      return;
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId,
          adId: parseIntParam(adId),
        },
      },
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ error: "Server error" });
  }
};
