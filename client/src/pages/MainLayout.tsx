import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
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
  image?: string;
}

const MainLayout: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes] = await Promise.all([
          apiClient.get<Category[]>("/categories"),
        ]);
        setCategories(categoriesRes.data);

        // Mock ads for now
        setAds([
          {
            id: "1",
            title: "2020 Model Mercedes Actros",
            price: 450000,
            year: 2020,
            createdAt: "2024-01-15",
            owner: "Ahmet Yılmaz",
            phone: "0532 123 45 67",
          },
          {
            id: "2",
            title: "Ford Transit Minibüs",
            price: 180000,
            year: 2019,
            createdAt: "2024-01-14",
            owner: "Mehmet Kaya",
            phone: "0542 987 65 43",
          },
        ]);
      } catch {
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
            name: "Minibüs & Midibüs",
            slug: "minibus-midibus",
            displayOrder: 4,
          },
          { id: "5", name: "Otobüs", slug: "otobus", displayOrder: 5 },
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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Left Sidebar - Categories */}
          <Box sx={{ width: "300px", flexShrink: 0 }}>
            <Card>
              <CardContent>
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
                        "&:hover": {
                          backgroundColor: "#FCE4EC", // Light red hover
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "#D34237" }}>
                        {getCategoryIcon(category.slug)}
                      </ListItemIcon>
                      <ListItemText primary={category.name} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Right Content - Search & Ads */}
          <Box sx={{ flex: 1 }}>
            {/* Search Filter */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
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
                      "&:hover fieldset": {
                        borderColor: "#D34237",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#D34237",
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Ads List */}
            <Box>
              {ads.map((ad) => (
                <Card key={ad.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {/* Left - Image */}
                      <Box sx={{ width: "200px", flexShrink: 0 }}>
                        <CardMedia
                          sx={{
                            height: 150,
                            backgroundColor: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Görsel Yok
                          </Typography>
                        </CardMedia>
                      </Box>

                      {/* Right - Details */}
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 1, color: "#313B4C" }}
                        >
                          {ad.title}
                        </Typography>

                        <Typography
                          variant="h5"
                          sx={{ color: "#D34237", fontWeight: "bold", mb: 1 }}
                        >
                          ₺{ad.price.toLocaleString()}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Model Yılı: {ad.year}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          İlan Tarihi:{" "}
                          {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          İlan Sahibi: {ad.owner} | Tel: {ad.phone}
                        </Typography>

                        {/* Action Button */}
                        <Box sx={{ mt: "auto" }}>
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: "#D34237",
                              "&:hover": {
                                backgroundColor: "#B73429",
                              },
                            }}
                          >
                            Detayları Gör
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default MainLayout;
