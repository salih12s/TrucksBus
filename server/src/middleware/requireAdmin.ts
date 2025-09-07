import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Yetkilendirme gerekli",
    });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Bu işlem için admin yetkisi gerekli",
    });
    return;
  }

  next();
};
