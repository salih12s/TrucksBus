import { Router } from "express";
import {
  createFeedback,
  getUserFeedbacks,
  getAllFeedbacks,
  updateFeedbackStatus,
} from "../controllers/feedbackController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// User routes (require authentication)
router.post("/", authenticateToken, createFeedback);
router.get("/my", authenticateToken, getUserFeedbacks);

// Admin routes (require admin access)
router.get("/all", authenticateToken, requireAdmin, getAllFeedbacks);
router.put("/:id", authenticateToken, requireAdmin, updateFeedbackStatus);

export default router;
