import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Business as BusinessIcon,
  LocalOffer as OfferIcon,
} from "@mui/icons-material";

interface Notification {
  id: number;
  type: "info" | "warning" | "success" | "offer";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const Notifications: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "info",
      title: "Yeni Mesaj",
      message: "2019 model Mercedes Sprinter ilanınız için yeni bir mesaj aldınız.",
      time: "2 saat önce",
      isRead: false,
    },
    {
      id: 2,
      type: "success",
      title: "İlan Onaylandı",
      message: "Ford Transit Custom ilanınız onaylandı ve yayınlandı.",
      time: "5 saat önce",
      isRead: false,
    },
    {
      id: 3,
      type: "warning",
      title: "İlan Süresi Dolacak",
      message: "Volkswagen Crafter ilanınızın süresi 3 gün içinde dolacak.",
      time: "1 gün önce",
      isRead: true,
    },
    {
      id: 4,
      type: "offer",
      title: "Yeni Teklif",
      message: "Mercedes Actros ilanınız için 450.000 TL teklif aldınız.",
      time: "2 gün önce",
      isRead: false,
    },
    {
      id: 5,
      type: "info",
      title: "Profil Güncellendi",
      message: "Profil bilgileriniz başarıyla güncellendi.",
      time: "3 gün önce",
      isRead: true,
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "info":
        return <InfoIcon color="info" />;
      case "warning":
        return <WarningIcon color="warning" />;
      case "success":
        return <CheckCircleIcon color="success" />;
      case "offer":
        return <OfferIcon color="primary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getFilteredNotifications = () => {
    switch (tabValue) {
      case 0: // Tümü
        return notifications;
      case 1: // Okunmamış
        return notifications.filter(notif => !notif.isRead);
      case 2: // Teklifler
        return notifications.filter(notif => notif.type === "offer");
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#313B4C" }}>
            Bildirimler
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }} />
            )}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hesabınızla ilgili önemli bildirimler
          </Typography>
        </Box>
        
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkReadIcon />}
            onClick={markAllAsRead}
          >
            Tümünü Okundu İşaretle
          </Button>
        )}
      </Box>

      <Paper sx={{ width: "100%" }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={`Tümü (${notifications.length})`} 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
            />
            <Tab 
              label={`Okunmamış (${unreadCount})`} 
              icon={<Badge badgeContent={unreadCount} color="error"><InfoIcon /></Badge>} 
              iconPosition="start" 
            />
            <Tab 
              label={`Teklifler (${notifications.filter(n => n.type === "offer").length})`} 
              icon={<OfferIcon />} 
              iconPosition="start" 
            />
          </Tabs>
        </Box>

        {/* Notifications List */}
        <Box sx={{ p: 2 }}>
          {getFilteredNotifications().length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {tabValue === 1 ? "Okunmamış bildiriminiz bulunmuyor." : 
               tabValue === 2 ? "Henüz teklif bildirimi bulunmuyor." : 
               "Henüz bildiriminiz bulunmuyor."}
            </Alert>
          ) : (
            <List>
              {getFilteredNotifications().map((notification, index) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    border: "1px solid",
                    borderColor: notification.isRead ? "transparent" : "primary.main",
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: notification.isRead ? "transparent" : "action.hover",
                  }}
                >
                  <ListItemIcon>
                    {getIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Chip label="Yeni" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {!notification.isRead && (
                      <IconButton
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                        title="Okundu İşaretle"
                      >
                        <MarkReadIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => deleteNotification(notification.id)}
                      title="Sil"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Bildirim Ayarları
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<InfoIcon />}>
            E-posta Bildirimleri
          </Button>
          <Button variant="outlined" startIcon={<BusinessIcon />}>
            SMS Bildirimleri
          </Button>
          <Button variant="outlined" startIcon={<OfferIcon />}>
            Push Bildirimleri
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Notifications;
