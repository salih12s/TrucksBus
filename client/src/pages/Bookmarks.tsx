import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAppSelector } from "../hooks/redux";
import apiClient from "../api/client";
import { Header } from "../components/layout";

interface FavoriteAd {
  id: number;
  createdAt: string;
  ad: {
    id: number;
    title: string;
    price: number | null;
    year: number | null;
    mileage: number | null;
    createdAt: string;
    city?: {
      id: number;
      name: string;
    };
    district?: {
      id: number;
      name: string;
    };
    images?: Array<{
      id: number;
      imageUrl: string;
      isPrimary: boolean;
      displayOrder: number;
      altText?: string;
    }>;
    user: {
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
    };
    category?: {
      name: string;
    };
    brand?: {
      name: string;
    };
    model?: {
      name: string;
    };
    status: string;
  };
}

const Bookmarks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [favorites, setFavorites] = useState<FavoriteAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);

  // API Base URL'i al
  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://trucksbus-production.up.railway.app/api";

  const getImageUrl = (images?: FavoriteAd["ad"]["images"]) => {
    if (!images || images.length === 0) return null;

    // Önce vitrin resmini ara
    const primaryImage = images.find((img) => img.isPrimary);
    const imageToUse = primaryImage || images[0];

    if (imageToUse?.imageUrl) {
      const baseUrl = API_BASE_URL.replace("/api", "");
      return `${baseUrl}${imageToUse.imageUrl}`;
    }
    return null;
  };

  // Fiyat formatlama fonksiyonu
  const formatPrice = (price: number | null) => {
    if (!price) return "Belirtilmemiş";
    return price.toLocaleString("tr-TR") + " TL";
  };

  // Telefon formatlama fonksiyonu
  const formatPhone = (phone: string | null) => {
    if (!phone) return "Belirtilmemiş";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(
        7,
        9
      )} ${digits.slice(9, 11)}`;
    }
    return phone;
  };

  // Şehir/İlçe formatlama fonksiyonu
  const formatLocation = (
    city?: { name: string },
    district?: { name: string }
  ) => {
    if (!city && !district) return "Belirtilmemiş";
    if (city && district) return `${city.name} / ${district.name}`;
    if (city) return city.name;
    if (district) return district.name;
    return "Belirtilmemiş";
  };

  // Favorileri yükle
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setError("Favorileri görüntülemek için giriş yapmalısınız");
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/favorites");
        setFavorites(response.data as FavoriteAd[]);
        setError(null);
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        setError(
          axiosError.response?.data?.error ||
            "Favoriler yüklenirken hata oluştu"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Favoriden kaldır
  const handleRemoveFavorite = async (favoriteId: number, adId: number) => {
    try {
      await apiClient.delete(`/favorites/${adId}`);
      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(
        axiosError.response?.data?.error ||
          "Favorilerden kaldırılırken hata oluştu"
      );
    }
  };

  // Filtreleme ve sıralama
  const getFilteredFavorites = () => {
    let filtered = favorites;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (fav) =>
          fav.ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fav.ad.brand?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          fav.ad.model?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterBy === "active") {
      filtered = filtered.filter((fav) => fav.ad.status === "APPROVED");
    } else if (filterBy === "inactive") {
      filtered = filtered.filter((fav) => fav.ad.status !== "APPROVED");
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.ad.price || 0) - (a.ad.price || 0));
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.ad.price || 0) - (b.ad.price || 0));
    }

    return filtered;
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#313B4C" }}>
            Kaydettiğim İlanlar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Beğendiğiniz ve kaydettiğiniz ilanları buradan takip edebilirsiniz
          </Typography>
        </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
            <TextField
              fullWidth
              placeholder="İlan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ flex: "0 1 200px", minWidth: "150px" }}>
            <FormControl fullWidth>
              <InputLabel>Sırala</InputLabel>
              <Select
                value={sortBy}
                label="Sırala"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">En Yeni</MenuItem>
                <MenuItem value="oldest">En Eski</MenuItem>
                <MenuItem value="price-high">Fiyat (Yüksek-Düşük)</MenuItem>
                <MenuItem value="price-low">Fiyat (Düşük-Yüksek)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: "0 1 200px", minWidth: "150px" }}>
            <FormControl fullWidth>
              <InputLabel>Filtrele</InputLabel>
              <Select
                value={filterBy}
                label="Filtrele"
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="active">Aktif İlanlar</MenuItem>
                <MenuItem value="inactive">Pasif İlanlar</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: "0 1 120px" }}>
            <Button fullWidth variant="outlined" startIcon={<FilterIcon />}>
              Filtrele
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {getFilteredFavorites().length} kaydettiğiniz ilan bulundu
        </Typography>
      </Box>

      {/* Saved Ads Grid */}
      {getFilteredFavorites().length === 0 ? (
        <Alert severity="info">
          {searchQuery || filterBy !== "all"
            ? "Arama kriterlerinize uygun kaydettiğiniz ilan bulunamadı."
            : "Henüz kaydettiğiniz ilan bulunmuyor. İlanları görüntülerken Kaydet butonuna tıklayarak kaydedebilirsiniz."}
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 3,
          }}
        >
          {getFilteredFavorites().map((favorite) => (
            <Card
              key={favorite.id}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                opacity: favorite.ad.status === "APPROVED" ? 1 : 0.7,
              }}
            >
              {/* Status Badge */}
              {favorite.ad.status !== "APPROVED" && (
                <Chip
                  label="İlan Onaylanmamış"
                  color="warning"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 1,
                  }}
                />
              )}

              {/* Remove from Favorites Button */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                  },
                }}
                onClick={() =>
                  handleRemoveFavorite(favorite.id, favorite.ad.id)
                }
              >
                <DeleteIcon color="error" />
              </IconButton>

              {/* Image */}
              <CardMedia
                component="img"
                height="200"
                image={
                  getImageUrl(favorite.ad.images) || "/api/placeholder/300/200"
                }
                alt={favorite.ad.title}
                sx={{ backgroundColor: "#f5f5f5" }}
              />

              {/* Content */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {favorite.ad.title}
                </Typography>

                <Typography
                  variant="h5"
                  color="primary"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  {formatPrice(favorite.ad.price)}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, color: "#666", mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatLocation(favorite.ad.city, favorite.ad.district)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  {favorite.ad.year && (
                    <Chip
                      label={favorite.ad.year.toString()}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {favorite.ad.mileage && (
                    <Chip
                      label={`${favorite.ad.mileage.toLocaleString(
                        "tr-TR"
                      )} km`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {favorite.ad.brand?.name && (
                    <Chip
                      label={favorite.ad.brand.name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {favorite.ad.model?.name && (
                    <Chip
                      label={favorite.ad.model.name}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Kaydedilme:{" "}
                  {new Date(favorite.createdAt).toLocaleDateString("tr-TR")}
                </Typography>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  disabled={favorite.ad.status !== "APPROVED"}
                >
                  İncele
                </Button>
                <Button
                  size="small"
                  startIcon={<PhoneIcon />}
                  disabled={favorite.ad.status !== "APPROVED"}
                  title={formatPhone(favorite.ad.user.phone)}
                >
                  Ara
                </Button>
                <Button size="small" startIcon={<ShareIcon />}>
                  Paylaş
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
    </>
  );
};

export default Bookmarks;
