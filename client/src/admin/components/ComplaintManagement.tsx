import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Report,
  Visibility,
  Reply,
  CheckCircle,
  Cancel,
  Refresh,
} from "@mui/icons-material";
import apiClient from "../../api/client";

interface Complaint {
  id: number;
  reason: string;
  description: string;
  status: "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  response?: string;
  responseDate?: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  ad: {
    id: number;
    title: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
}

const ComplaintManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState<"RESOLVED" | "REJECTED">(
    "RESOLVED"
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/complaints");
      setComplaints(response.data as Complaint[]);
    } catch (error) {
      console.error("Şikayetler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusColor = (
    status: string
  ): "warning" | "info" | "success" | "error" | "default" => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "REVIEWING":
        return "info";
      case "RESOLVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Beklemede";
      case "REVIEWING":
        return "İnceleniyor";
      case "RESOLVED":
        return "Çözüldü";
      case "REJECTED":
        return "Reddedildi";
      default:
        return status;
    }
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleResponseClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.response || "");
    setResponseStatus(
      complaint.status === "REJECTED" ? "REJECTED" : "RESOLVED"
    );
    setResponseModalOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedComplaint || !response.trim()) return;

    setSubmitting(true);
    try {
      await apiClient.put(`/admin/complaints/${selectedComplaint.id}/respond`, {
        response: response.trim(),
        status: responseStatus,
      });

      // Şikayetler listesini güncelle
      await fetchComplaints();

      setResponseModalOpen(false);
      setSelectedComplaint(null);
      setResponse("");
    } catch (error) {
      console.error("Cevap gönderilirken hata:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (complaintId: number, newStatus: string) => {
    try {
      await apiClient.put(`/admin/complaints/${complaintId}/status`, {
        status: newStatus,
      });
      await fetchComplaints();
    } catch (error) {
      console.error("Durum güncellenirken hata:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
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
        <Typography
          variant="h4"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Report color="error" />
          Şikayet Yönetimi
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchComplaints}
          disabled={loading}
        >
          Yenile
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <strong>ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Şikayet Eden</strong>
                  </TableCell>
                  <TableCell>
                    <strong>İlan</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Neden</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Durum</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Tarih</strong>
                  </TableCell>
                  <TableCell>
                    <strong>İşlemler</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id} hover>
                    <TableCell>{complaint.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {[complaint.user.firstName, complaint.user.lastName]
                            .filter(Boolean)
                            .join(" ") || "Belirtilmemiş"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {complaint.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {complaint.ad.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          İlan Sahibi:{" "}
                          {[
                            complaint.ad.user.firstName,
                            complaint.ad.user.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {complaint.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(complaint.status)}
                        color={getStatusColor(complaint.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(complaint.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Detayları Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() => handleViewComplaint(complaint)}
                            color="info"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cevap Ver">
                          <IconButton
                            size="small"
                            onClick={() => handleResponseClick(complaint)}
                            color="primary"
                          >
                            <Reply fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {complaint.status === "PENDING" && (
                          <>
                            <Tooltip title="Çözüldü Olarak İşaretle">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUpdateStatus(complaint.id, "RESOLVED")
                                }
                                color="success"
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reddet">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUpdateStatus(complaint.id, "REJECTED")
                                }
                                color="error"
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {complaints.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Henüz şikayet bulunmuyor
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Şikayet Detay Modal */}
      <Dialog
        open={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedComplaint && (
          <>
            <DialogTitle>
              <Typography variant="h6" component="span">
                Şikayet Detayları - #{selectedComplaint.id}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Şikayet Eden Kullanıcı:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {[
                    selectedComplaint.user.firstName,
                    selectedComplaint.user.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}{" "}
                  ({selectedComplaint.user.email})
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Şikayet Edilen İlan:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedComplaint.ad.title}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Şikayet Nedeni:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {selectedComplaint.reason}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Detaylı Açıklama:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                  }}
                >
                  {selectedComplaint.description}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Durum:
                </Typography>
                <Chip
                  label={getStatusText(selectedComplaint.status)}
                  color={getStatusColor(selectedComplaint.status)}
                  sx={{ mb: 2 }}
                />

                {selectedComplaint.response && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Admin Cevabı:
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {selectedComplaint.response}
                    </Alert>
                    {selectedComplaint.responseDate && (
                      <Typography variant="caption" color="text.secondary">
                        Cevap Tarihi:{" "}
                        {new Date(
                          selectedComplaint.responseDate
                        ).toLocaleString("tr-TR")}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedComplaint(null)}>Kapat</Button>
              <Button
                variant="contained"
                onClick={() => handleResponseClick(selectedComplaint)}
              >
                Cevap Ver
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Cevap Modal */}
      <Dialog
        open={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Şikayete Cevap Ver</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Durum</InputLabel>
              <Select
                value={responseStatus}
                onChange={(e) =>
                  setResponseStatus(e.target.value as "RESOLVED" | "REJECTED")
                }
                label="Durum"
              >
                <MenuItem value="RESOLVED">Çözüldü</MenuItem>
                <MenuItem value="REJECTED">Reddedildi</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Cevap"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Şikayetiniz için teşekkürler..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResponseModalOpen(false)}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitResponse}
            disabled={!response.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Reply />}
          >
            {submitting ? "Gönderiliyor..." : "Cevap Gönder"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintManagement;
