import apiClient from "./client";
import { getTokenFromStorage } from "../utils/tokenUtils";

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  adId: number | null;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  receiver: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  ad?: {
    id: number;
    title: string;
  } | null;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  ad?: {
    id: number;
    title: string;
  } | null;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface StartConversationData {
  receiverId: number;
  adId?: number | null;
  initialMessage: string;
}

export interface SendMessageData {
  receiverId: number;
  content: string;
  adId?: number | null;
}

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
  const token = getTokenFromStorage();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await apiClient.get("/messages/conversations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Conversation[];
};

// Get messages for a specific conversation
export const getMessages = async (
  otherUserId: number,
  adId?: number | null
): Promise<Message[]> => {
  const token = getTokenFromStorage();
  if (!token) {
    throw new Error("Authentication required");
  }

  let url = `/messages/conversations/${otherUserId}`;
  if (adId) {
    url += `/${adId}`;
  }

  const response = await apiClient.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Message[];
};

// Send a message
export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  const token = getTokenFromStorage();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await apiClient.post("/messages/send", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Message;
};

// Get unread message count
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const token = getTokenFromStorage();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await apiClient.get("/messages/unread-count", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as { count: number };
};

// Start a new conversation
export const startConversation = async (
  data: StartConversationData
): Promise<Message> => {
  const token = getTokenFromStorage();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await apiClient.post("/messages/start-conversation", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Message;
};

// Mark conversation as read
export const markAsRead = async (
  otherUserId: number,
  adId?: number | null
): Promise<void> => {
  const token = getTokenFromStorage();
  if (!token) {
    throw new Error("Authentication required");
  }

  const requestData: { otherUserId: number; adId?: number | null } = {
    otherUserId,
  };
  if (adId) requestData.adId = adId;

  await apiClient.post("/messages/mark-read", requestData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
