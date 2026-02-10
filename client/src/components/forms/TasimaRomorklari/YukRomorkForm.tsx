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
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  styled,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle,
  CloudUpload,
  PhotoCamera,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@mui/icons-material";
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

interface FormData {
  // Temel bilgiler
  title: string;
  description: string;
  productionYear: string;
  price: string;
  condition: string;
  color: string;

  // Yük Römork spesifik alanlar
  hasDamper: boolean;
  isExchangeable: string;
  usageArea: string; // Kullanım Alanı

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // İletişim
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
  priceType: string;
  currency: string;
}

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

// Kullanım alanı seçenekleri
const usageAreaOptions = ["Bisiklet", "Deniz Aracı", "Motosiklet", "Otomobil"];

// Renk seçenekleri
const colorOptions = [
  "Beyaz",
  "Siyah",
  "Gri",
  "Gümüş",
  "Mavi",
  "Kırmızı",
  "Yeşil",
  "Sarı",
  "Turuncu",
  "Mor",
  "Kahverengi",
  "Altın",
  "Bronz",
  "Pembe",
  "Turkuaz",
  "Bordo",
  "Lacivert",
  "Bej",
];

const YukRomorkForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Temel bilgiler
    title: "",
    description: "",
    productionYear: "",
    price: "",
    condition: "ikinci-el",
    color: "",

    // Yük Römork spesifik alanlar
    hasDamper: false,
    isExchangeable: "olabilir",
    usageArea: "",

    // Konum
    cityId: "",
    districtId: "",

    // Fotoğraflar
    photos: [],
    showcasePhoto: null,

    // İletişim
    sellerPhone: "",
    sellerName: "",
    sellerEmail: "",
    priceType: "fixed",
    currency: "TRY",
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

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
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
          value !== null &&
          value !== undefined
        ) {
          submitData.append(key, value.toString());
        }
      });
    submitData.append("currency", formData.currency || "TRY");

      // Kategori bilgilerini ekle
      submitData.append("categorySlug", categorySlug || "");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");
      submitData.append("subType", "yuk-romork");

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/tasima-romork", submitData, {
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

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Yük Römork İlanı Ver
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
              }}
            >
              {/* Sol Kolon - İlan Detayları */}
              <Box sx={{ flex: { xs: "1", md: "2" } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    İlan Detayları
                  </Typography>

                  {/* İlan Başlığı */}
                  <TextField
                    fullWidth
                    label="İlan Başlığı"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />

                  {/* Açıklama */}
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Açıklama"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    required
                  />

                  {/* Üretim Yılı ve Renk */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        label="Üretim Yılı"
                        type="number"
                        value={formData.productionYear}
                        onChange={(e) =>
                          handleInputChange("productionYear", e.target.value)
                        }
                        required
                      />
                    </Box>
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel>Renk</InputLabel>
                        <Select
                          value={formData.color}
                          label="Renk"
                          onChange={(e) =>
                            handleInputChange("color", e.target.value)
                          }
                        >
                          {colorOptions.map((color) => (
                            <MenuItem key={color} value={color}>
                              {color}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  {/* Kullanım Alanı */}
                  <FormControl fullWidth>
                    <InputLabel>Kullanım Alanı</InputLabel>
                    <Select
                      value={formData.usageArea}
                      label="Kullanım Alanı"
                      onChange={(e) =>
                        handleInputChange("usageArea", e.target.value)
                      }
                    >
                      {usageAreaOptions.map((area) => (
                        <MenuItem key={area} value={area}>
                          {area}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Damper */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.hasDamper}
                        onChange={(e) =>
                          handleInputChange("hasDamper", e.target.checked)
                        }
                      />
                    }
                    label="Damper Var"
                  />

                  {/* Takasa Uygun */}
                  <FormControl fullWidth>
                    <InputLabel>Takasa Uygun</InputLabel>
                    <Select
                      value={formData.isExchangeable}
                      label="Takasa Uygun"
                      onChange={(e) =>
                        handleInputChange("isExchangeable", e.target.value)
                      }
                    >
                      <MenuItem value="evet">Evet</MenuItem>
                      <MenuItem value="hayir">Hayır</MenuItem>
                      <MenuItem value="olabilir">Olabilir</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Durum */}
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={formData.condition}
                      label="Durum"
                      onChange={(e) =>
                        handleInputChange("condition", e.target.value)
                      }
                    >
                      <MenuItem value="sifir">Sıfır</MenuItem>
                      <MenuItem value="ikinci-el">İkinci El</MenuItem>
                      <MenuItem value="hasarli">Hasarlı</MenuItem>
                    </Select>
                  </FormControl>

                  {/* İletişim Bilgileri */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    İletişim Bilgileri
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        label="Satıcı Adı"
                        value={formData.sellerName}
                        onChange={(e) =>
                          handleInputChange("sellerName", e.target.value)
                        }
                        required
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Telefon"
                        value={formData.sellerPhone}
                        onChange={(e) =>
                          handleInputChange("sellerPhone", e.target.value)
                        }
                        required
                      />
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="E-posta"
                    type="email"
                    value={formData.sellerEmail}
                    onChange={(e) =>
                      handleInputChange("sellerEmail", e.target.value)
                    }
                    required
                  />

                  {/* Konum */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel>Şehir</InputLabel>
                        <Select
                          value={formData.cityId}
                          label="Şehir"
                          onChange={(e) =>
                            handleInputChange("cityId", e.target.value)
                          }
                        >
                          {cities.map((city) => (
                            <MenuItem key={city.id} value={city.id.toString()}>
                              {city.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel>İlçe</InputLabel>
                        <Select
                          value={formData.districtId}
                          label="İlçe"
                          onChange={(e) =>
                            handleInputChange("districtId", e.target.value)
                          }
                          disabled={!formData.cityId}
                        >
                          {districts.map((district) => (
                            <MenuItem
                              key={district.id}
                              value={district.id.toString()}
                            >
                              {district.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  {/* Fiyat */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        label="Fiyat"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        required
                      
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ToggleButtonGroup
                      value={formData.currency || "TRY"}
                      exclusive
                      onChange={(_, v) => v && setFormData((prev: any) => ({ ...prev, currency: v }))}
                      size="small"
                      sx={{ "& .MuiToggleButton-root": { py: 0.5, px: 1, fontSize: "0.75rem", "&.Mui-selected": { bgcolor: "#D34237", color: "#fff" } } }}
                    >
                      <ToggleButton value="TRY">₺</ToggleButton>
                      <ToggleButton value="USD">$</ToggleButton>
                      <ToggleButton value="EUR">€</ToggleButton>
                    </ToggleButtonGroup>
                  </InputAdornment>
                ),
              }}
              />
                    </Box>
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel>Para Birimi</InputLabel>
                        <Select
                          value={formData.currency}
                          label="Para Birimi"
                          onChange={(e) =>
                            handleInputChange("currency", e.target.value)
                          }
                        >
                          <MenuItem value="TRY">TRY</MenuItem>
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="EUR">EUR</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel>Fiyat Tipi</InputLabel>
                        <Select
                          value={formData.priceType}
                          label="Fiyat Tipi"
                          onChange={(e) =>
                            handleInputChange("priceType", e.target.value)
                          }
                        >
                          <MenuItem value="fixed">Sabit Fiyat</MenuItem>
                          <MenuItem value="negotiable">Pazarlık Olur</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Sağ Kolon - Fotoğraflar */}
              <Box sx={{ flex: { xs: "1", md: "1" } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Fotoğraflar
                  </Typography>

                  {/* Vitrin Fotoğrafı */}
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Vitrin Fotoğrafı
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Bu fotoğraf ilanınızın ön yüzünde görünecektir
                      </Typography>

                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCamera />}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        Vitrin Fotoğrafı Seç
                        <VisuallyHiddenInput
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, true)}
                        />
                      </Button>

                      {formData.showcasePhoto && (
                        <Box
                          sx={{ position: "relative", display: "inline-block" }}
                        >
                          <img
                            src={URL.createObjectURL(formData.showcasePhoto)}
                            alt="Vitrin"
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "rgba(255, 255, 255, 0.8)",
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.9)",
                              },
                            }}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                showcasePhoto: null,
                              }))
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* Diğer Fotoğraflar */}
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Diğer Fotoğraflar
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
                        startIcon={<CloudUpload />}
                        fullWidth
                        sx={{ mb: 2 }}
                        disabled={formData.photos.length >= 15}
                      >
                        Fotoğraf Ekle ({formData.photos.length}/15)
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
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 1,
                          }}
                        >
                          {formData.photos.map((photo, index) => (
                            <Box key={index}>
                              <Box sx={{ position: "relative" }}>
                                <img
                                  src={URL.createObjectURL(photo)}
                                  alt={`Fotoğraf ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "80px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    bgcolor: "rgba(255, 255, 255, 0.8)",
                                    "&:hover": {
                                      bgcolor: "rgba(255, 255, 255, 0.9)",
                                    },
                                  }}
                                  onClick={() => removePhoto(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 2,
                                    left: 2,
                                    bgcolor: "rgba(255, 255, 255, 0.8)",
                                    "&:hover": {
                                      bgcolor: "rgba(255, 255, 255, 0.9)",
                                    },
                                  }}
                                  onClick={() => setShowcasePhoto(index)}
                                  title="Vitrin fotoğrafı yap"
                                >
                                  <StarIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? "Yükleniyor..." : "İlanı Yayınla"}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle color="success" />
              Başarılı!
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              İlanınız başarıyla oluşturuldu. Dashboard sayfasına
              yönlendiriliyorsunuz.
            </Typography>
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

export default YukRomorkForm;
