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
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  PhotoCamera,
  Videocam,
  Delete as DeleteIcon,
  PlayArrow,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
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

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  name: string;
  slug: string;
  brandId: number;
}

interface Variant {
  id: number;
  name: string;
  slug: string;
  modelId: number;
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
  hacim: string;
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
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();
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

  // Brand/Model/Variant states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-load category ID - Dorse category ID (integer)
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

  // Auto-load brands
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await apiClient.get("/brands?categoryId=6"); // Dorse category ID
        setBrands((response.data as Brand[]) || []);
      } catch (error) {
        console.error("Error loading brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

  // Load brand by slug from URL params
  useEffect(() => {
    if (brandSlug && brands.length > 0) {
      const selectedBrand = brands.find((b) => b.slug === brandSlug);
      if (selectedBrand) {
        setFormData((prev) => ({
          ...prev,
          brandId: selectedBrand.id.toString(),
          modelId: "", // Reset model when brand changes
          variantId: "", // Reset variant when brand changes
        }));
      }
    }
  }, [brandSlug, brands]);

  // Load models when brand changes
  useEffect(() => {
    if (formData.brandId) {
      const loadModels = async () => {
        try {
          setLoadingModels(true);
          const response = await apiClient.get(
            `/brands/${formData.brandId}/models`
          );
          setModels((response.data as Model[]) || []);
        } catch (error) {
          console.error("Error loading models:", error);
        } finally {
          setLoadingModels(false);
        }
      };

      loadModels();
    } else {
      setModels([]);
      setFormData((prev) => ({ ...prev, modelId: "", variantId: "" }));
    }
  }, [formData.brandId]);

  // Load model by slug from URL params
  useEffect(() => {
    if (modelSlug && models.length > 0) {
      const selectedModel = models.find((m) => m.slug === modelSlug);
      if (selectedModel) {
        setFormData((prev) => ({
          ...prev,
          modelId: selectedModel.id.toString(),
          variantId: "", // Reset variant when model changes
        }));
      }
    }
  }, [modelSlug, models]);

  // Load variants when model changes
  useEffect(() => {
    if (formData.modelId) {
      const loadVariants = async () => {
        try {
          setLoadingVariants(true);
          const response = await apiClient.get(
            `/models/${formData.modelId}/variants`
          );
          setVariants((response.data as Variant[]) || []);
        } catch (error) {
          console.error("Error loading variants:", error);
        } finally {
          setLoadingVariants(false);
        }
      };

      loadVariants();
    } else {
      setVariants([]);
      setFormData((prev) => ({ ...prev, variantId: "" }));
    }
  }, [formData.modelId]);

  // Load variant by slug from URL params
  useEffect(() => {
    if (variantSlug && variants.length > 0) {
      const selectedVariant = variants.find((v) => v.slug === variantSlug);
      if (selectedVariant) {
        setFormData((prev) => ({
          ...prev,
          variantId: selectedVariant.id.toString(),
        }));
      }
    }
  }, [variantSlug, variants]);

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

  // Parse formatted number for submission
  const parseFormattedNumber = (formatted: string) => {
    return formatted.replace(/[^\d]/g, "");
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
      submitData.append("productionYear", formData.year.toString());

      // Brand/Model/Variant bilgileri
      if (formData.categoryId) {
        submitData.append("categoryId", formData.categoryId);
        console.log("✅ CategoryId added:", formData.categoryId);
      }
      if (formData.brandId) {
        submitData.append("brandId", formData.brandId);
        console.log("✅ BrandId added:", formData.brandId);
      }
      if (formData.modelId) {
        submitData.append("modelId", formData.modelId);
        console.log("✅ ModelId added:", formData.modelId);
      }
      if (formData.variantId) {
        submitData.append("variantId", formData.variantId);
        console.log("✅ VariantId added:", formData.variantId);
      }

      // Fiyatı parse ederek ekle
      const parsedPrice = parseFormattedNumber(formData.price);
      if (parsedPrice) {
        submitData.append("price", parsedPrice);
      }

      submitData.append("category", "dorse");
      submitData.append("subcategory", "tanker");

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

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

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

      const response = await apiClient.post("/listings", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Tanker Dorse ilanı başarıyla oluşturuldu:", response.data);

      // İlan ID'sini kaydet ve başarı modal'ını göster
      const responseData = response.data as { id?: string; success?: boolean };
      if (responseData && responseData.id) {
        setCreatedAdId(responseData.id);
        setShowSuccessModal(true);
      } else {
        setShowSuccessModal(true);
      }
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Temel Bilgiler */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📋 Temel Bilgiler
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              {/* Brand/Model/Variant Selection */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 2,
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Marka</InputLabel>
                  <Select
                    value={formData.brandId}
                    label="Marka"
                    onChange={(e) =>
                      handleInputChange("brandId", e.target.value)
                    }
                    disabled={loadingBrands || !!brandSlug}
                  >
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required disabled={!formData.brandId}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={formData.modelId}
                    label="Model"
                    onChange={(e) =>
                      handleInputChange("modelId", e.target.value)
                    }
                    disabled={loadingModels || !!modelSlug}
                  >
                    {models.map((model) => (
                      <MenuItem key={model.id} value={model.id.toString()}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!formData.modelId}>
                  <InputLabel>Variant</InputLabel>
                  <Select
                    value={formData.variantId}
                    label="Variant"
                    onChange={(e) =>
                      handleInputChange("variantId", e.target.value)
                    }
                    disabled={loadingVariants || !!variantSlug}
                  >
                    {variants.map((variant) => (
                      <MenuItem key={variant.id} value={variant.id.toString()}>
                        {variant.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

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

            <Divider sx={{ my: 4 }} />

            {/* 🎥 Videolar */}
            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)",
                      borderRadius: 3,
                      p: 2,
                      mb: 3,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Videocam sx={{ color: "white", fontSize: 28 }} />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          lineHeight: 1.2,
                        }}
                      >
                        Videolar
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Tanker dorsenizi videoyla tanıtın (En fazla 3 video,
                    maksimum 50MB)
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
                      variant="contained"
                      startIcon={<Videocam />}
                      disabled={formData.videos.length >= 3}
                      sx={{
                        background:
                          "linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #e55a2b 30%, #e8891e 90%)",
                        },
                      }}
                    >
                      Video Ekle ({formData.videos.length}/3)
                    </Button>
                  </label>

                  {videoPreviews.length > 0 && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
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
        <Dialog open={showSuccessModal} onClose={handleCloseSuccessModal}>
          <DialogTitle sx={{ textAlign: "center", pb: 2 }}>
            <CheckCircle sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography
              variant="h4"
              sx={{ color: "success.main", fontWeight: "bold" }}
            >
              🎉 Başarılı!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", pb: 1 }}>
            <Typography variant="h6" gutterBottom>
              Tanker Dorse ilanınız başarıyla oluşturuldu!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              İlanınız admin onayından sonra yayınlanacaktır.
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
                sx={{
                  minWidth: 120,
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                }}
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
