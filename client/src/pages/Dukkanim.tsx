import React, { useState, useEffect, useCallback } from "react";
import { formatPrice as formatPriceUtil } from "../utils/formatPrice";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Avatar,
  Modal,
  TextField,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Settings,
  CameraAlt,
  Close,
  Save,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import type { User } from "../store/authSlice";
import { setCredentials } from "../store/authSlice";
import apiClient from "../api/client";
import { subscriptionApi } from "../api/subscription";

interface AdImage {
  id: number;
  url: string;
  imageUrl?: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  name: string;
  slug: string;
}

interface City {
  id: number;
  name: string;
  plateCode: string;
}

interface District {
  id: number;
  name: string;
  cityId: number;
}

interface Ad {
  id: number;
  title: string;
  price: number | null;
  currency?: string;
  location?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SOLD" | "EXPIRED";
  viewCount: number;
  year: number | null;
  mileage: number | null;
  images: AdImage[];
  category: Category;
  brand: Brand | null;
  model: Model | null;
  variant: Variant | null;
  city: City | null;
  district: District | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  categoryId: number;
  brandId: number | null;
  modelId: number | null;
  variantId: number | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  isPromoted: boolean;
  promotedUntil: string | null;
  customFields: Record<string, unknown> | null;
  chassisType: string | null;
  cityId: number | null;
  color: string | null;
  detailFeatures: Record<string, unknown> | null;
  districtId: number | null;
  driveType: string | null;
  engineCapacity: string | null;
  fuelType: string | null;
  isExchangeable: boolean | null;
  plateNumber: string | null;
  plateType: string | null;
  roofType: string | null;
  seatCount: string | null;
  transmissionType: string | null;
  vehicleCondition: string | null;
}

