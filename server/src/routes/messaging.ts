import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  startConversation,
  markAsRead,
} from "../controllers/messaging";

const router = Router();

// All messaging routes require authentication
router.use(authenticateToken);

// Get user's conversations
router.get("/conversations", getConversations);

// Get messages for a specific conversation (with ad)
router.get("/conversations/:otherUserId/:adId", getMessages);

// Get messages for a specific conversation (without ad)
router.get("/conversations/:otherUserId", getMessages);

// Send a new message
router.post("/send", sendMessage);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Start a conversation from an ad
router.post("/start-conversation", startConversation);

// Mark conversation as read
router.post("/mark-read", markAsRead);

export default router;
