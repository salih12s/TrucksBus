import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardActionArea,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import Header from "../layout/Header";

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  iconUrl?: string;
  slug: string;
  parentId?: number;
  children?: Category[];
}

const CategorySelection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/categories");
      console.log("Categories response:", response.data);
      setCategories(response.data as Category[]);
    } catch (err) {
      setError(t("categorySelection.error"));
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategorySelect = (category: Category) => {
    if (category.children && category.children.length > 0) {
      // Alt kategorileri göster
      setSelectedPath([...selectedPath, category]);
      setCategories(category.children);
    } else {
      // Son kategori, marka seçimine git
      navigate(`/categories/${category.slug}/brands`);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Ana kategorilere dön
      setSelectedPath([]);
      fetchCategories();
    } else {
      // Belirli bir seviyeye dön
      const newPath = selectedPath.slice(0, index + 1);
      setSelectedPath(newPath);
      if (newPath.length === 0) {
        fetchCategories();
      } else {
        const lastCategory = newPath[newPath.length - 1];
        setCategories(lastCategory.children || []);
      }
    }
  };

  const getCategoryImage = (category: Category) => {
    // Database'den gelen slug'a göre resim dosyası belirle
    const imageMap: { [key: string]: string } = {
      cekici: "cekici.png",
      dorse: "Dorse.png",
      kamyon: "KamyonKamyonet.png",
      kamyonet: "KamyonKamyonet.png",
      karoser: "karoser-ust-yapi.png",
      minibus: "minibus-midibus.png",
      midibus: "minibus-midibus.png",
      otobus: "otobus.png",
      "oto-kurtarici": "oto-kurtarici-tasiyici.png",
      tasiyici: "oto-kurtarici-tasiyici.png",
      romork: "romork.png",
    };

    // Önce slug'a göre kontrol et
    if (category.slug && imageMap[category.slug]) {
      return `/CategoryImage/${imageMap[category.slug]}`;
    }

    // iconUrl varsa kullan
    if (category.iconUrl) {
      return category.iconUrl;
    }

    // image varsa kullan
    if (category.image) {
      return `/CategoryImage/${category.image}`;
    }

    // Varsayılan
    return `/CategoryImage/cekici.png`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t("categorySelection.loading")}
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Başlık */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#000000" }}
          >
            {t("categorySelection.title")}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t("categorySelection.subtitle")}
          </Typography>
        </Box>

        {/* Breadcrumbs */}
        {selectedPath.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                component="button"
                variant="body1"
                onClick={() => handleBreadcrumbClick(-1)}
                sx={{ textDecoration: "none", cursor: "pointer" }}
              >
                {t("categorySelection.mainCategories")}
              </Link>
              {selectedPath.map((category, index) => (
                <Link
                  key={category.id}
                  component="button"
                  variant="body1"
                  onClick={() => handleBreadcrumbClick(index)}
                  sx={{ textDecoration: "none", cursor: "pointer" }}
                >
                  {category.name}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>
        )}

        {/* Kategori Kartları - 4x4 Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)", // Mobil: 2 sütun
              sm: "repeat(3, 1fr)", // Tablet: 3 sütun
              md: "repeat(4, 1fr)", // Masaüstü: 4 sütun
              lg: "repeat(4, 1fr)", // Büyük masaüstü: 4 sütun
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          {categories.map((category) => (
            <Card
              key={category.id}
              sx={{
                height: { xs: 200, sm: 220, md: 240 },
                position: "relative",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                },
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #e3f2fd",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <CardActionArea
                onClick={() => handleCategorySelect(category)}
                sx={{
                  height: "100%",
                  position: "relative",
                  p: 0,
                }}
              >
                {/* Resim - Tüm Alanı Kaplar */}
                <CardMedia
                  component="img"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                  image={getCategoryImage(category)}
                  alt={category.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/CategoryImage/cekici.png";
                  }}
                />

                {/* Alt Kısım - Yazı Alanı (Resmin Üstünde) */}
                <Box
                  className="category-overlay"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "auto",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    textAlign: "center",
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    pb: { xs: 2, sm: 2.5, md: 3 },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Typography
                    className="category-title"
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      color: "white",
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                      transition: "all 0.3s ease",
                      lineHeight: 1.2,
                      textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        {/* Kategori bulunamadı mesajı */}
        {categories.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {t("categorySelection.noSubcategories")}
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default CategorySelection;
