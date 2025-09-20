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
  Card,
  CardContent,
  CardMedia,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from "@mui/material";
import { CheckCircle, PhotoCamera, Close } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
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
  year: string;
  price: string;

  // Dorse Teknik Özellikler
  genislik: string; // metre
  uzunluk: string; // metre
  lastikDurumu: string; // yüzde
  devrilmeYonu: string;

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

// Devrilme Yönleri
const DEVRILME_YONLERI = ["Arkaya", "Sağa", "Sola"];

const KapakliTipForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    year: "",
    price: "",

    // Dorse Teknik Özellikler
    genislik: "",
    uzunluk: "",
    lastikDurumu: "100",
    devrilmeYonu: "",

    // Konum
    cityId: "",
    districtId: "",

    // Fotoğraflar
    photos: [],
    showcasePhoto: null,

    // Ekstra
    warranty: "hayir",
    negotiable: "hayir",
    exchange: "hayir",

    detailedInfo: "",
  });

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
    if (formData.cityId) {
      const fetchDistricts = async () => {
        try {
          const response = await apiClient.get(
            `/ads/cities/${formData.cityId}/districts`
          );
          setDistricts(response.data as District[]);
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.cityId]);

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase = false
  ) => {
    const files = event.target.files;
    if (files) {
      if (isShowcase) {
        const file = files[0];
        setFormData((prev) => ({ ...prev, showcasePhoto: file }));

        // Vitrin fotoğrafı önizlemesi oluştur
        const reader = new FileReader();
        reader.onload = (e) => {
          setShowcasePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        const currentPhotos = formData.photos;
        const newPhotos = Array.from(files);
        const totalPhotos = currentPhotos.length + newPhotos.length;

        if (totalPhotos <= 15) {
          setFormData((prev) => ({
            ...prev,
            photos: [...currentPhotos, ...newPhotos],
          }));

          // Yeni fotoğraflar için önizlemeler oluştur
          const newPreviews: string[] = [];
          Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              newPreviews.push(e.target?.result as string);
              if (newPreviews.length === files.length) {
                setPhotoPreviews((prev) => [...prev, ...newPreviews]);
              }
            };
            reader.readAsDataURL(file);
          });
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
    // Önizlemeyi de kaldır
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle (price'ı parse ederek)
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "photos" && key !== "showcasePhoto" && value) {
          // Price değerini parse et
          if (key === "price") {
            const parsedValue = parseFormattedNumber(value.toString());
            if (parsedValue) {
              submitData.append(key, parsedValue);
            }
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      // Kategori bilgilerini ekle
      submitData.append("categorySlug", categorySlug || "");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");

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

      console.log(
        "Kapaklı Tip Dorse ilanı başarıyla oluşturuldu:",
        response.data
      );
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

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            🚛 Kapaklı Tip Damperli Dorse İlanı Ver
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Damperli dorsenizin bilgilerini girerek hızlı ve güvenli bir şekilde
            satış ilanı oluşturun
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={3}
          sx={{ p: 4, borderRadius: 2 }}
        >
          {/* İlan Başlığı */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            📋 İlan Bilgileri
          </Typography>

          <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
            <TextField
              fullWidth
              label="İlan Başlığı *"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Örn: 2020 Model Kapaklı Tip Damperli Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="İlan Açıklaması *"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Dorsenizin genel durumu, kullanım alanı ve özelliklerini yazın..."
              required
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                fullWidth
                label="Model Yılı *"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                placeholder="Örn: 2020"
                required
              />

              <TextField
                fullWidth
                label="Fiyat (TL) *"
                value={formatNumber(formData.price)}
                onChange={(e) => {
                  const rawValue = parseFormattedNumber(e.target.value);
                  handleInputChange("price", rawValue);
                }}
                placeholder="Örn: 250.000"
                required
              />
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Teknik Özellikler */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            🔧 Teknik Özellikler
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 2,
              mb: 4,
            }}
          >
            <TextField
              fullWidth
              label="Genişlik (metre) *"
              value={formData.genislik}
              onChange={(e) => handleInputChange("genislik", e.target.value)}
              placeholder="Örn: 2.55"
              required
            />

            <TextField
              fullWidth
              label="Uzunluk (metre) *"
              value={formData.uzunluk}
              onChange={(e) => handleInputChange("uzunluk", e.target.value)}
              placeholder="Örn: 8.5"
              required
            />

            <TextField
              fullWidth
              label="Lastik Durumu (%)"
              value={formData.lastikDurumu}
              onChange={(e) =>
                handleInputChange("lastikDurumu", e.target.value)
              }
              placeholder="Örn: 85"
            />

            <FormControl fullWidth>
              <InputLabel>Devrilme Yönü</InputLabel>
              <Select
                value={formData.devrilmeYonu}
                onChange={(e) =>
                  handleInputChange("devrilmeYonu", e.target.value)
                }
                label="Devrilme Yönü"
              >
                {DEVRILME_YONLERI.map((yon) => (
                  <MenuItem key={yon} value={yon}>
                    {yon}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Konum */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            📍 Konum Bilgileri
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 4,
            }}
          >
            <FormControl fullWidth required>
              <InputLabel>Şehir</InputLabel>
              <Select
                value={formData.cityId}
                onChange={(e) => handleInputChange("cityId", e.target.value)}
                label="Şehir"
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
                  handleInputChange("districtId", e.target.value)
                }
                label="İlçe"
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

          <Divider sx={{ my: 4 }} />

          {/* Fotoğraflar */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            📸 Fotoğraflar
          </Typography>

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
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        showcasePhoto: null,
                      }));
                      setShowcasePreview(null);
                    }}
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
                Dorsenizin farklı açılardan fotoğraflarını ekleyin (en fazla 15
                adet)
              </Typography>

              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{
                  mb: 2,
                  border: "2px dashed #4caf50",
                  color: "#4caf50",
                  "&:hover": { border: "2px solid #4caf50" },
                }}
                disabled={formData.photos.length >= 15}
              >
                {formData.photos.length === 0
                  ? "Fotoğraf Ekle"
                  : "Daha Fazla Fotoğraf Ekle"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handlePhotoUpload(e, false)}
                />
              </Button>

              {formData.photos.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {photoPreviews.map((preview, index) => (
                    <Card key={index} sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={preview}
                        alt={`Fotoğraf ${index + 1}`}
                        sx={{ objectFit: "cover" }}
                      />
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "rgba(244, 67, 54, 0.8)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(244, 67, 54, 1)",
                          },
                        }}
                        onClick={() => removePhoto(index)}
                        size="small"
                      >
                        <Close />
                      </IconButton>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        {index + 1}
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Divider sx={{ my: 4 }} />

          {/* Ek Seçenekler */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            ⚡ Ek Seçenekler
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 2,
              mb: 4,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Garanti</InputLabel>
              <Select
                value={formData.warranty}
                onChange={(e) => handleInputChange("warranty", e.target.value)}
                label="Garanti"
              >
                <MenuItem value="evet">Evet</MenuItem>
                <MenuItem value="hayir">Hayır</MenuItem>
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
                <MenuItem value="hayir">Hayır</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Takas</InputLabel>
              <Select
                value={formData.exchange}
                onChange={(e) => handleInputChange("exchange", e.target.value)}
                label="Takas"
              >
                <MenuItem value="evet">Evet</MenuItem>
                <MenuItem value="hayir">Hayır</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Detaylı Bilgi */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Detaylı Bilgi"
            value={formData.detailedInfo}
            onChange={(e) => handleInputChange("detailedInfo", e.target.value)}
            placeholder="Dorseniz hakkında ek bilgiler..."
            sx={{ mb: 4 }}
          />

          {/* Submit Button */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={() => navigate("/")}
              sx={{ px: 4 }}
            >
              Anasayfaya Dön
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                px: 6,
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                },
              }}
            >
              {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
            </Button>
          </Box>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle sx={{ textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 60, color: "green", mb: 2 }} />
            <Typography variant="h4">Başarılı!</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              Kapaklı Tip Damperli Dorse ilanınız başarıyla oluşturuldu. Admin
              onayından sonra yayınlanacaktır.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              onClick={handleSuccessClose}
              variant="contained"
              size="large"
              sx={{
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              }}
            >
              Tamam
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default KapakliTipForm;
