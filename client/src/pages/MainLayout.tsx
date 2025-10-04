import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  InputLabel,
  Drawer,
} from "@mui/material";
import {
  LocalShipping,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Header, Footer } from "../components/layout";
import { useAppSelector } from "../hooks/redux";
import socketService from "../services/socketService";
import AdDetail from "./AdDetail";
import apiClient from "../api/client";
import AdBanner from "../components/ads/AdBanner";
import ComplaintModal from "../components/complaints/ComplaintModal";
import ContactPage from "./ContactPage";
import AboutPage from "./AboutPage";
import Sustainability from "./Sustainability";
import KullanimKosullari from "./KullanimKosullari";
import KisiselVeriler from "./KisiselVeriler";
import CerezYonetimi from "./CerezYonetimi";
import Profile from "./Profile";
import MyAds from "./MyAds";
import Doping from "./Doping";
import MessagesPage from "./MessagesPage";
import Complaints from "./Complaints";
import Dukkanim from "./Dukkanim";
import LazyImage from "../components/common/LazyImage";

interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  categoryId?: string;
  isActive?: boolean;
  logoUrl?: string;
}

interface Ad {
  id: number;
  title: string;
  description?: string;
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
    id: number;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    companyName?: string | null;
    userType?: string;
    role?: string;
  };
  category?: {
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  model?: {
    name: string;
  };
  mileage?: number | null;
  location?: string;
  isExchangeable?: boolean | null;
  customFields?: {
    isExchangeable?: string | boolean;
    [key: string]: unknown;
  };
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
      companyName?: string | null;
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

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categoryBrands, setCategoryBrands] = useState<Brand[]>([]);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedAdForComplaint, setSelectedAdForComplaint] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Bookmarks states
  const [favorites, setFavorites] = useState<FavoriteAd[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarksError, setBookmarksError] = useState<string | null>(null);
  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState("");
  const [bookmarkSortBy, setBookmarkSortBy] = useState("newest");
  const [bookmarkFilterBy, setBookmarkFilterBy] = useState("all");

  // Seller type filter
  const [selectedSellerType, setSelectedSellerType] = useState("all");

  // Trade filter
  const [tradeFilter, setTradeFilter] = useState("all"); // "all", "trade-only", "no-trade"
  const [dateFilter, setDateFilter] = useState("all"); // "all", "24h", "48h"
  const [kmFilter, setKmFilter] = useState("all"); // "all", "0-50000", "50000-100000", "100000-200000", "200000+"

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const adsPerPage = 1000; // ✅ Tüm ilanları göster (sınırlama kaldırıldı)

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { user, isAuthenticated, token } = useAppSelector(
    (state) => state.auth
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // Define avatar menu pages that don't need sidebar
  const avatarMenuPages = [
    "/profile",
    "/my-ads",
    "/doping",
    "/messages",
    "/complaints",
    "/store",
    "/bookmarks",
  ];
  const isAvatarMenuPage = avatarMenuPages.includes(location.pathname);
  const isFooterPage = [
    "/contact",
    "/about",
    "/sustainability",
    "/kullanim-kosullari",
    "/kisisel-verilerin-korunmasi",
    "/cerez-yonetimi",
  ].includes(location.pathname);
  const isAdDetailPage = location.pathname.startsWith("/ad/") && params.id;
  const isBookmarksPage = location.pathname === "/bookmarks";
  const shouldHideSidebar = isAvatarMenuPage || isFooterPage || isAdDetailPage;

  // Category navigation handler
  const handleCategoryClick = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    setSelectedBrand(null); // Reset brand when category changes
    setCurrentPage(1); // Reset to first page
    loadAdsLazy(1); // Load first page
  };

  // Brand navigation handler
  const handleBrandClick = (brandSlug: string | null) => {
    setSelectedBrand(brandSlug);
    setCurrentPage(1); // Reset to first page
    loadAdsLazy(1); // Load first page
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadAdsLazy(page);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Kategori ismini çevir
  const getCategoryName = (category: Category) => {
    const key = `categories.${category.slug}`;
    const translated = t(key);
    // Eğer çeviri bulunamazsa orijinal ismi göster
    return translated.startsWith("categories.") ? category.name : translated;
  };

  const getImageUrl = (images?: Ad["images"]) => {
    // ❗ Performance için console.log'ları kaldırdık
    if (!images || images.length === 0) {
      return null;
    }

    // Önce vitrin resmini ara
    const primaryImage = images.find((img) => img.isPrimary);
    const imageToUse = primaryImage || images[0];

    // Base64 veya URL formatında döndür
    return imageToUse?.imageUrl || null;
  };

  // Fiyat formatlama fonksiyonu
  const formatPrice = (price: number | null) => {
    if (!price) return "Belirtilmemiş";
    // Sayıyı string'e çevir ve nokta ile ayır
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Bookmarks utility functions
  const getBookmarkImageUrl = (images?: FavoriteAd["ad"]["images"]) => {
    if (!images || images.length === 0) {
      return null;
    }

    // Önce vitrin resmini ara
    const primaryImage = images.find((img) => img.isPrimary);
    const imageToUse = primaryImage || images[0];

    // Ana ads ile aynı yaklaşım - Base64 veya URL formatında döndür
    return imageToUse?.imageUrl || null;
  };

  const handleRemoveFavorite = async (favoriteId: number, adId: number) => {
    try {
      await apiClient.delete(`/favorites/${adId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
      // Update favorites count
      setFavoritesCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setBookmarksError(
        axiosError.response?.data?.error ||
          "Favorilerden kaldırılırken hata oluştu"
      );
    }
  };

  const getFilteredBookmarks = () => {
    let filtered = favorites;

    // Search filter
    if (bookmarkSearchQuery) {
      filtered = filtered.filter(
        (fav) =>
          fav.ad.title
            .toLowerCase()
            .includes(bookmarkSearchQuery.toLowerCase()) ||
          fav.ad.brand?.name
            ?.toLowerCase()
            .includes(bookmarkSearchQuery.toLowerCase()) ||
          fav.ad.model?.name
            ?.toLowerCase()
            .includes(bookmarkSearchQuery.toLowerCase()) ||
          fav.ad.id?.toString().includes(bookmarkSearchQuery)
      );
    }

    // Status filter
    if (bookmarkFilterBy === "active") {
      filtered = filtered.filter((fav) => fav.ad.status === "APPROVED");
    } else if (bookmarkFilterBy === "inactive") {
      filtered = filtered.filter((fav) => fav.ad.status !== "APPROVED");
    }

    // Sort
    if (bookmarkSortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (bookmarkSortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (bookmarkSortBy === "price-high") {
      filtered.sort((a, b) => (b.ad.price || 0) - (a.ad.price || 0));
    } else if (bookmarkSortBy === "price-low") {
      filtered.sort((a, b) => (a.ad.price || 0) - (b.ad.price || 0));
    }

    return filtered;
  };

  const renderBookmarksContent = () => {
    if (bookmarksLoading) {
      return (
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
      );
    }

    if (bookmarksError) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {bookmarksError}
        </Alert>
      );
    }

    return (
      <Box
        sx={{
          maxWidth: "1200px", // Narrow the content from both sides
          mx: "auto", // Center the content
          px: { xs: 1, sm: 2, md: 3 }, // Add padding on sides
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "600",
              color: "#dc3545",
              fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" },
              mb: 1,
            }}
          >
            {t("homePage.savedAds")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("homePage.trackYourSavedAds")}
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
                size="small"
                placeholder={t("homePage.searchPlaceholder")}
                value={bookmarkSearchQuery}
                onChange={(e) => setBookmarkSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#D34237" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&:hover fieldset": {
                      borderColor: "#D34237",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#D34237",
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: "0 1 200px", minWidth: "150px" }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("homePage.sortBy")}</InputLabel>
                <Select
                  value={bookmarkSortBy}
                  label={t("homePage.sortBy")}
                  onChange={(e) => setBookmarkSortBy(e.target.value)}
                >
                  <MenuItem value="newest">{t("homePage.newest")}</MenuItem>
                  <MenuItem value="oldest">{t("homePage.oldest")}</MenuItem>
                  <MenuItem value="price-high">
                    {t("homePage.priceHighToLow")}
                  </MenuItem>
                  <MenuItem value="price-low">
                    {t("homePage.priceLowToHigh")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ flex: "0 1 200px", minWidth: "150px" }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("homePage.filter")}</InputLabel>
                <Select
                  value={bookmarkFilterBy}
                  label={t("homePage.filter")}
                  onChange={(e) => setBookmarkFilterBy(e.target.value)}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="active">Aktif İlanlar</MenuItem>
                  <MenuItem value="inactive">Pasif İlanlar</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {/* Results Count */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {getFilteredBookmarks().length} kaydettiğiniz ilan bulundu
          </Typography>
        </Box>

        {/* Bookmarks Grid - Matching main ads structure exactly */}
        {getFilteredBookmarks().length === 0 ? (
          <Alert severity="info">
            {bookmarkSearchQuery || bookmarkFilterBy !== "all"
              ? "Arama kriterlerinize uygun kaydettiğiniz ilan bulunamadı."
              : "Henüz kaydettiğiniz ilan bulunmuyor. İlanları görüntülerken Kaydet butonuna tıklayarak kaydedebilirsiniz."}
          </Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(6, 1fr)",
                xl: "repeat(6, 1fr)",
              },
              gap: { xs: 1, sm: 1.5, md: 2 },
              width: "100%",
            }}
          >
            {getFilteredBookmarks().map((favorite) => (
              <Card
                key={favorite.id}
                onClick={() => {
                  if (favorite.ad.status === "APPROVED") {
                    navigate(`/ad/${favorite.ad.id}`);
                  }
                }}
                sx={{
                  borderRadius: 1,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    "& .remove-button": {
                      opacity: 1,
                    },
                  },
                  transition: "all 0.2s ease",
                  cursor:
                    favorite.ad.status === "APPROVED" ? "pointer" : "default",
                  width: "100%",
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  opacity: favorite.ad.status === "APPROVED" ? 1 : 0.7,
                  position: "relative",
                  height: 320,
                }}
              >
                {/* Status Badge for non-approved ads */}
                {favorite.ad.status !== "APPROVED" && (
                  <Chip
                    label="Onaylanmamış"
                    color="warning"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      zIndex: 3,
                      fontSize: "9px",
                      height: "18px",
                    }}
                  />
                )}

                {/* Remove from Favorites Button - Only visible on hover */}
                <IconButton
                  className="remove-button"
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    zIndex: 3,
                    backgroundColor: "rgba(220, 53, 69, 0.9)",
                    width: 20,
                    height: 20,
                    opacity: 0,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(220, 53, 69, 1)",
                      transform: "scale(1.1)",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.id, favorite.ad.id);
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 12, color: "white" }} />
                </IconButton>

                {/* Vitrin Görseli - Matching exact structure */}
                <Box
                  component="div"
                  sx={{
                    height: 120,
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    padding: "8px",
                  }}
                >
                  {getBookmarkImageUrl(favorite.ad.images) ? (
                    <LazyImage
                      src={getBookmarkImageUrl(favorite.ad.images)!}
                      alt={favorite.ad.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      placeholder="/placeholder-image.jpg"
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        color: "#999",
                      }}
                    >
                      <LocalShipping sx={{ fontSize: 24, mb: 0.5 }} />
                      <Typography variant="caption" fontSize="10px">
                        Görsel Yok
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Content - Matching exact structure */}
                <Box
                  sx={{
                    p: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    height: "auto",
                  }}
                >
                  {/* İlan Başlığı */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "#333",
                      lineHeight: 1.3,
                      mb: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minHeight: "32px",
                    }}
                  >
                    {favorite.ad.title}
                  </Typography>

                  {/* Konum ve Model Yılı - Alt alta */}
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "12px",
                        color: "#666",
                        display: "block",
                      }}
                    >
                      {favorite.ad.city?.name ||
                        favorite.ad.district?.name ||
                        "Belirtilmemiş"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "12px",
                        color: "#666",
                        display: "block",
                      }}
                    >
                      {favorite.ad.year
                        ? `Model Yılı: ${favorite.ad.year}`
                        : favorite.ad.model?.name ||
                          favorite.ad.brand?.name ||
                          "Model"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "11px",
                        color: "#999",
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      Kaydedildi:{" "}
                      {new Date(favorite.createdAt).toLocaleDateString("tr-TR")}
                    </Typography>
                  </Box>

                  {/* Fiyat - Sağ Alt Köşe */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 16,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#dc3545",
                      }}
                    >
                      {favorite.ad.price
                        ? `${formatPrice(favorite.ad.price)} TL`
                        : t("homePage.noPrice")}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const handleCloseComplaintModal = () => {
    setComplaintModalOpen(false);
    setSelectedAdForComplaint(null);
  };

  // ❗ ULTRA FAST: Ads'leri minimal mode ile hızlı yükle - Pagination destekli
  const loadAdsLazy = async (page: number = 1) => {
    const adsStartTime = performance.now();
    console.log(`⚡ Loading ads page ${page} with ultra fast mode...`);

    try {
      const adsRes = await apiClient
        .get(
          `/ads?status=APPROVED&limit=${adsPerPage}&page=${page}&minimal=true`
        )
        .catch((err) => {
          console.error("Ads lazy loading error:", err);
          return {
            data: {
              ads: [],
              pagination: { page: 1, limit: adsPerPage, total: 0, pages: 1 },
            },
          };
        });

      const adsResponse = adsRes.data as unknown as ApiAdsResponse;
      const adsData = adsResponse?.ads
        ? Array.isArray(adsResponse.ads)
          ? adsResponse.ads
          : []
        : Array.isArray(adsRes.data)
        ? (adsRes.data as Ad[])
        : [];

      // Pagination bilgilerini güncelle
      if (adsResponse?.pagination) {
        setTotalPages(adsResponse.pagination.pages);
        setCurrentPage(page);
      } else {
        // Fallback for old API responses
        setTotalPages(1);
        setCurrentPage(1);
      }

      const adsLoadTime = performance.now() - adsStartTime;
      console.log(`⚡ Ads page ${page} loaded in: ${adsLoadTime.toFixed(2)}ms`);

      // Debug mileage data
      console.log("=== ADS MILEAGE DEBUG ===");
      if (adsData && Array.isArray(adsData) && adsData.length > 0) {
        adsData.slice(0, 3).forEach((ad: Ad, index: number) => {
          console.log(
            `API Ad ${index + 1} - ID: ${ad.id}, Title: ${ad.title}, Mileage: ${
              ad.mileage
            }, Type: ${typeof ad.mileage}`
          );
        });
      }
      console.log("=== END MILEAGE DEBUG ===");

      setAds(adsData as Ad[]);
    } catch (error) {
      console.error("Ads lazy loading error:", error);
      setAds([]);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  // Scroll to top when navigating to footer pages
  useEffect(() => {
    if (isFooterPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isFooterPage, location.pathname]);

  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("🚀 INSTANT Homepage Loading Start...");

      try {
        // ❗ INSTANT UI: Kategorileri localStorage'dan yükle (varsa)
        const cachedCategories = localStorage.getItem("categories");
        if (cachedCategories) {
          setCategories(JSON.parse(cachedCategories));
          console.log("⚡ Categories loaded from cache instantly");
        }

        // ❗ CRITICAL: Kategorileri API'den yükle ve cache'le
        const categoriesRes = await apiClient
          .get("/categories")
          .catch((err) => {
            console.error("Categories API error:", err);
            return { data: [] };
          });

        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

        setCategories(categoriesData as Category[]);
        // Cache categories for next visit
        localStorage.setItem("categories", JSON.stringify(categoriesData));

        // ❗ CRITICAL: Ads'leri ANINDA yükle - 2 saniye bekleme kaldırıldı
        loadAdsLazy(1);

        // ❗ Şehirler ve markalar lazy loading - 500ms sonra yükle (daha hızlı)
        setTimeout(() => {
          loadCitiesAndBrands();
        }, 500);
      } catch (error) {
        console.error("Initial data fetch error:", error);
        // Fallback data sadece kategoriler için
        setCategories([
          {
            id: "1",
            name: "Minibüs & Midibüs",
            slug: "minibus-midibus",
            displayOrder: 1,
          },
          {
            id: "2",
            name: "Kamyon & Kamyonet",
            slug: "kamyon-kamyonet",
            displayOrder: 2,
          },
          { id: "3", name: "Dorse", slug: "dorse", displayOrder: 3 },
          { id: "4", name: "Çekici", slug: "cekici", displayOrder: 4 },
          {
            id: "5",
            name: "Karoser & Üst Yapı",
            slug: "karoser-ust-yapi",
            displayOrder: 5,
          },
          { id: "6", name: "Otobüs", slug: "otobus", displayOrder: 6 },
          { id: "7", name: "Römork", slug: "romork", displayOrder: 7 },
          {
            id: "8",
            name: "Oto Kurtarıcı & Taşıyıcı",
            slug: "oto-kurtarici-tasiyici",
            displayOrder: 8,
          },
        ]);

        // İlanlar için boş array
        setAds([]);
      }
    };

    fetchInitialData();
  }, []);

  // ❗ Admin'den onaylanan ilanları otomatik yenile
  useEffect(() => {
    const checkForRefresh = () => {
      const shouldRefresh = localStorage.getItem("refreshHomepage");
      if (shouldRefresh === "true") {
        console.log("🔄 Admin onayından sonra anasayfa yenileniyor...");
        loadAdsLazy(1); // Sayfa 1'den başla
        localStorage.removeItem("refreshHomepage");
      }
    };

    // Sayfa focus olduğunda kontrol et
    const handleFocus = () => checkForRefresh();
    window.addEventListener("focus", handleFocus);

    // İlk yüklemede de kontrol et
    checkForRefresh();

    // Her 30 saniyede bir otomatik kontrol et
    const intervalId = setInterval(checkForRefresh, 30000);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  // ❗ Socket.io ile gerçek zamanlı onaylı ilan bildirimi (TÜM KULLANICILAR İÇİN)
  useEffect(() => {
    // Socket bağlantısını kur (auth gerekli değil, herkes dinleyebilir)
    const socket = socketService.connect(user?.id || 0);

    // Onaylı ilan bildirimi dinle
    const handleAdApproved = (data: { adId: number; message: string }) => {
      console.log("🔔 İlan onaylandı bildirimi alındı:", data);
      // Anında ilanları yenile (sayfa 1'e dön)
      loadAdsLazy(1);
      // Toast bildirim göster (opsiyonel)
      // toast.success(data.message || "Bir ilan onaylandı ve anasayfaya eklendi!");
    };

    socket?.on("adApproved", handleAdApproved);

    // Cleanup
    return () => {
      socket?.off("adApproved", handleAdApproved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array boş - sadece mount/unmount'ta çalışır

  // ❗ FALLBACK LİSTENER'LAR: PostMessage ve CustomEvent
  useEffect(() => {
    // PostMessage listener (farklı tab'lar için)
    const handlePostMessage = (event: MessageEvent) => {
      if (event.data?.type === "AD_APPROVED") {
        console.log(
          "📬 PostMessage ile ilan onayı bildirimi alındı:",
          event.data.adId
        );
        loadAdsLazy(1); // Sayfa 1'e dön
      }
    };

    // CustomEvent listener (aynı sayfa için)
    const handleCustomEvent = (event: CustomEvent) => {
      console.log(
        "⚡ CustomEvent ile ilan onayı bildirimi alındı:",
        event.detail.adId
      );
      loadAdsLazy(1); // Sayfa 1'e dön
    };

    window.addEventListener("message", handlePostMessage);
    window.addEventListener("adApproved", handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener("message", handlePostMessage);
      window.removeEventListener(
        "adApproved",
        handleCustomEvent as EventListener
      );
    };
  }, []);

  // ❗ Şehirler ve markalar lazy loading - optimize edildi
  const loadCitiesAndBrands = async () => {
    try {
      // ❗ CRITICAL: Paralel ama limit'li ve cache'li
      const [citiesRes, brandsRes] = await Promise.all([
        apiClient.get("/cities?limit=50").catch((err) => {
          console.error("Cities API error:", err);
          return { data: [] };
        }),
        apiClient.get("/brands?limit=100").catch((err) => {
          console.error("Brands API error:", err);
          return { data: [] };
        }),
      ]);

      const citiesData = Array.isArray(citiesRes.data) ? citiesRes.data : [];
      const brandsData = Array.isArray(brandsRes.data) ? brandsRes.data : [];

      setCities(citiesData);
      setBrands(brandsData as Brand[]);
    } catch (error) {
      console.error("Lazy loading error:", error);
    }
  };

  // İlçeleri yüklemek için fonksiyon
  const loadDistricts = async (cityId: string) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }

    try {
      const response = await apiClient
        .get(`/cities/${cityId}/districts`)
        .catch((err) => {
          console.error("Districts API error:", err);
          return { data: [] };
        });

      const districtsData = Array.isArray(response.data) ? response.data : [];
      setDistricts(districtsData);
    } catch (error) {
      console.error("Districts loading error:", error);
      setDistricts([]);
    }
  };

  // Şehir değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (selectedCity) {
      loadDistricts(selectedCity);
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

  // İlk yüklemede tüm markaları yükle, sonra kategoriye göre filtrele
  // useEffect kaldırıldı - artık category değiştiğinde API çağrısı yapmıyoruz

  // Kategori değiştiğinde o kategoriye özel brandları yükle
  useEffect(() => {
    const loadCategoryBrands = async () => {
      if (!selectedCategory) {
        setCategoryBrands([]);
        return;
      }

      try {
        console.log("Loading brands for category:", selectedCategory);
        const response = await apiClient.get(
          `/categories/${selectedCategory}/brands`
        );
        const brandsData = Array.isArray(response.data) ? response.data : [];
        console.log("Category brands loaded:", brandsData.length);
        setCategoryBrands(brandsData);
      } catch (error) {
        console.error("Error loading category brands:", error);
        setCategoryBrands([]);
      }
    };

    loadCategoryBrands();
  }, [selectedCategory]);

  // Gelişmiş filtreleme
  useEffect(() => {
    // ❗ Performance için filtering console'u kaldırdık

    if (
      !selectedCategory &&
      !selectedBrand &&
      !searchTerm &&
      !priceMin &&
      !priceMax &&
      !yearMin &&
      !yearMax &&
      !selectedCity
    ) {
      setFilteredAds(ads);
    } else {
      let filtered = [...ads];
      console.log("Starting with ads:", filtered.length);

      // Kategori filtresi - slug ile eşleştir
      if (selectedCategory) {
        const selectedCategoryName = categories.find(
          (cat) => cat.slug === selectedCategory
        )?.name;
        if (selectedCategoryName) {
          filtered = filtered.filter((ad) => {
            const categoryMatch =
              ad.category?.name?.toLowerCase() ===
              selectedCategoryName.toLowerCase();
            return categoryMatch;
          });
          console.log(
            "After category filter:",
            filtered.length,
            "Category:",
            selectedCategoryName
          );
        }
      }

      // Marka filtresi - categoryBrands kullan (seçili kategorideki markalar)
      if (selectedBrand) {
        // Önce categoryBrands'de ara, bulamazsan brands'de ara
        const allBrands = categoryBrands.length > 0 ? categoryBrands : brands;
        const selectedBrandName = allBrands.find(
          (brand) => brand.slug === selectedBrand
        )?.name;

        if (selectedBrandName) {
          filtered = filtered.filter((ad) => {
            const brandMatch =
              ad.brand?.name?.toLowerCase() === selectedBrandName.toLowerCase();
            return brandMatch;
          });
          console.log(
            "After brand filter:",
            filtered.length,
            "Brand:",
            selectedBrandName,
            "(from:",
            categoryBrands.length > 0 ? "categoryBrands" : "brands",
            ")"
          );
        } else {
          console.warn(
            "⚠️ Brand not found:",
            selectedBrand,
            "in",
            categoryBrands.length > 0 ? "categoryBrands" : "brands"
          );
        }
      }

      // Gelişmiş arama terimi filtresi - Her şeyi arar
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((ad) => {
          const titleMatch = ad.title?.toLowerCase().includes(searchLower);
          const descriptionMatch = ad.description
            ?.toLowerCase()
            .includes(searchLower);
          const brandMatch = ad.brand?.name
            ?.toLowerCase()
            .includes(searchLower);
          const modelMatch = ad.model?.name
            ?.toLowerCase()
            .includes(searchLower);
          const categoryMatch = ad.category?.name
            ?.toLowerCase()
            .includes(searchLower);
          const cityMatch = ad.city?.name?.toLowerCase().includes(searchLower);
          const districtMatch = ad.district?.name
            ?.toLowerCase()
            .includes(searchLower);
          const locationMatch = ad.location
            ?.toLowerCase()
            .includes(searchLower);
          const priceMatch = ad.price?.toString().includes(searchTerm);
          const yearMatch = ad.year?.toString().includes(searchTerm);
          const mileageMatch = ad.mileage?.toString().includes(searchTerm);

          // İlan numarası araması
          const adIdMatch = ad.id?.toString().includes(searchTerm);

          // Seller bilgileri de aranabilir
          const sellerNameMatch =
            ad.user?.firstName?.toLowerCase().includes(searchLower) ||
            ad.user?.lastName?.toLowerCase().includes(searchLower);
          const sellerCompanyMatch = ad.user?.companyName
            ?.toLowerCase()
            .includes(searchLower);

          return (
            titleMatch ||
            descriptionMatch ||
            brandMatch ||
            modelMatch ||
            categoryMatch ||
            cityMatch ||
            districtMatch ||
            locationMatch ||
            priceMatch ||
            yearMatch ||
            mileageMatch ||
            adIdMatch ||
            sellerNameMatch ||
            sellerCompanyMatch
          );
        });
        console.log(
          "After enhanced search filter:",
          filtered.length,
          "Search term:",
          searchTerm
        );
      }

      // Fiyat aralığı filtresi
      if (priceMin || priceMax) {
        filtered = filtered.filter((ad) => {
          const price = ad.price;
          if (price === null || price === undefined) return false;

          const minCheck = !priceMin || price >= parseFloat(priceMin);
          const maxCheck = !priceMax || price <= parseFloat(priceMax);

          return minCheck && maxCheck;
        });
        console.log("After price filter:", filtered.length);
      }

      // Yıl aralığı filtresi
      if (yearMin || yearMax) {
        filtered = filtered.filter((ad) => {
          const year = ad.year;
          if (year === null || year === undefined) return false;

          const minCheck = !yearMin || year >= parseInt(yearMin);
          const maxCheck = !yearMax || year <= parseInt(yearMax);

          return minCheck && maxCheck;
        });
        console.log("After year filter:", filtered.length);
      }

      // Şehir filtresi - daha esnek kontrol
      if (selectedCity) {
        console.log("=== ŞEHIR FILTER DEBUG ===");
        console.log("selectedCity:", selectedCity);
        console.log("Sample ad city data:", filtered[0]?.city);

        filtered = filtered.filter((ad) => {
          // City veri yapısını kontrol et
          const cityId = ad.city?.id;
          const cityName = ad.city?.name;

          // ID ile eşleştir (öncelik)
          const cityIdMatch = cityId?.toString() === selectedCity.toString();

          // Name ile eşleştir (fallback)
          const selectedCityName = cities.find(
            (c) => c.id.toString() === selectedCity.toString()
          )?.name;
          const cityNameMatch =
            selectedCityName &&
            cityName?.toLowerCase() === selectedCityName.toLowerCase();

          const result = cityIdMatch || cityNameMatch;

          if (result) {
            console.log(`✓ City match: ${ad.title}`);
            console.log(`  cityId: ${cityId}, cityName: ${cityName}`);
            console.log(
              `  selectedCity: ${selectedCity}, selectedCityName: ${selectedCityName}`
            );
          }

          return result;
        });
        console.log(
          "After city filter:",
          filtered.length,
          "City ID:",
          selectedCity
        );
        console.log("=== END ŞEHIR DEBUG ===");
      }

      // İlçe filtresi - daha esnek kontrol
      if (selectedDistrict) {
        console.log("=== İLÇE FILTER DEBUG ===");
        console.log("selectedDistrict:", selectedDistrict);
        console.log("Sample ad district data:", filtered[0]?.district);

        filtered = filtered.filter((ad) => {
          // District veri yapısını kontrol et
          const districtId = ad.district?.id;
          const districtName = ad.district?.name;

          // ID ile eşleştir (öncelik)
          const districtIdMatch =
            districtId?.toString() === selectedDistrict.toString();

          // Name ile eşleştir (fallback)
          const selectedDistrictName = districts.find(
            (d) => d.id.toString() === selectedDistrict.toString()
          )?.name;
          const districtNameMatch =
            selectedDistrictName &&
            districtName?.toLowerCase() === selectedDistrictName.toLowerCase();

          const result = districtIdMatch || districtNameMatch;

          if (result) {
            console.log(`✓ District match: ${ad.title}`);
            console.log(
              `  districtId: ${districtId}, districtName: ${districtName}`
            );
            console.log(
              `  selectedDistrict: ${selectedDistrict}, selectedDistrictName: ${selectedDistrictName}`
            );
          }

          return result;
        });
        console.log(
          "After district filter:",
          filtered.length,
          "District ID:",
          selectedDistrict
        );
        console.log("=== END İLÇE DEBUG ===");
      }

      // Seller type filtresi
      if (selectedSellerType !== "all") {
        filtered = filtered.filter((ad) => {
          // Role'e göre user type'ı belirle
          const userType =
            ad.user?.role === "CORPORATE" ? "corporate" : "individual";

          // Debug için ilk ilan bilgilerini yazdır
          if (filtered.indexOf(ad) === 0) {
            console.log("=== SELLER FILTER DEBUG ===");
            console.log("Selected seller type:", selectedSellerType);
            console.log("Sample ad user:", {
              id: ad.user?.id,
              firstName: ad.user?.firstName,
              companyName: ad.user?.companyName,
              role: ad.user?.role,
              userType: ad.user?.userType,
              calculatedUserType: userType,
            });
            console.log("=== END SELLER DEBUG ===");
          }

          switch (selectedSellerType) {
            case "individual":
              // Üyeden: sadece bireysel kullanıcılar (USER role)
              return userType === "individual";
            case "trader":
              // Esnaftan: kurumsal kullanıcılar (CORPORATE role)
              return userType === "corporate";
            case "corporate":
              // Kurumdan: kurumsal kullanıcılar (CORPORATE role)
              return userType === "corporate";
            default:
              return true;
          }
        });
        console.log(
          "After seller type filter:",
          filtered.length,
          "Type:",
          selectedSellerType
        );
      }

      // Takas filtresi
      if (tradeFilter !== "all") {
        console.log("=== TAKAS FILTER DEBUG ===");
        console.log("tradeFilter:", tradeFilter);
        console.log("Total ads before filter:", filtered.length);

        // İlk 5 ilan için isExchangeable değerlerini yazdır
        filtered.slice(0, 5).forEach((ad, index) => {
          console.log(`Ad ${index + 1}: ${ad.title}`);
          console.log(
            `  - isExchangeable:`,
            ad.isExchangeable,
            typeof ad.isExchangeable
          );
          console.log(
            `  - customFields.isExchangeable:`,
            ad.customFields?.isExchangeable,
            typeof ad.customFields?.isExchangeable
          );
        });

        filtered = filtered.filter((ad) => {
          // Tüm olası yerlerden takas bilgisini al
          const directValue = ad.isExchangeable;
          const customValue = ad.customFields?.isExchangeable;
          const exchangeValue = ad.customFields?.exchange;

          // Takas durumunu belirle
          let isTradeAllowed = false;

          if (directValue === true) {
            isTradeAllowed = true;
          } else if (typeof customValue === "boolean") {
            isTradeAllowed = customValue;
          } else if (typeof customValue === "string") {
            isTradeAllowed =
              customValue.toLowerCase() === "evet" ||
              customValue.toLowerCase() === "true";
          } else if (typeof exchangeValue === "string") {
            isTradeAllowed =
              exchangeValue.toLowerCase() === "evet" ||
              exchangeValue.toLowerCase() === "true";
          }

          let result = false;
          switch (tradeFilter) {
            case "trade-only":
              // Sadece takaslı ilanları göster (Evet)
              result = isTradeAllowed === true;
              break;
            case "no-trade":
              // Sadece takasa kapalı ilanları göster (Hayır)
              result = isTradeAllowed === false;
              break;
            default:
              result = true;
          }

          if (tradeFilter === "trade-only" && result) {
            console.log(`✓ Trade-only match: ${ad.title}`);
            console.log(`  - Final isTradeAllowed:`, isTradeAllowed);
            console.log(`  - directValue:`, directValue);
            console.log(`  - customValue:`, customValue);
            console.log(`  - exchangeValue:`, exchangeValue);
          }

          return result;
        });

        console.log("After trade filter:", filtered.length);
        console.log("Filter:", tradeFilter);
        console.log("=== END TAKAS DEBUG ===");
      }

      // KM filtresi
      if (kmFilter !== "all") {
        console.log("=== KM FILTER DEBUG ===");
        console.log("kmFilter:", kmFilter);
        console.log("Total ads before filter:", filtered.length);

        filtered = filtered.filter((ad) => {
          // Kilometre bilgisini farklı yerlerden al
          const mileageValue = ad.mileage || ad.customFields?.mileage || 0;
          const km =
            typeof mileageValue === "string"
              ? parseInt(mileageValue.replace(/[^\d]/g, ""))
              : Number(mileageValue);

          let result = false;
          switch (kmFilter) {
            case "0-50000":
              result = km >= 0 && km <= 50000;
              break;
            case "50000-100000":
              result = km > 50000 && km <= 100000;
              break;
            case "100000-200000":
              result = km > 100000 && km <= 200000;
              break;
            case "200000-300000":
              result = km > 200000 && km <= 300000;
              break;
            case "300000+":
              result = km > 300000;
              break;
            default:
              result = true;
          }
          return result;
        });

        console.log(`After km filter (${kmFilter}):`, filtered.length);
        console.log("=== END KM DEBUG ===");
      }

      // Tarih filtresi
      if (dateFilter !== "all") {
        const now = new Date();
        const cutoffTime = new Date();

        if (dateFilter === "24h") {
          cutoffTime.setHours(now.getHours() - 24);
        } else if (dateFilter === "48h") {
          cutoffTime.setHours(now.getHours() - 48);
        }

        filtered = filtered.filter((ad) => {
          const adDate = new Date(ad.createdAt);
          return adDate >= cutoffTime;
        });

        console.log(`After date filter (${dateFilter}):`, filtered.length);

        // Tarih filtresi aktifse güncel tarih sıralaması yap
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime(); // En yeni önce
        });
      }

      setFilteredAds(filtered);
      console.log("Final filtered ads:", filtered.length);
    }
  }, [
    ads,
    selectedCategory,
    selectedBrand,
    searchTerm,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    selectedCity,
    selectedDistrict,
    selectedSellerType,
    tradeFilter,
    dateFilter,
    kmFilter,
    categories,
    brands,
    categoryBrands,
    cities,
    districts,
  ]);

  // ❗ Favorites count'u lazy yükle - critical değil (SAFE VERSION)
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (!user || !token) {
        setFavoritesCount(0);
        return;
      }

      // ❗ 2 saniye sonra yükle - initial loading'i engellemez
      setTimeout(async () => {
        try {
          const response = await apiClient.get("/favorites", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const favorites = response.data as Array<{ ad: { id: number } }>;
          setFavoritesCount(favorites.length);
        } catch {
          console.error("Favorites count error (safe ignore)");
          setFavoritesCount(0); // Silent fail
        }
      }, 2000);
    };

    fetchFavoritesCount();
  }, [user, token]); // token dependency eklendi

  // Load bookmarks when on bookmarks page
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!isBookmarksPage) return;

      if (!user || !token) {
        setBookmarksError("Favorileri görüntülemek için giriş yapmalısınız");
        setBookmarksLoading(false);
        return;
      }

      try {
        setBookmarksLoading(true);
        setBookmarksError(null);
        const response = await apiClient.get("/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFavorites(response.data as FavoriteAd[]);
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        setBookmarksError(
          axiosError.response?.data?.error ||
            "Favoriler yüklenirken hata oluştu"
        );
      } finally {
        setBookmarksLoading(false);
      }
    };

    fetchBookmarks();
  }, [isBookmarksPage, user, token]);

  // Category count helper function - dinamik olarak ads verilerinden hesaplar
  const getCategoryCount = (slug: string | null) => {
    if (slug === null) {
      // Tüm ilanlar için toplam sayı
      return ads.length.toLocaleString();
    }

    // Belirli kategori için sayı
    const categoryAds = ads.filter((ad) => {
      // Category'nin slug'ına göre filtreleme
      const category = categories.find((cat) => cat.name === ad.category?.name);
      return category?.slug === slug;
    });

    return categoryAds.length.toLocaleString();
  };

  // Get brands for selected category with search filter
  const getCategoryBrands = () => {
    console.log("=== getCategoryBrands DEBUG ===");
    console.log("selectedCategory:", selectedCategory);
    console.log("categoryBrands length:", categoryBrands.length);
    console.log("brandSearchQuery:", brandSearchQuery);

    if (!selectedCategory || categoryBrands.length === 0) {
      console.log(
        "Early return: No category selected or no category brands loaded"
      );
      return [];
    }

    // Search filter uygula
    const filteredBrands = brandSearchQuery.trim()
      ? categoryBrands.filter((brand) =>
          brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
        )
      : categoryBrands;

    console.log("Filtered brands:", filteredBrands.length);
    console.log(
      "Brand names:",
      filteredBrands.map((b) => b.name)
    );
    console.log("=== END DEBUG ===");

    return filteredBrands;
  };

  // Get brand count for category
  const getBrandCount = (brandSlug: string) => {
    if (!selectedCategory) return "0";

    // Seçili kategorinin adını bul
    const selectedCategoryName = categories.find(
      (cat) => cat.slug === selectedCategory
    )?.name;

    if (!selectedCategoryName) return "0";

    // Bu kategorideki bu markaya ait ilanları say
    const count = ads.filter((ad) => {
      const categoryMatch =
        ad.category?.name?.toLowerCase() ===
        selectedCategoryName?.toLowerCase();
      const brandMatch =
        ad.brand?.name === brands.find((b) => b.slug === brandSlug)?.name;
      return categoryMatch && brandMatch;
    }).length;

    console.log(
      `Brand count for ${brandSlug} in ${selectedCategoryName}:`,
      count
    );
    return count.toString();
  };

  const renderSidebarContent = () => {
    // Eğer kategori seçilmemişse normal kategori listesini göster
    if (!selectedCategory) {
      return (
        <Box sx={{ p: 1 }}>
          {/* Kategoriler Başlığı */}
          <Typography
            variant="h6"
            sx={{
              color: "#333",
              fontWeight: "600",
              fontSize: "16px",
              mb: 2,
              textAlign: "center",
              pb: 1,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            {t("categories.title")}
          </Typography>

          {/* Categories List */}
          <List sx={{ p: 0, py: 0 }}>
            {/* Tüm İlanlar Seçeneği */}
            <ListItem
              onClick={() => handleCategoryClick(null)}
              sx={{
                cursor: "pointer",
                py: 0.5,
                px: 1,
                mb: 0.5,
                borderBottom: "1px solid #f5f5f5",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
                transition: "background-color 0.2s ease",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "14px",
                    fontWeight: 400,
                  }}
                >
                  {t("homePage.allAds")}
                </Typography>
                <Typography
                  sx={{
                    color: "#666",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: "#f0f0f0",
                    px: 1,
                    py: 0.2,
                    borderRadius: "10px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {getCategoryCount(null)}
                </Typography>
              </Box>
            </ListItem>

            {categories.map((category) => (
              <ListItem
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                sx={{
                  cursor: "pointer",
                  py: 0.5,
                  px: 1,
                  mb: 0.5,
                  borderBottom: "1px solid #f5f5f5",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                  },
                  transition: "background-color 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#333",
                      fontSize: "14px",
                      fontWeight: 400,
                    }}
                  >
                    {getCategoryName(category)}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#666",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: "#f0f0f0",
                      px: 1,
                      py: 0.2,
                      borderRadius: "10px",
                      minWidth: "20px",
                      textAlign: "center",
                    }}
                  >
                    {getCategoryCount(category.slug)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    }

    // Kategori seçilmişse o kategoriye özel sidebar göster
    const selectedCategoryData = categories.find(
      (cat) => cat.slug === selectedCategory
    );
    const categoryBrands = getCategoryBrands();

    return (
      <Box sx={{ p: 1 }}>
        {/* Seçili Kategori Başlığı ve Geri Butonu */}
        <Box sx={{ mb: 1 }}>
          <Button
            onClick={() => handleCategoryClick(null)}
            sx={{
              mb: 1,
              p: 0,
              minWidth: "auto",
              color: "#666",
              fontSize: "12px",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#333",
              },
            }}
          >
            ← {t("homePage.allCategories")}
          </Button>
          <Typography
            variant="h6"
            sx={{
              color: "#333",
              fontWeight: "bold",
              fontSize: "13px",
              mb: 1,
              pb: 1,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            {selectedCategoryData?.name}
          </Typography>
        </Box>

        {/* Markalar Başlığı */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#333",
            fontWeight: "bold",
            fontSize: "14px",
            mb: 1,
          }}
        >
          {t("homePage.brands")}
        </Typography>

        {/* Marka Arama */}
        <TextField
          placeholder={t("homePage.searchBrand")}
          variant="outlined"
          size="small"
          value={brandSearchQuery}
          onChange={(e) => setBrandSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#666", fontSize: "18px" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            "& .MuiOutlinedInput-root": {
              fontSize: "13px",
              backgroundColor: "#fafafa",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&.Mui-focused": {
                backgroundColor: "#fff",
              },
            },
            "& .MuiOutlinedInput-input": {
              padding: "8px 12px",
            },
          }}
        />

        {/* Markalar Listesi - Grid Layout */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            maxHeight: "300px",
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "2px",
            },
          }}
        >
          {categoryBrands.map((brand) => (
            <Box
              key={brand.id}
              onClick={() => handleBrandClick(brand.slug)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                py: 0.8,
                px: 1.5,
                backgroundColor:
                  selectedBrand === brand.slug ? "#e3f2fd" : "transparent",
                borderLeft:
                  selectedBrand === brand.slug
                    ? "3px solid #1976d2"
                    : "3px solid transparent",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Typography
                sx={{
                  color: selectedBrand === brand.slug ? "#1976d2" : "#333",
                  fontSize: "13px",
                  fontWeight: selectedBrand === brand.slug ? 600 : 400,
                  flex: 1,
                }}
              >
                {brand.name}
              </Typography>
              <Typography
                sx={{
                  color: "#666",
                  fontSize: "11px",
                  backgroundColor: "#f0f0f0",
                  px: 1,
                  py: 0.2,
                  borderRadius: "10px",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {getBrandCount(brand.slug)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Filtreler Bölümü */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#333",
              fontWeight: "bold",
              fontSize: "14px",
              mb: 2,
              pb: 1,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            {t("homePage.filters")}
          </Typography>

          {/* Fiyat Aralığı */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontSize: "12px", color: "#666" }}
            >
              Fiyat Aralığı
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder={t("homePage.min")}
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontSize: "12px",
                    height: "32px",
                  },
                }}
              />
              <TextField
                size="small"
                placeholder={t("homePage.max")}
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontSize: "12px",
                    height: "32px",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Yıl Aralığı */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontSize: "12px", color: "#666" }}
            >
              {t("homePage.modelYear")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder={t("homePage.min")}
                type="number"
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontSize: "12px",
                    height: "32px",
                  },
                }}
              />
              <TextField
                size="small"
                placeholder={t("homePage.max")}
                type="number"
                value={yearMax}
                onChange={(e) => setYearMax(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    fontSize: "12px",
                    height: "32px",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Şehir Filtresi */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontSize: "12px", color: "#666" }}
            >
              Şehir
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict(""); // Şehir değiştiğinde ilçeyi sıfırla
                }}
                displayEmpty
                sx={{
                  backgroundColor: "white",
                  fontSize: "12px",
                  height: "32px",
                }}
              >
                <MenuItem value="">Tümü</MenuItem>
                {cities.map((city) => (
                  <MenuItem
                    key={city.id}
                    value={city.id}
                    sx={{ fontSize: "12px" }}
                  >
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* İlçe Filtresi */}
          {selectedCity && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontSize: "12px", color: "#666" }}
              >
                İlçe
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  displayEmpty
                  sx={{
                    backgroundColor: "white",
                    fontSize: "12px",
                    height: "32px",
                  }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {districts.map((district) => (
                    <MenuItem
                      key={district.id}
                      value={district.id}
                      sx={{ fontSize: "12px" }}
                    >
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Takas Filtresi */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontSize: "12px", color: "#666" }}
            >
              Takas Durumu
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: "white",
                  fontSize: "12px",
                  height: "32px",
                }}
              >
                <MenuItem value="all" sx={{ fontSize: "12px" }}>
                  Tümü
                </MenuItem>
                <MenuItem value="trade-only" sx={{ fontSize: "12px" }}>
                  Evet
                </MenuItem>
                <MenuItem value="no-trade" sx={{ fontSize: "12px" }}>
                  Hayır
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* KM Filtresi */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontSize: "12px", color: "#666" }}
            >
              Kilometre
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={kmFilter}
                onChange={(e) => setKmFilter(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: "white",
                  fontSize: "12px",
                  height: "32px",
                }}
              >
                <MenuItem value="all" sx={{ fontSize: "12px" }}>
                  Tümü
                </MenuItem>
                <MenuItem value="0-50000" sx={{ fontSize: "12px" }}>
                  0 - 50.000 km
                </MenuItem>
                <MenuItem value="50000-100000" sx={{ fontSize: "12px" }}>
                  50.000 - 100.000 km
                </MenuItem>
                <MenuItem value="100000-200000" sx={{ fontSize: "12px" }}>
                  100.000 - 200.000 km
                </MenuItem>
                <MenuItem value="200000-300000" sx={{ fontSize: "12px" }}>
                  200.000 - 300.000 km
                </MenuItem>
                <MenuItem value="300000+" sx={{ fontSize: "12px" }}>
                  300.000+ km
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Tarih Filtresi */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontSize: "12px", color: "#666" }}
            >
              İlan Tarihi
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: "white",
                  fontSize: "12px",
                  height: "32px",
                }}
              >
                <MenuItem value="all" sx={{ fontSize: "12px" }}>
                  Tümü
                </MenuItem>
                <MenuItem value="24h" sx={{ fontSize: "12px" }}>
                  Son 24 Saat
                </MenuItem>
                <MenuItem value="48h" sx={{ fontSize: "12px" }}>
                  Son 48 Saat
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Filtreleri Temizle */}
          {(selectedBrand ||
            priceMin ||
            priceMax ||
            yearMin ||
            yearMax ||
            selectedCity ||
            selectedDistrict ||
            tradeFilter !== "all" ||
            dateFilter !== "all" ||
            kmFilter !== "all") && (
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => {
                setSelectedBrand(null);
                setPriceMin("");
                setPriceMax("");
                setYearMin("");
                setYearMax("");
                setSelectedCity("");
                setSelectedDistrict("");
                setTradeFilter("all");
                setDateFilter("all");
                setKmFilter("all");
              }}
              sx={{
                color: "#d32f2f",
                borderColor: "#d32f2f",
                fontSize: "11px",
                height: "28px",
                "&:hover": {
                  borderColor: "#b71c1c",
                  backgroundColor: "rgba(211, 66, 55, 0.04)",
                },
              }}
            >
              {t("homePage.clearFilters")}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

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
          flexDirection: "row",
        }}
      >
        {/* Mobile Menu Button - Only visible on mobile */}
        {isMobile && (
          <IconButton
            onClick={() => setMobileDrawerOpen(true)}
            sx={{
              position: "fixed",
              top: 70,
              left: 16,
              zIndex: 1200,
              backgroundColor: "white",
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              mt: 8,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {t("homePage.filters")}
            </Typography>
            <IconButton onClick={() => setMobileDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 1 }}>{renderSidebarContent()}</Box>
        </Drawer>

        {/* Enhanced Sidebar with better borders */}
        {!shouldHideSidebar && !isMobile && (
          <Box
            sx={{
              width: isTablet ? "160px" : "180px",
              flexShrink: 0,
              backgroundColor: "transparent",
              ml: 1,
              mt: 12,
              overflow: "hidden",
            }}
          >
            {renderSidebarContent()}
          </Box>
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            p: isMobile ? 1 : isTablet ? 2 : 3,
            pl: isMobile ? 7 : undefined, // Extra left padding on mobile for hamburger menu
            width: "100%",
            position: "relative",
          }}
        >
          {/* Vertical Banner for AdDetail pages */}
          {isAdDetailPage && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: "20px",
                width: "100px",
                height: "100%",
                zIndex: 100,
                display: { xs: "none", lg: "block" },
              }}
            >
              <AdBanner variant="vertical" />
            </Box>
          )}

          {/* Conditional Content Based on URL */}
          {isAdDetailPage ? (
            <Box sx={{ pr: { lg: "120px" } }}>
              {" "}
              {/* Right padding for banner space */}
              <AdDetail />
            </Box>
          ) : location.pathname === "/sustainability" ? (
            <Sustainability />
          ) : location.pathname === "/kullanim-kosullari" ? (
            <KullanimKosullari />
          ) : location.pathname === "/kisisel-verilerin-korunmasi" ? (
            <KisiselVeriler />
          ) : location.pathname === "/cerez-yonetimi" ? (
            <CerezYonetimi />
          ) : location.pathname === "/contact" ? (
            <ContactPage />
          ) : location.pathname === "/about" ? (
            <AboutPage />
          ) : location.pathname === "/profile" && isAuthenticated ? (
            <Profile />
          ) : location.pathname === "/my-ads" && isAuthenticated ? (
            <MyAds />
          ) : location.pathname === "/doping" && isAuthenticated ? (
            <Doping />
          ) : location.pathname === "/messages" && isAuthenticated ? (
            <MessagesPage />
          ) : location.pathname === "/complaints" && isAuthenticated ? (
            <Complaints />
          ) : location.pathname === "/store" && isAuthenticated ? (
            <Dukkanim />
          ) : location.pathname === "/bookmarks" && isAuthenticated ? (
            renderBookmarksContent()
          ) : (
            <>
              {/* Page Title and Filters */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    mb: 2,
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                  }}
                >
                  {/* Left side: Title + Search - Centered */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      flex: 1,
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: "600",
                        color: "#dc3545",
                        fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedCategory && selectedCategory !== "Tüm İlanlar"
                        ? categories.find(
                            (cat) => cat.slug === selectedCategory
                          )?.name || selectedCategory
                        : t("homePage.showcase")}
                    </Typography>{" "}
                    {/* Universal Search Box */}
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={t("homePage.searchBarPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "#D34237" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        maxWidth: { xs: "100%", sm: 400, md: 500 },
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: 3,
                          fontSize: "0.9rem",
                          height: 40,
                          transition: "all 0.3s ease",
                          border: "2px solid #e0e0e0",
                          "&:hover": {
                            backgroundColor: "white",
                            borderColor: "#D34237",
                            boxShadow: "0 2px 8px rgba(211, 66, 55, 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "white",
                            borderColor: "#D34237",
                            boxShadow: "0 4px 12px rgba(211, 66, 55, 0.2)",
                          },
                          "& fieldset": {
                            border: "none",
                          },
                        },
                        "& .MuiInputBase-input": {
                          padding: "8px 12px",
                          fontSize: "0.9rem",
                          color: "#333",
                          "&::placeholder": {
                            color: "#666",
                            opacity: 0.8,
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Search Results Info */}
                {searchTerm.trim() && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: "rgba(211, 66, 55, 0.05)",
                      borderRadius: 2,
                      border: "1px solid rgba(211, 66, 55, 0.2)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#D34237",
                        fontWeight: 500,
                      }}
                    >
                      📍 "{searchTerm}" {t("homePage.searchResultsFor")}{" "}
                      {Array.isArray(filteredAds) ? filteredAds.length : 0}{" "}
                      {t("homePage.resultsFound")}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Seller Type Filter Tabs - Sadece kategori seçildiğinde göster */}
              {selectedCategory && selectedCategory !== "Tüm İlanlar" && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      borderBottom: "1px solid #e0e0e0",
                      backgroundColor: "white",
                      borderRadius: "8px 8px 0 0",
                      overflow: "hidden",
                    }}
                  >
                    {[
                      { key: "all", label: "Tümü" },
                      { key: "individual", label: "Üyeden" },
                      { key: "trader", label: "Esnaftan" },
                      { key: "corporate", label: "Kurumdan" },
                    ].map((option) => (
                      <Button
                        key={option.key}
                        onClick={() => setSelectedSellerType(option.key)}
                        sx={{
                          flex: 1,
                          py: 1.5,
                          px: 2,
                          borderRadius: 0,
                          borderBottom:
                            selectedSellerType === option.key
                              ? "2px solid #D34237"
                              : "2px solid transparent",
                          backgroundColor:
                            selectedSellerType === option.key
                              ? "rgba(211, 66, 55, 0.05)"
                              : "transparent",
                          color:
                            selectedSellerType === option.key
                              ? "#D34237"
                              : "#666",
                          fontWeight:
                            selectedSellerType === option.key ? 600 : 400,
                          "&:hover": {
                            backgroundColor: "rgba(211, 66, 55, 0.05)",
                            color: "#D34237",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Conditional Rendering: Grid for "Tüm İlanlar", List for categories */}
              {!selectedCategory || selectedCategory === "Tüm İlanlar" ? (
                <>
                  {/* Grid View for All Ads */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)", // Mobile: 2 sütun
                        sm: "repeat(3, 1fr)", // Small tablet: 3 sütun
                        md: "repeat(4, 1fr)", // Medium: 4 sütun
                        lg: "repeat(6, 1fr)", // Large: 6 sütun
                        xl: "repeat(6, 1fr)", // Extra Large: 6 sütun
                      },
                      gap: { xs: 1, sm: 1.5, md: 2 },
                      width: "100%",
                    }}
                  >
                    {!Array.isArray(filteredAds) ? (
                      // ⚡ SKELETON LOADING - Anında görsel feedback (20 ilan)
                      <>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(
                          (i) => (
                            <Card
                              key={`skeleton-${i}`}
                              className="skeleton-pulse"
                              sx={{
                                borderRadius: 1,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                cursor: "default",
                                height: 220,
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "#f5f5f5",
                              }}
                            >
                              <Box
                                sx={{
                                  height: 120,
                                  backgroundColor: "#e0e0e0",
                                  borderRadius: "4px 4px 0 0",
                                }}
                              />
                              <Box sx={{ p: 1, flex: 1 }}>
                                <Box
                                  sx={{
                                    height: 16,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                    mb: 1,
                                  }}
                                />
                                <Box
                                  sx={{
                                    height: 14,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                    mb: 1,
                                    width: "70%",
                                  }}
                                />
                                <Box
                                  sx={{
                                    height: 14,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                    width: "50%",
                                  }}
                                />
                              </Box>
                            </Card>
                          )
                        )}
                      </>
                    ) : filteredAds.length === 0 ? (
                      <Typography>Henüz ilan bulunmuyor.</Typography>
                    ) : (
                      filteredAds.map((ad) => (
                        <Card
                          key={ad.id}
                          onClick={() => {
                            console.log(
                              "Card clicked, navigating to:",
                              `/ad/${ad.id}`
                            );
                            navigate(`/ad/${ad.id}`);
                          }}
                          sx={{
                            borderRadius: 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            height: isMobile ? 200 : 235,
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(211, 66, 55, 0.15)",
                              backgroundColor: "rgba(211, 66, 55, 0.02)",
                              transform: "translateY(-2px)",
                              borderColor: "rgba(211, 66, 55, 0.3)",
                            },
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            width: "100%",
                            backgroundColor: "white",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          {/* Vitrin Görseli */}
                          <Box
                            component="div"
                            sx={{
                              height: isMobile ? 100 : 120,
                              backgroundColor: "#f8f9fa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              overflow: "hidden",
                              padding: isMobile ? "4px" : "8px",
                            }}
                          >
                            {getImageUrl(ad.images) ? (
                              <LazyImage
                                src={getImageUrl(ad.images)!}
                                alt={ad.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                                placeholder="/placeholder-image.jpg"
                              />
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  color: "#999",
                                }}
                              >
                                <LocalShipping sx={{ fontSize: 24, mb: 0.5 }} />
                                <Typography variant="caption" fontSize="10px">
                                  Görsel Yok
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Box
                            sx={{
                              p: isMobile ? 1 : 1.5,
                              display: "flex",
                              flexDirection: "column",
                              position: "relative",
                              height: "auto",
                            }}
                          >
                            {/* İlan Başlığı */}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: isMobile ? "11px" : "13px",
                                color: "#333",
                                lineHeight: 1.3,
                                mb: 1,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                minHeight: isMobile ? "28px" : "32px",
                              }}
                            >
                              {ad.title}
                            </Typography>

                            {/* Konum ve Model Yılı - Alt alta */}
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: isMobile ? "10px" : "12px",
                                  color: "#666",
                                  display: "block",
                                }}
                              >
                                {ad.city?.name ||
                                  ad.district?.name ||
                                  "Belirtilmemiş"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: isMobile ? "10px" : "12px",
                                  color: "#666",
                                  display: "block",
                                }}
                              >
                                {ad.year
                                  ? `Model Yılı: ${ad.year}`
                                  : ad.model?.name || ad.brand?.name || "Model"}
                              </Typography>
                            </Box>

                            {/* Fiyat - Sağ Alt Köşe */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                right: 14,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: isMobile ? "12px" : "14px",
                                  color: "#dc3545",
                                }}
                              >
                                {ad.price
                                  ? `${formatPrice(ad.price)} TL`
                                  : "Fiyat Yok"}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      ))
                    )}
                  </Box>

                  {/* Pagination for Grid View */}
                  {totalPages > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                        mb: 2,
                      }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => handlePageChange(page)}
                        variant="outlined"
                        shape="rounded"
                        size="large"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            borderColor: "#dc3545",
                            color: "#dc3545",
                            "&:hover": {
                              backgroundColor: "#fdeaea",
                              borderColor: "#dc3545",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "#dc3545",
                              color: "white",
                              borderColor: "#dc3545",
                              "&:hover": {
                                backgroundColor: "#c82333",
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <>
                  {/* List View for Category Selection */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    {/* List Header */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 2,
                        alignItems: "center",
                        fontWeight: 600,
                        fontSize: "12px",
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      <Box sx={{ width: 120, mr: 2, flexShrink: 0 }}>
                        Görsel
                      </Box>
                      <Box sx={{ width: 120, mr: 2, flexShrink: 0 }}>Model</Box>
                      <Box sx={{ flex: 1, mr: 2 }}>İlan Başlığı</Box>
                      <Box
                        sx={{
                          width: 60,
                          mr: 2,
                          flexShrink: 0,
                          textAlign: "center",
                        }}
                      >
                        Yıl
                      </Box>
                      <Box
                        sx={{
                          width: 80,
                          mr: 2,
                          flexShrink: 0,
                          textAlign: "center",
                        }}
                      >
                        Kilometre
                      </Box>
                      <Box
                        sx={{
                          width: 80,
                          mr: 2,
                          flexShrink: 0,
                          textAlign: "center",
                        }}
                      >
                        Kategori
                      </Box>
                      <Box
                        sx={{
                          width: 100,
                          mr: 2,
                          flexShrink: 0,
                          textAlign: "center",
                        }}
                      >
                        Fiyat
                      </Box>
                      <Box
                        sx={{
                          width: 80,
                          mr: 2,
                          flexShrink: 0,
                          textAlign: "center",
                        }}
                      >
                        Tarih
                      </Box>
                      <Box
                        sx={{ width: 120, flexShrink: 0, textAlign: "center" }}
                      >
                        İl / İlçe
                      </Box>
                    </Box>
                    {(() => {
                      console.log("=== RENDERING ADS ===", {
                        filteredAdsCount: filteredAds.length,
                        totalAdsCount: ads.length,
                        isArray: Array.isArray(filteredAds),
                        firstAd: filteredAds[0],
                      });
                      return null;
                    })()}

                    {!Array.isArray(filteredAds) ? (
                      // ⚡ SKELETON LOADING - Liste görünümü için (20 ilan)
                      <>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(
                          (i) => (
                            <Box
                              key={`skeleton-list-${i}`}
                              className="skeleton-pulse"
                              sx={{
                                display: "flex",
                                borderBottom: "1px solid #e0e0e0",
                                padding: 1.5,
                                backgroundColor: "#f9f9f9",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 80,
                                  height: 60,
                                  backgroundColor: "#e0e0e0",
                                  borderRadius: 1,
                                  mr: 2,
                                }}
                              />
                              <Box sx={{ flex: 1, mr: 2 }}>
                                <Box
                                  sx={{
                                    height: 16,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                    mb: 0.5,
                                  }}
                                />
                                <Box
                                  sx={{
                                    height: 14,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                    width: "60%",
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: 100, mr: 2 }}>
                                <Box
                                  sx={{
                                    height: 14,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: 80, mr: 2 }}>
                                <Box
                                  sx={{
                                    height: 14,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: 80, mr: 2 }}>
                                <Box
                                  sx={{
                                    height: 14,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                  }}
                                />
                              </Box>
                              <Box sx={{ width: 120 }}>
                                <Box
                                  sx={{
                                    height: 14,
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: 1,
                                  }}
                                />
                              </Box>
                            </Box>
                          )
                        )}
                      </>
                    ) : filteredAds.length === 0 ? (
                      <Typography>Henüz ilan bulunmuyor.</Typography>
                    ) : (
                      filteredAds.map((ad) => (
                        <Card
                          key={ad.id}
                          onClick={() => {
                            console.log(
                              "Card clicked (mobile), navigating to:",
                              `/ad/${ad.id}`
                            );
                            navigate(`/ad/${ad.id}`);
                          }}
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            borderRadius: 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            "&:hover": {
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              backgroundColor: "#f8f9fa",
                            },
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                            width: "100%",
                            backgroundColor: "white",
                            border: "1px solid #e0e0e0",
                            mb: 1,
                            p: isMobile ? 1.5 : 2,
                            alignItems: "center",
                          }}
                        >
                          {/* Vitrin Görseli */}
                          <Box
                            sx={{
                              width: isMobile ? 100 : 120,
                              height: isMobile ? 70 : 80,
                              backgroundColor: "#f8f9fa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 1,
                              mr: isMobile ? 1.5 : 2,
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            {getImageUrl(ad.images) ? (
                              <LazyImage
                                src={getImageUrl(ad.images)!}
                                alt={ad.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                placeholder="/placeholder-image.jpg"
                              />
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  color: "#999",
                                }}
                              >
                                <LocalShipping sx={{ fontSize: 20 }} />
                                <Typography variant="caption" fontSize="8px">
                                  Görsel Yok
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Model */}
                          <Box
                            sx={{
                              width: isMobile ? 100 : 120,
                              mr: isMobile ? 1.5 : 2,
                              flexShrink: 0,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: isMobile ? "11px" : "13px",
                                color: "#333",
                              }}
                            >
                              {ad.model?.name || ad.brand?.name || "Model"}
                            </Typography>
                          </Box>

                          {/* İlan Başlığı */}
                          <Box sx={{ flex: 1, mr: isMobile ? 1.5 : 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: isMobile ? "11px" : "13px",
                                color: "#333",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {ad.title}
                            </Typography>
                          </Box>

                          {/* Yıl */}
                          <Box
                            sx={{
                              width: isMobile ? 50 : 60,
                              mr: isMobile ? 1 : 2,
                              flexShrink: 0,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: isMobile ? "10px" : "13px",
                                color: "#333",
                                fontWeight: 500,
                              }}
                            >
                              {ad.year ? `Model Yılı: ${ad.year}` : "---"}
                            </Typography>
                          </Box>

                          {/* Kilometre */}
                          <Box
                            sx={{
                              width: isMobile ? 60 : 80,
                              mr: isMobile ? 1 : 2,
                              flexShrink: 0,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: isMobile ? "10px" : "13px",
                                color: "#333",
                                fontWeight: 500,
                              }}
                            >
                              {ad.mileage
                                ? `${ad.mileage.toLocaleString("tr-TR")} km`
                                : "---"}
                            </Typography>
                          </Box>

                          {/* Kategori */}
                          <Box
                            sx={{
                              width: isMobile ? 60 : 80,
                              mr: isMobile ? 1 : 2,
                              flexShrink: 0,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: isMobile ? "9px" : "12px",
                                color: "#666",
                                fontWeight: 500,
                              }}
                            >
                              {ad.category?.name || "---"}
                            </Typography>
                          </Box>

                          {/* Fiyat */}
                          <Box
                            sx={{
                              width: isMobile ? 80 : 100,
                              mr: isMobile ? 1 : 2,
                              flexShrink: 0,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                fontSize: isMobile ? "11px" : "14px",
                                color: "#dc3545",
                              }}
                            >
                              {ad.price
                                ? `${formatPrice(ad.price)} TL`
                                : "Fiyat Yok"}
                            </Typography>
                          </Box>

                          {/* Tarih */}
                          <Box
                            sx={{
                              width: isMobile ? 60 : 80,
                              mr: isMobile ? 1 : 2,
                              flexShrink: 0,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: isMobile ? "9px" : "11px",
                                color: "#666",
                              }}
                            >
                              {ad.createdAt
                                ? new Date(ad.createdAt).toLocaleDateString(
                                    "tr-TR"
                                  )
                                : "---"}
                            </Typography>
                          </Box>

                          {/* İl/İlçe */}
                          <Box
                            sx={{
                              width: isMobile ? 80 : 120,
                              flexShrink: 0,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: isMobile ? "9px" : "12px",
                                color: "#666",
                                fontWeight: 500,
                              }}
                            >
                              {ad.city?.name || "Belirtilmemiş"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: isMobile ? "8px" : "10px",
                                color: "#999",
                              }}
                            >
                              {ad.district?.name || "---"}
                            </Typography>
                          </Box>
                        </Card>
                      ))
                    )}
                  </Box>

                  {/* Pagination for List View */}
                  {totalPages > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                        mb: 2,
                      }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => handlePageChange(page)}
                        variant="outlined"
                        shape="rounded"
                        size="large"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            borderColor: "#dc3545",
                            color: "#dc3545",
                            "&:hover": {
                              backgroundColor: "#fdeaea",
                              borderColor: "#dc3545",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "#dc3545",
                              color: "white",
                              borderColor: "#dc3545",
                              "&:hover": {
                                backgroundColor: "#c82333",
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          )}
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
    </Box>
  );
};

export default MainLayout;
