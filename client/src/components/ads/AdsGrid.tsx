import React, { useState, useEffect, useCallback } from "react";
import { Box, Card, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatPrice as formatPriceUtil } from "../../utils/formatPrice";
import apiClient from "../../api/client";
import LazyImage from "../common/LazyImage";
import { useSiteSettings } from "../../hooks/useSiteSettings";

interface Ad {
  id: number;
  title: string;
  price: number | null;
  currency?: string;
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
  isExample?: boolean;
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
  const { settings } = useSiteSettings();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("status", "APPROVED");
    params.append("limit", "20"); // ❗ 20 ilan göster
    params.append("minimal", "true"); // ❗ Minimal mode - hızlı yükleme

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
    [buildApiUrl],
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

  // ❗ Admin onayından sonra otomatik yenileme
  useEffect(() => {
    const checkForRefresh = () => {
      const shouldRefresh = localStorage.getItem("refreshHomepage");
      if (shouldRefresh === "true") {
        console.log("🔄 AdsGrid: Admin onayından sonra yenileniyor...");
        loadAds(1, false);
        localStorage.removeItem("refreshHomepage");
      }
    };

    // Sayfa focus olduğunda kontrol et
    const handleFocus = () => checkForRefresh();
    window.addEventListener("focus", handleFocus);

    // İlk yüklemede de kontrol et
    checkForRefresh();

    // Cleanup
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadAds]);

  const getImageUrl = (images?: Ad["images"]) => {
    if (!images || images.length === 0) {
      return "/placeholder-image.jpg";
    }

    const primaryImage = images.find((img) => img.isPrimary);
    const firstImage = primaryImage || images[0];

    // ❗ Base64 resimleri direkt döndür
    if (firstImage.imageUrl.startsWith("data:")) {
      return firstImage.imageUrl;
    }

    // HTTP URL'leri direkt döndür
    if (firstImage.imageUrl.startsWith("http")) {
      return firstImage.imageUrl;
    }

    // Relative path'ler için base URL ekle
    const baseUrl = "http://localhost:5000";
    return `${baseUrl}${firstImage.imageUrl}`;
  };

  const formatPrice = (price: number | null, currency?: string): string => {
    return formatPriceUtil(price, currency || "TRY", "Fiyat Belirtilmemiş");
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
              overflow: "hidden",
              position: "relative",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            {/* ÖRNEKTİR Badge */}
            {ad.isExample && settings.showExampleBadge && (
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: 8, sm: 10 },
                  right: { xs: -30, sm: -26 },
                  backgroundColor: settings.exampleBadgeColor || "#ff5722",
                  color: "white",
                  padding: { xs: "2px 32px", sm: "3px 36px" },
                  fontSize: { xs: "7px", sm: "8px" },
                  fontWeight: "bold",
                  transform: "rotate(45deg)",
                  zIndex: 10,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                }}
              >
                {settings.exampleBadgeText || "ÖRNEKTİR"}
              </Box>
            )}
            {/* İlan Resmi */}
            <Box
              sx={{
                width: "100%",
                height: { xs: 120, sm: 140, md: 160 },
                overflow: "hidden",
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
                  {formatPrice(ad.price, ad.currency)}
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
