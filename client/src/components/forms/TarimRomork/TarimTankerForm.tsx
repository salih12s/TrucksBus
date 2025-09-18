import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Card,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  PhotoCamera,
  EditNote,
  LocationOn,
  CloudUpload,
  Delete,
  AttachMoney,
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

const TarimTankerForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<TarimTankerFormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    volume: "",
    condition: "ikinci-el",
    isExchangeable: "olabilir",
    hasDamper: false,
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
    value: string | boolean | File[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => {
      const newPhotos = [...prev.photos, ...files];
      return {
        ...prev,
        photos: newPhotos,
        showcasePhoto: prev.showcasePhoto || newPhotos[0] || null,
      };
    });
  };

  const handleSetShowcasePhoto = (photo: File) => {
    setFormData((prev) => ({ ...prev, showcasePhoto: photo }));
  };

  const handleRemovePhoto = (photoToRemove: File) => {
    setFormData((prev) => {
      const newPhotos = prev.photos.filter((photo) => photo !== photoToRemove);
      return {
        ...prev,
        photos: newPhotos,
        showcasePhoto:
          prev.showcasePhoto === photoToRemove
            ? newPhotos.length > 0
              ? newPhotos[0]
              : null
            : prev.showcasePhoto,
      };
    });
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
      submitData.append("subType", "tanker");

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
    navigate("/");
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            Tarım Tanker Römorku İlanı
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              
              {/* İlan Detayları Kartı */}
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditNote color="primary" />
                  İlan Detayları
                </Typography>
                
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
                    label="Açıklama"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Ürününüzün detaylı açıklamasını yazın..."
                    required
                  />

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {/* Üretim Yılı */}
                    <TextField
                      label="Üretim Yılı"
                      value={formData.productionYear}
                      onChange={(e) => handleInputChange("productionYear", e.target.value)}
                      sx={{ minWidth: 150 }}
                      required
                    />

                    {/* Hacim */}
                    <TextField
                      label="Hacim (Litre)"
                      value={formData.volume}
                      onChange={(e) => handleInputChange("volume", e.target.value)}
                      placeholder="Örn: 8000"
                      sx={{ minWidth: 150 }}
                      required
                    />

                    {/* Durum */}
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        value={formData.condition}
                        onChange={(e) => handleInputChange("condition", e.target.value)}
                        required
                      >
                        <MenuItem value="sifir">Sıfır</MenuItem>
                        <MenuItem value="ikinci-el">İkinci El</MenuItem>
                        <MenuItem value="hasarli">Hasarlı</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Takas */}
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Takas</InputLabel>
                      <Select
                        value={formData.isExchangeable}
                        onChange={(e) => handleInputChange("isExchangeable", e.target.value)}
                      >
                        <MenuItem value="olabilir">Olabilir</MenuItem>
                        <MenuItem value="olmaz">Olmaz</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Damper */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.hasDamper}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange("hasDamper", e.target.checked)
                        }
                      />
                    }
                    label="Damperli"
                  />
                </Box>
              </Card>

              {/* Konum Kartı */}
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="primary" />
                  Konum Bilgileri
                </Typography>
                
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {/* Şehir */}
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Şehir</InputLabel>
                    <Select
                      value={formData.cityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      required
                    >
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* İlçe */}
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>İlçe</InputLabel>
                    <Select
                      value={formData.districtId}
                      onChange={(e) => handleInputChange("districtId", e.target.value)}
                      disabled={!formData.cityId}
                      required
                    >
                      {districts.map((district) => (
                        <MenuItem key={district.id} value={district.id.toString()}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Card>

              {/* Fotoğraflar Kartı */}
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhotoCamera color="primary" />
                  Fotoğraflar
                </Typography>
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Fotoğraf Yükleme */}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Fotoğraf Ekle
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </Button>

                  {/* Yüklenen Fotoğraflar */}
                  {formData.photos.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Yüklenen Fotoğraflar ({formData.photos.length})
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {formData.photos.map((photo, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: "relative",
                              width: 120,
                              height: 120,
                              border: "2px solid",
                              borderColor:
                                formData.showcasePhoto === photo
                                  ? "primary.main"
                                  : "grey.300",
                              borderRadius: 1,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Fotoğraf ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            {formData.showcasePhoto === photo && (
                              <Chip
                                label="Vitrin"
                                size="small"
                                color="primary"
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  fontSize: "0.7rem",
                                }}
                              />
                            )}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleSetShowcasePhoto(photo)}
                                sx={{
                                  backgroundColor: "rgba(255,255,255,0.8)",
                                  "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                  },
                                }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleRemovePhoto(photo)}
                                sx={{
                                  backgroundColor: "rgba(255,255,255,0.8)",
                                  "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.9)",
                                  },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>

              {/* İletişim ve Fiyat Kartı */}
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney color="primary" />
                  İletişim ve Fiyat Bilgileri
                </Typography>
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {/* Satıcı Adı */}
                    <TextField
                      label="Satıcı Adı"
                      value={formData.sellerName}
                      onChange={(e) => handleInputChange("sellerName", e.target.value)}
                      sx={{ minWidth: 200 }}
                      required
                    />

                    {/* Telefon */}
                    <TextField
                      label="Telefon"
                      value={formData.sellerPhone}
                      onChange={(e) => handleInputChange("sellerPhone", e.target.value)}
                      sx={{ minWidth: 200 }}
                      required
                    />

                    {/* E-posta */}
                    <TextField
                      label="E-posta"
                      type="email"
                      value={formData.sellerEmail}
                      onChange={(e) => handleInputChange("sellerEmail", e.target.value)}
                      sx={{ minWidth: 200 }}
                      required
                    />
                  </Box>

                  {/* Fiyat */}
                  <TextField
                    label="Fiyat (TL)"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Örn: 200000"
                    sx={{ maxWidth: 200 }}
                    required
                  />
                </Box>
              </Card>

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "center", pt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
                </Button>
              </Box>
            </Box>
          </form>
        </Card>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle>Başarılı!</DialogTitle>
          <DialogContent>
            <Alert severity="success">
              İlanınız başarıyla oluşturuldu. Onaylandıktan sonra yayınlanacaktır.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuccessClose} variant="contained">
              Anasayfaya Dön
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default TarimTankerForm;