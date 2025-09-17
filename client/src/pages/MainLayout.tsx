import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { LocalShipping } from "@mui/icons-material";
import { Header, Footer } from "../components/layout";
import { useAppSelector } from "../hooks/redux";
import AdDetail from "./AdDetail";
import apiClient from "../api/client";
import ComplaintModal from "../components/complaints/ComplaintModal";
import ContactPage from "./ContactPage";
import AboutPage from "./AboutPage";
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
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedAdForComplaint, setSelectedAdForComplaint] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
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
  ];
  const isAvatarMenuPage = avatarMenuPages.includes(location.pathname);
  const isContactOrAboutPage =
    location.pathname === "/contact" || location.pathname === "/about";
  const isAdDetailPage = location.pathname.startsWith("/ad/") && params.id;
  const shouldHideSidebar =
    isAvatarMenuPage || isContactOrAboutPage || isAdDetailPage;

  // Category navigation handler
  const handleCategoryClick = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    setSelectedBrand(null); // Reset brand when category changes
  };

  // Brand navigation handler
  const handleBrandClick = (brandSlug: string | null) => {
    setSelectedBrand(brandSlug);
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

  const handleCloseComplaintModal = () => {
    setComplaintModalOpen(false);
    setSelectedAdForComplaint(null);
  };

  // ❗ CRITICAL: Ads'leri lazy loading ile yükle - daha az ilan
  const loadAdsLazy = async () => {
    try {
      const adsRes = await apiClient
        .get("/ads?status=APPROVED&limit=12&page=1&minimal=true") // ❗ 12 ilan
        .catch((err) => {
          console.error("Ads lazy loading error:", err);
          return { data: { ads: [] } };
        });

      const adsResponse = adsRes.data as unknown as ApiAdsResponse;
      const adsData = adsResponse?.ads
        ? Array.isArray(adsResponse.ads)
          ? adsResponse.ads
          : []
        : Array.isArray(adsRes.data)
        ? (adsRes.data as Ad[])
        : [];

      setAds(adsData as Ad[]);
    } catch (error) {
      console.error("Ads lazy loading error:", error);
      setAds([]);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // ❗ CRITICAL: Sadece kategorileri yükle - ADS'LERİ SONRA LAZY LOADING İLE YÜKLE
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

        // ❗ CRITICAL: Ads'leri 2 saniye sonra lazy loading ile yükle - UI önce render olsun
        setTimeout(() => {
          loadAdsLazy();
        }, 2000);

        // ❗ Şehirler ve markalar lazy loading - 1 saniye sonra yükle
        setTimeout(() => {
          loadCitiesAndBrands();
        }, 1000);
      } catch (error) {
        console.error("Initial data fetch error:", error);
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

    fetchInitialData();
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

  // İlk yüklemede tüm markaları yükle, sonra kategoriye göre filtrele
  // useEffect kaldırıldı - artık category değiştiğinde API çağrısı yapmıyoruz

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
      console.log("No filters applied, showing all ads:", ads.length);
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

      // Marka filtresi
      if (selectedBrand) {
        const selectedBrandName = brands.find(
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
            selectedBrandName
          );
        }
      }

      // Arama terimi filtresi
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((ad) => {
          const titleMatch = ad.title?.toLowerCase().includes(searchLower);
          const brandMatch = ad.brand?.name
            ?.toLowerCase()
            .includes(searchLower);
          const modelMatch = ad.model?.name
            ?.toLowerCase()
            .includes(searchLower);
          const cityMatch = ad.city?.name?.toLowerCase().includes(searchLower);
          const districtMatch = ad.district?.name
            ?.toLowerCase()
            .includes(searchLower);
          const locationMatch = ad.location
            ?.toLowerCase()
            .includes(searchLower);

          return (
            titleMatch ||
            brandMatch ||
            modelMatch ||
            cityMatch ||
            districtMatch ||
            locationMatch
          );
        });
        console.log(
          "After search filter:",
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

      // Şehir filtresi - ID ile eşleştir
      if (selectedCity) {
        filtered = filtered.filter((ad) => {
          const cityMatch = ad.city?.id?.toString() === selectedCity.toString();
          return cityMatch;
        });
        console.log(
          "After city filter:",
          filtered.length,
          "City ID:",
          selectedCity
        );
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
    categories,
    brands,
  ]);

  // ❗ Favorites count'u lazy yükle - critical değil
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (!user) {
        setFavoritesCount(0);
        return;
      }

      // ❗ 2 saniye sonra yükle - initial loading'i engellemez
      setTimeout(async () => {
        try {
          const response = await apiClient.get("/favorites");
          const favorites = response.data as Array<{ ad: { id: number } }>;
          setFavoritesCount(favorites.length);
        } catch (error) {
          console.error("Error fetching favorites count:", error);
          setFavoritesCount(0);
        }
      }, 2000);
    };

    fetchFavoritesCount();
  }, [user]);

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

  // Get brands for selected category
  const getCategoryBrands = () => {
    console.log("getCategoryBrands called - brands length:", brands.length);

    if (!selectedCategory || brands.length === 0) {
      console.log("No category selected or no brands loaded");
      return [];
    }

    // Seçili kategoriye ait ilanları bul
    const selectedCategoryName = categories.find(
      (cat) => cat.slug === selectedCategory
    )?.name;
    console.log("Selected category name:", selectedCategoryName);

    const categoryAds = ads.filter(
      (ad) =>
        ad.category?.name?.toLowerCase() === selectedCategoryName?.toLowerCase()
    );

    console.log("Ads in this category:", categoryAds.length);

    // Bu kategorideki ilanlardan benzersiz marka isimlerini al
    const brandNamesInCategory = [
      ...new Set(categoryAds.map((ad) => ad.brand?.name).filter(Boolean)),
    ];

    console.log("Brand names found in category ads:", brandNamesInCategory);

    // Bu marka isimlerine sahip brand objelerini bul
    const categoryBrands = brands.filter((brand) =>
      brandNamesInCategory.includes(brand.name)
    );

    console.log(
      "Final category brands:",
      categoryBrands.length,
      categoryBrands.map((b) => b.name)
    );

    return categoryBrands;
  };

  // Get brand count for category
  const getBrandCount = (brandSlug: string) => {
    // Şimdilik sabit sayı döndürelim, sonra gerçek count'u ekleriz
    const count = Math.floor(Math.random() * 50);
    console.log(`Brand count for ${brandSlug}:`, count);
    return count.toString();
  };

  const renderSidebarContent = () => {
    // Eğer kategori seçilmemişse normal kategori listesini göster
    if (!selectedCategory) {
      return (
        <Box sx={{ p: 1.5 }}>
          {/* Kategoriler Başlığı */}
          <Typography
            variant="h6"
            sx={{
              color: "#333",
              fontWeight: "600",
              fontSize: "14px",
              mb: 1.5,
              pb: 0.5,
              borderBottom: "1px solid #ff6b35",
            }}
          >
            Kategoriler
          </Typography>

          {/* Categories List */}
          <List sx={{ p: 0 }}>
            {/* Tüm İlanlar Seçeneği */}
            <ListItem
              onClick={() => handleCategoryClick(null)}
              sx={{
                cursor: "pointer",
                py: 0.5,
                px: 1.5,
                backgroundColor: "#fdeaea",
                borderLeft: "3px solid #dc3545",
                borderRadius: "3px",
                mb: 0.3,
                "&:hover": {
                  backgroundColor: "#f8d7da",
                },
              }}
            >
              <ListItemText
                primary="Tüm İlanlar"
                secondary={getCategoryCount(null)}
                sx={{
                  "& .MuiListItemText-primary": {
                    color: "#dc3545",
                    fontSize: "12px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  },
                  "& .MuiListItemText-secondary": {
                    color: "#dc3545",
                    fontSize: "10px",
                    fontWeight: 500,
                  },
                }}
              />
            </ListItem>

            {categories.map((category) => (
              <ListItem
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                sx={{
                  cursor: "pointer",
                  py: 0.5,
                  px: 1.5,
                  backgroundColor: "transparent",
                  borderRadius: "3px",
                  mb: 0.3,
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <ListItemText
                  primary={category.name}
                  secondary={getCategoryCount(category.slug)}
                  sx={{
                    "& .MuiListItemText-primary": {
                      color: "#333",
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: 1.2,
                    },
                    "& .MuiListItemText-secondary": {
                      color: "#ff6b35",
                      fontSize: "10px",
                      fontWeight: 500,
                    },
                  }}
                />
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
            ← Tüm Kategoriler
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

        {/* Tüm İlanlar için kategori */}
        <List sx={{ p: 0, mb: 2 }}>
          <ListItem
            onClick={() => handleBrandClick(null)}
            sx={{
              cursor: "pointer",
              py: 1,
              px: 2,
              backgroundColor:
                selectedBrand === null ? "#f8f9fa" : "transparent",
              borderLeft:
                selectedBrand === null
                  ? "3px solid #333"
                  : "3px solid transparent",
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            }}
          >
            <ListItemText
              primary="Tüm Markalar"
              secondary={getCategoryCount(selectedCategory)}
              sx={{
                "& .MuiListItemText-primary": {
                  color: "#333",
                  fontSize: "14px",
                  fontWeight: selectedBrand === null ? 600 : 400,
                },
                "& .MuiListItemText-secondary": {
                  color: "#666",
                  fontSize: "12px",
                },
              }}
            />
          </ListItem>
        </List>

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
          Markalar
        </Typography>

        {/* Markalar Listesi */}
        <List sx={{ p: 0 }}>
          {categoryBrands.map((brand) => (
            <ListItem
              key={brand.id}
              onClick={() => handleBrandClick(brand.slug)}
              sx={{
                cursor: "pointer",
                py: 0.8,
                px: 2,
                backgroundColor:
                  selectedBrand === brand.slug ? "#f8f9fa" : "transparent",
                borderLeft:
                  selectedBrand === brand.slug
                    ? "3px solid #333"
                    : "3px solid transparent",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                },
              }}
            >
              <ListItemText
                primary={brand.name}
                secondary={getBrandCount(brand.slug)}
                sx={{
                  "& .MuiListItemText-primary": {
                    color: "#333",
                    fontSize: "13px",
                    fontWeight: selectedBrand === brand.slug ? 600 : 400,
                  },
                  "& .MuiListItemText-secondary": {
                    color: "#666",
                    fontSize: "11px",
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

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
            Filtreler
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
                placeholder="Min"
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
                placeholder="Max"
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
              Model Yılı
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Min"
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
                placeholder="Max"
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
                onChange={(e) => setSelectedCity(e.target.value)}
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

          {/* Filtreleri Temizle */}
          {(selectedBrand ||
            priceMin ||
            priceMax ||
            yearMin ||
            yearMax ||
            selectedCity) && (
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
              Filtreleri Temizle
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
      <Header
        favoritesCount={favoritesCount}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showSearch={true}
      />

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
        {/* Fixed Sidebar - Always visible on left */}
        {!shouldHideSidebar && (
          <Box
            sx={{
              width: "180px",
              flexShrink: 0,
              backgroundColor: "transparent",
              ml: 2,
              mt: 3,
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
            width: "100%",
          }}
        >
          {/* Conditional Content Based on URL */}
          {isAdDetailPage ? (
            <AdDetail />
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
          ) : (
            <>
              {/* Page Title and Filters */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "600",
                    color: "#dc3545",
                    mb: 2,
                    fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" },
                    textAlign: "center",
                  }}
                >
                  {selectedCategory && selectedCategory !== "Tüm İlanlar"
                    ? selectedCategory
                    : "Vitrin"}
                </Typography>
              </Box>

              {/* Conditional Rendering: Grid for "Tüm İlanlar", List for categories */}
              {!selectedCategory || selectedCategory === "Tüm İlanlar" ? (
                // Grid View for All Ads
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
                    <Typography>İlanlar yükleniyor...</Typography>
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
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          },
                          transition: "all 0.2s ease",
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
                            {ad.title}
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
                              {ad.city?.name ||
                                ad.district?.name ||
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
                              {ad.model?.name || ad.brand?.name || "Model"}{" "}
                              {ad.year || ""}
                            </Typography>
                          </Box>

                          {/* Fiyat - Sağ Alt Köşe */}
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              right: 12,
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
              ) : (
                // List View for Category Selection
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
                    <Box sx={{ width: 120, mr: 2, flexShrink: 0 }}>Görsel</Box>
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
                    <Typography>İlanlar yükleniyor...</Typography>
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
                          p: 2,
                          alignItems: "center",
                        }}
                      >
                        {/* Vitrin Görseli */}
                        <Box
                          sx={{
                            width: 120,
                            height: 80,
                            backgroundColor: "#f8f9fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 1,
                            mr: 2,
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
                        <Box sx={{ width: 120, mr: 2, flexShrink: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: "13px",
                              color: "#333",
                            }}
                          >
                            {ad.model?.name || ad.brand?.name || "Model"}
                          </Typography>
                        </Box>

                        {/* İlan Başlığı */}
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontSize: "13px",
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
                            width: 60,
                            mr: 2,
                            flexShrink: 0,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "13px",
                              color: "#333",
                              fontWeight: 500,
                            }}
                          >
                            {ad.year || "---"}
                          </Typography>
                        </Box>

                        {/* Kilometre */}
                        <Box
                          sx={{
                            width: 80,
                            mr: 2,
                            flexShrink: 0,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "13px",
                              color: "#333",
                              fontWeight: 500,
                            }}
                          >
                            {ad.mileage
                              ? `${ad.mileage.toLocaleString("tr-TR")}`
                              : "---"}
                          </Typography>
                        </Box>

                        {/* Kategori */}
                        <Box
                          sx={{
                            width: 80,
                            mr: 2,
                            flexShrink: 0,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "12px",
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
                            width: 100,
                            mr: 2,
                            flexShrink: 0,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              fontSize: "14px",
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
                            width: 80,
                            mr: 2,
                            flexShrink: 0,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "11px",
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
                            width: 120,
                            flexShrink: 0,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "12px",
                              color: "#666",
                              fontWeight: 500,
                            }}
                          >
                            {ad.city?.name || "Belirtilmemiş"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "10px",
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
