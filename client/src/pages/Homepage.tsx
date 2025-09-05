import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  TextField,
  MenuItem,
  Paper,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  LocalShipping,
  DirectionsBus,
  Build,
  Engineering,
} from "@mui/icons-material";
import { SEO } from "../components/common";
import apiClient from "../api/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

const Homepage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<Category[]>("/categories");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Kategoriler yüklenemedi");
        // Fallback to mock data
        setCategories([
          { id: "1", name: "Çekici", slug: "cekici", displayOrder: 1 },
          { id: "2", name: "Dorse", slug: "dorse", displayOrder: 2 },
          {
            id: "3",
            name: "Kamyon & Kamyonet",
            slug: "kamyon-kamyonet",
            displayOrder: 3,
          },
          {
            id: "4",
            name: "Karoser & Üst Yapı",
            slug: "karoser-ust-yapi",
            displayOrder: 4,
          },
          {
            id: "5",
            name: "Minibüs & Midibüs",
            slug: "minibus-midibus",
            displayOrder: 5,
          },
          { id: "6", name: "Otobüs", slug: "otobus", displayOrder: 6 },
          {
            id: "7",
            name: "Oto Kurtarıcı & Taşıyıcı",
            slug: "oto-kurtarici-tasiyici",
            displayOrder: 7,
          },
          { id: "8", name: "Römork", slug: "romork", displayOrder: 8 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "cekici":
      case "kamyon-kamyonet":
      case "romork":
        return <LocalShipping fontSize="large" />;
      case "minibus-midibus":
      case "otobus":
        return <DirectionsBus fontSize="large" />;
      case "karoser-ust-yapi":
        return <Build fontSize="large" />;
      case "oto-kurtarici-tasiyici":
        return <Engineering fontSize="large" />;
      default:
        return <LocalShipping fontSize="large" />;
    }
  };

  return (
    <>
      <SEO
        title="TrucksBus - Türkiye'nin En Büyük Ticari Araç Platformu"
        description="Kamyon, minibüs, otobüs ve ticari araç alım satımı için güvenli platform. Binlerce ilan, detaylı filtreler ve güvenli ödeme sistemi."
        keywords="kamyon, minibüs, otobüs, ticari araç, alım satım, ikinci el araç, fiyatları, galeri"
        url="https://trucksbus.com"
        type="website"
      />
      <Box>
        {/* Header */}
        <AppBar
          position="static"
          color="default"
          elevation={1}
          sx={{ bgcolor: "white" }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}
            >
              TrucksBus
            </Typography>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              sx={{ mr: 1, color: "text.primary" }}
            >
              Giriş Yap
            </Button>
            <Button variant="contained" component={RouterLink} to="/register">
              Kayıt Ol
            </Button>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 8,
            textAlign: "center",
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              Ticari Araç Alım Satım Platformu
            </Typography>
            <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
              Kamyon, otobüs, çekici ve diğer ticari araçlar için güvenilir
              marketplace
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              component={RouterLink}
              to="/register"
              sx={{ fontSize: "1.1rem", px: 4, py: 1.5 }}
            >
              Hemen Başla
            </Button>
          </Container>
        </Box>

        {/* Search Section */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              textAlign="center"
              sx={{ mb: 4 }}
            >
              Araç Ara
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 24%" } }}>
                <TextField
                  select
                  fullWidth
                  label="Kategori seçin"
                  defaultValue=""
                >
                  <MenuItem value="">Kategori seçin</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.slug} value={category.slug}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 24%" } }}>
                <TextField select fullWidth label="Marka seçin" defaultValue="">
                  <MenuItem value="">Marka seçin</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 24%" } }}>
                <TextField
                  fullWidth
                  label="Fiyat aralığı"
                  placeholder="Örn: 100000-500000"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₺</InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 24%" } }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Search />}
                  sx={{ py: 2 }}
                >
                  Ara
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>

        {/* Categories Section */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Kategoriler
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {categories.map((category) => (
                <Box
                  key={category.slug}
                  sx={{ flex: { xs: "1 1 45%", md: "1 1 23%" } }}
                >
                  <Card
                    component={RouterLink}
                    to={`/categories/${category.slug}`}
                    sx={{
                      textDecoration: "none",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      p: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", pb: 1 }}>
                      <Box sx={{ color: "primary.main", mb: 2 }}>
                        {getCategoryIcon(category.slug)}
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        color="text.primary"
                      >
                        {category.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Container>

        {/* Featured Ads Section */}
        <Box sx={{ bgcolor: "grey.100", py: 6 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              textAlign="center"
              sx={{ mb: 4 }}
            >
              Öne Çıkan İlanlar
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ flex: { xs: "1 1 100%", md: "1 1 30%" } }}>
                  <Card sx={{ height: "100%" }}>
                    <CardMedia
                      sx={{ height: 200, bgcolor: "grey.300" }}
                      title={`Örnek İlan ${i}`}
                    />
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        Örnek İlan {i}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        2020 Model • 150.000 km
                      </Typography>
                      <Typography
                        variant="h5"
                        color="primary.main"
                        fontWeight="bold"
                      >
                        ₺450.000
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: "grey.900", color: "white", py: 6 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 23%" } }}>
                <Typography variant="h6" gutterBottom>
                  TrucksBus
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Türkiye'nin en güvenilir ticari araç alım satım platformu
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 23%" } }}>
                <Typography variant="h6" gutterBottom>
                  Hızlı Linkler
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography
                    variant="body2"
                    component={RouterLink}
                    to="/about"
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      opacity: 0.8,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    Hakkımızda
                  </Typography>
                  <Typography
                    variant="body2"
                    component={RouterLink}
                    to="/contact"
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      opacity: 0.8,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    İletişim
                  </Typography>
                  <Typography
                    variant="body2"
                    component={RouterLink}
                    to="/help"
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      opacity: 0.8,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    Yardım
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 23%" } }}>
                <Typography variant="h6" gutterBottom>
                  Kategoriler
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {categories.slice(0, 4).map((category) => (
                    <Typography
                      key={category.slug}
                      variant="body2"
                      component={RouterLink}
                      to={`/categories/${category.slug}`}
                      sx={{
                        color: "inherit",
                        textDecoration: "none",
                        opacity: 0.8,
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      {category.name}
                    </Typography>
                  ))}
                </Box>
              </Box>
              <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 23%" } }}>
                <Typography variant="h6" gutterBottom>
                  Destek
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  E-posta: info@trucksbus.com
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Telefon: 0850 XXX XX XX
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                borderTop: 1,
                borderColor: "grey.700",
                mt: 4,
                pt: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                © 2024 TrucksBus. Tüm hakları saklıdır.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default Homepage;
