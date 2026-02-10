import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import { PhotoCamera, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../layout/Header";
import apiClient, { videoUploadClient } from "../../api/client";
import { getTokenFromStorage } from "../../utils/tokenUtils";

// Type definitions
interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  name: string;
  slug: string;
}

interface Variant {
  id: number;
  name: string;
  slug: string;
}

interface FormData {
  // Category/Brand/Model/Variant IDs
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;

  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  currency: string;
  condition: string;

  // Konum Bilgileri
  cityId: string;
  districtId: string;

  // Araç Bilgileri
  year: string;
  mileage: string;
  enginePower: string;
  fuelType: string;
  transmission: string;

  // Otobüs Özel Bilgileri
  capacity: string;
  seatArrangement: string;
  seatBackScreen: string;
  color: string;
  fuelCapacity: string;
  tireCondition: string;
  hasAccidentRecord: string; // Hasar kaydı
  hasTramerRecord: string; // Tramer kaydı
  exchange: string; // Takas

  // Özellikler
  features: string[];

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;
  videos: File[];
}

const OtobusAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();
  const [searchParams] = useSearchParams();

  // URL'den gelen seçimler
  const selectedBrandSlug = brandSlug || searchParams.get("brand");
  const selectedModelSlug = modelSlug || searchParams.get("model");
  const selectedVariantSlug = variantSlug || searchParams.get("variant");
  const selectedCategorySlug = categorySlug || "otobus";

  console.log("URL Parametreleri:", {
    categorySlug: selectedCategorySlug,
    brandSlug: selectedBrandSlug,
    modelSlug: selectedModelSlug,
    variantSlug: selectedVariantSlug,
  });

  // Loading ve success state'leri
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Category/Brand/Model/Variant IDs
    categoryId: "4", // Otobüs kategorisi
    brandId: "",
    modelId: "",
    variantId: "",

    title: "",
    description: "",
    price: "",
    currency: "TRY",
    condition: "",
    cityId: "",
    districtId: "",
    year: "",
    mileage: "",
    enginePower: "",
    fuelType: "",
    transmission: "",
    capacity: "",
    seatArrangement: "",
    seatBackScreen: "",
    color: "",
    fuelCapacity: "",
    tireCondition: "",
    hasAccidentRecord: "",
    hasTramerRecord: "",
    exchange: "",
    features: [],
    photos: [],
    showcasePhoto: null,
    videos: [],
  });

  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [districts, setDistricts] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [_variants, setVariants] = useState<Variant[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showcasePreview, setShowcasePreview] = useState<string>("");
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);

  // Seçili olan brand, model ve variant bilgileri
  const [_selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [_selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [_selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Cache and request tracking to prevent duplicate API calls
  const requestCache = useRef(new Map());
  const lastRequestTime = useRef(new Map());

  // Consume unused variables to avoid lint errors
  void _variants;
  void _selectedBrand;
  void _selectedModel;
  void _selectedVariant;

  // Statik seçenekler
  const yearOptions = Array.from({ length: 30 }, (_, i) =>
    (2024 - i).toString(),
  );

  const fuelTypeOptions = ["Dizel", "Benzin", "LPG", "Elektrik", "Hibrit"];

  const transmissionOptions = ["Manuel", "Otomatik", "Yarı Otomatik"];

  const conditionOptions = ["Sıfır", "2. El"];

  const enginePowerOptions = [
    "150-200 HP",
    "200-250 HP",
    "250-300 HP",
    "300-350 HP",
    "350-400 HP",
    "400+ HP",
  ];

  const seatArrangementOptions = ["2+1", "2+2"];

  const seatBackScreenOptions = ["7", "9", "10", "Yok"];

  const colorOptions = [
    "Amarant",
    "Bal Rengi",
    "Bej",
    "Beyaz",
    "Bordo",
    "Füme",
    "Gri",
    "Gümüş Gri",
    "İhtamur",
    "Kahverengi",
    "Kırmızı",
    "Kiremit",
    "Krem",
    "Kum Rengi",
    "Lacivert",
    "Mavi",
    "Mor",
    "Pembe",
    "Sarı",
    "Siyah",
    "Somon",
    "Şampanya",
    "Tarçın",
    "Turkuaz",
    "Turuncu",
    "Yakut",
    "Yeşil",
    "Zeytin Gri",
  ];

  const availableFeatures = [
    "3G",
    "ABS",
    "Araç Telefonu",
    "ASR",
    "Buzdolabı",
    "Klima",
    "Mutfak",
    "Retarder",
    "Sürücü Kabini",
    "Televizyon",
    "Tuvalet",
    "Uydu",
    "Wi-Fi",
  ];

  // API çağrıları
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/ads/cities");
        setCities((response.data as Array<{ id: string; name: string }>) || []);
      } catch (error) {
        console.error("Şehirler yüklenirken hata:", error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (formData.cityId) {
      const fetchDistricts = async () => {
        try {
          const response = await apiClient.get(
            `/ads/cities/${formData.cityId}/districts`,
          );
          setDistricts(
            (response.data as Array<{ id: string; name: string }>) || [],
          );
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        }
      };
      fetchDistricts();
    }
  }, [formData.cityId]);

  // Brand/Model useEffect'leri - sadece URL parametreleri yoksa çalışsın
  useEffect(() => {
    if (!selectedBrandSlug && !selectedModelSlug && !selectedVariantSlug) {
      const initializeForm = async () => {
        await loadBrands("otobus"); // Otobüs kategorisi slug'ı
      };
      initializeForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandSlug, selectedModelSlug, selectedVariantSlug]);

  useEffect(() => {
    // Sadece kullanıcı seçimi olduğunda ve loading olmadığında çalışsın
    if (
      formData.brandId &&
      !selectedBrandSlug &&
      !selectedModelSlug &&
      !selectedVariantSlug &&
      !isLoadingModels &&
      brands.length > 0
    ) {
      const loadModelsData = async () => {
        await loadModels(formData.brandId);
      };
      loadModelsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.brandId,
    selectedBrandSlug,
    selectedModelSlug,
    selectedVariantSlug,
    isLoadingModels,
    brands.length,
  ]);

  useEffect(() => {
    // Sadece kullanıcı seçimi olduğunda ve loading olmadığında çalışsın
    if (
      formData.modelId &&
      !selectedModelSlug &&
      !selectedVariantSlug &&
      !isLoadingVariants &&
      models.length > 0
    ) {
      const loadVariantsData = async () => {
        await loadVariants(formData.modelId);
      };
      loadVariantsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.modelId,
    selectedModelSlug,
    selectedVariantSlug,
    isLoadingVariants,
    models.length,
  ]);

  // Sayı formatlama fonksiyonları
  const formatNumber = (value: string): string => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";

    // Sayıyı formatlayalım (binlik ayracı)
    return new Intl.NumberFormat("tr-TR").format(parseInt(numbers));
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[] | File[] | File | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Brand değiştiğinde model ve variant'ları temizle - yükleme useEffect'te yapılacak
    if (field === "brandId") {
      setModels([]);
      setVariants([]);
      setFormData((prev) => ({
        ...prev,
        modelId: "",
        variantId: "",
      }));
    }

    // Model değiştiğinde variant'ları temizle - yükleme useEffect'te yapılacak
    if (field === "modelId") {
      setFormData((prev) => ({
        ...prev,
        modelId: value as string,
        variantId: "",
      }));
      setVariants([]);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (isShowcase) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, showcasePhoto: file }));

      // Vitrin fotoğrafı önizlemesi oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setShowcasePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const currentPhotos = formData.photos;
      const newPhotos = Array.from(files);
      const totalPhotos = currentPhotos.length + newPhotos.length;

      if (totalPhotos <= 15) {
        setFormData((prev) => ({
          ...prev,
          photos: [...currentPhotos, ...newPhotos],
        }));

        // Fotoğraf önizlemeleri oluştur
        newPhotos.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        });
      } else {
        alert(
          `En fazla 15 fotoğraf yükleyebilirsiniz. Şu anda ${currentPhotos.length} fotoğraf var.`,
        );
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Video fonksiyonları
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validVideos = Array.from(files).filter((file) => {
      if (!file.type.startsWith("video/")) {
        alert(`${file.name} bir video dosyası değil`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        alert(`${file.name} dosyası 50MB'dan büyük`);
        return false;
      }
      return true;
    });

    if (formData.videos.length + validVideos.length > 3) {
      alert("En fazla 3 video yükleyebilirsiniz");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      videos: [...prev.videos, ...validVideos],
    }));

    // Video önizlemeleri oluştur
    validVideos.forEach((video) => {
      const videoUrl = URL.createObjectURL(video);
      setVideoPreviews((prev) => [...prev, videoUrl]);
    });
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
    setVideoPreviews((prev) => {
      // URL'yi serbest bırak
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const openVideoModal = (index: number) => {
    setSelectedVideoIndex(index);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
  };

  const navigateVideo = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev" && selectedVideoIndex > 0) {
        setSelectedVideoIndex(selectedVideoIndex - 1);
      } else if (
        direction === "next" &&
        selectedVideoIndex < formData.videos.length - 1
      ) {
        setSelectedVideoIndex(selectedVideoIndex + 1);
      }
    },
    [selectedVideoIndex, formData.videos.length],
  );

  // Klavye navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (videoModalOpen) {
        switch (event.key) {
          case "Escape":
            closeVideoModal();
            break;
          case "ArrowLeft":
            navigateVideo("prev");
            break;
          case "ArrowRight":
            navigateVideo("next");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [videoModalOpen, navigateVideo]);

  // Brand/Model/Variant yükleme fonksiyonları
  const loadBrands = useCallback(async (categorySlug: string) => {
    const cacheKey = `brands-${categorySlug}`;
    const now = Date.now();

    // Check if we made a request recently (within 1 second)
    const lastTime = lastRequestTime.current.get(cacheKey);
    if (lastTime && now - lastTime < 1000) {
      console.log("🚫 Skipping duplicate brand request within 1 second");
      return;
    }

    // Check cache
    const cached = requestCache.current.get(cacheKey);
    if (cached) {
      console.log("📦 Using cached brands data");
      setBrands(cached);
      return;
    }

    lastRequestTime.current.set(cacheKey, now);

    try {
      const response = await apiClient.get(
        `/categories/${categorySlug}/brands`,
      );
      const brandsData = response.data as Brand[];

      // Cache the result
      requestCache.current.set(cacheKey, brandsData);
      setBrands(brandsData);

      // İlk brand'ı otomatik seç (eğer seçili değilse)
      if (brandsData.length > 0) {
        setFormData((prev) => {
          if (!prev.brandId) {
            return {
              ...prev,
              brandId: brandsData[0].id.toString(),
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Markalar yüklenemedi:", error);
      // Clear cache on error
      requestCache.current.delete(cacheKey);
      lastRequestTime.current.delete(cacheKey);
    }
  }, []);

  const loadModels = useCallback(
    async (brandId: string) => {
      if (!brandId || brandId === "" || isLoadingModels) {
        if (!brandId || brandId === "") {
          setModels([]);
          setVariants([]);
          setFormData((prev) => ({
            ...prev,
            modelId: "",
            variantId: "",
          }));
        }
        return;
      }

      const cacheKey = `models-${brandId}`;
      const now = Date.now();

      // Check if we made a request recently (within 1 second)
      const lastTime = lastRequestTime.current.get(cacheKey);
      if (lastTime && now - lastTime < 1000) {
        console.log("🚫 Skipping duplicate model request within 1 second");
        setIsLoadingModels(false);
        return;
      }

      setIsLoadingModels(true);

      try {
        // Brand ID'den slug'ı bul
        const brand = brands.find((b) => b.id.toString() === brandId);
        if (!brand) {
          console.error(
            "Brand bulunamadı:",
            brandId,
            "Mevcut brands:",
            brands.map((b) => `${b.id}:${b.name}`),
          );
          setModels([]);
          setVariants([]);
          setFormData((prev) => ({
            ...prev,
            modelId: "",
            variantId: "",
          }));
          return;
        }

        // Check cache
        const cached = requestCache.current.get(cacheKey);
        if (cached) {
          console.log("📦 Using cached models data for brand:", brand.name);
          setModels(cached);
          setIsLoadingModels(false);
          return;
        }

        lastRequestTime.current.set(cacheKey, now);

        console.log(
          "🔄 Loading models for brand:",
          brand.name,
          "(ID:",
          brandId,
          "Slug:",
          brand.slug,
          ")",
        );
        const response = await apiClient.get(
          `/categories/otobus/brands/${brand.slug}/models`,
        );
        const modelsData = response.data as Model[];
        console.log(
          "✅ Models loaded:",
          modelsData.length,
          "models for brand",
          brand.name,
        );

        // Cache the result
        requestCache.current.set(cacheKey, modelsData);
        setModels(modelsData);

        // Variant'ları temizle çünkü model değişti
        setVariants([]);
        setFormData((prev) => ({
          ...prev,
          variantId: "",
        }));

        // İlk model'i otomatik seç (eğer seçili değilse)
        if (modelsData.length > 0) {
          setFormData((prev) => {
            if (!prev.modelId) {
              return {
                ...prev,
                modelId: modelsData[0].id.toString(),
              };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("❌ Modeller yüklenemedi:", error);
        // Clear cache on error
        requestCache.current.delete(cacheKey);
        lastRequestTime.current.delete(cacheKey);
        setModels([]);
        setVariants([]);
        setFormData((prev) => ({
          ...prev,
          modelId: "",
          variantId: "",
        }));
      } finally {
        setIsLoadingModels(false);
      }
    },
    [brands, isLoadingModels],
  );

  const loadVariants = useCallback(
    async (modelId: string) => {
      if (!modelId || modelId === "" || isLoadingVariants) {
        if (!modelId || modelId === "") {
          setVariants([]);
          setFormData((prev) => ({
            ...prev,
            variantId: "",
          }));
        }
        return;
      }

      setIsLoadingVariants(true);

      try {
        // Model ID'den slug'ı bul
        const model = models.find((m) => m.id.toString() === modelId);
        const brand = brands.find((b) => b.id.toString() === formData.brandId);

        if (!model) {
          console.error(
            "Model bulunamadı:",
            modelId,
            "Mevcut models:",
            models.map((m) => `${m.id}:${m.name}`),
          );
          setVariants([]);
          setFormData((prev) => ({
            ...prev,
            variantId: "",
          }));
          return;
        }

        if (!brand) {
          console.error(
            "Brand bulunamadı:",
            formData.brandId,
            "Mevcut brands:",
            brands.map((b) => `${b.id}:${b.name}`),
          );
          setVariants([]);
          setFormData((prev) => ({
            ...prev,
            variantId: "",
          }));
          return;
        }

        console.log(
          "🔄 Loading variants for model:",
          model.name,
          "(ID:",
          modelId,
          "Slug:",
          model.slug,
          ") of brand:",
          brand.name,
        );
        const response = await apiClient.get(
          `/categories/otobus/brands/${brand.slug}/models/${model.slug}/variants`,
        );
        const variantsData = response.data as Variant[];
        console.log(
          "✅ Variants loaded:",
          variantsData.length,
          "variants for model",
          model.name,
        );
        setVariants(variantsData);

        // İlk variant'ı otomatik seç (eğer seçili değilse)
        if (variantsData.length > 0) {
          setFormData((prev) => {
            if (!prev.variantId) {
              return {
                ...prev,
                variantId: variantsData[0].id.toString(),
              };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("❌ Varyantlar yüklenemedi:", error);
        setVariants([]);
        setFormData((prev) => ({
          ...prev,
          variantId: "",
        }));
      } finally {
        setIsLoadingVariants(false);
      }
    },
    [models, brands, formData.brandId, isLoadingVariants],
  );

  // Function refs to avoid dependency issues
  const loadBrandsRef = useRef(loadBrands);
  const loadModelsRef = useRef(loadModels);
  const loadVariantsRef = useRef(loadVariants);

  // Update refs when functions change
  useEffect(() => {
    loadBrandsRef.current = loadBrands;
    loadModelsRef.current = loadModels;
    loadVariantsRef.current = loadVariants;
  }, [loadBrands, loadModels, loadVariants]);

  // URL parametrelerinden seçili öğeleri yükle
  useEffect(() => {
    const loadSelectedItems = async () => {
      try {
        // Önce tüm brands'ları yükle
        await loadBrandsRef.current("otobus");

        // Brand yükle ve doğrula
        if (selectedBrandSlug) {
          console.log("Brand yükleniyor:", selectedBrandSlug);
          const brandResponse = await apiClient.get(
            `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}`,
          );
          const brandData = brandResponse.data as Brand;
          setSelectedBrand(brandData);

          // Models'ları yükle
          await loadModelsRef.current(brandData.id.toString());

          setFormData((prev) => ({
            ...prev,
            brandId: brandData.id.toString(),
          }));
          console.log("Brand yüklendi:", brandData);

          // Model yükle ve doğrula
          if (selectedModelSlug) {
            console.log("Model yükleniyor:", selectedModelSlug);
            const modelResponse = await apiClient.get(
              `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}/models/${selectedModelSlug}`,
            );
            const modelData = modelResponse.data as Model;
            setSelectedModel(modelData);

            // Variants'ları yükle
            await loadVariantsRef.current(modelData.id.toString());

            setFormData((prev) => ({
              ...prev,
              modelId: modelData.id.toString(),
            }));
            console.log("Model yüklendi:", modelData);

            // Variant yükle ve doğrula
            if (selectedVariantSlug) {
              console.log("Variant yükleniyor:", selectedVariantSlug);
              const variantResponse = await apiClient.get(
                `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}/models/${selectedModelSlug}/variants/${selectedVariantSlug}`,
              );
              const variantData = variantResponse.data as Variant;
              setSelectedVariant(variantData);
              setFormData((prev) => ({
                ...prev,
                variantId: variantData.id.toString(),
              }));
              console.log("Variant yüklendi:", variantData);
            }
          }
        }
      } catch (error) {
        console.error("Seçili öğeler yüklenirken hata:", error);
      }
    };

    if (selectedBrandSlug || selectedModelSlug || selectedVariantSlug) {
      console.log("useEffect tetiklendi, seçimler yükleniyor...");
      loadSelectedItems();
    }
  }, [
    selectedBrandSlug,
    selectedModelSlug,
    selectedVariantSlug,
    selectedCategorySlug,
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "İlan başlığı gerekli";
    if (!formData.description.trim())
      newErrors.description = "Açıklama gerekli";
    if (!formData.price.trim()) newErrors.price = "Fiyat gerekli";
    if (!formData.cityId) newErrors.cityId = "Şehir seçimi gerekli";
    if (!formData.districtId) newErrors.districtId = "İlçe seçimi gerekli";
    if (!formData.year) newErrors.year = "Yıl seçimi gerekli";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Eğer zaten loading durumundaysa, birden fazla submit'i engelle
    if (loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      // Debug için console.log ekleyelim
      console.log("🚌 Otobüs form data:", formData);

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      // Fiyatı düz sayıya çevir (nokta ve boşlukları kaldır)
      const cleanPrice = formData.price.replace(/[\s.]/g, "");
      submitData.append("price", cleanPrice);
      submitData.append("currency", formData.currency || "TRY");
      if (formData.condition && formData.condition.trim() !== "") {
        submitData.append("condition", formData.condition);
      }

      // Konum bilgileri
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Araç bilgileri - Boş string kontrolü
      if (formData.year && formData.year.trim() !== "") {
        submitData.append("year", formData.year);
      }
      if (formData.mileage && formData.mileage.trim() !== "") {
        // Kilometre değerini düz sayıya çevir
        const cleanMileage = formData.mileage.replace(/[\s.]/g, "");
        submitData.append("mileage", cleanMileage);
      }
      if (formData.enginePower && formData.enginePower.trim() !== "") {
        submitData.append("enginePower", formData.enginePower);
      }
      if (formData.fuelType && formData.fuelType.trim() !== "") {
        submitData.append("fuelType", formData.fuelType);
      }
      if (formData.transmission && formData.transmission.trim() !== "") {
        submitData.append("transmission", formData.transmission);
      }

      // Otobüs özel bilgileri - Boş string kontrolü ekleyelim
      if (formData.capacity && formData.capacity.trim() !== "") {
        // Kapasite değerini düz sayıya çevir
        const cleanCapacity = formData.capacity.replace(/[\s.]/g, "");
        submitData.append("passengerCapacity", cleanCapacity);
      }
      if (formData.seatArrangement && formData.seatArrangement.trim() !== "") {
        submitData.append("seatLayout", formData.seatArrangement);
      }
      if (formData.seatBackScreen && formData.seatBackScreen.trim() !== "") {
        submitData.append("seatBackScreen", formData.seatBackScreen);
      }
      if (formData.color && formData.color.trim() !== "") {
        submitData.append("color", formData.color);
      }
      if (formData.fuelCapacity && formData.fuelCapacity.trim() !== "") {
        // Yakıt hacmi değerini düz sayıya çevir
        const cleanFuelCapacity = formData.fuelCapacity.replace(/[\s.]/g, "");
        submitData.append("fuelCapacity", cleanFuelCapacity);
      }
      if (formData.tireCondition && formData.tireCondition.trim() !== "") {
        submitData.append("tireCondition", formData.tireCondition);
      }
      if (
        formData.hasAccidentRecord &&
        formData.hasAccidentRecord.trim() !== ""
      ) {
        submitData.append("hasAccidentRecord", formData.hasAccidentRecord);
      }
      if (formData.hasTramerRecord && formData.hasTramerRecord.trim() !== "") {
        submitData.append("hasTramerRecord", formData.hasTramerRecord);
      }
      if (formData.exchange && formData.exchange.trim() !== "") {
        submitData.append("exchange", formData.exchange);
      }

      // Özellikler - JSON olarak gönder
      if (formData.features.length > 0) {
        // Features array'ini object'e çevir
        const featuresObject: Record<string, boolean> = {};
        formData.features.forEach((feature) => {
          featuresObject[feature] = true;
        });
        submitData.append("features", JSON.stringify(featuresObject));
      }

      // Category/Brand/Model/Variant ID'lerini ekle
      submitData.append("categoryId", formData.categoryId);
      submitData.append("brandId", formData.brandId);
      submitData.append("modelId", formData.modelId);
      submitData.append("variantId", formData.variantId || "");

      // Legacy support için slug'ları da ekle
      if (categorySlug) submitData.append("categorySlug", categorySlug);
      if (brandSlug) submitData.append("brandSlug", brandSlug);
      if (modelSlug) submitData.append("modelSlug", modelSlug);
      if (variantSlug) submitData.append("variantSlug", variantSlug);

      // Vitrin fotoğrafı
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      // Diğer fotoğraflar - server photo_0, photo_1, photo_2 şeklinde bekliyor
      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      // Videoları ekle
      formData.videos.forEach((video, index) => {
        submitData.append(`video_${index}`, video);
      });

      // Authentication token'ı al
      const token = getTokenFromStorage();
      if (!token) {
        alert("Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.");
        navigate("/login");
        return;
      }

      console.log("📤 Starting upload...");
      const response = await videoUploadClient.post("/ads/otobus", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        // Başarılı olduğunda modalı aç
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error("İlan gönderme hatası:", error);

      // Axios error tipinde kontrol et
      const axiosError = error as {
        response?: { status: number; data?: { retryAfter?: number } };
      };

      if (axiosError.response?.status === 413) {
        alert("Dosya boyutu çok büyük. Lütfen daha küçük dosyalar yükleyiniz.");
      } else if (
        axiosError.response?.status &&
        axiosError.response.status >= 500
      ) {
        alert("Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.");
      } else {
        alert(
          "İlan gönderilirken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 3 }}>
            {/* 📝 Temel Bilgiler */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                  }}
                >
                  Temel Bilgiler
                </Typography>

                {/* İlan Başlığı */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="İlan Başlığı"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                    variant="outlined"
                    placeholder="Örn: 2020 Model Mercedes Tourismo Otobüs"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Açıklama */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Açıklama"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    error={!!errors.description}
                    helperText={errors.description}
                    required
                    variant="outlined"
                    placeholder="Otobüsünüz hakkında detaylı bilgi verin..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Fiyat"
                    value={formData.price}
                    onChange={(e) => {
                      const formattedValue = formatNumber(e.target.value);
                      handleInputChange("price", formattedValue);
                    }}
                    error={!!errors.price}
                    helperText={errors.price}
                    placeholder="1.500.000"
                    InputProps={{
                      inputProps: {
                        inputMode: "numeric",
                      },
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                  <FormControl fullWidth error={!!errors.condition}>
                    <InputLabel>Durumu</InputLabel>
                    <Select
                      value={formData.condition}
                      onChange={(e) =>
                        handleInputChange("condition", e.target.value)
                      }
                      label="Durumu"
                      sx={{ borderRadius: 3 }}
                    >
                      {conditionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* 📍 Konum Bilgileri */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                  }}
                >
                  Konum Bilgileri
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Autocomplete
                    fullWidth
                    options={cities}
                    getOptionLabel={(option) => option.name}
                    value={
                      cities.find((city) => city.id === formData.cityId) || null
                    }
                    onChange={(_, newValue) => {
                      handleInputChange("cityId", newValue?.id || "");
                      handleInputChange("districtId", "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Şehir"
                        error={!!errors.city}
                        helperText={errors.city}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    )}
                  />
                  <Autocomplete
                    fullWidth
                    options={districts}
                    getOptionLabel={(option) => option.name}
                    value={
                      districts.find(
                        (district) => district.id === formData.districtId,
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleInputChange("districtId", newValue?.id || "")
                    }
                    disabled={!formData.cityId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="İlçe"
                        error={!!errors.district}
                        helperText={errors.district}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 🚍 Araç Bilgileri */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                  }}
                >
                  Araç Bilgileri
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth error={!!errors.year}>
                    <InputLabel>Yıl</InputLabel>
                    <Select
                      value={formData.year}
                      onChange={(e) =>
                        handleInputChange("year", e.target.value)
                      }
                      label="Yıl"
                      sx={{ borderRadius: 3 }}
                    >
                      {yearOptions.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Kilometre"
                    value={formData.mileage}
                    onChange={(e) => {
                      const formattedValue = formatNumber(e.target.value);
                      handleInputChange("mileage", formattedValue);
                    }}
                    placeholder="100.000"
                    InputProps={{
                      inputProps: {
                        inputMode: "numeric",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Motor Gücü</InputLabel>
                    <Select
                      value={formData.enginePower}
                      onChange={(e) =>
                        handleInputChange("enginePower", e.target.value)
                      }
                      label="Motor Gücü"
                      sx={{ borderRadius: 3 }}
                    >
                      {enginePowerOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Yakıt Türü</InputLabel>
                    <Select
                      value={formData.fuelType}
                      onChange={(e) =>
                        handleInputChange("fuelType", e.target.value)
                      }
                      label="Yakıt Türü"
                      sx={{ borderRadius: 3 }}
                    >
                      {fuelTypeOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Vites</InputLabel>
                    <Select
                      value={formData.transmission}
                      onChange={(e) =>
                        handleInputChange("transmission", e.target.value)
                      }
                      label="Vites"
                      sx={{ borderRadius: 3 }}
                    >
                      {transmissionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Kapasite (Kişi)"
                    value={formData.capacity}
                    onChange={(e) => {
                      const formattedValue = formatNumber(e.target.value);
                      handleInputChange("capacity", formattedValue);
                    }}
                    placeholder="50"
                    InputProps={{
                      inputProps: {
                        inputMode: "numeric",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Koltuk Düzeni</InputLabel>
                    <Select
                      value={formData.seatArrangement}
                      onChange={(e) =>
                        handleInputChange("seatArrangement", e.target.value)
                      }
                      label="Koltuk Düzeni"
                      sx={{ borderRadius: 3 }}
                    >
                      {seatArrangementOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Koltuk Arkası Ekran</InputLabel>
                    <Select
                      value={formData.seatBackScreen}
                      onChange={(e) =>
                        handleInputChange("seatBackScreen", e.target.value)
                      }
                      label="Koltuk Arkası Ekran"
                      sx={{ borderRadius: 3 }}
                    >
                      {seatBackScreenOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Renk</InputLabel>
                    <Select
                      value={formData.color}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      label="Renk"
                      sx={{ borderRadius: 3 }}
                    >
                      {colorOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Yakıt Hacmi (Litre)"
                    value={formData.fuelCapacity}
                    onChange={(e) => {
                      const formattedValue = formatNumber(e.target.value);
                      handleInputChange("fuelCapacity", formattedValue);
                    }}
                    placeholder="300"
                    InputProps={{
                      inputProps: {
                        inputMode: "numeric",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Lastik Durumu (%)"
                    value={formData.tireCondition}
                    onChange={(e) => {
                      // Yüzde için özel formatlama
                      const value = e.target.value.replace(/\D/g, "");
                      if (
                        value === "" ||
                        (parseInt(value) >= 0 && parseInt(value) <= 100)
                      ) {
                        handleInputChange("tireCondition", value);
                      }
                    }}
                    placeholder="85"
                    InputProps={{
                      inputProps: {
                        inputMode: "numeric",
                        min: 0,
                        max: 100,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Hasar Kaydı, Tramer Kaydı, Takas */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mt: 3,
                  }}
                >
                  <FormControl
                    sx={{
                      flex: 1,
                      minWidth: 200,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  >
                    <InputLabel>Hasar Kaydı</InputLabel>
                    <Select
                      value={formData.hasAccidentRecord || ""}
                      onChange={(e) =>
                        handleInputChange("hasAccidentRecord", e.target.value)
                      }
                      label="Hasar Kaydı"
                    >
                      <MenuItem value="evet">Var</MenuItem>
                      <MenuItem value="hayir">Yok</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    sx={{
                      flex: 1,
                      minWidth: 200,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                    label="Tramer Kaydı (TL)"
                    value={formData.hasTramerRecord || ""}
                    onChange={(e) =>
                      handleInputChange("hasTramerRecord", e.target.value)
                    }
                    placeholder="Örn: 5000"
                    type="number"
                    helperText="Tramer kaydı tutarını TL olarak giriniz"
                  />
                  <FormControl
                    sx={{
                      flex: 1,
                      minWidth: 200,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  >
                    <InputLabel>Takas</InputLabel>
                    <Select
                      value={formData.exchange || ""}
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
              </CardContent>
            </Card>

            {/* ⭐ Özellikler */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                  }}
                >
                  Konfor & Güvenlik Özellikleri
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {availableFeatures.map((feature) => (
                    <FormControlLabel
                      key={feature}
                      control={
                        <Checkbox
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          color="primary"
                        />
                      }
                      label={feature}
                      sx={{ minWidth: "200px" }}
                    />
                  ))}
                </Box>

                {formData.features.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Seçili Özellikler:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {formData.features.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          onDelete={() => handleFeatureToggle(feature)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* � Fotoğraflar */}
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
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 3,
                  }}
                >
                  Fotoğraflar
                </Typography>

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
                              setShowcasePreview("");
                            }}
                          >
                            <Typography
                              sx={{ color: "white", fontSize: "14px" }}
                            >
                              ✕
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ display: "block", mt: 1 }}
                        >
                          Vitrin Fotoğrafı ✓
                        </Typography>
                      </Box>
                    )}

                    {formData.showcasePhoto && !showcasePreview && (
                      <Chip
                        label={formData.showcasePhoto.name}
                        color="primary"
                        sx={{ ml: 2 }}
                      />
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
                      📷 Diğer Fotoğraflar
                      <Chip label="İsteğe Bağlı" color="info" size="small" />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Otobüsünüzün farklı açılardan fotoğraflarını ekleyin (En
                      fazla 15 adet)
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
                            background: "#fafafa",
                          }}
                        >
                          {photoPreviews.map((preview, index) => (
                            <Box
                              key={index}
                              sx={{
                                position: "relative",
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                },
                              }}
                            >
                              <img
                                src={preview}
                                alt={`Fotoğraf ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: "80px",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  background: "rgba(255,0,0,0.8)",
                                  borderRadius: "50%",
                                  width: 20,
                                  height: 20,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  "&:hover": { background: "rgba(255,0,0,1)" },
                                }}
                                onClick={() => removePhoto(index)}
                              >
                                <Typography
                                  sx={{
                                    color: "white",
                                    fontSize: "12px",
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
                                  sx={{ fontSize: "10px" }}
                                >
                                  {index + 1}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>

                        {/* Eski chip görünümü - fallback */}
                        {photoPreviews.length === 0 && (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {formData.photos.map((photo, index) => (
                              <Chip
                                key={index}
                                label={photo.name}
                                onDelete={() => removePhoto(index)}
                                color="secondary"
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Card>
                </Box>
              </CardContent>
            </Card>

            {/* 🎬 Videolar */}
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
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  Videolar
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Otobüsünüzün video tanıtımını ekleyerek daha fazla ilgi çekin
                  (Opsiyonel - Max 3 video, 100MB/video)
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Video Yükleme */}
                  <Box>
                    <input
                      accept="video/*"
                      style={{ display: "none" }}
                      id="video-upload"
                      type="file"
                      multiple
                      onChange={handleVideoUpload}
                    />
                    <Box
                      sx={{
                        border: "2px dashed #e0e0e0",
                        borderRadius: 2,
                        p: 3,
                        textAlign: "center",
                        backgroundColor: "#fafafa",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "#ff6b35",
                          backgroundColor: "#fff8f6",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Videolarınızı buraya sürükleyip bırakın veya seçin
                      </Typography>
                      <label htmlFor="video-upload">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<PhotoCamera />}
                          disabled={formData.videos.length >= 3}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontSize: "1rem",
                            py: 1.5,
                            px: 3,
                            background:
                              "linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)",
                            "&:hover": {
                              background:
                                "linear-gradient(45deg, #e55a2e 30%, #de831a 90%)",
                            },
                            "&:disabled": {
                              background: "#e0e0e0",
                            },
                          }}
                        >
                          Video Ekle ({formData.videos.length}/3)
                        </Button>
                      </label>
                    </Box>
                  </Box>

                  {/* Yüklenen Videolar */}
                  {formData.videos.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#374151" }}
                      >
                        Yüklenen Videolar ({formData.videos.length}/3)
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(auto-fill, minmax(300px, 1fr))",
                          },
                          gap: 3,
                        }}
                      >
                        {videoPreviews.map((preview, index) => (
                          <Box
                            key={index}
                            onClick={() => openVideoModal(index)}
                            sx={{
                              position: "relative",
                              borderRadius: 2,
                              overflow: "hidden",
                              border: "1px solid #e2e8f0",
                              cursor: "pointer",
                              transition: "all 0.3s ease-in-out",
                              "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <video
                              src={preview}
                              style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "cover",
                                pointerEvents: "none",
                              }}
                              controls={false}
                              muted
                              preload="metadata"
                            />
                            {/* Play Overlay */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                background: "rgba(0,0,0,0.7)",
                                borderRadius: "50%",
                                width: 60,
                                height: 60,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "24px",
                                pointerEvents: "none",
                              }}
                            >
                              ▶
                            </Box>
                            {/* Remove Button */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "rgba(255,0,0,0.8)",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                "&:hover": { background: "rgba(255,0,0,1)" },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVideo(index);
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "white",
                                  fontSize: "12px",
                                  lineHeight: 1,
                                }}
                              >
                                ✕
                              </Typography>
                            </Box>
                            {/* Video Info */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "rgba(0,0,0,0.8)",
                                color: "white",
                                textAlign: "center",
                                py: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: "11px",
                                  display: "block",
                                  fontWeight: "bold",
                                }}
                              >
                                {formData.videos[index]?.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: "10px",
                                  opacity: 0.9,
                                  display: "block",
                                }}
                              >
                                {(
                                  formData.videos[index]?.size /
                                  (1024 * 1024)
                                ).toFixed(1)}{" "}
                                MB
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Hata Mesajları */}
            {Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Lütfen tüm zorunlu alanları doldurun.
              </Alert>
            )}

            {/* Submit Button */}
            <Box sx={{ textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  minWidth: 250,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                  },
                }}
              >
                {loading ? <CircularProgress size={28} /> : "İlanı Yayınla"}
              </Button>
            </Box>
          </Box>
        </form>
      </Container>

      {/* Video Modal */}
      <Dialog
        open={videoModalOpen}
        onClose={closeVideoModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ position: "relative", bgcolor: "black" }}>
          {/* Close Button */}
          <Box
            onClick={closeVideoModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            ✕
          </Box>

          {/* Previous Button */}
          {formData.videos.length > 1 && (
            <Box
              onClick={() => navigateVideo("prev")}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              ◀
            </Box>
          )}

          {/* Next Button */}
          {formData.videos.length > 1 && (
            <Box
              onClick={() => navigateVideo("next")}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              ▶
            </Box>
          )}

          {/* Video */}
          {selectedVideoIndex >= 0 &&
            selectedVideoIndex < videoPreviews.length && (
              <video
                src={videoPreviews[selectedVideoIndex]}
                controls
                autoPlay
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "80vh",
                  display: "block",
                }}
              />
            )}

          {/* Video Info */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              color: "white",
              p: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {selectedVideoIndex >= 0 &&
              selectedVideoIndex < formData.videos.length
                ? formData.videos[selectedVideoIndex]?.name
                : ""}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {selectedVideoIndex >= 0 &&
              selectedVideoIndex < formData.videos.length
                ? `${(
                    formData.videos[selectedVideoIndex]?.size /
                    (1024 * 1024)
                  ).toFixed(1)} MB`
                : ""}{" "}
              • Video {selectedVideoIndex + 1} / {formData.videos.length}
            </Typography>
          </Box>
        </Box>
      </Dialog>

      {/* Success Modal */}
      <Dialog
        open={submitSuccess}
        onClose={() => {}} // Modal kapatılamaz, sadece buton ile
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircle
            sx={{
              fontSize: 80,
              color: "success.main",
              mb: 2,
            }}
          />
          <Typography variant="h5" component="h2" gutterBottom>
            İlan Başarıyla Gönderildi!
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            İlanınız henüz yayında değil! Admin onayı bekliyor. Onaylandıktan
            sonra anasayfada görünecektir.
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            İlanınızın durumunu "İlanlarım" sayfasından takip edebilirsiniz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setSubmitSuccess(false);
              navigate("/");
            }}
            size="large"
            sx={{
              minWidth: 200,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
              },
            }}
          >
            Ana Sayfaya Git
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OtobusAdForm;
