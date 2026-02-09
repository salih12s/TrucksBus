import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Card,
  CardContent,
  RadioGroup,
  Radio,
  FormLabel,
  Chip,
  Modal,
  Backdrop,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  PhotoCamera,
} from "@mui/icons-material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import apiClient from "../../../api/client";
import Header from "../../layout/Header";

// Types
interface City {
  id: string;
  name: string;
  plateCode: string;
}

interface District {
  id: string;
  name: string;
  cityId: string;
}

interface FormData {
  // Temel bilgiler
  title: string;
  description: string;
  productionYear: string;
  hasDamper: boolean;
  isExchangeable: string;

  // Fotoğraf bilgileri
  showcasePhoto: File | null;
  photos: File[];

  // İletişim ve fiyat bilgileri
  price: string;
  priceType: string;
  currency: string;
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
  cityId: string;
  districtId: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const BoruRomorkForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const user = useSelector(
    (state: {
      auth: {
        user: {
          first_name: string;
          last_name: string;
          phone?: string;
          email: string;
          city?: string;
          district?: string;
        } | null;
      };
    }) => state.auth.user
  );

  // Parse location state for brand/model/variant data
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;

  // Debug log location state
  useEffect(() => {
    console.log(
      "🔍 URL Params - Category:",
      categorySlug,
      "Brand:",
      brandSlug,
      "Model:",
      modelSlug,
      "Variant:",
      variantSlug
    );
    console.log("🔍 Location state:", location.state);
    console.log("🔍 Selected Brand:", selectedBrand);
    console.log("🔍 Selected Model:", selectedModel);
    console.log("🔍 Selected Variant:", selectedVariant);
  }, [
    categorySlug,
    brandSlug,
    modelSlug,
    variantSlug,
    location.state,
    selectedBrand,
    selectedModel,
    selectedVariant,
  ]);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fotoğraf önizlemeleri için state'ler
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Sayı formatlama fonksiyonları
  const formatNumber = (value: string): string => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";

