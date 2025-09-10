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
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleGoBack} sx={{ mr: 1 }} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              İlanlarım
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateAd}
              color="primary"
            >
              Yeni İlan
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadMyAds}
              disabled={loading}
            >
              Yenile
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
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
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
                        <Typography variant="body2">{ad.viewCount}</Typography>
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
