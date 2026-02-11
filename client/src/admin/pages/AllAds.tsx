import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Snackbar,
  CircularProgress,
  Pagination,
  Divider,
  Tabs,
  Tab,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  ViewList as ListIcon,
  GridView as GridIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import apiClient from "../../api/client";
import { getTokenFromStorage } from "../../utils/tokenUtils";

interface Ad {
  id: number;
  title: string;
  description?: string;
  status: string;
  price: number;
  currency?: string;
  year?: number;
  mileage?: number;
  createdAt: string;
  viewCount: number;
  customFields?: {
    dorseBrand?: string;
    sellerPhone?: string;
    phone?: string;
    condition?: string;
    fuelType?: string;
    transmission?: string;
    color?: string;
    [key: string]: unknown;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    phone?: string;
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
  images?: {
    id: number;
    imageUrl: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }[];
}

const AllAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAds, setTotalAds] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "TRY",
    year: "",
    mileage: "",
    status: "",
    editNote: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const token = getTokenFromStorage();
      if (!token) {
        setSnackbar({
          open: true,
          message: "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.",
          severity: "error",
        });
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page.toString());
      params.append("limit", "12");

      const response = await apiClient.get(`/ads/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data as {
        ads: Ad[];
        pagination: { pages: number; total: number };
      };
      setAds(data.ads);
      setTotalPages(data.pagination.pages);
      setTotalAds(data.pagination.total || data.ads.length);
    } catch (error) {
      console.error("İlanlar yüklenirken hata:", error);
      setSnackbar({
        open: true,
        message: "İlanlar yüklenirken hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchTerm, page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Delete handler
  const handleDeleteAd = async () => {
    if (!selectedAd) return;
    try {
      const token = getTokenFromStorage();
      await apiClient.delete(`/ads/admin/${selectedAd.id}/force-delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "İlan başarıyla silindi",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setSelectedAd(null);
      fetchAds();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "İlan silinirken hata oluştu",
        severity: "error",
      });
    }
  };

  // Edit handlers
  const handleOpenEditDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setEditForm({
      title: ad.title || "",
      description: ad.description || "",
      price: ad.price?.toString() || "",
      currency: ad.currency || "TRY",
      year: ad.year?.toString() || "",
      mileage: ad.mileage?.toString() || "",
      status: ad.status || "PENDING",
      editNote: "",
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedAd) return;
    setEditLoading(true);
    try {
      const token = getTokenFromStorage();
      await apiClient.put(
        `/ads/admin/${selectedAd.id}/update`,
        {
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          currency: editForm.currency,
          year: editForm.year,
          mileage: editForm.mileage,
          status: editForm.status,
          editNote: editForm.editNote,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSnackbar({
        open: true,
        message:
          "İlan başarıyla güncellendi ve kullanıcıya bildirim gönderildi",
        severity: "success",
      });
      setEditDialogOpen(false);
      setSelectedAd(null);
      fetchAds();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setSnackbar({
        open: true,
        message: err?.response?.data?.error || "Güncelleme başarısız",
        severity: "error",
      });
    }
    setEditLoading(false);
  };

  // Helpers
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <ApprovedIcon sx={{ color: "#4caf50", fontSize: 18 }} />;
      case "PENDING":
        return <PendingIcon sx={{ color: "#ff9800", fontSize: 18 }} />;
      case "REJECTED":
        return <RejectedIcon sx={{ color: "#f44336", fontSize: 18 }} />;
      default:
        return null;
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
        return "Onaylı";
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

  const formatPrice = (price: number, currency: string = "TRY") => {
    if (!price) return "-";
    const symbols: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };
    return `${symbols[currency] || "₺"}${price.toLocaleString("tr-TR")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getAdImage = (ad: Ad) => {
    if (ad.images && ad.images.length > 0) {
      const img = ad.images[0];
      return img.imageUrl || null;
    }
    return null;
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#313B4C" }}
          >
            📋 Tüm İlanlar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toplam {totalAds} ilan bulundu
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Tooltip title="Liste Görünümü">
            <IconButton
              onClick={() => setViewMode("list")}
              color={viewMode === "list" ? "primary" : "default"}
            >
              <ListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Kart Görünümü">
            <IconButton
              onClick={() => setViewMode("grid")}
              color={viewMode === "grid" ? "primary" : "default"}
            >
              <GridIcon />
            </IconButton>
          </Tooltip>
          <Button
            onClick={fetchAds}
            startIcon={<Refresh />}
            variant="outlined"
            size="small"
          >
            Yenile
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <FilterIcon sx={{ color: "#D34237" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Filtreler
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="İlan ID, başlık, satıcı ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 250, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              label="Durum"
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="APPROVED">✅ Onaylı</MenuItem>
              <MenuItem value="PENDING">⏳ Bekliyor</MenuItem>
              <MenuItem value="REJECTED">❌ Reddedildi</MenuItem>
              <MenuItem value="EXPIRED">⌛ Süresi Doldu</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
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
              <MenuItem value="1">🚛 Kamyon</MenuItem>
              <MenuItem value="2">🚚 Dorse</MenuItem>
              <MenuItem value="3">🚜 Çekici</MenuItem>
              <MenuItem value="4">🚌 Otobüs</MenuItem>
              <MenuItem value="5">🚐 Minibüs</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Stats Tabs */}
      <Tabs
        value={statusFilter}
        onChange={(_, v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          value="all"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              📊 Tümü
            </Box>
          }
        />
        <Tab
          value="APPROVED"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ApprovedIcon sx={{ color: "#4caf50", fontSize: 18 }} />
              Onaylı
            </Box>
          }
        />
        <Tab
          value="PENDING"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PendingIcon sx={{ color: "#ff9800", fontSize: 18 }} />
              Bekliyor
            </Box>
          }
        />
        <Tab
          value="REJECTED"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <RejectedIcon sx={{ color: "#f44336", fontSize: 18 }} />
              Reddedildi
            </Box>
          }
        />
      </Tabs>

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : ads.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Gösterilecek ilan bulunamadı
          </Typography>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {ads.map((ad) => (
            <Card
              key={ad.id}
              sx={{
                position: "relative",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {/* Status Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 10,
                }}
              >
                <Chip
                  icon={getStatusIcon(ad.status) || undefined}
                  label={getStatusText(ad.status)}
                  color={getStatusColor(ad.status)}
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Box>

              {/* ID Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  color: "white",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                #{ad.id}
              </Box>

              {/* Image */}
              <Box
                sx={{
                  height: 140,
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {getAdImage(ad) ? (
                  <img
                    src={getAdImage(ad)!}
                    alt={ad.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <CarIcon sx={{ fontSize: 48, color: "#ccc" }} />
                )}
              </Box>

              <CardContent sx={{ p: 1.5 }}>
                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "13px",
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={ad.title}
                >
                  {ad.title}
                </Typography>

                {/* Category & Brand */}
                <Typography sx={{ fontSize: "11px", color: "#666", mb: 0.5 }}>
                  {ad.category?.name} |{" "}
                  {ad.brand?.name || ad.customFields?.dorseBrand || "-"}
                </Typography>

                {/* Price */}
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#D34237",
                    mb: 1,
                  }}
                >
                  {formatPrice(ad.price, ad.currency)}
                </Typography>

                {/* Info Row */}
                <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                  {ad.year && (
                    <Chip
                      icon={
                        <CalendarIcon sx={{ fontSize: "12px !important" }} />
                      }
                      label={ad.year}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: "10px" }}
                    />
                  )}
                  {ad.mileage && (
                    <Chip
                      icon={<SpeedIcon sx={{ fontSize: "12px !important" }} />}
                      label={`${(ad.mileage / 1000).toFixed(0)}k km`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: "10px" }}
                    />
                  )}
                </Box>

                {/* Location */}
                {(ad.city || ad.district) && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 14, color: "#999" }} />
                    <Typography sx={{ fontSize: "11px", color: "#666" }}>
                      {ad.city?.name}
                      {ad.district ? `, ${ad.district.name}` : ""}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                {/* User Info */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: 11,
                      bgcolor: "#1976d2",
                    }}
                  >
                    {ad.user.firstName?.[0] || "?"}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ad.user.companyName ||
                        `${ad.user.firstName} ${ad.user.lastName}`}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", color: "#999" }}>
                      {formatDate(ad.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Contact */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <Tooltip title={`E-posta: ${ad.user.email}`}>
                    <Chip
                      icon={<EmailIcon sx={{ fontSize: "12px !important" }} />}
                      label={
                        ad.user.email.length > 18
                          ? ad.user.email.substring(0, 18) + "..."
                          : ad.user.email
                      }
                      size="small"
                      sx={{ height: 20, fontSize: "9px", cursor: "pointer" }}
                      onClick={() => window.open(`mailto:${ad.user.email}`)}
                    />
                  </Tooltip>
                  {(ad.customFields?.sellerPhone || ad.customFields?.phone) && (
                    <Tooltip
                      title={
                        (ad.customFields?.sellerPhone ||
                          ad.customFields?.phone) as string
                      }
                    >
                      <Chip
                        icon={
                          <PhoneIcon sx={{ fontSize: "12px !important" }} />
                        }
                        label="Telefon"
                        size="small"
                        sx={{ height: 20, fontSize: "9px" }}
                      />
                    </Tooltip>
                  )}
                </Box>

                {/* Actions */}
                <Box
                  sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}
                >
                  <Tooltip title="İlanı Görüntüle">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => window.open(`/ad/${ad.id}`, "_blank")}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Düzenle">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleOpenEditDialog(ad)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedAd(ad);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        /* List View */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {ads.map((ad) => (
            <Card
              key={ad.id}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1.5,
                gap: 2,
                transition: "all 0.2s",
                "&:hover": { backgroundColor: "#fafafa" },
              }}
            >
              {/* Image */}
              <Box
                sx={{
                  width: 80,
                  height: 60,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {getAdImage(ad) ? (
                  <img
                    src={getAdImage(ad)!}
                    alt={ad.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <CarIcon sx={{ fontSize: 32, color: "#ccc" }} />
                )}
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Chip
                    label={`#${ad.id}`}
                    size="small"
                    sx={{ height: 18, fontSize: "10px" }}
                  />
                  <Chip
                    icon={getStatusIcon(ad.status) || undefined}
                    label={getStatusText(ad.status)}
                    color={getStatusColor(ad.status)}
                    size="small"
                    sx={{ height: 20, fontSize: "10px" }}
                  />
                </Box>
                <Typography
                  sx={{ fontWeight: "bold", fontSize: "13px" }}
                  noWrap
                >
                  {ad.title}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#666" }}>
                  {ad.category?.name} | {ad.brand?.name || "-"} |{" "}
                  {ad.city?.name || "-"}
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ textAlign: "right", minWidth: 100 }}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#D34237",
                    fontSize: "14px",
                  }}
                >
                  {formatPrice(ad.price, ad.currency)}
                </Typography>
                <Typography sx={{ fontSize: "10px", color: "#999" }}>
                  {formatDate(ad.createdAt)}
                </Typography>
              </Box>

              {/* User */}
              <Box sx={{ textAlign: "center", minWidth: 140 }}>
                <Typography
                  sx={{ fontSize: "11px", fontWeight: "bold" }}
                  noWrap
                >
                  {ad.user.companyName ||
                    `${ad.user.firstName} ${ad.user.lastName}`}
                </Typography>
                <Typography sx={{ fontSize: "10px", color: "#1976d2", cursor: "pointer" }} noWrap
                  onClick={() => window.open(`mailto:${ad.user.email}`)}
                  title={ad.user.email}
                >
                  {ad.user.email}
                </Typography>
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Tooltip title="Görüntüle">
                  <IconButton
                    size="small"
                    onClick={() => window.open(`/ad/${ad.id}`, "_blank")}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Düzenle">
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() => handleOpenEditDialog(ad)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sil">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedAd(ad);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon color="primary" />
            <Typography variant="h6">
              İlan Düzenle - #{selectedAd?.id}
            </Typography>
          </Box>
          <IconButton onClick={() => setEditDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            Yaptığınız değişiklikler kaydedildiğinde ilan sahibine otomatik
            bildirim gönderilecektir.
          </Alert>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={editForm.title}
              onChange={(e) => handleEditFormChange("title", e.target.value)}
              size="small"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Durum</InputLabel>
              <Select
                value={editForm.status}
                onChange={(e) => handleEditFormChange("status", e.target.value)}
                label="Durum"
              >
                <MenuItem value="PENDING">⏳ Bekliyor</MenuItem>
                <MenuItem value="APPROVED">✅ Onaylandı</MenuItem>
                <MenuItem value="REJECTED">❌ Reddedildi</MenuItem>
                <MenuItem value="EXPIRED">⌛ Süresi Doldu</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Fiyat"
              type="number"
              value={editForm.price}
              onChange={(e) => handleEditFormChange("price", e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₺</InputAdornment>
                ),
              }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Para Birimi</InputLabel>
              <Select
                value={editForm.currency}
                onChange={(e) =>
                  handleEditFormChange("currency", e.target.value)
                }
                label="Para Birimi"
              >
                <MenuItem value="TRY">₺ TL</MenuItem>
                <MenuItem value="USD">$ USD</MenuItem>
                <MenuItem value="EUR">€ EUR</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Model Yılı"
              type="number"
              value={editForm.year}
              onChange={(e) => handleEditFormChange("year", e.target.value)}
              size="small"
            />
            <TextField
              fullWidth
              label="Kilometre"
              type="number"
              value={editForm.mileage}
              onChange={(e) => handleEditFormChange("mileage", e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">km</InputAdornment>
                ),
              }}
            />
            <Box sx={{ gridColumn: { md: "1 / -1" } }}>
              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  handleEditFormChange("description", e.target.value)
                }
                size="small"
              />
            </Box>
            <Box sx={{ gridColumn: { md: "1 / -1" } }}>
              <TextField
                fullWidth
                label="Düzenleme Notu (kullanıcıya gösterilecek)"
                placeholder="Örn: Fiyat güncellendi, eksik bilgiler tamamlandı..."
                value={editForm.editNote}
                onChange={(e) =>
                  handleEditFormChange("editNote", e.target.value)
                }
                size="small"
                helperText="Bu not, kullanıcıya gönderilecek bildirimde görünecektir"
              />
            </Box>
          </Box>

          {/* Current Ad Info */}
          {selectedAd && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                İlan Sahibi Bilgileri
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 16, color: "#666" }} />
                  <Typography variant="body2">
                    {selectedAd.user.companyName ||
                      `${selectedAd.user.firstName} ${selectedAd.user.lastName}`}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EmailIcon sx={{ fontSize: 16, color: "#666" }} />
                  <Typography variant="body2">
                    {selectedAd.user.email}
                  </Typography>
                </Box>
                {(selectedAd.customFields?.sellerPhone ||
                  selectedAd.customFields?.phone) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: "#666" }} />
                    <Typography variant="body2">
                      {
                        (selectedAd.customFields?.sellerPhone ||
                          selectedAd.customFields?.phone) as string
                      }
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={
              editLoading ? <CircularProgress size={16} /> : <SaveIcon />
            }
            disabled={editLoading}
            sx={{
              backgroundColor: "#D34237",
              "&:hover": { backgroundColor: "#b5352c" },
            }}
          >
            {editLoading ? "Kaydediliyor..." : "Kaydet ve Bildirim Gönder"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "#d32f2f" }}>⚠️ İlanı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>
              #{selectedAd?.id} - {selectedAd?.title}
            </strong>{" "}
            ilanını kalıcı olarak silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Bu işlem geri alınamaz ve tüm ilan verileri kaybolacaktır.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteAd} color="error" variant="contained">
            Kalıcı Olarak Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllAds;