    // Sayıyı formatlayalım (binlik ayracı)
    return new Intl.NumberFormat("tr-TR").format(parseInt(numbers));
  };

  const parseFormattedNumber = (value: string): string => {
    // Formatlı sayıdan sadece rakamları döndür
    return value.replace(/\D/g, "");
  };

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    hasDamper: false,
    isExchangeable: "",
    showcasePhoto: null,
    photos: [],
    price: "",
    priceType: "fixed",
    currency: "TRY",
    sellerPhone: "",
    sellerName: "",
    sellerEmail: "",
    cityId: "",
    districtId: "",
  });

  // Dynamic title based on selected variant/model/brand
  const getFormTitle = () => {
    if (selectedVariant?.name) return `${selectedVariant.name} İlanı Ver`;
    if (selectedModel?.name) return `${selectedModel.name} İlanı Ver`;
    if (selectedBrand?.name) return `${selectedBrand.name} İlanı Ver`;
    return "Boru Römorku İlanı Ver";
  };

  // Load cities on component mount
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

  const handleCityChange = async (cityId: string) => {
    setFormData((prev) => ({ ...prev, cityId, districtId: "" }));
    setDistricts([]);

    if (cityId) {
      try {
        const response = await apiClient.get(`/ads/cities/${cityId}/districts`);
        setDistricts(response.data as District[]);
      } catch (error) {
        console.error("İlçeler yüklenirken hata:", error);
      }
    }
  };

  // Load user data
  useEffect(() => {
    if (user && cities.length > 0) {
      setFormData((prev) => ({
        ...prev,
        sellerName: `${user.first_name} ${user.last_name}`,
        sellerPhone: user.phone || "",
        sellerEmail: user.email,
        cityId: user.city
          ? cities.find((city) => city.name === user.city)?.id || ""
          : "",
        districtId: user.district || "",
      }));

      // If user has city, auto-load districts
      if (user.city) {
        const userCity = cities.find((city) => city.name === user.city);
        if (userCity) {
          handleCityChange(userCity.id);
        }
      }
    }
  }, [user, cities]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Modern fotoğraf yönetimi
  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (isShowcase) {
      setFormData((prev) => ({
        ...prev,
        showcasePhoto: file,
      }));

      // Önizleme için URL oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setShowcasePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Diğer fotoğraflar için
      const newFiles = Array.from(files);
      const totalFiles = formData.photos.length + newFiles.length;

      if (totalFiles > 15) {
        alert("En fazla 15 fotoğraf yükleyebilirsiniz.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newFiles],
      }));

      // Önizlemeler için URL'ler oluştur
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    // Input'u sıfırla
    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));

    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 30; year--) {
      years.push(year.toString());
    }
    return years;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    if (!formData.showcasePhoto) {
      alert("Lütfen en az bir vitrin fotoğrafı yükleyin.");
      return;
    }

    console.log("🚚 Form gönderim başlatıldı");
    console.log("Seçili Brand:", selectedBrand);
    console.log("Seçili Model:", selectedModel);
    console.log("Seçili Variant:", selectedVariant);
    console.log("Form Data:", formData);

    // City/District validation
    if (!formData.cityId || !formData.districtId) {
      alert("Lütfen şehir ve ilçe seçimi yapınız.");
      return;
    }

    const selectedCity = cities.find((city) => city.id === formData.cityId);
    const selectedDistrict = districts.find(
      (district) => district.id === formData.districtId
    );

    if (!selectedCity || !selectedDistrict) {
      alert("Lütfen şehir ve ilçe seçimi yapınız.");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      // Temel bilgileri ekle
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("hasDamper", formData.hasDamper.toString());
      submitData.append("isExchangeable", formData.isExchangeable);

      // Price değerini parse et
      const parsedPrice = parseFormattedNumber(formData.price);
      if (parsedPrice) {
        submitData.append("price", parsedPrice);
      }

      submitData.append("priceType", formData.priceType);
      submitData.append("currency", formData.currency);
      submitData.append("sellerPhone", formData.sellerPhone);
      submitData.append("sellerName", formData.sellerName);
      submitData.append("sellerEmail", formData.sellerEmail);
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Kategori bilgilerini ekle
      submitData.append("categorySlug", categorySlug || "tasima-romorklari");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");
      submitData.append("subType", "boru-romork");

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/tasima-romork", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ İlan başarıyla oluşturuldu:", response.data);

      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("❌ İlan oluşturulamadı:", error);

      let errorMessage = "İlan oluşturulurken bir hata oluştu.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              İlan Detayları
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="İlan Başlığı"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Açıklama"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Üretim Yılı</InputLabel>
                <Select
                  value={formData.productionYear}
                  label="Üretim Yılı"
                  onChange={(e) =>
                    handleInputChange("productionYear", e.target.value)
                  }
                >
                  {generateYearOptions().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.hasDamper}
                    onChange={(e) =>
                      handleInputChange("hasDamper", e.target.checked)
                    }
                  />
                }
                label="Damperli"
                sx={{ mb: 2, display: "block" }}
              />

              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Takas</FormLabel>
                <RadioGroup
                  value={formData.isExchangeable}
                  onChange={(e) =>
                    handleInputChange("isExchangeable", e.target.value)
                  }
                  row
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Evet"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Hayır"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fotoğraflar
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Vitrin Fotoğrafı */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PhotoCamera color="primary" />
                  Vitrin Fotoğrafı
                  <Chip label="Zorunlu" color="error" size="small" />
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  İlanınızın ana fotoğrafı olacak en iyi fotoğrafı seçin
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="showcase-photo"
                  type="file"
                  onChange={(e) => handlePhotoUpload(e, true)}
                />
                <label htmlFor="showcase-photo">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mb: 2 }}
                  >
                    {formData.showcasePhoto
                      ? "Vitrin Fotoğrafını Değiştir"
                      : "Vitrin Fotoğrafı Seç"}
                  </Button>
                </label>

                {/* Vitrin fotoğrafı önizlemesi */}
                {formData.showcasePhoto && (
                  <Box
                    sx={{
                      position: "relative",
                      width: 200,
                      height: 150,
                      border: "3px solid",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    <img
                      src={
                        showcasePreview ||
                        URL.createObjectURL(formData.showcasePhoto)
                      }
                      alt="Vitrin Fotoğrafı"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Chip
                      label="VİTRİN"
                      color="primary"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Diğer Fotoğraflar */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
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
                  Aracınızın farklı açılardan fotoğraflarını ekleyin (En fazla
                  15 adet)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="other-photos"
                  type="file"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, false)}
                />
                <label htmlFor="other-photos">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    disabled={formData.photos.length >= 15}
                  >
                    Fotoğraf Ekle ({formData.photos.length}/15)
                  </Button>
                </label>

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
                      }}
                    >
                      {formData.photos.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            width: "100%",
                            paddingTop: "75%", // 4:3 Aspect Ratio
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: 1,
                          }}
                        >
                          <img
                            src={
                              photoPreviews[index] || URL.createObjectURL(file)
                            }
                            alt={`Fotoğraf ${index + 1}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />

                          <Box
                            onClick={() => removePhoto(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              "&:hover": {
                                background: "#ff1744",
                                color: "white",
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: "bold",
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
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              {index + 1}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              İletişim & Fiyat Bilgileri
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Fiyat"
                value={formatNumber(formData.price)}
                onChange={(e) =>
                  handleInputChange(
                    "price",
                    parseFormattedNumber(e.target.value)
                  )
                }
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <ToggleButtonGroup
                        value={formData.currency || "TRY"}
                        exclusive
                        onChange={(_, v) => v && setFormData((prev: any) => ({ ...prev, currency: v }))}
                        size="small"
                        sx={{ "& .MuiToggleButton-root": { py: 0.5, px: 1, fontSize: "0.75rem", "&.Mui-selected": { bgcolor: "#D34237", color: "#fff" } } }}
                      >
                        <ToggleButton value="TRY">₺ TL</ToggleButton>
                        <ToggleButton value="USD">$ USD</ToggleButton>
                        <ToggleButton value="EUR">€ EUR</ToggleButton>
                      </ToggleButtonGroup>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>İl</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  label="İl"
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <span>🏙️</span> {city.plateCode} - {city.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    handleInputChange("districtId", e.target.value)
                  }
                  label="İlçe"
                  disabled={!formData.cityId}
                  required
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <span>🏘️</span> {district.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Header />

      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {getFormTitle()}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card>
          <CardContent>
            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Geri
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <CheckCircle />
                  }
                >
                  {loading ? "Gönderiliyor..." : "İlanı Yayınla"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  İleri
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showSuccessModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400 },
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              textAlign: "center",
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 80,
                color: "success.main",
                mb: 2,
              }}
            />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              🎉 Başarılı!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              İlanınız başarıyla oluşturuldu. Ana sayfaya yönlendirileceksiniz.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCloseSuccessModal}
              sx={{ minWidth: 150 }}
            >
              Ana Sayfaya Git
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default BoruRomorkForm;
