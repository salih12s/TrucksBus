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

// 🚨 EMERGENCY CORS - Inline tanım
const emergencyCors = (req: any, res: any, next: any) => {
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  
  console.log(`🚨 EMERGENCY CORS: ${req.method} ${req.url} from ${req.headers.origin}`);
  
  if (req.method === 'OPTIONS') {
    console.log('🚨 EMERGENCY OPTIONS handled');
    return res.status(200).end();
  }
  
  next();
};

// Load environment variables first
dotenv.config(); // Load default .env first

// Then load local development overrides if in development
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.local", override: true });
  console.log("🔧 Loading local development environment variables");
}

const app = express();
const server = createServer(app);

// Socket.IO CORS ayarları
let socketOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "https://trucksbus.com.tr",
  "http://trucksbus.com.tr",
  "https://www.trucksbus.com.tr",
  "http://www.trucksbus.com.tr",
];

// Development modunda localhost'a izin ver
if (process.env.NODE_ENV === "development") {
  socketOrigins = [
    ...socketOrigins,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5174",
  ];
}

const io = new SocketIOServer(server, {
  cors: {
    origin: socketOrigins,
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
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:3000",
        ],
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

// 🔒 KAPSAMLI CORS YAPISI - Tüm ortamlar için güvenilir çözüm
const getAllowedOrigins = () => {
  const baseOrigins = [
    // Production origins
    "https://trucksbus.com.tr",
    "http://trucksbus.com.tr",
    "https://www.trucksbus.com.tr",
    "http://www.trucksbus.com.tr",
  ];

  // Development origins - her zaman dahil et
  const devOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ];

  // Railway production URL
  if (process.env.RAILWAY_ENVIRONMENT_NAME) {
    baseOrigins.push("https://trucksbus-production.up.railway.app");
  }

  // Environment'tan gelen origins
  if (process.env.ALLOWED_ORIGINS) {
    baseOrigins.push(...process.env.ALLOWED_ORIGINS.split(","));
  }

  return [...baseOrigins, ...devOrigins];
};

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = getAllowedOrigins();

    console.log(
      `🔍 CORS Check: ${origin} -> ${allowedOrigins.includes(
        origin || ""
      )} (env: ${process.env.NODE_ENV})`
    );

    // 1. No origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Development mode - localhost'a otomatik izin
    if (
      process.env.NODE_ENV === "development" &&
      origin.includes("localhost")
    ) {
      console.log("✅ Development localhost access granted");
      return callback(null, true);
    }

    // 3. Allowed origins listesi
    if (allowedOrigins.includes(origin)) {
      console.log("✅ Origin in allowed list");
      return callback(null, true);
    }

    // 4. Reject
    console.log("❌ CORS blocked:", origin);
    return callback(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Origin",
    "Accept",
    "Cache-Control",
    "Content-Length",
    "X-CSRF-Token",
    "X-Forwarded-For",
  ],
  exposedHeaders: ["Content-Length", "X-JSON", "Location"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours preflight cache
};

app.use(cors(corsOptions));

// 🛡️ Backup CORS + Debug middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Development debug logging
  if (process.env.NODE_ENV === "development") {
    console.log(`🔧 ${req.method} ${req.url} from ${origin || "no-origin"}`);
  }

  // Backup CORS headers - ana CORS middleware fail olursa
  if (origin) {
    const allowedOrigins = getAllowedOrigins();
    const isAllowed =
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV === "development" && origin.includes("localhost"));

    if (isAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,X-Requested-With,Origin,Accept,Cache-Control"
      );
    }
  }

  // OPTIONS preflight - backup handler
  if (req.method === "OPTIONS") {
    console.log("🚀 Handling OPTIONS preflight for:", origin);
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(200).end();
  }

  return next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    // CORS headers for static files
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "https://trucksbus.com.tr",
      "http://trucksbus.com.tr",
      "https://www.trucksbus.com.tr",
      "http://www.trucksbus.com.tr",
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

// Health check endpoint with CORS debug
app.get("/health", (req, res) => {
  console.log("🏥 Health endpoint called from:", req.headers.origin);
  console.log("🏥 Request headers:", req.headers);

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV,
    corsTest: "CORS working if you can see this",
    origin: req.headers.origin,
  });
});

// CORS Test endpoint
app.get("/cors-test", (req, res) => {
  console.log("🧪 CORS Test endpoint called from:", req.headers.origin);
  res.json({
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", routes);

// Serve static files from client build (production)
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
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
  console.log(`🔧 CORS Cache-Control header enabled`); // ❗ Restart trigger
});

export { io };
export default app;
