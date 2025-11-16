import express from "express";
import {
  getPackages,
  getUserSubscription,
  createSubscription,
} from "../controllers/subscriptionController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/packages", getPackages);

// Protected routes
router.get("/my-subscription", authenticateToken, getUserSubscription);
router.post("/subscribe", authenticateToken, createSubscription);

export default router;
