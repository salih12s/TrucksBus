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
  CardMedia,
  IconButton,
  Paper,
  RadioGroup,
  Radio,
  FormLabel,
  Autocomplete,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Upload as UploadIcon,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
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
  uploadedImages: File[];
  showcaseImageIndex: number;

  // İletişim ve fiyat bilgileri
  price: string;
  priceType: string;
  currency: string;
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
  city: string;
  district: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const HayvanRomorkForm: React.FC = () => {
  const navigate = useNavigate();
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
  const location = useLocation();

  // Parse location state for brand/model/variant data
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    hasDamper: false,
    isExchangeable: "",
    uploadedImages: [],
    showcaseImageIndex: 0,
    price: "",
    priceType: "fixed",
    currency: "TRY",
    sellerPhone: "",
    sellerName: "",
    sellerEmail: "",
    city: "",
    district: "",
  });

  // Dynamic title based on selected variant/model/brand
  const getFormTitle = () => {
    if (selectedVariant?.name) return `${selectedVariant.name} İlanı Ver`;
    if (selectedModel?.name) return `${selectedModel.name} İlanı Ver`;
    if (selectedBrand?.name) return `${selectedBrand.name} İlanı Ver`;
    return "Hayvan Römorku İlanı Ver";
  };

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        console.log("🏙️ Şehirler yükleniyor...");
        const response = await apiClient.get("/locations/cities");
        setCities(response.data as City[]);
        console.log("✅ Şehirler yüklendi:", (response.data as City[]).length);
      } catch (error) {
        console.error("❌ Şehirler yüklenemedi:", error);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  // Load districts when city changes
  const handleCityChange = async (cityId: string, cityName: string) => {
    try {
      setLoadingDistricts(true);
      setFormData((prev) => ({ ...prev, city: cityName, district: "" }));

      console.log("🏘️ İlçeler yükleniyor, cityId:", cityId);
      const response = await apiClient.get(`/locations/districts/${cityId}`);
      setDistricts(response.data as District[]);
      console.log("✅ İlçeler yüklendi:", (response.data as District[]).length);
    } catch (error) {
      console.error("❌ İlçeler yüklenemedi:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load user data
  useEffect(() => {
    if (user && cities.length > 0) {
      console.log("👤 Kullanıcı verileri yükleniyor:", user);
      setFormData((prev) => ({
        ...prev,
        sellerName: `${user.first_name} ${user.last_name}`,
        sellerPhone: user.phone || "",
        sellerEmail: user.email,
        city: user.city || "",
        district: user.district || "",
      }));

      // If user has city, auto-load districts
      if (user.city) {
        const userCity = cities.find((city) => city.name === user.city);
        if (userCity) {
          handleCityChange(userCity.id, userCity.name);
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = formData.uploadedImages.length + newFiles.length;

    if (totalFiles > 10) {
      alert("En fazla 10 fotoğraf yükleyebilirsiniz.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...newFiles],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
      showcaseImageIndex:
        prev.showcaseImageIndex >= index && prev.showcaseImageIndex > 0
          ? prev.showcaseImageIndex - 1
          : prev.showcaseImageIndex,
    }));
  };

  const setShowcaseImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      showcaseImageIndex: index,
    }));
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

    console.log("🚚 Form gönderim başlatıldı");
    console.log("Seçili Brand:", selectedBrand);
    console.log("Seçili Model:", selectedModel);
    console.log("Seçili Variant:", selectedVariant);
    console.log("Form Data:", formData);

    // City/District validation
    if (!formData.city || !formData.district) {
      alert("Lütfen şehir ve ilçe seçimi yapınız.");
      return;
    }

    const selectedCity = cities.find((city) => city.name === formData.city);
    const selectedDistrict = districts.find(
      (district) => district.name === formData.district
    );

    if (!selectedCity || !selectedDistrict) {
      alert("Lütfen şehir ve ilçe seçimi yapınız.");
      return;
    }

    try {
      setLoading(true);

      const base64Images = await Promise.all(
        formData.uploadedImages.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const payload = {
        // Brand/Model/Variant info
        brandId: selectedBrand?.id,
        modelId: selectedModel?.id,
        variantId: selectedVariant?.id,

        // Form data
        title: formData.title,
        description: formData.description,
        productionYear: parseInt(formData.productionYear),
        hasDamper: formData.hasDamper,
        isExchangeable: formData.isExchangeable === "true",

        // Images
        images: base64Images,
        showcaseImageIndex: formData.showcaseImageIndex,

        // Price and contact
        price: parseFloat(formData.price),
        priceType: formData.priceType,
        currency: formData.currency,
        sellerPhone: formData.sellerPhone,
        sellerName: formData.sellerName,
        sellerEmail: formData.sellerEmail,
        cityId: selectedCity.id,
        districtId: selectedDistrict.id,

        // Category info
        category: "TasimaRomorklari",
        subCategory: "HayvanRomork",
      };

      console.log("📤 Payload gönderiliyor:", payload);

      const response = await apiClient.post("/listings", payload);

      console.log("✅ İlan başarıyla oluşturuldu:", response.data);

      alert(
        "İlanınız başarıyla oluşturuldu. Ana sayfaya yönlendiriliyorsunuz."
      );

      navigate("/");
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

            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                border: "2px dashed #ccc",
                mb: 3,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
              component="label"
            >
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
              <UploadIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
              <Typography variant="h6" color="textSecondary">
                Fotoğraf Yükleyin
              </Typography>
              <Typography variant="body2" color="textSecondary">
                En fazla 10 fotoğraf yükleyebilirsiniz
              </Typography>
            </Paper>

            {formData.uploadedImages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Yüklenen Fotoğraflar ({formData.uploadedImages.length}/10)
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {formData.uploadedImages.map((image, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: {
                          xs: "calc(50% - 8px)",
                          sm: "calc(33.33% - 11px)",
                          md: "calc(25% - 12px)",
                        },
                        position: "relative",
                      }}
                    >
                      <Card sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={URL.createObjectURL(image)}
                          alt={`Uploaded ${index}`}
                          sx={{ objectFit: "cover" }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            display: "flex",
                            gap: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setShowcaseImage(index)}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.8)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.9)",
                              },
                            }}
                          >
                            {formData.showcaseImageIndex === index ? (
                              <Star color="warning" />
                            ) : (
                              <StarBorder />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => removeImage(index)}
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.8)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.9)",
                              },
                            }}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Box>
                        {formData.showcaseImageIndex === index && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              backgroundColor: "rgba(255,193,7,0.9)",
                              color: "white",
                              textAlign: "center",
                              py: 0.5,
                            }}
                          >
                            <Typography variant="caption" fontWeight="bold">
                              Vitrin Fotoğrafı
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
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
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: <Typography>₺</Typography>,
                }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Fiyat Türü</InputLabel>
                <Select
                  value={formData.priceType}
                  label="Fiyat Türü"
                  onChange={(e) =>
                    handleInputChange("priceType", e.target.value)
                  }
                >
                  <MenuItem value="fixed">Sabit Fiyat</MenuItem>
                  <MenuItem value="negotiable">Pazarlık Yapılır</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Satıcı Adı"
                value={formData.sellerName}
                onChange={(e) =>
                  handleInputChange("sellerName", e.target.value)
                }
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Telefon"
                value={formData.sellerPhone}
                onChange={(e) =>
                  handleInputChange("sellerPhone", e.target.value)
                }
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.sellerEmail}
                onChange={(e) =>
                  handleInputChange("sellerEmail", e.target.value)
                }
                required
                sx={{ mb: 2 }}
              />

              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.name}
                loading={loadingCities}
                value={
                  cities.find((city) => city.name === formData.city) || null
                }
                onChange={(_event, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue.id, newValue.name);
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      city: "",
                      district: "",
                    }));
                    setDistricts([]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şehir"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingCities ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                sx={{ mb: 2 }}
              />

              <Autocomplete
                options={districts}
                getOptionLabel={(option) => option.name}
                loading={loadingDistricts}
                disabled={!formData.city}
                value={
                  districts.find(
                    (district) => district.name === formData.district
                  ) || null
                }
                onChange={(_event, newValue) => {
                  handleInputChange("district", newValue ? newValue.name : "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İlçe"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingDistricts ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
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
    </Box>
  );
};

export default HayvanRomorkForm;
