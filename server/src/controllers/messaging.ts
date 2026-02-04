import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { io } from "../app";
import { AuthenticatedRequest } from "../middleware/auth";

const prisma = new PrismaClient();

// Get conversations for a user
export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get all unique conversations (both as sender and receiver)
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        ad: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group messages by conversation (other user + ad)
    const conversationMap = new Map();

    conversations.forEach((message: any) => {
      const otherUserId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser =
        message.senderId === userId ? message.receiver : message.sender;
      const conversationKey = `${otherUserId}-${message.adId || "general"}`;

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          otherUser,
          ad: message.ad,
          lastMessage: message,
          unreadCount: 0,
          updatedAt: message.createdAt,
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        const conversation = conversationMap.get(conversationKey);
        conversation.unreadCount++;
      }
    });

    const result = Array.from(conversationMap.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a specific conversation
export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { otherUserId, adId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const otherUserIdNum = parseInt(otherUserId);
    const adIdNum = adId ? parseInt(adId) : null;

    const messages = await prisma.message.findMany({
      where: {
        AND: [
          {
            OR: [
              { senderId: userId, receiverId: otherUserIdNum },
              { senderId: otherUserIdNum, receiverId: userId },
            ],
          },
          adIdNum ? { adId: adIdNum } : { adId: null },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        ad: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserIdNum,
        receiverId: userId,
        adId: adIdNum,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a new message
export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { receiverId, content, adId } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!receiverId || !content) {
      res.status(400).json({ error: "Receiver ID and content are required" });
      return;
    }

    const receiverIdNum = parseInt(receiverId);
    const adIdNum = adId ? parseInt(adId) : null;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverIdNum },
    });

    if (!receiver) {
      res.status(404).json({ error: "Receiver not found" });
      return;
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId: receiverIdNum,
        adId: adIdNum,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        ad: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Emit real-time message to receiver AND sender (for multi-device sync)
    if (io) {
      console.log(
        `📨 Emitting newMessage to user_${receiverIdNum} and user_${userId}:`,
        {
          messageId: message.id,
          content: message.content,
          senderId: message.senderId,
        },
      );
      // Alıcıya mesajı gönder
      io.to(`user_${receiverIdNum}`).emit("newMessage", message);
      io.to(`user_${receiverIdNum}`).emit("updateUnreadCount");

      // Gönderene de mesajı gönder (farklı cihazda açıksa senkronize olsun)
      io.to(`user_${userId}`).emit("newMessage", message);
    } else {
      console.log("❌ Socket.io not available for real-time messaging");
    }

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverIdNum,
        title: "Yeni Mesaj",
        message: `${
          message.sender.firstName || message.sender.email
        } size bir mesaj gönderdi${message.ad ? ` - ${message.ad.title}` : ""}`,
        type: "MESSAGE",
        isRead: false,
        relatedId: message.id,
      },
    });

    // Emit notification update
    if (io) {
      io.to(`user_${receiverIdNum}`).emit("newNotification");
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get unread message count
export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    res.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Start a conversation from ad
export const startConversation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { adId, receiverId, initialMessage } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!adId || !receiverId) {
      res.status(400).json({ error: "Ad ID and receiver ID are required" });
      return;
    }

    const adIdNum = parseInt(adId);

    // Check if ad exists and get ad owner
    const ad = await prisma.ad.findUnique({
      where: { id: adIdNum },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!ad) {
      res.status(404).json({ error: "Ad not found" });
      return;
    }

    // Check if user is trying to message themselves
    if (ad.userId === userId) {
      res.status(400).json({ error: "Cannot message yourself" });
      return;
    }

    // Send initial message if provided
    if (initialMessage) {
      const message = await prisma.message.create({
        data: {
          content: initialMessage,
          senderId: userId,
          receiverId: ad.userId,
          adId: adIdNum,
          isRead: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          ad: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Emit real-time message
      if (io) {
        io.to(`user_${ad.userId}`).emit("newMessage", message);
        io.to(`user_${ad.userId}`).emit("updateUnreadCount");
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId: ad.userId,
          title: "Yeni Mesaj",
          message: `${
            message.sender.firstName || message.sender.email
          } ilanınız hakkında size bir mesaj gönderdi - ${ad.title}`,
          type: "MESSAGE",
          isRead: false,
          relatedId: message.id,
        },
      });

      // Emit notification update
      if (io) {
        io.to(`user_${ad.userId}`).emit("newNotification");
      }

      res.status(201).json(message);
      return;
    }

    // Return conversation info
    res.json({
      conversationId: `${ad.userId}-${adIdNum}`,
      otherUser: ad.user,
      ad: {
        id: ad.id,
        title: ad.title,
      },
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark conversation as read
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { otherUserId, adId } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!otherUserId) {
      res.status(400).json({ error: "Other user ID is required" });
      return;
    }

    const otherUserIdNum = parseInt(otherUserId);
    const adIdNum = adId ? parseInt(adId) : null;

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserIdNum,
        receiverId: userId,
        adId: adIdNum,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
