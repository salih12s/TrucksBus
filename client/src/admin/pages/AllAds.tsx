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
  currency?: string;
  createdAt: string;
  viewCount: number;
  customFields?: {
    dorseBrand?: string;
    sellerPhone?: string;
    phone?: string;
    [key: string]: unknown;
  };
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
    status: string,
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "1.5rem", md: "2.125rem" },
          }}
        >
          Tüm İlanlar
        </Typography>
        <Button
          onClick={fetchAds}
          startIcon={<Refresh />}
          variant="outlined"
          size="small"
        >
          Yenile
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            fontSize: { xs: "1rem", md: "1.25rem" },
          }}
        >
          <FilterIcon sx={{ mr: 1 }} />
          Filtreler
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            placeholder="İlan ara..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 200 },
              flex: { xs: "1 1 100%", sm: "0 1 auto" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
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

          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
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
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "40px",
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "150px",
                  }}
                >
                  İlan
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "80px",
                  }}
                >
                  Kategori
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "100px",
                  }}
                >
                  Marka
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "120px",
                  }}
                >
                  Satıcı
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "130px",
                  }}
                >
                  İletişim
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "70px",
                  }}
                >
                  Durum
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "70px",
                  }}
                >
                  Fiyat
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "40px",
                  }}
                >
                  Gör.
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "80px",
                  }}
                >
                  Konum
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "60px",
                  }}
                >
                  Tarih
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    p: 0.5,
                    width: "70px",
                  }}
                >
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 2 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      İlan bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow
                    key={ad.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                      >
                        #{ad.id}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "medium",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                          fontSize: "0.7rem",
                        }}
                        title={ad.title}
                      >
                        {ad.title}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.65rem" }}
                      >
                        {ad.category.name}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", fontSize: "0.65rem" }}
                        >
                          {ad.brand?.name || ad.customFields?.dorseBrand || "-"}
                        </Typography>
                        {ad.model?.name && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.6rem" }}
                          >
                            {ad.model.name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "medium",
                          display: "block",
                          fontSize: "0.65rem",
                        }}
                      >
                        {ad.user.companyName ||
                          `${ad.user.firstName} ${ad.user.lastName}`}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        ID: {ad.user.id}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontSize: "0.65rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={ad.user.email}
                      >
                        {ad.user.email}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        {ad.customFields?.sellerPhone ||
                          ad.customFields?.phone ||
                          "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Chip
                        label={getStatusText(ad.status)}
                        color={getStatusColor(ad.status)}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.6rem",
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "medium", fontSize: "0.65rem" }}
                      >
                        {ad.price ? `₺${(ad.price / 1000).toFixed(0)}k` : "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.65rem" }}
                      >
                        {ad.viewCount || 0}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", fontSize: "0.65rem" }}
                      >
                        {ad.city?.name || "-"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.6rem" }}
                      >
                        {ad.district?.name || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.65rem" }}
                      >
                        {new Date(ad.createdAt).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }}>
                      <Box sx={{ display: "flex", gap: 0.25 }}>
                        <IconButton
                          size="small"
                          onClick={() => window.open(`/ad/${ad.id}`, "_blank")}
                          title="İlanı görüntüle"
                          color="primary"
                          sx={{ p: 0.25 }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAdId(ad.id);
                            setDeleteDialogOpen(true);
                          }}
                          title="İlanı sil"
                          color="error"
                          sx={{ p: 0.25 }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
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
