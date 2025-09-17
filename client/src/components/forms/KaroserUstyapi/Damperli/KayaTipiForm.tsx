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
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../layout/Header";
import apiClient from "../../../../api/client";

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

  // Karoser Teknik Özellikler
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

  // İletişim Bilgileri
  sellerName: string;
  phone: string;
  email: string;

  // Ekstra
  warranty: string;
  negotiable: string;
  exchange: string;

  detailedInfo: string;
}

// Devrilme Yönleri
const DEVRILME_YONLERI = ["Arkaya", "Sağa", "Sola"];

const KayaTipiForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    year: "",
    price: "",

    // Karoser Teknik Özellikler
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

    // İletişim Bilgileri
    sellerName: "",
    phone: "",
    email: "",

    // Ekstra
    warranty: "hayir",
    negotiable: "hayir",
    exchange: "hayir",

    detailedInfo: "",
  });

  // Kullanıcı bilgilerini otomatik yükle
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await apiClient.get("/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const user = response.data as {
            firstName?: string;
            lastName?: string;
            companyName?: string;
            phone?: string;
            email?: string;
          };

          setFormData((prev) => ({
            ...prev,
            sellerName:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.companyName ||
              "",
            phone: user.phone || "",
            email: user.email || "",
          }));
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error);
      }
    };
    fetchUserProfile();
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (e.target.name === "showcasePhoto") {
        setFormData((prev) => ({
          ...prev,
          showcasePhoto: files[0] || null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...files].slice(0, 10), // Max 10 photo
        }));
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
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

      const response = await apiClient.post("/ads/karoser", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(
        "Kaya Tipi Karoser ilanı başarıyla oluşturuldu:",
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
                placeholder="Örn: Tertemiz 2020 Model Kaya Tipi Damperli Karoser"
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
                placeholder="Karoserinizin detaylı açıklamasını yazın..."
                required
              />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Üretim Yılı *"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  inputProps={{
                    min: 1980,
                    max: new Date().getFullYear() + 1,
                  }}
                  required
                />

                <TextField
                  fullWidth
                  type="text"
                  label="Fiyat (TL) *"
                  value={formatNumber(formData.price)}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("price", rawValue);
                  }}
                  placeholder="Örn: 150.000"
                  required
                />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Teknik Özellikler */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              ⚙️ Teknik Özellikler
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Genişlik (metre) *"
                  value={formData.genislik}
                  onChange={(e) =>
                    handleInputChange("genislik", e.target.value)
                  }
                  inputProps={{ step: "0.1", min: "0" }}
                  required
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Uzunluk (metre) *"
                  value={formData.uzunluk}
                  onChange={(e) => handleInputChange("uzunluk", e.target.value)}
                  inputProps={{ step: "0.1", min: "0" }}
                  required
                />
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Lastik Durumu (%)"
                  value={formData.lastikDurumu}
                  onChange={(e) =>
                    handleInputChange("lastikDurumu", e.target.value)
                  }
                  inputProps={{ min: 0, max: 100 }}
                />

                <FormControl fullWidth required>
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

            {/* İletişim Bilgileri */}

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

            {/* Fotoğraflar */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📸 Fotoğraflar
            </Typography>

            {/* Vitrin Fotoğrafı */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Vitrin Fotoğrafı
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  name="showcasePhoto"
                  style={{ marginBottom: "16px" }}
                />
                {formData.showcasePhoto && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={URL.createObjectURL(formData.showcasePhoto)}
                      alt="Vitrin"
                      style={{
                        width: "200px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Diğer Fotoğraflar */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Diğer Fotoğraflar (En fazla 10 adet)
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ marginBottom: "16px" }}
                />

                {formData.photos.length > 0 && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}
                  >
                    {formData.photos.map((photo, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: "150px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            minWidth: "auto",
                            backgroundColor: "red",
                            color: "white",
                            "&:hover": { backgroundColor: "darkred" },
                          }}
                        >
                          ×
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
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
              placeholder="Karoseriniz hakkında ek bilgiler..."
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
              Kaya Tipi Damperli Karoser ilanınız başarıyla oluşturuldu. Admin
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

export default KayaTipiForm;
