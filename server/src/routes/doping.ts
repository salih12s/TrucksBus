import { Router } from "express";
import {
  getDopingPackages,
  getUserDopings,
  activateDoping,
  getUserAds,
  deactivateDoping,
} from "../controllers/dopingController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public route - get all doping packages
router.get("/packages", getDopingPackages);

// Protected routes - require authentication
router.get("/user-dopings", authenticateToken, getUserDopings);
router.get("/user-ads", authenticateToken, getUserAds);
router.post("/activate", authenticateToken, activateDoping);
router.delete("/deactivate/:dopingId", authenticateToken, deactivateDoping);

export default router;
