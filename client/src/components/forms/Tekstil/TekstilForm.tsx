import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Autocomplete,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  ArrowForward,
  ArrowBack,
  CloudUpload,
  Close,
  Person,
  LocationOn,
  AttachMoney,
  LocalLaundryService,
  DateRange,
} from "@mui/icons-material";
import apiClient from "../../../api/client";
import SuccessModal from "../../common/SuccessModal";

// Tekstil Dorse Markaları (MainLayout'tan alındı)
const TEKSTIL_BRANDS = [
  "Seçiniz",
  "Abd Treyler",
  "Adem Usta Proohauss",
  "Akar Cihat",
  "Akmanlar Damper",
  "Alamen",
  "Alp-Kar",
  "Alpsan",
  "Ariş Dorse",
  "ART Trailer",
  "Askan Treyler",
  "ASY Treyler",
  "Bio Treyler",
  "BRF Treyler",
  "Can Damper Karoser",
  "Cangüller Treyler",
  "Caselli",
  "CastroMax Trailers",
  "Çavdaroğlu",
  "Doruk Treyler",
  "Esatech Trailer",
  "Fruehauf",
  "Global City",
  "Gülistan",
  "Iskar Treyler",
  "İkon Treyler",
  "Kalkan Treyler",
  "Karaoğlan",
  "Kögel Trailer",
  "Krone",
  "Marrka Treyler",
  "MAS Trailer",
  "Mehsan Treyler",
  "Mobil Treyler",
  "MRC Treyler",
  "MS Muratsan Treyler",
  "Nedex",
  "Nükte Trailer",
  "Oktar Treyler",
  "Optimak Treyler",
  "Ormanlı Treyler",
  "Orthaus Treyler",
  "Oymak Cargomaster",
  "Oymak Träger",
  "Öztfn Treyler",
  "Paşalar Mehmet Treyler",
  "Paşaoğlu Dorse Treyler",
  "Ram-Kar",
  "Reis Treyler",
  "Sancak Treyler",
  "Schmitz",
  "Seçsan Treyler",
  "Semitürk",
  "Sena Treyler",
  "Serin Treyler",
  "Serra Treyler",
  "Set Treyler",
  "Seyit Usta",
  "Simbоxx",
  "Sim Treyler",
  "Sistem Damper Treyler",
  "Star Yağcılar",
  "Takdir Dorse",
  "Talson",
  "Tanı Tır",
  "Tırsan",
  "Traco",
  "Transfer Treyler",
  "Transfrigo Kasa",
  "Warkas",
  "Wielton",
  "Yelsan Treyler",
  "Yıldızlar Damper",
  "Zafer",
  "Zafer Dorse",
  "Özel Üretim",
  "Diğer",
];

interface TekstilFormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  currency: string;
  year: number;
  dorseBrand: string;

  // Tekstil Özel Bilgiler
  takasli: string; // "Evet" veya "Hayır"

  // Brand/Model/Variant
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;

  // Konum
  cityId: string;
  districtId: string;

  // Ekstra
  warranty: boolean;
  negotiable: boolean;
  exchange: boolean;

  // Video
  videos: File[];
}

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
}

interface Model {
  id: number;
  name: string;
  brandId: number;
}

