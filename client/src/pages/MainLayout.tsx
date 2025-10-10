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
  const [expandedDorseSubCategory, setExpandedDorseSubCategory] = useState<
    string | null
  >(null);
  const [dorseBrandSearchQuery, setDorseBrandSearchQuery] = useState("");
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

        {/* Dorse kategorisi için özel alt kategoriler */}
        {selectedCategory === "dorse" ? (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                color: "#333",
                fontWeight: "bold",
                fontSize: "14px",
                mb: 1,
              }}
            >
              Alt Kategoriler
            </Typography>

            <List sx={{ p: 0, mb: 2 }}>
              {/* Damperli */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Damperli
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Kapaklı Tip - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "kapakli-tip"
                            ? null
                            : "kapakli-tip"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Kapaklı Tip</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "kapakli-tip" ? "▼" : "▶"}
                      </span>
                    </Typography>

                    {/* Kapaklı Tip Markaları */}
                    {expandedDorseSubCategory === "kapakli-tip" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Acar Treyler",
                            "Adakon Treyler",
                            "ADB Treyler",
                            "Adem Tekin Treyler",
                            "Adem Usta Proohauss",
                            "Adil Sert",
                            "ADS Treyler",
                            "AGS",
                            "AGS Treyler",
                            "Ağır-İş",
                            "Akar Cihat",
                            "Akbaş Treyler",
                            "Akın",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Aldor Trailer",
                            "Alim Dorse",
                            "Ali Rıza Usta",
                            "Alkan Group",
                            "ALM Damper",
                            "Alpaslan Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel Dorse",
                            "Altınordu Treyler",
                            "Anıl Damper",
                            "Arslan",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Batu Treyler",
                            "Belgem",
                            "Beyfem Dorse",
                            "Beytır",
                            "Bio Treyler",
                            "Boydak",
                            "Büyük Yüksel Damper",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Cangül Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Ceylan",
                            "Cey-Treyler",
                            "CNC",
                            "Coşkunlar",
                            "Çakır Dorse",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Çeliksan",
                            "Çimenler",
                            "Çinler Treyler",
                            "Çobanoğlu",
                            "Çuhadar Treyler",
                            "Dark Tech Treyler",
                            "Dekor",
                            "Dentur",
                            "Dereli",
                            "Dereli Hüseyin",
                            "Dorsan",
                            "Doruk Treyler",
                            "Dosa Treyler",
                            "Efe Dorse",
                            "EFK Treyler",
                            "Ekinci Karoser",
                            "Ekol",
                            "Ekrem",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Erbaran",
                            "Erdal Damper",
                            "Erdoğan-Öz Dorse",
                            "Erhan Ünsal Treyler",
                            "Erkan Karoser",
                            "Erkonsan Treyler",
                            "Esatech Trailer",
                            "Eyüp Coşgun",
                            "Ferhat Dorse",
                            "Fesan",
                            "Fors Treyler",
                            "Fruehauf",
                            "FSM Treyler",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülüstän",
                            "Gümüş Treyler",
                            "Güneş",
                            "Güneyşan Treyler Dorse",
                            "Gürkon Trailer",
                            "Gürleşenyıl Treyler",
                            "Güven Makina",
                            "Güzelogulları Damper",
                            "Hacı Ceylan",
                            "Has Trailer",
                            "Hidro Çan",
                            "Hidrosin",
                            "Hürsan",
                            "Hürsan Treyler",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İkikardeş",
                            "İkon Treyler",
                            "İKT Treyler",
                            "İldiz",
                            "İNÇ Seçkinler",
                            "Kaim Kardeşler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Karcı",
                            "Kartallar Damper",
                            "KKT Trailer",
                            "Koluman",
                            "Komodo",
                            "Koneksan",
                            "Konlider",
                            "Konseymak",
                            "Kontir",
                            "Kontürksan",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Kössbohrer",
                            "Krone",
                            "Kuşcuoğlu",
                            "Lider Dekor",
                            "Lider Dorse",
                            "Lider Treyler",
                            "M. Seymak Treyler",
                            "Makinsan",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "MEC Dorse",
                            "Mehmet Aydın",
                            "Mehsan Treyler",
                            "Mektür",
                            "Merve Dorse",
                            "Meshaus Treyler",
                            "Metsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nasuh Can",
                            "Nedex",
                            "Neka",
                            "Nevkarsan",
                            "Nkt Treyler",
                            "Nuh Damper",
                            "Nurak Treyler",
                            "Nursan Dorse",
                            "Nükte Trailer",
                            "Ok Kardeşler",
                            "Oktar Treyler",
                            "OKT Trailer",
                            "Omeksan",
                            "Optimak Treyler",
                            "Ormanlı",
                            "Orthaüs Treyler",
                            "OtoÇinler",
                            "Otto Trailer",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Ö.M.T.",
                            "Ömsan Treyler",
                            "Önder",
                            "Öz Asil",
                            "Özbay Damper",
                            "Özçevik Treyler",
                            "Özdemir",
                            "Özelsan Treyler",
                            "Özenir Osmanlı",
                            "Özgaranti",
                            "Özgül Treyler",
                            "Özkınalılar Damper",
                            "Özmen Damper",
                            "Özmetal",
                            "Özseç",
                            "Öztfn Treyler",
                            "Öztreyler",
                            "ÖzustaÖzünlü",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Polifton Trailer",
                            "Poslu Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Rekor",
                            "Roms Treyler",
                            "SAF Treyler",
                            "Sağlamış",
                            "Sancak Treyler",
                            "Sarıılmaz",
                            "Seçen",
                            "Seçkinler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Sert",
                            "Set Treyler",
                            "Sevinç",
                            "Sevinç Karoser",
                            "Seyit Usta",
                            "Sey-Mak Dorse",
                            "Simboxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "SLK Mertcan Treyler",
                            "Snin Trailer",
                            "Sönmezler",
                            "Starboard",
                            "Star Yağcılar",
                            "Şen San",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Taşkır",
                            "Tecno Tır Treyler",
                            "Tekin Treyler",
                            "Tırsan",
                            "Tirkon",
                            "Traco",
                            "Transfer Treyler",
                            "Tunalar",
                            "Tursan",
                            "Warkas",
                            "Wielton",
                            "Yalımsan Treyler",
                            "Yasin Ateş Treyler",
                            "Yavuz Treyler",
                            "Yeksan Treyler",
                            "Yelsan Treyler",
                            "Yeşil Yol Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Yiğitsan Treyler",
                            "Zafer Dorse",
                            "Zafer Treyler",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/damperli/models/kapakli-tip/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Hafriyat Tipi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "hafriyat-tipi"
                            ? null
                            : "hafriyat-tipi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Hafriyat Tipi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "hafriyat-tipi"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Hafriyat Tipi Markaları */}
                    {expandedDorseSubCategory === "hafriyat-tipi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Adakon Treyler",
                            "ADB Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Alim Dorse",
                            "Alpaslan Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Anıl Damper",
                            "Arslan Damper",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Cey Treyler",
                            "Coşkunlar",
                            "Çakır Şase",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Çavuşoğlu",
                            "Çetin",
                            "Çimenler",
                            "Çobanoğlu",
                            "Doruk Treyler",
                            "Dosa Treyler",
                            "EFK Treyler",
                            "Ekinci Damper",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "EMS Erhan Makina",
                            "Esatech Trailer",
                            "Fesan",
                            "Fors Treyler",
                            "FSM Treyler",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülüstan",
                            "Güneyşan Treyler Dorse",
                            "Haşimoğlu",
                            "Hidro-Has Damper",
                            "Hürsan Treyler",
                            "Iskar Treyler",
                            "İkikardeş",
                            "İkon Treyler",
                            "İNC Seçkinler",
                            "Kaim",
                            "Kalkan Treyler",
                            "KAM",
                            "Karalar Treyler",
                            "KKT Trailer",
                            "Konişmak",
                            "Kontir",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Langendorf",
                            "M. Seymak Treyler",
                            "Makinsan Treyler",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "MEC Dorse",
                            "Mehsan Treyler",
                            "Meiller",
                            "Meshaus Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Neka Treyler",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "OKT Trailer",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Ortaus Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öm-San Treyler",
                            "Özçevik Treyler",
                            "Özenir Osmanlı",
                            "Özgül Treyler",
                            "Öztfn Treyler",
                            "Öztreyler",
                            "Özusta",
                            "Özünlü",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Rekor",
                            "Roms Treyler",
                            "SAF Treyler",
                            "Sağlamış",
                            "Sancak Treyler",
                            "Sarıılmaz",
                            "Seçen",
                            "Seçkinler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Sert Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "SimbOxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tecno Tır Treyler",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yalımsan Treyler",
                            "Yasin Ateş Damper",
                            "Yeksan Treyler",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/damperli/models/hafriyat-tipi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Havuz(Hardox) Tipi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "havuz-hardox-tipi"
                            ? null
                            : "havuz-hardox-tipi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Havuz(Hardox) Tipi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "havuz-hardox-tipi"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Havuz(Hardox) Tipi Markaları */}
                    {expandedDorseSubCategory === "havuz-hardox-tipi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Acar",
                            "Adakon Treyler",
                            "ADB Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Ağır İş",
                            "Akar Cihat",
                            "Akın Dorse",
                            "Akman",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Alim Dorse",
                            "Ali Rıza Usta",
                            "Alkan",
                            "Alpaslan Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel",
                            "Anıl Damper",
                            "Arslan Damper",
                            "ART Trailer",
                            "Asil",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Ayyıldız",
                            "Barış Dorse",
                            "Baysal Damper",
                            "Belgeman",
                            "Beyfem Dorse",
                            "Beysan",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "CEY Treyler",
                            "CNC Dorse",
                            "Coşkunlar",
                            "Çakır",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Çavuşoğlu",
                            "Çeliksan Treyler",
                            "Çimenler Damper",
                            "Çinler Treyler",
                            "Çobanoğlu",
                            "Çuhadar Treyler",
                            "Dekor Damper",
                            "Dereli Hüseyin",
                            "Doğuş",
                            "Dorsan Dorse",
                            "Doruk Treyler",
                            "Dosa Treyler",
                            "EFK Treyler",
                            "Ekinci",
                            "Ekol Dorse",
                            "ELM Treysan Trailer",
                            "Emirsan Trailer",
                            "EMK Treyler",
                            "Erbaran Treyler",
                            "Erkonsan",
                            "Esatech Trailer",
                            "Ferhat Dorse",
                            "Fesan",
                            "Fors Treyler",
                            "FSM Treyler",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülistan",
                            "Gümüş Treyler",
                            "Güneş",
                            "Güneyşan Treyler Dorse",
                            "Güven",
                            "Güven Makina",
                            "Güzeloğulları",
                            "Hacı Ceylan Treyler",
                            "HAS Trailer",
                            "Hidroçan",
                            "Hidro-Has",
                            "Hidrosan",
                            "Hidrosin Damper",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İkikardeş",
                            "İkon Treyler",
                            "İKT Treyler",
                            "İldiz",
                            "İNC Seçkinler",
                            "Kaim Kardeşler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kartallar",
                            "Katmerciler",
                            "Kässbohrer Treyler",
                            "King Treyler",
                            "KKT Trailer",
                            "Koçyiğit Damper",
                            "Koluman",
                            "Kondekor",
                            "Koneksan",
                            "Kontir Treyler",
                            "Kontürksan",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Kuşçuoğlu",
                            "Lider Damper",
                            "M. Seymak Treyler",
                            "Makinsan Treyler",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "MEC Dorse",
                            "Mega Treyler",
                            "Mehmet Aydın Treyler",
                            "Mehsan Treyler",
                            "Meiller",
                            "Merve",
                            "Meshaus Treyler",
                            "Metsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Muratsan Treyler",
                            "Nedex",
                            "Neka Treyler",
                            "Nevanis",
                            "Nevkarsan",
                            "NUH Damper",
                            "Nur-Ak",
                            "Nursan Trailer",
                            "Nükte Trailer",
                            "Odabaşı Damper",
                            "OK Kardeşler",
                            "Oktar Treyler",
                            "OKT Trailer",
                            "Ormanlı Treyler",
                            "Ortaus Treyler",
                            "OtoÇinler",
                            "Otto Trailer",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öm-San Treyler",
                            "ÖMT",
                            "Önder Dorse",
                            "Özasil",
                            "Özbay Treyler",
                            "Özçevik Treyler",
                            "Özdemirsan",
                            "Özelsan",
                            "Özenir Osmanlı",
                            "Özgül",
                            "Özgül Treyler",
                            "Özkınalılar",
                            "Özmak",
                            "Özmen",
                            "Özsan Treyler",
                            "Öztfn Treyler",
                            "Öz Treyler",
                            "Özusta",
                            "Özünlü",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse",
                            "Payas",
                            "Poslu Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Roms Trailer",
                            "SAF Treyler",
                            "Sağlamiş",
                            "Sancak Treyler",
                            "Saran",
                            "Scorpion Trailer",
                            "Seçen Dorse",
                            "Seçkinler",
                            "Seçsan",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Sentinal Trailer",
                            "Seren",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Sert Makina",
                            "Sert Treyler",
                            "Set Treyler",
                            "Sevinç Treyler",
                            "Seyit Usta",
                            "Sey-Mak Dorse",
                            "SimbOxx",
                            "Sim Treyler",
                            "Sistem Damper",
                            "Starboard",
                            "Star Yağcılar",
                            "Şahin Damper",
                            "Şen San Dorse",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tansan",
                            "Taşkır Treyler",
                            "Tecno Tır Treyler",
                            "Tekin Treyler",
                            "Tirkon Treyler",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Tunalar",
                            "Ünsal",
                            "Warkas",
                            "Wielton",
                            "Yağuz Kardeşler",
                            "Yalçınlar",
                            "Yalımsan Treyler",
                            "Yasin Ateş Treyler",
                            "Yavuz Treyler",
                            "Yeksan",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Yiğitsan Treyler",
                            "Zafer Treyler",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/damperli/models/havuz-hardox-tipi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Kaya Tipi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "kaya-tipi"
                            ? null
                            : "kaya-tipi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Kaya Tipi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "kaya-tipi" ? "▼" : "▶"}
                      </span>
                    </Typography>

                    {/* Kaya Tipi Markaları */}
                    {expandedDorseSubCategory === "kaya-tipi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Adakon Treyler",
                            "ADB Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Alim Dorse",
                            "Alpaslan Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel",
                            "Anıl Damper",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Aygurup",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Cey Treyler",
                            "Coşkunlar",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Çavuşoğlu",
                            "Çobanoğlu",
                            "Doruk Treyler",
                            "Dosa Treyler",
                            "EFK Treyler",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Fesan",
                            "Fors Treyler",
                            "FSM Treyler",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülistan",
                            "Güneyşan Treyler Dorse",
                            "Hidrosan",
                            "Iskar Treyler",
                            "İkikardeş",
                            "İkon Treyler",
                            "İKT Treyler",
                            "İNC Seçkinler",
                            "Kaim Kardeşler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kartallar Damper",
                            "KKT Trailer",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Kössbohrer",
                            "Lider Trailer",
                            "M. Seymak Treyler",
                            "Makinsan",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "MEC Dorse",
                            "Mega Treyler",
                            "Mehsan Treyler",
                            "Meshaus Treyler",
                            "Metsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Newmak",
                            "Nurak Treyler",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "OKT Trailer",
                            "Onno",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Ortaus Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Özenir Osmanlı",
                            "Özgül",
                            "Özsan Treyler",
                            "Öztfn Treyler",
                            "Özünlü",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "SAF Treyler",
                            "Sağlamiş",
                            "Sancak Treyler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "SimbOxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tecno Tır Treyler",
                            "Tekin Treyler",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Uğur ES",
                            "Warkas",
                            "Wielton",
                            "Yalımsan Treyler",
                            "Yasin Ateş Damper",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer",
                            "Zafer Treyler",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/damperli/models/kaya-tipi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Lowbed */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Lowbed
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Havuzlu - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "lowbed-havuzlu"
                            ? null
                            : "lowbed-havuzlu"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Havuzlu</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "lowbed-havuzlu"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Havuzlu Markaları */}
                    {expandedDorseSubCategory === "lowbed-havuzlu" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Alim",
                            "Alim Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel",
                            "Altınordu Treyler",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Barış Dorse",
                            "Başkent Dorse",
                            "Belgeman",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Borankay",
                            "Budakoğlu",
                            "Burak Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Ceylan Treyler",
                            "CMK",
                            "Coşkun",
                            "Çavdaroğlu",
                            "Çavuşoğlu",
                            "Çetin Sac",
                            "Çuhadar",
                            "Dorsan",
                            "Doruk Treyler",
                            "EFK Treyler",
                            "ELM Treysan Trailer",
                            "Emirsan Trailer",
                            "EMK Treyler",
                            "Erc Treyler",
                            "Ertuğ",
                            "Esatech Trailer",
                            "Faymonville",
                            "Fesan",
                            "Fors Treyler",
                            "Fruehauf",
                            "FSM",
                            "Global City",
                            "Global City Treyler",
                            "Gülistan",
                            "Güneyşan Treyler Dorse",
                            "Gürler",
                            "Gürleşen Yıl Treyler",
                            "Gvn Trailer",
                            "Hacı Ceylan Treyler",
                            "Hafızoğlu",
                            "HMS",
                            "Hürsan Treyler",
                            "Iskar Treyler",
                            "Iveco",
                            "İhsan Treyler",
                            "İkon Treyler",
                            "İKT Treyler",
                            "İNC Seçkinler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kassbohrer",
                            "KKT Trailer",
                            "Komodo",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "M. Seymak Treyler",
                            "Makinsan",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Mert Treyler",
                            "Meshaus Treyler",
                            "Metsan",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Muratsan Treyler",
                            "Murspeed",
                            "My Trailer",
                            "Nedex",
                            "Neka",
                            "NKT Trailer",
                            "Nursan",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Önder",
                            "Özçevik Dorse",
                            "Özdemirsan",
                            "Özelsan Treyler",
                            "Özen İş Dorse",
                            "Özgül Treyler",
                            "Özmaksan",
                            "Özsan",
                            "Öztfn Treyler",
                            "Öztürk Treyler",
                            "Özünlü",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz",
                            "Scorpion Trailer",
                            "Seçsan Treyler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "SimbOxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "SMH",
                            "Star Yağcılar",
                            "Şahin Damper",
                            "Şahsan",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tırkon Treyler",
                            "Tırsan",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Tuncay İş Dorse",
                            "Warkas",
                            "Wielton",
                            "Yalçın Dorse",
                            "Yalımsan Treyler",
                            "Yelsan Treyler",
                            "Yeşil Yol Treyler",
                            "Yıldızlar Damper",
                            "Yılmaz",
                            "Yüksel Dorse",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/lowbed/models/havuzlu/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Önden Kırmalı - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "lowbed-önden-kırmalı"
                            ? null
                            : "lowbed-önden-kırmalı"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Önden Kırmalı</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "lowbed-önden-kırmalı"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Önden Kırmalı Markaları */}
                    {expandedDorseSubCategory === "lowbed-önden-kırmalı" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Alim Dorse",
                            "ALM Damper",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel Dorse",
                            "Altınordu",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Başkent Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Çavdaroğlu",
                            "Çavuşoğlu",
                            "Çuhadar Treyler",
                            "Doruk Treyler",
                            "EFK Treyler",
                            "ELM Treysan Trailer",
                            "Emirsan Treyler",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Fors Treyler",
                            "Fruehauf",
                            "Global City",
                            "Global City Treyler",
                            "Gülistan",
                            "Gürleşen Yıl Treyler",
                            "Hürsan Treyler",
                            "Iskar Treyler",
                            "İkon Treyler",
                            "İNC Seçkinler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "KKT Trailer",
                            "Komodo",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "M. Seymak Treyler",
                            "Makinsan",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Meshaus Treyler",
                            "Metsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Narin Dorse",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Özdemirsan Treyler",
                            "Özelsan Treyler",
                            "Özgül Treyler",
                            "Özsan Treyler",
                            "Öztfn Treyler",
                            "Öztürk Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serra Treyler",
                            "Serin Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "SimbOxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Şahin Damper",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tırsan",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Tuğ-San",
                            "Warkas",
                            "Wielton",
                            "Yalçın Dorse",
                            "Yalımsan Treyler",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yol Bak",
                            "Yüksel Dorse",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/lowbed/models/önden-kırmalı/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Kuruyük */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Kuruyük
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Kapaklı - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "kuruyuk-kapaklı"
                            ? null
                            : "kuruyuk-kapaklı"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Kapaklı</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "kuruyuk-kapaklı"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Kapaklı Markaları */}
                    {expandedDorseSubCategory === "kuruyuk-kapaklı" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Acar Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "Adil Sert",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "AKY",
                            "Akyel Treyler",
                            "Alamen",
                            "Aldor Treyler",
                            "Alfa Treyler",
                            "Alim Dorse",
                            "Ali Rıza Usta",
                            "Alka Group",
                            "Alkan Treyler",
                            "Alpaslan Treyler",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel Dorse",
                            "Altınışık",
                            "Altınordu",
                            "Andıç",
                            "Arslan",
                            "ART Trailer",
                            "Asil Treyler",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aybaba Dorse",
                            "Aydeniz",
                            "Aydeniz Dorse",
                            "Aydın Treyler",
                            "Baran Dorse",
                            "Barış Dorse",
                            "Berkefe Treyler",
                            "Beyfem Dorse",
                            "Beysan Treyler",
                            "Bio Treyler",
                            "Bozlar",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Cangül Treyler",
                            "Can Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Ceylan Treyler",
                            "Ceytreyler",
                            "CNC Dorse",
                            "Coşkun",
                            "Coşkunlar",
                            "Çakır Dorse",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Çavuşoğlu Damper",
                            "Çinler",
                            "Çinler Treyler",
                            "Çoşgun Dorse",
                            "Çuhadar Treyler",
                            "Dark Tech Treyler",
                            "Dekor Damper",
                            "Demircan Treyler",
                            "Dentir Dorse",
                            "Dere Dorse",
                            "Dereli Hüseyin",
                            "Doğan",
                            "Doğuş Treyler",
                            "Doruk Treyler",
                            "Efe Treyler",
                            "EFK Treyler",
                            "Ekincİ",
                            "Ekol Dorse",
                            "Ekrem Treyler",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Erbaran Treyler",
                            "Eren Dorse",
                            "Erkan",
                            "Erkonsan",
                            "Erol İnce Treyler",
                            "Esatech Trailer",
                            "Eşmeliler",
                            "Ferhat Dorse",
                            "Fesan Makina",
                            "Fors Treyler",
                            "Fruehauf",
                            "FSM",
                            "Gani Şahan Treyler",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gökmenoğlu Karoser",
                            "Groenewegen",
                            "Gülistan",
                            "Gümüş Damper",
                            "Güneş",
                            "Güneyşan Treyler Dorse",
                            "Güreloğlu Dorse",
                            "Güveneller",
                            "Güven TIR",
                            "Hacı Ceylan",
                            "Han Trailer",
                            "Hastrailer",
                            "Hürsan",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İKA Treyler",
                            "İkikardeş",
                            "İkon Treyler",
                            "İldis",
                            "İNC Seçkinler",
                            "İşkar Dorse",
                            "Kalkan",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kartallar",
                            "Kässbohrer",
                            "KKT Trailer",
                            "Koluman",
                            "Kondekor",
                            "Koneksan",
                            "Konseymak Treyler",
                            "Kontir Dorse",
                            "Kontürkşan Dorse",
                            "Konza",
                            "Konza Trailer",
                            "Kögel",
                            "Krone",
                            "Kuşçuoğlu",
                            "Lider Dorse",
                            "LTF Treyler",
                            "M. Seymak Treyler",
                            "Makinsan",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "MAS Treyler",
                            "MaxTır Treyler",
                            "MAZ",
                            "MEC",
                            "Mehmet Aydın Treyler",
                            "Mehsan Treyler",
                            "Meral",
                            "Merve",
                            "Meshaus Trailer",
                            "Meshaus Treyler",
                            "Metalsan Dorse",
                            "Metsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "Muratsan Treyler",
                            "Narin",
                            "Nedex",
                            "Neka",
                            "NEV",
                            "Nevkarsan",
                            "Nevtirsan",
                            "Nevzat Çelik",
                            "Nurak Treyler",
                            "Nursan Trailer",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Omeksan",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "Oruçlar",
                            "Osmanlı",
                            "OtoÇinler",
                            "Otokar",
                            "Otto Trailer",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Ö.M.T.",
                            "Öm-san",
                            "Önder",
                            "Özbay Damper",
                            "Özçevik Treyler",
                            "Özelsan",
                            "Özenir",
                            "Özenir Dorse",
                            "Özgaranti",
                            "Özgül Treyler",
                            "Özmen Damper & Dorse",
                            "Öztfn Treyler",
                            "Öztreyler",
                            "Öztürk Treyler",
                            "Pacton",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Payas",
                            "Piroğlu Dorse",
                            "Polat",
                            "Polifton",
                            "Poslu Trailer",
                            "Poyraz",
                            "Ram-Kar, Ram Treyler",
                            "Reis",
                            "Reis Treyler",
                            "Roms",
                            "Sağlam-İş Damper",
                            "Sancak Treyler",
                            "Sarılmaz",
                            "Schmitz",
                            "Schwarzmüller",
                            "Scorpion Trailer",
                            "SDS Sönmez Dorse",
                            "Seçen",
                            "Seçkinler",
                            "Seçsan Treyler",
                            "SEG",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Seren Treyler",
                            "Serin Treyler",
                            "Serpin Dorse",
                            "Serra Treyler",
                            "Sert Makina",
                            "Serval Makine",
                            "Set Treyler",
                            "Sevinç Treyler",
                            "Seyit Usta",
                            "Sey-Mak Dorse",
                            "Simboхx",
                            "Simboхx Treyler",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Starboard",
                            "Star Yağcılar",
                            "Şahan Dorse",
                            "Şahin",
                            "Şahsan",
                            "Şah Treyler",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Taşkın",
                            "Taşkır Dorse",
                            "Tecnotır Dorse",
                            "Tekbirsan",
                            "Tirkon",
                            "Tırsan",
                            "Tırser",
                            "Töngeloğlu",
                            "Traco",
                            "Transfer Treyler",
                            "Treymak",
                            "Tuğsan Treyler",
                            "Tuncay İş",
                            "Tursan",
                            "Türmaksан",
                            "Umut Damper",
                            "Usta Treyler",
                            "Valohr",
                            "Warkas",
                            "Wielton",
                            "Yalçın",
                            "Yalımsan Treyler",
                            "Yasin Ateş",
                            "Yavuz Treyler",
                            "Yeksan",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Yiğitsan Treyler",
                            "Zafer Treyler",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/kuruyuk/models/kapaklı/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Kapaklı(Kaya Tipi) - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory ===
                            "kuruyuk-kapaklı-kaya-tipi"
                            ? null
                            : "kuruyuk-kapaklı-kaya-tipi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Kapaklı(Kaya Tipi)</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory ===
                        "kuruyuk-kapaklı-kaya-tipi"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Kapaklı(Kaya Tipi) Markaları */}
                    {expandedDorseSubCategory ===
                      "kuruyuk-kapaklı-kaya-tipi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akın",
                            "Akmanlar Damper",
                            "Alamen",
                            "Aldor Treyler",
                            "Alim Dorse",
                            "Alpaslan Treyler",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel Dorse",
                            "Altınordu",
                            "ART Trailer",
                            "ASY Treyler",
                            "Aydeniz",
                            "Aydeniz Dorse",
                            "Barış Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Cangül Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Ceylan Treyler",
                            "Coşkunlar",
                            "Çakır Karoser",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Çinler Dorse",
                            "Çoşgun Dorse",
                            "Dere Dorse",
                            "Doğan",
                            "Doruk Treyler",
                            "Efe Treyler",
                            "EFK Treyler",
                            "Ekol Dorse",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Erkonsan",
                            "Esatech Trailer",
                            "Eşmeliler Treyler",
                            "Fors Treyler",
                            "Fruehauf",
                            "FSM Treyler",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülistan",
                            "Güneş",
                            "Güneyşan Treyler Dorse",
                            "Güreloğlu Dorse",
                            "Güveneller Dorse",
                            "Hacı Ceylan Treyler",
                            "Hürsan Treyler",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İkikardeş",
                            "İkon Treyler",
                            "İskar Dorse",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kässbohrer",
                            "KKT Trailer",
                            "Koluman",
                            "Konza Trailer",
                            "Kögel",
                            "Krone",
                            "Lider Dorse",
                            "M. Seymak Treyler",
                            "Makinsan",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Meshaus Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Neka Treyler",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Omeksan",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Otokar",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Özçevik Treyler",
                            "Özenir Dorse",
                            "Özgül Treyler",
                            "Özmen Damper & Dorse",
                            "ÖZ Nevkarşan",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Sarıılmaz Makina",
                            "Schmitz",
                            "Seçkinler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Sert Makina",
                            "Set Treyler",
                            "Seyit Usta",
                            "Sey-Mak Dorse",
                            "Simboxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Şahan",
                            "Şahin",
                            "Şen-San",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Taşkır Dorse",
                            "Tırsan",
                            "Tirkon",
                            "Traco",
                            "Transfer Treyler",
                            "Tuğsan Treyler",
                            "Warkas",
                            "Wielton",
                            "Yalımsan Treyler",
                            "Yeksan",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Zafer",
                            "Zafer Treyler",
                            "Zak-San Trailer",
                            "Zarslan",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/kuruyuk/models/kapaklı-kaya-tipi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Kapaksız(Platform) - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory ===
                            "kuruyuk-kapaksız-platform"
                            ? null
                            : "kuruyuk-kapaksız-platform"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Kapaksız(Platform)</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory ===
                        "kuruyuk-kapaksız-platform"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Kapaksız(Platform) Markaları */}
                    {expandedDorseSubCategory ===
                      "kuruyuk-kapaksız-platform" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alim Dorse",
                            "Ali Rıza Usta",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Bartoletti",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangül",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "Coşkunlar",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Doğuş Treyler",
                            "Doruk Treyler",
                            "Efe Treyler",
                            "EFK Treyler",
                            "Ekol",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Fors Treyler",
                            "Fruehauf",
                            "Global City",
                            "Oymak Träger",
                            "Ö.M.T.",
                            "Önder Treyler",
                            "Özenir Treyler",
                            "Özgül Treyler",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Payas",
                            "Poslu",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Sanmak",
                            "Schmitz",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serra Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simboxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tirkon",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yalımsan Treyler",
                            "Yelsan Treyler",
                            "YES Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Zak-San Trailer",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/kuruyuk/models/kapaksız-platform/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Tenteli */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Tenteli
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Pilot - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "tenteli-pilot"
                            ? null
                            : "tenteli-pilot"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Pilot</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "tenteli-pilot"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Pilot Markaları */}
                    {expandedDorseSubCategory === "tenteli-pilot" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Acar Treyler",
                            "Adacan",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "ADT",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akın Dorse",
                            "Akmanlar Damper",
                            "Akyel",
                            "Alamen",
                            "Alim",
                            "Ali Rıza Usta",
                            "Alpaslan Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel",
                            "Altınordu",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Ata Treyler",
                            "Aydeniz",
                            "Bepal",
                            "Beyfem Dorse",
                            "Beysan Treyler",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangül",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "CastroMax Trailers",
                            "CMK Treyler",
                            "Coşkun",
                            "Çarşan",
                            "Çavdaroğlu",
                            "Çavuşoğlu Damper",
                            "Çinler Dorse",
                            "Çuhadar Treyler",
                            "Doğan",
                            "Doğuş Dorse",
                            "Dorsesan",
                            "Doruk Treyler",
                            "DTS Dorse",
                            "EFK Treyler",
                            "Ekol Dorse",
                            "ELM Treysan Trailer",
                            "Erbaran Dorse",
                            "Erdem",
                            "Erd Treyler",
                            "Erkonsan",
                            "Esatech Trailer",
                            "Eşmeliler",
                            "Fors Treyler",
                            "Fruehauf",
                            "FSM",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülistan",
                            "Güneş",
                            "Güneyşan",
                            "Gürel Dorse",
                            "Hastrailer",
                            "Hatsan",
                            "Hicri Ercili",
                            "Humbaur",
                            "Hürsan",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İkiKardeş Dorse",
                            "İkon Treyler",
                            "İNC Seçkinler",
                            "Kalkan Treyler",
                            "Kama Dorse",
                            "Karalar Treyler",
                            "Kassbohrer",
                            "Kelberg",
                            "King",
                            "King Treyler",
                            "Koluman",
                            "Kontir",
                            "Konza Trailer",
                            "Kögel",
                            "Krone",
                            "Kuşçuoğlu",
                            "Lider",
                            "M. Seymak Treyler",
                            "Makinsan",
                            "Margaritelli",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "MaxTır Trailer",
                            "MAZ",
                            "Mehsan Treyler",
                            "Meral Kasa",
                            "Metsan",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Narin",
                            "Nedex",
                            "Neka Treyler",
                            "Nursan",
                            "Nükte Trailer",
                            "OCK",
                            "OK Kardeşler",
                            "Oktar Treyler",
                            "Omeksan",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "Oruçlar Dorse",
                            "OtoÇinler",
                            "Otokar",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Özelsan Treyler",
                            "Özenir",
                            "Özenir Dorse",
                            "Özgül",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Payas",
                            "Pilot",
                            "Poslu Treyler",
                            "Rakhsh",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Sarıılmaz",
                            "Schmitz",
                            "Schmitz Cargobull",
                            "Seçen",
                            "Seçkinler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Sert",
                            "Serval Dorse Makine",
                            "Serval Makine",
                            "Set Treyler",
                            "Seyit Usta",
                            "Seymak",
                            "Simboxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Sönmez",
                            "Starboard",
                            "Star Yağcılar",
                            "Şahin",
                            "Şenşan",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Taşkır",
                            "Temsa",
                            "Tirkon",
                            "Tırsan",
                            "Tırser",
                            "Traco",
                            "Transfer Treyler",
                            "Treysan",
                            "Tuncay İş",
                            "Van Hool",
                            "Warkas",
                            "Wielton",
                            "Yalçın Dorse",
                            "Yalımsan Treyler",
                            "Yeksan Treyler",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Yılteks",
                            "Yiğitsan",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/tenteli/models/pilot/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Midilli - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "tenteli-midilli"
                            ? null
                            : "tenteli-midilli"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Midilli</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "tenteli-midilli"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Midilli Markaları */}
                    {expandedDorseSubCategory === "tenteli-midilli" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Ağaçlı Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınordu",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "Coşgun Dorse",
                            "Çavdaroğlu",
                            "Doruk Treyler",
                            "EFK Treyler",
                            "ELM Treysan Trailer",
                            "Esatech Trailer",
                            "Fliegl",
                            "Fors Treyler",
                            "Fruehauf",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülistan",
                            "Gürel Dorse",
                            "Güreoğlu Dorse",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İkiKardeş Dorse",
                            "İkon Treyler",
                            "İNC Seçkinler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kassbohrer",
                            "King",
                            "Koluman",
                            "Konza Trailer",
                            "Kögel",
                            "Krone",
                            "M. Seymak Treyler",
                            "Margaritelli",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Merttaş Dorse",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Neka Treyler",
                            "Nett",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Serpin",
                            "Serval Dorse Makine",
                            "Serval Makine",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simboxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Sommer",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Taşkır",
                            "Temsa",
                            "Tirkon",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yalımsan Treyler",
                            "Yeksan Treyler",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Yiğitsan",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/tenteli/models/midilli/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Yarımidilli - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "tenteli-yarımidilli"
                            ? null
                            : "tenteli-yarımidilli"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Yarımidilli</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "tenteli-yarımidilli"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Yarımidilli Markaları */}
                    {expandedDorseSubCategory === "tenteli-yarımidilli" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Acar Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alp-Kar",
                            "Alpsan",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier Trailer",
                            "Caselli",
                            "Çavdaroğlu",
                            "Doğuş Treyler",
                            "Doruk Treyler",
                            "EFK Treyler",
                            "ELM Treysan Trailer",
                            "Esatech Trailer",
                            "Fors Treyler",
                            "Fruehauf",
                            "Global City",
                            "Global City Treyler",
                            "Gökhanlar",
                            "Gülistan",
                            "Güreoğlu Dorse",
                            "Güven",
                            "Hürsan Dorse",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İkiKardeş Dorse",
                            "İkon Treyler",
                            "İNC Seçkinler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kassbohrer",
                            "King",
                            "Koluman",
                            "Konza Trailer",
                            "Kögel",
                            "Krone",
                            "M. Seymak Treyler",
                            "Margaritelli",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Maxtır Trailer",
                            "MAZ",
                            "Mehsan Treyler",
                            "Merve",
                            "Meusburger",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Neka Treyler",
                            "Nuri Usta Treyler",
                            "Nursan Trailer",
                            "Nükte Trailer",
                            "Ok Kardeşler",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Özçevik Treyler",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz Cargobull",
                            "Schwarzmüller",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Serval Dorse Makine",
                            "Serval Makine",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simboxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Sommer",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Temsa",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yalımsan Treyler",
                            "Yeksan Treyler",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Yiğitsan",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/tenteli/models/yarımidilli/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Frigofirik */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Frigofirik
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Frigofirik Dorse - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "frigofirik-dorse"
                            ? null
                            : "frigofirik-dorse"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Frigofirik Dorse</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "frigofirik-dorse"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Frigofirik Dorse Markaları */}
                    {expandedDorseSubCategory === "frigofirik-dorse" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adem Usta Proohauss",
                            "AFE Frigo",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Alamen",
                            "Alp-Kar",
                            "Alpsan",
                            "Ariş Dorse",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Belgeman",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "BRF Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Carrier",
                            "Caselli",
                            "CastroMax Trailers",
                            "Chereau",
                            "Çavdaroğlu",
                            "Çinler Dorse",
                            "Doruk Treyler",
                            "Ecofrigo",
                            "EFK Treyler",
                            "ELM Treysan Trailer",
                            "Emre Frigo",
                            "Esatech Trailer",
                            "Fors Treyler",
                            "Fruehauf",
                            "Gencer Kasa",
                            "Global City",
                            "Great Dane Trailer",
                            "Gülistan",
                            "Hastrailer",
                            "Horuzoğlu",
                            "Iskar Treyler",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Karaoğlan",
                            "Kassbohrer",
                            "KKT Trailer",
                            "Koluman",
                            "Kögel Trailer",
                            "Krone",
                            "Lamberet",
                            "Lecinena",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Mert",
                            "Meusburger",
                            "Mobil Treyler",
                            "Modern Karoseri",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Safkar",
                            "Sam Frigo",
                            "Sancak Treyler",
                            "Schmitz",
                            "Schmitz Cargobull",
                            "Schwarzmüller",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "Seymak",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Sommer",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Talson",
                            "Tanı Tır",
                            "Thermo King",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Transfrigo Kasa",
                            "Van Hool",
                            "Warkas",
                            "Wielton",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Yıldız Treyler",
                            "Yiğitsan",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/frigofirik/models/frigofirik-dorse/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Tanker */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Tanker
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Tanker Dorse - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "tanker-dorse"
                            ? null
                            : "tanker-dorse"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Tanker Dorse</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "tanker-dorse"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Tanker Dorse Markaları */}
                    {expandedDorseSubCategory === "tanker-dorse" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Ak Çelik",
                            "Akmanlar Damper",
                            "Akyel",
                            "Akyel Treyler",
                            "Alamen",
                            "Alim Treyler",
                            "Ali Rıza Usta Tanker",
                            "Alpaslan Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Alpsan Treyler",
                            "Altınel",
                            "Altınordu",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Caselli",
                            "CastroMax Trailers",
                            "Ceylan Treyler",
                            "Çavuşoğlu",
                            "Çetin Kardeşler",
                            "Çinler Dorse",
                            "Çuhadar",
                            "Demkar Tanker",
                            "Dentır",
                            "Doğan Yıldız",
                            "Doğru İş",
                            "Doğusan Tanker",
                            "Doruk Treyler",
                            "EFK Treyler",
                            "Ekol",
                            "Emas",
                            "Erbaran",
                            "Erdoğan Öz",
                            "Esatech Trailer",
                            "Ettgas",
                            "Flaş Treyler",
                            "Fors Treyler",
                            "Fruehauf",
                            "Global City",
                            "Global City Treyler",
                            "Gülistan",
                            "Güneysan",
                            "Hendricks",
                            "Hicri Ercili",
                            "Hürsan",
                            "Isısan",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İka Trailer",
                            "İkon Treyler",
                            "İzmit Tanker",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Katmerciler",
                            "Kayalar",
                            "Kässbohrer",
                            "KKT Trailer",
                            "Koluman",
                            "Kontir",
                            "KonturkSan",
                            "Kontürkşan",
                            "Konza Trailer",
                            "Kögel",
                            "Krone",
                            "LTF Treyler",
                            "Makinsan",
                            "Marrka Treyler",
                            "Maskon Treyler",
                            "MAS Trailer",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Merceron",
                            "MimMak",
                            "Mobil Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nevkarsan",
                            "Norvega",
                            "Nursan Trailer",
                            "Nükte Trailer",
                            "Odabaşı Makina",
                            "Oktar Treyler",
                            "OKT Trailer",
                            "OMT",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Otokar",
                            "Oymak Cargomaster",
                            "Oymak Makina",
                            "Oymak Träger",
                            "Özcan",
                            "Özçevik Dorse",
                            "Özelsan",
                            "Özgül Treyler",
                            "Özlem Dorse",
                            "Özmaksan",
                            "Öztfn Treyler",
                            "Öztreyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Pios Mühendislik",
                            "Pişirgen",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Rhino Tank",
                            "Rohr",
                            "Sancak Treyler",
                            "Sarılmaz",
                            "SDS Sönmez Dorse",
                            "Seçen Dorse",
                            "Seçkinler",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "Seymak",
                            "Simak",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sinan",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Şahin Tanker",
                            "Takdir Dorse",
                            "Tansan",
                            "Taşkır",
                            "Teknik Tanker",
                            "Tırsan",
                            "Tirkon",
                            "Tokay",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Tuncay İş",
                            "Uğur Damper",
                            "Ünal",
                            "Ünsal",
                            "Van Hool",
                            "Warkas",
                            "Wielton",
                            "Wolf",
                            "Yasin Ateş Treyler",
                            "Yeksan",
                            "Yelsan Treyler",
                            "Yunus Tanker",
                            "Yüksel Dorse & Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/tanker/models/tanker-dorse/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Silobas */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Silobas
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Silobas Dorse - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "silobas-dorse"
                            ? null
                            : "silobas-dorse"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Silobas Dorse</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "silobas-dorse"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Silobas Dorse Markaları */}
                    {expandedDorseSubCategory === "silobas-dorse" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alim",
                            "Ali Rıza Usta",
                            "Alpsan",
                            "Altınel",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Atılım",
                            "Barlas",
                            "Bepal",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Caselli",
                            "CastroMax Trailers",
                            "Çarsan Treyler",
                            "Çinler Dorse",
                            "ÇTS",
                            "Çuhadar Treyler",
                            "Doğsan",
                            "Dorsan",
                            "Doruk Treyler",
                            "Dosa Treyler",
                            "EFK Treyler",
                            "Efsan Treyler",
                            "Emirhan Treyler",
                            "Emirsan Trailer",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Etem Haşimoğlu",
                            "Expert Trailer",
                            "Fatih Treyler",
                            "Fors Treyler",
                            "Global City",
                            "Gülistan",
                            "Güven Makina",
                            "H&B",
                            "Haşimoğlu Dorse",
                            "Haştarmak Sliobas",
                            "Hesa",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Karalar Treyler",
                            "Kässbohrer",
                            "KKT Trailer",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Krone",
                            "Kuşçuoğlu",
                            "Marrka Treyler",
                            "Maskon Treyler",
                            "MAS Trailer",
                            "MAS Treyler",
                            "Mehsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öztfn Treyler",
                            "Öztreyler",
                            "Paşalar Mehmet Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz",
                            "Seçsan Treyler",
                            "Self Frigo",
                            "Selimhan Silobas",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sinanlı Trailers",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Şen-San",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Taşkın",
                            "Tırsan",
                            "Tirkon",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Tuerk Makina",
                            "Warkas",
                            "Wielton",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/silobas/models/silobas-dorse/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Tekstil */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Tekstil
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Tekstil Dorse - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "tekstil-dorse"
                            ? null
                            : "tekstil-dorse"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Tekstil Dorse</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "tekstil-dorse"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Tekstil Dorse Markaları */}
                    {expandedDorseSubCategory === "tekstil-dorse" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adem Usta Proohauss",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alp-Kar",
                            "Alpsan",
                            "Ariş Dorse",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Bio Treyler",
                            "BRF Treyler",
                            "Can Damper Karoser",
                            "Cangüller Treyler",
                            "Caselli",
                            "CastroMax Trailers",
                            "Çavdaroğlu",
                            "Doruk Treyler",
                            "Esatech Trailer",
                            "Fruehauf",
                            "Global City",
                            "Gülistan",
                            "Iskar Treyler",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Karaoğlan",
                            "Kögel Trailer",
                            "Krone",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mehsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Ormanlı Treyler",
                            "Orthaus Treyler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz",
                            "Seçsan Treyler",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Serra Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Talson",
                            "Tanı Tır",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Transfrigo Kasa",
                            "Warkas",
                            "Wielton",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer",
                            "Zafer Dorse",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/tekstil/models/tekstil-dorse/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>

              {/* Konteyner Taşıyıcı ve Şasi Grubu */}
              <ListItem
                sx={{
                  cursor: "pointer",
                  py: 0.8,
                  px: 1.5,
                  mb: 0.5,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  Konteyner Taşıyıcı & Şasi
                </Typography>
                <Box sx={{ pl: 1, width: "100%" }}>
                  {/* Damper Şasi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "damper-şasi"
                            ? null
                            : "damper-şasi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Damper Şasi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "damper-şasi" ? "▼" : "▶"}
                      </span>
                    </Typography>

                    {/* Damper Şasi Markaları */}
                    {expandedDorseSubCategory === "damper-şasi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alim",
                            "Alp-Kar",
                            "Alpsan",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "CastroMax Trailers",
                            "Doruk Treyler",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Fors Treyler",
                            "Global City",
                            "Gülistan",
                            "Güneyşan",
                            "Hürsan Treyler",
                            "Iskar Treyler",
                            "İki Kardeş",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Karaoğlan",
                            "Kögel Trailer",
                            "Konza Trailer",
                            "Makinsan",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Neka",
                            "Nükte Trailer",
                            "OKT",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Oymak",
                            "Özenir",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz Cargobull",
                            "Self Frigo",
                            "Semitürk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tırsan",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/konteyner-tasiyici-sasi/models/damper-şasi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Kılçık Şasi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "kılçık-şasi"
                            ? null
                            : "kılçık-şasi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Kılçık Şasi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "kılçık-şasi" ? "▼" : "▶"}
                      </span>
                    </Typography>

                    {/* Kılçık Şasi Markaları */}
                    {expandedDorseSubCategory === "kılçık-şasi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Alemdaroğlu",
                            "Alim",
                            "Alkan",
                            "Alpaslan",
                            "Alp-Kar",
                            "Alpsan",
                            "Altın El",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangüll Treyler",
                            "Caselli Treyler",
                            "CastroMax Trailers",
                            "Ceytech",
                            "Coşkun",
                            "Doğuş Dorse",
                            "Doruk Treyler",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Eşmeliler",
                            "Fesan Makina",
                            "Fors Treyler",
                            "Fruehauf",
                            "FSM",
                            "Global City",
                            "Global City Trailer",
                            "Gülistan",
                            "Güneş",
                            "Güneyşan",
                            "Güreoğlu",
                            "Gürleşenyl Treyler",
                            "Güveneller",
                            "Has Treyler",
                            "Hürsan",
                            "Iskar Treyler",
                            "İhsan Treyler",
                            "İki Kardeş",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Kardeşler",
                            "Kartallar",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Krone",
                            "LTF Treyler",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Meral Dorse",
                            "Meshaus Dorse",
                            "Metsan",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Neka",
                            "Nevkarsan",
                            "Nuri Usta Treyler",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "OKT Trailer",
                            "Optimak Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Otokar",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Özenir Dorse",
                            "Özgül Treyler",
                            "Öztfn Treyler",
                            "Öztreyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Payas Dorse",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz Cargobull",
                            "Seçsan Treyler",
                            "Self Frigo",
                            "Semiturk",
                            "Sena Treyler",
                            "Serin Dorse",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Şen–San",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tırsan",
                            "Tirkon",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Tuncay İş",
                            "Warkas",
                            "Wielton",
                            "Yalçın Dorse",
                            "Yeksan",
                            "Yelsan Treyler",
                            "Yıldız",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/konteyner-tasiyici-sasi/models/kılçık-şasi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,–]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Platform Şasi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "platform-şasi"
                            ? null
                            : "platform-şasi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Platform Şasi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "platform-şasi"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Platform Şasi Markaları */}
                    {expandedDorseSubCategory === "platform-şasi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alim",
                            "Alp-Kar",
                            "Alpsan",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Barış Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangül Treyler",
                            "CastroMax Trailers",
                            "Cey Treyler",
                            "Çavuşoğlu",
                            "Doruk Treyler",
                            "Ekol",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Eşmeliler",
                            "Fors Treyler",
                            "Fruehauf",
                            "Global City",
                            "Gülistan",
                            "Gürleşenyl Treyler",
                            "Hacı Ceylan Treyler",
                            "Iskar Treyler",
                            "İki Kardeş",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Maral Trailer",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz Cargobull",
                            "Self Frigo",
                            "Semiturk",
                            "Sena Treyler",
                            "Serin Treyler",
                            "Set Treyler",
                            "Seyit Usta",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Taşkır",
                            "Tırsan",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "YEKSAN",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/konteyner-tasiyici-sasi/models/platform-şasi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Römork Konvantörü(Dolli) - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "romork-konvantoru-dolli"
                            ? null
                            : "romork-konvantoru-dolli"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Römork Konvantörü(Dolli)</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "romork-konvantoru-dolli"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Römork Konvantörü(Dolli) Markaları */}
                    {expandedDorseSubCategory === "romork-konvantoru-dolli" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alim",
                            "Alp-Kar",
                            "Alpsan",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "CastroMax Trailers",
                            "Doruk Treyler",
                            "ELM Treysan Trailer",
                            "Esatech Trailer",
                            "Fors Treyler",
                            "Global City",
                            "Güveneller",
                            "Gülistan",
                            "Iskar Treyler",
                            "İki Kardeş",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz Cargobull",
                            "Self Frigo",
                            "Semiturk",
                            "Sena Treyler",
                            "Set Treyler",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Sommer",
                            "Star Yağcılar",
                            "Şahin Dorse",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/konteyner-tasiyici-sasi/models/romork-konvantoru-dolli/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Tanker Şasi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "tanker-sasi"
                            ? null
                            : "tanker-sasi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Tanker Şasi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "tanker-sasi" ? "▼" : "▶"}
                      </span>
                    </Typography>

                    {/* Tanker Şasi Markaları */}
                    {expandedDorseSubCategory === "tanker-sasi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Alamen",
                            "Alim",
                            "Alp-Kar",
                            "Alpsan",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "CastroMax Trailers",
                            "Doruk Treyler",
                            "Ekol",
                            "Esatech Trailer",
                            "Eşmeliler Treyler",
                            "Fors Treyler",
                            "Fruehauf",
                            "Global City",
                            "Gülistan",
                            "Iskar Treyler",
                            "İki Kardeş",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Sancak Treyler",
                            "Schmitz Cargobull",
                            "Self Frigo",
                            "Semiturk",
                            "Sena Treyler",
                            "Set Treyler",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Şahin Dorse",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tırsan",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/konteyner-tasiyici-sasi/models/tanker-sasi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Uzayabilir Şasi - Genişletilebilir */}
                  <Box>
                    <Typography
                      onClick={() =>
                        setExpandedDorseSubCategory(
                          expandedDorseSubCategory === "uzayabilir-sasi"
                            ? null
                            : "uzayabilir-sasi"
                        )
                      }
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                        py: 0.3,
                        cursor: "pointer",
                        "&:hover": {
                          color: "#1976d2",
                          backgroundColor: "#e3f2fd",
                        },
                        borderRadius: "2px",
                        px: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>• Uzayabilir Şasi</span>
                      <span style={{ fontSize: "10px" }}>
                        {expandedDorseSubCategory === "uzayabilir-sasi"
                          ? "▼"
                          : "▶"}
                      </span>
                    </Typography>

                    {/* Uzayabilir Şasi Markaları */}
                    {expandedDorseSubCategory === "uzayabilir-sasi" && (
                      <Box sx={{ pl: 2, mt: 0.5 }}>
                        {/* Marka Arama Alanı */}
                        <TextField
                          placeholder="Marka ara..."
                          variant="outlined"
                          size="small"
                          value={dorseBrandSearchQuery}
                          onChange={(e) =>
                            setDorseBrandSearchQuery(e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "#666", fontSize: "16px" }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            mb: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              fontSize: "11px",
                              backgroundColor: "#fafafa",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#fff",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                            },
                          }}
                        />

                        {/* Marka Listesi */}
                        <Box sx={{ maxHeight: "180px", overflowY: "auto" }}>
                          {[
                            "Seçiniz",
                            "Abd Treyler",
                            "Adakon Treyler",
                            "Adem Usta Proohauss",
                            "AGS Treyler",
                            "Akar Cihat",
                            "Akmanlar Damper",
                            "Akyel Treyler",
                            "Alamen",
                            "Alim Dorse",
                            "Alp-Kar",
                            "Alpsan",
                            "Altınel",
                            "ART Trailer",
                            "Askan Treyler",
                            "ASY Treyler",
                            "Aydeniz Dorse",
                            "Beyfem Dorse",
                            "Bio Treyler",
                            "Can Damper Karoser",
                            "Cangül Treyler",
                            "CastroMax Trailers",
                            "Derya Treyler",
                            "Doruk Treyler",
                            "ELM Treysan Trailer",
                            "EMK Treyler",
                            "Esatech Trailer",
                            "Eşmeliler Treyler",
                            "Fors Treyler",
                            "Global City",
                            "Gülistan",
                            "Güneş Treyler",
                            "Güneyşan",
                            "Güveneller Dorse",
                            "Hürsan",
                            "Iskar Treyler",
                            "İki Kardeş",
                            "İkon Treyler",
                            "Kalkan Treyler",
                            "Konza Trailer",
                            "Kögel Trailer",
                            "Makinsan Treyler",
                            "Marrka Treyler",
                            "MAS Trailer",
                            "Mas Treyler",
                            "Maxtır Trailer",
                            "Mehsan Treyler",
                            "Mobil Treyler",
                            "MRC Treyler",
                            "MS Muratsan Treyler",
                            "Nedex",
                            "Nükte Trailer",
                            "Oktar Treyler",
                            "Optimak Treyler",
                            "Orthaus Treyler",
                            "OtoÇinler",
                            "Otokar",
                            "Oymak Cargomaster",
                            "Oymak Träger",
                            "Özenir",
                            "Özenir Dorse",
                            "Özgül Treyler",
                            "Öztfn Treyler",
                            "Paşalar Mehmet Treyler",
                            "Paşalar Treyler",
                            "Paşaoğlu Dorse Treyler",
                            "Ram-Kar",
                            "Ram Treyler",
                            "Reis Treyler",
                            "Renders",
                            "Sancak Treyler",
                            "Schmitz Cargobull",
                            "Seyit Usta",
                            "Simbоxx",
                            "Sim Treyler",
                            "Sistem Damper Treyler",
                            "Star Yağcılar",
                            "Takdir Dorse",
                            "Tanı Tır",
                            "Tırsan Treyler",
                            "Töke Makina",
                            "Traco",
                            "Transfer Treyler",
                            "Warkas",
                            "Wielton",
                            "Yelsan Treyler",
                            "Yıldızlar Damper",
                            "Zafer Treyler",
                            "Özel Üretim",
                            "Diğer",
                          ]
                            .filter((brand) =>
                              brand
                                .toLowerCase()
                                .includes(dorseBrandSearchQuery.toLowerCase())
                            )
                            .map((brand) => (
                              <Typography
                                key={brand}
                                onClick={() =>
                                  navigate(
                                    `/categories/dorse/brands/konteyner-tasiyici-sasi/models/uzayabilir-sasi/variants/${brand
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[.()&,]/g, "")}/create-ad`
                                  )
                                }
                                sx={{
                                  color: "#555",
                                  fontSize: "11px",
                                  py: 0.2,
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#1976d2",
                                    backgroundColor: "#e8f4f8",
                                  },
                                  borderRadius: "2px",
                                  px: 0.5,
                                }}
                              >
                                ◦ {brand}
                              </Typography>
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ListItem>
            </List>
          </>
        ) : (
          <>
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
          </>
        )}

        {/* Dorse kategorisi dışındaki kategoriler için marka listesi */}
        {selectedCategory !== "dorse" && (
          <>
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
          </>
        )}

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
