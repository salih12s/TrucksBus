import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalOffer as LocalOfferIcon,
} from "@mui/icons-material";
import { subscriptionApi, type Package } from "../../api/subscription";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  packageType: string;
  packageData: Package;
  onSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onClose,
  packageType,
  packageData,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      await subscriptionApi.subscribe(packageType);
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Paket aktivasyonunda bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    trucks: {
      primary: "#4CAF50",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
    },
    trucks_plus: {
      primary: "#2196F3",
      gradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    },
    trucksbus: {
      primary: "#D34237",
      gradient: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
    },
  };

  const color = colors[packageType as keyof typeof colors] || colors.trucks;

  if (success) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 6 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: color.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 60, color: "white" }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Tebrikler! 🎉
          </Typography>
          <Typography variant="h6" sx={{ color: "#666", mb: 3 }}>
            <strong>{packageData.name}</strong> başarıyla aktif edildi!
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            İlk 3 ay boyunca ücretsiz olarak {packageData.adLimit} ilan
            yayınlayabilirsiniz.
          </Alert>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Profilinizden paket bilgilerinizi görüntüleyebilirsiniz.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: color.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Typography variant="h3" sx={{ color: "white", fontWeight: 700 }}>
            {packageData.adLimit}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {packageData.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#999",
              textDecoration: "line-through",
            }}
          >
            {packageData.originalPrice} ₺/ay
          </Typography>
        </Box>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mt: 2,
            px: 2,
            py: 0.5,
            backgroundColor: "#D34237",
            color: "white",
            borderRadius: 20,
          }}
        >
          <LocalOfferIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            İlk 3 Ay Ücretsiz!
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Paket Özellikleri:
        </Typography>

        <List>
          {packageData.features.map((feature, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon sx={{ color: color.primary }} />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
            📅 <strong>Deneme Süresi:</strong> İlk 3 ay tamamen ücretsiz
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
            💳 <strong>Ödeme:</strong> 3 ay sonra otomatik ücretlendirme başlar
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            ❌ <strong>İptal:</strong> İstediğiniz zaman iptal edebilirsiniz
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          Bu paketi aktifleştirerek, kullanım şartlarını kabul etmiş olursunuz.
        </Alert>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          startIcon={<CancelIcon />}
          disabled={loading}
          sx={{
            flex: 1,
            color: "#666",
            borderColor: "#ddd",
            "&:hover": {
              borderColor: "#999",
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          }}
        >
          Vazgeç
        </Button>
        <Button
          onClick={handleSubscribe}
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            flex: 1,
            background: color.gradient,
            color: "white",
            fontWeight: 600,
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Paketi Aktifleştir"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionModal;
