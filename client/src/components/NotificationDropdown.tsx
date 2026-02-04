import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  IconButton,
  Badge,
  Popover,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Button,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { notificationAPI, type Notification } from "../api/notifications";
import NotificationDetailModal from "./modals/NotificationDetailModal";
import socketService from "../services/socketService";

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className,
}) => {
  const user = useSelector(
    (state: { auth?: { user?: unknown } }) => state.auth?.user,
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const open = Boolean(anchorEl);

  const fetchNotifications = useCallback(async () => {
    // Kullanıcı giriş yapmamışsa bildirimları çekme
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error("Bildirimler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Sadece kullanıcı giriş yaptıysa bildirimları çek
    if (user) {
      fetchNotifications();

      // Her 30 saniyede bir bildirimları kontrol et
      const interval = setInterval(fetchNotifications, 30000);

      // Socket event listener - yeni bildirim geldiğinde yenile
      const socket = socketService.getSocket();
      if (socket) {
        socket.on("notification", () => {
          console.log("📬 Yeni bildirim alındı - yenileniyor...");
          fetchNotifications();
        });
        socket.on("newNotification", () => {
          console.log("📬 Yeni bildirim sinyali alındı - yenileniyor...");
          fetchNotifications();
        });
      }

      return () => {
        clearInterval(interval);
        if (socket) {
          socket.off("notification");
          socket.off("newNotification");
        }
      };
    }
  }, [user, fetchNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailModalOpen(true);
    // Otomatik olarak okundu işaretle
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Bildirim okundu olarak işaretlenirken hata:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Tüm bildirimler okundu olarak işaretlenirken hata:",
        error,
      );
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId),
      );
      setUnreadCount((prev) => {
        const deletedNotif = notifications.find((n) => n.id === notificationId);
        return deletedNotif && !deletedNotif.isRead
          ? Math.max(0, prev - 1)
          : prev;
      });
    } catch (error) {
      console.error("Bildirim silinirken hata:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "SUCCESS":
        return <SuccessIcon color="success" />;
      case "WARNING":
        return <WarningIcon color="warning" />;
      case "ERROR":
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "SUCCESS":
        return "success";
      case "WARNING":
        return "warning";
      case "ERROR":
        return "error";
      default:
        return "info";
    }
  };

  const getNotificationTypeLabel = (type: Notification["type"]) => {
    switch (type) {
      case "SUCCESS":
        return "Başarılı";
      case "WARNING":
        return "Uyarı";
      case "ERROR":
        return "Hata";
      case "INFO":
      default:
        return "Bilgi";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Şimdi";
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} sa önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        className={className}
        color="inherit"
        aria-label="bildirimler"
        sx={{
          color: "#333",
          padding: "6px 8px",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            color: "#D34237",
            transform: "scale(1.1)",
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ fontSize: 24 }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { width: 380, maxHeight: 500 },
        }}
      >
        <Paper>
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Bildirimler</Typography>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  startIcon={<MarkReadIcon />}
                >
                  Tümünü Okundu İşaretle
                </Button>
              )}
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Henüz bildiriminiz yok
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 350, overflow: "auto", p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                      "&:hover": { backgroundColor: "action.selected" },
                      cursor: "pointer",
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
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
                              fontWeight: notification.isRead
                                ? "normal"
                                : "bold",
                              flex: 1,
                              mr: 1,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {!notification.isRead && (
                              <IconButton
                                size="small"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleMarkAsRead(notification.id);
                                }}
                                title="Okundu İşaretle"
                              >
                                <MarkReadIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteNotification(notification.id);
                              }}
                              title="Sil"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {notification.message}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={getNotificationTypeLabel(
                                notification.type,
                              )}
                              size="small"
                              color={
                                getNotificationColor(notification.type) as
                                  | "default"
                                  | "primary"
                                  | "secondary"
                                  | "error"
                                  | "info"
                                  | "success"
                                  | "warning"
                              }
                              variant="outlined"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTime(notification.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Popover>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        notification={selectedNotification}
      />
    </>
  );
};

export default NotificationDropdown;
