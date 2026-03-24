import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  console.log("🔒 Admin Check:");
  console.log("- User:", req.user);
  console.log("- User Role:", req.user?.role);

  if (!req.user) {
    console.log("❌ No user in request");
    res.status(401).json({
      success: false,
      message: "Yetkilendirme gerekli",
    });
    return;
  }

  if (req.user.role !== "ADMIN") {
    console.log("❌ User is not admin, role:", req.user.role);
    res.status(403).json({
      success: false,
      message: "Bu işlem için admin yetkisi gerekli",
    });
    return;
  }

  console.log("✅ Admin access granted");
  next();
};
