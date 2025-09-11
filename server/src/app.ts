import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
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
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
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

// Serve static files from uploads directory with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    // CORS headers for static files
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5174",
    ];

    const origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin || "") !== -1 || !origin) {
      res.header("Access-Control-Allow-Origin", origin || "*");
    }

    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../uploads"))
);

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

// Serve static files from client build (production)
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  
  // Debug: Log paths and check if directory exists
  console.log("🔍 Client Build Debug:");
  console.log("  __dirname:", __dirname);
  console.log("  clientBuildPath:", clientBuildPath);
  
  const fs = require('fs');
  if (fs.existsSync(clientBuildPath)) {
    console.log("  ✅ Client build directory exists");
    const files = fs.readdirSync(clientBuildPath);
    console.log("  📁 Files in build directory:", files.slice(0, 10));
  } else {
    console.log("  ❌ Client build directory NOT found");
    
    // Try alternative paths
    const alt1 = path.join(__dirname, "../client/dist");
    const alt2 = path.join(__dirname, "../../../client/dist");
    const alt3 = path.join(process.cwd(), "client/dist");
    
    console.log("  🔍 Trying alternative paths:");
    console.log("    alt1:", alt1, fs.existsSync(alt1) ? "✅" : "❌");
    console.log("    alt2:", alt2, fs.existsSync(alt2) ? "✅" : "❌");
    console.log("    alt3:", alt3, fs.existsSync(alt3) ? "✅" : "❌");
  }
  
  app.use(express.static(clientBuildPath));

  // SPA fallback - catch all non-API routes and serve index.html
  app.use((req, res, next) => {
    // Skip API routes and static files
    if (req.path.startsWith("/api") || req.path.includes(".")) {
      return next();
    }

    // For all other routes, serve the React app
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

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

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join user to their personal room for notifications
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room (socket: ${socket.id})`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚛 TrucksBus server running on port ${PORT}`);
  console.log(
    `🔒 Security features: Rate limiting, CORS, Helmet, Input validation`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

export { io };
export default app;
