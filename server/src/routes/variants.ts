import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get variant by ID
router.get("/:variantId", async (req, res) => {
  try {
    const { variantId } = req.params;

    const variant = await prisma.variant.findUnique({
      where: { id: parseInt(variantId) },
      select: {
        id: true,
        name: true,
        slug: true,
        modelId: true,
        isActive: true,
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            brandId: true,
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }

    return res.json(variant);
  } catch (error) {
    console.error("Error fetching variant by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
