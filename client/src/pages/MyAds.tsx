import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
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
  Tooltip,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getMyAds, deleteAd, type Ad, type AdImage } from "../api/ads";

const MyAds: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const loadMyAds = async () => {
    try {
      setLoading(true);
      const result = await getMyAds();
      setAds(result.ads);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "İlanlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyAds();
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
      case "ACTIVE":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      case "EXPIRED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Yayında";
      case "PENDING":
        return "Onay Bekliyor";
      case "REJECTED":
        return "Reddedildi";
      case "EXPIRED":
        return "Süresi Doldu";
      default:
        return status;
    }
  };

  const handleViewAd = (ad: Ad) => {
    setSelectedAd(ad);
  };

  const handleEditAd = (adId: number) => {
    navigate(`/edit-ad/${adId}`);
  };

  const handleDeleteAd = async (adId: number) => {
    if (window.confirm("Bu ilanı silmek istediğinizden emin misiniz?")) {
      try {
        await deleteAd(adId.toString());
        setAds(ads.filter((ad) => ad.id !== adId));
        setSnackbar({
          open: true,
          message: "İlan başarıyla silindi",
          severity: "success",
        });
      } catch {
        setSnackbar({
          open: true,
          message: "İlan silinirken bir hata oluştu",
          severity: "error",
        });
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedAd(null);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCreateAd = () => {
    navigate("/create-ad");
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return "Fiyat belirtilmemiş";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (images: AdImage[]) => {
    if (!images || images.length === 0) {
      return "/placeholder-image.jpg"; // Varsayılan resim
    }
    return images[0].imageUrl;
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
    <Box>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 0 },
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleGoBack} sx={{ mr: 1 }} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
            >
              İlanlarım
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "stretch", md: "flex-end" },
            }}
          >
            <Button
              variant="contained"
              startIcon={!isMobile ? <AddIcon /> : undefined}
              onClick={handleCreateAd}
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{ flex: { xs: 1, md: "none" } }}
            >
              {isMobile ? "Yeni" : "Yeni İlan"}
            </Button>
            <Button
              variant="outlined"
              startIcon={!isMobile ? <RefreshIcon /> : undefined}
              onClick={loadMyAds}
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{ flex: { xs: 1, md: "none" } }}
            >
              {isMobile ? "Yenile" : "Yenile"}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            {/* Desktop Table View */}
            {!isMobile ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>İlan</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>Fiyat</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Görüntüleme</TableCell>
                      <TableCell>İletişim</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ads.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <img
                              src={getImageUrl(ad.images)}
                              alt={ad.title}
                              style={{
                                width: 60,
                                height: 40,
                                objectFit: "cover",
                                borderRadius: 4,
                              }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {ad.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {ad.location}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ad.category.name}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatPrice(ad.price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(ad.status)}
                            size="small"
                            color={getStatusColor(ad.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {ad.viewCount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">-</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title="Görüntüle">
                              <IconButton
                                size="small"
                                onClick={() => handleViewAd(ad)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Düzenle">
                              <IconButton
                                size="small"
                                onClick={() => handleEditAd(ad.id)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteAd(ad.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* Mobile Card View */
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {ads.map((ad) => (
                  <Card
                    key={ad.id}
                    variant="outlined"
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Image and Title */}
                      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <img
                          src={getImageUrl(ad.images)}
                          alt={ad.title}
                          style={{
                            width: 80,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 8,
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              lineHeight: 1.2,
                              mb: 0.5,
                            }}
                          >
                            {ad.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ad.location}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Info Grid */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Kategori
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={ad.category.name}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Fiyat
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ mt: 0.5 }}
                          >
                            {formatPrice(ad.price)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Durum
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={getStatusLabel(ad.status)}
                              size="small"
                              color={getStatusColor(ad.status)}
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Görüntüleme
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {ad.viewCount}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Date and Actions */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pt: 1,
                          borderTop: "1px solid #f0f0f0",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewAd(ad)}
                            sx={{ color: "#666" }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditAd(ad.id)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAd(ad.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {ads.length === 0 && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Henüz ilanınız bulunmuyor.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateAd}
                  sx={{ mt: 2 }}
                >
                  İlk İlanınızı Oluşturun
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* İlan Detayı Modal'ı */}
        <Dialog
          open={!!selectedAd}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
        >
          {selectedAd && (
            <>
              <DialogTitle
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">İlan Detayı</Typography>
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <img
                      src={getImageUrl(selectedAd.images)}
                      alt={selectedAd.title}
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {selectedAd.title}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {formatPrice(selectedAd.price)}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={getStatusLabel(selectedAd.status)}
                        color={getStatusColor(selectedAd.status)}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={selectedAd.category.name}
                        variant="outlined"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      📍 {selectedAd.location}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      👁️ {selectedAd.viewCount} görüntüleme
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📞 İletişim bilgisi mevcut değil
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  <strong>Açıklama:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedAd.description}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Oluşturulma:{" "}
                  {new Date(selectedAd.createdAt).toLocaleString("tr-TR")}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseModal}>Kapat</Button>
                <Button
                  variant="contained"
                  onClick={() => handleEditAd(selectedAd.id)}
                >
                  Düzenle
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default MyAds;
