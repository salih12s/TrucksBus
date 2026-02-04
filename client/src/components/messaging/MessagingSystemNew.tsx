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
  Message as MessageIcon,
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
import socketService from "../../services/socketService";
import { useLocation } from "react-router-dom";

const MessagingSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { conversations, currentConversation, loading, error } = useAppSelector(
    (state) => state.messaging,
  );

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newConversationParams, setNewConversationParams] = useState<{
    userId: number;
    adId?: number;
  } | null>(null);
  const [newConversationAd, setNewConversationAd] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true); // İlk yükleme mi takip et
  const lastConversationIdRef = useRef<string | null>(null); // Son açılan konuşma ID'si

  // ✅ SADECE İLK YÜKLEMEDE SCROLL YAP - Mesaj gönderildiğinde ASLA scroll yapma
  useEffect(() => {
    // Mevcut konuşma ID'sini hesapla
    const currentConversationId = selectedConversation
      ? `${selectedConversation.otherUser.id}-${selectedConversation.ad?.id || "general"}`
      : newConversationParams
        ? `${newConversationParams.userId}-${newConversationParams.adId || "general"}`
        : null;

    // Konuşma değişti mi kontrol et
    if (currentConversationId !== lastConversationIdRef.current) {
      isInitialLoadRef.current = true;
      lastConversationIdRef.current = currentConversationId;
    }

    // SADECE İLK YÜKLEME'de scroll yap (konuşma açıldığında)
    if (isInitialLoadRef.current && currentConversation.messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 200);
      isInitialLoadRef.current = false; // Artık yeni mesajlarda scroll yapma
    }
  }, [
    currentConversation.messages,
    selectedConversation,
    newConversationParams,
  ]);

  // Load conversations on component mount and refresh when needed
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Socket bağlantısının aktif olduğundan emin ol
  useEffect(() => {
    if (!user) return;

    // Socket bağlantısını kontrol et ve yoksa yeniden bağlan
    const socket = socketService.getSocket();
    if (!socket || !socket.connected) {
      console.log("🔄 Socket bağlantısı yenileniyor...");
      socketService.connect(user.id);
    }
  }, [user]);

  // Refresh conversations when loading flag is set (triggered by new message from unknown conversation)
  useEffect(() => {
    if (loading.conversations) {
      dispatch(fetchConversations());
    }
  }, [loading.conversations, dispatch]);

  // URL parametrelerinden konuşma başlat
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get("userId");
    const adId = searchParams.get("adId");

    if (userId && !selectedConversation && !newConversationParams) {
      const userIdNum = parseInt(userId);
      const adIdNum = adId ? parseInt(adId) : undefined;

      // Konuşmaları yenile
      dispatch(fetchConversations())
        .unwrap()
        .then((fetchedConversations) => {
          // Konuşmayı bul
          const targetConversation = fetchedConversations.find(
            (conv: Conversation) =>
              conv.otherUser.id === userIdNum &&
              (adIdNum ? conv.ad?.id === adIdNum : true),
          );

          if (targetConversation) {
            console.log(
              "🎯 URL parametresinden konuşma açılıyor:",
              targetConversation,
            );
            handleConversationSelect(targetConversation);
          } else {
            // Konuşma yoksa yeni konuşma parametrelerini kaydet
            console.log("🆕 Yeni konuşma modu açılıyor...");
            setNewConversationParams({ userId: userIdNum, adId: adIdNum });

            // Eğer adId varsa, ad bilgisini çek
            if (adIdNum) {
              fetch(`/api/ads/${adIdNum}`)
                .then((res) => res.json())
                .then((data) => {
                  if (data) {
                    setNewConversationAd({ id: data.id, title: data.title });
                  }
                })
                .catch((err) => console.error("İlan bilgisi alınamadı:", err));
            }
          }
        });
    }
  }, [location.search, selectedConversation, newConversationParams, dispatch]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      dispatch(
        fetchMessages({
          otherUserId: selectedConversation.otherUser.id,
          adId: selectedConversation.ad?.id,
        }),
      );

      // Mark conversation as read
      if (selectedConversation.unreadCount > 0) {
        dispatch(
          markConversationAsRead({
            otherUserId: selectedConversation.otherUser.id,
            adId: selectedConversation.ad?.id,
          }),
        );
      }
    }
  }, [selectedConversation, dispatch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    // Yeni konuşma modunda veya mevcut konuşmada olabilir
    const receiverId =
      selectedConversation?.otherUser.id || newConversationParams?.userId;
    const adId = selectedConversation?.ad?.id || newConversationParams?.adId;

    if (!receiverId) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Hemen input'u temizle

    try {
      await dispatch(
        sendMessage({
          receiverId,
          content: messageContent,
          adId,
        }),
      ).unwrap();

      // Mesaj gönderildikten sonra konuşmaları yenile ve konuşmayı aç
      if (newConversationParams) {
        dispatch(fetchConversations())
          .unwrap()
          .then((fetchedConversations) => {
            const newConv = fetchedConversations.find(
              (conv: Conversation) =>
                conv.otherUser.id === receiverId &&
                (adId ? conv.ad?.id === adId : true),
            );
            if (newConv) {
              setNewConversationParams(null);
              handleConversationSelect(newConv);
            }
          });
      }

      // ❌ SCROLL YAPMA - Kullanıcı istediği yerde kalabilir
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(messageContent); // Hata durumunda mesajı geri yükle
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setNewConversationParams(null); // Yeni konuşma modunu kapat
    // Yeni konuşma açıldığında initial load flag'ini resetle
    isInitialLoadRef.current = true;
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setNewConversationParams(null); // Yeni konuşma modunu kapat
    setNewConversationAd(null); // Ad bilgisini temizle
    dispatch(clearCurrentConversation());
    // Konuşma listesine dönüldüğünde ref'leri resetle
    isInitialLoadRef.current = true;
    lastConversationIdRef.current = null;
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
      conversation.ad?.title.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <MessageIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
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

  const renderMessagesView = () => {
    // Yeni konuşma modu veya mevcut konuşma
    const displayUser = selectedConversation?.otherUser || {
      id: newConversationParams?.userId || 0,
      firstName: null,
      lastName: null,
      email: "İlk mesajınızı yazın",
    };
    const displayAd = selectedConversation?.ad || newConversationAd;

    return (
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
                {getUserDisplayName(displayUser)}
              </Typography>
              {displayAd && (
                <Chip
                  size="small"
                  icon={<DirectionsCar />}
                  label={displayAd.title}
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
              )}
            </Box>
          </Box>
        </CardContent>

        <Divider />

        <Box
          ref={messagesContainerRef}
          sx={{ flex: 1, overflow: "auto", p: 1 }}
        >
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
            onKeyDown={(e) => {
              // Enter'a basıldığında (Shift olmadan) mesajı gönder
              if (e.key === "Enter" && !e.shiftKey && !loading.sending) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading.sending}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || loading.sending}
                    color="primary"
                  >
                    {loading.sending ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Send />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Card>
    );
  };

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
            flex:
              selectedConversation || newConversationParams
                ? { xs: 1, md: "0 0 33%" }
                : 1,
            display:
              selectedConversation || newConversationParams
                ? { xs: "none", md: "block" }
                : "block",
          }}
        >
          {renderConversationsList()}
        </Box>

        {(selectedConversation || newConversationParams) && (
          <Box sx={{ flex: { xs: 1, md: "0 0 67%" } }}>
            {renderMessagesView()}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MessagingSystem;
