import { Router } from "express";
import {
  getAllAdminLogs,
  getAdminLogsByAdmin,
  getAdminLogsByDateRange,
  getAdminLogStats,
} from "../controllers/adminLogsController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Tüm admin logları
router.get("/", authenticateToken, getAllAdminLogs);

// Belirli admin'in logları
router.get("/admin/:adminId", authenticateToken, getAdminLogsByAdmin);

// Tarih aralığı ile loglar
router.get("/date-range", authenticateToken, getAdminLogsByDateRange);

// Admin log istatistikleri
router.get("/stats", authenticateToken, getAdminLogStats);

export default router;
