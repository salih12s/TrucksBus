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
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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
  categoryId: string;
  title: string;
  description: string;
  productionYear: string;
  price: string;
  currency: string;

  // Ahşap Kasa Özellikleri
  length: string; // cm
  width: string; // cm
  tippingDirection: string;

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

interface AdCreateResponse {
  success: boolean;
  message: string;
  ad?: {
    id: number;
    title: string;
  };
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
}

// Devrilme Yönleri
const DEVRILME_YONLERI = ["Sağa", "Sola", "Arkaya"];

const AhsapKasaForm: React.FC = () => {
  const navigate = useNavigate();

  // Fiyat formatı için helper fonksiyonlar
  const formatPrice = (value: string): string => {
    // Sadece sayıları al
    const numericValue = value.replace(/[^\d]/g, "");
    // Binlik ayırıcı ekle
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatPrice = (value: string): string => {
    // Binlik ayırıcıları kaldır
    return value.replace(/\./g, "");
  };

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    categoryId: "7", // Karoser & Üst Yapı
    title: "",
    description: "",
    productionYear: "",
    price: "",
    currency: "TRY",

    // Ahşap Kasa Özellikleri
    length: "",
    width: "",
    tippingDirection: "",

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
            `/ads/cities/${formData.cityId}/districts`,
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

  const handlePriceChange = (value: string) => {
    // Ham veriyi kaydet (formatlanmamış)
    const unformattedValue = unformatPrice(value);

    setFormData((prev) => ({
      ...prev,
      price: unformattedValue, // Ham veri olarak kaydet
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
          photos: [...prev.photos, ...files].slice(0, 15), // Max 15 photo
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Debug: Form verilerini logla
      console.log("🔍 Form gönderimi başlıyor:");
      console.log("📝 FormData içeriği:", {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        photos: formData.photos.length,
        showcasePhoto: formData.showcasePhoto ? "VAR" : "YOK",
      });

      // Temel bilgileri ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "photos" && key !== "showcasePhoto" && value) {
          submitData.append(key, value.toString());
        }
      });
      submitData.append("currency", formData.currency || "TRY");

      // Kategori bilgilerini ekle
      submitData.append("categoryId", formData.categoryId);

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        console.log(
          "📷 Vitrin fotoğrafı ekleniyor:",
          formData.showcasePhoto.name,
        );
        submitData.append("showcasePhoto", formData.showcasePhoto);
      } else {
        console.log("⚠️ Vitrin fotoğrafı bulunamadı!");
      }

      formData.photos.forEach((photo, index) => {
        console.log(`📷 Fotoğraf ${index + 1} ekleniyor:`, photo.name);
        submitData.append(`photo_${index}`, photo);
      });

      console.log(`📊 Toplam fotoğraf sayısı: ${formData.photos.length}`);

      // FormData içeriğini logla
      console.log("📦 FormData keys:");
      for (const [key, value] of submitData.entries()) {
        console.log(
          `  ${key}:`,
          typeof value === "object" ? value.constructor.name : value,
        );
      }

      const response = await apiClient.post("/ads/karoser", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Server Response:", response.data);
      const responseData = response.data as AdCreateResponse;
      console.log("📷 İlan ID:", responseData?.ad?.id);

      setSubmitSuccess(true);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("❌ İlan oluşturulurken hata:", err);
      console.error("🔍 Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      alert(
        `İlan oluşturulurken bir hata oluştu: ${
          err.response?.data?.error || err.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSubmitSuccess(false);
    navigate("/");
  };

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
                placeholder="Örn: Tertemiz 2020 Model Ahşap Kasa Damperli Karoser"
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
                  label="Fiyat"
                  value={formatPrice(formData.price)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="Örn: 150.000"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <ToggleButtonGroup
                          value={formData.currency || "TRY"}
                          exclusive
                          onChange={(_, v) =>
                            v &&
                            setFormData((prev: any) => ({
                              ...prev,
                              currency: v,
                            }))
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
                          <ToggleButton value="TRY">₺</ToggleButton>
                          <ToggleButton value="USD">$</ToggleButton>
                          <ToggleButton value="EUR">€</ToggleButton>
                        </ToggleButtonGroup>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Ahşap Kasa Özellikleri */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              🌳 Ahşap Kasa Özellikleri
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Uzunluk (cm) *"
                  value={formData.length}
                  onChange={(e) => handleInputChange("length", e.target.value)}
                  inputProps={{ min: "0" }}
                  required
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Genişlik (cm) *"
                  value={formData.width}
                  onChange={(e) => handleInputChange("width", e.target.value)}
                  inputProps={{ min: "0" }}
                  required
                />
              </Box>

              <FormControl component="fieldset">
                <FormLabel component="legend">Devrilme Yönü</FormLabel>
                <RadioGroup
                  value={formData.tippingDirection}
                  onChange={(e) =>
                    handleInputChange("tippingDirection", e.target.value)
                  }
                  row
                >
                  {DEVRILME_YONLERI.map((yon) => (
                    <FormControlLabel
                      key={yon}
                      value={yon.toLowerCase()}
                      control={<Radio />}
                      label={yon}
                    />
                  ))}
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
                  Diğer Fotoğraflar (En fazla 15 adet)
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
              Ahşap Kasa Damperli Karoser ilanınız başarıyla oluşturuldu. Admin
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

export default AhsapKasaForm;
