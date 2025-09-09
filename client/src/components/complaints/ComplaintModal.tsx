import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Report } from "@mui/icons-material";
import { createComplaint } from "../../api/complaints";

interface ComplaintModalProps {
  open: boolean;
  onClose: () => void;
  adId: number;
  adTitle: string;
}

const ComplaintModal: React.FC<ComplaintModalProps> = ({
  open,
  onClose,
  adId,
  adTitle,
}) => {
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const complaintReasons = [
    "Yanıltıcı/Yanlış Bilgi",
    "Uygunsuz İçerik",
    "Sahte İlan",
    "Spam/Tekrarlanan İlan",
    "Fiyat Manipülasyonu",
    "İletişim Problemi",
    "Diğer",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.reason.trim() || !formData.description.trim()) {
      return;
    }

    setLoading(true);
    try {
      await createComplaint({
        adId,
        reason: formData.reason,
        description: formData.description,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ reason: "", description: "" });
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Şikayet gönderilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ reason: "", description: "" });
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(45deg, #d32f2f 30%, #f44336 90%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Report />
        <Typography variant="h6" component="span">
          İlan Şikayeti
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 2 }}>
        {success ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Şikayetiniz başarıyla gönderildi!
            </Alert>
            <Typography variant="body1" color="text.secondary">
              Şikayetiniz en kısa sürede değerlendirilecek ve size geri dönüş
              yapılacaktır.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Şikayet Edilen İlan:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: "#f5f5f5",
                  p: 2,
                  borderRadius: 2,
                  fontStyle: "italic",
                }}
              >
                {adTitle}
              </Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Şikayet Nedeni</InputLabel>
              <Select
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                label="Şikayet Nedeni"
                required
              >
                {complaintReasons.map((reason) => (
                  <MenuItem key={reason} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Detaylı Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Lütfen şikayetinizin detaylarını açıklayın..."
              required
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary">
              * Şikayetiniz admin tarafından incelendikten sonra size bildirim
              gönderilecektir.
            </Typography>
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: "#666",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading || !formData.reason.trim() || !formData.description.trim()
            }
            startIcon={loading ? <CircularProgress size={20} /> : <Report />}
            sx={{
              background: "linear-gradient(45deg, #d32f2f 30%, #f44336 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #b71c1c 30%, #d32f2f 90%)",
              },
            }}
          >
            {loading ? "Gönderiliyor..." : "Şikayet Et"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ComplaintModal;
