import { Router } from "express";
import authRoutes from "./auth";
import categoryRoutes from "./categories";
import brandRoutes from "./brands";
import adRoutes from "./ads";
import adminLogRoutes from "./adminLogs";
import feedbackRoutes from "./feedback";
import notificationRoutes from "./notifications";
import dopingRoutes from "./doping";
import favoriteRoutes from "./favorites";
import complaintRoutes from "./complaint";
import messagingRoutes from "./messaging";
import citiesRoutes from "./cities";

const router = Router();

// Mount route modules
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/ads", adRoutes);
router.use("/admin/logs", adminLogRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/notifications", notificationRoutes);
router.use("/doping", dopingRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/complaints", complaintRoutes);
router.use("/messages", messagingRoutes);
router.use("/cities", citiesRoutes);

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
      feedback: "/api/feedback",
      notifications: "/api/notifications",
      doping: "/api/doping",
      favorites: "/api/favorites",
      messages: "/api/messages",
    },
  });
});

export default router;
