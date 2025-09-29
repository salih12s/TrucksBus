import { Router } from "express";
import multer from "multer";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { authLimiter } from "../middleware/security";
import { validateRegistration, validateLogin } from "../middleware/validation";

const router = Router();

// Multer configuration for profile image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
router.post("/forgot-password", authLimiter, AuthController.forgotPassword);
router.get("/verify-reset-token", AuthController.verifyResetToken);
router.post("/reset-password", authLimiter, AuthController.resetPassword);

// Debug endpoint - sadece development ortamında
if (process.env.NODE_ENV === "development") {
  router.get("/test-email", AuthController.testEmailService);
}

// Protected routes
router.get("/me", authenticateToken, AuthController.getCurrentUser);
router.get("/stats", authenticateToken, AuthController.getUserStats);
router.put("/profile", authenticateToken, AuthController.updateProfile);
router.post(
  "/upload-profile-image",
  authenticateToken,
  upload.single("profileImage"),
  AuthController.uploadProfileImage
);
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
