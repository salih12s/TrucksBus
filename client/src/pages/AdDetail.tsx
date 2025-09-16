import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  LocationOn,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  FavoriteBorder,
  Favorite,
} from "@mui/icons-material";
import { API_BASE_URL } from "../api/client";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import ComplaintModal from "../components/complaints/ComplaintModal";
import {
  checkFavorite,
  addToFavorites,
  removeFromFavorites,
} from "../api/favorites";

interface Ad {
  id: number;
  title: string;
  description?: string;
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
  engineVolume?: string;
  wheelDrive?: string;
  seatCount?: number;
  color?: string;
  damage?: string;
  plateType?: string;
  takas?: string;
  viewCount?: number;
  platformLength?: string;
  platformWidth?: string;
  roofType?: string;
  images?: string[];
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

interface CategoryField {
  id: number;
  name: string;
  fieldType: string;
  isRequired: boolean;
  options?: string[];
}

const AdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFields, setCategoryFields] = useState<CategoryField[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ads/${id}`);
        const data = await response.json();
        console.log("=== API Veri Debug ===");
        console.log("Tam API verisi:", JSON.stringify(data, null, 2));
        console.log("Ad objesi:", data);
        console.log("Images verisi:", data.images);
        console.log("Images tipi:", typeof data.images);
        console.log("Images array mi?", Array.isArray(data.images));
        if (data.images) {
          console.log("İlk resim:", data.images[0]);
          if (data.images[0]?.imageUrl) {
            console.log(
              "İlk resimin imageUrl'i:",
              data.images[0].imageUrl.substring(0, 100)
            );
          }
        }
        setAd(data);

        // Kategori alanlarını fetch et
        if (data.category?.id) {
          try {
            const fieldsResponse = await fetch(
              `${API_BASE_URL}/categories/${data.category.id}/fields`
            );
            const fieldsData = await fieldsResponse.json();
            console.log("Kategori alanları:", fieldsData);
            setCategoryFields(fieldsData);
          } catch (fieldsError) {
            console.error("Kategori alanları fetch hatası:", fieldsError);
          }
        }

        // Check if ad is favorited by current user
        if (currentUser && token) {
          try {
            const favResult = await checkFavorite(Number(id), token);
            if (favResult.success) {
              setIsFavorited(favResult.isFavorited || false);
            }
          } catch (favError) {
            console.error("Favori kontrolü hatası:", favError);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching ad:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchAd();
    }
  }, [id, currentUser, token]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price) + " TL";
  };

  const getImageUrl = (images?: (string | { imageUrl: string })[]): string => {
    console.log("=== getImageUrl Debug ===");
    console.log("Gelen images parametresi:", images);
    console.log("Images array uzunluğu:", images?.length);
    console.log("Images tipi:", typeof images);

    if (!images || images.length === 0) {
      console.log("❌ Resim yok, placeholder kullanılacak");
      return "https://via.placeholder.com/400x300/f0f0f0/999999?text=Resim+Yok";
    }

    const firstImage = images[0];
    console.log("İlk resim verisi:", firstImage);
    console.log("İlk resim tipi:", typeof firstImage);

    // Eğer object ise imageUrl property'sini al
    let imageUrl: string;
    if (typeof firstImage === "object" && firstImage.imageUrl) {
      imageUrl = firstImage.imageUrl;
      console.log(
        "Object'ten imageUrl alındı:",
        imageUrl.substring(0, 50) + "..."
      );
    } else if (typeof firstImage === "string") {
      imageUrl = firstImage;
      console.log("String resim verisi:", imageUrl.substring(0, 50) + "...");
    } else {
      console.log("❌ Geçersiz resim formatı, placeholder kullanılacak");
      return "https://via.placeholder.com/400x300/f0f0f0/999999?text=Hatalı+Resim";
    }

    // Base64 kontrolü
    if (imageUrl.startsWith("data:image/")) {
      console.log("✅ Base64 resim tespit edildi");
      return imageUrl;
    }

    if (imageUrl.startsWith("http")) {
      console.log("✅ HTTP URL tespit edildi:", imageUrl);
      return imageUrl;
    }

    const baseUrl = API_BASE_URL.replace("/api", "");
    const finalUrl = `${baseUrl}${imageUrl}`;
    console.log("Final URL:", finalUrl);
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

  // Format feature names (camelCase to Title Case)
  const formatFeatureName = (featureName: string): string => {
    // Split camelCase words
    const words = featureName.replace(/([A-Z])/g, " $1").trim();

    // Capitalize each word
    return words
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
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
    <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh", py: 3 }}>
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
            <img
              src={getImageUrl([ad.images[modalImageIndex]])}
              alt={`${ad.title} - Fotoğraf ${modalImageIndex + 1}`}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 8,
              }}
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/800x600/f0f0f0/999999?text=Resim+Hatası";
              }}
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
                  <img
                    src={getImageUrl([image])}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/60x45/f0f0f0/999999?text=?";
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Container maxWidth="lg">
        <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
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

            {/* Price and Actions Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
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
                    fontSize: "12px",
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

            {/* Ad Details Row */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                fontSize: "14px",
                color: "#666",
                mb: 1,
              }}
            >
              <Box>
                <strong>İlan No:</strong> #{id}
              </Box>
              <Box>
                <strong>İlan Tarihi:</strong>{" "}
                {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
              </Box>
              <Box>
                <strong>Kategori:</strong> {ad.category?.name || "Çekici"}
              </Box>
            </Box>
          </Box>

          {/* Main Content - Three Columns Layout */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", lg: "row" },
            }}
          >
            {/* Left Side - Images (40%) */}
            <Box sx={{ flex: { lg: "0 0 40%" } }}>
              {/* Main Image */}
              <Box sx={{ mb: 2, position: "relative" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: 250,
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
                  <img
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
                    onError={(e) => {
                      console.log("❌ Resim yüklenemedi:", e.currentTarget.src);
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x300/f0f0f0/999999?text=Resim+Hatası";
                    }}
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
                  {selectedImageIndex + 1}/{ad.images?.length || 1} Fotoğraf
                </Box>
              </Box>

              {/* Thumbnail Images */}
              {ad.images && ad.images.length > 1 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 1,
                    maxHeight: 150,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: 6,
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#f1f1f1",
                      borderRadius: 3,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#c1c1c1",
                      borderRadius: 3,
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
                        <img
                          src={getImageUrl([image])}
                          alt={`${ad.title} - ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            console.log(
                              `❌ Thumbnail ${index + 1} yüklenemedi:`,
                              e.currentTarget.src
                            );
                            e.currentTarget.src =
                              "https://via.placeholder.com/80x60/f0f0f0/999999?text=" +
                              (index + 1);
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Middle Section - Vehicle Details */}
            <Box sx={{ flex: { lg: "0 0 35%" } }}>
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
                    { label: "İlan No", value: ad.id ? `${ad.id}` : null },
                    {
                      label: "İlan Tarihi",
                      value: ad.createdAt
                        ? new Date(ad.createdAt).toLocaleDateString("tr-TR")
                        : null,
                    },
                    { label: "Kategori", value: ad.category?.name || null },
                    {
                      label: "Fiyat",
                      value: ad.price
                        ? `${Number(ad.price).toLocaleString("tr-TR")} TL`
                        : null,
                    },
                    { label: "Yıl", value: ad.year ? `${ad.year}` : null },
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

                    // Marka/Model Bilgileri
                    { label: "Marka", value: ad.brand?.name || null },
                    {
                      label: "Model",
                      value: ad.model?.name || ad.model || null,
                    },
                    { label: "Varyant", value: ad.variant?.name || null },

                    // Lokasyon Bilgileri
                    { label: "Şehir", value: ad.city?.name || null },
                    { label: "İlçe", value: ad.district?.name || null },
                    { label: "Adres", value: ad.customFields?.address || null },

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
                        ad.customFields?.drivetrain || ad.wheelDrive || null,
                    },
                    {
                      label: "Motor Gücü",
                      value:
                        ad.customFields?.motorPower || ad.enginePower || null,
                    },
                    {
                      label: "Motor Hacmi",
                      value:
                        ad.customFields?.engineVolume ||
                        ad.engineVolume ||
                        null,
                    },
                    {
                      label: "Koltuk Sayısı",
                      value: ad.customFields?.seatCount || ad.seatCount || null,
                    },
                    {
                      label: "Tavan Tipi",
                      value: ad.customFields?.roofType || ad.roofType || null,
                    },
                    {
                      label: "Şasi",
                      value:
                        ad.customFields?.chassis ||
                        ad.customFields?.chasisType ||
                        null,
                    },
                    { label: "Kabin", value: ad.customFields?.cabin || null },
                    {
                      label: "Lastik Durumu",
                      value: ad.customFields?.tireCondition
                        ? `${ad.customFields.tireCondition}%`
                        : null,
                    },
                    {
                      label: "Yük Kapasitesi",
                      value: ad.customFields?.loadCapacity || null,
                    },
                    {
                      label: "Üst Yapı",
                      value: ad.customFields?.superstructure || null,
                    },

                    // Plaka Bilgileri
                    {
                      label: "Plaka Tipi",
                      value: ad.customFields?.plateType || ad.plateType || null,
                    },
                    {
                      label: "Plaka No",
                      value: ad.customFields?.plateNumber || null,
                    },

                    // Diğer Bilgiler
                    {
                      label: "Takas",
                      value: ad.customFields?.exchange || ad.takas || null,
                    },
                    { label: "Hasar Durumu", value: ad.damage || null },

                    // Platform Bilgileri (Dorse için)
                    {
                      label: "Platform Uzunluk",
                      value:
                        ad.platformLength ||
                        ad.customFields?.platformLength ||
                        null,
                    },
                    {
                      label: "Platform Genişlik",
                      value:
                        ad.platformWidth ||
                        ad.customFields?.platformWidth ||
                        null,
                    },

                    // Dinamik kategori alanları
                    ...(Array.isArray(categoryFields)
                      ? categoryFields.map((field) => ({
                          label: field.name,
                          value:
                            ad.dynamicFields?.[field.name] ||
                            ad.customFields?.[field.name] ||
                            null,
                        }))
                      : []),
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

            {/* Right Section - Seller Info (20%) */}
            <Box sx={{ flex: { lg: "0 0 20%" } }}>
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
                    Konum
                  </Typography>
                </Box>

                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <LocationOn sx={{ color: "#007bff", fontSize: 18 }} />
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      {ad.city?.name && ad.district?.name
                        ? `${ad.city.name} / ${ad.district.name}`
                        : "Konum bilgisi mevcut değil"}
                    </Typography>
                  </Box>

                  {/* Map Options - No API Key Required */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 200,
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid #ddd",
                      position: "relative",
                    }}
                  >
                    {/* OpenStreetMap Embed */}
                    <iframe
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=27.2000,37.8500,27.3000,37.9000&layer=mapnik&marker=37.8583,27.2583`}
                      title="Konum Haritası"
                    />

                    {/* Location info overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <LocationOn sx={{ color: "#e74c3c", fontSize: 16 }} />
                      <Typography
                        sx={{
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {ad.city?.name || "Aydın"} /{" "}
                        {ad.district?.name || "Kuşadası"}
                      </Typography>
                    </Box>

                    {/* Map controls */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {/* Google Maps button */}
                      <Box
                        sx={{
                          backgroundColor: "rgba(66, 133, 244, 0.95)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          fontSize: "10px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "rgb(66, 133, 244)",
                          },
                        }}
                        onClick={() => {
                          const cityName = ad.city?.name || "Aydın";
                          const districtName = ad.district?.name || "Kuşadası";
                          const searchQuery = `${cityName}, ${districtName}, Turkey`;
                          window.open(
                            `https://www.google.com/maps/search/${encodeURIComponent(
                              searchQuery
                            )}`,
                            "_blank"
                          );
                        }}
                      >
                        Google Maps
                      </Box>

                      {/* Yandex Maps button */}
                      <Box
                        sx={{
                          backgroundColor: "rgba(255, 219, 77, 0.95)",
                          color: "#333",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          fontSize: "10px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "rgb(255, 219, 77)",
                          },
                        }}
                        onClick={() => {
                          const cityName = ad.city?.name || "Aydın";
                          const districtName = ad.district?.name || "Kuşadası";
                          window.open(
                            `https://yandex.com.tr/maps/?text=${encodeURIComponent(
                              cityName + " " + districtName
                            )}`,
                            "_blank"
                          );
                        }}
                      >
                        Yandex Maps
                      </Box>
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
                    : typeof ad.customFields?.detailedInfo === "string"
                    ? ad.customFields.detailedInfo
                    : "Açıklama bulunmuyor."}
                </Typography>
              </Box>
            </Box>

            {/* Detaylı Bilgi Section */}
            {ad.customFields?.detailedInfo &&
              typeof ad.customFields.detailedInfo === "string" &&
              ad.customFields.detailedInfo.trim() !== "" && (
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
                      {ad.customFields.detailedInfo}
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
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {/* Features'dan gelen özellikler */}
                    {ad.customFields?.features &&
                      typeof ad.customFields.features === "object" &&
                      Object.entries(
                        ad.customFields.features as Record<string, boolean>
                      )
                        .filter(([, value]) => value === true)
                        .map(([key]) => (
                          <Chip
                            key={`feature-${key}`}
                            label={formatFeatureName(key)}
                            size="small"
                            sx={{
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              fontSize: "12px",
                              height: "28px",
                              fontWeight: "500",
                              "& .MuiChip-label": {
                                px: 1.5,
                              },
                            }}
                          />
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
                          <Chip
                            key={`detail-${key}`}
                            label={formatFeatureName(key)}
                            size="small"
                            sx={{
                              backgroundColor: "#e8f5e8",
                              color: "#2e7d32",
                              fontSize: "12px",
                              height: "28px",
                              fontWeight: "500",
                              "& .MuiChip-label": {
                                px: 1.5,
                              },
                            }}
                          />
                        ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
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
  );
};

export default AdDetail;
