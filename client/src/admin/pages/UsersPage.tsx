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
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import apiClient from "../../api/client";

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/auth/users");
      setUsers(response.data as User[]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Bilinmeyen hata";
      setError("Kullanıcılar yüklenirken bir hata oluştu: " + errorMessage);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await apiClient.patch(
        `/auth/users/${userId}/toggle-status`,
      );

      // Başarılı ise listeyi güncelle
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user,
        ),
      );

      // Başarı mesajı
      const responseData = response.data as { message: string };
      setSuccessMessage(responseData.message);
      setConfirmDialog({ open: false, user: null });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Bilinmeyen hata";
      setError("Kullanıcı durumu değiştirilirken hata oluştu: " + errorMessage);
      console.error("Error toggling user status:", err);
      setConfirmDialog({ open: false, user: null });
    }
  };

  const handleToggleClick = (user: User) => {
    setConfirmDialog({ open: true, user });
  };

  const handleConfirmToggle = () => {
    if (confirmDialog.user) {
      toggleUserStatus(confirmDialog.user.id, confirmDialog.user.isActive);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName &&
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName &&
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email.split("@")[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: { xs: "1.5rem", md: "2.125rem" },
            }}
          >
            Kullanıcılar
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}
          >
            Tüm kayıtlı kullanıcıları görüntüleyin ve yönetin
          </Typography>
        </Box>
        <IconButton
          onClick={fetchUsers}
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
            placeholder="Kullanıcı ara (email, isim)..."
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

      {/* Kullanıcılar Tablosu */}
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
              Kullanıcı Listesi ({filteredUsers.length})
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ overflowX: "auto" }}
            >
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Kullanıcı</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Kayıt Tarihi</TableCell>
                    <TableCell>Son Giriş</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "#1976d2" }}>
                              {getDisplayName(user).charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {getDisplayName(user)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.phone || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              user.role === "admin" ? "Admin" : "Kullanıcı"
                            }
                            color={user.role === "admin" ? "error" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? "Aktif" : "Pasif"}
                            color={user.isActive ? "success" : "error"}
                            size="small"
                            icon={
                              user.isActive ? (
                                <CheckCircleIcon />
                              ) : (
                                <BlockIcon />
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.lastLoginAt
                              ? formatDate(user.lastLoginAt)
                              : "Hiç giriş yapmamış"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color={user.isActive ? "error" : "success"}
                              onClick={() => handleToggleClick(user)}
                              disabled={user.role === "ADMIN"}
                              title={
                                user.role === "ADMIN"
                                  ? "Admin kullanıcısı engellenemez"
                                  : user.isActive
                                    ? "Kullanıcıyı engelle"
                                    : "Kullanıcıyı etkinleştir"
                              }
                            >
                              {user.isActive ? (
                                <BlockIcon />
                              ) : (
                                <CheckCircleIcon />
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          py={4}
                        >
                          {searchTerm
                            ? "Arama kriterinize uygun kullanıcı bulunamadı"
                            : "Henüz kullanıcı bulunmuyor"}
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

      {/* Onay Dialog'u */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, user: null })}
      >
        <DialogTitle>Kullanıcı Durumunu Değiştir</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.user && (
              <>
                <strong>{getDisplayName(confirmDialog.user)}</strong>{" "}
                kullanıcısını{" "}
                {confirmDialog.user.isActive ? "engellemek" : "etkinleştirmek"}{" "}
                istediğinizden emin misiniz?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, user: null })}>
            İptal
          </Button>
          <Button
            onClick={handleConfirmToggle}
            color={confirmDialog.user?.isActive ? "error" : "success"}
            variant="contained"
          >
            {confirmDialog.user?.isActive ? "Engelle" : "Etkinleştir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Başarı Mesajı */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;
