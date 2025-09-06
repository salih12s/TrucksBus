import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
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
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/categories");
      console.log("Categories response:", response.data);
      setCategories(response.data as Category[]);
    } catch (err) {
      setError("Kategoriler yüklenirken bir hata oluştu");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    if (category.children && category.children.length > 0) {
      // Alt kategorileri göster
      setSelectedPath([...selectedPath, category]);
      setCategories(category.children);
    } else {
      // Son kategori, ilan oluşturma sayfasına git
      navigate(`/create-ad?category=${category.id}`);
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
            Kategoriler yükleniyor...
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
            Araç Kategorisi Seçin
          </Typography>
          <Typography variant="h6" color="text.secondary">
            İlan vermek istediğiniz araç tipini seçerek devam edin
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
                Ana Kategoriler
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

        {/* Debug - Kategorileri text olarak göster */}
        <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="body2">
            Debug: {categories.length} kategori bulundu
          </Typography>
          {categories.slice(0, 3).map((cat) => (
            <Typography key={cat.id} variant="caption" display="block">
              {cat.id}: {cat.name} - Slug: {cat.slug} - Image:{" "}
              {getCategoryImage(cat)}
            </Typography>
          ))}
        </Box>

        {/* Kategori Kartları - Responsive Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)", // Mobil: 2 sütun
              sm: "repeat(3, 1fr)", // Tablet: 3 sütun
              md: "repeat(4, 1fr)", // Masaüstü: 4 sütun
            },
            gap: 2,
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          {categories.map((category) => (
            <Card
              key={category.id}
              sx={{
                height: 250,
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                },
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid #e0e0e0",
              }}
            >
              <CardActionArea
                onClick={() => handleCategorySelect(category)}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  p: 0,
                }}
              >
                {/* Kategori İsmi - Üstte */}
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f8f9fa",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      color: "#333",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: "1rem",
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>

                {/* Resim Alanı */}
                <Box
                  sx={{
                    flexGrow: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#ffffff",
                    minHeight: 150,
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      maxWidth: "90%",
                      maxHeight: "90%",
                      objectFit: "contain",
                    }}
                    image={getCategoryImage(category)}
                    alt={category.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/CategoryImage/cekici.png";
                      console.log(
                        `Image failed for ${category.name}:`,
                        getCategoryImage(category)
                      );
                    }}
                  />
                </Box>

                {/* Alt bilgi (isteğe bağlı) */}
                {category.description && (
                  <CardContent sx={{ p: 1, pt: 0.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textAlign: "center", display: "block" }}
                    >
                      {category.description}
                    </Typography>
                  </CardContent>
                )}
              </CardActionArea>
            </Card>
          ))}
        </Box>

        {/* Kategori bulunamadı mesajı */}
        {categories.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Bu kategoride alt kategori bulunmuyor.
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default CategorySelection;
