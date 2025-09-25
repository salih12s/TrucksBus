import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
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
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Autocomplete,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  ArrowForward,
  ArrowBack,
  CloudUpload,
  Close,
  Person,
  LocationOn,
  AttachMoney,
  Umbrella,
  DateRange,
  Straighten,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/client";
import SuccessModal from "../../common/SuccessModal";

// Çatı Perde Sistemi Türleri
const CATI_PERDE_SISTEMLERI = [
  "Hızlı Kayar Perde",
  "Sabit Tente",
  "Tulum Kayar Perde",
  "Yana Kayar Perde",
  "Tavana Sabit Yana Kayar Perde",
];

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

interface MidilliFormData {
  // Genel Bilgiler
  title: string;
  description: string;
  year: number;
  price: string;

  // Teknik Özellikler
  uzunluk: number;
  lastikDurumu: number;
  catiPerdeSistemi: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // Ekstra
  warranty: boolean;
  negotiable: boolean;
  exchange: boolean;

  detailedInfo: string;

  // İletişim bilgileri
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  city?: string;
  district?: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const MidilliForm: React.FC = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showcaseImageIndex, setShowcaseImageIndex] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  const [formData, setFormData] = useState<MidilliFormData>({
    title: "",
    description: "",
    year: 0,
    price: "",
    uzunluk: 0,
    lastikDurumu: 100,
    catiPerdeSistemi: "",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    warranty: false,
    negotiable: false,
    exchange: false,
    detailedInfo: "",
  });

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await apiClient.get("/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Şehirler yüklenirken hata:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    if (formData.cityId) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const response = await apiClient.get(
            `/cities/${formData.cityId}/districts`
          );
          setDistricts(response.data as District[]);
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.cityId]);

  const handleInputChange = (
    field: keyof MidilliFormData,
    value: string | number | File[] | File | null | boolean
  ) => {
    if (field === "year" || field === "uzunluk" || field === "lastikDurumu") {
      const numValue =
        field === "year" || field === "uzunluk" || field === "lastikDurumu"
          ? parseInt(value as string) || 0
          : value;
      setFormData((prev) => ({
        ...prev,
        [field]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Fotoğraf yükleme fonksiyonları
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false
  ) => {
    const files = e.target.files;
    if (files) {
      if (isShowcase) {
        const file = files[0];
        setFormData((prev) => ({ ...prev, showcasePhoto: file }));
      } else {
        if (formData.photos.length + files.length <= 10) {
          const newPhotos = Array.from(files);
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos],
          }));
        } else {
          alert("En fazla 10 fotoğraf yükleyebilirsiniz");
        }
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));

    // Showcase index'ini güncelle
    if (showcaseImageIndex >= index && showcaseImageIndex > 0) {
      setShowcaseImageIndex(showcaseImageIndex - 1);
    }
  };

  const setShowcaseImage = (index: number) => {
    setShowcaseImageIndex(index);
  };

  const handleCityChange = (cityName: string) => {
    const selectedCity = cities.find((city) => city.name === cityName);
    if (selectedCity) {
      handleInputChange("cityId", selectedCity.id.toString());
      handleInputChange("city", cityName);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // İlan Detayları
        if (!formData.title.trim()) {
          setError("İlan başlığı gereklidir");
          return false;
        }
        if (!formData.description.trim()) {
          setError("Açıklama gereklidir");
          return false;
        }
        if (
          formData.year < 1980 ||
          formData.year > new Date().getFullYear() + 1
        ) {
          setError("Geçerli bir üretim yılı giriniz");
          return false;
        }
        if (formData.uzunluk <= 0) {
          setError("Uzunluk bilgisi gereklidir");
          return false;
        }
        break;
      case 1: // Fotoğraflar
        if (formData.photos.length === 0) {
          setError("En az 1 fotoğraf yüklemeniz gerekli");
          return false;
        }
        break;
      case 2: // İletişim & Fiyat
        if (!formData.sellerPhone?.trim()) {
          setError("Telefon numarası gereklidir");
          return false;
        }
        if (!formData.price.trim()) {
          setError("Fiyat bilgisi gereklidir");
          return false;
        }
        if (!formData.cityId) {
          setError("Şehir seçimi gereklidir");
          return false;
        }
        if (!formData.districtId) {
          setError("İlçe seçimi gereklidir");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\D/g, "");
  };

  // Form gönderimi
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.year.toString());

      // Fiyatı parse ederek ekle
      const parsedPrice = parseFormattedNumber(formData.price);
      if (parsedPrice) {
        submitData.append("price", parsedPrice);
      }

      submitData.append("category", "dorse");
      submitData.append("variant", "midilli");

      // Tenteli midilli özel bilgileri
      submitData.append("uzunluk", formData.uzunluk.toString());
      submitData.append("lastikDurumu", formData.lastikDurumu.toString());
      submitData.append("catiPerdeSistemi", formData.catiPerdeSistemi);

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Ekstra
      submitData.append("warranty", formData.warranty ? "evet" : "hayir");
      submitData.append("negotiable", formData.negotiable ? "evet" : "hayir");
      submitData.append("exchange", formData.exchange ? "evet" : "hayir");

      // Detaylı bilgiyi teknik özelliklerle birleştir
      let detailedDescription = formData.detailedInfo;

      // Tenteli teknik özellikler eklentisi
      const technicalSpecs = [];
      if (formData.uzunluk)
        technicalSpecs.push(`Uzunluk: ${formData.uzunluk}m`);
      if (formData.lastikDurumu)
        technicalSpecs.push(`Lastik Durumu: ${formData.lastikDurumu}%`);
      if (formData.catiPerdeSistemi)
        technicalSpecs.push(`Çatı Perde Sistemi: ${formData.catiPerdeSistemi}`);

      if (technicalSpecs.length > 0) {
        const techSpecsText =
          "\n\n--- Teknik Özellikler ---\n" + technicalSpecs.join("\n");
        detailedDescription = detailedDescription
          ? detailedDescription + techSpecsText
          : techSpecsText;
      }

      submitData.append("detailedInfo", detailedDescription);

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/listings", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(
        "Midilli Tenteli Dorse ilanı başarıyla oluşturuldu:",
        response.data
      );

      // İlan ID'sini kaydet ve başarı modal'ını göster
      const responseData = response.data as { id?: string; success?: boolean };
      if (responseData && responseData.id) {
        setCreatedAdId(responseData.id);
        setShowSuccessModal(true);
      } else {
        setShowSuccessModal(true);
      }
    } catch (error: unknown) {
      console.error("İlan oluşturulurken hata:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        err.response?.data?.message ||
          err.message ||
          "İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  // Modal handler fonksiyonları
  const handleCloseSuccessModal = () => {
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
    navigate("/my-ads");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // İlan Detayları
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Umbrella color="primary" />
              Midilli Tenteli Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Örn: 2018 Model Midilli Tenteli Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Midilli tenteli dorsenizin detaylı açıklamasını yazın..."
              required
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                fullWidth
                type="number"
                label="Üretim Yılı"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRange />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 1980,
                  max: new Date().getFullYear() + 1,
                }}
                required
              />

              <TextField
                fullWidth
                type="number"
                label="Uzunluk"
                value={formData.uzunluk}
                onChange={(e) => handleInputChange("uzunluk", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Straighten />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">metre</InputAdornment>
                  ),
                }}
                inputProps={{ step: 0.1, min: 0 }}
                placeholder="Örn: 13.6"
                required
              />
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                fullWidth
                type="number"
                label="Lastik Durumu"
                value={formData.lastikDurumu}
                onChange={(e) =>
                  handleInputChange("lastikDurumu", e.target.value)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, max: 100 }}
                placeholder="Örn: 85"
              />

              <FormControl fullWidth required>
                <InputLabel>Çatı Perde Sistemi</InputLabel>
                <Select
                  value={formData.catiPerdeSistemi}
                  label="Çatı Perde Sistemi"
                  onChange={(e) =>
                    handleInputChange("catiPerdeSistemi", e.target.value)
                  }
                >
                  {CATI_PERDE_SISTEMLERI.map((sistem) => (
                    <MenuItem key={sistem} value={sistem}>
                      {sistem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      case 1: // Fotoğraflar
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <CloudUpload color="primary" />
              Midilli Tenteli Fotoğrafları
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CloudUpload
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Midilli Tenteli Fotoğraflarını Yükleyin
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    En fazla 10 fotoğraf yükleyebilirsiniz. İlk fotoğraf vitrin
                    fotoğrafı olacaktır.
                  </Typography>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={formData.photos.length >= 10}
                    >
                      Fotoğraf Seç
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>

            {formData.photos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({formData.photos.length}/10)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 2,
                  }}
                >
                  {formData.photos.map((file, index) => (
                    <Card
                      key={index}
                      sx={{
                        position: "relative",
                        border:
                          showcaseImageIndex === index ? "2px solid" : "none",
                        borderColor: "primary.main",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowcaseImage(index)}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                        }}
                      />
                      {showcaseImageIndex === index && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            bgcolor: "primary.main",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          Vitrin
                        </Box>
                      )}
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2: // İletişim & Fiyat
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Person color="primary" />
              İletişim & Fiyat Bilgileri
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.name}
                value={
                  cities.find((city) => city.name === formData.city) || null
                }
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue.name);
                  }
                }}
                loading={loadingCities}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şehir"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {loadingCities ? (
                            <CircularProgress size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              <Autocomplete
                options={districts}
                getOptionLabel={(option) => option.name}
                value={
                  districts.find(
                    (district) => district.id.toString() === formData.districtId
                  ) || null
                }
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleInputChange("districtId", newValue.id.toString());
                    handleInputChange("district", newValue.name);
                  }
                }}
                loading={loadingDistricts}
                disabled={!formData.cityId || loadingDistricts}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İlçe"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {loadingDistricts ? (
                            <CircularProgress size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <TextField
              fullWidth
              label="Fiyat"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">TL</InputAdornment>
                ),
              }}
              placeholder="150000"
              required
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎪 Midilli Tenteli İlan Ver
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Midilli tenteli dorsenizi kolayca satışa çıkarın
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ mb: 4, minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<ArrowBack />}
          >
            Geri
          </Button>

          <Typography variant="body2" color="text.secondary">
            Adım {activeStep + 1} / {steps.length}
          </Typography>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : "İlanı Yayınla"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={<ArrowForward />}
            >
              İleri
            </Button>
          )}
        </Box>
      </Paper>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        title="🎪 İlan Başarıyla Yayınlandı!"
        message="Midilli tenteli dorse ilanınız başarıyla oluşturuldu ve yayına alındı."
        adId={createdAdId || undefined}
        onViewAd={createdAdId ? handleViewAd : undefined}
        onGoHome={handleGoHome}
        onMyAds={handleMyAds}
      />
    </Container>
  );
};

export default MidilliForm;
