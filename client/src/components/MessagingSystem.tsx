import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
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
  Badge
} from '@mui/material';
import {
  Send,
  Search,
  Message,
  Person,
  AttachFile,
  MoreVert,
  Phone,
  DirectionsCar,
  Schedule
} from '@mui/icons-material';
import apiClient from '../api/client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  adId?: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  ad?: {
    id: string;
    title: string;
    price: number;
    currency: string;
  };
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  ad?: {
    id: string;
    title: string;
    price: number;
    currency: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

const MessagingSystem: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/messages/conversations');
      setConversations(response.data as Conversation[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Konuşmalar yüklenirken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}`);
      setMessages(response.data as Message[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Mesajlar yüklenirken hata oluştu';
      setError(errorMessage);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await apiClient.post('/messages', {
        receiverId: selectedConversation.otherUser.id,
        content: newMessage.trim(),
        adId: selectedConversation.ad?.id
      });

      const sentMessage = response.data as Message;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update conversation in the list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: sentMessage }
            : conv
        )
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Mesaj gönderilirken hata oluştu';
      setError(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getUserDisplayName = (user: { firstName?: string; lastName?: string; email: string }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUserName = getUserDisplayName(conv.otherUser).toLowerCase();
    const adTitle = conv.ad?.title?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return otherUserName.includes(searchLower) || adTitle.includes(searchLower);
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mesajlar
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', height: '70vh', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        {/* Conversations List */}
        <Paper sx={{ width: 350, borderRight: 1, borderColor: 'divider', borderRadius: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Konuşma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <List sx={{ p: 0, overflow: 'auto', maxHeight: 'calc(70vh - 80px)' }}>
            {filteredConversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Message sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz mesajınız yok'}
                </Typography>
              </Box>
            ) : (
              filteredConversations.map((conversation) => (
                <React.Fragment key={conversation.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedConversation?.id === conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      sx={{ py: 2 }}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={conversation.unreadCount} color="primary">
                          <Avatar>
                            <Person />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" noWrap>
                              {getUserDisplayName(conversation.otherUser)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {conversation.ad && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <DirectionsCar sx={{ fontSize: 14 }} />
                                <Typography variant="caption" color="primary">
                                  {conversation.ad.title}
                                </Typography>
                              </Box>
                            )}
                            <Typography variant="body2" noWrap>
                              {conversation.lastMessage.content}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>

        {/* Messages Panel */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider', borderRadius: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">
                      {getUserDisplayName(selectedConversation.otherUser)}
                    </Typography>
                    {selectedConversation.ad && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <DirectionsCar sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="body2" color="primary">
                          {selectedConversation.ad.title}
                        </Typography>
                        <Chip 
                          label={`${selectedConversation.ad.price.toLocaleString()} ${selectedConversation.ad.currency}`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <IconButton>
                      <Phone />
                    </IconButton>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>

              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
                {messages.map((message) => (
                  <Box 
                    key={message.id}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: message.senderId === selectedConversation.otherUser.id ? 'flex-start' : 'flex-end',
                      mb: 2
                    }}
                  >
                    <Card 
                      sx={{ 
                        maxWidth: '70%',
                        bgcolor: message.senderId === selectedConversation.otherUser.id ? 'white' : 'primary.main',
                        color: message.senderId === selectedConversation.otherUser.id ? 'text.primary' : 'white'
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <Schedule sx={{ fontSize: 12 }} />
                          <Typography variant="caption">
                            {formatMessageTime(message.createdAt)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* Message Input */}
              <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider', borderRadius: 0 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Mesajınızı yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                  />
                  <IconButton disabled={sendingMessage}>
                    <AttachFile />
                  </IconButton>
                  <Button
                    variant="contained"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <Send />
                  </Button>
                </Box>
              </Paper>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              bgcolor: 'grey.50'
            }}>
              <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Bir konuşma seçin
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Mesajlaşmaya başlamak için sol taraftan bir konuşma seçin
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessagingSystem;
