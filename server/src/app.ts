import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import routes from "./routes";
import {
  generalLimiter,
  sanitizeData,
  mongoSanitizeMiddleware,
  securityHeaders,
  requestSizeLimit,
} from "./middleware/security";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set("trust proxy", 1);

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Security middleware (order matters!)
app.use(securityHeaders);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

// Apply data sanitization middleware
app.use(sanitizeData);
// app.use(mongoSanitizeMiddleware); // Temporarily disabled due to compatibility issues

// Request size limiting
app.use(requestSizeLimit("10mb"));

// Global rate limiting
app.use(generalLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5174",
    ];

    console.log("🔍 CORS Check:");
    console.log("  Request Origin:", origin);
    console.log("  Allowed Origins:", allowedOrigins);

    // Allow requests with no origin (like mobile apps or curl requests) in development
    if (!origin && process.env.NODE_ENV === "development") {
      console.log("  ✅ No origin in development - allowing");
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin || "") !== -1) {
      console.log("  ✅ Origin allowed");
      callback(null, true);
    } else {
      console.log("  ❌ Origin not allowed");
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api", routes);

// 404 handler - this must be after all other routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", err);

    // Don't leak error details in production
    const message =
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred"
        : err.message;

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

const server = app.listen(PORT, () => {
  console.log(`🚛 TrucksBus server running on port ${PORT}`);
  console.log(
    `🔒 Security features: Rate limiting, CORS, Helmet, Input validation`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
