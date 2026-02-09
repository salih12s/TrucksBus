import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Modal,
  Backdrop,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import { PhotoCamera, CheckCircle } from "@mui/icons-material";
import Header from "../../layout/Header";
import apiClient from "../../../api/client";

// Types
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
  hasDamper: boolean;
  isExchangeable: string;

  // Modern fotoğraf yapısı
  showcasePhoto: File | null;
  photos: File[];

  // İletişim ve fiyat bilgileri
  price: string;
  currency: string;
  priceType: string;
  cityId: string;
  districtId: string;
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
}

interface RootState {
  auth: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
    } | null;
  };
}

const SeyehatRomorkForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  // Seçilen marka, model, varyant bilgileri location.state'den gelir
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string>("");
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    hasDamper: false,
    isExchangeable: "Hayır",
    showcasePhoto: null,
    photos: [],
    price: "",
    currency: "TRY",
    priceType: "Sabit",
    cityId: "",
    districtId: "",
    sellerPhone: user?.phone || "",
    sellerName: user?.name || "",
    sellerEmail: user?.email || "",
  });

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/ads/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Şehirler yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.cityId) {
        setDistricts([]);
        return;
      }

      try {
        const response = await apiClient.get(
          `/ads/cities/${formData.cityId}/districts`,
        );
        setDistricts(response.data as District[]);
      } catch (error) {
        console.error("İlçeler yüklenirken hata oluştu:", error);
      }
    };

    fetchDistricts();
  }, [formData.cityId]);

  // Modern utility fonksiyonları
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 30; year--) {
      years.push(year);
    }
    return years;
  };

  const formatNumber = (value: string): string => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\./g, "");
  };

  // Input change handlers
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCityChange = (cityId: string) => {
    setFormData((prev) => ({
      ...prev,
      cityId,
      districtId: "", // İlçe seçimini sıfırla
    }));
  };

  // Modern fotoğraf yönetimi
  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (isShowcase) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, showcasePhoto: file }));
      setShowcasePreview(URL.createObjectURL(file));
    } else {
      const currentPhotoCount = formData.photos.length;
      const availableSlots = 15 - currentPhotoCount;
      const filesToAdd = files.slice(0, availableSlots);

      if (files.length > availableSlots) {
        alert(`En fazla ${availableSlots} fotoğraf daha ekleyebilirsiniz.`);
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...filesToAdd],
      }));

      const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.showcasePhoto
    ) {
      alert("Lütfen zorunlu alanları doldurun ve vitrin fotoğrafı ekleyin!");
      return;
    }

    try {
      setSubmitLoading(true);

      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("hasDamper", formData.hasDamper.toString());
      submitData.append("isExchangeable", formData.isExchangeable);

      // Marka, model, varyant bilgileri
      if (selectedBrand) {
        submitData.append("brandId", selectedBrand.id);
        submitData.append("brandName", selectedBrand.name);
      }
      if (selectedModel) {
        submitData.append("modelId", selectedModel.id);
        submitData.append("modelName", selectedModel.name);
      }
      if (selectedVariant) {
        submitData.append("variantId", selectedVariant.id);
        submitData.append("variantName", selectedVariant.name);
      }

      // Kategori bilgisi
      submitData.append("category", "TasimaRomorklari");
      submitData.append("subType", "Seyehat");

      // Fiyat ve iletişim bilgileri
      submitData.append("price", parseFormattedNumber(formData.price));
      submitData.append("currency", formData.currency || "TRY");
      submitData.append("priceType", formData.priceType);
      submitData.append("sellerName", formData.sellerName);
      submitData.append("sellerPhone", formData.sellerPhone);
      submitData.append("sellerEmail", formData.sellerEmail);
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Fotoğraflar - modern yapı
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((file) => {
        submitData.append("photos", file);
      });

      const response = await apiClient.post("/ads/tasima-romork", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("İlan yayınlanırken hata oluştu:", error);
      alert("İlan yayınlanırken hata oluştu!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  return (
    <>
      <Header />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              Seyehat Römorku İlanı Ver
            </Typography>

            {selectedBrand && selectedModel && (
              <Box sx={{ mb: 3, p: 2, bgcolor: "primary.50", borderRadius: 1 }}>
                <Typography variant="subtitle1" color="primary.main">
                  <strong>
                    {selectedBrand.name} {selectedModel.name}{" "}
                    {selectedVariant?.name || ""}
                  </strong>{" "}
                  için ilan oluşturuyorsunuz
                </Typography>
              </Box>
            )}

            {/* Temel Bilgiler */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                İlan Detayları
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  fullWidth
                  label="İlan Başlığı *"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Seyehat römorku"
                />

                <TextField
                  fullWidth
                  label="Açıklama *"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  multiline
                  rows={4}
                  placeholder="Seyehat römorkunuz hakkında detaylı bilgi verin"
                />

                <FormControl fullWidth>
                  <InputLabel>Üretim Yılı *</InputLabel>
                  <Select
                    value={formData.productionYear}
                    onChange={(e) =>
                      handleInputChange("productionYear", e.target.value)
                    }
                    label="Üretim Yılı *"
                  >
                    {generateYearOptions().map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.hasDamper}
                      onChange={(e) =>
                        handleInputChange("hasDamper", e.target.checked)
                      }
                    />
                  }
                  label="Damperi Var"
                />

                <FormControl fullWidth>
                  <InputLabel>Takas</InputLabel>
                  <Select
                    value={formData.isExchangeable}
                    onChange={(e) =>
                      handleInputChange("isExchangeable", e.target.value)
                    }
                    label="Takas"
                  >
                    <MenuItem value="Evet">Evet</MenuItem>
                    <MenuItem value="Hayır">Hayır</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Fotoğraf Bölümü */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                Fotoğraflar
              </Typography>

              {/* Vitrin Fotoğrafı */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
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
                  Ana fotoğraf ilanınızın vitrininde görünecektir
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
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{
                      ...(formData.showcasePhoto && {
                        borderColor: "success.main",
                        color: "success.main",
                      }),
                    }}
                  >
                    {formData.showcasePhoto
                      ? "Vitrin Fotoğrafını Değiştir"
                      : "Vitrin Fotoğrafı Seç"}
                  </Button>
                </label>

                {(formData.showcasePhoto || showcasePreview) && (
                  <Box
                    sx={{
                      mt: 3,
                      position: "relative",
                      width: "200px",
                      height: "150px",
                      border: "2px solid",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 3,
                    }}
                  >
                    <img
                      src={
                        showcasePreview ||
                        (formData.showcasePhoto
                          ? URL.createObjectURL(formData.showcasePhoto)
                          : "")
                      }
                      alt="Vitrin Fotoğrafı"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Chip
                      label="VİTRİN"
                      color="primary"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Diğer Fotoğraflar */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📷 Diğer Fotoğraflar
                  <Chip label="İsteğe Bağlı" color="info" size="small" />
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Aracınızın farklı açılardan fotoğraflarını ekleyin (En fazla
                  15 adet)
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
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    disabled={formData.photos.length >= 15}
                  >
                    Fotoğraf Ekle ({formData.photos.length}/15)
                  </Button>
                </label>

                {formData.photos.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      Yüklenen Fotoğraflar ({formData.photos.length}/15)
                    </Typography>

                    {/* Fotoğraf önizlemeleri grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(120px, 1fr))",
                        gap: 2,
                        maxHeight: "300px",
                        overflowY: "auto",
                        p: 1,
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                      }}
                    >
                      {formData.photos.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            width: "100%",
                            paddingTop: "75%", // 4:3 Aspect Ratio
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: 1,
                          }}
                        >
                          <img
                            src={
                              photoPreviews[index] || URL.createObjectURL(file)
                            }
                            alt={`Fotoğraf ${index + 1}`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />

                          <Box
                            onClick={() => removePhoto(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              "&:hover": {
                                background: "#ff1744",
                                color: "white",
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: "bold",
                                lineHeight: 1,
                              }}
                            >
                              ✕
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "rgba(0,0,0,0.7)",
                              color: "white",
                              textAlign: "center",
                              py: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              {index + 1}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* İletişim ve Fiyat Bilgileri */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                İletişim ve Fiyat Bilgileri
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>İl *</InputLabel>
                    <Select
                      value={formData.cityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      label="İl *"
                      disabled={loading}
                      required
                    >
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>🏙️</span> {city.plateCode} - {city.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>İlçe *</InputLabel>
                    <Select
                      value={formData.districtId}
                      onChange={(e) =>
                        handleInputChange("districtId", e.target.value)
                      }
                      label="İlçe *"
                      disabled={!formData.cityId}
                      required
                    >
                      {loading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} />
                          &nbsp; İlçeler yükleniyor...
                        </MenuItem>
                      ) : districts.length === 0 ? (
                        <MenuItem disabled>
                          {formData.cityId
                            ? "İlçe bulunamadı"
                            : "Önce il seçin"}
                        </MenuItem>
                      ) : (
                        districts.map((district) => (
                          <MenuItem key={district.id} value={district.id}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <span>🏘️</span> {district.name}
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>

                <TextField
                  fullWidth
                  label="Fiyat *"
                  value={formatNumber(formData.price)}
                  onChange={(e) =>
                    handleInputChange(
                      "price",
                      parseFormattedNumber(e.target.value),
                    )
                  }
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
                          <ToggleButton value="TRY">₺ TL</ToggleButton>
                          <ToggleButton value="USD">$ USD</ToggleButton>
                          <ToggleButton value="EUR">€ EUR</ToggleButton>
                        </ToggleButtonGroup>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Fiyat Tipi</InputLabel>
                  <Select
                    value={formData.priceType}
                    onChange={(e) =>
                      handleInputChange("priceType", e.target.value)
                    }
                    label="Fiyat Tipi"
                  >
                    <MenuItem value="Sabit">Sabit Fiyat</MenuItem>
                    <MenuItem value="Pazarlık">Pazarlığa Açık</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitLoading}
                startIcon={
                  submitLoading ? <CircularProgress size={20} /> : null
                }
                sx={{ minWidth: 200 }}
              >
                {submitLoading ? "Yayınlanıyor..." : "İlanı Yayınla"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Success Modal */}
        <Modal
          open={showSuccessModal}
          onClose={handleCloseSuccessModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={showSuccessModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                textAlign: "center",
              }}
            >
              <CheckCircle
                sx={{ fontSize: 64, color: "success.main", mb: 2 }}
              />
              <Typography variant="h5" component="h2" gutterBottom>
                Başarılı!
              </Typography>
              <Typography sx={{ mb: 3 }}>
                İlanınız başarıyla yayınlandı ve onay için gönderildi.
              </Typography>
              <Button
                variant="contained"
                onClick={handleCloseSuccessModal}
                fullWidth
              >
                Ana Sayfaya Dön
              </Button>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </>
  );
};

export default SeyehatRomorkForm;
