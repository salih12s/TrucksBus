import { Router } from "express";
import multer from "multer";
import { authenticateToken, requireRole } from "../middleware/auth";
import {
    getStoreBySlug,
    getStoreByUserId,
    getStoreAds,
    getMyStore,
    upsertStore,
} from "../controllers/storeController";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 2, // logo + banner
    },
});

// Protected routes (must be before /:slug to avoid conflict)
router.get(
    "/my/store",
    authenticateToken,
    getMyStore,
);

router.post(
    "/",
    authenticateToken,
    requireRole(["CORPORATE"]),
    upload.any(),
    upsertStore,
);

// Public routes
router.get("/user/:userId", getStoreByUserId);
router.get("/:slug/ads", getStoreAds);
router.get("/:slug", getStoreBySlug);

export default router;
