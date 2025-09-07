import { Router } from "express";
import { AdminLogController } from "../controllers/adminLogController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Admin logları (sadece mevcut olan method)
router.get("/", authenticateToken, AdminLogController.getAdminLogs);

export default router;
