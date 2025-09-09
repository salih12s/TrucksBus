import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Badge,
  Container,
} from "@mui/material";
import {
  Send,
  Search,
  Message,
  Person,
  ArrowBack,
  Schedule,
  DirectionsCar,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationAsRead,
  clearCurrentConversation,
  type Conversation,
} from "../../store/messagingSlice";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const MessagingSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { conversations, currentConversation, loading, error } = useAppSelector(
    (state) => state.messaging
  );

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation.messages]);

  // Load conversations on component mount and refresh when needed
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Refresh conversations when loading flag is set (triggered by new message from unknown conversation)
  useEffect(() => {
    if (loading.conversations) {
      dispatch(fetchConversations());
    }
  }, [loading.conversations, dispatch]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      dispatch(
        fetchMessages({
          otherUserId: selectedConversation.otherUser.id,
          adId: selectedConversation.ad?.id,
        })
      );

      // Mark conversation as read
      if (selectedConversation.unreadCount > 0) {
        dispatch(
          markConversationAsRead({
            otherUserId: selectedConversation.otherUser.id,
            adId: selectedConversation.ad?.id,
          })
        );
      }
    }
  }, [selectedConversation, dispatch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await dispatch(
        sendMessage({
          receiverId: selectedConversation.otherUser.id,
          content: newMessage.trim(),
          adId: selectedConversation.ad?.id,
        })
      );
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    dispatch(clearCurrentConversation());
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      searchQuery === "" ||
      `${conversation.otherUser.firstName || ""} ${
        conversation.otherUser.lastName || ""
      }`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.otherUser.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.ad?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return "bilinmiyor";
    }
  };

  const getUserDisplayName = (user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  }) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  };

  const renderConversationsList = () => (
    <Card sx={{ height: "70vh", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Mesajlar
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Konuşma ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </CardContent>

      <Divider />

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading.conversations ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Message sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography color="text.secondary">
              {searchQuery
                ? "Arama kriterine uygun konuşma bulunamadı"
                : "Henüz hiç mesajınız yok"}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredConversations.map((conversation) => (
              <React.Fragment key={conversation.id}>
                <ListItemButton
                  onClick={() => handleConversationSelect(conversation)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight:
                              conversation.unreadCount > 0 ? "bold" : "normal",
                          }}
                        >
                          {getUserDisplayName(conversation.otherUser)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatMessageTime(conversation.updatedAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        {conversation.ad && (
                          <Chip
                            size="small"
                            icon={<DirectionsCar />}
                            label={conversation.ad.title}
                            variant="outlined"
                            sx={{ mb: 0.5, fontSize: "0.7rem" }}
                          />
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "200px",
                              fontWeight:
                                conversation.unreadCount > 0
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {conversation.lastMessage.content}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              badgeContent={conversation.unreadCount}
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Card>
  );

  const renderMessagesView = () => (
    <Card sx={{ height: "70vh", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={handleBackToConversations} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ mr: 2 }}>
            <Person />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">
              {getUserDisplayName(selectedConversation!.otherUser)}
            </Typography>
            {selectedConversation!.ad && (
              <Chip
                size="small"
                icon={<DirectionsCar />}
                label={selectedConversation!.ad.title}
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
          </Box>
        </Box>
      </CardContent>

      <Divider />

      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
        {loading.messages ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : currentConversation.messages.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              Henüz hiç mesaj yok. İlk mesajı gönderin!
            </Typography>
          </Box>
        ) : (
          <>
            {currentConversation.messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.senderId === user?.id ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: "70%",
                    backgroundColor:
                      message.senderId === user?.id
                        ? "primary.main"
                        : "grey.100",
                    color:
                      message.senderId === user?.id
                        ? "primary.contrastText"
                        : "text.primary",
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      color:
                        message.senderId === user?.id
                          ? "primary.contrastText"
                          : "text.secondary",
                      opacity: 0.8,
                    }}
                  >
                    <Schedule sx={{ fontSize: 12, mr: 0.5 }} />
                    {formatMessageTime(message.createdAt)}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Mesajınızı yazın..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading.sending}
                  color="primary"
                >
                  {loading.sending ? <CircularProgress size={24} /> : <Send />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box
          sx={{
            flex: selectedConversation ? { xs: 1, md: "0 0 33%" } : 1,
            display: selectedConversation
              ? { xs: "none", md: "block" }
              : "block",
          }}
        >
          {renderConversationsList()}
        </Box>

        {selectedConversation && (
          <Box sx={{ flex: { xs: 1, md: "0 0 67%" } }}>
            {renderMessagesView()}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MessagingSystem;
