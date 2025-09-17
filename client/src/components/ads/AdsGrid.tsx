import React, { useState, useEffect, useCallback } from "react";
import { Box, Card, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import LazyImage from "../common/LazyImage";

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

interface AdsGridProps {
  filters?: {
    categoryId?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
    city?: string;
    searchTerm?: string;
  };
}

const AdsGrid: React.FC<AdsGridProps> = React.memo(({ filters = {} }) => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("status", "APPROVED");
    params.append("limit", "12"); // İlk yüklemede daha az ilan

    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.brandId) params.append("brandId", filters.brandId);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.minYear) params.append("minYear", filters.minYear);
    if (filters.maxYear) params.append("maxYear", filters.maxYear);
    if (filters.city) params.append("location", filters.city);
    if (filters.searchTerm) params.append("search", filters.searchTerm);

    return `/ads?${params.toString()}`;
  }, [filters]);

  const loadAds = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (page === 1) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const url = buildApiUrl() + `&page=${page}`;
        console.log("🔄 Loading ads:", url);

        const response = await apiClient.get(url);
        const data = response.data as ApiAdsResponse;

        if (append) {
          setAds((prevAds) => [...prevAds, ...data.ads]);
        } else {
          setAds(data.ads);
          setCurrentPage(1);
        }

        setHasMore(page < data.pagination.pages);
        setCurrentPage(page);

        console.log("✅ Ads loaded:", {
          page,
          adsCount: data.ads.length,
          totalPages: data.pagination.pages,
          hasMore: page < data.pagination.pages,
        });
      } catch (err) {
        console.error("❌ Error loading ads:", err);
        setError("İlanlar yüklenirken bir hata oluştu");
        if (!append) setAds([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildApiUrl]
  );

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadAds(currentPage + 1, true);
    }
  };

  // İlk yükleme ve filtre değişikliklerinde
  useEffect(() => {
    loadAds(1, false);
  }, [loadAds]);

  const getImageUrl = (images?: Ad["images"]) => {
    if (!images || images.length === 0) {
      return "/placeholder-image.jpg";
    }

    const primaryImage = images.find((img) => img.isPrimary);
    const firstImage = primaryImage || images[0];

    if (firstImage.imageUrl.startsWith("http")) {
      return firstImage.imageUrl;
    }

    const baseUrl = "http://localhost:5000";
    return `${baseUrl}${firstImage.imageUrl}`;
  };

  const formatPrice = (price: number | null): string => {
    if (!price) return "Fiyat Belirtilmemiş";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " TL";
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button onClick={() => loadAds(1, false)} variant="outlined">
          Tekrar Dene
        </Button>
      </Box>
    );
  }

  if (ads.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary">
          Henüz ilan bulunmuyor
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
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
        {ads.map((ad) => (
          <Card
            key={ad.id}
            onClick={() => navigate(`/ad/${ad.id}`)}
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 1,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            {/* İlan Resmi */}
            <Box
              sx={{
                width: "100%",
                height: { xs: 120, sm: 140, md: 160 },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <LazyImage
                src={getImageUrl(ad.images)}
                alt={ad.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
                placeholder="/placeholder-image.jpg"
              />
            </Box>

            {/* İlan Bilgileri */}
            <Box sx={{ p: { xs: 1, sm: 1.5 }, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  mb: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ad.title}
              </Typography>

              {ad.price && (
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    mb: 0.5,
                  }}
                >
                  {formatPrice(ad.price)}
                </Typography>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ad.city?.name} • {ad.year}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Load More Button */}
      {hasMore && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outlined"
            size="large"
            sx={{ minWidth: 200 }}
          >
            {loadingMore ? <CircularProgress size={24} /> : "Daha Fazla Yükle"}
          </Button>
        </Box>
      )}

      {/* Sonuç Bilgisi */}
      <Box textAlign="center" mt={2}>
        <Typography variant="caption" color="text.secondary">
          {ads.length} ilan gösteriliyor
          {!hasMore && ads.length > 20 && " • Tüm ilanlar yüklendi"}
        </Typography>
      </Box>
    </Box>
  );
});

export default AdsGrid;
