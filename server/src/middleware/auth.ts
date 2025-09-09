import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId: number;
    email: string;
    role: UserRole;
    isAdmin: boolean;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    console.log("🔍 Auth Debug:");
    console.log("- Auth Header:", authHeader);
    console.log(
      "- Token:",
      token ? `${token.substring(0, 20)}...` : "NO TOKEN"
    );

    if (!token) {
      console.log("❌ No token provided");
      res.status(401).json({ error: "Access token is required" });
      return;
    }

    const secret = process.env.JWT_SECRET_ACCESS || process.env.JWT_SECRET;
    if (!secret) {
      console.log("❌ JWT secret not configured");
      res.status(500).json({ error: "JWT secret not configured" });
      return;
    }

    console.log("🔑 Using JWT secret:", secret ? "✅ Found" : "❌ Missing");

    const decoded = jwt.verify(token, secret) as any;
    console.log("📋 Decoded token:", {
      userId: decoded.userId,
      role: decoded.role,
    });

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    console.log("👤 User from DB:", user);

    if (!user || !user.isActive) {
      console.log("❌ User not found or inactive");
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "ADMIN",
    };

    console.log("✅ Auth successful:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
};
