import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { feedbackAPI, type CreateFeedbackRequest } from "../../api/feedback";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FEEDBACK_CATEGORIES = [
  { value: "TECHNICAL", label: "Teknik Sorun" },
  { value: "UI_UX", label: "Kullanım Sorunu" },
  { value: "FEATURE_REQUEST", label: "Özellik İsteği" },
  { value: "BUG_REPORT", label: "Hata Bildirimi" },
  { value: "OTHER", label: "Diğer" },
];

const FEEDBACK_URGENCY = [
  { value: "LOW", label: "Düşük" },
  { value: "MEDIUM", label: "Orta" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    category: "",
    urgency: "MEDIUM",
    subject: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.category ||
      !formData.subject.trim() ||
      !formData.content.trim()
    ) {
      setError("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await feedbackAPI.createFeedback({
        title: formData.subject.trim(),
        description: formData.content.trim(),
        category: formData.category as CreateFeedbackRequest["category"],
        priority: formData.urgency as CreateFeedbackRequest["priority"],
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error(response.message || "Geri bildirim gönderilemedi");
      }
    } catch (err: unknown) {
      console.error("Feedback submission error:", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.message || error.message || "Bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: "",
      urgency: "MEDIUM",
      subject: "",
      content: "",
    });
    setError(null);
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  if (success) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            ✅ Geri Bildiriminiz Başarıyla Gönderildi!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Geri bildiriminiz için teşekkür ederiz. En kısa sürede değerlendirip
            size dönüş yapacağız.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h6" component="div">
          Geri Bildirim Gönder
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Görüşleriniz bizim için değerli. Lütfen düşüncelerinizi paylaşın.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.category}
                label="Kategori"
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                {FEEDBACK_CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={formData.urgency}
                label="Öncelik"
                onChange={(e) => handleInputChange("urgency", e.target.value)}
              >
                {FEEDBACK_URGENCY.map((urgency) => (
                  <MenuItem key={urgency.value} value={urgency.value}>
                    {urgency.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Konu"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            placeholder="Geri bildiriminizin konusunu yazın..."
            required
            inputProps={{ maxLength: 200 }}
            helperText={`${formData.subject.length}/200`}
          />

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Mesaj"
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="Detaylı açıklamanızı buraya yazın..."
            required
            inputProps={{ maxLength: 2000 }}
            helperText={`${formData.content.length}/2000`}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Gönderen:{" "}
            {JSON.parse(localStorage.getItem("user") || "{}")?.email ||
              "memet@abc.com"}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Gönderiliyor..." : "Gönder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;
