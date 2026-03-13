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
  securityHeaders,
  requestSizeLimit,
} from "./middleware/security";

// Load environment variables first
dotenv.config(); // Load default .env first

// Then load local development overrides if in development
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.local", override: true });
  console.log("🔧 Loading local development environment variables");
}

const app = express();

// 🔐 Helmet: static dosya CORS'una karışmasın
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Video upload için devre dışı
  }),
);

// ✅ KESIN CORS ÇÖZÜMÜ - Frontend 5174 + Production
const allowedOrigins = [
  "http://localhost:5175", // Yeni port
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://trucksbus.com.tr",
  "https://www.trucksbus.com.tr",
  "http://trucksbus.com.tr",
  "http://www.trucksbus.com.tr",
];

app.use(
  cors({
    origin: function (origin, cb) {
      console.log(
        `🔍 CORS Check: "${origin}" -> ${
          allowedOrigins.includes(origin || "") ? "✅ ALLOWED" : "❌ BLOCKED"
        }`,
      );

      // Postman/cURL gibi origin'siz istekler için izin ver
      if (!origin) return cb(null, true);

      // İzin verilen originler
      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true, // withCredentials için şart
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-XSRF-TOKEN",
    ],
    exposedHeaders: ["Content-Disposition"],
  }),
);

const server = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(compression());

// Apply data sanitization middleware
app.use(sanitizeData);

// Request size limiting - Video için 100MB
app.use(requestSizeLimit("100mb"));

// Global rate limiting
app.use(generalLimiter);

// Body parsing middleware - JSON + URL-encoded (Video için 100MB)
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Serve static files from uploads directory with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../uploads")),
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV,
    corsTest: "CORS working if you can see this",
  });
});

// Test endpoint for debugging
app.get("/test", (req, res) => {
  console.log("🧪 TEST endpoint çağrıldı");
  res.json({ message: "Test başarılı!", time: new Date().toISOString() });
});

// Request logging middleware
app.use("/api", (req, res, next) => {
  // Normalize currency field - FormData may send it as array if appended twice
  if (req.body && Array.isArray(req.body.currency)) {
    req.body.currency = req.body.currency[0];
  }
  console.log(
    `📡 ${req.method} ${req.originalUrl} - IP: ${req.ip} - Headers:`,
    {
      origin: req.headers.origin,
      "user-agent": req.headers["user-agent"]?.substring(0, 50) + "...",
    },
  );
  next();
});

// API routes - ROUTES EN SON!
app.use("/api", routes);

// Serve static files from client build (production)
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));

  // SPA fallback
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.includes(".")) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// 404 handler
app.use((req, res, next) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
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
    next: express.NextFunction,
  ) => {
    console.error("Global error handler:", err);

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
  },
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

  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room (socket: ${socket.id})`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚛 TrucksBus server running on port ${PORT}`);
  console.log(`🔒 Security: CORS, Helmet, Rate limiting`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ CORS allowed origins:`, allowedOrigins);
});

export { io };
export default app;
