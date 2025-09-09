import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import * as messagingAPI from "../api/messaging";

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

interface MessagingState {
  conversations: Conversation[];
  currentConversation: {
    messages: Message[];
    otherUserId: number | null;
    adId: number | null;
  };
  unreadCount: number;
  loading: {
    conversations: boolean;
    messages: boolean;
    sending: boolean;
  };
  error: string | null;
}

const initialState: MessagingState = {
  conversations: [],
  currentConversation: {
    messages: [],
    otherUserId: null,
    adId: null,
  },
  unreadCount: 0,
  loading: {
    conversations: false,
    messages: false,
    sending: false,
  },
  error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  "messaging/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      return await messagingAPI.getConversations();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch conversations";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messaging/fetchMessages",
  async (
    { otherUserId, adId }: { otherUserId: number; adId?: number | null },
    { rejectWithValue }
  ) => {
    try {
      const messages = await messagingAPI.getMessages(otherUserId, adId);
      return { messages, otherUserId, adId: adId || null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch messages";
      return rejectWithValue(errorMessage);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messaging/sendMessage",
  async (
    messageData: { receiverId: number; content: string; adId?: number | null },
    { rejectWithValue }
  ) => {
    try {
      return await messagingAPI.sendMessage(messageData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "messaging/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const result = await messagingAPI.getUnreadCount();
      return result.count;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch unread count";
      return rejectWithValue(errorMessage);
    }
  }
);

export const startConversation = createAsyncThunk(
  "messaging/startConversation",
  async (
    data: { adId?: number | null; receiverId: number; initialMessage?: string },
    { rejectWithValue }
  ) => {
    try {
      return await messagingAPI.startConversation({
        receiverId: data.receiverId,
        adId: data.adId,
        initialMessage:
          data.initialMessage ||
          "Merhaba, bu ilanınızla ilgili bilgi almak istiyorum.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start conversation";
      return rejectWithValue(errorMessage);
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  "messaging/markAsRead",
  async (
    { otherUserId, adId }: { otherUserId: number; adId?: number | null },
    { rejectWithValue }
  ) => {
    try {
      await messagingAPI.markAsRead(otherUserId, adId);
      return { otherUserId, adId };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to mark as read";
      return rejectWithValue(errorMessage);
    }
  }
);

const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    newMessageReceived: (
      state,
      action: PayloadAction<{ message: Message; currentUserId: number }>
    ) => {
      const { message, currentUserId } = action.payload;
      console.log(
        "New message received in Redux:",
        message,
        "Current user:",
        currentUserId
      );

      // Add to current conversation if it matches the open conversation
      if (
        state.currentConversation.otherUserId &&
        (state.currentConversation.otherUserId === message.senderId ||
          state.currentConversation.otherUserId === message.receiverId) &&
        state.currentConversation.adId === message.adId
      ) {
        state.currentConversation.messages.push(message);
        console.log("Message added to current conversation");
      }

      // For conversation list, determine the other user
      const otherUserId =
        message.senderId === currentUserId
          ? message.receiverId
          : message.senderId;
      const conversationId = `${otherUserId}-${message.adId || "general"}`;

      const existingConversation = state.conversations.find(
        (conv) => conv.id === conversationId
      );

      if (existingConversation) {
        existingConversation.lastMessage = message;
        existingConversation.updatedAt = message.createdAt;

        // Only increment unread count if this message is received (not sent)
        // and the conversation is not currently open
        if (
          message.receiverId === currentUserId &&
          state.currentConversation.otherUserId !== message.senderId
        ) {
          existingConversation.unreadCount++;
          state.unreadCount++;
        }

        // Sort conversations by last message time
        state.conversations.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        console.log("Conversation updated:", conversationId);
      } else {
        console.log(
          "Conversation not found, may need to refresh conversations"
        );
        // Force refresh conversations when a new conversation is detected
        state.loading.conversations = true;
      }
    },
    refreshUnreadCount: (state) => {
      // Mark that unread count needs to be refreshed
      state.loading.conversations = true;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = {
        messages: [],
        otherUserId: null,
        adId: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error = action.payload as string;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        state.currentConversation.messages = action.payload.messages;
        state.currentConversation.otherUserId = action.payload.otherUserId;
        state.currentConversation.adId = action.payload.adId;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        state.currentConversation.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error = action.payload as string;
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Start conversation
      .addCase(startConversation.fulfilled, (state, action) => {
        if ("content" in action.payload) {
          // Message was sent
          state.currentConversation.messages.push(action.payload as Message);
        }
      })

      // Mark conversation as read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { otherUserId, adId } = action.payload;
        const conversationId = `${otherUserId}-${adId || "general"}`;
        const conversation = state.conversations.find(
          (conv) => conv.id === conversationId
        );

        if (conversation) {
          state.unreadCount -= conversation.unreadCount;
          conversation.unreadCount = 0;
        }
      });
  },
});

export const {
  clearError,
  newMessageReceived,
  refreshUnreadCount,
  clearCurrentConversation,
} = messagingSlice.actions;

export default messagingSlice.reducer;
