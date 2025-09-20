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

  // Kuruyük Kapaklı Özel Bilgiler
  dingilSayisi: string;
  uzunluk: string; // metre
  genislik: string; // metre
  kapakYuksekligi: string; // metre
  istiapHaddi: string; // ton
  krikoAyak: string;
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

const KapakliForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    dingilSayisi: "",
    uzunluk: "",
    genislik: "",
    kapakYuksekligi: "",
    istiapHaddi: "",
    krikoAyak: "hayır",
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
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };

  const handleShowcasePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, showcasePhoto: file }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
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
    if (!formData.kapakYuksekligi.trim())
      newErrors.push("Kapak yüksekliği zorunludur");
    if (!formData.istiapHaddi.trim()) newErrors.push("İstiap haddi zorunludur");
    if (!formData.lastikDurumu) newErrors.push("Lastik durumu zorunludur");
    if (!formData.cityId) newErrors.push("Şehir zorunludur");
    if (!formData.districtId) newErrors.push("İlçe zorunludur");
    if (!formData.sellerName.trim()) newErrors.push("Satıcı adı zorunludur");
    if (!formData.phone.trim()) newErrors.push("Telefon zorunludur");
    if (!formData.email.trim()) newErrors.push("E-posta zorunludur");

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

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("price", formData.price);

      // Kapaklı özel bilgileri
      submitData.append("dingilSayisi", formData.dingilSayisi);
      submitData.append("uzunluk", formData.uzunluk);
      submitData.append("genislik", formData.genislik);
      submitData.append("kapakYuksekligi", formData.kapakYuksekligi);
      submitData.append("istiapHaddi", formData.istiapHaddi);
      submitData.append("krikoAyak", formData.krikoAyak);
      submitData.append("lastikDurumu", formData.lastikDurumu);
      submitData.append("takasli", formData.takasli);

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // İletişim
      submitData.append("sellerName", formData.sellerName);
      submitData.append("phone", formData.phone);
      submitData.append("email", formData.email);

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

      const response = await apiClient.post("/listings", submitData, {
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
            Kapaklı Kuruyük İlanı Ver
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

            {/* Kapaklı Özel Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Kapaklı Kuruyük Bilgileri
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
                label="Kapak Yüksekliği (m)"
                value={formData.kapakYuksekligi}
                onChange={(e) =>
                  handleInputChange("kapakYuksekligi", e.target.value)
                }
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
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Kriko Ayak</InputLabel>
                <Select
                  value={formData.krikoAyak}
                  onChange={(e) =>
                    handleInputChange("krikoAyak", e.target.value)
                  }
                  label="Kriko Ayak"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
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

            {/* Fotoğraflar */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Fotoğraf Ekle
            </Typography>

            <Box
              sx={{
                border: "2px dashed #2196f3",
                borderRadius: "16px",
                padding: "32px",
                textAlign: "center",
                backgroundColor: "#f8fafe",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#1976d2",
                  backgroundColor: "#e3f2fd",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(33, 150, 243, 0.15)",
                },
                mb: 3,
              }}
              component="label"
            >
              <PhotoCameraIcon
                sx={{
                  fontSize: 56,
                  mb: 2,
                  color: "#2196f3",
                  filter: "drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3))",
                }}
              />
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: "#1976d2", fontWeight: 600 }}
              >
                Fotoğraf Yükle
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, color: "#666", maxWidth: 400, mx: "auto" }}
              >
                İlk yüklediğiniz fotoğraf vitrin fotoğrafı olacaktır. En fazla
                10 fotoğraf yükleyebilirsiniz.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                sx={{
                  backgroundColor: "#2196f3",
                  color: "white",
                  paddingX: 4,
                  paddingY: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: "25px",
                  boxShadow: "0 4px 15px rgba(33, 150, 243, 0.4)",
                  "&:hover": {
                    backgroundColor: "#1976d2",
                    boxShadow: "0 6px 20px rgba(33, 150, 243, 0.6)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Vitrin Fotoğrafı Seç
              </Button>
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleShowcasePhotoUpload}
              />
            </Box>

            {formData.showcasePhoto && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#1976d2", mb: 2 }}
                >
                  ✨ Vitrin Fotoğrafı
                </Typography>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Chip
                    label={formData.showcasePhoto.name}
                    onDelete={() => handleInputChange("showcasePhoto", null)}
                    sx={{
                      backgroundColor: "#4caf50",
                      color: "white",
                      fontWeight: "bold",
                      "& .MuiChip-deleteIcon": {
                        color: "white",
                      },
                    }}
                  />
                </Box>
              </Box>
            )}

            <Box
              sx={{
                border: "2px dashed #ff9800",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                backgroundColor: "#fffaf0",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#f57c00",
                  backgroundColor: "#fff3e0",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(255, 152, 0, 0.15)",
                },
                mb: 3,
              }}
              component="label"
            >
              <PhotoCameraIcon
                sx={{
                  fontSize: 48,
                  mb: 2,
                  color: "#ff9800",
                  filter: "drop-shadow(0 2px 4px rgba(255, 152, 0, 0.3))",
                }}
              />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#f57c00", fontWeight: 600 }}
              >
                Ek Fotoğraflar Yükle
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
                Ürününüzün farklı açılardan fotoğraflarını ekleyin
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                sx={{
                  borderColor: "#ff9800",
                  color: "#ff9800",
                  paddingX: 3,
                  paddingY: 1,
                  borderRadius: "20px",
                  "&:hover": {
                    borderColor: "#f57c00",
                    backgroundColor: "#fff3e0",
                  },
                }}
              >
                Fotoğraf Seç
              </Button>
              <VisuallyHiddenInput
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </Box>

            {formData.photos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#1976d2", mb: 2 }}
                >
                  📸 Ek Fotoğraflar ({formData.photos.length})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {formData.photos.map((photo, index) => (
                    <Chip
                      key={index}
                      label={`${index + 1}. ${photo.name.substring(0, 20)}${
                        photo.name.length > 20 ? "..." : ""
                      }`}
                      onDelete={() => removePhoto(index)}
                      sx={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        fontWeight: "500",
                        "& .MuiChip-deleteIcon": {
                          color: "#1976d2",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* İletişim Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              İletişim Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="Satıcı Adı"
              value={formData.sellerName}
              onChange={(e) => handleInputChange("sellerName", e.target.value)}
              margin="normal"
              required
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                margin="normal"
                required
              />
            </Box>

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
          message="Kapaklı Kuruyük ilanınız başarıyla yayınlandı. Artık alıcılar tarafından görülebilir ve iletişime geçebilirler."
        />
      </Container>
    </Box>
  );
};

export default KapakliForm;
