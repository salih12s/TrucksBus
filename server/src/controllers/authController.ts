import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { UserRole, User, Ad } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth";
import { AdminLogController } from "./adminLogController";

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  companyName?: string;
  taxId?: string;
  tradeRegistryNo?: string;
  address?: string;
  city?: string;
  country?: string;
  kvkkAccepted: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Failed login attempts tracking
const failedLoginAttempts = new Map<
  string,
  { count: number; lastAttempt: Date; lockUntil?: Date }
>();

// Constants for security
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes
const BCRYPT_ROUNDS = 12;

export class AuthController {
  // Generate access token
  private static generateAccessToken(userId: number, role: string): string {
    const secret = process.env.JWT_SECRET_ACCESS;
    if (!secret) {
      throw new Error("JWT_SECRET_ACCESS is not defined");
    }

    return jwt.sign({ userId, role }, secret, { expiresIn: "15m" });
  }

  // Generate refresh token
  private static generateRefreshToken(userId: number): string {
    const secret = process.env.JWT_SECRET_REFRESH;
    if (!secret) {
      throw new Error("JWT_SECRET_REFRESH is not defined");
    }

    return jwt.sign({ userId }, secret, { expiresIn: "7d" });
  }

  // Record failed login attempts for security
  private static recordFailedLoginAttempt(email: string): void {
    const now = new Date();
    const attemptInfo = failedLoginAttempts.get(email) || {
      count: 0,
      lastAttempt: now,
    };

    // Reset count if last attempt was more than lock time ago
    if (now.getTime() - attemptInfo.lastAttempt.getTime() > LOCK_TIME) {
      attemptInfo.count = 0;
    }

    attemptInfo.count++;
    attemptInfo.lastAttempt = now;

    // Lock account if too many attempts
    if (attemptInfo.count >= MAX_LOGIN_ATTEMPTS) {
      attemptInfo.lockUntil = new Date(now.getTime() + LOCK_TIME);
      console.warn(
        `Account locked for ${email} due to ${attemptInfo.count} failed login attempts`
      );
    }

    failedLoginAttempts.set(email, attemptInfo);
  }

