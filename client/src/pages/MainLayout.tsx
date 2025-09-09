import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  CardMedia,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  LocalShipping,
  DirectionsBus,
  Build,
  Engineering,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Report,
} from "@mui/icons-material";
import { Header, Footer } from "../components/layout";
import { useAppSelector } from "../hooks/redux";
import apiClient from "../api/client";
import ComplaintModal from "../components/complaints/ComplaintModal";

interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

interface Ad {
  id: number;
  title: string;
  price: number | null;
  year: number | null;
  createdAt: string;
  city?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
  photos?: string[];
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
  mileage?: number | null;
  location?: string;
}

interface ApiAdsResponse {
  ads: Ad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [savingAdId, setSavingAdId] = useState<number | null>(null);
  const [savedAds, setSavedAds] = useState<Set<number>>(new Set());
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedAdForComplaint, setSelectedAdForComplaint] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // Mobile'da sidebar varsayılan olarak kapalı
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const getImageUrl = (images?: Ad["images"]) => {
    if (!images || images.length === 0) return null;

    // Önce vitrin resmini ara
    const primaryImage = images.find((img) => img.isPrimary);
    const imageToUse = primaryImage || images[0];

    // Artık imageUrl doğrudan base64 formatında geliyor
    return imageToUse?.imageUrl || null;
  };

  // Fiyat formatlama fonksiyonu
  const formatPrice = (price: number | null) => {
    if (!price) return "Belirtilmemiş";
    return price.toLocaleString("tr-TR");
  };

  // Telefon formatlama fonksiyonu
  const formatPhone = (phone: string | null) => {
    if (!phone) return "Belirtilmemiş";
    // Sadece rakamları al
    const digits = phone.replace(/\D/g, "");
    // 0545 585 55 55 formatına çevir
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

  // Favorites fonksiyonları
  const handleAddToFavorites = async (adId: number) => {
    if (!user) {
      setSnackbarMessage("Favorilere eklemek için giriş yapmalısınız");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Zaten kaydedilmişse tekrar kaydetme
    if (savedAds.has(adId)) {
      setSnackbarMessage("Bu ilan zaten favorilerinizde");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSavingAdId(adId);
    try {
      await apiClient.post("/favorites", { adId });
      setSavedAds((prev) => new Set([...prev, adId]));
      setFavoritesCount((prev) => prev + 1);
      setSnackbarMessage("İlan favorilere eklendi");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message =
        axiosError.response?.data?.error || "Favorilere eklenirken hata oluştu";
      setSnackbarMessage(message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSavingAdId(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleComplaint = (ad: Ad) => {
    setSelectedAdForComplaint({
      id: ad.id,
      title: ad.title || "İlan",
    });
    setComplaintModalOpen(true);
  };

  const handleCloseComplaintModal = () => {
    setComplaintModalOpen(false);
    setSelectedAdForComplaint(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, adsRes] = await Promise.all([
          apiClient.get("/categories"),
          apiClient.get("/ads?status=APPROVED"), // Sadece onaylanmış ilanları çek
        ]);

        // Güvenli veri kontrolü
        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

        // Backend response format: { ads: [], pagination: {} }
        const adsResponse = adsRes.data as ApiAdsResponse;
        const adsData = adsResponse?.ads
          ? Array.isArray(adsResponse.ads)
            ? adsResponse.ads
            : []
          : Array.isArray(adsRes.data)
          ? adsRes.data
          : [];

        setCategories(categoriesData as Category[]);
        setAds(adsData as Ad[]);

        // Debug: Check if images are coming from API
        console.log("Ads data:", adsData);
        if (adsData.length > 0) {
          console.log("First ad images:", adsData[0].images);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
        // Fallback data sadece kategoriler için
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

        // İlanlar için boş array
        setAds([]);
      }
    };

    fetchData();
  }, []);

  // Favorites count'u yükle
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (!user) {
        setFavoritesCount(0);
        return;
      }

      try {
        const response = await apiClient.get("/favorites");
        const favorites = response.data as Array<{ ad: { id: number } }>;
        setFavoritesCount(favorites.length);

        // Mevcut kaydedilmiş ilanları da set et
        const savedAdIds = new Set(favorites.map((fav) => fav.ad.id));
        setSavedAds(savedAdIds);
      } catch (error) {
        console.error("Error fetching favorites count:", error);
        setFavoritesCount(0);
      }
    };

    fetchFavoritesCount();
  }, [user]);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "cekici":
      case "kamyon-kamyonet":
        return <LocalShipping />;
      case "minibus-midibus":
      case "otobus":
        return <DirectionsBus />;
      case "dorse":
        return <Build />;
      default:
        return <Engineering />;
    }
  };

  const renderSidebarContent = () => (
    <Box sx={{ p: sidebarOpen || isMobile ? 3 : 1, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: sidebarOpen || isMobile ? 3 : 2,
          pb: sidebarOpen || isMobile ? 2 : 1,
          borderBottom:
            sidebarOpen || isMobile ? "2px solid #D34237" : "1px solid #e0e0e0",
        }}
      >
        {sidebarOpen || isMobile ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MenuIcon sx={{ color: "#D34237", mr: 1 }} />
              <Typography
                variant="h6"
                sx={{
                  color: "#313B4C",
                  fontWeight: "bold",
                  fontSize: "1.3rem",
                }}
              >
                Kategoriler
              </Typography>
            </Box>
            <IconButton
              onClick={() =>
                isMobile ? setMobileDrawerOpen(false) : setSidebarOpen(false)
              }
              size="small"
              sx={{
                color: "#666",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  color: "#D34237",
                  transform: "scale(1.1)",
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={() => setSidebarOpen(true)}
            size="small"
            sx={{
              color: "#666",
              margin: "0 auto",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#f5f5f5",
                color: "#D34237",
                transform: "scale(1.1)",
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        )}
      </Box>

      {/* Categories List - Always visible */}
      <List sx={{ p: 0 }}>
        {categories.map((category) => (
          <ListItem
            key={category.id}
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              mb: 1,
              p: sidebarOpen || isMobile ? 2 : 1,
              border: "1px solid transparent",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              justifyContent: sidebarOpen || isMobile ? "flex-start" : "center",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(211,66,55,0.1), transparent)",
                transition: "left 0.5s ease",
              },
              "&:hover": {
                backgroundColor: "#fff5f5",
                borderColor: "#D34237",
                transform:
                  sidebarOpen || isMobile ? "translateX(8px)" : "scale(1.1)",
                boxShadow: "0 4px 12px rgba(211,66,55,0.2)",
                "&::before": {
                  left: "100%",
                },
                "& .MuiListItemIcon-root": {
                  transform: "scale(1.2) rotate(5deg)",
                  color: "#D34237",
                },
                "& .MuiListItemText-primary": {
                  color: "#D34237",
                  fontWeight: 600,
                },
              },
              "&:active": {
                transform:
                  sidebarOpen || isMobile
                    ? "translateX(4px) scale(0.98)"
                    : "scale(0.95)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: "#666",
                minWidth: sidebarOpen || isMobile ? 45 : "auto",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              {getCategoryIcon(category.slug)}
            </ListItemIcon>
            {(sidebarOpen || isMobile) && (
              <>
                <ListItemText
                  primary={category.name}
                  sx={{
                    "& .MuiListItemText-primary": {
                      color: "#313B4C",
                      fontSize: "15px",
                      fontWeight: 500,
                      transition: "all 0.3s ease",
                    },
                  }}
                />
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: "#D34237",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    ".MuiListItem-root:hover &": {
                      opacity: 1,
                    },
                  }}
                />
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      <Header favoritesCount={favoritesCount} />

      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          flex: 1,
          display: "flex",
          width: "100%",
          margin: 0,
          padding: 0,
          minHeight: "calc(100vh - 120px)", // Yükseklik düşürüldü (64px'den 120px'e)
          flexDirection: isMobile ? "column" : "row", // Mobile'da column layout
        }}
      >
        {/* Mobile Drawer */}
        {isMobile ? (
          <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: 280,
                backgroundColor: "white",
                boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
              },
            }}
          >
            {renderSidebarContent()}
          </Drawer>
        ) : (
          /* Desktop Sidebar */
          <Box
            sx={{
              width: sidebarOpen ? "280px" : "60px",
              flexShrink: 0,
              borderRight: "1px solid #e0e0e0",
              backgroundColor: "white",
              transition: "all 0.3s ease",
              overflow: "hidden",
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
            }}
          >
            {renderSidebarContent()}
          </Box>
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            p: isMobile ? 2 : 3,
            transition: "all 0.3s ease",
            minHeight: "calc(100vh - 120px)",
            width: "100%",
          }}
        >
          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  backgroundColor: "#313B4C",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#D34237",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#313B4C",
                mb: 2,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Son İlanlar
            </Typography>
            <TextField
              fullWidth
              placeholder="Araç ara..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#D34237" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
          </Box>

          {/* Ads Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: (() => {
                if (isMobile) {
                  return "1fr"; // Mobile: 1 sütun
                } else if (isTablet) {
                  return sidebarOpen
                    ? "repeat(auto-fit, minmax(280px, 1fr))" // Tablet sidebar açık: 2-3 sütun
                    : "repeat(auto-fit, minmax(250px, 1fr))"; // Tablet sidebar kapalı: 3-4 sütun
                } else {
                  return sidebarOpen
                    ? "repeat(3, 1fr)" // Desktop sidebar açık: tam 3 sütun
                    : "repeat(4, 1fr)"; // Desktop sidebar kapalı: tam 4 sütun
                }
              })(),
              gap: isMobile ? 2 : 3,
              minChildWidth: isMobile
                ? "auto"
                : sidebarOpen
                ? "280px"
                : "250px", // Minimum genişlik
            }}
          >
            {Array.isArray(ads) &&
              ads.map((ad) => (
                <Card
                  key={ad.id}
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: isMobile
                      ? "auto"
                      : sidebarOpen
                      ? "280px"
                      : "250px",
                    cursor: "pointer",
                  }}
                >
                  {/* Vitrin Görseli */}
                  <CardMedia
                    component="div"
                    sx={{
                      height: { xs: 140, sm: 160, md: 180 },
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundImage: getImageUrl(ad.images)
                        ? `url(${getImageUrl(ad.images)})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {!getImageUrl(ad.images) && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          color: "#999",
                        }}
                      >
                        <LocalShipping sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="caption">Görsel Yok</Typography>
                      </Box>
                    )}

                    {/* Kategori Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        px: 1,
                        py: 0.3,
                        borderRadius: 0.5,
                        fontSize: "0.7rem",
                      }}
                    >
                      {ad.category?.name || "Araç"}
                    </Box>
                  </CardMedia>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 2,
                      "&:last-child": { pb: 2 },
                    }}
                  >
                    {/* İlan Başlığı */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "#313B4C",
                        mb: 1,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        lineHeight: 1.3,
                        height: "2.6em", // 2 satırlık sabit yükseklik
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {ad.title || "İlan Başlığı Belirtilmemiş"}
                    </Typography>

                    {/* Fiyat */}
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#333",
                        fontWeight: "bold",
                        mb: 2,
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      }}
                    >
                      ₺{formatPrice(ad.price)}
                    </Typography>

                    {/* Araç Bilgileri */}
                    <Box sx={{ mb: 2 }}>
                      {/* Model Yılı */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          mb: 0.8,
                          fontSize: "0.8rem",
                        }}
                      >
                        <strong>Model Yılı:</strong>{" "}
                        {ad.year || "Belirtilmemiş"}
                      </Typography>

                      {/* Kilometre */}
                      {ad.mileage && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666",
                            mb: 0.8,
                            fontSize: "0.8rem",
                          }}
                        >
                          <strong>KM:</strong>{" "}
                          {ad.mileage.toLocaleString("tr-TR")} km
                        </Typography>
                      )}

                      {/* Konum */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          mb: 0.8,
                          fontSize: "0.8rem",
                        }}
                      >
                        <strong>Şehir/İlçe:</strong>{" "}
                        {formatLocation(ad.city, ad.district)}
                      </Typography>

                      {/* İlan Tarihi */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#999",
                          fontSize: "0.75rem",
                        }}
                      >
                        <strong>İlan Tarihi:</strong>{" "}
                        {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                      </Typography>
                    </Box>

                    {/* Satıcı Bilgileri */}
                    <Box
                      sx={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: 1,
                        p: 1.5,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666",
                            fontSize: "0.8rem",
                          }}
                        >
                          <strong>İlan Sahibi:</strong>{" "}
                          {[ad.user.firstName, ad.user.lastName]
                            .filter(Boolean)
                            .join(" ") || "Belirtilmemiş"}
                        </Typography>

                        {ad.user.phone && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#333",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              backgroundColor: "#e8e8e8",
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 0.5,
                            }}
                          >
                            {formatPhone(ad.user.phone)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        mt: "auto",
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/ad/${ad.id}`)}
                        sx={{
                          backgroundColor: "#333",
                          color: "white",
                          py: 1,
                          borderRadius: 1,
                          fontSize: "0.8rem",
                          "&:hover": {
                            backgroundColor: "#555",
                          },
                        }}
                      >
                        Detayları Gör
                      </Button>

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleComplaint(ad)}
                          startIcon={<Report />}
                          sx={{
                            flex: 1,
                            fontSize: "0.7rem",
                            py: 0.3,
                            borderColor: "#d32f2f",
                            color: "#d32f2f",
                            "&:hover": {
                              borderColor: "#b71c1c",
                              backgroundColor: "#ffebee",
                              color: "#b71c1c",
                            },
                          }}
                        >
                          Şikayet Et
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            fontSize: "0.7rem",
                            py: 0.3,
                            borderColor: "#888",
                            color: "#666",
                            "&:hover": {
                              borderColor: "#666",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          Mesaj
                        </Button>
                        <Button
                          variant={
                            savedAds.has(ad.id) ? "contained" : "outlined"
                          }
                          size="small"
                          onClick={() => handleAddToFavorites(ad.id)}
                          disabled={savingAdId === ad.id || savedAds.has(ad.id)}
                          startIcon={
                            savingAdId === ad.id ? (
                              <CircularProgress size={12} />
                            ) : savedAds.has(ad.id) ? (
                              <CheckCircle />
                            ) : null
                          }
                          sx={{
                            flex: 1,
                            fontSize: "0.7rem",
                            py: 0.3,
                            borderColor: savedAds.has(ad.id)
                              ? "#4caf50"
                              : "#888",
                            color: savedAds.has(ad.id) ? "white" : "#666",
                            backgroundColor: savedAds.has(ad.id)
                              ? "#4caf50"
                              : "transparent",
                            "&:hover": {
                              borderColor: savedAds.has(ad.id)
                                ? "#4caf50"
                                : "#666",
                              backgroundColor: savedAds.has(ad.id)
                                ? "#4caf50"
                                : "#f5f5f5",
                            },
                            "&:disabled": {
                              backgroundColor: savedAds.has(ad.id)
                                ? "#4caf50"
                                : "transparent",
                              color: savedAds.has(ad.id) ? "white" : "#999",
                            },
                          }}
                        >
                          {savedAds.has(ad.id) ? "Kaydedildi" : "Kaydet"}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </Box>
      </Box>

      <Footer />

      {/* Complaint Modal */}
      {selectedAdForComplaint && (
        <ComplaintModal
          open={complaintModalOpen}
          onClose={handleCloseComplaintModal}
          adId={selectedAdForComplaint.id}
          adTitle={selectedAdForComplaint.title}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainLayout;
