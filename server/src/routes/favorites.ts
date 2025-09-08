import express from "express";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} from "../controllers/favoriteController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Get user's favorites
router.get("/", authenticateToken, getFavorites);

// Add to favorites
router.post("/", authenticateToken, addToFavorites);

// Remove from favorites
router.delete("/:adId", authenticateToken, removeFromFavorites);

// Check if ad is favorited
router.get("/check/:adId", authenticateToken, checkFavorite);

export default router;