  // Register new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("Registration request received:", {
        body: req.body,
        headers: req.headers["content-type"],
      });

      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role = "USER",
        companyName,
        taxId,
        tradeRegistryNo,
        address,
        city,
        country,
        kvkkAccepted,
      }: RegisterRequest = req.body;

      // Basic validation
      const validationErrors: string[] = [];

      if (!email || !email.includes("@")) {
        validationErrors.push("Valid email is required");
      }

      if (!password || password.length < 6) {
        validationErrors.push("Password must be at least 6 characters long");
      }

      if (!kvkkAccepted) {
        validationErrors.push("KVKK acceptance is required");
      }

      // Additional validation for corporate users
      if (role === "CORPORATE") {
        console.log("🏢 Validating corporate user:", {
          companyName: companyName || "MISSING",
          taxId: taxId || "MISSING",
          firstName: firstName || "MISSING",
          lastName: lastName || "MISSING",
        });

        if (!companyName || companyName.trim().length < 2) {
          validationErrors.push(
            "Company name is required for corporate accounts"
          );
        }
        if (!taxId || taxId.trim().length < 5) {
          validationErrors.push("Tax ID is required for corporate accounts");
        }
        if (!firstName || firstName.trim().length < 2) {
          validationErrors.push("First name is required");
        }
        if (!lastName || lastName.trim().length < 2) {
          validationErrors.push("Last name is required");
        }
      }

      if (validationErrors.length > 0) {
        console.error("❌ Validation failed:", {
          errors: validationErrors,
          receivedData: {
            email: email || "MISSING",
            firstName: firstName || "MISSING",
            lastName: lastName || "MISSING",
            companyName: companyName || "MISSING",
            taxId: taxId || "MISSING",
            role: role || "MISSING",
            kvkkAccepted: kvkkAccepted,
          },
        });
        res.status(400).json({
          error: "Validation failed",
          details: validationErrors,
        });
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          error: "User with this email already exists",
        });
        return;
      }

      // Hash password with higher rounds for security
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          role: (role as UserRole) || UserRole.USER,
          userType: role === "CORPORATE" ? "corporate" : "individual",
          companyName,
          taxId,
          tradeRegistryNo,
          address,
          city,
          country,
          kvkkAccepted,
          kvkkAcceptedAt: kvkkAccepted ? new Date() : null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          companyName: true,
          taxId: true,
          tradeRegistryNo: true,
          address: true,
          city: true,
          country: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Generate JWT tokens
      const accessToken = AuthController.generateAccessToken(
        user.id,
        user.role
      );
      const refreshToken = AuthController.generateRefreshToken(user.id);

      res.status(201).json({
        message: "User registered successfully",
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  // Login user with enhanced security
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;
      const clientIP = req.ip || "unknown";

      // Check if account is locked due to too many failed attempts
      const attemptInfo = failedLoginAttempts.get(email);
      if (attemptInfo?.lockUntil && attemptInfo.lockUntil > new Date()) {
        const remainingTime = Math.ceil(
          (attemptInfo.lockUntil.getTime() - new Date().getTime()) / 60000
        );
        res.status(429).json({
          error: `Account temporarily locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
          lockUntil: attemptInfo.lockUntil,
        });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          isActive: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        // Record failed attempt even for non-existent users to prevent enumeration
        AuthController.recordFailedLoginAttempt(email);
        res.status(401).json({
          error: "Invalid email or password",
        });
        return;
      }

      // Check if account is active
      if (!user.isActive) {
        res.status(403).json({
          error: "Account is suspended. Please contact support.",
        });
        return;
      }

      // Verify password with timing-safe comparison
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        AuthController.recordFailedLoginAttempt(email);
        res.status(401).json({
          error: "Invalid email or password",
        });
        return;
      }

      // Clear failed login attempts on successful login
      failedLoginAttempts.delete(email);

      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT tokens
      const accessToken = AuthController.generateAccessToken(
        user.id,
        user.role
      );
      const refreshToken = AuthController.generateRefreshToken(user.id);

      // Log admin login activity
      if (user.role === "ADMIN") {
        await AdminLogController.logActivity(
          user.id,
          user.email,
          "LOGIN",
          `Admin logged in`,
          undefined,
          undefined,
          clientIP,
          req.get("User-Agent")
        );
      }

      // Remove sensitive data from response
      const { passwordHash, ...safeUser } = user;

      // Log successful login for security monitoring
      console.log(
        `Successful login: ${email} from IP: ${clientIP} at ${new Date().toISOString()}`
      );

      res.status(200).json({
        message: "Login successful",
        user: safeUser,
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }

  // Refresh token
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          error: "Refresh token is required",
        });
        return;
      }

      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not defined");
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, secret) as any;

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          error: "Invalid refresh token",
        });
        return;
      }

      // Generate new access token
      const accessToken = AuthController.generateAccessToken(
        user.id,
        user.role
      );

      res.json({
        accessToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({
        error: "Invalid refresh token",
      });
    }
  }

  // Logout (optional - mainly for clearing client-side tokens)
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get current user
  static async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      // Admin kontrolü
      if (req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Access denied. Admin role required." });
        return;
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(users);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Toggle user status (Admin only)
  static async toggleUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      // Admin kontrolü
      if (req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Access denied. Admin role required." });
        return;
      }

      const { userId } = req.params;
      const userIdNum = parseInt(userId);

      if (isNaN(userIdNum)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      // Kendi hesabını engelleyemez
      if (req.user.id === userIdNum) {
        res
          .status(400)
          .json({ error: "Cannot change your own account status" });
        return;
      }

      // Kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { id: userIdNum },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          role: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Diğer admin'leri engelleyemez
      if (user.role === "ADMIN") {
        res.status(400).json({ error: "Cannot change admin user status" });
        return;
      }

      // Durumu değiştir
      const updatedUser = await prisma.user.update({
        where: { id: userIdNum },
        data: { isActive: !user.isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      // Log admin activity
      const action = updatedUser.isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER";
      await AdminLogController.logActivity(
        req.user.id,
        req.user.email,
        "TOGGLE_USER_STATUS",
        `${action.toLowerCase().replace("_", " ")} user: ${user.email}`,
        userIdNum,
        user.email,
        req.ip,
        req.get("User-Agent")
      );

      res.json({
        message: `User ${
          updatedUser.isActive ? "activated" : "deactivated"
        } successfully`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Toggle user status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update password
  static async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      // Validate input
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: "Current password and new password are required",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          error: "New password must be at least 6 characters long",
        });
        return;
      }

      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          passwordHash: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

      // Update password in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      });

      // Log the password change
      await AdminLogController.logActivity(
        userId,
        user.email,
        "PASSWORD_CHANGED",
        "User changed their password"
      );

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get user statistics
  static async getUserStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      // Get user's ads statistics
      const totalAds = await prisma.ad.count({
        where: { userId },
      });

      const activeAds = await prisma.ad.count({
        where: {
          userId,
          status: "APPROVED",
        },
      });

      const pendingAds = await prisma.ad.count({
        where: {
          userId,
          status: "PENDING",
        },
      });

      // Get total views for user's ads
      const userAds = await prisma.ad.findMany({
        where: { userId },
        select: { viewCount: true },
      });

      const totalViews = userAds.reduce(
        (sum: number, ad: any) => sum + (ad.viewCount || 0),
        0
      );

      // Get active dopings count
      const activeDopings = await prisma.userDoping.count({
        where: {
          userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      res.json({
        totalAds,
        activeAds,
        pendingAds,
        totalViews,
        activeDopings,
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        firstName,
        lastName,
        phone,
        companyName,
        address,
        city,
        profileImageUrl,
      } = req.body;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone,
          companyName,
          address,
          city,
          profileImageUrl,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          companyName: true,
          taxId: true,
          tradeRegistryNo: true,
          address: true,
          city: true,
          country: true,
          isVerified: true,
          profileImageUrl: true,
          createdAt: true,
        },
      });

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Upload profile image
  static async uploadProfileImage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      // Convert to base64
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      // Update user's profile image URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profileImageUrl: base64Image,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          companyName: true,
          address: true,
          city: true,
          profileImageUrl: true,
          isVerified: true,
          createdAt: true,
        },
      });

      res.json({
        message: "Profile image uploaded successfully",
        imageUrl: base64Image,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Upload profile image error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Forgot password - generate JWT reset token
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });

      // Always return success message (security best practice)
      // Don't reveal whether email exists or not
      const successMessage =
        "Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderilecektir.";

      if (!user || !user.isActive) {
        res.json({ message: successMessage });
        return;
      }

      // Generate JWT reset token (expires in 1 hour)
      const secret = process.env.JWT_SECRET_ACCESS;
      if (!secret) {
        throw new Error("JWT_SECRET_ACCESS is not defined");
      }

      const resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: "password_reset",
        },
        secret,
        { expiresIn: "1h" }
      );

      // In a real application, you would send an email here
      // For now, we'll just log the reset link
      const resetLink = `${
        process.env.FRONTEND_URL || "https://trucksbus.com.tr"
      }/reset-password?token=${resetToken}`;
      console.log("Password reset link for", email, ":", resetLink);

      // TODO: Implement email sending
      // await sendPasswordResetEmail(user.email, resetLink);

      res.json({ message: successMessage });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Verify reset token
  static async verifyResetToken(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token) {
        res.status(400).json({ error: "Reset token is required" });
        return;
      }

      const secret = process.env.JWT_SECRET_ACCESS;
      if (!secret) {
        throw new Error("JWT_SECRET_ACCESS is not defined");
      }

      // Verify JWT token
      const decoded = jwt.verify(token as string, secret) as any;

      // Check if it's a password reset token
      if (decoded.type !== "password_reset") {
        res.status(400).json({ error: "Invalid token type" });
        return;
      }

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!user) {
        res.status(400).json({ error: "Invalid token or user not found" });
        return;
      }

      res.json({ message: "Token is valid", userId: user.id });
    } catch (error) {
      console.error("Verify reset token error:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(400).json({ error: "Invalid or expired reset token" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: "Token and new password are required" });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          error: "Password must be at least 8 characters long",
        });
        return;
      }

      // Password strength validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(newPassword)) {
        res.status(400).json({
          error:
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
        });
        return;
      }

      const secret = process.env.JWT_SECRET_ACCESS;
      if (!secret) {
        throw new Error("JWT_SECRET_ACCESS is not defined");
      }

      // Verify JWT token
      const decoded = jwt.verify(token, secret) as any;

      // Check if it's a password reset token
      if (decoded.type !== "password_reset") {
        res.status(400).json({ error: "Invalid token type" });
        return;
      }

      // Find user and verify they're still active
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
        },
      });

      if (!user) {
        res.status(400).json({ error: "Invalid token or user not found" });
        return;
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });

      // Log the password reset
      await AdminLogController.logActivity(
        user.id,
        user.email,
        "PASSWORD_RESET",
        "User reset their password via forgot password flow"
      );

      res.json({
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(400).json({ error: "Invalid or expired reset token" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
