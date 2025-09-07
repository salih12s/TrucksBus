import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all doping packages
export const getDopingPackages = async (req: Request, res: Response) => {
  try {
    const packages = await prisma.dopingPackage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(packages);
  } catch (error) {
    console.error("Error fetching doping packages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's active doping packages
export const getUserDopings = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated request
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const userDopings = await prisma.userDoping.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        package: true,
      },
    });

    res.json(userDopings);
  } catch (error) {
    console.error("Error fetching user dopings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Activate a doping package for user
export const activateDoping = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { packageId } = req.body;

    // Get userId from authenticated request
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Get package details
    const dopingPackage = await prisma.dopingPackage.findUnique({
      where: { id: packageId },
    });

    if (!dopingPackage) {
      res.status(404).json({ error: "Package not found" });
      return;
    }

    // Check if already activated
    const existing = await prisma.userDoping.findUnique({
      where: {
        userId_packageId: { userId, packageId },
      },
    });

    if (existing && existing.isActive && existing.expiresAt > new Date()) {
      res.status(400).json({ error: "Package already active" });
      return;
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + dopingPackage.duration);

    // Create or update user doping
    const userDoping = await prisma.userDoping.upsert({
      where: {
        userId_packageId: { userId, packageId },
      },
      update: {
        activatedAt: new Date(),
        expiresAt,
        isActive: true,
      },
      create: {
        userId,
        packageId,
        expiresAt,
        isActive: true,
      },
      include: {
        package: true,
      },
    });

    res.json(userDoping);
  } catch (error) {
    console.error("Error activating doping:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's ads for doping selection
export const getUserAds = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated request
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const userAds = await prisma.ad.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(userAds);
  } catch (error) {
    console.error("Error fetching user ads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Deactivate a doping package
export const deactivateDoping = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const dopingId = req.params.dopingId;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const userDoping = await prisma.userDoping.findUnique({
      where: { id: dopingId },
    });

    if (!userDoping || userDoping.userId !== userId) {
      res.status(404).json({ error: "Doping not found" });
      return;
    }

    await prisma.userDoping.update({
      where: { id: dopingId },
      data: { isActive: false },
    });

    res.json({ success: true, message: "Doping deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating doping:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
