import React, { useEffect, useState } from "react";
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
} from "@mui/icons-material";
import { Header, Footer } from "../components/layout";
import apiClient from "../api/client";

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
  city?: string;
  district?: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
      <Header />

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
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                ? "repeat(auto-fit, minmax(250px, 1fr))"
                : "repeat(auto-fit, minmax(300px, 1fr))",
              gap: isMobile ? 2 : 3,
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
                    height: { xs: "auto", sm: "420px" },
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: { xs: 120, sm: 140, md: 160 },
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: { xs: "12px", sm: "14px" },
                      backgroundImage:
                        ad.images && ad.images.length > 0
                          ? `url(${
                              ad.images.find((img) => img.isPrimary)
                                ?.imageUrl || ad.images[0]?.imageUrl
                            })`
                          : ad.photos && ad.photos.length > 0
                          ? `url(${ad.photos[0]})`
                          : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {(!ad.images || ad.images.length === 0) &&
                      (!ad.photos || ad.photos.length === 0) &&
                      "Görsel Yok"}
                  </CardMedia>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "#313B4C",
                        mb: 1,
                        textAlign: "center",
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        lineHeight: 1.2,
                      }}
                    >
                      {ad.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#D34237",
                        fontWeight: "bold",
                        textAlign: "center",
                        mb: 1,
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      }}
                    >
                      ₺{ad.price ? ad.price.toLocaleString() : "Belirtilmemiş"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        textAlign: "center",
                        mb: 0.5,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      📍 {ad.city || "İstanbul"}, {ad.district || "Beylikdüzü"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        textAlign: "center",
                        mb: 0.5,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      Model Yılı: {ad.year || "Belirtilmemiş"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        textAlign: "center",
                        mb: 1,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      İlan Tarihi:{" "}
                      {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        textAlign: "center",
                        mb: 2,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        wordWrap: "break-word",
                      }}
                    >
                      {ad.user.firstName} {ad.user.lastName}
                    </Typography>

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
                        sx={{
                          backgroundColor: "#D34237",
                          color: "white",
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          "&:hover": {
                            backgroundColor: "#B73429",
                          },
                        }}
                      >
                        Detayları Gör
                      </Button>

                      {/* Eğer kullanıcının kendi ilanı değilse bu butonları göster */}
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            fontSize: { xs: "0.6rem", sm: "0.65rem" },
                            py: 0.3,
                            borderColor: "#D34237",
                            color: "#D34237",
                            "&:hover": {
                              borderColor: "#B73429",
                              backgroundColor: "rgba(211, 66, 55, 0.1)",
                            },
                          }}
                        >
                          Mesaj At
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            fontSize: { xs: "0.6rem", sm: "0.65rem" },
                            py: 0.3,
                            borderColor: "#666",
                            color: "#666",
                            "&:hover": {
                              borderColor: "#333",
                              backgroundColor: "rgba(102, 102, 102, 0.1)",
                            },
                          }}
                        >
                          Kaydet
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            flex: 1,
                            fontSize: { xs: "0.6rem", sm: "0.65rem" },
                            py: 0.3,
                            borderColor: "#f44336",
                            color: "#f44336",
                            "&:hover": {
                              borderColor: "#d32f2f",
                              backgroundColor: "rgba(244, 67, 54, 0.1)",
                            },
                          }}
                        >
                          Şikayet Et
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
    </Box>
  );
};

export default MainLayout;
