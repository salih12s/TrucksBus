import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Card,
  CardContent,
  Modal,
  Backdrop,
  Fade,
  Chip,
} from "@mui/material";
import { PhotoCamera, CheckCircle } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import apiClient from "../../../api/client";
import Header from "../../layout/Header";

// Types
interface City {
  id: string;
  name: string;
  plateCode: string;
}

interface District {
  id: string;
  name: string;
  cityId: string;
}

interface FormData {
  // Temel bilgiler
  title: string;
  description: string;
  productionYear: string;
  hasDamper: boolean;
  isExchangeable: string;

  // Fotoğraf bilgileri
  showcasePhoto: File | null;
  photos: File[];

  // İletişim ve fiyat bilgileri
  price: string;
  priceType: string;
  currency: string;
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
  cityId: string;
  districtId: string;
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

const HayvanRomorkForm: React.FC = () => {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fotoğraf önizlemeleri için state'ler
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Sayı formatlama fonksiyonları
  const formatNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    return new Intl.NumberFormat("tr-TR").format(parseInt(numbers));
  };

  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\D/g, "");
  };

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    hasDamper: false,
    isExchangeable: "Hayır",
    showcasePhoto: null,
    photos: [],
    price: "",
    priceType: "Sabit",
    currency: "TRY",
    sellerPhone: user?.phone || "",
    sellerName: user?.name || "",
    sellerEmail: user?.email || "",
    cityId: "",
    districtId: "",
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
  const handleCityChange = async (cityId: string) => {
    setFormData((prev) => ({ ...prev, cityId, districtId: "" }));
    setDistricts([]);

    if (cityId) {
      try {
        setLoading(true);
        const response = await apiClient.get(`/ads/cities/${cityId}/districts`);
        setDistricts(response.data as District[]);
      } catch (error) {
        console.error("İlçeler yüklenirken hata:", error);
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load user data
  useEffect(() => {
    if (user && cities.length > 0) {
      setFormData((prev) => ({
        ...prev,
        sellerName: user.name || "",
        sellerPhone: user.phone || "",
        sellerEmail: user.email,
      }));
    }
  }, [user, cities]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Modern fotoğraf yönetimi
  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (isShowcase) {
      setFormData((prev) => ({
        ...prev,
        showcasePhoto: file,
      }));

      // Önizleme için URL oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setShowcasePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Diğer fotoğraflar için
      const newFiles = Array.from(files);
      const totalFiles = formData.photos.length + newFiles.length;

      if (totalFiles > 15) {
        alert("En fazla 15 fotoğraf yükleyebilirsiniz.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newFiles],
      }));

      // Önizlemeler için URL'ler oluştur
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    // Input'u sıfırla
    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));

    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 30; year--) {
      years.push(year.toString());
    }
    return years;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    if (!formData.showcasePhoto) {
      alert("Lütfen en az bir vitrin fotoğrafı yükleyin.");
      return;
    }

    // City/District validation
    if (!formData.cityId || !formData.districtId) {
      alert("Lütfen şehir ve ilçe seçimi yapınız.");
      return;
    }

    const selectedCity = cities.find((city) => city.id === formData.cityId);
    const selectedDistrict = districts.find(
      (district) => district.id === formData.districtId
    );

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
      submitData.append("subType", "Hayvan");

      // Fiyat ve iletişim bilgileri
      submitData.append("price", formData.price);
      submitData.append("priceType", formData.priceType);
      submitData.append("currency", formData.currency);
      submitData.append("sellerName", formData.sellerName);
      submitData.append("sellerPhone", formData.sellerPhone);
      submitData.append("sellerEmail", formData.sellerEmail);

      // Şehir ve ilçe bilgileri
      if (selectedCity) {
        submitData.append("cityId", selectedCity.id);
        submitData.append("cityName", selectedCity.name);
      }
      if (selectedDistrict) {
        submitData.append("districtId", selectedDistrict.id);
        submitData.append("districtName", selectedDistrict.name);
      }

      // Vitrin fotoğrafı
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      // Diğer fotoğraflar
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
      alert("İlan yayınlanırken hata oluştu");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              Hayvan Römorku İlanı Ver
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
                  placeholder="Hayvan römorku"
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
                  placeholder="Hayvan römorkunuz hakkında detaylı bilgi verin"
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
                      parseFormattedNumber(e.target.value)
                    )
                  }
                  InputProps={{
                    endAdornment: <Typography>₺</Typography>,
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

export default HayvanRomorkForm;