interface Variant {
  id: number;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const Dukkanim: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    companyName: "",
    address: "",
    profileImageUrl: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);

  const fetchStoreData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Kullanıcının ilanlarını ve subscription'ını getir
      const [adsResponse, userSubscription] = await Promise.all([
        apiClient.get("/ads/user/my-ads?limit=50"),
        subscriptionApi.getMySubscription().catch(() => null),
      ]);

      const { ads } = adsResponse.data as { ads: Ad[]; pagination: Pagination };
      setUserAds(ads);
      setSubscription(userSubscription);
    } catch (error) {
      console.error("Store data fetch error:", error);
      setError("Mağaza verileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // User bilgileri değiştiğinde form data'yı güncelle
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
        address: user.address || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        companyName: formData.companyName,
        address: formData.address,
        profileImageUrl: formData.profileImageUrl,
      };

      const response = await apiClient.put("/auth/profile", updateData);

      // Redux store'u güncelle
      const responseData = response.data as { user: User };
      const updatedUser = { ...user!, ...responseData.user };

      // Redux store'u dispatch ile güncelle
      const currentToken = localStorage.getItem("accessToken");
      if (currentToken) {
        dispatch(
          setCredentials({
            user: updatedUser,
            token: currentToken,
          }),
        );
      }

      setSettingsOpen(false);
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      setError("Profil güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("profileImage", file);

    try {
      const response = await apiClient.post(
        "/auth/upload-profile-image",
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const responseData = response.data as { imageUrl: string };
      const imageUrl = responseData.imageUrl;
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: imageUrl,
      }));
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      setError("Resim yüklenirken bir hata oluştu");
    }
  };

  const formatPrice = (price: number | null | undefined, currency?: string) => {
    return formatPriceUtil(price, currency || "TRY", "Fiyat belirtilmemiş");
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "Telefon belirtilmemiş";
    // Sadece rakamları al
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("0")) {
      // 0XXX XXX XX XX formatı
      return digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    } else if (digits.length === 10) {
      // XXX XXX XX XX formatı (başında 0 yoksa)
      return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
    }
    return phone; // Formatlanamadıysa orijinali döndür
  };

  const formatLocation = (city: City | null, district: District | null) => {
    if (city && district) {
      return `${city.name} / ${district.name}`;
    } else if (city) {
      return city.name;
    }
    return "Konum belirtilmemiş";
  };

  const getImageUrl = (images: AdImage[]) => {
    console.log("🖼️ getImageUrl called with:", images);

    if (!images || images.length === 0) {
      console.log("❌ No images found, using default");
      return "/Trucksbus.png";
    }

    // Öncelikle vitrin resmini (isPrimary: true) ara
    const primaryImage = images.find((img) => img.isPrimary === true);
    console.log("🏆 Primary image found:", primaryImage);

    let imageUrl: string = "";

    if (primaryImage) {
      console.log("🔍 Primary image details:", {
        id: primaryImage.id,
        url: primaryImage.url,
        imageUrl: primaryImage.imageUrl,
        isPrimary: primaryImage.isPrimary,
        hasUrl: !!primaryImage.url,
        hasImageUrl: !!primaryImage.imageUrl,
      });

      imageUrl = primaryImage.url || primaryImage.imageUrl || "";
      if (imageUrl) {
        console.log("✅ Using primary image:", imageUrl);
      }
    }

    if (!imageUrl && images[0]) {
      console.log("🔍 First image details:", {
        id: images[0].id,
        url: images[0].url,
        imageUrl: images[0].imageUrl,
        isPrimary: images[0].isPrimary,
      });

      imageUrl = images[0].url || images[0].imageUrl || "";
      if (imageUrl) {
        console.log("📷 Using first image:", imageUrl);
      }
    }

    if (!imageUrl) {
      console.log("❌ No valid image URL found in any image");
      return "/Trucksbus.png";
    }

    // imageUrl null/undefined kontrolü
    if (!imageUrl || typeof imageUrl !== "string") {
      console.log("❌ Invalid imageUrl:", imageUrl);
      return "/Trucksbus.png";
    }

    // Eğer URL zaten tam URL ise olduğu gibi döndür
    if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) {
      console.log("🌐 Full URL detected:", imageUrl);
      return imageUrl;
    }

    // API base URL ile birleştir - /api kısmını kaldır
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";
    const baseUrl = apiUrl.replace("/api", "");
    const finalUrl = `${baseUrl}${imageUrl}`;
    console.log("🔗 Final URL:", finalUrl);
    return finalUrl;
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 3, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Paper
        elevation={2}
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
        }}
      >
        {/* Header Background */}
        <Box
          sx={{
            height: 200,
            background: "linear-gradient(135deg, #313B4C 0%, #586575 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Profil Resmi */}
          <Box
            sx={{
              position: "absolute",
              left: 30,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={user?.profileImageUrl || undefined}
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: "2rem",
                  fontWeight: "bold",
                  border: "3px solid white",
                  backgroundColor: "#fff",
                  color: "#313B4C",
                }}
              >
                {!user?.profileImageUrl &&
                  (user?.firstName?.[0] || user?.email?.[0] || "U")}
              </Avatar>
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: -5,
                  right: -5,
                  backgroundColor: "white",
                  width: 30,
                  height: 30,
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
                onClick={() => {
                  // TODO: Profil resmi upload işlemi
                  console.log("Upload profile image");
                }}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* İsim */}
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {user?.companyName ||
              `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "Dükkanım"}
          </Typography>

          {/* Ayarlar ve Dükkan Aç Butonları */}
          <Box
            sx={{
              position: "absolute",
              right: 30,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #D34237 0%, #313B4C 100%)",
                color: "white",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                  transform: "scale(1.02)",
                },
                borderRadius: 2,
              }}
              onClick={() => navigate("/packages")}
            >
              🏪 Dükkan Aç
            </Button>
            <Button
              variant="contained"
              startIcon={<Settings />}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                backdropFilter: "blur(10px)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                borderRadius: 2,
              }}
              onClick={() => setSettingsOpen(true)}
            >
              Ayarlar
            </Button>
          </Box>
        </Box>

        {/* Company Info */}
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {user?.companyName
                  ? "Türkiye'nin en güvenilir ticari araç satış mağazalarından biri."
                  : "Bireysel satıcı - Güvenilir araç satışları."}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  <strong>Üye olma tarihi:</strong>{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                    : "Bilinmiyor"}
                </Typography>

                <Chip
                  label={`${userAds.length} aktif ilan`}
                  size="small"
                  variant="outlined"
                />

                {subscription && (
                  <Chip
                    label={`${
                      subscription.packageType === "trucks"
                        ? "Trucks"
                        : subscription.packageType === "trucks_plus"
                          ? "Trucks+"
                          : "TrucksBus"
                    } - ${subscription.adsUsed}/${subscription.adLimit} ilan`}
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      background: subscription.isTrial
                        ? "linear-gradient(135deg, #D34237 0%, #313B4C 100%)"
                        : "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                    }}
                  />
                )}

                {user?.phone && (
                  <Chip
                    icon={<LocationOn />}
                    label="İletişim bilgileri mevcut"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* İlanlarım Section */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            İlanlarım ({userAds.length})
          </Typography>

          {/* İstatistik kartları */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip
              label={`${
                userAds.filter((ad) => ad.status === "APPROVED").length
              } Onaylı`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`${
                userAds.filter((ad) => ad.status === "PENDING").length
              } Beklemede`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`${userAds.reduce(
                (sum, ad) => sum + (ad.viewCount || 0),
                0,
              )} Toplam Görüntülenme`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>

        {userAds.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "flex-start",
            }}
          >
            {userAds.map((ad) => (
              <Card
                key={ad.id}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "calc(50% - 8px)",
                    md: "calc(33.333% - 11px)",
                    lg: "calc(25% - 12px)",
                  },
                  minWidth: "280px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Kategori Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    zIndex: 1,
                  }}
                >
                  {ad.category?.name || "Kategori"}
                </Box>

                {/* Resim */}
                <Box
                  sx={{ position: "relative", cursor: "pointer" }}
                  onClick={() => navigate(`/ad/${ad.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={getImageUrl(ad.images)}
                    alt={ad.title}
                    sx={{
                      objectFit: "cover",
                      backgroundColor: "#f5f5f5",
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 2 }}>
                  {/* Başlık */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#333",
                      mb: 1,
                      fontSize: "1rem",
                      lineHeight: 1.2,
                      height: "2.4em",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/ad/${ad.id}`)}
                  >
                    {ad.title || "İlan Başlığı Belirtilmemiş"}
                  </Typography>

                  {/* Fiyat */}
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#2e7d32",
                      fontWeight: "bold",
                      mb: 2,
                      fontSize: "1.25rem",
                    }}
                  >
                    {formatPrice(ad.price, ad.currency)}
                  </Typography>

                  {/* Bilgiler */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        mb: 0.5,
                        fontSize: "0.85rem",
                      }}
                    >
                      <strong>Model Yılı:</strong> {ad.year || "Belirtilmemiş"}
                    </Typography>

                    {ad.mileage && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          mb: 0.5,
                          fontSize: "0.85rem",
                        }}
                      >
                        <strong>KM:</strong>{" "}
                        {ad.mileage.toLocaleString("tr-TR")} km
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        mb: 0.5,
                        fontSize: "0.85rem",
                      }}
                    >
                      <strong>Şehir/İlçe:</strong>{" "}
                      {formatLocation(ad.city, ad.district)}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#999",
                        fontSize: "0.8rem",
                      }}
                    >
                      <strong>İlan Tarihi:</strong>{" "}
                      {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                    </Typography>
                  </Box>

                  {/* Alt Bilgiler */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", fontSize: "0.8rem" }}
                    >
                      <strong>İlan Sahibi:</strong> {user?.firstName}{" "}
                      {user?.lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", fontSize: "0.8rem" }}
                    >
                      {formatPhone(user?.phone) || "0545 835 13 61"}
                    </Typography>
                  </Box>

                  {/* Detayları Gör Butonu */}
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: "#333",
                      color: "white",
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "#555",
                      },
                    }}
                    onClick={() => navigate(`/ad/${ad.id}`)}
                  >
                    Detayları Gör
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Henüz hiç ilanınız bulunmuyor
            </Typography>
          </Box>
        )}
      </Box>

      {/* Ayarlar Modal */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: { xs: "90%", sm: "70%", md: "50%" },
            maxWidth: 600,
            maxHeight: "90vh",
            overflow: "auto",
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Profil Ayarları
            </Typography>
            <IconButton onClick={() => setSettingsOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Profil Resmi */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Profil Resmi
            </Typography>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={formData.profileImageUrl || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                }}
              >
                {!formData.profileImageUrl && (formData.firstName?.[0] || "U")}
              </Avatar>

              <IconButton
                component="label"
                sx={{
                  position: "absolute",
                  bottom: -5,
                  right: -5,
                  backgroundColor: "primary.main",
                  color: "white",
                  width: 35,
                  height: 35,
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <CameraAlt />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Kişisel Bilgiler */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Kişisel Bilgiler
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              label="Ad"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              fullWidth
            />

            <TextField
              label="Soyad"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              fullWidth
            />

            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              fullWidth
            />

            <TextField
              label="Şirket Adı"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              fullWidth
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Adres Bilgileri */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Adres Bilgileri
          </Typography>

          <TextField
            label="Adres"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          {/* Kaydet Butonu */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => setSettingsOpen(false)}>
              İptal
            </Button>

            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default Dukkanim;
