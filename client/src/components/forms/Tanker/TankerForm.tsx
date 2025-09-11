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
  Chip,
} from "@mui/material";
import { CheckCircle, PhotoCamera } from "@mui/icons-material";
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
  productionYear: string;
  price: string;

  // Tanker Özel Bilgileri
  hacim: string;
  gozSayisi: string;
  lastikDurumu: string;
  renk: string;
  takasli: string;

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

// Tanker Renkleri
const TANKER_COLORS = [
  "Beyaz",
  "Gri",
  "Siyah",
  "Kırmızı",
  "Mavi",
  "Yeşil",
  "Sarı",
  "Turuncu",
  "Metalik Gri",
  "Diğer",
];

const TankerForm: React.FC = () => {
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
    productionYear: "",
    price: "",

    // Tanker Özel Bilgileri
    hacim: "",
    gozSayisi: "1",
    lastikDurumu: "100",
    renk: "",
    takasli: "Hayır",

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
    }
  }, [formData.cityId]);

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Modern fotoğraf upload fonksiyonu
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isShowcase) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, showcasePhoto: file }));
      setShowcasePreview(URL.createObjectURL(file));
    } else {
      const newFiles = Array.from(files);
      const totalPhotos = formData.photos.length + newFiles.length;

      if (totalPhotos > 15) {
        alert("En fazla 15 fotoğraf yükleyebilirsiniz");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newFiles],
      }));

      // Preview'ları oluştur
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));

    // Preview'ı da kaldır
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
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

      console.log("Tanker Dorse ilanı başarıyla oluşturuldu:", response.data);
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

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
            ⛽ Tanker Dorse İlanı Ver
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {categorySlug} - {brandSlug} - {modelSlug} - {variantSlug}
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Temel Bilgiler */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📋 Temel Bilgiler
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <TextField
                fullWidth
                label="İlan Başlığı *"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Örn: Tertemiz 2020 Model Tanker Dorse"
                required
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Açıklama *"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Tanker dorsenizin detaylı açıklamasını yazın..."
                required
              />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Üretim Yılı</InputLabel>
                  <Select
                    value={formData.productionYear}
                    label="Üretim Yılı"
                    onChange={(e) =>
                      handleInputChange("productionYear", e.target.value)
                    }
                  >
                    {productionYears.map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="number"
                  label="Fiyat (TL) *"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Tanker Özellikleri */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              ⛽ Tanker Özellikleri
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Hacim *"
                  value={formData.hacim}
                  onChange={(e) => handleInputChange("hacim", e.target.value)}
                  inputProps={{ step: "0.1", min: "0" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">m³</InputAdornment>
                    ),
                  }}
                  required
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Göz Sayısı *"
                  value={formData.gozSayisi}
                  onChange={(e) =>
                    handleInputChange("gozSayisi", e.target.value)
                  }
                  inputProps={{ min: "1" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">adet</InputAdornment>
                    ),
                  }}
                  required
                />
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Lastik Durumu *"
                  value={formData.lastikDurumu}
                  onChange={(e) =>
                    handleInputChange("lastikDurumu", e.target.value)
                  }
                  inputProps={{ min: "0", max: "100" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  required
                />

                <FormControl fullWidth required>
                  <InputLabel>Renk</InputLabel>
                  <Select
                    value={formData.renk}
                    label="Renk"
                    onChange={(e) => handleInputChange("renk", e.target.value)}
                  >
                    {TANKER_COLORS.map((color) => (
                      <MenuItem key={color} value={color}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <FormControl component="fieldset">
                <FormLabel component="legend">Takaslı</FormLabel>
                <RadioGroup
                  value={formData.takasli}
                  onChange={(e) => handleInputChange("takasli", e.target.value)}
                  row
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
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Konum Bilgileri */}
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
                  onChange={(e) =>
                    handleInputChange("warranty", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("exchange", e.target.value)
                  }
                  label="Takas"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* 📸 Fotoğraflar */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                },
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <PhotoCamera sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Fotoğraflar
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4, textAlign: "center", fontStyle: "italic" }}
                >
                  Kaliteli fotoğraflar ile ilanınızın dikkat çekmesini sağlayın
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 4,
                    mt: 3,
                  }}
                >
                  {/* Vitrin Fotoğrafı */}
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                      border: "2px dashed #0284c7",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "primary.main",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      🖼️ Vitrin Fotoğrafı
                      <Chip label="Zorunlu" color="error" size="small" />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Ana fotoğraf olarak kullanılacak en iyi fotoğrafınızı
                      seçin
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
                        sx={{
                          borderRadius: 3,
                          py: 1.5,
                          px: 3,
                          fontWeight: 600,
                          background:
                            "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                          },
                        }}
                      >
                        Vitrin Fotoğrafı Seç
                      </Button>
                    </label>

                    {/* Vitrin fotoğrafı önizlemesi */}
                    {showcasePreview && (
                      <Box sx={{ mt: 3 }}>
                        <Box
                          sx={{
                            position: "relative",
                            display: "inline-block",
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          <img
                            src={showcasePreview}
                            alt="Vitrin fotoğrafı önizleme"
                            style={{
                              width: "200px",
                              height: "150px",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background: "rgba(0,0,0,0.7)",
                              borderRadius: "50%",
                              p: 0.5,
                              cursor: "pointer",
                              "&:hover": { background: "rgba(0,0,0,0.9)" },
                            }}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                showcasePhoto: null,
                              }));
                              setShowcasePreview(null);
                            }}
                          >
                            <Typography sx={{ color: "white", fontSize: 16 }}>
                              ×
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Card>

                  {/* Diğer Fotoğraflar */}
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "2px dashed #64748b",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        borderColor: "secondary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        color: "secondary.main",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      📷 Diğer Fotoğraflar
                      <Chip
                        label={`${formData.photos.length}/15`}
                        color="secondary"
                        size="small"
                      />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Ürününüzü farklı açılardan gösteren fotoğraflar ekleyin
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
                        variant="contained"
                        component="span"
                        startIcon={<PhotoCamera />}
                        sx={{
                          borderRadius: 3,
                          py: 1.5,
                          px: 3,
                          fontWeight: 600,
                          background:
                            "linear-gradient(45deg, #9c27b0 30%, #e1bee7 90%)",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)",
                          },
                        }}
                      >
                        Fotoğraf Ekle
                      </Button>
                    </label>

                    {/* Diğer fotoğraflar önizlemesi */}
                    {photoPreviews.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2,
                          mt: 3,
                          justifyContent: "center",
                        }}
                      >
                        {photoPreviews.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: "relative",
                              borderRadius: 2,
                              overflow: "hidden",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Fotoğraf ${index + 1}`}
                              style={{
                                width: "80px",
                                height: "60px",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "rgba(0,0,0,0.7)",
                                borderRadius: "50%",
                                p: 0.3,
                                cursor: "pointer",
                                "&:hover": { background: "rgba(0,0,0,0.9)" },
                              }}
                              onClick={() => removePhoto(index)}
                            >
                              <Typography sx={{ color: "white", fontSize: 12 }}>
                                ×
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Card>
                </Box>
              </CardContent>
            </Card>

            {/* Detaylı Bilgi */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Detaylı Bilgi"
              value={formData.detailedInfo}
              onChange={(e) =>
                handleInputChange("detailedInfo", e.target.value)
              }
              placeholder="Tanker dorseniz hakkında ek bilgiler..."
              sx={{ mb: 4 }}
            />

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={() => navigate(-1)}
                sx={{ px: 4 }}
              >
                Geri Dön
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  px: 6,
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                  },
                }}
              >
                {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle sx={{ textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 60, color: "green", mb: 2 }} />
            <Typography variant="h4">Başarılı!</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              Tanker Dorse ilanınız başarıyla oluşturuldu. Admin onayından sonra
              yayınlanacaktır.
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

export default TankerForm;
