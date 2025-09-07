import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
} from "@mui/material";
import { CheckCircle, CloudUpload, Delete } from "@mui/icons-material";
import apiClient from "../../../api/client";
import Header from "../../layout/Header";

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

interface TarimTankerFormData {
  // Temel bilgiler
  title: string;
  description: string;
  productionYear: string;
  price: string;
  volume: string;
  condition: string;
  isExchangeable: string;
  hasDamper: boolean;
  material: string;

  // Konum
  cityId: string;
  districtId: string;

  // İletişim
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const TarimTankerForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<TarimTankerFormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    volume: "",
    condition: "ikinci-el",
    isExchangeable: "olabilir",
    hasDamper: false,
    material: "",
    cityId: "",
    districtId: "",
    sellerName: "",
    sellerPhone: "",
    sellerEmail: "",
    photos: [],
    showcasePhoto: null,
  });

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

  const handleInputChange = (
    field: keyof TarimTankerFormData,
    value: string | boolean | File[] | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = formData.photos.length + newFiles.length;

    if (totalPhotos > 10) {
      alert("En fazla 10 fotoğraf yükleyebilirsiniz.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newFiles],
      showcasePhoto: prev.showcasePhoto || newFiles[0] || null,
    }));
  };

  const removePhoto = (index: number) => {
    const photoToRemove = formData.photos[index];
    const newPhotos = formData.photos.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      photos: newPhotos,
      showcasePhoto:
        prev.showcasePhoto === photoToRemove
          ? newPhotos.length > 0
            ? newPhotos[0]
            : null
          : prev.showcasePhoto,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year);
    }
    return years;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "photos" && key !== "showcasePhoto" && value) {
          submitData.append(key, value.toString());
        }
      });

      // Kategori bilgilerini ekle
      submitData.append("categorySlug", categorySlug || "");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");
      submitData.append("subType", "tarim-tanker");

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/tarim-romork", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
    navigate("/dashboard");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* İlan Başlığı */}
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Örn: 2020 Model Tarım Tanker Römorku"
              required
            />

            {/* Açıklama */}
            <TextField
              fullWidth
              label="İlan Açıklaması"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Araç hakkında detaylı bilgi veriniz..."
              required
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Üretim Yılı */}
              <FormControl fullWidth>
                <InputLabel>Üretim Yılı</InputLabel>
                <Select
                  value={formData.productionYear}
                  onChange={(e) =>
                    handleInputChange("productionYear", e.target.value)
                  }
                  label="Üretim Yılı"
                >
                  {generateYearOptions().map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Hacim */}
              <TextField
                fullWidth
                label="Hacim (L)"
                value={formData.volume}
                onChange={(e) => handleInputChange("volume", e.target.value)}
                placeholder="Örn: 5000"
                type="number"
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Durum */}
              <FormControl fullWidth>
                <InputLabel>Durumu</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={(e) =>
                    handleInputChange("condition", e.target.value)
                  }
                  label="Durumu"
                >
                  <MenuItem value="sifir">Sıfır</MenuItem>
                  <MenuItem value="ikinci-el">İkinci El</MenuItem>
                  <MenuItem value="hasarli">Hasarlı</MenuItem>
                </Select>
              </FormControl>

              {/* Malzeme */}
              <FormControl fullWidth>
                <InputLabel>Malzeme</InputLabel>
                <Select
                  value={formData.material}
                  onChange={(e) =>
                    handleInputChange("material", e.target.value)
                  }
                  label="Malzeme"
                >
                  <MenuItem value="paslanmaz-celik">Paslanmaz Çelik</MenuItem>
                  <MenuItem value="plastik">Plastik</MenuItem>
                  <MenuItem value="fiberglas">Fiberglas</MenuItem>
                  <MenuItem value="galvaniz">Galvaniz</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Takas */}
              <FormControl fullWidth>
                <InputLabel>Takas</InputLabel>
                <Select
                  value={formData.isExchangeable}
                  onChange={(e) =>
                    handleInputChange("isExchangeable", e.target.value)
                  }
                  label="Takas"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                  <MenuItem value="olabilir">Olabilir</MenuItem>
                </Select>
              </FormControl>

              {/* Damperli */}
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
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
                />
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fotoğraf Yükleme (En fazla 10 adet)
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ alignSelf: "flex-start" }}
            >
              Fotoğraf Seç
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            {formData.photos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Yüklenen Fotoğraflar ({formData.photos.length}/10)
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  {formData.photos.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        width: "150px",
                        height: "150px",
                        border: "2px solid",
                        borderColor:
                          formData.showcasePhoto === file
                            ? "primary.main"
                            : "grey.300",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Yüklenen ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      <IconButton
                        onClick={() => removePhoto(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>

                      {formData.showcasePhoto === file && (
                        <Chip
                          label="Vitrin"
                          size="small"
                          color="primary"
                          sx={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Fiyat */}
            <TextField
              fullWidth
              label="Fiyat (TL)"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="Örn: 250000"
              type="number"
              required
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Satıcı Adı */}
              <TextField
                fullWidth
                label="Satıcı Adı"
                value={formData.sellerName}
                onChange={(e) =>
                  handleInputChange("sellerName", e.target.value)
                }
                required
              />

              {/* Telefon */}
              <TextField
                fullWidth
                label="Telefon Numarası"
                value={formData.sellerPhone}
                onChange={(e) =>
                  handleInputChange("sellerPhone", e.target.value)
                }
                placeholder="0555 555 55 55"
                required
              />
            </Box>

            {/* E-posta */}
            <TextField
              fullWidth
              label="E-posta Adresi"
              type="email"
              value={formData.sellerEmail}
              onChange={(e) => handleInputChange("sellerEmail", e.target.value)}
              required
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Şehir */}
              <FormControl fullWidth required>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  label="Şehir"
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* İlçe */}
              <FormControl fullWidth required disabled={!formData.cityId}>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    handleInputChange("districtId", e.target.value)
                  }
                  label="İlçe"
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      {district.name}
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
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Tarım Tanker Römorku İlanı - {steps[activeStep]}
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form İçeriği */}
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Geri
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "İlanı Yayınla"}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained">
                  İleri
                </Button>
              )}
            </Box>
          </form>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle color="success" />
            İlan Başarıyla Oluşturuldu
          </DialogTitle>
          <DialogContent>
            <Alert severity="success">
              İlanınız başarıyla yayınlandı! Yönetim paneline
              yönlendiriliyorsunuz.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuccessClose} variant="contained">
              Tamam
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default TarimTankerForm;
