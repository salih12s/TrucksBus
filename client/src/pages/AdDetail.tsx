import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatPrice as formatPriceUtil } from "../utils/formatPrice";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  LocationOn,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  FavoriteBorder,
  Favorite,
  LocalShipping,
  PictureAsPdf,
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
  currency?: string;
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
    new Map(),
  );
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });

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
          `${apiClient.defaults.baseURL}/ads/${id}`,
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
          adResponse.statusText,
        );
        const data = adResponse.data as Ad;

        console.log("🔍 API Response data:", data);
        console.log("🔍 Data type:", typeof data);
        console.log(
          "🔍 Data keys:",
          data ? Object.keys(data) : "null/undefined",
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

        // 🔍 DEBUG: Log customFields to help debug missing fields
        console.log("🔍 DEBUG customFields:", data.customFields);
        console.log(
          "🔍 All customFields keys:",
          data.customFields ? Object.keys(data.customFields) : "null",
        );
        console.log("🔍 tireCondition:", data.customFields?.tireCondition);
        console.log("🔍 lastikDurumu:", data.customFields?.lastikDurumu);
        console.log("🔍 kapakYuksekligi:", data.customFields?.kapakYuksekligi);
        console.log("🔍 krikoAyak:", data.customFields?.krikoAyak);
        console.log("🔍 takasli:", data.customFields?.takasli);

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
              .catch(() => {}), // Silent fail
          );
        }

        // Run instant operations in background
        Promise.all(instantOperations).finally(() => {
          const totalTime = performance.now() - startTime;
          console.log(
            `⚡ Total Detail Page Load Time: ${totalTime.toFixed(2)}ms`,
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
              (err.response as Record<string, unknown>).status,
            );
            console.error(
              "❌ Response headers:",
              (err.response as Record<string, unknown>).headers,
            );
            console.error(
              "❌ Response data:",
              (err.response as Record<string, unknown>).data,
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
        (video) => video && !video.videoUrl && video.id,
      );

      if (hasVideoWithoutUrl) {
        console.log(
          "🎥 Auto-fetching videos - metadata exists but videoUrl missing",
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

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("tr-TR").format(mileage);
  };

  const getImageUrl = (
    images?: (string | { imageUrl: string; isPrimary?: boolean })[],
  ): string => {
    if (!images || images.length === 0) {
      return "https://via.placeholder.com/400x300/f0f0f0/999999?text=Resim+Yok";
    }

    // Önce vitrin resmini (isPrimary: true) ara
    let selectedImage = images.find(
      (img) => typeof img === "object" && img.isPrimary === true,
    );

    // Vitrin resmi yoksa ilk resmi al
    if (!selectedImage) {
      selectedImage = images[0];
    }

    // Eğer object ise imageUrl property'sini al
    let imageUrl: string;
    if (typeof selectedImage === "object" && selectedImage.imageUrl) {
      imageUrl = selectedImage.imageUrl;
    } else if (typeof selectedImage === "string") {
      imageUrl = selectedImage;
    } else {
      return "https://via.placeholder.com/400x300/f0f0f0/999999?text=Hatalı+Resim";
    }

    // URL güvenlik kontrolü
    if (!imageUrl || typeof imageUrl !== "string") {
      return "https://via.placeholder.com/400x300/f0f0f0/999999?text=Resim+Yok";
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
      // Oto Kurtarıcı Özellikleri
      hidrolikDireksiyon: "Hidrolik Direksiyon",
      havaYastigi: "Hava Yastığı",
      tepeLambasi: "Tepe Lambası",
      takograf: "Takograf",
      havaliFreni: "Havalı Freni",
      motorFreni: "Motor Freni",
      merkeziKilit: "Merkezi Kilit",
      vinc: "Vinç",
      kaldirmaPlatformu: "Kaldırma Platformu",
      hidrolikSistem: "Hidrolik Sistem",
      uzaktanKumanda: "Uzaktan Kumanda",
      // Çekici Ekipmanları
      kayarPlatform: "Kayar Platform",
      palet: "Palet",
      rampa: "Rampa",
      makara: "Makara",
      ahtapotVinc: "Ahtapot Vinç",
      gozluk: "Gözlük",
      hiUp: "Hi-Up",
      // Ek Ekipmanlar
      pistonAyak: "Piston Ayak",
      takoz: "Takoz",
      sabitlemeHalati: "Sabitleme Halatı",
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
                alignItems: { xs: "flex-start", md: "center" },
                gap: { xs: 1.5, md: 3 },
                mb: 3,
                flexWrap: "wrap",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              {/* Back Button */}
              <Button
                variant="outlined"
                startIcon={<ArrowBackIos />}
                onClick={() => navigate(-1)}
                size="small"
                sx={{
                  borderColor: "#007bff",
                  color: "#007bff",
                  fontSize: { xs: "12px", md: "14px" },
                  "&:hover": {
                    backgroundColor: "#007bff",
                    color: "white",
                  },
                }}
              >
                Geri Dön
              </Button>

              {/* Ad Info - Wrapped in flex container for mobile */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 1, md: 3 },
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{ fontSize: { xs: "12px", md: "14px" }, color: "#666" }}
                >
                  <strong>İlan No:</strong> #{ad.id || "56"}
                </Box>
                <Box
                  sx={{ fontSize: { xs: "12px", md: "14px" }, color: "#666" }}
                >
                  <strong>İlan Tarihi:</strong>{" "}
                  {ad.createdAt
                    ? new Date(ad.createdAt).toLocaleDateString("tr-TR")
                    : "22.09.2025"}
                </Box>
                <Box
                  sx={{ fontSize: { xs: "12px", md: "14px" }, color: "#666" }}
                >
                  <strong>Kategori:</strong>{" "}
                  {ad.category?.name || "Minibüs & Midibüs"}
                </Box>

                {/* Marka gösterimi - Dorse, Römork, Oto Kurtarıcı ve diğer kategoriler için */}
                <Box
                  sx={{ fontSize: { xs: "12px", md: "14px" }, color: "#666" }}
                >
                  <strong>
                    {ad.category?.name?.toLowerCase() === "dorse"
                      ? "Dorse Markası:"
                      : ad.category?.name?.toLowerCase() === "römork"
                        ? "Römork Markası:"
                        : ad.category?.name?.includes("Oto Kurtarıcı")
                          ? "Araç Markası:"
                          : "Marka:"}
                  </strong>{" "}
                  {ad.category?.name?.toLowerCase() === "dorse"
                    ? (ad.customFields?.dorseBrand as string) || "Belirtilmemiş"
                    : ad.category?.name?.toLowerCase() === "römork"
                      ? (ad.customFields?.romorkMarkasi as string) ||
                        "Belirtilmemiş"
                      : ad.category?.name?.includes("Oto Kurtarıcı")
                        ? (ad.customFields?.vehicleBrandName as string) ||
                          "Belirtilmemiş"
                        : ad.brand?.name || "Volkswagen"}
                </Box>
              </Box>

              {/* Tipi ve Variant bilgileri sadece Dorse, Römork ve Oto Kurtarıcı kategorisi DIŞINDA gösterilir */}
              {ad.category?.name?.toLowerCase() !== "dorse" &&
                ad.category?.name?.toLowerCase() !== "römork" &&
                !ad.category?.name?.includes("Oto Kurtarıcı") && (
                  <>
                    {ad.model?.name && (
                      <Box sx={{ fontSize: "14px", color: "#666" }}>
                        <strong>Tipi:</strong> {ad.model.name}
                      </Box>
                    )}
                    {ad.variant?.name && (
                      <Box sx={{ fontSize: "14px", color: "#666" }}>
                        <strong>Variant:</strong> {ad.variant.name}
                      </Box>
                    )}
                  </>
                )}
            </Box>

            {/* Main Title and Price */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "18px", md: "24px" },
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
                    fontSize: { xs: "22px", md: "28px" },
                    fontWeight: "bold",
                    color: "#dc3545",
                  }}
                >
                  {formatPriceUtil(ad.price, ad.currency)}
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
                          height: { xs: 280, sm: 350, md: 400 },
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
                                  "tr-TR",
                                )
                              : null,
                          },
                          {
                            label: "Kategori",
                            value: ad.category?.name || null,
                          },
                          {
                            label: "Marka",
                            value: (() => {
                              // Özel kategoriler için customFields'dan al
                              if (
                                ad.category?.name?.toLowerCase() === "dorse"
                              ) {
                                return (
                                  (ad.customFields?.dorseBrand as string) ||
                                  null
                                );
                              } else if (
                                ad.category?.name?.toLowerCase() === "römork"
                              ) {
                                return (
                                  (ad.customFields?.romorkMarkasi as string) ||
                                  null
                                );
                              } else if (
                                ad.category?.name?.includes("Oto Kurtarıcı")
                              ) {
                                return (
                                  (ad.customFields
                                    ?.vehicleBrandName as string) || null
                                );
                              }
                              // Diğer kategoriler için brand ilişkisinden al
                              return ad.brand?.name || null;
                            })(),
                          },
                          {
                            label: "Model (Tip)",
                            value: (() => {
                              // Dorse, Römork ve Oto Kurtarıcı için model gösterme
                              if (
                                ad.category?.name?.toLowerCase() === "dorse" ||
                                ad.category?.name?.toLowerCase() === "römork" ||
                                ad.category?.name?.includes("Oto Kurtarıcı")
                              ) {
                                return null;
                              }
                              return ad.model?.name || null;
                            })(),
                          },
                          {
                            label: "Fiyat",
                            value: ad.price
                              ? formatPriceUtil(ad.price, ad.currency)
                              : null,
                          },
                          {
                            label: "Yıl",
                            value: ad.year ? `${ad.year}` : null,
                          },
                          {
                            label: "KM",
                            value: ad.mileage
                              ? `${formatMileage(ad.mileage)} km`
                              : null,
                          },
                          {
                            label: "Görüntülenme",
                            value: ad.viewCount ? `${ad.viewCount}` : null,
                          },

                          // Oto Kurtarıcı Özel Alanları (Category ID = 9)
                          ...(ad.category?.id === 9
                            ? [
                                {
                                  label: "Araç Markası",
                                  value:
                                    (ad.customFields
                                      ?.vehicleBrandName as string) || null,
                                },
                                {
                                  label: "Motor Hacmi",
                                  value: ad.customFields?.engineVolume
                                    ? `${ad.customFields.engineVolume} cc`
                                    : null,
                                },
                                {
                                  label: "Maksimum Güç",
                                  value: ad.maxPower
                                    ? `${ad.maxPower} HP`
                                    : ad.customFields?.maxPower
                                      ? `${ad.customFields.maxPower} HP`
                                      : null,
                                },
                                {
                                  label: "Maksimum Tork",
                                  value:
                                    ad.maxTorque ||
                                    ad.customFields?.maxTorque ||
                                    null,
                                },
                                {
                                  label: "Yakıt Tipi",
                                  value: (() => {
                                    const fuelType =
                                      ad.fuelType || ad.customFields?.fuelType;
                                    if (!fuelType) return null;
                                    if (typeof fuelType !== "string")
                                      return null;
                                    const fuelMap: Record<string, string> = {
                                      GASOLINE: "Benzinli",
                                      GASOLINE_LPG: "Benzinli + LPG",
                                      DIESEL: "Dizel",
                                      DIESEL_LPG: "Dizel + LPG",
                                    };
                                    return fuelMap[fuelType] || fuelType;
                                  })(),
                                },
                                {
                                  label: "Platform Uzunluğu",
                                  value: ad.platformLength
                                    ? `${ad.platformLength} m`
                                    : ad.customFields?.platformLength
                                      ? `${ad.customFields.platformLength} m`
                                      : null,
                                },
                                {
                                  label: "Platform Genişliği",
                                  value: ad.platformWidth
                                    ? `${ad.platformWidth} m`
                                    : ad.customFields?.platformWidth
                                      ? `${ad.customFields.platformWidth} m`
                                      : null,
                                },
                                {
                                  label: "Maksimum Araç Kapasitesi",
                                  value:
                                    ad.customFields?.maxVehicleCapacity || null,
                                },
                                {
                                  label: "İstiab Haddi",
                                  value: ad.loadCapacity
                                    ? `${ad.loadCapacity} t`
                                    : ad.customFields?.loadCapacity
                                      ? `${ad.customFields.loadCapacity} t`
                                      : null,
                                },
                                {
                                  label: "Araç Plakası",
                                  value:
                                    ad.plateNumber ||
                                    ad.customFields?.plateNumber ||
                                    null,
                                },
                                {
                                  label: "Takas",
                                  value: (() => {
                                    if (ad.customFields?.exchange === "evet")
                                      return "Evet";
                                    if (ad.customFields?.exchange === "hayir")
                                      return "Hayır";
                                    return null;
                                  })(),
                                },
                              ]
                            : []),

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

                          // Araç Detayları
                          {
                            label: "Durum",
                            value: ad.customFields?.condition || null,
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
                                ad.customFields?.enginePower,
                                ad.customFields?.motorPower,
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
                                  // Sadece sayısal değer ve hp ekini kontrol et
                                  const value = source.toString().trim();
                                  // Eğer sadece sayı varsa "hp" ekle
                                  if (/^\d+$/.test(value)) {
                                    return `${value} hp`;
                                  }
                                  return value;
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
                            label: "Lastik Durumu",
                            value: (() => {
                              const tireCondition =
                                ad.customFields?.tireCondition ||
                                ad.customFields?.lastikDurumu;
                              return tireCondition ? `%${tireCondition}` : null;
                            })(),
                          },

                          // Minivan & Panelvan Özel Alanları (Category ID: 10)
                          {
                            label: "Kasa Tipi",
                            value:
                              ad.category?.id === 10
                                ? ad.customFields?.bodyType || null
                                : null,
                          },
                          {
                            label: "Ruhsat",
                            value:
                              ad.category?.id === 10
                                ? ad.customFields?.licenseType || null
                                : null,
                          },
                          {
                            label: "Plaka / Uyruk",
                            value:
                              ad.category?.id === 10
                                ? ad.customFields?.plateType || null
                                : null,
                          },
                          {
                            label: "Plaka Numarası",
                            value:
                              ad.category?.id === 10
                                ? ad.customFields?.plateNumber || null
                                : null,
                          },
                          {
                            label: "Takas",
                            value:
                              ad.category?.id === 10
                                ? ad.customFields?.exchange || null
                                : null,
                          },

                          // Hasar ve Tramer Kaydı (KonteynerTasiyiciSasiGrubu formları hariç)
                          ...(![
                            "KilcikSasi",
                            "DamperSasi",
                            "TankerSasi",
                            "PlatformSasi",
                            "RomorkKonvantoru",
                            "UzayabilirSasi",
                          ].includes(ad.customFields?.subType as string)
                            ? [
                                {
                                  label: "Hasar Kaydı",
                                  value: (() => {
                                    // Önce direkt ad objesi üzerinden kontrol et
                                    if (ad.hasAccidentRecord === true) {
                                      return "Var";
                                    } else if (ad.hasAccidentRecord === false) {
                                      return "Yok";
                                    }

                                    // Çekici için damageRecord kontrol et
                                    if (ad.customFields?.damageRecord) {
                                      return ad.customFields.damageRecord ===
                                        "evet"
                                        ? "Var"
                                        : "Yok";
                                    }

                                    // Fallback olarak customFields'tan kontrol et
                                    if (
                                      ad.customFields?.hasAccidentRecord ===
                                        "evet" ||
                                      ad.customFields?.hasAccidentRecord ===
                                        true
                                    ) {
                                      return "Var";
                                    } else if (
                                      ad.customFields?.hasAccidentRecord ===
                                        "hayir" ||
                                      ad.customFields?.hasAccidentRecord ===
                                        false
                                    ) {
                                      return "Yok";
                                    }
                                    return null;
                                  })(),
                                },
                                {
                                  label: "Tramer Kaydı",
                                  value: (() => {
                                    // Tramer kaydı artık rakam olarak saklanıyor
                                    const tramerValue =
                                      ad.customFields?.tramerRecord ||
                                      ad.customFields?.hasTramerRecord;

                                    // Eğer rakam ise direkt göster
                                    if (
                                      tramerValue &&
                                      !isNaN(Number(tramerValue))
                                    ) {
                                      return `${tramerValue} TL`;
                                    }

                                    // Eski sistemle uyumluluk (Var/Yok değerleri)
                                    if (
                                      tramerValue === "evet" ||
                                      tramerValue === true
                                    ) {
                                      return "Var";
                                    } else if (
                                      tramerValue === "hayir" ||
                                      tramerValue === false
                                    ) {
                                      return "Yok";
                                    }

                                    return null;
                                  })(),
                                },
                              ]
                            : []),

                          // Kamyon Römork ve Tarım Römork Özel Alanları
                          {
                            label: "Hacim (Litre)",
                            value: ad.customFields?.volume
                              ? `${ad.customFields.volume} L`
                              : null,
                          },
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

                          // Tanker Özel Alanları
                          {
                            label: "Hacim",
                            value: ad.customFields?.hacim
                              ? `${ad.customFields.hacim} L`
                              : null,
                          },
                          {
                            label: "Göz Sayısı",
                            value: ad.customFields?.gozSayisi
                              ? `${ad.customFields.gozSayisi} adet`
                              : null,
                          },
                          {
                            label: "Soğutucu Durumu",
                            value: ad.customFields?.sogutucu || null,
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
                            value:
                              ad.category?.id === 10
                                ? null // Minivan için gösterme, çünkü özel alanında var
                                : (() => {
                                    const plateType =
                                      ad.customFields?.plateType ||
                                      ad.plateType;
                                    const plateNumber =
                                      ad.customFields?.plateNumber ||
                                      ad.plateNumber;

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
                                        ad.customFields.rampaMekanizmasi,
                                      );
                                      return Array.isArray(parsed)
                                        ? parsed.join(", ")
                                        : ad.customFields.rampaMekanizmasi;
                                    } else if (
                                      Array.isArray(
                                        ad.customFields.rampaMekanizmasi,
                                      )
                                    ) {
                                      return ad.customFields.rampaMekanizmasi.join(
                                        ", ",
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

                          // Silobas Özel Alanları
                          {
                            label: "Silobas Türü",
                            value: ad.customFields?.silobasTuru || null,
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
                            label: "Takas",
                            value:
                              ad.category?.id === 10 || ad.category?.id === 9
                                ? null // Minivan ve Oto Kurtarıcı için gösterme, özel alanlarında var
                                : (() => {
                                    // Önce takasli field'ını kontrol et (Tanker vb için)
                                    if (ad.customFields?.takasli) {
                                      return ad.customFields.takasli ===
                                        "evet" ||
                                        ad.customFields.takasli === true
                                        ? "Evet"
                                        : "Hayır";
                                    }
                                    // Sonra isExchangeable kontrol et
                                    if (
                                      ad.customFields?.isExchangeable !==
                                      undefined
                                    ) {
                                      return ad.customFields.isExchangeable ===
                                        true ||
                                        ad.customFields.isExchangeable ===
                                          "evet"
                                        ? "Evet"
                                        : "Hayır";
                                    }
                                    // En son exchange field'ı
                                    if (ad.customFields?.exchange) {
                                      return ad.customFields.exchange ===
                                        "true" ||
                                        ad.customFields.exchange === "evet"
                                        ? "Evet"
                                        : "Hayır";
                                    }
                                    return ad.takas || null;
                                  })(),
                          },
                          { label: "Hasar Durumu", value: ad.damage || null },

                          // KonteynerTasiyiciSasiGrubu - Kılçık Şasi Özel Alanları
                          ...(ad.customFields?.subType === "KilcikSasi"
                            ? [
                                {
                                  label: "Form Tipi",
                                  value: "Kılçık Şasi",
                                },
                                {
                                  label: "Dorse Markası",
                                  value: ad.customFields?.dorseBrand || null,
                                },
                                {
                                  label: "Aks Sayısı",
                                  value: ad.customFields?.axleCount
                                    ? `${ad.customFields.axleCount} Aks`
                                    : null,
                                },
                                {
                                  label: "Yük Kapasitesi",
                                  value: ad.customFields?.loadCapacity
                                    ? `${ad.customFields.loadCapacity} ton`
                                    : null,
                                },
                                {
                                  label: "Kanca Tipi",
                                  value: ad.customFields?.hookType || null,
                                },
                                {
                                  label: "Hidrolik Sistem",
                                  value: ad.customFields?.hydraulicSystem
                                    ? ad.customFields.hydraulicSystem === "evet"
                                      ? "Var"
                                      : "Yok"
                                    : null,
                                },
                                {
                                  label: "Lastik Durumu",
                                  value: ad.customFields?.tireCondition
                                    ? `%${ad.customFields.tireCondition}`
                                    : null,
                                },
                              ]
                            : []),

                          // KonteynerTasiyiciSasiGrubu - Damper Şasi Özel Alanları
                          ...(ad.customFields?.subType === "DamperSasi"
                            ? [
                                {
                                  label: "Form Tipi",
                                  value: "Damper Şasi",
                                },
                                {
                                  label: "Dorse Markası",
                                  value: ad.customFields?.dorseBrand || null,
                                },
                                {
                                  label: "Aks Sayısı",
                                  value: ad.customFields?.axleCount
                                    ? `${ad.customFields.axleCount} Aks`
                                    : null,
                                },
                                {
                                  label: "Yük Kapasitesi",
                                  value: ad.customFields?.loadCapacity
                                    ? `${ad.customFields.loadCapacity} ton`
                                    : null,
                                },
                                {
                                  label: "Damper Kapasitesi",
                                  value: ad.customFields?.damperCapacity
                                    ? `${ad.customFields.damperCapacity} m³`
                                    : null,
                                },
                                {
                                  label: "Hidrolik Sistem",
                                  value: ad.customFields?.hydraulicSystem
                                    ? ad.customFields.hydraulicSystem === "evet"
                                      ? "Var"
                                      : "Yok"
                                    : null,
                                },
                                {
                                  label: "Lastik Durumu",
                                  value: ad.customFields?.tireCondition
                                    ? `%${ad.customFields.tireCondition}`
                                    : null,
                                },
                              ]
                            : []),

                          // KonteynerTasiyiciSasiGrubu - Tanker Şasi Özel Alanları
                          ...(ad.customFields?.subType === "TankerSasi"
                            ? [
                                {
                                  label: "Form Tipi",
                                  value: "Tanker Şasi",
                                },
                                {
                                  label: "Dorse Markası",
                                  value: ad.customFields?.dorseBrand || null,
                                },
                                {
                                  label: "Aks Sayısı",
                                  value: ad.customFields?.axleCount
                                    ? `${ad.customFields.axleCount} Aks`
                                    : null,
                                },
                                {
                                  label: "Yük Kapasitesi",
                                  value: ad.customFields?.loadCapacity
                                    ? `${ad.customFields.loadCapacity} ton`
                                    : null,
                                },
                                {
                                  label: "Tank Kapasitesi",
                                  value: ad.customFields?.tankCapacity
                                    ? `${ad.customFields.tankCapacity} L`
                                    : null,
                                },
                                {
                                  label: "Tank Malzemesi",
                                  value: ad.customFields?.tankMaterial || null,
                                },
                                {
                                  label: "Hidrolik Sistem",
                                  value: ad.customFields?.hydraulicSystem
                                    ? ad.customFields.hydraulicSystem === "evet"
                                      ? "Var"
                                      : "Yok"
                                    : null,
                                },
                                {
                                  label: "Lastik Durumu",
                                  value: ad.customFields?.tireCondition
                                    ? `%${ad.customFields.tireCondition}`
                                    : null,
                                },
                              ]
                            : []),

                          // KonteynerTasiyiciSasiGrubu - Platform Şasi Özel Alanları
                          ...(ad.customFields?.subType === "PlatformSasi"
                            ? [
                                {
                                  label: "Form Tipi",
                                  value: "Platform Şasi",
                                },
                                {
                                  label: "Dorse Markası",
                                  value: ad.customFields?.dorseBrand || null,
                                },
                                {
                                  label: "Aks Sayısı",
                                  value: ad.customFields?.axleCount
                                    ? `${ad.customFields.axleCount} Aks`
                                    : null,
                                },
                                {
                                  label: "Yük Kapasitesi",
                                  value: ad.customFields?.loadCapacity
                                    ? `${ad.customFields.loadCapacity} ton`
                                    : null,
                                },
                                {
                                  label: "Platform Uzunluğu",
                                  value: ad.customFields?.platformLength
                                    ? `${ad.customFields.platformLength} m`
                                    : null,
                                },
                                {
                                  label: "Platform Genişliği",
                                  value: ad.customFields?.platformWidth
                                    ? `${ad.customFields.platformWidth} m`
                                    : null,
                                },
                                {
                                  label: "Hidrolik Sistem",
                                  value: ad.customFields?.hydraulicSystem
                                    ? ad.customFields.hydraulicSystem === "evet"
                                      ? "Var"
                                      : "Yok"
                                    : null,
                                },
                                {
                                  label: "Lastik Durumu",
                                  value: ad.customFields?.tireCondition
                                    ? `%${ad.customFields.tireCondition}`
                                    : null,
                                },
                              ]
                            : []),

                          // KonteynerTasiyiciSasiGrubu - Römork Konvantörü Özel Alanları
                          ...(ad.customFields?.subType === "RomorkKonvantoru"
                            ? [
                                {
                                  label: "Form Tipi",
                                  value: "Römork Konvantörü",
                                },
                                {
                                  label: "Dorse Markası",
                                  value: ad.customFields?.dorseBrand || null,
                                },
                                {
                                  label: "Aks Sayısı",
                                  value: ad.customFields?.axleCount
                                    ? `${ad.customFields.axleCount} Aks`
                                    : null,
                                },
                                {
                                  label: "Yük Kapasitesi",
                                  value: ad.customFields?.loadCapacity
                                    ? `${ad.customFields.loadCapacity} ton`
                                    : null,
                                },
                                {
                                  label: "Konveyör Uzunluğu",
                                  value: ad.customFields?.conveyorLength
                                    ? `${ad.customFields.conveyorLength} m`
                                    : null,
                                },
                                {
                                  label: "Konveyör Tipi",
                                  value: ad.customFields?.conveyorType || null,
                                },
                                {
                                  label: "Lastik Durumu",
                                  value: ad.customFields?.tireCondition
                                    ? `%${ad.customFields.tireCondition}`
                                    : null,
                                },
                              ]
                            : []),

                          // KonteynerTasiyiciSasiGrubu - Uzayabilir Şasi Özel Alanları
                          ...(ad.customFields?.subType === "UzayabilirSasi"
                            ? [
                                {
                                  label: "Form Tipi",
                                  value: "Uzayabilir Şasi",
                                },
                                {
                                  label: "Dorse Markası",
                                  value: ad.customFields?.dorseBrand || null,
                                },
                                {
                                  label: "Aks Sayısı",
                                  value: ad.customFields?.axleCount
                                    ? `${ad.customFields.axleCount} Aks`
                                    : null,
                                },
                                {
                                  label: "Yük Kapasitesi",
                                  value: ad.customFields?.loadCapacity
                                    ? `${ad.customFields.loadCapacity} ton`
                                    : null,
                                },
                                {
                                  label: "Uzatma Uzunluğu",
                                  value: ad.customFields?.extensionLength
                                    ? `${ad.customFields.extensionLength} m`
                                    : null,
                                },
                                {
                                  label: "Uzatma Sistemi",
                                  value:
                                    ad.customFields?.extensionSystem || null,
                                },
                                {
                                  label: "Lastik Durumu",
                                  value: ad.customFields?.tireCondition
                                    ? `%${ad.customFields.tireCondition}`
                                    : null,
                                },
                              ]
                            : []),

                          // Dynamic fields removed for performance
                        ]
                          .filter(
                            (item) =>
                              item.value !== null &&
                              item.value !== "" &&
                              item.value !== undefined,
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
                                searchQuery,
                              )}`,
                              "_blank",
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
                                cityName + " " + districtName,
                              )}`,
                              "_blank",
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
                  typeof ad.customFields.detailFeatures === "object") ||
                (ad.category?.id === 9 &&
                  ((ad.customFields?.cekiciEkipmani &&
                    typeof ad.customFields.cekiciEkipmani === "object") ||
                    (ad.customFields?.ekEkipmanlar &&
                      typeof ad.customFields.ekEkipmanlar === "object"))) ||
                (ad.category?.id === 10 &&
                  ad.customFields?.detailFeatures &&
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
                      {ad.category?.id === 9
                        ? "Araç Özellikleri ve Ekipmanlar"
                        : ad.category?.id === 10
                          ? "Donanım Bilgisi"
                          : "Araç Özellikleri"}
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
                          ad.customFields.features as Record<string, boolean>,
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

                      {/* DetailFeatures'dan gelen özellikler (Minivan için) */}
                      {ad.customFields?.detailFeatures &&
                        typeof ad.customFields.detailFeatures === "object" &&
                        (() => {
                          const detailFeatures = ad.customFields
                            .detailFeatures as Record<
                            string,
                            Record<string, boolean> | boolean
                          >;
                          const allFeatures: string[] = [];

                          // safetyFeatures, interiorFeatures, exteriorFeatures, multimediaFeatures'ı birleştir
                          if (detailFeatures.safetyFeatures) {
                            Object.entries(
                              detailFeatures.safetyFeatures as Record<
                                string,
                                boolean
                              >,
                            )
                              .filter(([, value]) => value === true)
                              .forEach(([key]) => allFeatures.push(key));
                          }
                          if (detailFeatures.interiorFeatures) {
                            Object.entries(
                              detailFeatures.interiorFeatures as Record<
                                string,
                                boolean
                              >,
                            )
                              .filter(([, value]) => value === true)
                              .forEach(([key]) => allFeatures.push(key));
                          }
                          if (detailFeatures.exteriorFeatures) {
                            Object.entries(
                              detailFeatures.exteriorFeatures as Record<
                                string,
                                boolean
                              >,
                            )
                              .filter(([, value]) => value === true)
                              .forEach(([key]) => allFeatures.push(key));
                          }
                          if (detailFeatures.multimediaFeatures) {
                            Object.entries(
                              detailFeatures.multimediaFeatures as Record<
                                string,
                                boolean
                              >,
                            )
                              .filter(([, value]) => value === true)
                              .forEach(([key]) => allFeatures.push(key));
                          }

                          // Eğer nested değilse (eski format), direkt göster
                          if (
                            allFeatures.length === 0 &&
                            !detailFeatures.safetyFeatures &&
                            !detailFeatures.interiorFeatures &&
                            !detailFeatures.exteriorFeatures &&
                            !detailFeatures.multimediaFeatures
                          ) {
                            return Object.entries(
                              detailFeatures as Record<string, boolean>,
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
                              ));
                          }

                          // Nested format için tüm özellikleri göster
                          return allFeatures.map((key) => (
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
                          ));
                        })()}

                      {/* Oto Kurtarıcı Çekici Ekipmanları */}
                      {ad.category?.id === 9 &&
                        ad.customFields?.cekiciEkipmani &&
                        typeof ad.customFields.cekiciEkipmani === "object" &&
                        Object.entries(
                          ad.customFields.cekiciEkipmani as Record<
                            string,
                            boolean
                          >,
                        )
                          .filter(([, value]) => value === true)
                          .map(([key]) => (
                            <Box
                              key={`cekici-${key}`}
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

                      {/* Oto Kurtarıcı Ek Ekipmanlar */}
                      {ad.category?.id === 9 &&
                        ad.customFields?.ekEkipmanlar &&
                        typeof ad.customFields.ekEkipmanlar === "object" &&
                        Object.entries(
                          ad.customFields.ekEkipmanlar as Record<
                            string,
                            boolean
                          >,
                        )
                          .filter(([, value]) => value === true)
                          .map(([key]) => (
                            <Box
                              key={`ekekipman-${key}`}
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

                      {/* Oto Kurtarıcı Detail Features (Çoklu Araç/Tekli Araç formları için) */}
                      {ad.category?.id === 9 &&
                        ad.customFields?.detailFeatures &&
                        typeof ad.customFields.detailFeatures === "object" &&
                        !ad.customFields?.cekiciEkipmani &&
                        !ad.customFields?.ekEkipmanlar &&
                        Object.entries(
                          ad.customFields.detailFeatures as Record<
                            string,
                            boolean
                          >,
                        )
                          .filter(([, value]) => value === true)
                          .map(([key]) => (
                            <Box
                              key={`otodetail-${key}`}
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
                                  e.nativeEvent,
                                );
                              }}
                              onLoadStart={() => {
                                console.log(
                                  "▶️ Video yüklenmeye başladı:",
                                  video.id,
                                );
                              }}
                              onLoadedData={() => {
                                console.log(
                                  "✅ Video data yüklendi:",
                                  video.id,
                                );
                              }}
                              onCanPlay={() => {
                                console.log(
                                  "🎬 Video oynatılabilir:",
                                  video.id,
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
                                      video.id,
                                    );
                                    return cachedUrl;
                                  }

                                  // Güvenli kontrol: videoUrl var mı?
                                  if (!video.videoUrl) {
                                    console.warn(
                                      "Video URL bulunamadı:",
                                      video,
                                    );
                                    return "";
                                  }

                                  // String değil ise hata
                                  if (typeof video.videoUrl !== "string") {
                                    console.warn(
                                      "Video URL string değil:",
                                      typeof video.videoUrl,
                                      video.videoUrl,
                                    );
                                    return "";
                                  }

                                  // Eğer zaten data: ile başlıyorsa, blob URL'e çevir (daha performanslı)
                                  if (video.videoUrl.startsWith("data:")) {
                                    console.log(
                                      "🎬 Converting data URL to blob for video:",
                                      video.id,
                                      "Size:",
                                      video.videoUrl.length,
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
                                        binaryString.length,
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
                                        blob.size,
                                      );
                                      return blobUrl;
                                    } catch (blobError) {
                                      console.error(
                                        "❌ Blob conversion failed, using original data URL:",
                                        blobError,
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
                                    dataUrl.length,
                                  );
                                  return dataUrl;
                                } catch (error) {
                                  console.error(
                                    "Video URL oluşturma hatası:",
                                    error,
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
                        ),
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Boya, Değişen ve Ekspertiz Bilgisi */}
              {ad.customFields?.expertiseInfo &&
                typeof ad.customFields.expertiseInfo === "object" &&
                Object.keys(
                  ad.customFields.expertiseInfo as Record<string, unknown>,
                ).length > 0 && (
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
                        Boya, Değişen ve Ekspertiz Bilgisi
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5 }}>
                      {/* Araç Şeması ve Tablo Yan Yana */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "350px 1fr" },
                          gap: 3,
                        }}
                      >
                        {/* Sol Taraf - Araç Şeması */}
                        <Box
                          sx={{
                            p: 2,
                            border: "1px solid #e0e0e0",
                            borderRadius: 2,
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          {/* Renk Açıklamaları */}
                          <Box
                            sx={{
                              mb: 2,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            <Chip
                              label="Orijinal"
                              sx={{
                                backgroundColor: "#9E9E9E",
                                color: "white",
                              }}
                              size="small"
                            />
                            <Chip
                              label="Lokal Boyalı"
                              sx={{
                                backgroundColor: "#FFA500",
                                color: "white",
                              }}
                              size="small"
                            />
                            <Chip
                              label="Boyalı"
                              sx={{
                                backgroundColor: "#2196F3",
                                color: "white",
                              }}
                              size="small"
                            />
                            <Chip
                              label="Değişen"
                              sx={{
                                backgroundColor: "#F44336",
                                color: "white",
                              }}
                              size="small"
                            />
                          </Box>

                          {/* SVG Araç Şeması - DİKEY */}
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              maxWidth: "400px",
                              height: "auto",
                              mx: "auto",
                              overflow: "hidden",
                            }}
                          >
                            {/* Ana SVG - Dikey Konumda */}
                            <img
                              src="/car-diagram.svg"
                              alt="Araç Şeması"
                              style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                transform: "rotate(90deg)",
                                transformOrigin: "center center",
                                margin: "150px 0",
                              }}
                            />

                            {/* Overlay SVG with parts - Dikey Koordinatlar */}
                            <svg
                              viewBox="0 0 1000 1500"
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "all",
                              }}
                            >
                              {(() => {
                                const CAR_PARTS = [
                                  {
                                    id: "onTampon",
                                    name: "Ön Tampon",
                                    x: 500,
                                    y: 1200,
                                  },
                                  {
                                    id: "motorKaputu",
                                    name: "Motor Kaputu",
                                    x: 500,
                                    y: 1070,
                                  },
                                  {
                                    id: "tavan",
                                    name: "Tavan",
                                    x: 500,
                                    y: 650,
                                  },
                                  {
                                    id: "sagOnCamurluk",
                                    name: "Sağ Ön Çamurluk",
                                    x: 650,
                                    y: 1070,
                                  },
                                  {
                                    id: "sagOnKapi",
                                    name: "Sağ Ön Kapı",
                                    x: 650,
                                    y: 750,
                                  },
                                  {
                                    id: "sagArkaKapi",
                                    name: "Sağ Arka Kapı",
                                    x: 650,
                                    y: 520,
                                  },
                                  {
                                    id: "sagArkaCamurluk",
                                    name: "Sağ Arka Çamurluk",
                                    x: 650,
                                    y: 380,
                                  },
                                  {
                                    id: "solOnCamurluk",
                                    name: "Sol Ön Çamurluk",
                                    x: 350,
                                    y: 1070,
                                  },
                                  {
                                    id: "solOnKapi",
                                    name: "Sol Ön Kapı",
                                    x: 350,
                                    y: 750,
                                  },
                                  {
                                    id: "solArkaKapi",
                                    name: "Sol Arka Kapı",
                                    x: 350,
                                    y: 520,
                                  },
                                  {
                                    id: "solArkaCamurluk",
                                    name: "Sol Arka Çamurluk",
                                    x: 350,
                                    y: 380,
                                  },
                                  {
                                    id: "bagajKapagi",
                                    name: "Bagaj Kapağı",
                                    x: 500,
                                    y: 390,
                                  },
                                  {
                                    id: "arkaTampon",
                                    name: "Arka Tampon",
                                    x: 500,
                                    y: 300,
                                  },
                                ];

                                const expertiseInfo = ad.customFields
                                  ?.expertiseInfo as Record<
                                  string,
                                  {
                                    status: string;
                                    details: Array<{
                                      type: string;
                                      color: string;
                                    }>;
                                  }
                                >;

                                return CAR_PARTS.map((part) => {
                                  const partInfo = expertiseInfo?.[part.id];
                                  let fillColor = "#e8e8e8"; // Default

                                  if (partInfo?.status === "Lokal Boyalı") {
                                    fillColor = "#FFA500"; // Turuncu
                                  } else if (partInfo?.status === "Boyalı") {
                                    fillColor = "#2196F3"; // Mavi
                                  } else if (partInfo?.status === "Değişen") {
                                    fillColor = "#F44336"; // Kırmızı
                                  } else if (partInfo?.status === "Orijinal") {
                                    fillColor = "#9E9E9E"; // Gri
                                  }

                                  const getTooltipText = () => {
                                    if (!partInfo)
                                      return `${part.name}: Bilgi Yok`;
                                    const status =
                                      partInfo.status || "Belirtilmemiş";
                                    const detail =
                                      partInfo.details &&
                                      partInfo.details.length > 0
                                        ? ` - ${partInfo.details[0].type}`
                                        : "";
                                    return `${part.name}: ${status}${detail}`;
                                  };

                                  return (
                                    <g
                                      key={part.id}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <circle
                                        cx={part.x}
                                        cy={part.y}
                                        r="35"
                                        fill={fillColor}
                                        stroke="#333"
                                        strokeWidth="3"
                                        opacity="0.9"
                                        style={{
                                          transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                          const target =
                                            e.target as SVGCircleElement;
                                          target.setAttribute("r", "40");
                                          target.setAttribute("opacity", "1");
                                          target.setAttribute(
                                            "stroke-width",
                                            "4",
                                          );

                                          const rect =
                                            target.getBoundingClientRect();
                                          setTooltipData({
                                            visible: true,
                                            x: rect.left + rect.width / 2,
                                            y: rect.top - 10,
                                            content: getTooltipText(),
                                          });
                                        }}
                                        onMouseLeave={(e) => {
                                          const target =
                                            e.target as SVGCircleElement;
                                          target.setAttribute("r", "35");
                                          target.setAttribute("opacity", "0.9");
                                          target.setAttribute(
                                            "stroke-width",
                                            "3",
                                          );

                                          setTooltipData((prev) => ({
                                            ...prev,
                                            visible: false,
                                          }));
                                        }}
                                      >
                                        <title>{getTooltipText()}</title>
                                      </circle>
                                      <circle
                                        cx={part.x}
                                        cy={part.y}
                                        r="25"
                                        fill="white"
                                        fillOpacity="0.9"
                                        style={{
                                          pointerEvents: "none",
                                          transition: "all 0.3s ease",
                                        }}
                                      >
                                        <title>{getTooltipText()}</title>
                                      </circle>
                                      <text
                                        x={part.x}
                                        y={part.y + 8}
                                        textAnchor="middle"
                                        fontSize="28"
                                        fontWeight="bold"
                                        fill="#333"
                                        style={{
                                          pointerEvents: "none",
                                          transition: "all 0.3s ease",
                                        }}
                                      >
                                        ●
                                      </text>
                                    </g>
                                  );
                                });
                              })()}
                            </svg>

                            {/* Tooltip */}
                            {tooltipData.visible && (
                              <Box
                                sx={{
                                  position: "fixed",
                                  left: tooltipData.x,
                                  top: tooltipData.y,
                                  transform:
                                    "translateX(-50%) translateY(-100%)",
                                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                                  color: "white",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  fontWeight: "medium",
                                  whiteSpace: "nowrap",
                                  zIndex: 1000,
                                  pointerEvents: "none",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                  "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    top: "100%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    border: "6px solid transparent",
                                    borderTopColor: "rgba(0, 0, 0, 0.9)",
                                  },
                                }}
                              >
                                {tooltipData.content}
                              </Box>
                            )}
                          </Box>
                        </Box>

                        {/* Sağ Taraf - Parça Durumları Tablosu */}
                        <TableContainer
                          component={Paper}
                          sx={{ maxHeight: 600 }}
                        >
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{ fontWeight: "bold", minWidth: 140 }}
                                >
                                  Parça
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: "bold", minWidth: 100 }}
                                >
                                  Durum
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: "bold", minWidth: 150 }}
                                >
                                  Detay
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(() => {
                                const CAR_PARTS = [
                                  { id: "onTampon", name: "Ön Tampon" },
                                  { id: "motorKaputu", name: "Motor Kaputu" },
                                  { id: "tavan", name: "Tavan" },
                                  {
                                    id: "sagOnCamurluk",
                                    name: "Sağ Ön Çamurluk",
                                  },
                                  { id: "sagOnKapi", name: "Sağ Ön Kapı" },
                                  { id: "sagArkaKapi", name: "Sağ Arka Kapı" },
                                  {
                                    id: "sagArkaCamurluk",
                                    name: "Sağ Arka Çamurluk",
                                  },
                                  {
                                    id: "solOnCamurluk",
                                    name: "Sol Ön Çamurluk",
                                  },
                                  { id: "solOnKapi", name: "Sol Ön Kapı" },
                                  { id: "solArkaKapi", name: "Sol Arka Kapı" },
                                  {
                                    id: "solArkaCamurluk",
                                    name: "Sol Arka Çamurluk",
                                  },
                                  { id: "bagajKapagi", name: "Bagaj Kapağı" },
                                  { id: "arkaTampon", name: "Arka Tampon" },
                                ];

                                const expertiseInfo = ad.customFields
                                  ?.expertiseInfo as Record<
                                  string,
                                  {
                                    status: string;
                                    details: Array<{
                                      type: string;
                                      color: string;
                                    }>;
                                  }
                                >;

                                return CAR_PARTS.map((part) => {
                                  const partInfo = expertiseInfo?.[part.id];
                                  const status = partInfo?.status || "-";
                                  const detail =
                                    partInfo?.details &&
                                    partInfo.details.length > 0
                                      ? partInfo.details[0].type
                                      : "-";

                                  let statusColor = "#666";
                                  if (status === "Lokal Boyalı")
                                    statusColor = "#FFA500";
                                  else if (status === "Boyalı")
                                    statusColor = "#2196F3";
                                  else if (status === "Değişen")
                                    statusColor = "#F44336";
                                  else if (status === "Orijinal")
                                    statusColor = "#9E9E9E";

                                  return (
                                    <TableRow
                                      key={part.id}
                                      sx={{
                                        "&:hover": {
                                          backgroundColor:
                                            "rgba(0, 0, 0, 0.04)",
                                        },
                                      }}
                                    >
                                      <TableCell sx={{ fontWeight: "medium" }}>
                                        {part.name}
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={status}
                                          size="small"
                                          sx={{
                                            backgroundColor: statusColor,
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                            height: "28px",
                                            minWidth: "80px",
                                            "& .MuiChip-label": {
                                              px: 1.5,
                                            },
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontSize: "12px",
                                            color:
                                              detail === "-" ? "#999" : "#333",
                                            fontStyle:
                                              detail === "-"
                                                ? "italic"
                                                : "normal",
                                          }}
                                        >
                                          {detail}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  );
                                });
                              })()}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  </Box>
                )}

              {/* Ekspertiz Raporu */}
              {ad.customFields?.expertiseReport &&
                typeof ad.customFields.expertiseReport === "string" && (
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
                        Ekspertiz Raporu
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5 }}>
                      <Card
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                        }}
                      >
                        <PictureAsPdf sx={{ fontSize: 48, color: "#d32f2f" }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Ekspertiz Raporu
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            PDF Dosyası
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            // PDF'i yeni sekmede aç
                            const pdfData = ad.customFields
                              ?.expertiseReport as string;
                            if (pdfData.startsWith("data:")) {
                              // Data URL ise direkt aç
                              window.open(pdfData, "_blank");
                            } else {
                              // Base64 ise data URL oluştur
                              const dataUrl = `data:application/pdf;base64,${pdfData}`;
                              window.open(dataUrl, "_blank");
                            }
                          }}
                        >
                          Görüntüle
                        </Button>
                      </Card>
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
                          id,
                        );
                        // Aynı ilan ID'sine gitmemek için kontrol
                        if (similarAd.id !== Number(id)) {
                          console.log(
                            "Navigate ediliyor:",
                            `/ad/${similarAd.id}`,
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
                              ? formatPriceUtil(
                                  similarAd.price,
                                  similarAd.currency,
                                )
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
