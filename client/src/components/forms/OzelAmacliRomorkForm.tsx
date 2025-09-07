import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Upload, AttachMoney, Person, Phone, Email } from "@mui/icons-material";
import Header from "../layout/Header";
import apiClient from "../../api/client";

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  cityId: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const OzelAmacliRomorkForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // City/District state
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [formData, setFormData] = useState({
    // İlan Detayları
    title: "",
    description: "",
    productionYear: "",
    type: "",
    isExchangeable: "",
    // Fotoğraflar
    images: [] as File[],
    // İletişim & Fiyat
    price: "",
    currency: "TL",
    contactName: "",
    phone: "",
    email: "",
    cityId: "",
    districtId: "",
  });

  // Tip seçenekleri
  const typeOptions = [
    "Cenaze Hizmeti",
    "Deniz Araçları",
    "Gezici Büfe",
    "Gezici Hizmetler",
    "İlkyardım Sedyesi",
    "Mobil Ev Taşıma",
    "Nakliye Asansörlü",
    "Reklam Platformu",
    "Sahneli & Kulisli",
    "Stantlı",
  ];

  // Load cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await apiClient.get("/cities");
      setCities(response.data as City[]);
      console.log("🏙️ Şehirler yüklendi:", (response.data as City[]).length);
    } catch (error) {
      console.error("❌ Şehirler yüklenemedi:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchDistricts = async (cityId: string) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }

    try {
      setLoadingDistricts(true);
      const response = await apiClient.get(`/cities/${cityId}/districts`);
      setDistricts(response.data as District[]);
      console.log("🏘️ İlçeler yüklendi:", (response.data as District[]).length);
    } catch (error) {
      console.error("❌ İlçeler yüklenemedi:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleCityChange = (cityId: string) => {
    setFormData((prev) => ({ ...prev, cityId, districtId: "" }));
    fetchDistricts(cityId);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Gerekli alanların kontrolü
      if (
        !formData.title ||
        !formData.description ||
        !formData.productionYear ||
        !formData.type ||
        !formData.price ||
        !formData.contactName ||
        !formData.phone ||
        !formData.cityId ||
        !formData.districtId
      ) {
        alert("Lütfen tüm gerekli alanları doldurun.");
        setIsSubmitting(false);
        return;
      }

      // FormData oluştur
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("type", formData.type);
      submitData.append("isExchangeable", formData.isExchangeable);
      submitData.append("contactName", formData.contactName);
      submitData.append("phone", formData.phone);
      submitData.append("email", formData.email);
      submitData.append("price", formData.price);
      submitData.append("currency", formData.currency);
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Fotoğrafları ekle
      formData.images.forEach((image) => {
        submitData.append(`images`, image);
      });

      const response = await apiClient.post("/ads/romork", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if ((response.data as ApiResponse).success) {
        alert("İlan başarıyla oluşturuldu!");
        navigate("/");
      } else {
        throw new Error(
          (response.data as ApiResponse).message || "İlan oluşturulamadı"
        );
      }
    } catch (error) {
      console.error("İlan oluşturma hatası:", error);
      alert("İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = formData.images.length + newFiles.length;

    if (totalFiles > 15) {
      alert("En fazla 15 fotoğraf yükleyebilirsiniz.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>
              Özel Amaçlı Römork - İlan Detayları
            </Typography>

            <TextField
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              fullWidth
              placeholder="Örn: 2020 Model Gezici Büfe Römorku Satılık"
            />

            <TextField
              label="Açıklama"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Özel amaçlı römorkla ilgili detaylı bilgi verin..."
            />

            <FormControl fullWidth required>
              <InputLabel>Üretim Yılı</InputLabel>
              <Select
                value={formData.productionYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    productionYear: e.target.value,
                  }))
                }
                label="Üretim Yılı"
              >
                {productionYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Tip</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                label="Tip"
              >
                {typeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Takas Durumu</FormLabel>
              <RadioGroup
                value={formData.isExchangeable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isExchangeable: e.target.value,
                  }))
                }
                row
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio />}
                  label="Takas Olur"
                />
                <FormControlLabel
                  value="no"
                  control={<Radio />}
                  label="Takas Olmaz"
                />
                <FormControlLabel
                  value="negotiable"
                  control={<Radio />}
                  label="Görüşülebilir"
                />
              </RadioGroup>
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>
              Özel Amaçlı Römork - Fotoğraflar
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    fullWidth
                  >
                    Fotoğraf Yükle (Maksimum 15 adet)
                  </Button>
                </label>

                {formData.images.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Yüklenen Fotoğraflar ({formData.images.length}/15)
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {formData.images.map((image, index) => (
                        <Chip
                          key={index}
                          label={image.name}
                          onDelete={() => removeImage(index)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h5" gutterBottom>
              Özel Amaçlı Römork - İletişim & Fiyat
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Fiyat"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl>
                <InputLabel>Para Birimi</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  label="Para Birimi"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="TL">TL</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  label="Şehir"
                  disabled={loadingCities}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      districtId: e.target.value,
                    }))
                  }
                  label="İlçe"
                  disabled={loadingDistricts || !formData.cityId}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="İletişim Adı"
              value={formData.contactName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactName: e.target.value,
                }))
              }
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Telefon"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="E-posta (Opsiyonel)"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              fullWidth
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <Alert severity="info">
              <strong>Önemli:</strong> İlanınız yayına alınmadan önce
              moderatörlerimiz tarafından incelenecektir.
            </Alert>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
        <Box sx={{ maxWidth: 800, mx: "auto", px: 2 }}>
          <Paper elevation={1} sx={{ p: 4 }}>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              color="primary"
            >
              Özel Amaçlı Römork İlanı
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Geri
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="large"
                >
                  {isSubmitting ? "Gönderiliyor..." : "İlanı Yayınla"}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  İleri
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default OzelAmacliRomorkForm;
