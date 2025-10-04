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
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  Delete as DeleteIcon,
  PlayArrow,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
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

interface TankerFormData {
  title: string;
  description: string;
  year: number;
  productionYear: number;
  price: string;

  // Brand/Model/Variant IDs
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;

  // Tanker Özel Bilgileri
  hacim: string; // text input
  gozSayisi: string;
  lastikDurumu: string;
  renk: string;
  takasli: string;

  // Konum
  cityId: string;
  districtId: string;
  city: string;
  district: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // Videolar
  videos: File[];

  // Seller bilgileri
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;

  // Ekstra
  warranty: boolean;
  negotiable: boolean;
  exchange: boolean;

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
  const user = useSelector((state: RootState) => state.auth.user);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Video states
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-load category ID - Dorse category ID (integer)
  // Price formatting functions
  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    return new Intl.NumberFormat("tr-TR").format(parseInt(numbers));
  };

  const handlePriceChange = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, price: numbers }));
  };

  const [formData, setFormData] = useState<TankerFormData>({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    productionYear: new Date().getFullYear(),
    price: "",

    // Brand/Model/Variant IDs
    categoryId: "6", // Dorse category ID
    brandId: "",
    modelId: "",
    variantId: "",

    // Tanker Özel Bilgileri
    hacim: "",
    gozSayisi: "1",
    lastikDurumu: "100",
    renk: "",
    takasli: "Hayır",

    // Konum
    cityId: "",
    districtId: "",
    city: "",
    district: "",

    // Fotoğraflar
    photos: [],
    showcasePhoto: null,

    // Videolar
    videos: [],

    // Seller bilgileri (auto-filled from user)
    sellerName: user?.email || "",
    sellerPhone: user?.phone || "",
    sellerEmail: user?.email || "",

    // Ekstra
    warranty: false,
    negotiable: false,
    exchange: false,

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

          // Update district name when districts load
          const selectedDistrict = (response.data as District[]).find(
            (d: District) => d.id.toString() === formData.districtId
          );
          if (selectedDistrict) {
            setFormData((prev) => ({
              ...prev,
              district: selectedDistrict.name,
            }));
          }
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.cityId, formData.districtId]);

  const handleInputChange = (
    field: keyof TankerFormData,
    value: string | number | File[] | File | null | boolean
  ) => {
    if (field === "year" || field === "hacim" || field === "lastikDurumu") {
      const numValue =
        field === "year" || field === "hacim" || field === "lastikDurumu"
          ? parseInt(value as string) || 0
          : value;
      setFormData((prev) => ({
        ...prev,
        [field]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Video upload handling
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const videoFiles = Array.from(files);

      // Check file size (50MB limit per video)
      const maxSize = 50 * 1024 * 1024; // 50MB
      const oversizedFiles = videoFiles.filter((file) => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        alert(
          `Şu dosyalar çok büyük (max 50MB): ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }

      // Check total video count (max 3)
      if (formData.videos.length + videoFiles.length > 3) {
        alert("En fazla 3 video yükleyebilirsiniz.");
        return;
      }

      videoFiles.forEach((file) => {
        const videoUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          videos: [...prev.videos, file],
        }));
        setVideoPreviews((prev) => [...prev, videoUrl]);
      });
    }
  };

  const removeVideo = (index: number) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, videos: newVideos }));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openVideoModal = (index: number) => {
    setCurrentVideoIndex(index);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
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

  const handleSubmit = async () => {
    console.log("🚀 TankerForm handleSubmit başladı");
    console.log("📝 Form Data:", formData);
    setLoading(true);
    try {
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("year", formData.year.toString());
      submitData.append("price", formData.price);

      // Dorse kategorisi - Tanker markası
      submitData.append("categoryId", "6"); // Dorse category ID
      submitData.append("brandName", "Tanker");
      submitData.append("brandSlug", "tanker");
      submitData.append("modelName", "Tanker Model");
      submitData.append("modelSlug", "tanker-model");
      submitData.append("variantName", "Tanker");
      submitData.append("variantSlug", "tanker");

      // Tanker özel bilgileri
      submitData.append("hacim", formData.hacim.toString());
      submitData.append("gozSayisi", formData.gozSayisi);
      submitData.append("lastikDurumu", formData.lastikDurumu.toString());
      submitData.append("renk", formData.renk);
      submitData.append("takasli", formData.takasli);

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);
      submitData.append("city", formData.city || "");
      submitData.append("district", formData.district || "");

      // Seller bilgileri
      if (formData.sellerName)
        submitData.append("seller_name", formData.sellerName);
      if (formData.sellerPhone)
        submitData.append("seller_phone", formData.sellerPhone);
      if (formData.sellerEmail)
        submitData.append("seller_email", formData.sellerEmail);

      // Ekstra
      submitData.append("warranty", formData.warranty ? "evet" : "hayir");
      submitData.append("negotiable", formData.negotiable ? "evet" : "hayir");
      submitData.append("exchange", formData.exchange ? "evet" : "hayir");

      // Detaylı bilgiyi teknik özelliklerle birleştir
      let detailedDescription = formData.detailedInfo;

      // Tanker teknik özellikler eklentisi
      const technicalSpecs = [];
      if (formData.hacim) technicalSpecs.push(`Hacim: ${formData.hacim}L`);
      if (formData.gozSayisi)
        technicalSpecs.push(`Göz Sayısı: ${formData.gozSayisi}`);
      if (formData.lastikDurumu)
        technicalSpecs.push(`Lastik Durumu: ${formData.lastikDurumu}%`);
      if (formData.renk) technicalSpecs.push(`Renk: ${formData.renk}`);
      if (formData.takasli) technicalSpecs.push(`Takaslı: ${formData.takasli}`);

      if (technicalSpecs.length > 0) {
        const techSpecsText =
          "\n\n--- Teknik Özellikler ---\n" + technicalSpecs.join("\n");
        detailedDescription = detailedDescription
          ? detailedDescription + techSpecsText
          : techSpecsText;
      }

      submitData.append("detailedInfo", detailedDescription);

      // Fotoğrafları ekle - showcasePhoto ve photo_ formatında
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      console.log(
        `📷 ${
          formData.photos.length + (formData.showcasePhoto ? 1 : 0)
        } fotoğraf gönderiliyor`
      );

      // Video dosyalarını ekle
      if (formData.videos && formData.videos.length > 0) {
        console.log(
          `🎥 Adding ${formData.videos.length} videos to submit data`
        );
        formData.videos.forEach((video, index) => {
          submitData.append(`video_${index}`, video);
          console.log(`✅ Video ${index + 1} added:`, {
            name: video.name,
            size: video.size,
            type: video.type,
          });
        });
      } else {
        console.log("ℹ️ No videos to add");
      }

      const response = await apiClient.post("/ads/dorse", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = response.data as {
        success?: boolean;
        id?: string;
        adId?: string;
        message?: string;
      };

      // Backend'den başarılı yanıt geldi (200 status code)
      console.log("✅ Tanker form submission successful!");

      // İlan ID'sini kaydet (id veya adId field'ından)
      const adId = responseData.id || responseData.adId;
      if (adId) {
        setCreatedAdId(adId);
      }

      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("İlan oluşturulurken hata:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        err.response?.data?.message ||
          err.message ||
          "İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  // Modal handler fonksiyonları
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleViewAd = () => {
    if (createdAdId) {
      navigate(`/ads/${createdAdId}`);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleMyAds = () => {
    navigate("/my-ads");
  };

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Tanker Dorse İlanı Ver
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Temel Bilgiler */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Temel Bilgiler
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
                  label="Fiyat (TL) *"
                  value={formatPrice(formData.price)}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">TL</InputAdornment>
                    ),
                  }}
                  placeholder="150.000"
                  required
                />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Tanker Özellikleri */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Tanker Özellikleri
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  label="Hacim *"
                  value={formData.hacim}
                  onChange={(e) => handleInputChange("hacim", e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">m³</InputAdornment>
                    ),
                  }}
                  placeholder="Örn: 25 m³"
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
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Konum Bilgileri
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
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Ek Seçenekler
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

            {/* Fotoğraflar */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Fotoğraflar
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {/* Vitrin Fotoğrafı */}
                <Card variant="outlined" sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Vitrin Fotoğrafı *
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Ana fotoğraf olarak kullanılacak
                  </Typography>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="showcase-photo"
                    type="file"
                    onChange={(e) => handlePhotoUpload(e, true)}
                  />
                  <label htmlFor="showcase-photo">
                    <Button variant="outlined" component="span" fullWidth>
                      Fotoğraf Seç
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
                <Card variant="outlined" sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Diğer Fotoğraflar ({formData.photos.length}/15)
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Ek fotoğraflar ekleyin
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
                    <Button variant="outlined" component="span" fullWidth>
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
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Videolar */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Videolar (Opsiyonel)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                En fazla 3 video (maksimum 50MB)
              </Typography>

              <input
                type="file"
                accept="video/*"
                multiple
                id="video-upload"
                style={{ display: "none" }}
                onChange={handleVideoUpload}
              />
              <label htmlFor="video-upload">
                <Button
                  component="span"
                  variant="outlined"
                  disabled={formData.videos.length >= 3}
                >
                  Video Ekle ({formData.videos.length}/3)
                </Button>
              </label>

              {videoPreviews.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 2,
                    mt: 3,
                  }}
                >
                  {videoPreviews.map((videoUrl, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                      <video
                        src={videoUrl}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                        }}
                        controls={false}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => openVideoModal(index)}
                      >
                        <PlayArrow sx={{ fontSize: 48, color: "white" }} />
                      </Box>
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "rgba(255,255,255,0.9)",
                          "&:hover": { background: "rgba(255,255,255,1)" },
                        }}
                        size="small"
                        onClick={() => removeVideo(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          background: "rgba(0,0,0,0.7)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: 12,
                        }}
                      >
                        Video {index + 1}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

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
              >
                {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={showSuccessModal} onClose={handleCloseSuccessModal}>
          <DialogTitle sx={{ textAlign: "center", pb: 2 }}>
            <CheckCircle sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography
              variant="h4"
              sx={{ color: "success.main", fontWeight: "bold" }}
            >
              Başarılı!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", pb: 1 }}>
            <Typography variant="h6" gutterBottom>
              İlan Başarıyla Oluşturuldu!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tanker dorse ilanınız başarıyla oluşturuldu ve yönetici onayı
              bekliyor. Onaylandıktan sonra yayınlanacaktır.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", gap: 2, p: 3 }}>
            <Button
              onClick={handleGoHome}
              variant="outlined"
              size="large"
              sx={{ minWidth: 120 }}
            >
              Ana Sayfa
            </Button>
            {createdAdId && (
              <Button
                onClick={handleViewAd}
                variant="contained"
                size="large"
                sx={{ minWidth: 120 }}
              >
                İlanı Görüntüle
              </Button>
            )}
            <Button
              onClick={handleMyAds}
              variant="contained"
              size="large"
              color="secondary"
              sx={{ minWidth: 120 }}
            >
              İlanlarım
            </Button>
          </DialogActions>
        </Dialog>

        {/* Video Preview Modal */}
        <Dialog
          open={videoModalOpen}
          onClose={closeVideoModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Video Önizleme</Typography>
            <IconButton onClick={closeVideoModal}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {videoPreviews[currentVideoIndex] && (
              <video
                src={videoPreviews[currentVideoIndex]}
                controls
                autoPlay
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "70vh",
                  backgroundColor: "black",
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Error Display */}
        {error && (
          <Dialog open={!!error} onClose={() => setError(null)}>
            <DialogTitle sx={{ color: "error.main" }}>Hata</DialogTitle>
            <DialogContent>
              <Typography>{error}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setError(null)} variant="contained">
                Tamam
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </>
  );
};

export default TankerForm;
