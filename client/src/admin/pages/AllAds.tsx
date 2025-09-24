import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import apiClient from "../../api/client";
import { getTokenFromStorage } from "../../utils/tokenUtils";

interface Ad {
  id: number;
  title: string;
  status: string;
  price: number;
  createdAt: string;
  viewCount: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
  };
  category: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  model?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
}

const AllAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const token = getTokenFromStorage();
      if (!token) {
        console.error("Authentication required");
        setAlert({
          type: "error",
          message: "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.",
        });
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await apiClient.get(`/ads/admin/all?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data as {
        ads: Ad[];
        pagination: { pages: number };
      };
      setAds(data.ads);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("İlanlar yüklenirken hata:", error);
      setAlert({ type: "error", message: "İlanlar yüklenirken hata oluştu" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchTerm, page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleDeleteAd = async () => {
    if (!selectedAdId) return;

    try {
      const token = getTokenFromStorage();
      if (!token) {
        console.error("Authentication required");
        setAlert({
          type: "error",
          message: "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.",
        });
        return;
      }

      await apiClient.delete(`/ads/admin/${selectedAdId}/force-delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlert({ type: "success", message: "İlan başarıyla silindi" });
      setDeleteDialogOpen(false);
      setSelectedAdId(null);
      fetchAds();
    } catch (error) {
      console.error("İlan silinirken hata:", error);
      setAlert({ type: "error", message: "İlan silinirken hata oluştu" });
    }
  };

  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Onaylandı";
      case "PENDING":
        return "Bekliyor";
      case "REJECTED":
        return "Reddedildi";
      case "EXPIRED":
        return "Süresi Doldu";
      default:
        return status;
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusChange = (event: { target: { value: string } }) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Tüm İlanlar
        </Typography>
        <Button onClick={fetchAds} startIcon={<Refresh />} variant="outlined">
          Yenile
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FilterIcon sx={{ mr: 1 }} />
          Filtreler
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="İlan ara..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              label="Durum"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="APPROVED">Onaylandı</MenuItem>
              <MenuItem value="PENDING">Bekliyor</MenuItem>
              <MenuItem value="REJECTED">Reddedildi</MenuItem>
              <MenuItem value="EXPIRED">Süresi Doldu</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              label="Kategori"
            >
              <MenuItem value="all">Tümü</MenuItem>
              {/* Bu liste dinamik olarak kategori API'sinden gelebilir */}
              <MenuItem value="1">Kamyon</MenuItem>
              <MenuItem value="2">Dorse</MenuItem>
              <MenuItem value="3">Çekici</MenuItem>
              <MenuItem value="4">Otobüs</MenuItem>
              <MenuItem value="5">Minibüs</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Alert */}
      {alert && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert(null)}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Ads Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>İlan Başlığı</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Marka/Model</TableCell>
                <TableCell>Satıcı</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Fiyat</TableCell>
                <TableCell>Görüntüleme</TableCell>
                <TableCell>Konum</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      İlan bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow key={ad.id} hover>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                          noWrap
                        >
                          {ad.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {ad.id}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {ad.category.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {ad.brand?.name || "-"}
                        {ad.model?.name && ` / ${ad.model.name}`}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {ad.user.companyName ||
                            `${ad.user.firstName} ${ad.user.lastName}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ad.user.email}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusText(ad.status)}
                        color={getStatusColor(ad.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {ad.price
                          ? `₺${ad.price.toLocaleString()}`
                          : "Belirtilmemiş"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {ad.viewCount || 0} görüntüleme
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {ad.city?.name || "-"}
                        {ad.district?.name && ` / ${ad.district.name}`}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption">
                        {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => window.open(`/ad/${ad.id}`, "_blank")}
                          title="İlanı görüntüle"
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAdId(ad.id);
                            setDeleteDialogOpen(true);
                          }}
                          title="İlanı sil"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>İlanı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem
            geri alınamaz ve tüm veriler kaybolacaktır.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteAd} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllAds;
