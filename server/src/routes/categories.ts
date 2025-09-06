import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import {
  getCategories,
  getCategoryById,
  getBrandsByCategory,
  getModelsByBrand,
  getVariantsByModel,
  createBrand,
  createModel,
  createVariant,
  getCategoryFields,
} from "../controllers/categoryController";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/:categorySlug/brands", getBrandsByCategory);
router.get("/:categorySlug/brands/:brandSlug/models", getModelsByBrand);
router.get(
  "/:categorySlug/brands/:brandSlug/models/:modelSlug/variants",
  getVariantsByModel
);
router.get("/:categoryId/fields", getCategoryFields);

// Admin routes
router.post(
  "/brands",
  authenticateToken,
  requireRole(["ADMIN", "MODERATOR"]),
  createBrand
);
router.post(
  "/models",
  authenticateToken,
  requireRole(["ADMIN", "MODERATOR"]),
  createModel
);
router.post(
  "/variants",
  authenticateToken,
  requireRole(["ADMIN", "MODERATOR"]),
  createVariant
);

export default router;
