import React, { useState, useEffect, useCallback } from "react";
import socketService from "../../services/socketService";
import { formatPrice } from "../../utils/formatPrice";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Collapse,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  Person,
  DateRange,
  AttachMoney,
  DirectionsCar,
  PhotoCamera,
  Image,
  Close,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import apiClient from "../../api/client";
import { getTokenFromStorage } from "../../utils/tokenUtils";

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  currency?: string;
  year: number;
  mileage: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  category: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  district: {
    id: number;
    name: string;
  };
  images: {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    displayOrder: number;
    altText: string;
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
  customFields: {
    condition?: string;
    engineVolume?: string;
    drivetrain?: string;
    color?: string;
    seatCount?: string;
    roofType?: string;
    chassis?: string;
    transmission?: string;
    fuelType?: string;
    exchange?: string;
    plateType?: string;
    plateNumber?: string;
    cityId?: string;
    districtId?: string;
    detailedInfo?: string;
    detailFeatures?: Record<string, boolean>;
  };
}

const PendingAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Image gallery modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Ad["images"]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Base64 image handler - images are now stored as base64 in database
  const getImageUrl = (imageUrl: string) => {
    // imageUrl artık doğrudan base64 formatında geliyor
    console.log("🖼️ Image URL kontrol:", {
      hasUrl: !!imageUrl,
      length: imageUrl?.length,
      isBase64: imageUrl?.startsWith("data:"),
      preview: imageUrl?.substring(0, 50),
    });
    return imageUrl || "/placeholder.jpg";
  };

  // Onay bekleyen ilanları yükle
  useEffect(() => {
    fetchPendingAds();
  }, []);

  const fetchPendingAds = async () => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        console.error("Authentication required");
        return;
      }

      const response = await apiClient.get("/ads/admin/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000, // 60 saniye timeout
      });
      const adsData = response.data as Ad[];

      // Debug: İlan verilerini kontrol et
      console.log("📊 Admin paneli - Onay bekleyen ilanlar:", adsData.length);
      adsData.forEach((ad, index) => {
        console.log(`📋 İlan ${index + 1}:`, {
          id: ad.id,
          title: ad.title,
          images: ad.images?.length || 0,
          imageDetails: ad.images?.map((img) => ({
            id: img.id,
            isPrimary: img.isPrimary,
            hasImageUrl: !!img.imageUrl,
            imageUrlLength: img.imageUrl?.length,
            isBase64: img.imageUrl?.startsWith("data:"),
          })),
        });
      });

      setAds(adsData);
    } catch (error) {
      console.error("Onay bekleyen ilanlar alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  // İlanı onayla
  const handleApprove = async (adId: number) => {
    try {
      const token = getTokenFromStorage();
      if (!token) {
        console.error("Authentication required");
        return;
      }

      await apiClient.put(
        `/ads/admin/${adId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // İlanı listeden kaldır
      setAds((prev) => prev.filter((ad) => ad.id !== adId));

      // ❗ GERÇEK ZAMANLI BİLDİRİM: Socket ile tüm kullanıcılara bildir
      const socket = socketService.getSocket();
      if (socket && socket.connected) {
        socket.emit("adApproved", {
          adId,
          message: "Yeni bir ilan onaylandı ve anasayfaya eklendi!",
        });
        console.log("🔔 Socket bildirimi gönderildi:", adId);
      }

      // ❗ FALLBACK 1: localStorage flag (mevcut sistem)
      localStorage.setItem("refreshHomepage", "true");

      // ❗ FALLBACK 2: Window postMessage (farklı tab'lar için)
      window.postMessage({ type: "AD_APPROVED", adId }, "*");

      // ❗ FALLBACK 3: Custom event (aynı sayfa için)
      window.dispatchEvent(new CustomEvent("adApproved", { detail: { adId } }));

      alert("İlan başarıyla onaylandı!");
    } catch (error) {
      console.error("İlan onaylanırken hata:", error);
      alert("İlan onaylanırken bir hata oluştu");
    }
  };

  // İlanı reddet
  const handleReject = async () => {
    if (!selectedAd || !rejectReason.trim()) {
      alert("Lütfen reddetme gerekçesi yazın");
      return;
    }

    try {
      const token = getTokenFromStorage();
      if (!token) {
        console.error("Authentication required");
        return;
      }

      await apiClient.put(
        `/ads/admin/${selectedAd.id}/reject`,
        {
          reason: rejectReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // İlanı listeden kaldır
      setAds((prev) => prev.filter((ad) => ad.id !== selectedAd.id));
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedAd(null);
      alert("İlan başarıyla reddedildi!");
    } catch (error) {
      console.error("İlan reddedilirken hata:", error);
      alert("İlan reddedilirken bir hata oluştu");
    }
  };

  const openRejectDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setRejectDialogOpen(true);
  };

  const toggleCardExpansion = (adId: number) => {
    setExpandedCard(expandedCard === adId ? null : adId);
  };

  // Image gallery functions
  const openImageModal = (images: Ad["images"], startIndex: number = 0) => {
    setSelectedImages(images);
    setCurrentImageIndex(startIndex);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev < selectedImages.length - 1 ? prev + 1 : 0,
    );
  }, [selectedImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : selectedImages.length - 1,
    );
  }, [selectedImages.length]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #999; flex-direction: column;">
          <span style="font-size: 12px;">Resim</span>
          <span style="font-size: 12px;">yüklenemedi</span>
        </div>
      `;
    }
  };

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!imageModalOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          prevImage();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "Escape":
          closeImageModal();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [imageModalOpen, nextImage, prevImage]);

  // Değerleri Türkçeleştirme fonksiyonları
  const translateCondition = (condition: string) => {
    const translations: Record<string, string> = {
      "ikinci-el": "İkinci El",
      "yurtdisindan-ithal": "Yurtdışından İthal",
      sifir: "Sıfır",
    };
    return translations[condition] || condition;
  };

  const translateDrivetrain = (drivetrain: string) => {
    const translations: Record<string, string> = {
      "onden-cekis": "Önden Çekiş",
      "arkadan-itis": "Arkadan İtiş",
      "4wd-surekli": "4WD Sürekli",
      "arkadan-itis-elektronik": "Arkadan İtiş Elektronik",
    };
    return translations[drivetrain] || drivetrain;
  };

  const translateTransmission = (transmission: string) => {
    const translations: Record<string, string> = {
      manuel: "Manuel",
      otomatik: "Otomatik",
    };
    return translations[transmission] || transmission;
  };

  const translateFuelType = (fuelType: string) => {
    const translations: Record<string, string> = {
      benzinli: "Benzinli",
      "benzinli-lpg": "Benzinli + LPG",
      dizel: "Dizel",
    };
    return translations[fuelType] || fuelType;
  };

  const translateRoofType = (roofType: string) => {
    const translations: Record<string, string> = {
      "normal-tavan": "Normal Tavan",
      "yuksek-tavan": "Yüksek Tavan",
    };
    return translations[roofType] || roofType;
  };

  const translateChassis = (chassis: string) => {
    const translations: Record<string, string> = {
      kisa: "Kısa",
      orta: "Orta",
      uzun: "Uzun",
      "ekstra-uzun": "Ekstra Uzun",
    };
    return translations[chassis] || chassis;
  };

  const translatePlateType = (plateType: string) => {
    const translations: Record<string, string> = {
      "tr-plakali": "Türkiye TR Plakalı",
      "mavi-plakali": "Mavi MA Plakalı",
    };
    return translations[plateType] || plateType;
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}
      >
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
      >
        Onay Bekleyen İlanlar
      </Typography>

      {ads.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Onay bekleyen ilan bulunmuyor.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {ads.map((ad) => (
            <Box key={ad.id}>
              <Card elevation={3}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  {/* İlan Başlığı ve Temel Bilgiler */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "stretch", md: "flex-start" },
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        component="h2"
                        gutterBottom
                        sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                      >
                        {ad.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Chip
                          icon={<AttachMoney />}
                          label={formatPrice(ad.price, ad.currency)}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          icon={<DateRange />}
                          label={`${ad.year} Model`}
                          size="small"
                        />
                        <Chip
                          icon={<DirectionsCar />}
                          label={`${ad.mileage?.toLocaleString("tr-TR")} KM`}
                          size="small"
                        />
                        <Chip
                          label={ad.category.name}
                          color="secondary"
                          size="small"
                        />
                        {ad.city && (
                          <Chip
                            label={`${ad.city.name}${
                              ad.district ? ` / ${ad.district.name}` : ""
                            }`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Aksiyon Butonları */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        justifyContent: { xs: "flex-start", md: "flex-end" },
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(ad.id)}
                        size="small"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                      >
                        Onayla
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => openRejectDialog(ad)}
                        size="small"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                      >
                        Reddet
                      </Button>
                      <IconButton
                        onClick={() => toggleCardExpansion(ad.id)}
                        color="primary"
                        size="small"
                      >
                        {expandedCard === ad.id ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Kullanıcı Bilgileri */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {ad.user.firstName} {ad.user.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ad.user.email}
                        </Typography>
                        {ad.user.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {ad.user.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>

                  {/* Resimler */}
                  {ad.images && ad.images.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <PhotoCamera color="primary" />
                        <Typography variant="subtitle2">
                          İlan Resimleri ({ad.images.length})
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          maxHeight: 120,
                          overflowY: "auto",
                        }}
                      >
                        {ad.images.map((image, index) => (
                          <Box
                            key={image.id}
                            sx={{
                              position: "relative",
                              width: 100,
                              height: 80,
                              borderRadius: 1,
                              overflow: "hidden",
                              border: image.isPrimary
                                ? "2px solid #1976d2"
                                : "1px solid #e0e0e0",
                              cursor: "pointer",
                              transition: "transform 0.2s",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                            onClick={() => openImageModal(ad.images, index)}
                          >
                            <img
                              src={getImageUrl(image.imageUrl)}
                              alt={image.altText || `Resim ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={handleImageError}
                            />
                            {image.isPrimary && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 2,
                                  right: 2,
                                  background: "#1976d2",
                                  color: "white",
                                  fontSize: 10,
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                }}
                              >
                                Vitrin
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  )}

                  {/* Eğer resim yoksa */}
                  {(!ad.images || ad.images.length === 0) && (
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, mb: 2, textAlign: "center" }}
                    >
                      <Image sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Bu ilan için resim yüklenmemiş
                      </Typography>
                    </Paper>
                  )}

                  {/* Videolar */}
                  {ad.videos && ad.videos.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ fontSize: 20 }}>🎬</Typography>
                        <Typography variant="subtitle2">
                          İlan Videoları ({ad.videos.length})
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 2,
                        }}
                      >
                        {ad.videos.map((video) => (
                          <Box
                            key={video.id}
                            sx={{
                              position: "relative",
                              borderRadius: 1,
                              overflow: "hidden",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <video
                              controls
                              style={{
                                width: "100%",
                                height: "150px",
                                objectFit: "cover",
                              }}
                              poster={video.thumbnailUrl}
                            >
                              <source
                                src={video.videoUrl}
                                type={video.mimeType || "video/mp4"}
                              />
                              Tarayıcınız bu video formatını desteklemiyor.
                            </video>
                            {video.description && (
                              <Box sx={{ p: 1, backgroundColor: "#f5f5f5" }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontSize: "11px", color: "#666" }}
                                >
                                  {video.description}
                                </Typography>
                              </Box>
                            )}
                            {video.fileSize && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  backgroundColor: "rgba(0,0,0,0.7)",
                                  color: "white",
                                  fontSize: "10px",
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                }}
                              >
                                {(video.fileSize / (1024 * 1024)).toFixed(1)} MB
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  )}

                  {/* Açıklama */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {ad.description}
                  </Typography>

                  {/* Detaylı Bilgiler - Genişletilebilir */}
                  <Collapse in={expandedCard === ad.id}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Araç Detayları
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {ad.customFields?.condition && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Durum
                          </Typography>
                          <Typography variant="body1">
                            {translateCondition(ad.customFields.condition)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.engineVolume && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Motor Hacmi
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.engineVolume}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.drivetrain && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Çekiş
                          </Typography>
                          <Typography variant="body1">
                            {translateDrivetrain(ad.customFields.drivetrain)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.color && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Renk
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.color}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.seatCount && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Koltuk Sayısı
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.seatCount} Kişilik
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.roofType && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Tavan Tipi
                          </Typography>
                          <Typography variant="body1">
                            {translateRoofType(ad.customFields.roofType)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.chassis && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Şasi
                          </Typography>
                          <Typography variant="body1">
                            {translateChassis(ad.customFields.chassis)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.transmission && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Vites
                          </Typography>
                          <Typography variant="body1">
                            {translateTransmission(
                              ad.customFields.transmission,
                            )}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.fuelType && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Yakıt Tipi
                          </Typography>
                          <Typography variant="body1">
                            {translateFuelType(ad.customFields.fuelType)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.exchange && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Takaslı
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.exchange === "evet"
                              ? "Evet"
                              : "Hayır"}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.plateType && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Plaka Tipi
                          </Typography>
                          <Typography variant="body1">
                            {translatePlateType(ad.customFields.plateType)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.plateNumber && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Plaka
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.plateNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Detaylı Açıklama */}
                    {ad.customFields?.detailedInfo && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Detaylı Bilgi
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body2">
                            {ad.customFields.detailedInfo}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {/* Araç Özellikleri */}
                    {ad.customFields?.detailFeatures && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Araç Özellikleri
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {Object.entries(ad.customFields.detailFeatures).map(
                            ([key, value]) => {
                              if (value === true) {
                                const featureNames: Record<string, string> = {
                                  abs: "ABS",
                                  alarm: "Alarm",
                                  alasimJant: "Alaşım Jant",
                                  asr: "ASR",
                                  cdCalar: "CD Çalar",
                                  cekiDemiri: "Çeki Demiri",
                                  deriDoseme: "Deri Döşeme",
                                  elektrikliAynalar: "Elektrikli Aynalar",
                                  elektrikliCam: "Elektrikli Cam",
                                  esp: "ESP",
                                  farSis: "Far (Sis)",
                                  farSensoru: "Far Sensörü",
                                  hizSabitleme: "Hız Sabitleme",
                                  klima: "Klima",
                                  sogutucuFrigo: "Soğutucu / Frigo",
                                };
                                return (
                                  <Chip
                                    key={key}
                                    label={featureNames[key] || key}
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                  />
                                );
                              }
                              return null;
                            },
                          )}
                        </Box>
                      </Box>
                    )}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      İlan Tarihi:{" "}
                      {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                    </Typography>
                  </Collapse>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Red Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>İlanı Reddet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bu ilan reddedilecek. Lütfen reddetme gerekçesini belirtin:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reddetme Gerekçesi"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="İlanın neden reddedildiğini açıklayın..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
          >
            Reddet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Modal */}
      <Modal
        open={imageModalOpen}
        onClose={closeImageModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: "rgba(0,0,0,0.9)" },
        }}
      >
        <Fade in={imageModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90vw",
              height: "90vh",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              outline: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Resim {currentImageIndex + 1} / {selectedImages.length}
              </Typography>
              <IconButton onClick={closeImageModal} size="large">
                <Close />
              </IconButton>
            </Box>

            {/* Image Container */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                bgcolor: "#f5f5f5",
              }}
            >
              {selectedImages.length > 0 && (
                <>
                  <img
                    src={getImageUrl(
                      selectedImages[currentImageIndex]?.imageUrl,
                    )}
                    alt={
                      selectedImages[currentImageIndex]?.altText ||
                      `Resim ${currentImageIndex + 1}`
                    }
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />

                  {/* Navigation Arrows */}
                  {selectedImages.length > 1 && (
                    <>
                      <IconButton
                        onClick={prevImage}
                        sx={{
                          position: "absolute",
                          left: 16,
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.7)",
                          },
                        }}
                        size="large"
                      >
                        <ArrowBack />
                      </IconButton>
                      <IconButton
                        onClick={nextImage}
                        sx={{
                          position: "absolute",
                          right: 16,
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.7)",
                          },
                        }}
                        size="large"
                      >
                        <ArrowForward />
                      </IconButton>
                    </>
                  )}

                  {/* Image Info */}
                  {selectedImages[currentImageIndex]?.isPrimary && (
                    <Chip
                      label="Vitrin Resmi"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                      }}
                    />
                  )}
                </>
              )}
            </Box>

            {/* Thumbnail Navigation */}
            {selectedImages.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 2,
                  overflowX: "auto",
                  pb: 1,
                }}
              >
                {selectedImages.map((image, index) => (
                  <Box
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    sx={{
                      width: 60,
                      height: 45,
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        index === currentImageIndex
                          ? "2px solid #1976d2"
                          : "1px solid #e0e0e0",
                      flexShrink: 0,
                      transition: "border-color 0.2s",
                      "&:hover": {
                        borderColor: "#1976d2",
                      },
                    }}
                  >
                    <img
                      src={getImageUrl(image.imageUrl)}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
};

export default PendingAds;
