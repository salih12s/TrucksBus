import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { feedbackAPI, type Feedback } from "../api/feedback";

const MyFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const result = await feedbackAPI.getUserFeedbacks();
      if (result.success) {
        setFeedbacks(result.data);
      } else {
        setError(result.message || "Geri bildirimler yüklenemedi");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const getStatusColor = (
    status: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (status) {
      case "OPEN":
        return "error";
      case "REVIEWED":
        return "warning";
      case "RESPONDED":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Açık";
      case "REVIEWED":
        return "İnceleniyor";
      case "RESPONDED":
        return "Yanıtlandı";
      default:
        return status;
    }
  };

  const getPriorityColor = (
    priority: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (priority) {
      case "LOW":
        return "info";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "error";
      case "URGENT":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "Düşük";
      case "MEDIUM":
        return "Orta";
      case "HIGH":
        return "Yüksek";
      case "URGENT":
        return "Acil";
      default:
        return priority;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "TECHNICAL":
        return "Teknik Sorun";
      case "UI_UX":
        return "Kullanım Sorunu";
      case "FEATURE_REQUEST":
        return "Özellik İsteği";
      case "BUG_REPORT":
        return "Hata Bildirimi";
      case "OTHER":
        return "Diğer";
      default:
        return category;
    }
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleCloseModal = () => {
    setSelectedFeedback(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Geri Bildirimlerim
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadFeedbacks}
          disabled={loading}
        >
          Yenile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Konu</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Öncelik</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {feedback.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(feedback.category)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityLabel(feedback.priority)}
                        size="small"
                        color={getPriorityColor(feedback.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(feedback.status)}
                        size="small"
                        color={getStatusColor(feedback.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(feedback.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewFeedback(feedback)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {feedbacks.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Henüz geri bildiriminiz bulunmuyor.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Görüntüleme Modal'ı */}
      <Dialog
        open={!!selectedFeedback}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        {selectedFeedback && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Geri Bildirim Detayı</Typography>
              <IconButton onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Konu:</strong> {selectedFeedback.title}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Kategori:</strong>{" "}
                  {getCategoryLabel(selectedFeedback.category)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Öncelik:</strong>{" "}
                  {getPriorityLabel(selectedFeedback.priority)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Durum:</strong>{" "}
                  {getStatusLabel(selectedFeedback.status)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Tarih:</strong>{" "}
                  {new Date(selectedFeedback.createdAt).toLocaleString("tr-TR")}
                </Typography>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                <strong>Açıklama:</strong>
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}
              >
                {selectedFeedback.description}
              </Typography>

              {selectedFeedback.adminResponse && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Admin Yanıtı:</strong>
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "success.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "success.200",
                    }}
                  >
                    <Typography variant="body1">
                      {selectedFeedback.adminResponse}
                    </Typography>
                    {selectedFeedback.adminResponseAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Yanıt Tarihi:{" "}
                        {new Date(
                          selectedFeedback.adminResponseAt
                        ).toLocaleString("tr-TR")}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Kapat</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyFeedback;
