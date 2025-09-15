import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Container } from "@mui/material";
import { Star } from "@mui/icons-material";
import { API_BASE_URL } from "../api/client";

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

        setLoading(false);
      } catch (error) {
        console.error("Error fetching ad:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchAd();
    }
  }, [id]);

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

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 4, lg: 8 } }}>
        <Box sx={{ py: 2 }}>
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
                  startIcon={<Star />}
                  size="small"
                  sx={{
                    borderColor: "#007bff",
                    color: "#007bff",
                    fontSize: "12px",
                    "&:hover": {
                      backgroundColor: "#007bff",
                      color: "white",
                    },
                  }}
                >
                  Favorilerime Ekle
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
            {/* Left Side - Images (45%) */}
            <Box sx={{ flex: { lg: "0 0 45%" } }}>
              {/* Main Image */}
              <Box sx={{ mb: 2, position: "relative" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: 350,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
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
                    display: "flex",
                    gap: 1,
                    overflowX: "auto",
                    pb: 1,
                    "&::-webkit-scrollbar": {
                      height: 6,
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
                        onClick={() => setSelectedImageIndex(index)}
                        sx={{
                          minWidth: 80,
                          height: 60,
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

                    // Araç Detayları (customFields'tan)
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
                      value: ad.customFields?.drivetrain || null,
                    },
                    {
                      label: "Motor Gücü",
                      value:
                        ad.customFields?.motorPower || ad.enginePower || null,
                    },
                    { label: "Motor Hacmi", value: ad.engineVolume || null },
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
                    { label: "Koltuk Sayısı", value: ad.seatCount || null },

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
                      value: ad.platformLength || null,
                    },
                    {
                      label: "Platform Genişlik",
                      value: ad.platformWidth || null,
                    },
                    { label: "Çatı Tipi", value: ad.roofType || null },

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
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: "#fafbfc",
                            borderRight: "1px solid #f0f0f0",
                            fontSize: "11px",
                            fontWeight: "500",
                            color: "#666",
                          }}
                        >
                          {item.label}
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            px: 1.5,
                            py: 0.5,
                            fontSize: "11px",
                            color: "#333",
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
                    sx={{
                      backgroundColor: "#007bff",
                      color: "white",
                      mb: 1.5,
                      fontSize: "12px",
                      py: 1,
                      "&:hover": {
                        backgroundColor: "#0056b3",
                      },
                    }}
                  >
                    📞 Mesaj Gönder
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "#007bff",
                      color: "#007bff",
                      fontSize: "11px",
                      py: 0.8,
                      "&:hover": {
                        backgroundColor: "#f8f9fa",
                      },
                    }}
                  >
                    İlan ile İlgili Şikayetin Var
                  </Button>
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

            {/* Özellikler Section */}
            {ad.customFields?.features &&
              typeof ad.customFields.features === "object" && (
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
                      Özellikler
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {Object.entries(
                        ad.customFields.features as Record<string, boolean>
                      )
                        .filter(([, value]) => value === true)
                        .map(([key]) => (
                          <Chip
                            key={key}
                            label={key}
                            size="small"
                            sx={{
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              fontSize: "10px",
                              height: "20px",
                              "& .MuiChip-label": {
                                px: 1,
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
    </Box>
  );
};

export default AdDetail;
