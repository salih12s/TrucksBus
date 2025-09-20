import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Header from "../../layout/Header";
import apiClient from "../../../api/client";
import SuccessModal from "../../common/SuccessModal";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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

interface FormData {
  title: string;
  description: string;
  productionYear: string;
  price: string;

  // Kuruyük Kapaklı(Kaya Tipi) Özel Bilgiler
  dingilSayisi: string;
  uzunluk: string; // metre
  genislik: string; // metre
  yukseklik: string; // metre
  istiapHaddi: string; // ton
  kapakSistemi: string;
  lastikDurumu: string; // yüzde
  takasli: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // İletişim Bilgileri
  sellerName: string;
  phone: string;
  email: string;

  // Ekstra
  warranty: string;
  negotiable: string;
  exchange: string;

  detailedInfo: string;
}

// Form seçenekleri
const PRODUCTION_YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

const TIRE_CONDITIONS = ["%90-100", "%75-89", "%50-74", "%25-49", "%0-24"];

const COVER_SYSTEMS = [
  "Hidrolik Kapak",
  "Manuel Kapak",
  "Yan Açılır Kapak",
  "Arka Açılır Kapak",
  "Diğer",
];

const KapakliKayaTipiForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    dingilSayisi: "",
    uzunluk: "",
    genislik: "",
    yukseklik: "",
    istiapHaddi: "",
    kapakSistemi: "",
    lastikDurumu: "",
    takasli: "hayır",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    sellerName: "",
    phone: "",
    email: "",
    warranty: "yok",
    negotiable: "hayır",
    exchange: "hayır",
    detailedInfo: "",
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  // Photo preview states
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Şehirler yüklenirken hata:", error);
      }
    };
    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.cityId) {
        try {
          const response = await apiClient.get(
            `/cities/${formData.cityId}/districts`
          );
          setDistricts(response.data as District[]);
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [formData.cityId]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8)
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    if (digits.length <= 10)
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
        6,
        8
      )} ${digits.slice(8)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      8
    )} ${digits.slice(8, 10)}`;
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | File[] | File | null
  ) => {
    if (field === "phone" && typeof value === "string") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Dosyaları form data'ya ekle
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));

      // Preview'lar oluştur
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setPhotoPreviews((prev) => [...prev, base64String]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleShowcasePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, showcasePhoto: file }));

    // Preview oluştur
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setShowcasePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) newErrors.push("Başlık zorunludur");
    if (!formData.description.trim()) newErrors.push("Açıklama zorunludur");
    if (!formData.productionYear) newErrors.push("Üretim yılı zorunludur");
    if (!formData.price.trim()) newErrors.push("Fiyat zorunludur");
    if (!formData.dingilSayisi.trim())
      newErrors.push("Dingil sayısı zorunludur");
    if (!formData.uzunluk.trim()) newErrors.push("Uzunluk zorunludur");
    if (!formData.genislik.trim()) newErrors.push("Genişlik zorunludur");
    if (!formData.yukseklik.trim()) newErrors.push("Yükseklik zorunludur");
    if (!formData.istiapHaddi.trim()) newErrors.push("İstiap haddi zorunludur");
    if (!formData.kapakSistemi) newErrors.push("Kapak sistemi zorunludur");
    if (!formData.lastikDurumu) newErrors.push("Lastik durumu zorunludur");
    if (!formData.cityId) newErrors.push("Şehir zorunludur");
    if (!formData.districtId) newErrors.push("İlçe zorunludur");

    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const submitData = new FormData();

      // Legacy format için gerekli alanlar
      submitData.append("categoryId", "4"); // Dorse kategori ID'si

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("year", formData.productionYear);
      submitData.append("price", formData.price);

      // Kapaklı Kaya Tipi özel bilgileri
      submitData.append("dingilSayisi", formData.dingilSayisi);
      submitData.append("uzunluk", formData.uzunluk);
      submitData.append("genislik", formData.genislik);
      submitData.append("yukseklik", formData.yukseklik);
      submitData.append("istiapHaddi", formData.istiapHaddi);
      submitData.append("kapakSistemi", formData.kapakSistemi);
      submitData.append("lastikDurumu", formData.lastikDurumu);
      submitData.append("takasli", formData.takasli);

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // İletişim (legacy format field names)
      submitData.append("seller_name", formData.sellerName);
      submitData.append("seller_phone", formData.phone);
      submitData.append("seller_email", formData.email);

      // Ekstra
      submitData.append("warranty", formData.warranty);
      submitData.append("negotiable", formData.negotiable);
      submitData.append("exchange", formData.exchange);
      submitData.append("detailedInfo", formData.detailedInfo);

      // Fotoğraflar
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }
      formData.photos.forEach((photo) => {
        submitData.append(`photos`, photo);
      });

      const response = await apiClient.post("/ads", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = response.data as {
        success: boolean;
        message?: string;
        id?: string;
      };

      if (responseData.success) {
        setCreatedAdId(responseData.id || null);
        setShowSuccessModal(true);
      } else {
        throw new Error(responseData.message || "İlan oluşturulamadı");
      }
    } catch (error) {
      console.error("Form gönderilirken hata:", error);
      setErrors(["İlan gönderilirken bir hata oluştu. Lütfen tekrar deneyin."]);
    } finally {
      setLoading(false);
    }
  };

  // Success Modal Handlers
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleViewAd = () => {
    if (createdAdId) {
      navigate(`/ads/${createdAdId}`);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleMyAds = () => {
    navigate("/user/my-listings");
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Kapaklı Kaya Tipi İlanı Ver
          </Typography>

          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Temel Bilgiler */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Temel Bilgiler
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Üretim Yılı</InputLabel>
                <Select
                  value={formData.productionYear}
                  onChange={(e) =>
                    handleInputChange("productionYear", e.target.value)
                  }
                  label="Üretim Yılı"
                  required
                >
                  {PRODUCTION_YEARS.map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Fiyat (TL)"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                margin="normal"
                required
              />
            </Box>

            {/* Kapaklı Kaya Tipi Özel Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Kapaklı Kaya Tipi Bilgileri
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Dingil Sayısı"
                value={formData.dingilSayisi}
                onChange={(e) =>
                  handleInputChange("dingilSayisi", e.target.value)
                }
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Uzunluk (m)"
                value={formData.uzunluk}
                onChange={(e) => handleInputChange("uzunluk", e.target.value)}
                margin="normal"
                required
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Genişlik (m)"
                value={formData.genislik}
                onChange={(e) => handleInputChange("genislik", e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Yükseklik (m)"
                value={formData.yukseklik}
                onChange={(e) => handleInputChange("yukseklik", e.target.value)}
                margin="normal"
                required
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="İstiap Haddi (ton)"
                value={formData.istiapHaddi}
                onChange={(e) =>
                  handleInputChange("istiapHaddi", e.target.value)
                }
                margin="normal"
                required
              />

              <FormControl fullWidth>
                <InputLabel>Kapak Sistemi</InputLabel>
                <Select
                  value={formData.kapakSistemi}
                  onChange={(e) =>
                    handleInputChange("kapakSistemi", e.target.value)
                  }
                  label="Kapak Sistemi"
                  required
                >
                  {COVER_SYSTEMS.map((system) => (
                    <MenuItem key={system} value={system}>
                      {system}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Lastik Durumu</InputLabel>
                <Select
                  value={formData.lastikDurumu}
                  onChange={(e) =>
                    handleInputChange("lastikDurumu", e.target.value)
                  }
                  label="Lastik Durumu"
                  required
                >
                  {TIRE_CONDITIONS.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Takaslı</InputLabel>
                <Select
                  value={formData.takasli}
                  onChange={(e) => handleInputChange("takasli", e.target.value)}
                  label="Takaslı"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Konum Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Konum Bilgileri
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleInputChange("cityId", e.target.value)}
                  label="Şehir"
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    handleInputChange("districtId", e.target.value)
                  }
                  label="İlçe"
                  required
                  disabled={!formData.cityId}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 📸 Fotoğraflar */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                },
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <PhotoCameraIcon sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Fotoğraflar
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4, textAlign: "center", fontStyle: "italic" }}
                >
                  Kaliteli fotoğraflar ile ilanınızın dikkat çekmesini sağlayın
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 4,
                    mt: 3,
                  }}
                >
                  {/* Vitrin Fotoğrafı */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                      border: "2px dashed #0284c7",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      },
                    }}
                    component="label"
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "primary.main",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      🖼️ Vitrin Fotoğrafı
                      <Chip label="Zorunlu" color="error" size="small" />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Ana fotoğraf olarak kullanılacak en iyi fotoğrafınızı
                      seçin
                    </Typography>
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleShowcasePhotoUpload}
                    />
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      sx={{
                        borderRadius: 3,
                        py: 1.5,
                        px: 3,
                        fontWeight: 600,
                        background:
                          "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                        },
                      }}
                    >
                      Vitrin Fotoğrafı Seç
                    </Button>

                    {/* Vitrin fotoğrafı önizlemesi */}
                    {showcasePreview && (
                      <Box sx={{ mt: 3 }}>
                        <Box
                          sx={{
                            position: "relative",
                            display: "inline-block",
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          <img
                            src={showcasePreview}
                            alt="Vitrin fotoğrafı önizleme"
                            style={{
                              width: "200px",
                              height: "150px",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background: "rgba(0,0,0,0.7)",
                              borderRadius: "50%",
                              p: 0.5,
                              cursor: "pointer",
                              "&:hover": { background: "rgba(0,0,0,0.9)" },
                            }}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                showcasePhoto: null,
                              }));
                              setShowcasePreview(null);
                            }}
                          >
                            <Typography
                              sx={{ color: "white", fontSize: "14px" }}
                            >
                              ✕
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ display: "block", mt: 1 }}
                        >
                          Vitrin Fotoğrafı ✓
                        </Typography>
                      </Box>
                    )}

                    {formData.showcasePhoto && !showcasePreview && (
                      <Chip
                        label={formData.showcasePhoto.name}
                        color="primary"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Paper>

                  {/* Diğer Fotoğraflar */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "2px dashed #64748b",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      },
                    }}
                    component="label"
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "primary.main",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      📷 Diğer Fotoğraflar
                      <Chip label="İsteğe Bağlı" color="info" size="small" />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Aracınızın farklı açılardan fotoğraflarını ekleyin (En
                      fazla 15 adet)
                    </Typography>
                    <VisuallyHiddenInput
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      disabled={formData.photos.length >= 15}
                    >
                      Fotoğraf Ekle ({formData.photos.length}/15)
                    </Button>

                    {formData.photos.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 2, fontWeight: 600 }}
                        >
                          Yüklenen Fotoğraflar ({formData.photos.length}/15)
                        </Typography>

                        {/* Fotoğraf önizlemeleri grid */}
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(120px, 1fr))",
                            gap: 2,
                            maxHeight: "300px",
                            overflowY: "auto",
                            p: 1,
                            border: "1px solid #e0e0e0",
                            borderRadius: 2,
                            background: "#fafafa",
                          }}
                        >
                          {photoPreviews.map((preview, index) => (
                            <Box
                              key={index}
                              sx={{
                                position: "relative",
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                },
                              }}
                            >
                              <img
                                src={preview}
                                alt={`Fotoğraf ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "80px",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  background: "rgba(255,0,0,0.8)",
                                  borderRadius: "50%",
                                  width: 20,
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  "&:hover": { background: "rgba(255,0,0,1)" },
                                }}
                                onClick={() => removePhoto(index)}
                              >
                                <Typography
                                  sx={{
                                    color: "white",
                                    fontSize: "12px",
                                    lineHeight: 1,
                                  }}
                                >
                                  ✕
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "rgba(0,0,0,0.7)",
                                  color: "white",
                                  textAlign: "center",
                                  py: 0.5,
                                }}
                              >
                                <Typography variant="caption">
                                  {index + 1}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </CardContent>
            </Card>

            {/* Ekstra Bilgiler */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Ekstra Bilgiler
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Garanti</InputLabel>
                <Select
                  value={formData.warranty}
                  onChange={(e) =>
                    handleInputChange("warranty", e.target.value)
                  }
                  label="Garanti"
                >
                  <MenuItem value="var">Var</MenuItem>
                  <MenuItem value="yok">Yok</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Pazarlık</InputLabel>
                <Select
                  value={formData.negotiable}
                  onChange={(e) =>
                    handleInputChange("negotiable", e.target.value)
                  }
                  label="Pazarlık"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Takas</InputLabel>
                <Select
                  value={formData.exchange}
                  onChange={(e) =>
                    handleInputChange("exchange", e.target.value)
                  }
                  label="Takas"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Detaylı Bilgi"
              value={formData.detailedInfo}
              onChange={(e) =>
                handleInputChange("detailedInfo", e.target.value)
              }
              margin="normal"
              multiline
              rows={3}
            />

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : "İlanı Yayınla"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Success Modal */}
        <SuccessModal
          open={showSuccessModal}
          onClose={handleSuccessModalClose}
          onGoHome={handleGoHome}
          onViewAd={handleViewAd}
          onMyAds={handleMyAds}
          title="🎉 İlan Başarıyla Yayınlandı!"
          message="Kapaklı Kaya Tipi ilanınız başarıyla yayınlandı. Artık alıcılar tarafından görülebilir ve iletişime geçebilirler."
        />
      </Container>
    </Box>
  );
};

export default KapakliKayaTipiForm;
