import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

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
