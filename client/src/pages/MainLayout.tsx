import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  CardMedia,
  Button,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LocalShipping } from "@mui/icons-material";
import { Header, Footer } from "../components/layout";
import { useAppSelector } from "../hooks/redux";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
  const shouldHideSidebar = isAvatarMenuPage || isContactOrAboutPage;

  // Category navigation handler
  const handleCategoryClick = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  };

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
    // Sayıyı string'e çevir ve nokta ile ayır
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCloseComplaintModal = () => {
    setComplaintModalOpen(false);
    setSelectedAdForComplaint(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("=== STARTING API CALLS ===");

        const [categoriesRes, adsRes, citiesRes] = await Promise.all([
          apiClient.get("/categories").catch((err) => {
            console.error("Categories API error:", err);
            return { data: [] };
          }),
          apiClient.get("/ads?status=APPROVED").catch((err) => {
            console.error("Ads API error:", err);
            return { data: { ads: [] } };
          }),
          apiClient.get("/cities").catch((err) => {
            console.error("Cities API error:", err);
            return { data: [] };
          }),
        ]);

        console.log("=== RAW API RESPONSES ===");
        console.log("Categories response:", categoriesRes);
        console.log("Ads response:", adsRes);
        console.log("Cities response:", citiesRes);

        // Güvenli veri kontrolü
        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

        // Backend response format: { ads: [], pagination: {} }
        const adsResponse = adsRes.data as unknown as ApiAdsResponse;
        const adsData = adsResponse?.ads
          ? Array.isArray(adsResponse.ads)
            ? adsResponse.ads
            : []
          : Array.isArray(adsRes.data)
          ? (adsRes.data as Ad[])
          : [];

        const citiesData = Array.isArray(citiesRes.data) ? citiesRes.data : [];

        setCategories(categoriesData as Category[]);
        setAds(adsData as Ad[]);
        setCities(citiesData);

        // Debug: Check all fetched data
        console.log("=== API DATA FETCH RESULTS ===");
        console.log("Categories:", categoriesData.length, categoriesData);
        console.log("Ads:", adsData.length, adsData);
        console.log("Cities:", citiesData.length, citiesData);

        if (adsData.length > 0) {
          console.log("First ad sample:", adsData[0]);
          console.log("First ad images:", adsData[0].images);
          console.log("First ad category:", adsData[0].category);
          console.log("First ad brand:", adsData[0].brand);
          console.log("First ad city:", adsData[0].city);
        } else {
          console.warn("No ads found in API response!");
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

  // Gelişmiş filtreleme
  useEffect(() => {
    console.log("Filtering with:", {
      selectedCategory,
      searchTerm,
      priceMin,
      priceMax,
      yearMin,
      yearMax,
      selectedCity,
      totalAds: ads.length,
    });

    if (
      !selectedCategory &&
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
    searchTerm,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    selectedCity,
    categories,
  ]);

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
      } catch (error) {
        console.error("Error fetching favorites count:", error);
        setFavoritesCount(0);
      }
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

  const renderSidebarContent = () => (
    <Box sx={{ p: 2 }}>
      {/* Kategoriler Başlığı */}
      <Typography
        variant="h6"
        sx={{
          color: "#333",
          fontWeight: "normal",
          fontSize: "16px",
          mb: 2,
          pb: 1,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        Kategoriler
      </Typography>

      {/* Categories List - Clean and Simple */}
      <List sx={{ p: 0 }}>
        {/* Tüm İlanlar Seçeneği */}
        <ListItem
          onClick={() => handleCategoryClick(null)}
          sx={{
            cursor: "pointer",
            py: 1.5,
            px: 2,
            backgroundColor:
              selectedCategory === null ? "#f8f9fa" : "transparent",
            borderLeft:
              selectedCategory === null
                ? "3px solid #333"
                : "3px solid transparent",
            "&:hover": {
              backgroundColor: "#f8f9fa",
            },
          }}
        >
          <ListItemText
            primary="Tüm İlanlar"
            secondary={getCategoryCount(null)}
            sx={{
              "& .MuiListItemText-primary": {
                color: "#333",
                fontSize: "15px",
                fontWeight: selectedCategory === null ? 600 : 400,
                lineHeight: 1.2,
              },
              "& .MuiListItemText-secondary": {
                color: "#666",
                fontSize: "13px",
                fontWeight: 400,
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
              py: 1.5,
              px: 2,
              backgroundColor:
                selectedCategory === category.slug ? "#f8f9fa" : "transparent",
              borderLeft:
                selectedCategory === category.slug
                  ? "3px solid #333"
                  : "3px solid transparent",
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            }}
          >
            <ListItemText
              primary={category.name}
              secondary={getCategoryCount(category.slug)}
              sx={{
                "& .MuiListItemText-primary": {
                  color: "#333",
                  fontSize: "15px",
                  fontWeight: selectedCategory === category.slug ? 600 : 400,
                  lineHeight: 1.2,
                },
                "& .MuiListItemText-secondary": {
                  color: "#666",
                  fontSize: "13px",
                  fontWeight: 400,
                },
              }}
            />
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
              width: "280px",
              flexShrink: 0,
              borderRight: "1px solid #e0e0e0",
              backgroundColor: "transparent",
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
          {location.pathname === "/contact" ? (
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
                    fontWeight: "bold",
                    color: "#313B4C",
                    mb: 2,
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  Anasayfa Vitrini
                </Typography>

                {/* Advanced Filters */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr 1fr",
                    },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {/* Price Range */}
                  <TextField
                    size="small"
                    placeholder="Min Fiyat"
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: 1,
                      },
                    }}
                  />
                  <TextField
                    size="small"
                    placeholder="Max Fiyat"
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: 1,
                      },
                    }}
                  />

                  {/* Year Range */}
                  <TextField
                    size="small"
                    placeholder="Min Yıl"
                    type="number"
                    value={yearMin}
                    onChange={(e) => setYearMin(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: 1,
                      },
                    }}
                  />
                  <TextField
                    size="small"
                    placeholder="Max Yıl"
                    type="number"
                    value={yearMax}
                    onChange={(e) => setYearMax(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* City Filter */}
                <Box sx={{ mb: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Şehir Seç</InputLabel>
                    <Select
                      value={selectedCity}
                      label="Şehir Seç"
                      onChange={(e) => setSelectedCity(e.target.value)}
                      sx={{
                        backgroundColor: "white",
                        borderRadius: 1,
                      }}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Clear Filters Button */}
                {(selectedCategory ||
                  searchTerm ||
                  priceMin ||
                  priceMax ||
                  yearMin ||
                  yearMax ||
                  selectedCity) && (
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedCategory("");
                        setSearchTerm("");
                        setPriceMin("");
                        setPriceMax("");
                        setYearMin("");
                        setYearMax("");
                        setSelectedCity("");
                      }}
                      sx={{
                        color: "#D34237",
                        borderColor: "#D34237",
                        "&:hover": {
                          borderColor: "#B12E23",
                          backgroundColor: "rgba(211, 66, 55, 0.04)",
                        },
                      }}
                    >
                      Filtreleri Temizle
                    </Button>
                  </Box>
                )}

                {/* Filter Results Count */}
                <Typography
                  variant="body2"
                  sx={{ color: "#666", textAlign: "center", mb: 2 }}
                >
                  {filteredAds.length} ilan bulundu
                </Typography>
              </Box>

              {/* Ads Grid */}
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
                      <CardMedia
                        component="div"
                        sx={{
                          height: 120,
                          backgroundColor: "#f8f9fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundImage: getImageUrl(ad.images)
                            ? `url(${getImageUrl(ad.images)})`
                            : "none",
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          position: "relative",
                          overflow: "hidden",
                          padding: "8px",
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
                            <LocalShipping sx={{ fontSize: 24, mb: 0.5 }} />
                            <Typography variant="caption" fontSize="10px">
                              Görsel Yok
                            </Typography>
                          </Box>
                        )}
                      </CardMedia>

                      <CardContent
                        sx={{
                          p: 1.5,
                          "&:last-child": { pb: 1.5 },
                          height: "auto",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                        }}
                      >
                        {/* İl ve Model Yılı - Space Between */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "12px", color: "#666" }}
                          >
                            {ad.city?.name || "Belirtilmemiş"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "12px", color: "#666" }}
                          >
                            {ad.year || "---"}
                          </Typography>
                        </Box>

                        {/* İlan Başlığı */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            fontSize: "13px",
                            color: "#333",
                            lineHeight: 1.3,
                            mb: 2,
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
                              color: "#d32f2f",
                            }}
                          >
                            {ad.price
                              ? `${formatPrice(ad.price)} TL`
                              : "Fiyat Yok"}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
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
