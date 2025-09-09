import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} from "../controllers/complaintController";

const router = Router();

// All complaint routes require authentication
router.use(authenticateToken);

// Create a new complaint
router.post("/", createComplaint);

// Get all complaints (user's own or all for admin)
router.get("/", getComplaints);

// Get a specific complaint by ID
router.get("/:id", getComplaintById);

// Update complaint status (admin only)
router.put("/:id/status", updateComplaintStatus);

// Delete complaint
router.delete("/:id", deleteComplaint);

export default router;
