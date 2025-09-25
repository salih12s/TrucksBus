import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get model by ID
router.get("/:modelId", async (req, res) => {
  try {
    const { modelId } = req.params;

    const model = await prisma.model.findUnique({
      where: { id: parseInt(modelId) },
      select: {
        id: true,
        name: true,
        slug: true,
        brandId: true,
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
    console.error("Error fetching model by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get variants by model ID
router.get("/:modelId/variants", async (req, res) => {
  try {
    const { modelId } = req.params;

    const variants = await prisma.variant.findMany({
      where: {
        modelId: parseInt(modelId),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        modelId: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json(variants);
  } catch (error) {
    console.error("Error fetching variants by model ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
