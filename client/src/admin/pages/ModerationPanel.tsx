import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Pagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Collapse,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectedIcon,
  Warning as WarningIcon,
  MonetizationOn as PriceIcon,
  DirectionsCar as CarIcon,
  Refresh,
  TrendingUp,
  TrendingDown,
  Gavel as GavelIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import apiClient from "../../api/client";
import { getTokenFromStorage } from "../../utils/tokenUtils";

interface ModerationAd {
  id: number;
  title: string;
  description?: string;
  status: string;
  price: number;
  currency?: string;
  year?: number;
  mileage?: number;
  createdAt: string;
  moderationNote?: string;
  pendingAdId?: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    phone?: string;
  };
  category: {
    id: number;
    name: string;
    slug?: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  model?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
  images?: {
    id: number;
    imageUrl: string;
    isPrimary?: boolean;
  }[];
}

interface ModerationStats {
  moderation: {
    autoRejected: number;
    manuallyApproved: number;
    pendingReview: number;
  };
  totals: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface InsightData {
  adId: number;
  price: number | null;
  marketData: {
    median: number;
    avg: number;
    min: number;
    max: number;
    sampleSize: number;
  } | null;
  modelPrice: {
    source: "database" | "seed";
    median?: number;
    avg?: number;
    min?: number;
    max?: number;
    avgPrice?: number;
    minPrice?: number;
    maxPrice?: number;
    sampleSize?: number;
  } | null;
  trustData: {
    score: number;
    totalAds: number;
    rejectedAds: number;
    complaints: number;
  } | null;
  deviation: number | null;
}

const ModerationPanel: React.FC = () => {
  const [ads, setAds] = useState<ModerationAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Gelişmiş moderasyon insight state'leri
  const [expandedInsights, setExpandedInsights] = useState<Record<number, boolean>>({});
  const [insightsData, setInsightsData] = useState<Record<number, InsightData | null>>({});
  const [insightsLoading, setInsightsLoading] = useState<Record<number, boolean>>({});
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<ModerationAd | null>(null);
  const [approving, setApproving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  // Fiyat aralığı dışı ilanları getir
  const fetchPriceRejectedAds = useCallback(async () => {
    try {
      setLoading(true);
      const token = getTokenFromStorage();
      if (!token) return;

      const response = await apiClient.get(
        `/ads/admin/moderation/price-rejected?page=${page}&limit=12`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = response.data as {
        ads: ModerationAd[];
        pagination: { pages: number; total: number };
      };
      setAds(data.ads);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Moderasyon ilanları yüklenirken hata:", error);
      setSnackbar({
        open: true,
        message: "Moderasyon ilanları yüklenirken hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Moderasyon istatistiklerini getir
  const fetchStats = useCallback(async () => {
    try {
      const token = getTokenFromStorage();
      if (!token) return;

      const response = await apiClient.get("/ads/admin/moderation/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data as ModerationStats);
    } catch (error) {
      console.error("Moderasyon istatistikleri hatası:", error);
    }
  }, []);

  useEffect(() => {
    fetchPriceRejectedAds();
    fetchStats();
  }, [fetchPriceRejectedAds, fetchStats]);

  // Gelişmiş moderasyon bilgisi getir
  const fetchInsights = async (adId: number) => {
    if (insightsData[adId] !== undefined) return; // Zaten yüklendi
    setInsightsLoading((prev) => ({ ...prev, [adId]: true }));
    try {
      const token = getTokenFromStorage();
      if (!token) return;
      const response = await apiClient.get(
        `/ads/admin/moderation/${adId}/insights`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInsightsData((prev) => ({ ...prev, [adId]: response.data as InsightData }));
    } catch {
      setInsightsData((prev) => ({ ...prev, [adId]: null }));
    } finally {
      setInsightsLoading((prev) => ({ ...prev, [adId]: false }));
    }
  };

  const toggleInsights = (adId: number) => {
    const isExpanding = !expandedInsights[adId];
    setExpandedInsights((prev) => ({ ...prev, [adId]: isExpanding }));
    if (isExpanding) fetchInsights(adId);
  };

  // Manuel onay
  const handleManualApprove = async () => {
    if (!selectedAd) return;
    setApproving(true);
    try {
      const token = getTokenFromStorage();
      await apiClient.put(
        `/ads/admin/moderation/${selectedAd.id}/manual-approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSnackbar({
        open: true,
        message: `İlan #${selectedAd.id} başarıyla onaylandı`,
        severity: "success",
      });
      setApproveDialogOpen(false);
      setSelectedAd(null);
      fetchPriceRejectedAds();
      fetchStats();
    } catch {
      setSnackbar({
        open: true,
        message: "İlan onaylanırken hata oluştu",
        severity: "error",
      });
    } finally {
      setApproving(false);
    }
  };

  const formatPrice = (price: number, currency: string = "TRY") => {
    if (!price) return "-";
    const symbols: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };
    return `${symbols[currency] || "₺"}${price.toLocaleString("tr-TR")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Moderasyon notundan fiyat aralığı bilgisini çıkar
  const parseModerationNote = (note?: string) => {
    if (!note) return null;
    const cleaned = note.replace("[OTOMATİK RED] ", "");
    return cleaned;
  };

  const getAdImage = (ad: ModerationAd) => {
    if (ad.images && ad.images.length > 0) {
      return ad.images[0].imageUrl || null;
    }
    return null;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#313B4C", mb: 1 }}
        >
          🔍 Otomatik Moderasyon
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fiyat aralığı kontrolü ile otomatik reddedilen ilanları yönetin
        </Typography>
      </Box>

      {/* İstatistik Kartları */}
      {stats && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Card
            sx={{
              background: "linear-gradient(135deg, #f44336 0%, #e91e63 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.moderation.autoRejected}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Fiyat Aralığı Dışı
                  </Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.moderation.manuallyApproved}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Manuel Onaylanan
                  </Typography>
                </Box>
                <GavelIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              background: "linear-gradient(135deg, #ff9800 0%, #ffa726 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.totals.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Onay Bekliyor
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              background: "linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {stats.totals.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Otomatik Onaylanan
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Yenile butonu */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          onClick={() => {
            fetchPriceRejectedAds();
            fetchStats();
          }}
          startIcon={<Refresh />}
          variant="outlined"
          size="small"
        >
          Yenile
        </Button>
      </Box>

      {/* İlan Listesi */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : ads.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <ApproveIcon sx={{ fontSize: 48, color: "#4caf50", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Fiyat aralığı dışı ilan bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tüm ilanlar belirlenen fiyat aralığında
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ads.map((ad) => (
            <Card
              key={ad.id}
              sx={{
                border: "1px solid #ffcdd2",
                "&:hover": { boxShadow: "0 4px 20px rgba(244,67,54,0.15)" },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {/* Image */}
                  <Box
                    sx={{
                      width: 120,
                      height: 90,
                      borderRadius: 1,
                      overflow: "hidden",
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getAdImage(ad) ? (
                      <img
                        src={getAdImage(ad)!}
                        alt={ad.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <CarIcon sx={{ fontSize: 36, color: "#ccc" }} />
                    )}
                  </Box>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", fontSize: "15px" }}>
                        {ad.title}
                      </Typography>
                      <Chip
                        icon={<RejectedIcon sx={{ fontSize: 14 }} />}
                        label="Fiyat Aralığı Dışı"
                        color="error"
                        size="small"
                        sx={{ fontWeight: "bold", fontSize: "11px" }}
                      />
                      <Chip
                        label={`#${ad.id}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "11px" }}
                      />
                    </Box>

                    <Box
                      sx={{ display: "flex", gap: 2, mb: 1, flexWrap: "wrap" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        📁 {ad.category?.name || "-"}
                      </Typography>
                      {ad.brand && (
                        <Typography variant="body2" color="text.secondary">
                          🏷️ {ad.brand.name}
                        </Typography>
                      )}
                      {ad.year && (
                        <Typography variant="body2" color="text.secondary">
                          📅 {ad.year}
                        </Typography>
                      )}
                      {ad.city && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {ad.city.name}
                          {ad.district ? `, ${ad.district.name}` : ""}
                        </Typography>
                      )}
                    </Box>

                    {/* Fiyat Bilgisi */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <PriceIcon sx={{ color: "#f44336", fontSize: 20 }} />
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          color: "#f44336",
                        }}
                      >
                        {formatPrice(ad.price, ad.currency)}
                      </Typography>
                    </Box>

                    {/* Moderasyon Notu */}
                    {ad.moderationNote && (
                      <Alert
                        severity="warning"
                        sx={{ py: 0, mb: 1, fontSize: "12px" }}
                        icon={<WarningIcon sx={{ fontSize: 18 }} />}
                      >
                        {parseModerationNote(ad.moderationNote)}
                      </Alert>
                    )}

                    {/* Kullanıcı Bilgisi */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 11,
                          bgcolor: "#1976d2",
                        }}
                      >
                        {ad.user.firstName?.[0] || "?"}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {ad.user.companyName ||
                          `${ad.user.firstName} ${ad.user.lastName}`}
                        {" · "}
                        {ad.user.email}
                        {" · "}
                        {formatDate(ad.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexDirection: "column" }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => {
                        setSelectedAd(ad);
                        setApproveDialogOpen(true);
                      }}
                      size="small"
                      sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                    >
                      Manuel Onayla
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={expandedInsights[ad.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => toggleInsights(ad.id)}
                      sx={{ whiteSpace: "nowrap", fontSize: "11px" }}
                    >
                      {expandedInsights[ad.id] ? "Kapat" : "Piyasa Analizi"}
                    </Button>
                  </Box>
                </Box>

                {/* Gelişmiş Moderasyon Insight Paneli */}
                <Collapse in={expandedInsights[ad.id]}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #e0e0e0" }}>
                    {insightsLoading[ad.id] ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">Piyasa verisi yükleniyor...</Typography>
                      </Box>
                    ) : insightsData[ad.id] ? (
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
                        {/* Model Bazlı Fiyat */}
                        {insightsData[ad.id]!.modelPrice ? (
                          <Paper sx={{ p: 1.5, bgcolor: "#e8f5e9", border: "1px solid #a5d6a7" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                              <AnalyticsIcon sx={{ fontSize: 16, color: "#2e7d32" }} />
                              <Typography variant="body2" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                                Model Fiyatı ({insightsData[ad.id]!.modelPrice!.source === "database" ? `DB: ${insightsData[ad.id]!.modelPrice!.sampleSize || 0} ilan` : "Seed"})
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                              {insightsData[ad.id]!.modelPrice!.source === "database" ? (
                                <>
                                  <Typography variant="body2">
                                    Medyan: <strong>{(insightsData[ad.id]!.modelPrice!.median || 0).toLocaleString("tr-TR")} ₺</strong>
                                  </Typography>
                                  <Typography variant="body2">
                                    Ort: {(insightsData[ad.id]!.modelPrice!.avg || 0).toLocaleString("tr-TR")} ₺
                                  </Typography>
                                  <Typography variant="body2">
                                    {(insightsData[ad.id]!.modelPrice!.min || 0).toLocaleString("tr-TR")} — {(insightsData[ad.id]!.modelPrice!.max || 0).toLocaleString("tr-TR")} ₺
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <Typography variant="body2">
                                    Ort: <strong>{(insightsData[ad.id]!.modelPrice!.avgPrice || 0).toLocaleString("tr-TR")} ₺</strong>
                                  </Typography>
                                  <Typography variant="body2">
                                    {(insightsData[ad.id]!.modelPrice!.minPrice || 0).toLocaleString("tr-TR")} — {(insightsData[ad.id]!.modelPrice!.maxPrice || 0).toLocaleString("tr-TR")} ₺
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Paper>
                        ) : (
                          <Paper sx={{ p: 1.5, bgcolor: "#fff8e1", border: "1px solid #ffe082" }}>
                            <Typography variant="body2" color="text.secondary">
                              🏷️ Model fiyatı bulunamadı
                            </Typography>
                          </Paper>
                        )}

                        {/* Piyasa Verileri */}
                        {insightsData[ad.id]!.marketData ? (
                          <Paper sx={{ p: 1.5, bgcolor: "#f8f9fa", border: "1px solid #e3e8ef" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                              <AnalyticsIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                              <Typography variant="body2" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                                Piyasa Verisi ({insightsData[ad.id]!.marketData!.sampleSize} ilan)
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                              <Typography variant="body2">
                                Medyan: <strong>{insightsData[ad.id]!.marketData!.median.toLocaleString("tr-TR")} ₺</strong>
                              </Typography>
                              <Typography variant="body2">
                                Ortalama: {insightsData[ad.id]!.marketData!.avg.toLocaleString("tr-TR")} ₺
                              </Typography>
                              <Typography variant="body2">
                                Min: {insightsData[ad.id]!.marketData!.min.toLocaleString("tr-TR")} ₺ — Max: {insightsData[ad.id]!.marketData!.max.toLocaleString("tr-TR")} ₺
                              </Typography>
                            </Box>
                          </Paper>
                        ) : (
                          <Paper sx={{ p: 1.5, bgcolor: "#fff8e1", border: "1px solid #ffe082" }}>
                            <Typography variant="body2" color="text.secondary">
                              📊 Piyasa verisi bulunamadı (yeterli ilan yok)
                            </Typography>
                          </Paper>
                        )}

                        {/* Sapma */}
                        <Paper sx={{ p: 1.5, bgcolor: "#f8f9fa", border: "1px solid #e3e8ef" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                            {insightsData[ad.id]!.deviation !== null && insightsData[ad.id]!.deviation !== undefined ? (
                              insightsData[ad.id]!.deviation! > 0 ? (
                                <TrendingUp sx={{ fontSize: 16, color: "#f44336" }} />
                              ) : (
                                <TrendingDown sx={{ fontSize: 16, color: "#ff9800" }} />
                              )
                            ) : (
                              <PriceIcon sx={{ fontSize: 16, color: "#9e9e9e" }} />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                              Fiyat Sapması
                            </Typography>
                          </Box>
                          {insightsData[ad.id]!.deviation !== null && insightsData[ad.id]!.deviation !== undefined ? (
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: Math.abs(insightsData[ad.id]!.deviation!) > 0.5 ? "#f44336"
                                    : Math.abs(insightsData[ad.id]!.deviation!) > 0.3 ? "#ff9800"
                                      : "#4caf50",
                                }}
                              >
                                %{(insightsData[ad.id]!.deviation! * 100).toFixed(1)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {insightsData[ad.id]!.deviation! > 0 ? "piyasa üstünde" : "piyasa altında"}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">Hesaplanamadı</Typography>
                          )}
                        </Paper>

                        {/* Trust Score */}
                        {insightsData[ad.id]!.trustData ? (
                          <Paper sx={{ p: 1.5, bgcolor: "#f8f9fa", border: "1px solid #e3e8ef" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                              <ShieldIcon sx={{
                                fontSize: 16,
                                color: insightsData[ad.id]!.trustData!.score >= 70 ? "#4caf50"
                                  : insightsData[ad.id]!.trustData!.score >= 40 ? "#ff9800"
                                    : "#f44336",
                              }} />
                              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Güven Skoru
                              </Typography>
                            </Box>
                            <Box sx={{ mb: 0.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                {insightsData[ad.id]!.trustData!.score}/100
                              </Typography>
                              <Tooltip title={`Toplam: ${insightsData[ad.id]!.trustData!.totalAds} ilan, Red: ${insightsData[ad.id]!.trustData!.rejectedAds}, Şikayet: ${insightsData[ad.id]!.trustData!.complaints}`}>
                                <LinearProgress
                                  variant="determinate"
                                  value={insightsData[ad.id]!.trustData!.score}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: "#e0e0e0",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: insightsData[ad.id]!.trustData!.score >= 70 ? "#4caf50"
                                        : insightsData[ad.id]!.trustData!.score >= 40 ? "#ff9800"
                                          : "#f44336",
                                    },
                                  }}
                                />
                              </Tooltip>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {insightsData[ad.id]!.trustData!.totalAds} ilan · {insightsData[ad.id]!.trustData!.rejectedAds} red · {insightsData[ad.id]!.trustData!.complaints} şikayet
                            </Typography>
                          </Paper>
                        ) : (
                          <Paper sx={{ p: 1.5, bgcolor: "#fff8e1", border: "1px solid #ffe082" }}>
                            <Typography variant="body2" color="text.secondary">
                              🛡️ Güven skoru hesaplanamadı
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Piyasa verisi yüklenemedi
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Manuel Onay Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <GavelIcon color="primary" />
          Manuel Onay
        </DialogTitle>
        <DialogContent>
          {selectedAd && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Bu ilan otomatik moderasyon tarafından fiyat aralığı dışında
                olduğu için reddedilmiştir. Manuel olarak onaylamak
                istediğinizden emin misiniz?
              </Alert>

              <Paper sx={{ p: 2, bgcolor: "#f5f5f5", mb: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                  {selectedAd.title}
                </Typography>
                <Typography variant="body2">
                  Kategori: {selectedAd.category?.name} · Yıl:{" "}
                  {selectedAd.year || "-"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#f44336", fontWeight: "bold", mt: 1 }}
                >
                  Fiyat: {formatPrice(selectedAd.price, selectedAd.currency)}
                </Typography>
              </Paper>

              {selectedAd.moderationNote && (
                <Alert severity="warning" sx={{ fontSize: "13px" }}>
                  {parseModerationNote(selectedAd.moderationNote)}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={approving}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleManualApprove}
            disabled={approving}
            startIcon={
              approving ? <CircularProgress size={16} /> : <ApproveIcon />
            }
          >
            {approving ? "Onaylanıyor..." : "Onayla ve Yayına Al"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModerationPanel;
