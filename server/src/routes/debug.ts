import { Router } from "express";

const router = Router();

// Debug endpoint to check environment variables
router.get("/env-check", (req, res) => {
  try {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT_SET",
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT_SET", 
      PORT: process.env.PORT,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    };
    
    res.json({
      success: true,
      message: "Environment check",
      data: envVars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking environment",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Simple health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
