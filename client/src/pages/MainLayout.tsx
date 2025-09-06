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
} from "@mui/material";
import {
  Search,
  LocalShipping,
  DirectionsBus,
  Build,
  Engineering,
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
  id: string;
  title: string;
  price: number;
  year: number;
  createdAt: string;
  owner: string;
  phone: string;
}

const MainLayout: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, adsRes] = await Promise.all([
          apiClient.get("/categories"),
          apiClient.get("/ads"),
        ]);

        // Güvenli veri kontrolü
        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];
        const adsData = Array.isArray(adsRes.data) ? adsRes.data : [];

        setCategories(categoriesData as Category[]);
        setAds(adsData as Ad[]);
      } catch (error) {
        console.error("Data fetch error:", error);
        // Fallback data
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

        setAds([
          {
            id: "1",
            title: "2020 Model Mercedes Actros",
            price: 450000,
            year: 2020,
            createdAt: "15.01.2024",
            owner: "Ahmet Yılmaz",
            phone: "0532 123 45 67",
          },
          {
            id: "2",
            title: "Ford Transit Minibüs",
            price: 180000,
            year: 2019,
            createdAt: "14.01.2024",
            owner: "Mehmet Kaya",
            phone: "0542 987 65 43",
          },
        ]);
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
        }}
      >
        {/* Left Sidebar - Categories */}
        <Box
          sx={{
            width: "300px",
            flexShrink: 0,
            borderRight: "1px solid #e0e0e0",
            backgroundColor: "white",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#313B4C", fontWeight: "bold" }}
            >
              Kategoriler
            </Typography>
            <List sx={{ p: 0 }}>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 1,
                    mb: 0.5,
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#D34237", minWidth: 40 }}>
                    {getCategoryIcon(category.slug)}
                  </ListItemIcon>
                  <ListItemText
                    primary={category.name}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "#313B4C",
                        fontSize: "14px",
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flex: 1.25, p: 3 }}>
          {" "}
          {/* %25 büyütüldü (1'den 1.25'e) */}
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
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
                },
              }}
            />
          </Box>
          {/* Ads Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: 3,
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
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: "14px",
                    }}
                  >
                    Görsel Yok
                  </CardMedia>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "#313B4C",
                        mb: 1,
                        textAlign: "center",
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
                        mb: 2,
                      }}
                    >
                      ₺{ad.price.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", textAlign: "center", mb: 1 }}
                    >
                      Model Yılı: {ad.year}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", textAlign: "center", mb: 1 }}
                    >
                      İlan Tarihi: {ad.createdAt}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", textAlign: "center", mb: 2 }}
                    >
                      İlan Sahibi: {ad.owner} | Tel: {ad.phone}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: "#D34237",
                        color: "white",
                        py: 1,
                        borderRadius: 2,
                        "&:hover": {
                          backgroundColor: "#B73429",
                        },
                      }}
                    >
                      Detayları Gör
                    </Button>
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
