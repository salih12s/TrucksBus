import React, { useState } from "react";
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
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

interface SavedAd {
  id: number;
  title: string;
  price: string;
  location: string;
  year: number;
  km: string;
  fuel: string;
  brand: string;
  model: string;
  image: string;
  savedDate: string;
  isActive: boolean;
}

const Bookmarks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  const [savedAds] = useState<SavedAd[]>([
    {
      id: 1,
      title: "2019 Mercedes Sprinter 316 CDI",
      price: "850.000 TL",
      location: "İstanbul, Başakşehir",
      year: 2019,
      km: "125.000 km",
      fuel: "Dizel",
      brand: "Mercedes",
      model: "Sprinter",
      image: "/api/placeholder/300/200",
      savedDate: "2024-01-15",
      isActive: true,
    },
    {
      id: 2,
      title: "2020 Ford Transit Custom 320S",
      price: "720.000 TL",
      location: "Ankara, Çankaya",
      year: 2020,
      km: "95.000 km",
      fuel: "Dizel",
      brand: "Ford",
      model: "Transit",
      image: "/api/placeholder/300/200",
      savedDate: "2024-01-10",
      isActive: true,
    },
    {
      id: 3,
      title: "2018 Volkswagen Crafter 35",
      price: "680.000 TL",
      location: "İzmir, Bornova",
      year: 2018,
      km: "150.000 km",
      fuel: "Dizel",
      brand: "Volkswagen",
      model: "Crafter",
      image: "/api/placeholder/300/200",
      savedDate: "2024-01-05",
      isActive: false,
    },
    {
      id: 4,
      title: "2021 Mercedes Actros 1845",
      price: "1.250.000 TL",
      location: "Bursa, Osmangazi",
      year: 2021,
      km: "80.000 km",
      fuel: "Dizel",
      brand: "Mercedes",
      model: "Actros",
      image: "/api/placeholder/300/200",
      savedDate: "2023-12-28",
      isActive: true,
    },
  ]);

  const toggleBookmark = (adId: number) => {
    // TODO: API call to remove from bookmarks
    console.log("Removing from bookmarks:", adId);
  };

  const getFilteredAds = () => {
    let filtered = savedAds;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterBy === "active") {
      filtered = filtered.filter((ad) => ad.isActive);
    } else if (filterBy === "inactive") {
      filtered = filtered.filter((ad) => !ad.isActive);
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.savedDate).getTime() - new Date(b.savedDate).getTime()
      );
    } else if (sortBy === "price-high") {
      filtered.sort(
        (a, b) =>
          parseFloat(b.price.replace(/[^\d]/g, "")) -
          parseFloat(a.price.replace(/[^\d]/g, ""))
      );
    } else if (sortBy === "price-low") {
      filtered.sort(
        (a, b) =>
          parseFloat(a.price.replace(/[^\d]/g, "")) -
          parseFloat(b.price.replace(/[^\d]/g, ""))
      );
    }

    return filtered;
  };

  return (
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
          {getFilteredAds().length} kaydettiğiniz ilan bulundu
        </Typography>
      </Box>

      {/* Saved Ads Grid */}
      {getFilteredAds().length === 0 ? (
        <Alert severity="info">
          {searchQuery || filterBy !== "all"
            ? "Arama kriterlerinize uygun kaydettiğiniz ilan bulunamadı."
            : "Henüz kaydettiğiniz ilan bulunmuyor. İlanları görüntülerken ♡ ikonuna tıklayarak kaydedebilirsiniz."}
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 3,
          }}
        >
          {getFilteredAds().map((ad) => (
            <Card
              key={ad.id}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                opacity: ad.isActive ? 1 : 0.7,
              }}
            >
              {/* Status Badge */}
              {!ad.isActive && (
                <Chip
                  label="İlan Kaldırıldı"
                  color="error"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 1,
                  }}
                />
              )}

              {/* Bookmark Button */}
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
                onClick={() => toggleBookmark(ad.id)}
              >
                <BookmarkIcon color="primary" />
              </IconButton>

              {/* Image */}
              <CardMedia
                component="img"
                height="200"
                image={ad.image}
                alt={ad.title}
                sx={{ backgroundColor: "#f5f5f5" }}
              />

              {/* Content */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {ad.title}
                </Typography>

                <Typography
                  variant="h5"
                  color="primary"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  {ad.price}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, color: "#666", mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {ad.location}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  <Chip
                    label={ad.year.toString()}
                    size="small"
                    variant="outlined"
                  />
                  <Chip label={ad.km} size="small" variant="outlined" />
                  <Chip label={ad.fuel} size="small" variant="outlined" />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Kaydedilme:{" "}
                  {new Date(ad.savedDate).toLocaleDateString("tr-TR")}
                </Typography>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  disabled={!ad.isActive}
                >
                  İncele
                </Button>
                <Button
                  size="small"
                  startIcon={<PhoneIcon />}
                  disabled={!ad.isActive}
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
  );
};

export default Bookmarks;
