import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
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
  FormControlLabel,
  Checkbox,
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
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  AcUnit,
  Straighten,
  DateRange,
} from "@mui/icons-material";
import apiClient from "../../api/client";

interface FrigofirikFormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  year: number;

  // Teknik Özellikler
  uzunluk: number; // metre
  lastikDurumu: number; // yüzde
  sogutucu: string; // Çalışıyor/Arızalı/Yok

  // Konum
  city: string;
  district: string;

  // İletişim Bilgileri
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;

  // Ekstra
  warranty: boolean;
  negotiable: boolean;
  exchange: boolean;
}

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  city_id: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const FrigofirikForm: React.FC = () => {
  const navigate = useNavigate();
  const { variantId } = useParams<{ variantId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showcaseImageIndex, setShowcaseImageIndex] = useState(0);

  const [formData, setFormData] = useState<FrigofirikFormData>({
    title: "",
    description: "",
    price: "",
    year: new Date().getFullYear(),
    uzunluk: 0,
    lastikDurumu: 100,
    sogutucu: "",
    city: "",
    district: "",
    sellerName: "",
    sellerPhone: "",
    sellerEmail: "",
    warranty: false,
    negotiable: false,
    exchange: false,
  });

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        sellerName: `${user.firstName} ${user.lastName}`,
        sellerPhone: user.phone || "",
        sellerEmail: user.email || "",
        city: user.city || "",
        district: "",
      }));
    }
  }, [user]);

  // Şehirler yükle
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await apiClient.get("/api/cities");
        setCities(response.data as City[]);
      } catch (err) {
        console.error("Şehirler yüklenirken hata:", err);
        setError("Şehirler yüklenirken hata oluştu");
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, []);

  const handleCityChange = async (cityName: string) => {
    setFormData((prev) => ({ ...prev, city: cityName, district: "" }));
    setLoadingDistricts(true);

    try {
      const city = cities.find((c) => c.name === cityName);
      if (city) {
        const response = await apiClient.get(
          `/api/districts?cityId=${city.id}`
        );
        setDistricts(response.data as District[]);
      }
    } catch (err) {
      console.error("İlçeler yüklenirken hata:", err);
      setDistricts([]);
      setError("İlçeler yüklenirken hata oluştu");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")
        .trim();
    }
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneNumber(value);
    setFormData((prev) => ({ ...prev, sellerPhone: formattedPhone }));
  };

  const handleInputChange = (
    field: keyof FrigofirikFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalFiles = images.length + files.length;

    if (totalFiles > 10) {
      setError("En fazla 10 fotoğraf yükleyebilirsiniz");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (showcaseImageIndex >= images.length - 1) {
      setShowcaseImageIndex(Math.max(0, images.length - 2));
    }
  };

  const setShowcaseImage = (index: number) => {
    setShowcaseImageIndex(index);
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
        if (!formData.sogutucu) {
          setError("Soğutucu durumu seçiniz");
          return false;
        }
        break;
      case 1: // Fotoğraflar
        if (images.length === 0) {
          setError("En az 1 fotoğraf yüklemeniz gerekli");
          return false;
        }
        break;
      case 2: // İletişim & Fiyat
        if (!formData.sellerPhone.trim()) {
          setError("Telefon numarası gereklidir");
          return false;
        }
        if (!formData.price.trim()) {
          setError("Fiyat bilgisi gereklidir");
          return false;
        }
        if (!formData.city) {
          setError("Şehir seçimi gereklidir");
          return false;
        }
        if (!formData.district) {
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

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Frigofirik bilgileri
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("year", formData.year.toString());
      formDataToSend.append("category", "Dorse");
      formDataToSend.append("subcategory", "Frigofirik");
      formDataToSend.append("variant_id", variantId || "");

      // Teknik özellikler
      formDataToSend.append("uzunluk", formData.uzunluk.toString());
      formDataToSend.append("lastikDurumu", formData.lastikDurumu.toString());
      formDataToSend.append("sogutucu", formData.sogutucu);

      // Konum bilgileri
      formDataToSend.append("city", formData.city);
      formDataToSend.append("district", formData.district);

      // İletişim bilgileri
      formDataToSend.append("seller_name", formData.sellerName);
      formDataToSend.append(
        "seller_phone",
        formData.sellerPhone.replace(/\s/g, "")
      );
      formDataToSend.append("seller_email", formData.sellerEmail);

      // Ekstra özellikler
      formDataToSend.append("warranty", formData.warranty ? "true" : "false");
      formDataToSend.append(
        "negotiable",
        formData.negotiable ? "true" : "false"
      );
      formDataToSend.append("exchange", formData.exchange ? "true" : "false");

      // Fotoğraflar
      images.forEach((image, index) => {
        formDataToSend.append("images", image);
        if (index === showcaseImageIndex) {
          formDataToSend.append("showcase_image_index", index.toString());
        }
      });

      const response = await apiClient.post("/api/listings", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = response.data as {
        success: boolean;
        message?: string;
      };

      if (responseData.success) {
        navigate("/user/my-listings", {
          state: {
            message: "Frigofirik ilanınız başarıyla oluşturuldu!",
          },
        });
      } else {
        throw new Error(responseData.message || "İlan oluşturulamadı");
      }
    } catch (err: unknown) {
      console.error("Frigofirik ilanı oluşturma hatası:", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.message ||
          error.message ||
          "İlan oluşturulurken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
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
              <AcUnit color="primary" />
              Frigofirik Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Örn: 2018 Model Frigofirik Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Frigofirik dorsenizin detaylı açıklamasını yazın..."
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
                onChange={(e) =>
                  handleInputChange("year", parseInt(e.target.value))
                }
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
                onChange={(e) =>
                  handleInputChange("uzunluk", parseFloat(e.target.value))
                }
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
                  handleInputChange("lastikDurumu", parseInt(e.target.value))
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
                <InputLabel>Soğutucu Durumu</InputLabel>
                <Select
                  value={formData.sogutucu}
                  label="Soğutucu Durumu"
                  onChange={(e) =>
                    handleInputChange("sogutucu", e.target.value)
                  }
                >
                  <MenuItem value="Çalışıyor">Çalışıyor</MenuItem>
                  <MenuItem value="Arızalı">Arızalı</MenuItem>
                  <MenuItem value="Yok">Yok</MenuItem>
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
              Frigofirik Fotoğrafları
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CloudUpload
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Frigofirik Fotoğraflarını Yükleyin
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
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={images.length >= 10}
                    >
                      Fotoğraf Seç
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>

            {images.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({images.length}/10)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 2,
                  }}
                >
                  {images.map((file, index) => (
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
                          removeImage(index);
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

            <TextField
              fullWidth
              label="Ad Soyad"
              value={formData.sellerName}
              onChange={(e) => handleInputChange("sellerName", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
              required
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                fullWidth
                label="Telefon"
                value={formData.sellerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0xxx xxx xx xx"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.sellerEmail}
                onChange={(e) =>
                  handleInputChange("sellerEmail", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Box>

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
                    (district) => district.name === formData.district
                  ) || null
                }
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleInputChange("district", newValue.name);
                  }
                }}
                loading={loadingDistricts}
                disabled={!formData.city || loadingDistricts}
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

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.warranty}
                    onChange={(e) =>
                      handleInputChange("warranty", e.target.checked)
                    }
                  />
                }
                label="Garanti var"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.negotiable}
                    onChange={(e) =>
                      handleInputChange("negotiable", e.target.checked)
                    }
                  />
                }
                label="Pazarlık yapılabilir"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.exchange}
                    onChange={(e) =>
                      handleInputChange("exchange", e.target.checked)
                    }
                  />
                }
                label="Takas yapılabilir"
              />
            </Box>
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
            🧊 Frigofirik İlan Ver
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Frigofirik dorsenizi kolayca satışa çıkarın
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
    </Container>
  );
};

export default FrigofirikForm;
