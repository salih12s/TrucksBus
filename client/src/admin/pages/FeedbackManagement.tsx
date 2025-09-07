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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { feedbackAPI, type Feedback } from "../../api/feedback";

const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [responseModal, setResponseModal] = useState(false);
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState<
    "REVIEWED" | "RESPONDED"
  >("REVIEWED");
  const [submitting, setSubmitting] = useState(false);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const result = await feedbackAPI.getAllFeedbacks();
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

  const handleRespondFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponse(feedback.response || "");
    setResponseStatus(feedback.status === "OPEN" ? "REVIEWED" : "RESPONDED");
    setResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback) return;

    try {
      setSubmitting(true);
      const result = await feedbackAPI.updateFeedbackStatus(
        selectedFeedback.id,
        {
          status: responseStatus,
          response: response.trim() || undefined,
        }
      );

      if (result.success) {
        await loadFeedbacks();
        setResponseModal(false);
        setResponse("");
        setSelectedFeedback(null);
      } else {
        setError(result.message || "Yanıt gönderilemedi");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModals = () => {
    setSelectedFeedback(null);
    setResponseModal(false);
    setResponse("");
    setError(null);
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
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Geri Bildirim Yönetimi
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
                  <TableCell>Kullanıcı</TableCell>
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
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {feedback.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {feedback.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
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
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() => handleViewFeedback(feedback)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Yanıtla">
                          <IconButton
                            size="small"
                            onClick={() => handleRespondFeedback(feedback)}
                            color="primary"
                          >
                            <Badge
                              color="error"
                              variant="dot"
                              invisible={feedback.status !== "OPEN"}
                            >
                              <ReplyIcon />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {feedbacks.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Henüz geri bildirim bulunmuyor.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Görüntüleme Modal'ı */}
      <Dialog
        open={!!selectedFeedback && !responseModal}
        onClose={handleCloseModals}
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
              <IconButton onClick={handleCloseModals}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Kullanıcı:</strong> {selectedFeedback.user.name} (
                  {selectedFeedback.user.email})
                </Typography>
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

              {selectedFeedback.response && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Admin Yanıtı:</strong>
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ p: 2, bgcolor: "primary.50", borderRadius: 1 }}
                  >
                    {selectedFeedback.response}
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
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModals}>Kapat</Button>
              <Button
                variant="contained"
                onClick={() => handleRespondFeedback(selectedFeedback)}
              >
                Yanıtla
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Yanıt Modal'ı */}
      <Dialog
        open={responseModal}
        onClose={handleCloseModals}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Geri Bildirime Yanıt Ver</DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {selectedFeedback.user.name} - {selectedFeedback.title}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={responseStatus}
              label="Durum"
              onChange={(e) =>
                setResponseStatus(e.target.value as "REVIEWED" | "RESPONDED")
              }
            >
              <MenuItem value="REVIEWED">İnceleniyor</MenuItem>
              <MenuItem value="RESPONDED">Yanıtlandı</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Yanıt (opsiyonel)"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Kullanıcıya gönderilecek yanıt mesajını yazın..."
            helperText="Bu mesaj kullanıcıya bildirim olarak gönderilecektir."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSubmitResponse}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackManagement;
