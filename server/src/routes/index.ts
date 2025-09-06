import { Router } from "express";
import authRoutes from "./auth";
import categoryRoutes from "./categories";
import adRoutes from "./ads";
import adminLogRoutes from "./adminLogs";

const router = Router();

// Mount route modules
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/ads", adRoutes);
router.use("/admin/logs", adminLogRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "TrucksBus API v1.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      categories: "/api/categories",
      ads: "/api/ads",
      users: "/api/users",
    },
  });
});

export default router;
