import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { createAdLimiter } from "../middleware/security";
import { validateCreateAd, validateUpdateAd } from "../middleware/validation";
import {
  getAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getUserAds,
  getPendingAds,
  moderateAd,
} from "../controllers/adController";

const router = Router();

// Public routes
router.get("/", getAds);
router.get("/:id", getAdById);

// Authenticated user routes with rate limiting and validation
router.post(
  "/",
  createAdLimiter,
  authenticateToken,
  validateCreateAd,
  createAd
);
router.put("/:id", authenticateToken, validateUpdateAd, updateAd);
router.delete("/:id", authenticateToken, deleteAd);
router.get("/user/my-ads", authenticateToken, getUserAds);

// Admin routes
router.get(
  "/admin/pending",
  authenticateToken,
  requireRole(["ADMIN", "MODERATOR"]),
  getPendingAds
);
router.patch(
  "/:id/moderate",
  authenticateToken,
  requireRole(["ADMIN", "MODERATOR"]),
  moderateAd
);

export default router;
