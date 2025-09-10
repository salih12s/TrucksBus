import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { CheckCircle, PhotoCamera, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../layout/Header";
import apiClient from "../../../api/client";

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

  // Havuzlu Özel Bilgileri
  havuzDerinligi: string;
  havuzGenisligi: string;
  havuzUzunlugu: string;
  lastikDurumu: string;
  istiapHaddi: string;
  uzatilabilirProfil: string;
  dingilSayisi: string;

  // Rampa Mekanizması
  rampaMekanizmasi: string[];

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

// Lastik Durumu Seçenekleri
const TIRE_CONDITIONS = ["%90-100", "%75-89", "%50-74", "%25-49", "%0-24"];

// Rampa Mekanizması Seçenekleri
const RAMPA_MEKANIZMASI = ["Hidrolik", "Pnömatik", "Manuel"];

const HavuzluForm: React.FC = () => {
  const navigate = useNavigate();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    havuzDerinligi: "",
    havuzGenisligi: "",
    havuzUzunlugu: "",
    lastikDurumu: "",
    istiapHaddi: "",
    uzatilabilirProfil: "",
    dingilSayisi: "",
    rampaMekanizmasi: [],
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    warranty: "",
    negotiable: "",
    exchange: "",
    detailedInfo: "",
  });

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
  const fetchDistricts = async (cityId: string) => {
    if (!cityId) return;
    try {
      const response = await apiClient.get(`/districts?cityId=${cityId}`);
      setDistricts(response.data as District[]);
    } catch (error) {
      console.error("İlçeler yüklenirken hata:", error);
    }
  };

  // Şehir değişikliği
  const handleCityChange = (cityId: string) => {
    setFormData({ ...formData, cityId, districtId: "" });
    setDistricts([]);
    fetchDistricts(cityId);
  };

  // Rampa mekanizması seçimi
  const handleRampaChange = (value: string) => {
    const currentValues = formData.rampaMekanizmasi;
    if (currentValues.includes(value)) {
      setFormData({
        ...formData,
        rampaMekanizmasi: currentValues.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        rampaMekanizmasi: [...currentValues, value],
      });
    }
  };

  // Fotoğraf upload
  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase = false
  ) => {
    const files = event.target.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Fotoğraf boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;

      if (isShowcase) {
        setFormData((prev) => ({ ...prev, showcasePhoto: file }));
        setShowcasePreview(preview);
      } else {
        if (formData.photos.length >= 15) {
          alert("En fazla 15 fotoğraf yükleyebilirsiniz");
          return;
        }
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, file] }));
        setPhotoPreviews((prev) => [...prev, preview]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fotoğraf silme
  const removePhoto = (index: number, isShowcase = false) => {
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

  // Form gönderimi
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("price", formData.price);
      submitData.append("category", "dorse");
      submitData.append("variant", "havuzlu");

      // Havuzlu özel bilgileri
      submitData.append("havuzDerinligi", formData.havuzDerinligi);
      submitData.append("havuzGenisligi", formData.havuzGenisligi);
      submitData.append("havuzUzunlugu", formData.havuzUzunlugu);
      submitData.append("lastikDurumu", formData.lastikDurumu);
      submitData.append("istiapHaddi", formData.istiapHaddi);
      submitData.append("uzatilabilirProfil", formData.uzatilabilirProfil);
      submitData.append("dingilSayisi", formData.dingilSayisi);

      // Rampa mekanizması
      submitData.append(
        "rampaMekanizmasi",
        JSON.stringify(formData.rampaMekanizmasi)
      );

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Ekstra
      submitData.append("warranty", formData.warranty);
      submitData.append("negotiable", formData.negotiable);
      submitData.append("exchange", formData.exchange);
      submitData.append("detailedInfo", formData.detailedInfo);

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/dorse", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("İlan başarıyla oluşturuldu:", response.data);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("İlan oluşturulurken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Başarı dialogu
  const handleSuccessClose = () => {
    setSubmitSuccess(false);
    navigate("/dashboard");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Havuzlu Dorse İlanı Ver
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Temel Bilgiler
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Açıklama"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Üretim Yılı"
                value={formData.productionYear}
                onChange={(e) =>
                  setFormData({ ...formData, productionYear: e.target.value })
                }
                required
                sx={{ flex: 1 }}
              />

              <TextField
                label="Fiyat"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">TL</InputAdornment>
                  ),
                }}
                required
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Havuzlu Dorse Özellikleri
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Havuz Genişliği"
                value={formData.havuzGenisligi}
                onChange={(e) =>
                  setFormData({ ...formData, havuzGenisligi: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">m</InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />

              <TextField
                label="Havuz Uzunluğu"
                value={formData.havuzUzunlugu}
                onChange={(e) =>
                  setFormData({ ...formData, havuzUzunlugu: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">m</InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="İstiap Haddi"
                value={formData.istiapHaddi}
                onChange={(e) =>
                  setFormData({ ...formData, istiapHaddi: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ton</InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />

              <TextField
                label="Dingil Sayısı"
                value={formData.dingilSayisi}
                onChange={(e) =>
                  setFormData({ ...formData, dingilSayisi: e.target.value })
                }
                sx={{ flex: 1 }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Lastik Durumu</InputLabel>
              <Select
                value={formData.lastikDurumu}
                onChange={(e) =>
                  setFormData({ ...formData, lastikDurumu: e.target.value })
                }
                label="Lastik Durumu"
              >
                {TIRE_CONDITIONS.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">Uzatılabilir Profil</FormLabel>
              <RadioGroup
                row
                value={formData.uzatilabilirProfil}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    uzatilabilirProfil: e.target.value,
                  })
                }
              >
                <FormControlLabel value="Var" control={<Radio />} label="Var" />
                <FormControlLabel value="Yok" control={<Radio />} label="Yok" />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">
                Rampa Mekanizması (Seçim yapılmadı)
              </FormLabel>
              <FormGroup row>
                {RAMPA_MEKANIZMASI.map((rampa) => (
                  <FormControlLabel
                    key={rampa}
                    control={
                      <Checkbox
                        checked={formData.rampaMekanizmasi.includes(rampa)}
                        onChange={() => handleRampaChange(rampa)}
                        name={rampa}
                      />
                    }
                    label={rampa}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Konum Bilgileri
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", gap: 2 }}>
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

            <FormControl fullWidth required disabled={!formData.cityId}>
              <InputLabel>İlçe</InputLabel>
              <Select
                value={formData.districtId}
                onChange={(e) =>
                  setFormData({ ...formData, districtId: e.target.value })
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
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📸 Fotoğraflar
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Vitrin Fotoğrafı */}
          <Card sx={{ mb: 3, border: "2px solid #e3f2fd" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                ⭐ Vitrin Fotoğrafı
                <Chip
                  label="Zorunlu"
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                İlk bakışta dikkat çeken en iyi fotoğrafınızı seçin
              </Typography>

              {showcasePreview ? (
                <Card sx={{ position: "relative", maxWidth: 300 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={showcasePreview}
                    alt="Vitrin fotoğrafı"
                    sx={{ objectFit: "cover" }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                    }}
                    onClick={() => removePhoto(0, true)}
                  >
                    <Close />
                  </IconButton>
                </Card>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{
                    height: 100,
                    border: "2px dashed #ccc",
                    "&:hover": { border: "2px dashed #1976d2" },
                  }}
                >
                  Vitrin Fotoğrafı Seç
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handlePhotoUpload(e, true)}
                  />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Diğer Fotoğraflar */}
          <Card sx={{ mb: 4, border: "2px solid #e8f5e8" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                📷 Diğer Fotoğraflar
                <Chip
                  label={`${formData.photos.length}/15`}
                  size="small"
                  color="secondary"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Aracınızın farklı açılardan fotoğraflarını ekleyin (Maksimum 15
                adet)
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                {photoPreviews.map((preview, index) => (
                  <Card
                    key={index}
                    sx={{ position: "relative", width: 120, height: 120 }}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={preview}
                      alt={`Fotoğraf ${index + 1}`}
                      sx={{ objectFit: "cover" }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        width: 24,
                        height: 24,
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                      }}
                      onClick={() => removePhoto(index)}
                    >
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Card>
                ))}
              </Box>

              {formData.photos.length < 15 && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{
                    border: "2px dashed #4caf50",
                    color: "#4caf50",
                    "&:hover": {
                      border: "2px dashed #388e3c",
                      color: "#388e3c",
                    },
                  }}
                >
                  Fotoğraf Ekle
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handlePhotoUpload(e, false)}
                  />
                </Button>
              )}
            </CardContent>
          </Card>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ek Özellikler
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Garantili</FormLabel>
              <RadioGroup
                row
                value={formData.warranty}
                onChange={(e) =>
                  setFormData({ ...formData, warranty: e.target.value })
                }
              >
                <FormControlLabel
                  value="Evet"
                  control={<Radio />}
                  label="Evet"
                />
                <FormControlLabel
                  value="Hayır"
                  control={<Radio />}
                  label="Hayır"
                />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">Pazarlık Yapılır</FormLabel>
              <RadioGroup
                row
                value={formData.negotiable}
                onChange={(e) =>
                  setFormData({ ...formData, negotiable: e.target.value })
                }
              >
                <FormControlLabel
                  value="Evet"
                  control={<Radio />}
                  label="Evet"
                />
                <FormControlLabel
                  value="Hayır"
                  control={<Radio />}
                  label="Hayır"
                />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">Takas Yapılır</FormLabel>
              <RadioGroup
                row
                value={formData.exchange}
                onChange={(e) =>
                  setFormData({ ...formData, exchange: e.target.value })
                }
              >
                <FormControlLabel
                  value="Evet"
                  control={<Radio />}
                  label="Evet"
                />
                <FormControlLabel
                  value="Hayır"
                  control={<Radio />}
                  label="Hayır"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Detaylı Bilgi"
              value={formData.detailedInfo}
              onChange={(e) =>
                setFormData({ ...formData, detailedInfo: e.target.value })
              }
            />
          </Box>
        </Paper>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            İptal
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Yayınlanıyor..." : "İlanı Yayınla"}
          </Button>
        </Box>
      </Container>

      {/* Başarı Dialogu */}
      <Dialog open={submitSuccess} onClose={handleSuccessClose}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle color="success" />
            İlan Başarıyla Yayınlandı
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Havuzlu dorse ilanınız başarıyla yayınlandı. İlanınızı "İlanlarım"
            sayfasından görüntüleyebilirsiniz.
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

export default HavuzluForm;
