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
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../layout/Header";
import apiClient from "../../../api/client";

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

  // Silobas Özel Bilgileri
  hacim: string;
  dingilSayisi: string;
  lastikDurumu: string;
  renk: string;
  takasli: string;
  silobasTuru: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

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

const COLORS = [
  "Beyaz",
  "Siyah",
  "Gri",
  "Kırmızı",
  "Mavi",
  "Yeşil",
  "Sarı",
  "Turuncu",
  "Kahverengi",
  "Diğer",
];

const SILOBAS_TYPES = [
  "Çimento Silosu",
  "Un Silosu",
  "Yem Silosu",
  "Kum Silosu",
  "Kireç Silosu",
  "Diğer",
];

const SilobasForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    hacim: "",
    dingilSayisi: "",
    lastikDurumu: "",
    renk: "",
    takasli: "hayır",
    silobasTuru: "",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    warranty: "yok",
    negotiable: "hayır",
    exchange: "hayır",
    detailedInfo: "",
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Photo preview states
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/ads/cities");
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
            `/ads/cities/${formData.cityId}/districts`
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

  const handleInputChange = (
    field: keyof FormData,
    value: string | File[] | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const file = files[0];

      // Base64 formatına çevir
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        // İlk resmi showcase olarak belirle
        if (!formData.showcasePhoto) {
          setFormData((prev) => ({ ...prev, showcasePhoto: file }));
          setShowcasePreview(base64String);
        } else {
          // Diğer resimleri photos array'ine ekle
          setFormData((prev) => ({ ...prev, photos: [...prev.photos, file] }));
          setPhotoPreviews((prev) => [...prev, base64String]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number, isShowcase: boolean = false) => {
    if (isShowcase) {
      setFormData((prev) => ({ ...prev, showcasePhoto: null }));
      setShowcasePreview(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index),
      }));
      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) newErrors.push("Başlık zorunludur");
    if (!formData.description.trim()) newErrors.push("Açıklama zorunludur");
    if (!formData.productionYear) newErrors.push("Üretim yılı zorunludur");
    if (!formData.price.trim()) newErrors.push("Fiyat zorunludur");
    if (!formData.hacim.trim()) newErrors.push("Hacim zorunludur");
    if (!formData.dingilSayisi.trim())
      newErrors.push("Dingil sayısı zorunludur");
    if (!formData.lastikDurumu) newErrors.push("Lastik durumu zorunludur");
    if (!formData.renk) newErrors.push("Renk zorunludur");
    if (!formData.silobasTuru) newErrors.push("Silobas türü zorunludur");
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

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("price", formData.price);

      // Silobas özel bilgileri
      submitData.append("hacim", formData.hacim);
      submitData.append("dingilSayisi", formData.dingilSayisi);
      submitData.append("lastikDurumu", formData.lastikDurumu);
      submitData.append("renk", formData.renk);
      submitData.append("takasli", formData.takasli);
      submitData.append("silobasTuru", formData.silobasTuru);

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

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

      await apiClient.post("/ads/dorse", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/ads/success");
    } catch (error) {
      console.error("Form gönderilirken hata:", error);
      setErrors(["İlan gönderilirken bir hata oluştu. Lütfen tekrar deneyin."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Silobas İlanı Ver
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

            {/* Silobas Özel Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Silobas Bilgileri
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Hacim (m³)"
                value={formData.hacim}
                onChange={(e) => handleInputChange("hacim", e.target.value)}
                margin="normal"
                required
              />

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
                <InputLabel>Renk</InputLabel>
                <Select
                  value={formData.renk}
                  onChange={(e) => handleInputChange("renk", e.target.value)}
                  label="Renk"
                  required
                >
                  {COLORS.map((color) => (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Silobas Türü</InputLabel>
                <Select
                  value={formData.silobasTuru}
                  onChange={(e) =>
                    handleInputChange("silobasTuru", e.target.value)
                  }
                  label="Silobas Türü"
                  required
                >
                  {SILOBAS_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
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

            {/* Fotoğraf Ekleme */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Fotoğraf Ekle
            </Typography>

            <Box
              sx={{
                border: "2px dashed #e0e0e0",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#1976d2",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                },
                mb: 3,
              }}
              component="label"
            >
              <PhotoCameraIcon sx={{ fontSize: 48, mb: 2, color: "inherit" }} />
              <Typography variant="h6" gutterBottom>
                Fotoğraf Yükle
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                İlk yüklediğiniz fotoğraf vitrin fotoğrafı olacaktır
              </Typography>
              <Button
                variant="contained"
                startIcon={<PhotoCameraIcon />}
                sx={{
                  background:
                    "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                  },
                }}
              >
                Fotoğraf Seç
              </Button>
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                multiple
              />
            </Box>

            {/* Fotoğraf Önizlemeleri */}
            {(showcasePreview || photoPreviews.length > 0) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Yüklenen Fotoğraflar
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {/* Vitrin Fotoğrafı */}
                  {showcasePreview && (
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={showcasePreview}
                        sx={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "3px solid #4caf50",
                        }}
                      />
                      <Chip
                        label="VİTRİN"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -8,
                          left: -8,
                          background: "#4caf50",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                      <IconButton
                        onClick={() => removePhoto(0, true)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "rgba(255,255,255,0.9)",
                          "&:hover": { background: "rgba(255,255,255,1)" },
                        }}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* Diğer Fotoğraflar */}
                  {photoPreviews.map((preview, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={preview}
                        sx={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "2px solid #e0e0e0",
                        }}
                      />
                      <IconButton
                        onClick={() => removePhoto(index)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "rgba(255,255,255,0.9)",
                          "&:hover": { background: "rgba(255,255,255,1)" },
                        }}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

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
      </Container>
    </Box>
  );
};

export default SilobasForm;
