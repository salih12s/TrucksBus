import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  FormLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  Alert,
  IconButton,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  PhotoCamera,
  Delete as DeleteIcon,
  Star as StarIcon,
  AttachMoney,
} from "@mui/icons-material";
import apiClient from "../../api/client";

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
  type: string;
  isExchangeable: string;
  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;
  images: File[]; // Backward compatibility
  // İletişim & Fiyat
  price: string;
  currency: string;
  contactName: string;
  phone: string;
  email: string;
  cityId: string;
  districtId: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

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

const OzelAmacliRomorkForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Dropdown states
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // İlan Detayları
    title: "",
    description: "",
    productionYear: "",
    type: "",
    isExchangeable: "",
    // Fotoğraflar
    photos: [],
    showcasePhoto: null,
    images: [], // Backward compatibility
    // İletişim & Fiyat
    price: "",
    currency: "TRY",
    contactName: "",
    phone: "",
    email: "",
    cityId: "",
    districtId: "",
  });

  // Römork tipleri
  const typeOptions = [
    "Açık Kasa",
    "Kapalı Kasa",
    "Damperli",
    "Tanker",
    "Frigo",
    "Konteyner",
    "Platform",
    "Diğer",
  ];

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

  // API çağrıları
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await apiClient.get("/ads/cities");
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
        try {
          setLoadingDistricts(true);
          const response = await apiClient.get(
            `/ads/cities/${formData.cityId}/districts`,
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
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase = false,
  ) => {
    const files = event.target.files;
    if (files) {
      if (isShowcase) {
        setFormData((prev) => ({ ...prev, showcasePhoto: files[0] }));
      } else {
        const currentPhotos = formData.photos;
        const newPhotos = Array.from(files);
        const totalPhotos = currentPhotos.length + newPhotos.length;

        if (totalPhotos <= 15) {
          setFormData((prev) => ({
            ...prev,
            photos: [...currentPhotos, ...newPhotos],
          }));
        } else {
          alert("En fazla 15 fotoğraf yükleyebilirsiniz");
        }
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const setShowcasePhoto = (index: number) => {
    const photo = formData.photos[index];
    const remainingPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      showcasePhoto: photo,
      photos: prev.showcasePhoto
        ? [prev.showcasePhoto, ...remainingPhotos]
        : remainingPhotos,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "showcasePhoto" &&
          key !== "images" &&
          value !== null &&
          value !== undefined
        ) {
          submitData.append(key, value.toString());
        }
      });
      submitData.append("currency", formData.currency || "TRY");

      // Kategori bilgilerini ekle
      submitData.append("subType", "ozel-amacli-romork");

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post(
        "/ads/ozel-amacli-romork",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("İlan başarıyla oluşturuldu:", response.data);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("İlan oluşturulurken hata:", error);
      alert("İlan oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSubmitSuccess(false);
    navigate("/");
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Özel Amaçlı Römork - İlan Detayları
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
                mt: 3,
              }}
            >
              <TextField
                label="İlan Başlığı"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                fullWidth
                placeholder="Örn: 2020 Model Açık Kasa Römork"
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

              <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
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
                  placeholder="Römorkınız hakkında detaylı bilgi verin..."
                />
              </Box>

              <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
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
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Özel Amaçlı Römork - Fotoğraflar
            </Typography>

            {/* Vitrin Fotoğrafı */}
            <Card sx={{ mt: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vitrin Fotoğrafı
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  İlanınızda öne çıkacak ana fotoğrafı seçin
                </Typography>

                {formData.showcasePhoto ? (
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={URL.createObjectURL(formData.showcasePhoto)}
                      alt="Vitrin"
                      style={{
                        width: 200,
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          showcasePhoto: null,
                        }))
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                  >
                    Vitrin Fotoğrafı Seç
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, true)}
                    />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Diğer Fotoğraflar */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Diğer Fotoğraflar ({formData.photos.length}/15)
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  En fazla 15 fotoğraf yükleyebilirsiniz
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{ mb: 3 }}
                  disabled={formData.photos.length >= 15}
                >
                  Fotoğraf Ekle
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e, false)}
                  />
                </Button>

                {formData.photos.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {formData.photos.map((photo, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />

                        {/* Vitrin Yap Butonu */}
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                            },
                          }}
                          onClick={() => setShowcasePhoto(index)}
                          title="Vitrin fotoğrafı yap"
                        >
                          <StarIcon />
                        </IconButton>

                        {/* Sil Butonu */}
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                            },
                          }}
                          onClick={() => removePhoto(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Özel Amaçlı Römork - İletişim & Fiyat
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
                mt: 3,
              }}
            >
              <TextField
                label="Fiyat"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <ToggleButtonGroup
                        value={formData.currency || "TRY"}
                        exclusive
                        onChange={(_, v) =>
                          v &&
                          setFormData((prev: any) => ({ ...prev, currency: v }))
                        }
                        size="small"
                        sx={{
                          "& .MuiToggleButton-root": {
                            py: 0.5,
                            px: 1,
                            fontSize: "0.75rem",
                            "&.Mui-selected": {
                              bgcolor: "#D34237",
                              color: "#fff",
                            },
                          },
                        }}
                      >
                        <ToggleButton value="TRY">₺ TL</ToggleButton>
                        <ToggleButton value="USD">$ USD</ToggleButton>
                        <ToggleButton value="EUR">€ EUR</ToggleButton>
                      </ToggleButtonGroup>
                    </InputAdornment>
                  ),
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
                >
                  <MenuItem value="TL">TL</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleInputChange("cityId", e.target.value)}
                  label="Şehir"
                  disabled={loadingCities}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.plateCode} - {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    handleInputChange("districtId", e.target.value)
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

              <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                <Alert severity="info">
                  <strong>Önemli:</strong> İlanınız yayına alınmadan önce
                  moderatörlerimiz tarafından incelenecektir.
                </Alert>
              </Box>
            </Box>
          </Box>
        );

      default:
        return (
          <Box>
            <Typography>Bilinmeyen adım</Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 4 }}>
        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Geri
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Yayınlanıyor..." : "İlanı Yayınla"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              İleri
            </Button>
          )}
        </Box>
      </Paper>

      {/* Başarı Modal'ı */}
      <Dialog open={submitSuccess} onClose={handleSuccessClose}>
        <DialogTitle>Başarılı!</DialogTitle>
        <DialogContent>
          <Typography>
            İlanınız başarıyla oluşturuldu. Dashboard'a yönlendirileceksiniz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OzelAmacliRomorkForm;
