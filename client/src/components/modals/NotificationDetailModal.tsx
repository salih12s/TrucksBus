import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import type { Notification } from "../../api/notifications";

interface NotificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  open,
  onClose,
  notification,
}) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case "SUCCESS":
        return <SuccessIcon sx={{ fontSize: 48, color: "#4caf50" }} />;
      case "ERROR":
        return <ErrorIcon sx={{ fontSize: 48, color: "#f44336" }} />;
      case "WARNING":
        return <WarningIcon sx={{ fontSize: 48, color: "#ff9800" }} />;
      case "INFO":
      default:
        return <InfoIcon sx={{ fontSize: 48, color: "#2196f3" }} />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case "SUCCESS":
        return "#4caf50";
      case "ERROR":
        return "#f44336";
      case "WARNING":
        return "#ff9800";
      case "INFO":
      default:
        return "#2196f3";
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case "SUCCESS":
        return "Başarılı";
      case "ERROR":
        return "Hata";
      case "WARNING":
        return "Uyarı";
      case "INFO":
      default:
        return "Bilgi";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "visible",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          borderBottom: "2px solid",
          borderColor: getTypeColor(),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={getTypeLabel()}
            size="small"
            sx={{
              bgcolor: getTypeColor(),
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3 }}>
        {/* Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {getIcon()}
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mb: 2,
            color: "#313B4C",
          }}
        >
          {notification.title}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Message */}
        <Box
          sx={{
            bgcolor: "#f8f9fa",
            p: 2,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "#555",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {notification.message}
          </Typography>
        </Box>

        {/* Date */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            📅 {formatDate(notification.createdAt)}
          </Typography>
        </Box>

        {/* Related Ad Info */}
        {notification.relatedId && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`İlan #${notification.relatedId}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: getTypeColor(), color: getTypeColor() }}
            />
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: getTypeColor(),
            "&:hover": {
              bgcolor: getTypeColor(),
              opacity: 0.9,
            },
          }}
        >
          Anladım
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailModal;
