import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Card,
  CircularProgress,
} from "@mui/material";
import {
  LocationOn,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  FavoriteBorder,
  Favorite,
  LocalShipping,
} from "@mui/icons-material";
import { API_BASE_URL } from "../api/client";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import ComplaintModal from "../components/complaints/ComplaintModal";
import LazyImage from "../components/common/LazyImage"; // ❗ LazyImage import
import {
  checkFavorite,
  addToFavorites,
  removeFromFavorites,
} from "../api/favorites";
import apiClient from "../api/client";

interface Ad {
  id: number;
  title: string;
  description?: string;
  detailedInfo?: string;
  price: number;
  year?: number;
  city?: { id: number; name: string };
  district?: { id: number; name: string };
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
  model?: { id: number; name: string };
  variant?: { id: number; name: string };
  fuel?: string;
  transmission?: string;
  mileage?: number;
  enginePower?: string;
  motorPower?: string;
  engineHorsepower?: string;
  engineVolume?: string;
  wheelDrive?: string;
  seatCount?: number;
  color?: string;
  damage?: string;
  plateType?: string;
  plateNumber?: string;
  takas?: string;
  hasAccidentRecord?: boolean | null;
  hasTramerRecord?: boolean | null;
  viewCount?: number;
  platformLength?: string;
  platformWidth?: string;
  roofType?: string;
  loadCapacity?: string;
  maxPower?: string;
  maxTorque?: string;
  fuelType?: string;
  maxVehicleCapacity?: string;
  images?: {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    displayOrder: number;
    altText?: string;
  }[];
  videos?: {
    id: number;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    fileSize?: number;
    mimeType?: string;
    displayOrder: number;
    description?: string;
  }[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    phone?: string;
  };
  createdAt: string;
  customFields?: { [key: string]: string | number | boolean | object };
  dynamicFields?: { [key: string]: string | number | boolean };
}

interface ApiResponse {
  ads?: Ad[];
  data?: Ad[];
}

// CategoryField interface removed for performance

const AdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  // Category fields removed for performance - not critical
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);
  const [similarAdsLoading, setSimilarAdsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [adVideos, setAdVideos] = useState<
    {
      id: number;
      videoUrl: string;
      thumbnailUrl?: string;
      duration?: number;
      fileSize?: number;
      mimeType?: string;
      displayOrder: number;
      description?: string;
    }[]
  >([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [videoBlobUrls, setVideoBlobUrls] = useState<Map<number, string>>(
    new Map()
  );

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchAd = async () => {
      const startTime = performance.now();
      try {
        console.log("⚡ LIGHTNING ad detail fetch...");
        console.log(
          "🔍 Request URL:",
          `${apiClient.defaults.baseURL}/ads/${id}`
        );
        console.log("🔍 apiClient config:", {
          baseURL: apiClient.defaults.baseURL,
          withCredentials: apiClient.defaults.withCredentials,
          timeout: apiClient.defaults.timeout,
        });

        // 🔥 PRODUCTION SAFE FETCH - Always use full API URL
        const apiUrl = `${API_BASE_URL}/ads/${id}`;

        console.log("🚀 Production safe fetch");
        console.log(`🔗 Base URL: ${API_BASE_URL}`);
        console.log(`🔗 Full URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const adData = await response.json();
        const adResponse = {
          data: adData,
          status: response.status,
          statusText: response.statusText,
        };

        console.log(
          "✅ Response received:",
          adResponse.status,
          adResponse.statusText
        );
        const data = adResponse.data as Ad;

        console.log("🔍 API Response data:", data);
        console.log("🔍 Data type:", typeof data);
        console.log(
          "🔍 Data keys:",
          data ? Object.keys(data) : "null/undefined"
        );

        // ❗ FIX: Parse customFields if it's a string
        if (typeof data.customFields === "string") {
          try {
            data.customFields = JSON.parse(data.customFields);
          } catch (e) {
            console.error("❌ Failed to parse customFields:", e);
            data.customFields = {};
          }
        }

        // ❗ Set ad data once with all information
        setAd(data);
        setLoading(false);

        // ❗ SKIP category fields - not critical for performance
        const instantOperations = [];

        // Favori kontrolü - IMMEDIATE background check
        if (currentUser && token) {
          instantOperations.push(
            checkFavorite(Number(id), token)
              .then((favResult) => {
                if (favResult.success) {
                  setIsFavorited(favResult.isFavorited || false);
                }
              })
              .catch(() => {}) // Silent fail
          );
        }

        // Run instant operations in background
        Promise.all(instantOperations).finally(() => {
          const totalTime = performance.now() - startTime;
          console.log(
            `⚡ Total Detail Page Load Time: ${totalTime.toFixed(2)}ms`
          );
        });

        // ❗ Loading already set to false above for instant display
      } catch (error: unknown) {
        console.error("❌ Error fetching ad:", error);

        if (error && typeof error === "object") {
          const err = error as Record<string, unknown>;
          console.error("❌ Error name:", err.name);
          console.error("❌ Error message:", err.message);
          console.error("❌ Error code:", err.code);
          console.error("❌ Error stack:", err.stack);

          if (err.response) {
            console.error(
              "❌ Response status:",
              (err.response as Record<string, unknown>).status
            );
            console.error(
              "❌ Response headers:",
              (err.response as Record<string, unknown>).headers
            );
            console.error(
              "❌ Response data:",
              (err.response as Record<string, unknown>).data
            );
          } else if (err.request) {
            console.error("❌ Request made but no response received");
            console.error("❌ Request details:", err.request);
          } else {
            console.error("❌ Error in setting up request:", err.message);
          }
        }

        setLoading(false);
      }
    };

    if (id) {
      fetchAd();
    }
  }, [id, currentUser, token]);

  // Fetch similar ads
  useEffect(() => {
    const fetchSimilarAds = async () => {
      if (!ad) return;

      setSimilarAdsLoading(true);
      try {
        const response = await apiClient.get("/ads", {
          params: {
            limit: 8,
            category: ad.category?.name,
            brand: ad.brand?.name,
            exclude: ad.id,
          },
        });

        const apiResponse = response.data as ApiResponse;
        if (apiResponse && Array.isArray(apiResponse.ads)) {
          setSimilarAds(apiResponse.ads);
        } else if (response.data && Array.isArray(response.data)) {
          setSimilarAds(response.data as Ad[]);
        }
      } catch (error) {
        console.error("Error fetching similar ads:", error);
      } finally {
        setSimilarAdsLoading(false);
      }
    };

    fetchSimilarAds();
  }, [ad]);

  // Fetch videos separately for performance
  const fetchVideos = useCallback(async () => {
    if (!id || videosLoaded || videosLoading) return;

    setVideosLoading(true);
    try {
      console.log("🎥 Loading videos for ad:", id);
      const response = await apiClient.get(`/ads/${id}/videos`);

      console.log("🎥 Raw video response:", response.data);

      const data = response.data as { videos: typeof adVideos };
      const videos = data.videos || [];

      console.log("🎥 Processed videos:", videos.length);
      videos.forEach((video, index) => {
        console.log(`Video ${index + 1}:`, {
          id: video.id,
          hasVideoUrl: !!video.videoUrl,
          videoUrlLength: video.videoUrl?.length || 0,
          mimeType: video.mimeType,
          isDataUrl: video.videoUrl?.startsWith("data:") || false,
        });
      });

      setAdVideos(videos);
      setVideosLoaded(true);
      console.log("🎥 Videos loaded successfully:", videos.length);
    } catch (error) {
      console.error("❌ Error loading videos:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      setAdVideos([]);
    } finally {
      setVideosLoading(false);
    }
  }, [id, videosLoaded, videosLoading]);

  // Auto-fetch videos if metadata exists but videoUrl is missing
  useEffect(() => {
    if (
      ad &&
      ad.videos &&
      ad.videos.length > 0 &&
      !videosLoaded &&
      !videosLoading
    ) {
      const hasVideoWithoutUrl = ad.videos.some(
        (video) => video && !video.videoUrl && video.id
      );

      if (hasVideoWithoutUrl) {
        console.log(
          "🎥 Auto-fetching videos - metadata exists but videoUrl missing"
        );
        fetchVideos();
      }
    }
  }, [ad, videosLoaded, videosLoading, fetchVideos]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      videoBlobUrls.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
    };
  }, [videoBlobUrls]);

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price) + " TL";
  };

  const getImageUrl = (images?: (string | { imageUrl: string })[]): string => {
    // ❗ Performance: No debug logs
    if (!images || images.length === 0) {
      return "https://via.placeholder.com/400x300/f0f0f0/999999?text=Resim+Yok";
    }

    const firstImage = images[0];

    // Eğer object ise imageUrl property'sini al
    let imageUrl: string;
    if (typeof firstImage === "object" && firstImage.imageUrl) {
      imageUrl = firstImage.imageUrl;
    } else if (typeof firstImage === "string") {
      imageUrl = firstImage;
    } else {
      return "https://via.placeholder.com/400x300/f0f0f0/999999?text=Hatalı+Resim";
    }

    // Base64 kontrolü - keep original images for display
    if (imageUrl.startsWith("data:image/")) {
      return imageUrl; // Show base64 images but with lazy loading
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    const baseUrl = API_BASE_URL.replace("/api", "");
    const finalUrl = `${baseUrl}${imageUrl}`;
    return finalUrl;
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  if (!ad) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography>İlan bulunamadı.</Typography>
        <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Ana Sayfaya Dön
        </Button>
      </Box>
    );
  }

  // Modal navigation functions
  const handleNextImage = () => {
    if (ad?.images && modalImageIndex < ad.images.length - 1) {
      setModalImageIndex(modalImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (modalImageIndex > 0) {
      setModalImageIndex(modalImageIndex - 1);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Format feature names (camelCase to Title Case) with Turkish translations
  const formatFeatureName = (featureName: string): string => {
    // Turkish translations for common feature names
    const turkishTranslations: { [key: string]: string } = {
      // English to Turkish translations
      abs: "ABS",
      esp: "ESP",
      asr: "ASR",
      alarm: "Alarm",
      ebv: "EBV",
      airBag: "Hava Yastığı",
      sideAirbag: "Yan Hava Yastığı",
      passengerAirbag: "Yolcu Hava Yastığı",
      centralLock: "Merkezi Kilit",
      immobilizer: "İmmobilizer",
      headlightSensor: "Far Sensörü",
      headlightWasher: "Far Yıkayıcı",
      rainSensor: "Yağmur Sensörü",
      pto: "PTO",
      cruiseControl: "Hız Sabitleyici",
      airCondition: "Klima",
      alloyWheel: "Alaşım Jant",
      cd: "CD",
      towHook: "Çeki Demiri",
      leatherSeat: "Deri Koltuk",
      electricMirror: "Elektrikli Ayna",
      electricWindow: "Elektrikli Cam",
      fogLight: "Sis Farı",
      heatedSeats: "Isıtmalı Koltuk",
      powerSteering: "Hidrolik Direksiyon",
      memorySeats: "Hafızalı Koltuk",
      retarder: "Retarder",
      spoiler: "Spoiler",
      sunroof: "Sunroof",
      radio: "Radyo",
      gps: "GPS",
      tripComputer: "Seyir Bilgisayarı",
      windDeflector: "Rüzgar Deflektörü",
      table: "Masa",
      flexibleReadingLight: "Esnek Okuma Lambası",
      // Camel case versions
      AirBag: "Hava Yastığı",
      SideAirbag: "Yan Hava Yastığı",
      PassengerAirbag: "Yolcu Hava Yastığı",
      CentralLock: "Merkezi Kilit",
      HeadlightSensor: "Far Sensörü",
      HeadlightWasher: "Far Yıkayıcı",
      RainSensor: "Yağmur Sensörü",
      CruiseControl: "Hız Sabitleyici",
      AirCondition: "Klima",
      AlloyWheel: "Alaşım Jant",
      TowHook: "Çeki Demiri",
      LeatherSeat: "Deri Koltuk",
      ElectricMirror: "Elektrikli Ayna",
      ElectricWindow: "Elektrikli Cam",
      FogLight: "Sis Farı",
      HeatedSeats: "Isıtmalı Koltuk",
      PowerSteering: "Hidrolik Direksiyon",
      MemorySeats: "Hafızalı Koltuk",
      TripComputer: "Seyir Bilgisayarı",
      WindDeflector: "Rüzgar Deflektörü",
      FlexibleReadingLight: "Esnek Okuma Lambası",
    };

    // Check if we have a direct Turkish translation
    if (turkishTranslations[featureName]) {
      return turkishTranslations[featureName];
    }

    // Split camelCase words and convert to title case
    const words = featureName.replace(/([A-Z])/g, " $1").trim();

    const titleCase = words
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // Check if the title case version has a translation
    if (turkishTranslations[titleCase.replace(/\s/g, "")]) {
      return turkishTranslations[titleCase.replace(/\s/g, "")];
    }

    return titleCase;
  };

  // Check if current user is the owner of the ad
  const isOwner = currentUser?.id === ad?.user?.id;

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      alert("Favorilere eklemek için giriş yapmalısınız.");
      navigate("/login");
      return;
    }

    if (!token) {
      alert("Oturum bilginiz geçersiz. Lütfen tekrar giriş yapın.");
      navigate("/login");
      return;
    }

    if (isOwner) {
      alert("Kendi ilanınızı favorilere ekleyemezsiniz!");
      return;
    }

    try {
      let result;
      if (isFavorited) {
        result = await removeFromFavorites(Number(id), token);
      } else {
        result = await addToFavorites(Number(id), token);
      }

      if (result.success) {
        setIsFavorited(!isFavorited);
        if (result.message) {
          // Optional: Show success message
          console.log(result.message);
        }
      } else {
        alert(result.message || "İşlem başarısız oldu.");
      }
    } catch (error) {
      console.error("Favorileme hatası:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (!currentUser) {
      alert("Mesaj göndermek için giriş yapmalısınız.");
      navigate("/login");
      return;
    }

    if (isOwner) {
      alert("Kendi ilanınıza mesaj gönderemezsiniz!");
      return;
    }

    // Navigate to messaging with the ad owner
    navigate(`/messages?userId=${ad?.user?.id}&adId=${id}`);
  };

  // Handle complaint
  const handleComplaint = () => {
    if (!currentUser) {
      alert("Şikayet için giriş yapmalısınız.");
      navigate("/login");
      return;
    }

    if (isOwner) {
      alert("Kendi ilanınızı şikayet edemezsiniz!");
      return;
    }

    setShowComplaintModal(true);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        py: 3,
        position: "relative",
      }}
    >
      {/* Photo Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "95vw",
            maxHeight: "95vh",
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            position: "relative",
            p: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            minHeight: "80vh",
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
              zIndex: 1000,
            }}
          >
            <Close />
          </IconButton>

          {/* Previous button */}
          {ad?.images && modalImageIndex > 0 && (
            <IconButton
              onClick={handlePrevImage}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
                zIndex: 1000,
              }}
            >
              <ArrowBackIos />
            </IconButton>
          )}

          {/* Next button */}
          {ad?.images && modalImageIndex < ad.images.length - 1 && (
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
                zIndex: 1000,
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          )}

          {/* Main modal image */}
          {ad?.images && (
            <LazyImage
              src={getImageUrl([ad.images[modalImageIndex]])}
              alt={`${ad.title} - Fotoğraf ${modalImageIndex + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 8,
              }}
              width="800"
              height="600"
            />
          )}

          {/* Image counter */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              px: 2,
              py: 1,
              borderRadius: 2,
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {modalImageIndex + 1} / {ad?.images?.length || 1}
          </Box>

          {/* Thumbnail strip */}
          {ad?.images && ad.images.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 60,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                p: 1,
                borderRadius: 2,
                maxWidth: "80vw",
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                  height: 4,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  borderRadius: 2,
                },
              }}
            >
              {ad.images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setModalImageIndex(index)}
                  sx={{
                    width: 60,
                    height: 45,
                    border:
                      modalImageIndex === index
                        ? "2px solid #007bff"
                        : "1px solid transparent",
                    borderRadius: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#007bff",
                    },
                  }}
                >
                  <LazyImage
                    src={getImageUrl([image])}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    width="60"
                    height="45"
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Layout - Full Width */}
      <Box sx={{ width: "100%" }}>
        <Container maxWidth="lg">
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Back Button and Ad Info Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                mb: 3,
                flexWrap: "wrap",
              }}
            >
              {/* Back Button */}
              <Button
                variant="outlined"
                startIcon={<ArrowBackIos />}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: "#007bff",
                  color: "#007bff",
                  fontSize: "14px",
                  "&:hover": {
                    backgroundColor: "#007bff",
                    color: "white",
                  },
                }}
              >
                Geri Dön
              </Button>

              {/* Ad Info */}
              <Box sx={{ fontSize: "14px", color: "#666" }}>
                <strong>İlan No:</strong> #{ad.id || "56"}
              </Box>
              <Box sx={{ fontSize: "14px", color: "#666" }}>
                <strong>İlan Tarihi:</strong>{" "}
                {ad.createdAt
                  ? new Date(ad.createdAt).toLocaleDateString("tr-TR")
                  : "22.09.2025"}
              </Box>
              <Box sx={{ fontSize: "14px", color: "#666" }}>
                <strong>Kategori:</strong>{" "}
                {ad.category?.name || "Minibüs & Midibüs"}
              </Box>
              <Box sx={{ fontSize: "14px", color: "#666" }}>
                <strong>Marka:</strong> {ad.brand?.name || "Volkswagen"}
              </Box>
              <Box sx={{ fontSize: "14px", color: "#666" }}>
                <strong>Model:</strong> {ad.model?.name || "T Serisi"}
              </Box>
              <Box sx={{ fontSize: "14px", color: "#666" }}>
                <strong>Variant:</strong> {ad.variant?.name || "T5"}
              </Box>
            </Box>

            {/* Main Title and Price */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#333",
                  mb: 2,
                  textTransform: "uppercase",
                }}
              >
                {ad.title ||
                  "İLK SAHİBİNDEN KOMPLE SERVİS BAKIMLI HASARSIZ TEMİZ"}
              </Typography>

              {/* Price Row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#dc3545",
                  }}
                >
                  {formatPrice(ad.price)}
                </Typography>
                <Chip
                  label="🔄"
                  size="small"
                  sx={{
                    backgroundColor: "#e8f5e8",
                    color: "#2e7d32",
                    fontSize: "12px",
                  }}
                />
              </Box>
            </Box>

            {/* Main Content - Two Columns Layout */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", lg: "row" },
              }}
            >
              {/* Left Side - Images and Details Combined (70%) */}
              <Box sx={{ flex: { lg: "0 0 70%" } }}>
                {/* Images and Vehicle Details in Flex Row */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  {/* Images Section (60% of left area) */}
                  <Box sx={{ flex: { md: "0 0 60%" } }}>
                    {/* Main Image */}
                    <Box sx={{ mb: 2, position: "relative" }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: 400,
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.95,
                          },
                        }}
                        onClick={() => {
                          setModalImageIndex(selectedImageIndex);
                          setModalOpen(true);
                        }}
                      >
                        <LazyImage
                          src={
                            ad.images &&
                            ad.images.length > 0 &&
                            selectedImageIndex < ad.images.length
                              ? getImageUrl([ad.images[selectedImageIndex]])
                              : "https://via.placeholder.com/400x300/f0f0f0/999999?text=Resim+Yok"
                          }
                          alt={ad.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                          width="400"
                          height="300"
                        />
                      </Box>

                      {/* Büyük Fotoğraf Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setModalImageIndex(selectedImageIndex);
                          setModalOpen(true);
                        }}
                        sx={{
                          position: "absolute",
                          bottom: 16,
                          left: 16,
                          backgroundColor: "white",
                          color: "#333",
                          border: "1px solid #ddd",
                          fontSize: "12px",
                          padding: "4px 8px",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        📷 Büyük Fotoğraf
                      </Button>

                      {/* Photo Counter */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 16,
                          right: 16,
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: 1,
                          fontSize: "12px",
                        }}
                      >
                        {selectedImageIndex + 1}/{ad.images?.length || 1}{" "}
                        Fotoğraf
                      </Box>
                    </Box>

                    {/* Thumbnail Images */}
                    {ad.images && ad.images.length > 1 && (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(60px, 1fr))",
                          gap: 0.5,
                          maxHeight: 200,
                          overflowY: "auto",
                          "&::-webkit-scrollbar": {
                            width: 4,
                          },
                          "&::-webkit-scrollbar-track": {
                            backgroundColor: "#f1f1f1",
                            borderRadius: 2,
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#c1c1c1",
                            borderRadius: 2,
                          },
                        }}
                      >
                        {ad.images.map((image, index) => {
                          return (
                            <Box
                              key={index}
                              onClick={() => {
                                setSelectedImageIndex(index);
                                setModalImageIndex(index);
                                setModalOpen(true);
                              }}
                              sx={{
                                width: "100%",
                                aspectRatio: "4/3",
                                border:
                                  selectedImageIndex === index
                                    ? "2px solid #007bff"
                                    : "1px solid #e0e0e0",
                                borderRadius: 1,
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  borderColor: "#007bff",
                                  transform: "scale(1.02)",
                                },
                              }}
                            >
                              <LazyImage
                                src={getImageUrl([image])}
                                alt={`${ad.title} - ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                width="60"
                                height="45"
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>

                  {/* Vehicle Details Section (40% of left area) */}
                  <Box sx={{ flex: { md: "0 0 40%" } }}>
                    <Box
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        maxHeight: "500px",
                        overflowY: "auto",
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          backgroundColor: "#f8f9fa",
                          px: 1.5,
                          py: 1,
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          İlan Bilgileri
                        </Typography>
                      </Box>

                      {/* Properties Table */}
                      <Box sx={{ p: 0 }}>
                        {[
                          // Temel Bilgiler
                          {
                            label: "İlan No",
                            value: ad.id ? `${ad.id}` : null,
                          },
                          {
                            label: "İlan Tarihi",
                            value: ad.createdAt
                              ? new Date(ad.createdAt).toLocaleDateString(
                                  "tr-TR"
                                )
                              : null,
                          },
                          {
                            label: "Kategori",
                            value: ad.category?.name || null,
                          },
                          {
                            label: "Fiyat",
                            value: ad.price
                              ? `${Number(ad.price).toLocaleString("tr-TR")} TL`
                              : null,
                          },
                          {
                            label: "Yıl",
                            value: ad.year ? `${ad.year}` : null,
                          },
                          {
                            label: "KM",
                            value: ad.mileage
                              ? `${ad.mileage.toLocaleString("tr-TR")}`
                              : null,
                          },
                          {
                            label: "Görüntülenme",
                            value: ad.viewCount ? `${ad.viewCount}` : null,
                          },

                          // Marka Bilgisi (Model ve Varyant kamyon römork için gösterilmez)
                          { label: "Marka", value: ad.brand?.name || null },

                          // Lokasyon Bilgileri
                          {
                            label: "Şehir",
                            value:
                              ad.city?.name ||
                              (ad.customFields?.cityId
                                ? `Şehir ID: ${ad.customFields.cityId}`
                                : null) ||
                              null,
                          },
                          {
                            label: "İlçe",
                            value:
                              ad.district?.name ||
                              (ad.customFields?.districtId
                                ? `İlçe ID: ${ad.customFields.districtId}`
                                : null) ||
                              null,
                          },
                          {
                            label: "Adres",
                            value: ad.customFields?.address || null,
                          },

                          // Araç Detayları
                          {
                            label: "Durum",
                            value: ad.customFields?.condition || null,
                          },
                          {
                            label: "Renk",
                            value: ad.customFields?.color || ad.color || null,
                          },
                          {
                            label: "Yakıt Tipi",
                            value: ad.customFields?.fuelType || ad.fuel || null,
                          },
                          {
                            label: "Vites",
                            value:
                              ad.customFields?.transmission ||
                              ad.transmission ||
                              null,
                          },
                          {
                            label: "Çekiş",
                            value:
                              ad.customFields?.drivetrain ||
                              ad.wheelDrive ||
                              null,
                          },
                          {
                            label: "Motor Gücü",
                            value: (() => {
                              // Tüm olası motor gücü kaynaklarını kontrol et
                              const sources = [
                                ad.customFields?.motorPower,
                                ad.customFields?.enginePower,
                                ad.enginePower,
                                ad.motorPower,
                                ad.engineHorsepower,
                                ad.customFields?.motor_power,
                                ad.customFields?.engine_power,
                                ad.dynamicFields?.enginePower,
                                ad.dynamicFields?.motorPower,
                                ad.customFields?.power,
                                ad.customFields?.hp,
                                ad.customFields?.horsepower,
                              ];

                              for (const source of sources) {
                                if (source && source.toString().trim() !== "") {
                                  return source.toString();
                                }
                              }

                              return null;
                            })(),
                          },
                          {
                            label: "Motor Hacmi",
                            value:
                              ad.customFields?.engineCapacity ||
                              ad.customFields?.engineVolume ||
                              ad.engineVolume ||
                              null,
                          },
                          {
                            label: "Koltuk Sayısı",
                            value:
                              ad.customFields?.seatCount ||
                              ad.seatCount ||
                              null,
                          },
                          {
                            label: "Tavan Tipi",
                            value:
                              ad.customFields?.roofType || ad.roofType || null,
                          },
                          {
                            label: "Şasi",
                            value:
                              ad.customFields?.chassis ||
                              ad.customFields?.chasisType ||
                              null,
                          },
                          {
                            label: "Kabin",
                            value: ad.customFields?.cabin || null,
                          },
                          {
                            label: "Hasar Kaydı",
                            value: (() => {
                              // Önce direkt ad objesi üzerinden kontrol et
                              if (ad.hasAccidentRecord === true) {
                                return "Evet";
                              } else if (ad.hasAccidentRecord === false) {
                                return "Hayır";
                              }

                              // Fallback olarak customFields'tan kontrol et
                              if (
                                ad.customFields?.hasAccidentRecord === "evet" ||
                                ad.customFields?.hasAccidentRecord === true
                              ) {
                                return "Evet";
                              } else if (
                                ad.customFields?.hasAccidentRecord ===
                                  "hayir" ||
                                ad.customFields?.hasAccidentRecord === false
                              ) {
                                return "Hayır";
                              }
                              return null;
                            })(),
                          },
                          {
                            label: "Tramer Kaydı",
                            value: (() => {
                              // Önce direkt ad objesi üzerinden kontrol et
                              if (ad.hasTramerRecord === true) {
                                return "Evet";
                              } else if (ad.hasTramerRecord === false) {
                                return "Hayır";
                              }

                              // Fallback olarak customFields'tan kontrol et
                              if (
                                ad.customFields?.hasTramerRecord === "evet" ||
                                ad.customFields?.hasTramerRecord === true
                              ) {
                                return "Evet";
                              } else if (
                                ad.customFields?.hasTramerRecord === "hayir" ||
                                ad.customFields?.hasTramerRecord === false
                              ) {
                                return "Hayır";
                              }
                              return null;
                            })(),
                          },

                          // Kamyon Römork Özel Alanları
                          {
                            label: "Uzunluk (m)",
                            value: ad.customFields?.length
                              ? `${ad.customFields.length} m`
                              : null,
                          },
                          {
                            label: "Genişlik (m)",
                            value: ad.customFields?.width
                              ? `${ad.customFields.width} m`
                              : null,
                          },
                          {
                            label: "Tenteli",
                            value:
                              ad.customFields?.hasTent === true
                                ? "Evet"
                                : ad.customFields?.hasTent === false
                                ? "Hayır"
                                : null,
                          },
                          {
                            label: "Damperli",
                            value:
                              ad.customFields?.hasDamper === true
                                ? "Evet"
                                : ad.customFields?.hasDamper === false
                                ? "Hayır"
                                : null,
                          },

                          // Çekici Özel Alanları
                          {
                            label: "Kabin Tipi",
                            value: ad.customFields?.cabinType || null,
                          },
                          {
                            label: "Yatak Sayısı",
                            value: ad.customFields?.bedCount || null,
                          },
                          {
                            label: "Dorse Mevcut",
                            value: ad.customFields?.dorseAvailable || null,
                          },
                          {
                            label: "Boyalı",
                            value: ad.customFields?.paintChange || null,
                          },

                          // Karoser/Ahşap Kasa Özel Alanları
                          {
                            label: "Kullanım Alanı",
                            value: ad.customFields?.usageArea || null,
                          },
                          {
                            label: "Karoser Yapısı",
                            value: ad.customFields?.bodyStructure || null,
                          },
                          {
                            label: "Kasa Tipi",
                            value: ad.customFields?.caseType || null,
                          },
                          {
                            label: "Devrilme Yönü",
                            value:
                              ad.customFields?.tippingDirection ||
                              ad.customFields?.devrilmeYonu ||
                              null,
                          },
                          {
                            label: "Takaslı",
                            value: ad.customFields?.isExchangeable
                              ? ad.customFields.isExchangeable === "evet"
                                ? "Evet"
                                : "Hayır"
                              : null,
                          },

                          // Otobüs Özel Alanları
                          {
                            label: "Kapasite",
                            value:
                              ad.customFields?.capacity ||
                              ad.customFields?.passengerCapacity ||
                              null,
                          },
                          {
                            label: "Maksimum Araç Kapasitesi",
                            value:
                              ad.customFields?.maxVehicleCapacity ||
                              ad.maxVehicleCapacity ||
                              null,
                          },
                          {
                            label: "Koltuk Düzeni",
                            value:
                              ad.customFields?.seatArrangement ||
                              ad.customFields?.seatLayout ||
                              null,
                          },
                          {
                            label: "Koltuk Arkası Ekran",
                            value: ad.customFields?.seatBackScreen || null,
                          },
                          {
                            label: "Renk",
                            value: ad.customFields?.color || ad.color || null,
                          },
                          {
                            label: "Yakıt Hacmi (Litre)",
                            value: ad.customFields?.fuelCapacity
                              ? `${ad.customFields.fuelCapacity} L`
                              : null,
                          },
                          {
                            label: "Lastik Durumu",
                            value: ad.customFields?.tireCondition || null,
                          },

                          // Oto Kurtarıcı Tekli Araç Özel Alanları
                          {
                            label: "Maksimum Güç",
                            value:
                              ad.customFields?.maxPower || ad.maxPower || null,
                          },
                          {
                            label: "Maksimum Tork",
                            value:
                              ad.customFields?.maxTorque ||
                              ad.maxTorque ||
                              null,
                          },
                          {
                            label: "Plaka Bilgileri",
                            value: (() => {
                              const plateType =
                                ad.customFields?.plateType || ad.plateType;
                              const plateNumber =
                                ad.customFields?.plateNumber || ad.plateNumber;

                              if (plateNumber) {
                                const typeText =
                                  plateType === "tr-plakali"
                                    ? "TR Plaka"
                                    : plateType === "mavi-plakali"
                                    ? "Mavi Plaka"
                                    : plateType || "";
                                return typeText
                                  ? `${plateNumber} (${typeText})`
                                  : plateNumber;
                              }
                              return null;
                            })(),
                          },
                          {
                            label: "Platform Uzunluk",
                            value:
                              ad.customFields?.platformLength ||
                              ad.platformLength ||
                              null,
                          },
                          {
                            label: "Platform Genişlik",
                            value:
                              ad.customFields?.platformWidth ||
                              ad.platformWidth ||
                              null,
                          },

                          {
                            label: "Yük Kapasitesi",
                            value: ad.customFields?.loadCapacity || null,
                          },
                          {
                            label: "Üst Yapı",
                            value: ad.customFields?.superstructure || null,
                          },

                          // Lowbed (Havuzlu/Öndekirmalı) Dorse Özel Alanları
                          {
                            label: "Havuz Derinliği",
                            value: ad.customFields?.havuzDerinligi
                              ? `${ad.customFields.havuzDerinligi} m`
                              : null,
                          },
                          {
                            label: "Havuz Genişliği",
                            value: ad.customFields?.havuzGenisligi
                              ? `${ad.customFields.havuzGenisligi} m`
                              : null,
                          },
                          {
                            label: "Havuz Uzunluğu",
                            value: ad.customFields?.havuzUzunlugu
                              ? `${ad.customFields.havuzUzunlugu} m`
                              : null,
                          },
                          {
                            label: "İstiap Haddi",
                            value: ad.customFields?.istiapHaddi
                              ? `${ad.customFields.istiapHaddi} ton`
                              : null,
                          },
                          {
                            label: "Uzatılabilir Profil",
                            value: ad.customFields?.uzatilabilirProfil || null,
                          },
                          {
                            label: "Rampa Mekanizması",
                            value: ad.customFields?.rampaMekanizmasi
                              ? (() => {
                                  try {
                                    if (
                                      typeof ad.customFields
                                        .rampaMekanizmasi === "string"
                                    ) {
                                      const parsed = JSON.parse(
                                        ad.customFields.rampaMekanizmasi
                                      );
                                      return Array.isArray(parsed)
                                        ? parsed.join(", ")
                                        : ad.customFields.rampaMekanizmasi;
                                    } else if (
                                      Array.isArray(
                                        ad.customFields.rampaMekanizmasi
                                      )
                                    ) {
                                      return ad.customFields.rampaMekanizmasi.join(
                                        ", "
                                      );
                                    } else {
                                      return ad.customFields.rampaMekanizmasi;
                                    }
                                  } catch {
                                    return ad.customFields.rampaMekanizmasi;
                                  }
                                })()
                              : null,
                          },

                          // Damperli Dorse Özel Alanları

                          // Tenteli Dorse Özel Alanları
                          {
                            label: "Çatı Perde Sistemi",
                            value: ad.customFields?.catiPerdeSistemi || null,
                          },

                          // Tanker Özel Alanları
                          {
                            label: "Hacim",
                            value: ad.customFields?.hacim
                              ? `${ad.customFields.hacim} m³`
                              : null,
                          },
                          {
                            label: "Göz Sayısı",
                            value: ad.customFields?.gozSayisi || null,
                          },

                          // Silobas Özel Alanları
                          {
                            label: "Silobas Türü",
                            value: ad.customFields?.silobasTuru || null,
                          },

                          // Frigofirik Özel Alanları
                          {
                            label: "Lastik Durumu",
                            value: ad.customFields?.lastikDurumu
                              ? `${ad.customFields.lastikDurumu}%`
                              : null,
                          },
                          {
                            label: "Soğutucu Durumu",
                            value: ad.customFields?.sogutucu || null,
                          },

                          // Ortak Dorse Özellikleri
                          {
                            label: "Takaslı",
                            value: ad.customFields?.takasli || null,
                          },

                          // Oto Kurtarıcı/Taşıyıcı Özel Alanları
                          {
                            label: "Çekici Ekipmanı",
                            value: ad.customFields?.cekiciEkipmani
                              ? (() => {
                                  try {
                                    const equipment =
                                      typeof ad.customFields.cekiciEkipmani ===
                                      "string"
                                        ? JSON.parse(
                                            ad.customFields.cekiciEkipmani
                                          )
                                        : ad.customFields.cekiciEkipmani;

                                    if (
                                      typeof equipment === "object" &&
                                      equipment !== null
                                    ) {
                                      const equipmentList = Object.entries(
                                        equipment
                                      )
                                        .filter(([, value]) => value === true)
                                        .map(([key]) => {
                                          // Convert camelCase to readable text
                                          const readableMap: {
                                            [key: string]: string;
                                          } = {
                                            kayarPlatform: "Kayar Platform",
                                            palet: "Palet",
                                            rampa: "Rampa",
                                            makara: "Makara",
                                            vinc: "Vinç",
                                            ahtapotVinc: "Ahtapot Vinç",
                                            gozluk: "Gözlük",
                                            hiUp: "Hi-Up",
                                          };
                                          return readableMap[key] || key;
                                        });
                                      return equipmentList.length > 0
                                        ? equipmentList.join(", ")
                                        : null;
                                    }
                                    return null;
                                  } catch {
                                    return null;
                                  }
                                })()
                              : null,
                          },
                          {
                            label: "Ek Ekipmanlar",
                            value: ad.customFields?.ekEkipmanlar
                              ? (() => {
                                  try {
                                    const equipment =
                                      typeof ad.customFields.ekEkipmanlar ===
                                      "string"
                                        ? JSON.parse(
                                            ad.customFields.ekEkipmanlar
                                          )
                                        : ad.customFields.ekEkipmanlar;

                                    if (
                                      typeof equipment === "object" &&
                                      equipment !== null
                                    ) {
                                      const equipmentList = Object.entries(
                                        equipment
                                      )
                                        .filter(([, value]) => value === true)
                                        .map(([key]) => {
                                          const readableMap: {
                                            [key: string]: string;
                                          } = {
                                            pistonAyak: "Piston Ayak",
                                            takoz: "Takoz",
                                            sabitlemeHalati: "Sabitleme Halatı",
                                          };
                                          return readableMap[key] || key;
                                        });
                                      return equipmentList.length > 0
                                        ? equipmentList.join(", ")
                                        : null;
                                    }
                                    return null;
                                  } catch {
                                    return null;
                                  }
                                })()
                              : null,
                          },

                          // Şasi/Römork Genel Özellikleri

                          // Kuruyük Özel Alanları
                          {
                            label: "Uzunluk",
                            value: ad.customFields?.uzunluk
                              ? `${ad.customFields.uzunluk} m`
                              : null,
                          },
                          {
                            label: "Genişlik",
                            value: ad.customFields?.genislik
                              ? `${ad.customFields.genislik} m`
                              : null,
                          },
                          {
                            label: "Kapak Yüksekliği",
                            value: ad.customFields?.kapakYuksekligi
                              ? `${ad.customFields.kapakYuksekligi} m`
                              : null,
                          },
                          {
                            label: "Yükseklik",
                            value: ad.customFields?.yukseklik
                              ? `${ad.customFields.yukseklik} m`
                              : null,
                          },
                          {
                            label: "Kriko Ayak",
                            value: ad.customFields?.krikoAyak || null,
                          },
                          {
                            label: "Kapak Sistemi",
                            value: ad.customFields?.kapakSistemi || null,
                          },

                          // Silobas Özel Alanları
                          {
                            label: "Dingil Sayısı",
                            value: ad.customFields?.dingilSayisi || null,
                          },

                          // Tekstil Özel Alanları
                          {
                            label: "Tekstil Türü",
                            value: ad.customFields?.tekstilTuru || null,
                          },
                          {
                            label: "Malzeme",
                            value: ad.customFields?.malzeme || null,
                          },
                          {
                            label: "Ebat",
                            value: ad.customFields?.ebat || null,
                          },

                          // Diğer Bilgiler
                          {
                            label: "Garanti",
                            value:
                              ad.customFields?.hasWarranty === true
                                ? "Var"
                                : ad.customFields?.hasWarranty === false
                                ? "Yok"
                                : ad.customFields?.warranty === "true"
                                ? "Var"
                                : ad.customFields?.warranty === "false"
                                ? "Yok"
                                : null,
                          },
                          {
                            label: "Pazarlık",
                            value:
                              ad.customFields?.isNegotiable === true
                                ? "Yapılabilir"
                                : ad.customFields?.isNegotiable === false
                                ? "Yapılamaz"
                                : ad.customFields?.negotiable === "true"
                                ? "Yapılabilir"
                                : ad.customFields?.negotiable === "false"
                                ? "Yapılamaz"
                                : null,
                          },
                          {
                            label: "Takas",
                            value:
                              ad.customFields?.isExchangeable === true
                                ? "Yapılabilir"
                                : ad.customFields?.isExchangeable === false
                                ? "Yapılamaz"
                                : ad.customFields?.exchange === "true"
                                ? "Yapılabilir"
                                : ad.customFields?.exchange === "false"
                                ? "Yapılamaz"
                                : ad.customFields?.exchange || ad.takas || null,
                          },
                          { label: "Hasar Durumu", value: ad.damage || null },

                          // Dynamic fields removed for performance
                        ]
                          .filter(
                            (item) =>
                              item.value !== null &&
                              item.value !== "" &&
                              item.value !== undefined
                          )
                          .map((item, index, array) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                borderBottom:
                                  index < array.length - 1
                                    ? "1px solid #f0f0f0"
                                    : "none",
                                "&:hover": {
                                  backgroundColor: "#f8f9fa",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  flex: "0 0 40%",
                                  px: 1,
                                  py: 0.3,
                                  backgroundColor: "#fafbfc",
                                  borderRight: "1px solid #f0f0f0",
                                  fontSize: "10px",
                                  fontWeight: "500",
                                  color: "#666",
                                }}
                              >
                                {item.label}
                              </Box>
                              <Box
                                sx={{
                                  flex: 1,
                                  px: 1,
                                  py: 0.3,
                                  fontSize: "10px",
                                  color: "#333",
                                  lineHeight: 1.2,
                                }}
                              >
                                {typeof item.value === "object"
                                  ? JSON.stringify(item.value)
                                  : item.value}
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Right Section - Seller Info and Banner (30%) */}
              <Box sx={{ flex: { lg: "0 0 30%" } }}>
                {/* Seller Info Section */}
                <Box
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#f8f9fa",
                      px: 3,
                      py: 2,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Satıcı Bilgileri
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2 }}>
                    <Typography
                      sx={{ fontWeight: "bold", mb: 1, fontSize: "13px" }}
                    >
                      {ad.user?.name || "Nuri A."}
                    </Typography>
                    <Typography sx={{ color: "#666", fontSize: "12px", mb: 2 }}>
                      Hesap açma tarihi: Temmuz 2025
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold", fontSize: "12px" }}>
                        Cep
                      </Typography>
                      <Typography sx={{ fontSize: "12px" }}>
                        {ad.user?.phone || "0 (545) 713 55 21"}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={handleSendMessage}
                      disabled={isOwner}
                      sx={{
                        backgroundColor: isOwner ? "#ccc" : "#007bff",
                        color: "white",
                        mb: 1.5,
                        fontSize: "12px",
                        py: 1,
                        "&:hover": {
                          backgroundColor: isOwner ? "#ccc" : "#0056b3",
                        },
                        "&:disabled": {
                          color: "#666",
                        },
                      }}
                    >
                      📞 {isOwner ? "Kendi İlanınız" : "Mesaj Gönder"}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={handleComplaint}
                      disabled={isOwner}
                      sx={{
                        borderColor: isOwner ? "#ccc" : "#007bff",
                        color: isOwner ? "#666" : "#007bff",
                        fontSize: "11px",
                        py: 0.8,
                        mb: 1.5,
                        "&:hover": {
                          backgroundColor: isOwner ? "transparent" : "#f8f9fa",
                        },
                        "&:disabled": {
                          borderColor: "#ccc",
                          color: "#666",
                        },
                      }}
                    >
                      {isOwner
                        ? "Kendi İlanınızı Şikayet Edemezsiniz"
                        : "İlan ile İlgili Şikayetin Var"}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={
                        isFavorited ? <Favorite /> : <FavoriteBorder />
                      }
                      size="small"
                      onClick={handleFavoriteToggle}
                      disabled={isOwner}
                      sx={{
                        borderColor: isOwner
                          ? "#ccc"
                          : isFavorited
                          ? "#dc3545"
                          : "#007bff",
                        color: isOwner
                          ? "#666"
                          : isFavorited
                          ? "#dc3545"
                          : "#007bff",
                        fontSize: "11px",
                        py: 0.8,
                        "&:hover": {
                          backgroundColor: isOwner
                            ? "transparent"
                            : isFavorited
                            ? "#dc3545"
                            : "#007bff",
                          color: isOwner ? "#666" : "white",
                        },
                        "&:disabled": {
                          borderColor: "#ccc",
                          color: "#666",
                        },
                      }}
                    >
                      {isOwner
                        ? "Kendi İlanınız"
                        : isFavorited
                        ? "Favorilerden Çıkar"
                        : "Favorilerime Ekle"}
                    </Button>
                  </Box>
                </Box>

                {/* Location Map Section */}
                <Box
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#f8f9fa",
                      px: 1,
                      py: 0.5,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Konum
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <LocationOn sx={{ color: "#007bff", fontSize: 14 }} />
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#333",
                          fontWeight: "500",
                        }}
                      >
                        {ad.city?.name && ad.district?.name
                          ? `${ad.city.name} / ${ad.district.name}`
                          : "Konum bilgisi mevcut değil"}
                      </Typography>
                    </Box>

                    {/* Map Options - No iframe, just buttons */}
                    <Box
                      sx={{
                        width: "100%",
                        minHeight: 70,
                        borderRadius: 1,
                        border: "1px solid #ddd",
                        position: "relative",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.75,
                        p: 1.25,
                      }}
                    >
                      {/* Location Display */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          mb: 0.5,
                        }}
                      >
                        <LocationOn sx={{ color: "#e74c3c", fontSize: 18 }} />
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          {ad.city?.name || "İstanbul"} /{" "}
                          {ad.district?.name || "Merkez"}
                        </Typography>
                      </Box>

                      {/* Map Action Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.75,
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        {/* Google Maps button */}
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: "#4285f4",
                            color: "white",
                            fontSize: "11px",
                            py: 0.4,
                            px: 1.25,
                            minWidth: "auto",
                            "&:hover": {
                              backgroundColor: "#3367d6",
                            },
                          }}
                          onClick={() => {
                            const cityName = ad.city?.name || "İstanbul";
                            const districtName = ad.district?.name || "Merkez";
                            const searchQuery = `${cityName}, ${districtName}, Turkey`;
                            window.open(
                              `https://www.google.com/maps/search/${encodeURIComponent(
                                searchQuery
                              )}`,
                              "_blank"
                            );
                          }}
                        >
                          📍 Google
                        </Button>

                        {/* Yandex Maps button */}
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: "#ffdb4d",
                            color: "#333",
                            fontSize: "11px",
                            py: 0.4,
                            px: 1.25,
                            minWidth: "auto",
                            "&:hover": {
                              backgroundColor: "#ffd700",
                            },
                          }}
                          onClick={() => {
                            const cityName = ad.city?.name || "İstanbul";
                            const districtName = ad.district?.name || "Merkez";
                            window.open(
                              `https://yandex.com.tr/maps/?text=${encodeURIComponent(
                                cityName + " " + districtName
                              )}`,
                              "_blank"
                            );
                          }}
                        >
                          🗺️ Yandex
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Açıklama ve Özellikler Section - Full width below main content */}
            <Box sx={{ mt: 3 }}>
              {/* Açıklama Section */}
              <Box
                sx={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#f8f9fa",
                    px: 1.5,
                    py: 1,
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    Açıklama
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#333",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {typeof ad.description === "string"
                      ? ad.description
                      : typeof ad.detailedInfo === "string"
                      ? ad.detailedInfo
                      : typeof ad.customFields?.detailedInfo === "string"
                      ? ad.customFields.detailedInfo
                      : "Açıklama bulunmuyor."}
                  </Typography>
                </Box>
              </Box>

              {/* Detaylı Bilgi Section */}
              {((ad.detailedInfo &&
                typeof ad.detailedInfo === "string" &&
                ad.detailedInfo.trim() !== "") ||
                (ad.customFields?.detailedInfo &&
                  typeof ad.customFields.detailedInfo === "string" &&
                  ad.customFields.detailedInfo.trim() !== "")) && (
                <Box
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#f8f9fa",
                      px: 1.5,
                      py: 1,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Detaylı Bilgi
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#333",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {ad.detailedInfo &&
                      typeof ad.detailedInfo === "string" &&
                      ad.detailedInfo.trim() !== ""
                        ? ad.detailedInfo
                        : typeof ad.customFields?.detailedInfo === "string"
                        ? ad.customFields.detailedInfo
                        : "Detaylı bilgi bulunmuyor."}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Özellikler Section */}
              {((ad.customFields?.features &&
                typeof ad.customFields.features === "object") ||
                (ad.customFields?.detailFeatures &&
                  typeof ad.customFields.detailFeatures === "object")) && (
                <Box
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#f8f9fa",
                      px: 1.5,
                      py: 1,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Araç Özellikleri
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 1,
                      }}
                    >
                      {/* Features'dan gelen özellikler */}
                      {ad.customFields?.features &&
                        typeof ad.customFields.features === "object" &&
                        Object.entries(
                          ad.customFields.features as Record<string, boolean>
                        )
                          .filter(([, value]) => value === true)
                          .map(([key]) => (
                            <Box
                              key={`feature-${key}`}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontSize: "13px",
                                color: "#333",
                              }}
                            >
                              <Box
                                sx={{
                                  color: "#4caf50",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                }}
                              >
                                ✓
                              </Box>
                              {formatFeatureName(key)}
                            </Box>
                          ))}

                      {/* DetailFeatures'dan gelen özellikler */}
                      {ad.customFields?.detailFeatures &&
                        typeof ad.customFields.detailFeatures === "object" &&
                        Object.entries(
                          ad.customFields.detailFeatures as Record<
                            string,
                            boolean
                          >
                        )
                          .filter(([, value]) => value === true)
                          .map(([key]) => (
                            <Box
                              key={`detail-${key}`}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontSize: "13px",
                                color: "#333",
                              }}
                            >
                              <Box
                                sx={{
                                  color: "#4caf50",
                                  fontWeight: "bold",
                                  fontSize: "14px",
                                }}
                              >
                                ✓
                              </Box>
                              {formatFeatureName(key)}
                            </Box>
                          ))}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Video Section - Lazy loaded */}
              {((ad.videos && ad.videos.length > 0) ||
                (adVideos && adVideos.length > 0)) && (
                <Box
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#f8f9fa",
                      px: 1.5,
                      py: 1,
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      🎬 Videolar (
                      {(adVideos.length > 0
                        ? adVideos.length
                        : ad.videos?.length) || 0}
                      )
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(auto-fit, minmax(300px, 1fr))",
                        },
                        gap: 2,
                      }}
                    >
                      {!videosLoaded && !videosLoading && (
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Button
                            onClick={fetchVideos}
                            variant="outlined"
                            sx={{ color: "#dc3545", borderColor: "#dc3545" }}
                          >
                            📹 Videoları Yükle
                          </Button>
                        </Box>
                      )}

                      {videosLoading && (
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Typography>🎬 Videolar yükleniyor...</Typography>
                        </Box>
                      )}
                      {(adVideos.length > 0 ? adVideos : ad.videos || []).map(
                        (video) => (
                          <Box
                            key={video.id}
                            sx={{
                              position: "relative",
                              borderRadius: 1,
                              overflow: "hidden",
                              border: "1px solid #e0e0e0",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            <video
                              controls
                              style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                backgroundColor: "#000",
                              }}
                              poster={video.thumbnailUrl}
                              preload="metadata"
                              playsInline
                              muted={false}
                              onError={(e) => {
                                console.error(
                                  "🚫 Video yükleme hatası:",
                                  video.id,
                                  e.nativeEvent
                                );
                              }}
                              onLoadStart={() => {
                                console.log(
                                  "▶️ Video yüklenmeye başladı:",
                                  video.id
                                );
                              }}
                              onLoadedData={() => {
                                console.log(
                                  "✅ Video data yüklendi:",
                                  video.id
                                );
                              }}
                              onCanPlay={() => {
                                console.log(
                                  "🎬 Video oynatılabilir:",
                                  video.id
                                );
                              }}
                              onLoadedMetadata={(e) => {
                                const video_element =
                                  e.target as HTMLVideoElement;
                                console.log("📊 Video metadata:", video.id, {
                                  duration: video_element.duration,
                                  videoWidth: video_element.videoWidth,
                                  videoHeight: video_element.videoHeight,
                                });
                              }}
                              src={(() => {
                                try {
                                  // Önce cache'te var mı kontrol et
                                  const cachedUrl = videoBlobUrls.get(video.id);
                                  if (cachedUrl) {
                                    console.log(
                                      "🔄 Using cached blob URL for video:",
                                      video.id
                                    );
                                    return cachedUrl;
                                  }

                                  // Güvenli kontrol: videoUrl var mı?
                                  if (!video.videoUrl) {
                                    console.warn(
                                      "Video URL bulunamadı:",
                                      video
                                    );
                                    return "";
                                  }

                                  // String değil ise hata
                                  if (typeof video.videoUrl !== "string") {
                                    console.warn(
                                      "Video URL string değil:",
                                      typeof video.videoUrl,
                                      video.videoUrl
                                    );
                                    return "";
                                  }

                                  // Eğer zaten data: ile başlıyorsa, blob URL'e çevir (daha performanslı)
                                  if (video.videoUrl.startsWith("data:")) {
                                    console.log(
                                      "🎬 Converting data URL to blob for video:",
                                      video.id,
                                      "Size:",
                                      video.videoUrl.length
                                    );

                                    try {
                                      // Data URL'den blob oluştur
                                      const [header, base64Data] =
                                        video.videoUrl.split(",");
                                      const mimeType =
                                        header.match(/:(.*?);/)?.[1] ||
                                        "video/mp4";

                                      // Base64'ü binary'ye çevir
                                      const binaryString = atob(base64Data);
                                      const bytes = new Uint8Array(
                                        binaryString.length
                                      );
                                      for (
                                        let i = 0;
                                        i < binaryString.length;
                                        i++
                                      ) {
                                        bytes[i] = binaryString.charCodeAt(i);
                                      }

                                      // Blob oluştur
                                      const blob = new Blob([bytes], {
                                        type: mimeType,
                                      });
                                      const blobUrl = URL.createObjectURL(blob);

                                      // Cache blob URL - async olarak
                                      setTimeout(() => {
                                        setVideoBlobUrls((prev) => {
                                          const newMap = new Map(prev);
                                          newMap.set(video.id, blobUrl);
                                          return newMap;
                                        });
                                      }, 0);

                                      console.log(
                                        "✅ Blob URL created for video:",
                                        video.id,
                                        "Blob size:",
                                        blob.size
                                      );
                                      return blobUrl;
                                    } catch (blobError) {
                                      console.error(
                                        "❌ Blob conversion failed, using original data URL:",
                                        blobError
                                      );
                                      return video.videoUrl;
                                    }
                                  }

                                  // Base64 string ise data: prefix ekle
                                  const mimeType =
                                    video.mimeType || "video/mp4";
                                  const dataUrl = `data:${mimeType};base64,${video.videoUrl}`;
                                  console.log(
                                    "🎬 Created data URL for video:",
                                    video.id,
                                    "Size:",
                                    dataUrl.length
                                  );
                                  return dataUrl;
                                } catch (error) {
                                  console.error(
                                    "Video URL oluşturma hatası:",
                                    error
                                  );
                                  return "";
                                }
                              })()}
                            >
                              Tarayıcınız bu video formatını desteklemiyor.
                            </video>
                            {video.description && (
                              <Box sx={{ p: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#666", fontSize: "11px" }}
                                >
                                  {video.description}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Container>

        {/* Similar Ads Section */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#333",
                mb: 3,
                fontSize: "20px",
              }}
            >
              Benzer İlanlar
            </Typography>

            {similarAdsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  "&:hover .scroll-container": {
                    animationPlayState: "paused",
                  },
                }}
              >
                <Box
                  className="scroll-container"
                  sx={{
                    display: "flex",
                    gap: 2,
                    width: "fit-content",
                    animation: "scrollRight 30s linear infinite",
                    // Tıklamayı engellemeyecek şekilde ayarlayalım
                    pointerEvents: "auto",
                    "@keyframes scrollRight": {
                      "0%": {
                        transform: "translateX(0)",
                      },
                      "100%": {
                        transform: "translateX(-50%)",
                      },
                    },
                  }}
                >
                  {/* İlanları iki kez göster (sonsuz döngü efekti için) */}
                  {[...similarAds, ...similarAds].map((similarAd, index) => (
                    <Card
                      key={`${similarAd.id}-${index}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(
                          "Benzer ilan tıklandı:",
                          similarAd.id,
                          "Mevcut ID:",
                          id
                        );
                        // Aynı ilan ID'sine gitmemek için kontrol
                        if (similarAd.id !== Number(id)) {
                          console.log(
                            "Navigate ediliyor:",
                            `/ad/${similarAd.id}`
                          );
                          // React Router navigate kullan
                          navigate(`/ad/${similarAd.id}`);
                          // Sayfayı en üste kaydır
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }, 100);
                        } else {
                          console.log("Aynı ilan, navigate edilmiyor");
                        }
                      }}
                      sx={{
                        minWidth: 200,
                        maxWidth: 200,
                        borderRadius: 1,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        height: 235,
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(211, 66, 55, 0.15)",
                          backgroundColor: "rgba(211, 66, 55, 0.02)",
                          transform: "translateY(-2px)",
                          borderColor: "rgba(211, 66, 55, 0.3)",
                        },
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        // Tıklamayı garanti altına alalım
                        pointerEvents: "auto",
                        zIndex: 10,
                        position: "relative",
                      }}
                    >
                      {/* Vitrin Görseli */}
                      <Box
                        component="div"
                        sx={{
                          height: 120,
                          backgroundColor: "#f8f9fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                          padding: "8px",
                        }}
                      >
                        {getImageUrl(similarAd.images) ? (
                          <LazyImage
                            src={getImageUrl(similarAd.images)!}
                            alt={similarAd.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                            placeholder="/placeholder-image.jpg"
                          />
                        ) : (
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
                      </Box>

                      <Box
                        sx={{
                          p: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          height: "auto",
                        }}
                      >
                        {/* İlan Başlığı */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            fontSize: "13px",
                            color: "#333",
                            lineHeight: 1.3,
                            mb: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minHeight: "32px",
                          }}
                        >
                          {similarAd.title}
                        </Typography>

                        {/* Konum ve Model Yılı - Alt alta */}
                        <Box sx={{ mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "12px",
                              color: "#666",
                              display: "block",
                            }}
                          >
                            {similarAd.city?.name ||
                              similarAd.district?.name ||
                              "Belirtilmemiş"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "12px",
                              color: "#666",
                              display: "block",
                            }}
                          >
                            {similarAd.year
                              ? `Model Yılı: ${similarAd.year}`
                              : similarAd.model?.name ||
                                similarAd.brand?.name ||
                                "Model"}
                          </Typography>
                        </Box>

                        {/* Fiyat - Sağ Alt Köşe */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 2,
                            right: 14,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: "14px",
                              color: "#dc3545",
                            }}
                          >
                            {similarAd.price
                              ? `${formatPrice(similarAd.price)} TL`
                              : "Fiyat Yok"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {similarAds.length === 0 && !similarAdsLoading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Benzer ilan bulunamadı.
                </Typography>
              </Box>
            )}
          </Box>
        </Container>

        {/* Complaint Modal */}
        {ad && (
          <ComplaintModal
            open={showComplaintModal}
            onClose={() => setShowComplaintModal(false)}
            adId={ad.id}
            adTitle={ad.title}
          />
        )}
      </Box>
    </Box>
  );
};

export default AdDetail;