interface Variant {
  id: number;
  name: string;
  modelId: number;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const TekstilForm: React.FC = () => {
  const navigate = useNavigate();
  const { variantSlug, modelSlug, brandSlug } = useParams<{
    variantSlug?: string;
    modelSlug?: string;
    brandSlug?: string;
  }>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showcaseImageIndex, setShowcaseImageIndex] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  // Video states
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [formData, setFormData] = useState<TekstilFormData>({
    title: "",
    description: "",
    price: "",
    currency: "TRY",
    year: new Date().getFullYear(),
    dorseBrand: "Seçiniz",
    takasli: "Hayır",
    categoryId: "",
    brandId: "",
    modelId: "",
    variantId: "",
    cityId: "",
    districtId: "",
    warranty: false,
    negotiable: false,
    exchange: false,
    videos: [],
  });

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        sellerName: `${user.firstName} ${user.lastName}`,
        sellerPhone: user.phone || "",
        sellerEmail: user.email || "",
        cityId: "",
        districtId: "",
      }));
    }
  }, [user]);

  // Şehirler yükle
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await apiClient.get("/cities");
        setCities(response.data as City[]);
      } catch (err) {
        console.error("Şehirler yüklenirken hata:", err);
        setError("Şehirler yüklenirken hata oluştu");
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, []);

  const handleCityChange = async (cityId: string) => {
    setFormData((prev) => ({ ...prev, cityId: cityId, districtId: "" }));
    setLoadingDistricts(true);

    try {
      if (cityId) {
        const response = await apiClient.get(`/cities/${cityId}/districts`);
        setDistricts(response.data as District[]);
      } else {
        setDistricts([]);
      }
    } catch (err) {
      console.error("İlçeler yüklenirken hata:", err);
      setDistricts([]);
      setError("İlçeler yüklenirken hata oluştu");
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Auto-load brand/model/variant from URL parameter
  useEffect(() => {
    const loadVariantDetails = async () => {
      console.log("🔍 TekstilForm variantSlug from URL:", variantSlug);
      console.log("🔍 TekstilForm brandSlug from URL:", brandSlug);
      console.log("🔍 TekstilForm modelSlug from URL:", modelSlug);

      if (variantSlug && brandSlug && modelSlug) {
        console.log("✅ Loading variant details for slugs:", {
          brandSlug,
          modelSlug,
          variantSlug,
        });
        try {
          setLoadingVariants(true);

          // Slug-based API kullanarak variant detayını çek
          const variantResponse = await apiClient.get(
            `/categories/dorse/brands/${brandSlug}/models/${modelSlug}/variants/${variantSlug}`,
          );
          const variant = variantResponse.data as Variant;

          if (variant) {
            // Model detayını çek
            setLoadingModels(true);
            const modelResponse = await apiClient.get(
              `/models/${variant.modelId}`,
            );
            const model = modelResponse.data as Model;

            if (model) {
              // Brand detayını çek
              setLoadingBrands(true);
              const brandResponse = await apiClient.get(
                `/brands/id/${model.brandId}`,
              );
              const brand = brandResponse.data as Brand;

              if (brand) {
                // Tüm ilgili listeleri yükle
                const brandsResponse = await apiClient.get(
                  "/brands?category=Dorse",
                );
                setBrands(brandsResponse.data as Brand[]);

                const modelsResponse = await apiClient.get(
                  `/brands/${brand.id}/models`,
                );
                setModels(modelsResponse.data as Model[]);

                const variantsResponse = await apiClient.get(
                  `/models/${model.id}/variants`,
                );
                setVariants(variantsResponse.data as Variant[]);

                // Form data'yı güncelle - Dorse categoryId'si için sabit değer
                setFormData((prev) => ({
                  ...prev,
                  categoryId: "1", // Dorse category ID (database'den kontrol edilecek)
                  brandId: brand.id.toString(),
                  modelId: model.id.toString(),
                  variantId: variant.id.toString(),
                }));
              }
            }
          }
        } catch (err) {
          console.error("❌ Variant detayları yüklenirken hata:", err);
          // Hata durumunda normal brand yükleme işlemini yap
          loadDefaultBrands();
        } finally {
          setLoadingBrands(false);
          setLoadingModels(false);
          setLoadingVariants(false);
        }
      } else {
        console.log("⚠️ No variantId provided, loading default brands");
        // variantId yoksa normal brand yükleme işlemini yap
        loadDefaultBrands();
      }
    };

    const loadDefaultBrands = async () => {
      console.log("🏷️ Loading default brands for Dorse category");
      setLoadingBrands(true);
      try {
        const response = await apiClient.get("/brands?category=Dorse");
        const brandsData = response.data as Brand[];
        console.log("✅ Brands loaded:", brandsData.length, "brands");
        setBrands(brandsData);
      } catch (err) {
        console.error("❌ Markalar yüklenirken hata:", err);
        setError("Markalar yüklenirken hata oluştu");
      } finally {
        setLoadingBrands(false);
      }
    };

    loadVariantDetails();
  }, [variantSlug, brandSlug, modelSlug]);

  // Load models when brand changes
  const handleBrandChange = async (brandId: string) => {
    setFormData((prev) => ({ ...prev, brandId, modelId: "", variantId: "" }));
    setModels([]);
    setVariants([]);

    if (brandId) {
      setLoadingModels(true);
      try {
        const response = await apiClient.get(`/brands/${brandId}/models`);
        setModels(response.data as Model[]);
      } catch (err) {
        console.error("Modeller yüklenirken hata:", err);
        setError("Modeller yüklenirken hata oluştu");
      } finally {
        setLoadingModels(false);
      }
    }
  };

  // Load variants when model changes
  const handleModelChange = async (modelId: string) => {
    setFormData((prev) => ({ ...prev, modelId, variantId: "" }));
    setVariants([]);

    if (modelId) {
      setLoadingVariants(true);
      try {
        const response = await apiClient.get(`/models/${modelId}/variants`);
        setVariants(response.data as Variant[]);
      } catch (err) {
        console.error("Varyantlar yüklenirken hata:", err);
        setError("Varyantlar yüklenirken hata oluştu");
      } finally {
        setLoadingVariants(false);
      }
    }
  };

  const handleInputChange = (
    field: keyof TekstilFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalFiles = images.length + files.length;

    if (totalFiles > 10) {
      setError("En fazla 10 fotoğraf yükleyebilirsiniz");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (showcaseImageIndex >= images.length - 1) {
      setShowcaseImageIndex(Math.max(0, images.length - 2));
    }
  };

  const setShowcaseImage = (index: number) => {
    setShowcaseImageIndex(index);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // İlan Detayları
        if (!formData.title.trim()) {
          setError("İlan başlığı gereklidir");
          return false;
        }
        if (!formData.description.trim()) {
          setError("Açıklama gereklidir");
          return false;
        }
        if (
          formData.year < 1980 ||
          formData.year > new Date().getFullYear() + 1
        ) {
          setError("Geçerli bir üretim yılı giriniz");
          return false;
        }
        if (!formData.takasli) {
          setError("Takaslı bilgisi seçiniz");
          return false;
        }
        break;
      case 1: // Fotoğraflar
        if (images.length === 0) {
          setError("En az 1 fotoğraf yüklemeniz gerekli");
          return false;
        }
        break;
      case 2: // İletişim & Fiyat
        if (!formData.price.trim()) {
          setError("Fiyat bilgisi gereklidir");
          return false;
        }
        if (!formData.cityId) {
          setError("Şehir seçimi gereklidir");
          return false;
        }
        if (!formData.districtId) {
          setError("İlçe seçimi gereklidir");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Video upload handler
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validVideos: File[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        setError(`Video boyutu 50MB'dan küçük olmalıdır: ${file.name}`);
        return;
      }

      if (!file.type.startsWith("video/")) {
        setError(`Geçersiz dosya formatı: ${file.name}`);
        return;
      }

      validVideos.push(file);
    });

    if (validVideos.length > 0) {
      const newVideos = [...formData.videos, ...validVideos].slice(0, 3);
      setFormData((prev) => ({ ...prev, videos: newVideos }));

      // Create preview URLs
      const newPreviews = validVideos.map((video) =>
        URL.createObjectURL(video),
      );
      setVideoPreviews((prev) => [...prev, ...newPreviews].slice(0, 3));

      setError(null);
    }

    // Reset input
    event.target.value = "";
  };

  // Remove video
  const removeVideo = (index: number) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, videos: newVideos }));

    // Clean up preview URL
    if (videoPreviews[index]) {
      URL.revokeObjectURL(videoPreviews[index]);
    }
    const newPreviews = videoPreviews.filter((_, i) => i !== index);
    setVideoPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Tekstil bilgileri
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("year", formData.year.toString());
      formDataToSend.append("category", "Dorse");
      formDataToSend.append("subcategory", "Tekstil");
      formDataToSend.append("variant_slug", variantSlug || "");

      // Tekstil için model ve variant slug'larını ekle
      formDataToSend.append("categorySlug", "dorse");
      formDataToSend.append("modelSlug", "tekstil-tekstil");
      formDataToSend.append("variantSlug", "tekstil-tekstil-tekstil");

      // Brand/Model/Variant IDs
      formDataToSend.append("categoryId", formData.categoryId || "1"); // Dorse category ID
      formDataToSend.append("brandId", formData.brandId);
      formDataToSend.append("modelId", formData.modelId);
      formDataToSend.append("variantId", formData.variantId);

      // Teknik özellikler
      formDataToSend.append("takasli", formData.takasli);

      // Dorse Markası
      if (formData.dorseBrand && formData.dorseBrand !== "Seçiniz") {
        formDataToSend.append("dorseBrand", formData.dorseBrand);
      }

      // Konum bilgileri - hem ID hem de isim
      const selectedCity = cities.find(
        (c) => c.id.toString() === formData.cityId,
      );
      const selectedDistrict = districts.find(
        (d) => d.id.toString() === formData.districtId,
      );

      formDataToSend.append("city", selectedCity?.name || "");
      formDataToSend.append("district", selectedDistrict?.name || "");
      formDataToSend.append("cityId", formData.cityId);
      formDataToSend.append("districtId", formData.districtId);

      // Ekstra özellikler
      formDataToSend.append("warranty", formData.warranty ? "true" : "false");
      formDataToSend.append(
        "negotiable",
        formData.negotiable ? "true" : "false",
      );
      formDataToSend.append("exchange", formData.exchange ? "true" : "false");

      // Fotoğraflar
      images.forEach((image, index) => {
        formDataToSend.append("images", image);
        if (index === showcaseImageIndex) {
          formDataToSend.append("showcase_image_index", index.toString());
        }
      });

      // Videolar
      formData.videos.forEach((video, index) => {
        formDataToSend.append(`video_${index}`, video);
      });

      const response = await apiClient.post("/listings", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = response.data as {
        success: boolean;
        message?: string;
        id?: string;
      };

      if (responseData.success) {
        setCreatedAdId(responseData.id || null);
        setShowSuccessModal(true);
      } else {
        throw new Error(responseData.message || "İlan oluşturulamadı");
      }
    } catch (err: unknown) {
      console.error("Tekstil ilanı oluşturma hatası:", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.message ||
          error.message ||
          "İlan oluşturulurken bir hata oluştu",
      );
    } finally {
      setLoading(false);
    }
  };

  // Success Modal Handlers
  const handleSuccessModalClose = () => {
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
    navigate("/user/my-listings");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // İlan Detayları
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <LocalLaundryService color="primary" />
              Tekstil Bilgileri
            </Typography>

            {/* Brand/Model/Variant Selection */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 2,
              }}
            >
              <Autocomplete
                options={brands}
                getOptionLabel={(option) => option.name}
                value={
                  brands.find((b) => b.id.toString() === formData.brandId) ||
                  null
                }
                onChange={(_, newValue) => {
                  if (!variantSlug) {
                    // Sadece URL'den variant gelmiyorsa değiştirilebilir
                    const brandId = newValue?.id.toString() || "";
                    setFormData((prev) => ({
                      ...prev,
                      brandId,
                      categoryId: "1", // Dorse category ID
                    }));
                    handleBrandChange(brandId);
                  }
                }}
                disabled={!!variantSlug} // URL'den variant geliyorsa disable
                loading={loadingBrands}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Marka"
                    required
                    helperText={
                      variantSlug
                        ? "Form önceden seçilmiş variant ile dolduruldu"
                        : ""
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingBrands ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              <Autocomplete
                options={models}
                getOptionLabel={(option) => option.name}
                value={
                  models.find((m) => m.id.toString() === formData.modelId) ||
                  null
                }
                onChange={(_, newValue) => {
                  if (!variantSlug) {
                    // Sadece URL'den variant gelmiyorsa değiştirilebilir
                    const modelId = newValue?.id.toString() || "";
                    handleModelChange(modelId);
                  }
                }}
                loading={loadingModels}
                disabled={!!variantSlug || !formData.brandId} // URL'den variant geliyorsa veya brand seçilmemişse disable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Model"
                    required
                    helperText={
                      variantSlug
                        ? "Form önceden seçilmiş variant ile dolduruldu"
                        : ""
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingModels ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              <Autocomplete
                options={variants}
                getOptionLabel={(option) => option.name}
                value={
                  variants.find(
                    (v) => v.id.toString() === formData.variantId,
                  ) || null
                }
                onChange={(_, newValue) => {
                  if (!variantSlug) {
                    // Sadece URL'den variant gelmiyorsa değiştirilebilir
                    handleInputChange(
                      "variantId",
                      newValue?.id.toString() || "",
                    );
                  }
                }}
                loading={loadingVariants}
                disabled={!!variantSlug || !formData.modelId} // URL'den variant geliyorsa veya model seçilmemişse disable
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Varyant"
                    required
                    helperText={
                      variantSlug
                        ? "Form önceden seçilmiş variant ile dolduruldu"
                        : ""
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingVariants ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Örn: 2018 Model Tekstil Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Tekstil aracınızın detaylı açıklamasını yazın..."
              required
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                fullWidth
                type="number"
                label="Üretim Yılı"
                value={formData.year}
                onChange={(e) =>
                  handleInputChange("year", parseInt(e.target.value))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRange />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 1980,
                  max: new Date().getFullYear() + 1,
                }}
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Dorse Markası</InputLabel>
                <Select
                  value={formData.dorseBrand}
                  label="Dorse Markası"
                  onChange={(e) =>
                    handleInputChange("dorseBrand", e.target.value)
                  }
                >
                  {TEKSTIL_BRANDS.map((brand) => (
                    <MenuItem key={brand} value={brand}>
                      {brand}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <FormControl fullWidth required>
                <InputLabel>Takaslı</InputLabel>
                <Select
                  value={formData.takasli}
                  label="Takaslı"
                  onChange={(e) => handleInputChange("takasli", e.target.value)}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      case 1: // Fotoğraflar
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <CloudUpload color="primary" />
              Tekstil Fotoğrafları
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CloudUpload
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Tekstil Fotoğraflarını Yükleyin
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    En fazla 10 fotoğraf yükleyebilirsiniz. İlk fotoğraf vitrin
                    fotoğrafı olacaktır.
                  </Typography>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={images.length >= 10}
                    >
                      Fotoğraf Seç
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>

            {images.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({images.length}/10)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 2,
                  }}
                >
                  {images.map((file, index) => (
                    <Card
                      key={index}
                      sx={{
                        position: "relative",
                        border:
                          showcaseImageIndex === index ? "2px solid" : "none",
                        borderColor: "primary.main",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowcaseImage(index)}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                        }}
                      />
                      {showcaseImageIndex === index && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            bgcolor: "primary.main",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          Vitrin
                        </Box>
                      )}
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Video Upload Section */}
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <CloudUpload color="primary" />
                Tekstil Videoları (Opsiyonel)
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  disabled={formData.videos.length >= 3}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Video Yükle (Maksimum 3 adet, 50MB)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                </Button>
                <Typography variant="caption" color="textSecondary">
                  Desteklenen formatlar: MP4, AVI, MOV, WMV. Maksimum dosya
                  boyutu: 50MB
                </Typography>
              </Box>

              {formData.videos.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Yüklenen Videolar ({formData.videos.length}/3)
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {formData.videos.map((video, index) => (
                      <Card key={index} sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              {video.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {(video.size / (1024 * 1024)).toFixed(1)} MB
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setCurrentVideoIndex(index);
                                setVideoModalOpen(true);
                              }}
                            >
                              Önizle
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeVideo(index)}
                            >
                              <Close />
                            </IconButton>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        );

      case 2: // İletişim & Fiyat
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Person color="primary" />
              Fiyat & Konum Bilgileri
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.name}
                value={
                  cities.find(
                    (city) => city.id.toString() === formData.cityId,
                  ) || null
                }
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue.id.toString());
                  }
                }}
                loading={loadingCities}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şehir"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {loadingCities ? (
                            <CircularProgress size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              <Autocomplete
                options={districts}
                getOptionLabel={(option) => option.name}
                value={
                  districts.find(
                    (district) =>
                      district.id.toString() === formData.districtId,
                  ) || null
                }
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleInputChange("districtId", newValue.id.toString());
                  }
                }}
                loading={loadingDistricts}
                disabled={!formData.cityId || loadingDistricts}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="İlçe"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {loadingDistricts ? (
                            <CircularProgress size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <TextField
              fullWidth
              label="Fiyat"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <ToggleButtonGroup
                      value={formData.currency || "TRY"}
                      exclusive
                      onChange={(_, v) =>
                        v &&
                        setFormData((prev: any) => ({ ...prev, currency: v }))
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
              placeholder="150000"
              required
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.warranty}
                    onChange={(e) =>
                      handleInputChange("warranty", e.target.checked)
                    }
                  />
                }
                label="Garanti var"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.negotiable}
                    onChange={(e) =>
                      handleInputChange("negotiable", e.target.checked)
                    }
                  />
                }
                label="Pazarlık yapılabilir"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.exchange}
                    onChange={(e) =>
                      handleInputChange("exchange", e.target.checked)
                    }
                  />
                }
                label="Takas yapılabilir"
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🧵 Tekstil İlan Ver
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tekstil aracınızı kolayca satışa çıkarın
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ mb: 4, minHeight: 400 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<ArrowBack />}
          >
            Geri
          </Button>

          <Typography variant="body2" color="text.secondary">
            Adım {activeStep + 1} / {steps.length}
          </Typography>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : "İlanı Yayınla"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={<ArrowForward />}
            >
              İleri
            </Button>
          )}
        </Box>
      </Paper>

      {/* Video Preview Modal */}
      <Dialog
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Video Önizleme</DialogTitle>
        <DialogContent>
          {formData.videos[currentVideoIndex] && (
            <video
              controls
              style={{ width: "100%", maxHeight: "400px" }}
              src={URL.createObjectURL(formData.videos[currentVideoIndex])}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoModalOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={handleSuccessModalClose}
        onGoHome={handleGoHome}
        onViewAd={handleViewAd}
        onMyAds={handleMyAds}
        title="🎉 İlan Başarıyla Yayınlandı!"
        message="Tekstil ilanınız başarıyla yayınlandı. Artık alıcılar tarafından görülebilir ve iletişime geçebilirler."
      />
    </Container>
  );
};

export default TekstilForm;
