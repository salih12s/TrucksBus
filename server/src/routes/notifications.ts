import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController";

const router = Router();

// Tüm notification routes'ları authentication gerektirir
router.use(authenticateToken);

// Kullanıcının bildirimlerini getir
router.get("/", getNotifications);

// Bildirimi okundu olarak işaretle
router.put("/:notificationId/read", markAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.put("/mark-all-read", markAllAsRead);

// Bildirimi sil
router.delete("/:notificationId", deleteNotification);

export default router;
