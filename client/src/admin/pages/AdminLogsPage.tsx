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
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh,
  Security as SecurityIcon,
  Block as BlockIcon,
  Login as LoginIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";
import apiClient from "../../api/client";

interface AdminLog {
  id: number;
  adminId: number;
  adminEmail: string;
  action: string;
  targetUserId?: number;
  targetUserEmail?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AdminLogResponse {
  logs: AdminLog[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/admin/logs");
      console.log("Raw API response:", response.data);

      const responseData = response.data as AdminLogResponse | AdminLog[]; // Proper typing

      // API response'un yapısını kontrol et
      if (
        responseData &&
        typeof responseData === "object" &&
        "logs" in responseData &&
        Array.isArray(responseData.logs)
      ) {
        console.log("Setting logs from response.logs:", responseData.logs);
        setLogs(responseData.logs);
      } else if (Array.isArray(responseData)) {
        // Backward compatibility - direkt array dönerse
        console.log("Setting logs directly from array:", responseData);
        setLogs(responseData);
      } else {
        console.error("API response format error:", responseData);
        setLogs([]);
        setError("Admin logları yüklenirken veri formatı hatası oluştu");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Bilinmeyen hata";
      setError("Admin logları yüklenirken bir hata oluştu: " + errorMessage);
      console.error("Error fetching admin logs:", err);
      setLogs([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = React.useMemo(() => {
    console.log("Current logs state:", logs, "Is array:", Array.isArray(logs));

    if (!Array.isArray(logs)) {
      console.error("logs is not an array:", typeof logs, logs);
      return [];
    }

    return logs.filter(
      (log) =>
        log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.targetUserEmail &&
          log.targetUserEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <LoginIcon color="success" />;
      case "LOGOUT":
        return <LogoutIcon color="action" />;
      case "TOGGLE_USER_STATUS":
        return <BlockIcon color="warning" />;
      default:
        return <SecurityIcon color="primary" />;
    }
  };

  const getActionColor = (
    action: string
  ): "success" | "default" | "warning" | "primary" => {
    switch (action) {
      case "LOGIN":
        return "success";
      case "LOGOUT":
        return "default";
      case "TOGGLE_USER_STATUS":
        return "warning";
      default:
        return "primary";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "Giriş Yaptı";
      case "LOGOUT":
        return "Çıkış Yaptı";
      case "TOGGLE_USER_STATUS":
        return "Kullanıcı Durumu Değiştirdi";
      default:
        return action;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            Admin Activity Logs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tüm admin eylemlerini izleyin ve güvenlik denetimi yapın
          </Typography>
        </Box>
        <IconButton
          onClick={fetchLogs}
          disabled={loading}
          sx={{
            backgroundColor: "#f44336",
            color: "white",
            "&:hover": {
              backgroundColor: "#d32f2f",
            },
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Arama */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Log ara (admin email, hedef kullanıcı, eylem)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Hata Mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loglar Tablosu */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              Aktivite Geçmişi ({filteredLogs.length})
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Admin</TableCell>
                    <TableCell>Eylem</TableCell>
                    <TableCell>Hedef Kullanıcı</TableCell>
                    <TableCell>Detaylar</TableCell>
                    <TableCell>IP Adresi</TableCell>
                    <TableCell>Tarih/Saat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{ bgcolor: "#0F2027", width: 32, height: 32 }}
                            >
                              {log.adminEmail.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {log.adminEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getActionIcon(log.action)}
                            <Chip
                              label={getActionText(log.action)}
                              color={getActionColor(log.action)}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.targetUserEmail || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ maxWidth: 200, wordBreak: "break-word" }}
                          >
                            {log.details || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {log.ipAddress || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(log.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          py={4}
                        >
                          {searchTerm
                            ? "Arama kriterinize uygun log bulunamadı"
                            : "Henüz aktivite logu bulunmuyor"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogsPage;
