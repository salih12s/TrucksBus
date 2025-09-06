import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { UserRole } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth";

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
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
  private static generateAccessToken(userId: number, role: UserRole): string {
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
        role = UserRole.USER,
        companyName,
        taxId,
        tradeRegistryNo,
        address,
        city,
        country,
        kvkkAccepted,
      }: RegisterRequest = req.body;

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
          role,
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
}
