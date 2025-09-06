import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";

// Rate limiting configurations
export const createRateLimit = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });
};

// General API rate limit (100 requests per 15 minutes)
export const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100,
  "Too many requests from this IP, please try again later."
);

// Strict rate limit for authentication endpoints (5 attempts per 15 minutes)
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5,
  "Too many authentication attempts, please try again later."
);

// Create ad rate limit (10 ads per hour)
export const createAdLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10,
  "Too many ad creation attempts, please try again later."
);

// Password reset rate limit (3 attempts per hour)
export const passwordResetLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3,
  "Too many password reset attempts, please try again later."
);

// Email verification rate limit (5 attempts per hour)
export const emailVerificationLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  5,
  "Too many email verification attempts, please try again later."
);

// Security middleware for data sanitization
export const sanitizeData = [
  // Prevent NoSQL injection attacks
  mongoSanitize({
    replaceWith: "_",
  }),

  // Prevent HTTP Parameter Pollution attacks
  hpp({
    whitelist: [
      "sort",
      "fields",
      "page",
      "limit",
      "category",
      "brand",
      "model",
      "year",
      "price",
    ],
  }),
];

// Custom security headers
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // Remove server information
  res.removeHeader("X-Powered-By");

  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    if (process.env.NODE_ENV === "development") {
      return next(); // Skip in development
    }

    if (allowedIPs.includes(clientIP as string)) {
      next();
    } else {
      res.status(403).json({
        error: "Access denied from this IP address",
      });
    }
  };
};

// Request size limiter
export const requestSizeLimit = (limit: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get("content-length");
    const maxSize = parseSize(limit);

    if (contentLength && parseInt(contentLength) > maxSize) {
      res.status(413).json({
        error: "Request entity too large",
        maxSize: limit,
      });
      return;
    }

    next();
  };
};

// Helper function to parse size strings like "10mb", "1gb"
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }

  const [, num, unit] = match;
  return parseFloat(num) * units[unit];
}
