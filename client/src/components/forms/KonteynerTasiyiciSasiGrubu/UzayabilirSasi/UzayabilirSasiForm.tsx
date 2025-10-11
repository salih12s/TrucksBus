import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera,
  LocationOn,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Header from "../../../layout/Header";
import apiClient from "../../../../api/client";

// Uzayabilir Şasi Markaları (MainLayout'tan alındı)
const UZAYABILIR_SASI_BRANDS = [
  "Seçiniz",
  "Abd Treyler",
  "Adakon Treyler",
  "Adem Usta Proohauss",
  "AGS Treyler",
  "Akar Cihat",
  "Akmanlar Damper",
  "Akyel Treyler",
  "Alamen",
  "Alim Dorse",
  "Alp-Kar",
  "Alpsan",
  "Altınel",
  "ART Trailer",
  "Askan Treyler",
  "ASY Treyler",
  "Aydeniz Dorse",
  "Beyfem Dorse",
  "Bio Treyler",
  "Can Damper Karoser",
  "Cangül Treyler",
  "CastroMax Trailers",
  "Derya Treyler",
  "Doruk Treyler",
  "ELM Treysan Trailer",
  "EMK Treyler",
  "Esatech Trailer",
  "Eşmeliler Treyler",
  "Fors Treyler",
  "Global City",
  "Gülistan",
  "Güneş Treyler",
  "Güneyşan",
  "Güveneller Dorse",
  "Hürsan",
  "Iskar Treyler",
  "İki Kardeş",
  "İkon Treyler",
  "Kalkan Treyler",
  "Konza Trailer",
  "Kögel Trailer",
  "Makinsan Treyler",
  "Marrka Treyler",
  "MAS Trailer",
  "Mas Treyler",
  "Maxtır Trailer",
  "Mehsan Treyler",
  "Mobil Treyler",
  "MRC Treyler",
  "MS Muratsan Treyler",
  "Nedex",
  "Nükte Trailer",
  "Oktar Treyler",
  "Optimak Treyler",
  "Orthaus Treyler",
  "OtoÇinler",
  "Otokar",
  "Oymak Cargomaster",
  "Oymak Träger",
  "Özenir",
  "Özenir Dorse",
  "Özgül Treyler",
  "Öztfn Treyler",
  "Paşalar Mehmet Treyler",
  "Paşalar Treyler",
  "Paşaoğlu Dorse Treyler",
  "Ram-Kar",
  "Ram Treyler",
  "Reis Treyler",
  "Renders",
  "Sancak Treyler",
  "Schmitz Cargobull",
  "Seyit Usta",
  "Simbоxx",
  "Sim Treyler",
  "Sistem Damper Treyler",
  "Star Yağcılar",
  "Takdir Dorse",
  "Tanı Tır",
  "Tırsan Treyler",
  "Töke Makina",
  "Traco",
  "Transfer Treyler",
  "Warkas",
  "Wielton",
  "Yelsan Treyler",
  "Yıldızlar Damper",
  "Zafer Treyler",
  "Özel Üretim",
  "Diğer",
];

// Styled Components
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

interface User {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
}

interface RootState {
  auth: AuthState;
}

// Types
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
  // Temel bilgiler
  title: string;
  description: string;
  productionYear: string;
  dorseBrand: string;
  axleCount: string;
  loadCapacity: string;
  tireCondition: string;
  isExchangeable: string;

  // Fotoğraflar
  showcasePhoto: File | null;
  uploadedImages: File[];

  // Konum
  cityId: string;
  districtId: string;

  // İletişim
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;

  // Fiyat
  price: string;
}

const steps = ["Araç Bilgileri", "Fotoğraflar", "Konum ve İletişim"];

const UzayabilirSasiForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // States
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showcasePreview, setShowcasePreview] = useState<string>("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    dorseBrand: "Seçiniz",
    axleCount: "",
    loadCapacity: "",
    tireCondition: "",
    isExchangeable: "",
    showcasePhoto: null,
    uploadedImages: [],
    cityId: "",
    districtId: "",
    sellerName: user?.firstName + " " + user?.lastName || "",
    sellerPhone: user?.phone || "",
    sellerEmail: user?.email || "",
    price: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Effects
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCities();
  }, [user, navigate]);

  useEffect(() => {
    if (formData.cityId) {
      fetchDistricts(parseInt(formData.cityId));
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.cityId]);

  // API Functions
  const fetchCities = async () => {
    try {
      const response = await apiClient.get("/location/cities");
      setCities(response.data as City[]);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchDistricts = async (cityId: number) => {
    try {
      const response = await apiClient.get(`/location/districts/${cityId}`);
      setDistricts(response.data as District[]);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  // Event Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "showcase" | "gallery"
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (type === "showcase") {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setShowcasePreview(e.target.result as string);
          setFormData((prev) => ({ ...prev, showcasePhoto: file }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Gallery photos
      const newFiles = Array.from(files);
      const currentCount = photoPreviews.length;
      const availableSlots = 9 - currentCount;
      const filesToAdd = newFiles.slice(0, availableSlots);

      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotoPreviews((prev) => [...prev, e.target!.result as string]);
            setFormData((prev) => ({
              ...prev,
              uploadedImages: [...prev.uploadedImages, file],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryPhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.title.trim()) {
          setSnackbar({
            open: true,
            message: "İlan başlığı zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.description.trim()) {
          setSnackbar({
            open: true,
            message: "Açıklama zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.productionYear) {
          setSnackbar({
            open: true,
            message: "Üretim yılı zorunludur",
            severity: "error",
          });
          return false;
        }
        return true;

      case 1:
        if (!formData.showcasePhoto) {
          setSnackbar({
            open: true,
            message: "En az vitrin fotoğrafı yüklemelisiniz",
            severity: "error",
          });
          return false;
        }
        return true;

      case 2:
        if (!formData.cityId) {
          setSnackbar({
            open: true,
            message: "Şehir seçimi zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.districtId) {
          setSnackbar({
            open: true,
            message: "İlçe seçimi zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.sellerName.trim()) {
          setSnackbar({
            open: true,
            message: "Satıcı adı zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.sellerPhone.trim()) {
          setSnackbar({
            open: true,
            message: "Telefon numarası zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.price.trim()) {
          setSnackbar({
            open: true,
            message: "Fiyat bilgisi zorunludur",
            severity: "error",
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("axleCount", formData.axleCount);
      submitData.append("loadCapacity", formData.loadCapacity);
      submitData.append("tireCondition", formData.tireCondition);
      submitData.append("isExchangeable", formData.isExchangeable);

      // Dorse markası
      if (formData.dorseBrand && formData.dorseBrand !== "Seçiniz") {
        submitData.append("dorseBrand", formData.dorseBrand);
      }

      // Konum ve iletişim
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);
      submitData.append("sellerName", formData.sellerName);
      submitData.append("sellerPhone", formData.sellerPhone);
      submitData.append("sellerEmail", formData.sellerEmail);
      submitData.append("price", formData.price);

      // Fotoğraflar
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.uploadedImages.forEach((file) => {
        submitData.append(`photos`, file);
      });

      await apiClient.post("/ads/uzayabilir-sasi", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSnackbar({
        open: true,
        message: "İlan başarıyla oluşturuldu!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "İlan oluşturulurken bir hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="İlan Başlığı *"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Uzayabilir şasi"
            />

            <TextField
              fullWidth
              label="Açıklama *"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              placeholder="Uzayabilir şasiniz hakkında detaylı bilgi verin"
            />

            <FormControl fullWidth>
              <InputLabel>Üretim Yılı *</InputLabel>
              <Select
                name="productionYear"
                value={formData.productionYear}
                onChange={handleSelectChange}
                label="Üretim Yılı *"
              >
                {Array.from(
                  { length: 30 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Dorse Markası</InputLabel>
              <Select
                name="dorseBrand"
                value={formData.dorseBrand}
                onChange={handleSelectChange}
                label="Dorse Markası"
              >
                {UZAYABILIR_SASI_BRANDS.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Aks Sayısı</InputLabel>
              <Select
                name="axleCount"
                value={formData.axleCount}
                onChange={handleSelectChange}
                label="Aks Sayısı"
              >
                <MenuItem value="1">1 Aks</MenuItem>
                <MenuItem value="2">2 Aks</MenuItem>
                <MenuItem value="3">3 Aks</MenuItem>
                <MenuItem value="4">4 Aks</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Yük Kapasitesi (ton)"
              name="loadCapacity"
              value={formData.loadCapacity}
              onChange={handleInputChange}
              placeholder="Örn: 25"
            />

            <FormControl fullWidth>
              <InputLabel>Lastik Durumu</InputLabel>
              <Select
                name="tireCondition"
                value={formData.tireCondition}
                onChange={handleSelectChange}
                label="Lastik Durumu"
              >
                <MenuItem value="Yeni">Yeni</MenuItem>
                <MenuItem value="Çok İyi">Çok İyi</MenuItem>
                <MenuItem value="İyi">İyi</MenuItem>
                <MenuItem value="Orta">Orta</MenuItem>
                <MenuItem value="Değişmeli">Değişmeli</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Takas</InputLabel>
              <Select
                name="isExchangeable"
                value={formData.isExchangeable}
                onChange={handleSelectChange}
                label="Takas"
              >
                <MenuItem value="Evet">Evet</MenuItem>
                <MenuItem value="Hayır">Hayır</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: 600 }}>
              Fotoğraf Yükleyin
            </Typography>

            {/* Vitrin Fotoğrafı */}
            <Box
              sx={{
                border: "2px dashed #e0e0e0",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                bgcolor: "#fafafa",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#1976d2",
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Vitrin Fotoğrafı
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bu fotoğraf ilan listenizde ana fotoğraf olarak görünecektir
              </Typography>

              {showcasePreview ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={showcasePreview}
                    alt="Vitrin fotoğrafı"
                    style={{
                      width: 200,
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "3px solid #1976d2",
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      setShowcasePreview("");
                      setFormData((prev) => ({ ...prev, showcasePhoto: null }));
                    }}
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      bgcolor: "error.main",
                      color: "white",
                      width: 30,
                      height: 30,
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <Chip
                    icon={<PhotoCamera />}
                    label="Vitrin Fotoğrafı"
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      bgcolor: "rgba(25, 118, 210, 0.9)",
                      color: "white",
                    }}
                  />
                </Box>
              ) : (
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  sx={{
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Vitrin Fotoğrafı Seç
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, "showcase")}
                  />
                </Button>
              )}
            </Box>

            {/* Galeri Fotoğrafları */}
            <Box
              sx={{
                border: "2px dashed #e0e0e0",
                borderRadius: 2,
                p: 3,
                bgcolor: "#fafafa",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#1976d2",
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Galeri Fotoğrafları ({photoPreviews.length}/9)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                İlanınızı daha çekici hale getirmek için ek fotoğraflar ekleyin
              </Typography>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={photoPreviews.length >= 9}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                Fotoğraf Ekle
                <VisuallyHiddenInput
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, "gallery")}
                />
              </Button>

              {photoPreviews.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  {photoPreviews.map((preview, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        width: 120,
                        height: 90,
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Galeri ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        onClick={() => removeGalleryPhoto(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(244, 67, 54, 0.9)",
                          color: "white",
                          width: 24,
                          height: 24,
                          "&:hover": { bgcolor: "error.main" },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: 600 }}>
              Konum ve İletişim Bilgileri
            </Typography>

            {/* Konum Seçimi */}
            <Box
              sx={{
                p: 3,
                border: "2px solid #e3f2fd",
                borderRadius: 3,
                bgcolor: "#fafffe",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: "primary.main",
                },
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <LocationOn sx={{ color: "primary.main", fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1976d2" }}
                >
                  Araç Lokasyonu
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth required>
                    <InputLabel
                      sx={{
                        color: "#1976d2",
                        fontWeight: 500,
                        "&.Mui-focused": { color: "#1976d2" },
                      }}
                    >
                      Şehir
                    </InputLabel>
                    <Select
                      name="cityId"
                      value={formData.cityId}
                      onChange={handleSelectChange}
                      label="Şehir"
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e3f2fd",
                          borderWidth: 2,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      }}
                    >
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth required disabled={!formData.cityId}>
                    <InputLabel
                      sx={{
                        color: "#1976d2",
                        fontWeight: 500,
                        "&.Mui-focused": { color: "#1976d2" },
                      }}
                    >
                      İlçe
                    </InputLabel>
                    <Select
                      name="districtId"
                      value={formData.districtId}
                      onChange={handleSelectChange}
                      label="İlçe"
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#e3f2fd",
                          borderWidth: 2,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      }}
                    >
                      {districts.map((district) => (
                        <MenuItem key={district.id} value={district.id}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {/* İletişim Bilgileri */}
            <Box
              sx={{
                p: 3,
                border: "2px solid #e8f5e8",
                borderRadius: 3,
                bgcolor: "#fafffe",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: "success.main",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 600, color: "#2e7d32" }}
              >
                İletişim Bilgileri
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      required
                      label="Satıcı Adı"
                      name="sellerName"
                      value={formData.sellerName}
                      onChange={handleInputChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#e8f5e8",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#2e7d32",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#2e7d32",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#2e7d32",
                          fontWeight: 500,
                          "&.Mui-focused": { color: "#2e7d32" },
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      required
                      label="Telefon Numarası"
                      name="sellerPhone"
                      value={formData.sellerPhone}
                      onChange={handleInputChange}
                      placeholder="0XXX XXX XX XX"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#e8f5e8",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#2e7d32",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#2e7d32",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#2e7d32",
                          fontWeight: 500,
                          "&.Mui-focused": { color: "#2e7d32" },
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="E-posta (Opsiyonel)"
                    name="sellerEmail"
                    type="email"
                    value={formData.sellerEmail}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#e8f5e8",
                          borderWidth: 2,
                        },
                        "&:hover fieldset": {
                          borderColor: "#2e7d32",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#2e7d32",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#2e7d32",
                        fontWeight: 500,
                        "&.Mui-focused": { color: "#2e7d32" },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Fiyat Bilgisi */}
            <Box
              sx={{
                p: 3,
                border: "2px solid #fff3e0",
                borderRadius: 3,
                bgcolor: "#fafffe",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: "warning.main",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 600, color: "#f57c00" }}
              >
                Fiyat Bilgisi
              </Typography>

              <TextField
                fullWidth
                required
                label="Fiyat (TL)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Örn: 150000"
                InputProps={{
                  endAdornment: (
                    <Typography
                      variant="body2"
                      sx={{ color: "#f57c00", fontWeight: 600 }}
                    >
                      TL
                    </Typography>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#fff3e0",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "#f57c00",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#f57c00",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#f57c00",
                    fontWeight: 500,
                    "&.Mui-focused": { color: "#f57c00" },
                  },
                }}
              />
            </Box>
          </Box>
        );

      default:
        return <div>Bilinmeyen adım</div>;
    }
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f7fa",
          pt: 4,
          pb: 6,
        }}
      >
        <Box
          sx={{
            maxWidth: 800,
            mx: "auto",
            px: { xs: 2, sm: 3 },
          }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #e0e7ff",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  Uzayabilir Şasi İlanı
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  İlanınızı oluşturmak için formu doldurun
                </Typography>
              </Box>

              {/* Stepper */}
              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  "& .MuiStepLabel-label": {
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 500,
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Content */}
              <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>

              {/* Navigation */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 4,
                  pt: 3,
                  borderTop: "1px solid #e0e7ff",
                }}
              >
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Geri
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "İlanı Yayınla"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                      },
                    }}
                  >
                    İleri
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default UzayabilirSasiForm;
