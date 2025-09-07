import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CircularProgress,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  Avatar,
  Button,
} from "@mui/material";
import { Search, ArrowForward } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/api/client";
import Header from "../layout/Header";

interface Variant {
  id: number;
  name: string;
  slug: string;
  specifications?: Record<string, unknown>;
  isActive: boolean;
}

interface Model {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const VariantSelection: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug } = useParams<{
    categorySlug: string;
    brandSlug: string;
    modelSlug: string;
  }>();

  const [variants, setVariants] = useState<Variant[]>([]);
  const [model, setModel] = useState<Model | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category info
      const categoryResponse = await apiClient.get(
        `/categories/${categorySlug}`
      );
      setCategory(categoryResponse.data as Category);

      // Fetch brand info
      const brandResponse = await apiClient.get(`/brands/${brandSlug}`);
      setBrand(brandResponse.data as Brand);

      // Fetch model info
      const modelResponse = await apiClient.get(
        `/brands/${brandSlug}/models/${modelSlug}`
      );
      setModel(modelResponse.data as Model);

      // Fetch variants for this model
      const variantsResponse = await apiClient.get(
        `/categories/${categorySlug}/brands/${brandSlug}/models/${modelSlug}/variants`
      );
      setVariants(variantsResponse.data as Variant[]);
    } catch (err) {
      console.error("Error fetching variants:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [categorySlug, brandSlug, modelSlug]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const filteredVariants = variants.filter((variant) =>
    variant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVariantSelect = (variantSlug: string) => {
    // Tüm kategoriler için özel form sayfasına yönlendir
    navigate(
      `/categories/${categorySlug}/brands/${brandSlug}/models/${modelSlug}/variants/${variantSlug}/create-ad`
    );
  };

  const handleBackToModels = () => {
    navigate(`/categories/${categorySlug}/brands/${brandSlug}/models`);
  };

  const handleBackToBrands = () => {
    navigate(`/categories/${categorySlug}/brands`);
  };

  const handleBackToCategories = () => {
    navigate("/category-selection");
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToCategories}
            sx={{
              textDecoration: "none",
              color: "primary.main",
              cursor: "pointer",
            }}
          >
            Kategoriler
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToBrands}
            sx={{
              textDecoration: "none",
              color: "primary.main",
              cursor: "pointer",
            }}
          >
            {category?.name}
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToModels}
            sx={{
              textDecoration: "none",
              color: "primary.main",
              cursor: "pointer",
            }}
          >
            {brand?.name}
          </Link>
          <Typography color="text.primary">{model?.name}</Typography>
          <Typography color="text.primary">Varyant Seçimi</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            {brand?.logoUrl ? (
              <Avatar
                src={brand.logoUrl}
                alt={brand.name}
                sx={{ width: 56, height: 56, mr: 2 }}
              />
            ) : (
              <Avatar
                sx={{ width: 56, height: 56, mr: 2, bgcolor: "primary.main" }}
              >
                {brand?.name.charAt(0)}
              </Avatar>
            )}
            <Box>
              <Typography variant="h4" component="h1">
                {brand?.name} {model?.name}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Varyant Seçin
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="text.secondary">
            {filteredVariants.length} varyant bulundu
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Varyant ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              mx: "auto",
              display: "block",
            }}
          />
        </Box>

        {/* Variants Grid */}
        {filteredVariants.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery
                ? "Arama kriterlerinize uygun varyant bulunamadı"
                : "Bu model için henüz varyant bulunmuyor"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowForward />}
              onClick={() => handleVariantSelect("generic")}
              sx={{ mt: 2 }}
            >
              Genel Varyant ile Devam Et
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              maxWidth: "1200px",
              mx: "auto",
            }}
          >
            {filteredVariants.map((variant) => (
              <Card
                key={variant.id}
                sx={{
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => handleVariantSelect(variant.slug)}
              >
                <Box sx={{ textAlign: "center", padding: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1976d2",
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                    }}
                  >
                    {variant.name}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default VariantSelection;
