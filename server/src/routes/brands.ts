import { Router } from "express";
import { PrismaClient, AdStatus } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// ❗ Get all brands - Optimized for performance
router.get("/", async (req, res) => {
  try {
    const { categoryId, limit } = req.query;
    const brandLimit = limit ? parseInt(limit as string) : undefined;

    let whereClause: any = {
      isActive: true,
    };

    // If categoryId is provided, filter brands that have ads in that category
    if (categoryId) {
      whereClause.ads = {
        some: {
          categoryId: parseInt(categoryId as string),
          status: AdStatus.APPROVED,
        },
      };
    }

    const brands = await prisma.brand.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
        _count: {
          select: {
            ads: {
              where: {
                status: AdStatus.APPROVED,
                ...(categoryId && {
                  categoryId: parseInt(categoryId as string),
                }),
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      ...(brandLimit && { take: brandLimit }),
    });

    // ❗ CRITICAL: Cache headers for performance
    res.set({
      "Cache-Control": "public, max-age=1800", // 30 dakika cache
      ETag: `brands-${categoryId || "all"}-${brandLimit || "all"}-${
        brands.length
      }`,
      Expires: new Date(Date.now() + 30 * 60 * 1000).toUTCString(),
    });

    return res.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get brand by ID
router.get("/id/:brandId", async (req, res) => {
  try {
    const { brandId } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(brandId) },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
      },
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    return res.json(brand);
  } catch (error) {
    console.error("Error fetching brand by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get models by brand ID
router.get("/:brandId/models", async (req, res) => {
  try {
    const { brandId } = req.params;

    const models = await prisma.model.findMany({
      where: {
        brandId: parseInt(brandId),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        brandId: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json(models);
  } catch (error) {
    console.error("Error fetching models by brand ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get single brand by slug
router.get("/:brandSlug", async (req, res) => {
  try {
    const { brandSlug } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
      },
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    return res.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get models for a specific brand
router.get("/:brandSlug/models/:modelSlug", async (req, res) => {
  try {
    const { brandSlug, modelSlug } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const model = await prisma.model.findFirst({
      where: {
        slug: modelSlug,
        brandId: brand.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    return res.json(model);
  } catch (error) {
    console.error("Error fetching model:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
