import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { authLimiter } from "../middleware/security";
import { validateRegistration, validateLogin } from "../middleware/validation";

const router = Router();

// Auth routes with rate limiting and validation
router.post(
  "/register",
  authLimiter,
  validateRegistration,
  AuthController.register
);
router.post("/login", authLimiter, validateLogin, AuthController.login);
router.post("/refresh", authLimiter, AuthController.refresh);
router.post("/logout", authLimiter, AuthController.logout);

// Protected routes
router.get("/me", authenticateToken, AuthController.getCurrentUser);
router.get("/stats", authenticateToken, AuthController.getUserStats);
router.put(
  "/update-password",
  authenticateToken,
  AuthController.updatePassword
);

// Admin routes
router.get("/users", authenticateToken, AuthController.getAllUsers);
router.patch(
  "/users/:userId/toggle-status",
  authenticateToken,
  AuthController.toggleUserStatus
);

export default router;
