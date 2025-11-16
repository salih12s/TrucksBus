import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  IconButton,
} from "@mui/material";
import {
  PhotoCamera,
  CheckCircle,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../layout/Header";
import apiClient, { videoUploadClient } from "@/api/client";
import { getTokenFromStorage } from "@/utils/tokenUtils";

interface Category {
  id: number;
  name: string;
  slug: string;
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
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;
  title: string;
  description: string;
  year: string;
  price: string;
  mileage: string;
  condition: string;
  engineVolume: string;
  motorPower: string;
  drivetrain: string;
  color: string;
  seatCount: string;
  roofType: string;
  chassis: string;
  transmission: string;
  fuelType: string;
  exchange: string;
  hasAccidentRecord: string; // Hasar kaydı
  hasTramerRecord: string; // Tramer kaydı
  plateType: string;
  plateNumber: string;
  cityId: string;
  districtId: string;
  photos: File[];
  showcasePhoto: File | null;
  videos: File[];
  // Detay Bilgisi alanları
  detailFeatures: {
    abs?: boolean;
    alarm?: boolean;
    alasimJant?: boolean;
    asr?: boolean;
    cdCalar?: boolean;
    cekiDemiri?: boolean;
    deriDoseme?: boolean;
    elektrikliAynalar?: boolean;
    elektrikliCam?: boolean;
    esp?: boolean;
    farSis?: boolean;
    farSensoru?: boolean;
    farYikamaSistemi?: boolean;
    havaYastigi?: boolean;
    havaYastigiYolcu?: boolean;
    hizSabitleme?: boolean;
    hidrolikDireksiyon?: boolean;
    immobilizer?: boolean;
    isitmalKoltuklar?: boolean;
    klima?: boolean;
    merkeziKilit?: boolean;
    okulAraci?: boolean;
    otomatikCam?: boolean;
    otomatikKapi?: boolean;
    parkSensoru?: boolean;
    radioTeyp?: boolean;
    spoyler?: boolean;
    sunroof?: boolean;
    turizmPaketi?: boolean;
    tvNavigasyon?: boolean;
    xenonFar?: boolean;
    yagmurSensoru?: boolean;
    yanHavaYastigi?: boolean;
    yokusKalkisDestegi?: boolean;
    yolBilgisayari?: boolean;
    sogutucuFrigo?: boolean;
    // Ek özellikler
    dvdPlayer?: boolean;
    muzikSistemi?: boolean;
    geriGorusKamerasi?: boolean;
    elFreni?: boolean;
    ayakFreni?: boolean;
    bagajHacmi?: boolean;
    sigortali?: boolean;
    garantili?: boolean;
  };
}

// Motor Gücü seçenekleri (Minibüs için)
const motorPowerOptions = [
  "50 hp'ye kadar",
  "51 - 75 hp",
  "76 - 100 hp",
  "101 - 125 hp",
  "126 - 150 hp",
  "151 - 175 hp",
  "176 - 200 hp",
  "201 - 225 hp",
  "226 - 250 hp",
  "251 - 275 hp",
  "276 - 300 hp",
  "301 - 325 hp",
  "326 - 350 hp",
  "351 - 375 hp",
  "376 - 400 hp",
  "401 - 425 hp",
  "426 - 450 hp",
  "451 - 475 hp",
  "476 - 500 hp",
  "501 hp ve üzeri",
];

const CreateMinibusAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();
  const [searchParams] = useSearchParams();

  // URL parametrelerinden seçimleri al
  const selectedCategorySlug = categorySlug || searchParams.get("category");
  const selectedBrandSlug = brandSlug || searchParams.get("brand");
  const selectedModelSlug = modelSlug || searchParams.get("model");
  const selectedVariantSlug = variantSlug || searchParams.get("variant");

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  // Seçili öğeler için setter fonksiyonları (arka planda kullanılıyor - URL parametrelerinden yükleniyor)
  // Form alanları kaldırıldı ama backend işlemleri için gerekli
  const setSelectedCategory = (_: Category | null) => {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  const setSelectedBrand = (_: Brand | null) => {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  const setSelectedModel = (_: Model | null) => {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  const setSelectedVariant = (_: Variant | null) => {}; // eslint-disable-line @typescript-eslint/no-unused-vars

  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);

  const [formData, setFormData] = useState<FormData>({
    categoryId: "1", // Minibüs & Midibüs kategorisi
    brandId: "",
    modelId: "",
    variantId: "",
    title: "",
    description: "",
    year: "",
    price: "",
    mileage: "",
    condition: "ikinci-el",
    engineVolume: "",
    motorPower: "",
    drivetrain: "onden-cekis",
    color: "",
    seatCount: "",
    roofType: "normal-tavan",
    chassis: "kisa",
    transmission: "manuel",
    fuelType: "dizel",
    exchange: "hayir",
    hasAccidentRecord: "",
    hasTramerRecord: "",
    plateType: "tr-plakali",
    plateNumber: "",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    videos: [],
    detailFeatures: {
      abs: false,
      alarm: false,
      alasimJant: false,
      asr: false,
      cdCalar: false,
      cekiDemiri: false,
      deriDoseme: false,
      elektrikliAynalar: false,
      elektrikliCam: false,
      esp: false,
      farSis: false,
      farSensoru: false,
      farYikamaSistemi: false,
      havaYastigi: false,
      havaYastigiYolcu: false,
      hizSabitleme: false,
      hidrolikDireksiyon: false,
      immobilizer: false,
      isitmalKoltuklar: false,
      klima: false,
      merkeziKilit: false,
      okulAraci: false,
      otomatikCam: false,
      otomatikKapi: false,
      parkSensoru: false,
      radioTeyp: false,
      spoyler: false,
      sunroof: false,
      turizmPaketi: false,
      tvNavigasyon: false,
      xenonFar: false,
      yagmurSensoru: false,
      yanHavaYastigi: false,
      yokusKalkisDestegi: false,
      yolBilgisayari: false,
      sogutucuFrigo: false,
      // Ek özellikler
      dvdPlayer: false,
      muzikSistemi: false,
      geriGorusKamerasi: false,
      elFreni: false,
      ayakFreni: false,
      bagajHacmi: false,
      sigortali: false,
      garantili: false,
    },
  });

  // ✅ API Functions
  const loadBrands = async (categorySlug: string) => {
    try {
      const response = await apiClient.get(
        `/categories/${categorySlug}/brands`
      );
      const brandsData = response.data as Brand[];
      setBrands(brandsData);

      // İlk brand'ı otomatik seç
      if (brandsData.length > 0 && !formData.brandId) {
        setFormData((prev) => ({
          ...prev,
          brandId: brandsData[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("Markalar yüklenemedi:", error);
    }
  };

  const loadModels = async (brandId: string) => {
    if (!brandId || brandId === "") {
      setModels([]);
      setFormData((prev) => ({
        ...prev,
        modelId: "",
        variantId: "",
      }));
      return;
    }

    try {
      // Brand ID'den slug'ı bul
      const brand = brands.find((b) => b.id.toString() === brandId);
      if (!brand) {
        console.error(
          "Brand bulunamadı:",
          brandId,
          "Mevcut brands:",
          brands.map((b) => `${b.id}:${b.name}`)
        );
        setModels([]);

        setFormData((prev) => ({
          ...prev,
          modelId: "",
          variantId: "",
        }));
        return;
      }

      console.log(
        "🔄 Loading models for brand:",
        brand.name,
        "(ID:",
        brandId,
        "Slug:",
        brand.slug,
        ")"
      );
      const response = await apiClient.get(
        `/categories/minibus-midibus/brands/${brand.slug}/models`
      );
      const modelsData = response.data as Model[];
      console.log(
        "✅ Models loaded:",
        modelsData.length,
        "models for brand",
        brand.name
      );
      setModels(modelsData);

      // Variant'ları temizle çünkü model değişti

      setFormData((prev) => ({
        ...prev,
        variantId: "",
      }));

      // İlk model'i otomatik seç (eğer seçili değilse)
      if (modelsData.length > 0 && !formData.modelId) {
        const firstModelId = modelsData[0].id.toString();
        setFormData((prev) => ({
          ...prev,
          modelId: firstModelId,
        }));
        // İlk model seçilince variant'ları da yükle
        await loadVariants(firstModelId);
      }
    } catch (error) {
      console.error("❌ Modeller yüklenemedi:", error);
      setModels([]);

      setFormData((prev) => ({
        ...prev,
        modelId: "",
        variantId: "",
      }));
    }
  };

  const loadVariants = async (modelId: string) => {
    if (!modelId || modelId === "") {
      setFormData((prev) => ({
        ...prev,
        variantId: "",
      }));
      return;
    }

    try {
      // Model ID'den slug'ı bul
      const model = models.find((m) => m.id.toString() === modelId);
      const brand = brands.find((b) => b.id.toString() === formData.brandId);

      if (!model) {
        console.error(
          "Model bulunamadı:",
          modelId,
          "Mevcut models:",
          models.map((m) => `${m.id}:${m.name}`)
        );

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
          brands.map((b) => `${b.id}:${b.name}`)
        );

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
        brand.name
      );
      const variantUrl = `/categories/minibus-midibus/brands/${brand.slug}/models/${model.slug}/variants`;
      const response = await apiClient.get(variantUrl);
      const variantsData = response.data as Variant[];
      console.log(
        "✅ Variants loaded:",
        variantsData.length,
        "variants for model",
        model.name
      );

      // İlk variant'ı otomatik seç (varsa)
      if (variantsData.length > 0 && !formData.variantId) {
        setFormData((prev) => ({
          ...prev,
          variantId: variantsData[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("Varyantlar yüklenemedi:", error);
    }
  };

  // ✅ useEffect'ler

  // URL parametrelerinden seçimleri yükle
  useEffect(() => {
    const loadSelectedItems = async () => {
      try {
        console.log("loadSelectedItems başlatılıyor...");

        // Kategori yükle
        if (selectedCategorySlug) {
          console.log("Kategori yükleniyor:", selectedCategorySlug);
          const categoryResponse = await apiClient.get(
            `/categories/${selectedCategorySlug}`
          );
          const categoryData = categoryResponse.data as Category;
          setSelectedCategory(categoryData);
          setFormData((prev) => ({
            ...prev,
            categoryId: categoryData.id.toString(),
          }));
          console.log("Kategori yüklendi:", categoryData);
        }

        // Brand yükle
        if (selectedBrandSlug) {
          console.log("Brand yükleniyor:", selectedBrandSlug);
          const brandResponse = await apiClient.get(
            `/categories/${
              selectedCategorySlug || "minibus-midibus"
            }/brands/${selectedBrandSlug}`
          );
          const brandData = brandResponse.data as Brand;
          setSelectedBrand(brandData);
          setFormData((prev) => ({
            ...prev,
            brandId: brandData.id.toString(),
          }));
          console.log("Brand yüklendi:", brandData);
        }

        // Model yükle
        if (selectedModelSlug && selectedBrandSlug) {
          console.log("Model yükleniyor:", selectedModelSlug);
          const modelResponse = await apiClient.get(
            `/categories/${
              selectedCategorySlug || "minibus-midibus"
            }/brands/${selectedBrandSlug}/models/${selectedModelSlug}`
          );
          const modelData = modelResponse.data as Model;
          setSelectedModel(modelData);
          setFormData((prev) => ({
            ...prev,
            modelId: modelData.id.toString(),
          }));
          console.log("Model yüklendi:", modelData);
        }

        // Variant yükle
        if (selectedVariantSlug && selectedModelSlug && selectedBrandSlug) {
          console.log("Variant yükleniyor:", selectedVariantSlug);
          const variantResponse = await apiClient.get(
            `/categories/${
              selectedCategorySlug || "minibus-midibus"
            }/brands/${selectedBrandSlug}/models/${selectedModelSlug}/variants/${selectedVariantSlug}`
          );
          const variantData = variantResponse.data as Variant;
          setSelectedVariant(variantData);
          setFormData((prev) => ({
            ...prev,
            variantId: variantData.id.toString(),
          }));
          console.log("Variant yüklendi:", variantData);
        }
      } catch (error) {
        console.error("Seçili öğeler yüklenirken hata:", error);
      }
    };

    if (
      selectedCategorySlug ||
      selectedBrandSlug ||
      selectedModelSlug ||
      selectedVariantSlug
    ) {
      console.log("useEffect tetiklendi, seçimler yükleniyor...");
      loadSelectedItems();
    }
  }, [
    selectedCategorySlug,
    selectedBrandSlug,
    selectedModelSlug,
    selectedVariantSlug,
  ]);

  useEffect(() => {
    const initializeForm = async () => {
      await loadBrands("minibus-midibus"); // Minibüs kategorisi slug'ı
    };
    initializeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (formData.brandId) {
      const loadModelsData = async () => {
        await loadModels(formData.brandId);
      };
      loadModelsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.brandId]);

  useEffect(() => {
    if (formData.modelId) {
      const loadVariantsData = async () => {
        await loadVariants(formData.modelId);
      };
      loadVariantsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.modelId]);

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Brand değiştiğinde model ve variant'ları temizle ve yeniden yükle
    if (field === "brandId") {
      setFormData((prev) => ({
        ...prev,
        brandId: value,
        modelId: "",
        variantId: "",
      }));
      setModels([]);

      if (value) {
        loadModels(value);
      }
    }

    // Model değiştiğinde variant'ları temizle ve yeniden yükle
    if (field === "modelId") {
      setFormData((prev) => ({
        ...prev,
        modelId: value,
        variantId: "",
      }));

      if (value) {
        loadVariants(value);
      }
    }
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase = false
  ) => {
    const files = event.target.files;
    if (files) {
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

          // Yeni fotoğraflar için önizlemeler oluştur
          const newPreviews: string[] = [];
          Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              newPreviews.push(e.target?.result as string);
              if (newPreviews.length === files.length) {
                setPhotoPreviews((prev) => [...prev, ...newPreviews]);
              }
            };
            reader.readAsDataURL(file);
          });
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
    // Önizlemeyi de kaldır
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const currentVideos = formData.videos;
      const newVideos = Array.from(files);
      const totalVideos = currentVideos.length + newVideos.length;

      // En fazla 3 video
      if (totalVideos <= 3) {
        // Video dosya boyutu kontrolü (50MB limit)
        const oversizedFiles = newVideos.filter(
          (file) => file.size > 50 * 1024 * 1024
        );
        if (oversizedFiles.length > 0) {
          console.error("Video dosyası çok büyük:", oversizedFiles);
          alert(
            `⚠️ Video dosyası 50MB'dan büyük olamaz. Büyük dosyalar: ${oversizedFiles
              .map((f) => f.name)
              .join(", ")}`
          );
          return;
        }

        // Video format kontrolü
        const invalidFiles = newVideos.filter(
          (file) => !file.type.startsWith("video/")
        );
        if (invalidFiles.length > 0) {
          console.error("Geçersiz video formatı:", invalidFiles);
          alert(
            `⚠️ Sadece video dosyaları yükleyebilirsiniz. Geçersiz dosyalar: ${invalidFiles
              .map((f) => f.name)
              .join(", ")}`
          );
          return;
        }

        console.log(
          `✅ ${newVideos.length} video başarıyla yüklendi:`,
          newVideos.map((f) => f.name)
        );

        setFormData((prev) => ({
          ...prev,
          videos: [...currentVideos, ...newVideos],
        }));

        // Video önizlemeleri oluştur
        const newPreviews: string[] = [];
        Array.from(files).forEach((file) => {
          const url = URL.createObjectURL(file);
          newPreviews.push(url);
          if (newPreviews.length === files.length) {
            setVideoPreviews((prev) => [...prev, ...newPreviews]);
          }
        });
      } else {
        alert("En fazla 3 video yükleyebilirsiniz");
      }
    }
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
    // Önizlemeyi de kaldır ve URL'yi temizle
    setVideoPreviews((prev) => {
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
    [selectedVideoIndex, formData.videos.length]
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
  }, [
    videoModalOpen,
    selectedVideoIndex,
    formData.videos.length,
    navigateVideo,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Motor gücü debug
      console.log("Form Data motorPower:", formData.motorPower);

      // Hasar ve Tramer kaydı debug
      console.log("Form Data hasAccidentRecord:", formData.hasAccidentRecord);
      console.log("Form Data hasTramerRecord:", formData.hasTramerRecord);

      const submitData = new FormData();

      // Temel bilgileri ekle (price ve mileage'ı parse ederek)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "showcasePhoto" &&
          key !== "detailFeatures" &&
          value
        ) {
          // Price ve mileage değerlerini parse et
          if (key === "price" || key === "mileage") {
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
      submitData.append("categoryId", formData.categoryId);
      submitData.append("brandId", formData.brandId);
      submitData.append("modelId", formData.modelId);
      submitData.append("variantId", formData.variantId || "");

      // Legacy support için slug'ları da ekle
      submitData.append("categorySlug", categorySlug || "minibus-midibus");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");

      // Detay özelliklerini JSON olarak ekle (backend "features" bekliyor)
      submitData.append("features", JSON.stringify(formData.detailFeatures));

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

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

      // Debug: Dosya sayıları
      const totalFiles =
        (formData.showcasePhoto ? 1 : 0) +
        formData.photos.length +
        formData.videos.length;
      console.log("📊 Dosya Sayısı Debug:", {
        showcasePhoto: formData.showcasePhoto ? 1 : 0,
        photos: formData.photos.length,
        videos: formData.videos.length,
        totalFiles: totalFiles,
        limit: "18 (server limit)",
      });

      if (totalFiles > 18) {
        alert(
          `❌ Çok fazla dosya! Toplam: ${totalFiles}, Limit: 18. Lütfen bazı fotoğraf/videoları kaldırın.`
        );
        return;
      }

      console.log("📤 Starting upload...");
      const response = await videoUploadClient.post(
        "/ads/minibus",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("İlan başarıyla oluşturuldu:", response.data);
      setSubmitSuccess(true);
    } catch (error: unknown) {
      console.error("İlan oluşturulurken hata:", error);

      // Server hata mesajını göster
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      if (axiosError?.response?.data?.message) {
        alert(`❌ Hata: ${axiosError.response.data.message}`);
      } else if (axiosError?.message) {
        alert(`❌ Hata: ${axiosError.message}`);
      } else {
        alert("❌ İlan oluşturulurken bir hata oluştu");
      }
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
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 3 }}>
            {/* 📝 Temel Bilgiler */}
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
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 3,
                  }}
                >
                  İlan Detayları
                </Typography>

                {/* ✅ Marka/Model/Variant Seçimi */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    Araç Bilgileri
                  </Typography>
                  {/* Kategori, Marka, Model, Variant arka planda işleniyor */}
                </Box>

                {/* İlan Başlığı */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    İlan Başlığı <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Açıklama */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Açıklama <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    required
                    variant="outlined"
                    size="small"
                    placeholder="Bireysel kullanıcılarımızda alıcı ve satıcı güvenliğini sağlamak için açıklama alanına telefon numarası yazılan ilanlar onaylanmamaktadır."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Yıl, Fiyat, KM - Grid Layout */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {/* Yıl */}
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Yıl <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        handleInputChange("year", e.target.value)
                      }
                      required
                      variant="outlined"
                      size="small"
                      placeholder="Bu alanı 2 gün sonra değiştiremez"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                        },
                      }}
                      inputProps={{
                        min: 1990,
                        max: new Date().getFullYear() + 1,
                      }}
                    />
                  </Box>

                  {/* Fiyat */}
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Fiyat <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formatNumber(formData.price)}
                      onChange={(e) => {
                        const rawValue = parseFormattedNumber(e.target.value);
                        handleInputChange("price", rawValue);
                      }}
                      required
                      variant="outlined"
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <Box
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            TL
                          </Box>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ fontSize: "0.75rem", cursor: "pointer" }}
                    >
                      ? Doğru Fiyat = Hızlı Sonuç
                    </Typography>
                  </Box>

                  {/* KM */}
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      KM <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      value={formatNumber(formData.mileage)}
                      onChange={(e) => {
                        const rawValue = parseFormattedNumber(e.target.value);
                        handleInputChange("mileage", rawValue);
                      }}
                      required
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 🚐 Araç Detayları */}
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
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 3,
                  }}
                >
                  Araç Detayları
                </Typography>

                {/* Araç Durumu ve Motor Hacmi */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Araç Durumu</InputLabel>
                    <Select
                      value={formData.condition}
                      onChange={(e) =>
                        handleInputChange("condition", e.target.value)
                      }
                      label="Araç Durumu"
                    >
                      <MenuItem value="ikinci-el">İkinci El</MenuItem>
                      <MenuItem value="yurtdisindan-ithal">
                        Yurtdışından İthal
                      </MenuItem>
                      <MenuItem value="sifir">Sıfır</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Motor Hacmi ve Motor Gücü */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Motor Hacmi</InputLabel>
                    <Select
                      value={formData.engineVolume}
                      onChange={(e) =>
                        handleInputChange("engineVolume", e.target.value)
                      }
                      label="Motor Hacmi"
                    >
                      <MenuItem value="1000-1400">1000-1400 cc</MenuItem>
                      <MenuItem value="1400-1600">1400-1600 cc</MenuItem>
                      <MenuItem value="1600-2000">1600-2000 cc</MenuItem>
                      <MenuItem value="2000-2500">2000-2500 cc</MenuItem>
                      <MenuItem value="2500-3000">2500-3000 cc</MenuItem>
                      <MenuItem value="3000+">3000+ cc</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Motor Gücü</InputLabel>
                    <Select
                      value={formData.motorPower}
                      onChange={(e) =>
                        handleInputChange("motorPower", e.target.value)
                      }
                      label="Motor Gücü"
                    >
                      {motorPowerOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Çekiş ve Renk */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Çekiş</InputLabel>
                    <Select
                      value={formData.drivetrain}
                      onChange={(e) =>
                        handleInputChange("drivetrain", e.target.value)
                      }
                      label="Çekiş"
                    >
                      <MenuItem value="onden-cekis">Önden Çekiş</MenuItem>
                      <MenuItem value="arkadan-itis">Arkadan İtiş</MenuItem>
                      <MenuItem value="4wd-surekli">4WD Sürekli</MenuItem>
                      <MenuItem value="arkadan-itis-elektronik">
                        Arkadan İtiş Elektronik
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Renk</InputLabel>
                    <Select
                      value={formData.color}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      label="Renk"
                    >
                      <MenuItem value="beyaz">Beyaz</MenuItem>
                      <MenuItem value="siyah">Siyah</MenuItem>
                      <MenuItem value="gri">Gri</MenuItem>
                      <MenuItem value="mavi">Mavi</MenuItem>
                      <MenuItem value="kirmizi">Kırmızı</MenuItem>
                      <MenuItem value="yesil">Yeşil</MenuItem>
                      <MenuItem value="sari">Sarı</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Koltuk Sayısı Grid */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: "#1976d2",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Koltuk Sayısı Seçimi
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    {[
                      { value: "8+1", label: "8+1" },
                      { value: "9+1", label: "9+1" },
                      { value: "10+1", label: "10+1" },
                      { value: "11+1", label: "11+1" },
                      { value: "12+1", label: "12+1" },
                      { value: "13+1", label: "13+1" },
                      { value: "14+1", label: "14+1" },
                      { value: "15+1", label: "15+1" },
                      { value: "16+1", label: "16+1" },
                      { value: "17+1", label: "17+1" },
                      { value: "18+1", label: "18+1" },
                      { value: "19+1", label: "19+1" },
                      { value: "20+1", label: "20+1" },
                      { value: "21+1", label: "21+1" },
                      { value: "22+1", label: "22+1" },
                      { value: "23+1", label: "23+1" },
                      { value: "24+1", label: "24+1" },
                      { value: "25+1", label: "25+1" },
                      { value: "26+1", label: "26+1" },
                    ].map((seat) => (
                      <Box
                        key={seat.value}
                        onClick={() =>
                          handleInputChange("seatCount", seat.value)
                        }
                        sx={{
                          p: 2,
                          border: "2px solid",
                          borderColor:
                            formData.seatCount === seat.value
                              ? "#1976d2"
                              : "#e0e0e0",
                          borderRadius: 2,
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          backgroundColor:
                            formData.seatCount === seat.value
                              ? "#e3f2fd"
                              : "white",
                          "&:hover": {
                            borderColor: "#1976d2",
                            backgroundColor: "#f5f5f5",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              formData.seatCount === seat.value ? 600 : 400,
                            color:
                              formData.seatCount === seat.value
                                ? "#1976d2"
                                : "#666",
                          }}
                        >
                          {seat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Tavan Tipi ve Şasi */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Tavan Tipi</InputLabel>
                    <Select
                      value={formData.roofType}
                      onChange={(e) =>
                        handleInputChange("roofType", e.target.value)
                      }
                      label="Tavan Tipi"
                    >
                      <MenuItem value="normal-tavan">Normal Tavan</MenuItem>
                      <MenuItem value="yuksek-tavan">Yüksek Tavan</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Şasi</InputLabel>
                    <Select
                      value={formData.chassis}
                      onChange={(e) =>
                        handleInputChange("chassis", e.target.value)
                      }
                      label="Şasi"
                    >
                      <MenuItem value="kisa">Kısa</MenuItem>
                      <MenuItem value="orta">Orta</MenuItem>
                      <MenuItem value="uzun">Uzun</MenuItem>
                      <MenuItem value="ekstra-uzun">Ekstra Uzun</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Vites, Yakıt Tipi, Takas */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Vites</InputLabel>
                    <Select
                      value={formData.transmission}
                      onChange={(e) =>
                        handleInputChange("transmission", e.target.value)
                      }
                      label="Vites"
                    >
                      <MenuItem value="manuel">Manuel</MenuItem>
                      <MenuItem value="otomatik">Otomatik</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Yakıt Tipi</InputLabel>
                    <Select
                      value={formData.fuelType}
                      onChange={(e) =>
                        handleInputChange("fuelType", e.target.value)
                      }
                      label="Yakıt Tipi"
                    >
                      <MenuItem value="benzinli">Benzinli</MenuItem>
                      <MenuItem value="benzinli-lpg">Benzinli + LPG</MenuItem>
                      <MenuItem value="dizel">Dizel</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Takaslı</InputLabel>
                    <Select
                      value={formData.exchange}
                      onChange={(e) =>
                        handleInputChange("exchange", e.target.value)
                      }
                      label="Takaslı"
                    >
                      <MenuItem value="evet">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>✅</span> Evet
                        </Box>
                      </MenuItem>
                      <MenuItem value="hayir">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>❌</span> Hayır
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
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
                    variant="outlined"
                    label="Tramer Kaydı (TL)"
                    value={formData.hasTramerRecord || ""}
                    onChange={(e) =>
                      handleInputChange("hasTramerRecord", e.target.value)
                    }
                    placeholder="Örn: 5120"
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                    helperText="Tramer kaydı tutarını TL olarak giriniz"
                  />
                </Box>

                {/* Plaka Bilgileri */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>Plaka / Uyruk</InputLabel>
                    <Select
                      value={formData.plateType}
                      onChange={(e) =>
                        handleInputChange("plateType", e.target.value)
                      }
                      label="Plaka / Uyruk"
                    >
                      <MenuItem value="tr-plakali">Türkiye TR Plakalı</MenuItem>
                      <MenuItem value="mavi-plakali">Mavi MA Plakalı</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Araç Plakası"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      handleInputChange("plateNumber", e.target.value)
                    }
                    placeholder="34 ABC 1234"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 📍 Konum Bilgileri */}
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
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 3,
                  }}
                >
                  Konum Bilgileri
                </Typography>

                {/* İl ve İlçe */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>İl</InputLabel>
                    <Select
                      value={formData.cityId}
                      onChange={(e) =>
                        handleInputChange("cityId", e.target.value)
                      }
                      label="İl"
                      required
                    >
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id.toString()}>
                          {city.plateCode} - {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>İlçe</InputLabel>
                    <Select
                      value={formData.districtId}
                      onChange={(e) =>
                        handleInputChange("districtId", e.target.value)
                      }
                      label="İlçe"
                      disabled={!formData.cityId}
                      required
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
              </CardContent>
            </Card>

            {/* ⚙️ Araç Özellikleri */}
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
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 3,
                  }}
                >
                  Araç Özellikleri
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4, textAlign: "center", fontStyle: "italic" }}
                >
                  Aracınızda bulunan özel özellikleri seçerek ilanınızı daha
                  çekici hale getirin
                </Typography>

                {/* Güvenlik Özellikleri */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        borderBottom: "1px solid #e0e0e0",
                        paddingBottom: 2,
                      }}
                    >
                      Güvenlik Özellikleri
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 2,
                      }}
                    >
                      {/* ABS */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.abs}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  abs: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="ABS"
                        sx={{ m: 0 }}
                      />

                      {/* ASR */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.asr}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  asr: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="ASR"
                        sx={{ m: 0 }}
                      />

                      {/* ESP */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.esp}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  esp: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="ESP"
                        sx={{ m: 0 }}
                      />

                      {/* Hava Yastığı */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.havaYastigi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  havaYastigi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Hava Yastığı"
                        sx={{ m: 0 }}
                      />

                      {/* Hava Yastığı Yolcu */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.havaYastigiYolcu}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  havaYastigiYolcu: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Hava Yastığı (Yolcu)"
                        sx={{ m: 0 }}
                      />

                      {/* Yan Hava Yastığı */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.yanHavaYastigi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  yanHavaYastigi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Yan Hava Yastığı"
                        sx={{ m: 0 }}
                      />

                      {/* Immobilizer */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.immobilizer}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  immobilizer: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Immobilizer"
                        sx={{ m: 0 }}
                      />

                      {/* Alarm */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.alarm}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  alarm: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Alarm"
                        sx={{ m: 0 }}
                      />

                      {/* Park Sensörü */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.parkSensoru}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  parkSensoru: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Park Sensörü"
                        sx={{ m: 0 }}
                      />

                      {/* Geri Görüş Kamerası */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.geriGorusKamerasi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  geriGorusKamerasi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Geri Görüş Kamerası"
                        sx={{ m: 0 }}
                      />

                      {/* Yokuş Kalkış Desteği */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.yokusKalkisDestegi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  yokusKalkisDestegi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Yokuş Kalkış Desteği"
                        sx={{ m: 0 }}
                      />

                      {/* El Freni */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.elFreni}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  elFreni: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="El Freni"
                        sx={{ m: 0 }}
                      />

                      {/* Ayak Freni */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.ayakFreni}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  ayakFreni: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Ayak Freni"
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Konfor Özellikleri */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        borderBottom: "1px solid #e0e0e0",
                        paddingBottom: 2,
                      }}
                    >
                      Konfor Özellikleri
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 2,
                      }}
                    >
                      {/* Klima */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.klima}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  klima: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Klima"
                        sx={{ m: 0 }}
                      />

                      {/* Isıtmalı Koltuklar */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.isitmalKoltuklar}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  isitmalKoltuklar: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Isıtmalı Koltuklar"
                        sx={{ m: 0 }}
                      />

                      {/* Deri Döşeme */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.deriDoseme}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  deriDoseme: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Deri Döşeme"
                        sx={{ m: 0 }}
                      />

                      {/* Elektrikli Camlar */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.elektrikliCam}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  elektrikliCam: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Elektrikli Camlar"
                        sx={{ m: 0 }}
                      />

                      {/* Elektrikli Aynalar */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.elektrikliAynalar}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  elektrikliAynalar: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Elektrikli Aynalar"
                        sx={{ m: 0 }}
                      />

                      {/* Otomatik Cam */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.otomatikCam}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  otomatikCam: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Otomatik Cam"
                        sx={{ m: 0 }}
                      />

                      {/* Otomatik Kapı */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.otomatikKapi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  otomatikKapi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Otomatik Kapı"
                        sx={{ m: 0 }}
                      />

                      {/* Hidrolik Direksiyon */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.hidrolikDireksiyon}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  hidrolikDireksiyon: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Hidrolik Direksiyon"
                        sx={{ m: 0 }}
                      />

                      {/* Merkezi Kilit */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.merkeziKilit}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  merkeziKilit: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Merkezi Kilit"
                        sx={{ m: 0 }}
                      />

                      {/* Hız Sabitleme */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.hizSabitleme}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  hizSabitleme: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Hız Sabitleme"
                        sx={{ m: 0 }}
                      />

                      {/* Sunroof */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.sunroof}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  sunroof: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Sunroof"
                        sx={{ m: 0 }}
                      />

                      {/* Soğutucu / Frigo */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.sogutucuFrigo}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  sogutucuFrigo: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Soğutucu / Frigo"
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Multimedya & Teknoloji */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        borderBottom: "1px solid #e0e0e0",
                        paddingBottom: 2,
                      }}
                    >
                      Multimedya & Teknoloji
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 2,
                      }}
                    >
                      {/* Radio - Teyp */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.radioTeyp}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  radioTeyp: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Radio - Teyp"
                        sx={{ m: 0 }}
                      />

                      {/* CD Çalar */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.cdCalar}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  cdCalar: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="CD Çalar"
                        sx={{ m: 0 }}
                      />

                      {/* DVD Player */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.dvdPlayer}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  dvdPlayer: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="DVD Player"
                        sx={{ m: 0 }}
                      />

                      {/* Müzik Sistemi */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.muzikSistemi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  muzikSistemi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Müzik Sistemi"
                        sx={{ m: 0 }}
                      />

                      {/* TV - Navigasyon */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.tvNavigasyon}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  tvNavigasyon: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="TV - Navigasyon"
                        sx={{ m: 0 }}
                      />

                      {/* Yol Bilgisayarı */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.yolBilgisayari}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  yolBilgisayari: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Yol Bilgisayarı"
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Diğer Özellikler */}
                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        borderBottom: "1px solid #e0e0e0",
                        paddingBottom: 2,
                      }}
                    >
                      Diğer Özellikler
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 2,
                      }}
                    >
                      {/* Alaşım Jant */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.alasimJant}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  alasimJant: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Alaşım Jant"
                        sx={{ m: 0 }}
                      />

                      {/* Spoyler */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.spoyler}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  spoyler: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Spoyler"
                        sx={{ m: 0 }}
                      />

                      {/* Xenon Far */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.xenonFar}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  xenonFar: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Xenon Far"
                        sx={{ m: 0 }}
                      />

                      {/* Far Sis */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.farSis}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  farSis: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Far Sis"
                        sx={{ m: 0 }}
                      />

                      {/* Far Sensörü */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.farSensoru}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  farSensoru: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Far Sensörü"
                        sx={{ m: 0 }}
                      />

                      {/* Far Yıkama Sistemi */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.farYikamaSistemi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  farYikamaSistemi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Far Yıkama Sistemi"
                        sx={{ m: 0 }}
                      />

                      {/* Yağmur Sensörü */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.yagmurSensoru}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  yagmurSensoru: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Yağmur Sensörü"
                        sx={{ m: 0 }}
                      />

                      {/* Çeki Demiri */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.cekiDemiri}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  cekiDemiri: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Çeki Demiri"
                        sx={{ m: 0 }}
                      />

                      {/* Turizm Paketi */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.turizmPaketi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  turizmPaketi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Turizm Paketi"
                        sx={{ m: 0 }}
                      />

                      {/* Okul Aracı */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.okulAraci}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  okulAraci: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Okul Aracı"
                        sx={{ m: 0 }}
                      />

                      {/* Bagaj Hacmi */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.bagajHacmi}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  bagajHacmi: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Geniş Bagaj Hacmi"
                        sx={{ m: 0 }}
                      />

                      {/* Sigortali */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.sigortali}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  sigortali: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Sigortali"
                        sx={{ m: 0 }}
                      />

                      {/* Garantili */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.detailFeatures.garantili}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  garantili: e.target.checked,
                                },
                              }))
                            }
                          />
                        }
                        label="Garantili"
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

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
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
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
                              setShowcasePreview(null);
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
                      Aracınızın farklı açılardan fotoğraflarını ekleyin (En
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
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#1e293b", mb: 1 }}
                  >
                    Videolar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aracınızın video tanıtımını ekleyerek daha fazla ilgi çekin
                    (Opsiyonel - Max 3 video, 100MB/video)
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "12px", mt: 0.5, display: "block" }}
                  >
                    İpucu: Yüklenen videoları hemen izleyerek kontrol
                    edebilirsiniz
                  </Typography>
                </Box>

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
                              poster=""
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
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  background: "rgba(0,0,0,0.8)",
                                  transform: "translate(-50%, -50%) scale(1.1)",
                                },
                              }}
                            >
                              ▶
                            </Box>

                            {/* Fullscreen Hint */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                background: "rgba(0,0,0,0.7)",
                                color: "white",
                                fontSize: "12px",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                pointerEvents: "none",
                              }}
                            >
                              🔍 Büyüt
                            </Box>
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

            {/* 🚀 İlan Yayınlama */}
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
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.showcasePhoto}
                  sx={{
                    minWidth: 250,
                    height: 56,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                      boxShadow: "0 6px 25px rgba(25, 118, 210, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: "#e0e0e0",
                      boxShadow: "none",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {loading ? "İlan Yayınlanıyor..." : "🚀 İlanı Yayınla"}
                </Button>
              </CardContent>
            </Card>
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
            backgroundColor: "#000",
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#1a1a1a",
            color: "white",
            py: 1,
          }}
        >
          <Typography variant="h6">
            Video Önizleme ({selectedVideoIndex + 1}/{formData.videos.length})
          </Typography>
          <IconButton onClick={closeVideoModal} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: "#000" }}>
          {videoPreviews[selectedVideoIndex] && (
            <video
              src={videoPreviews[selectedVideoIndex]}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                display: "block",
              }}
              controls={true}
              autoPlay
              muted
            />
          )}
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "#1a1a1a",
            justifyContent: "space-between",
            px: 2,
            py: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => navigateVideo("prev")}
              disabled={selectedVideoIndex === 0}
              startIcon={<ArrowBackIos />}
            >
              Önceki
            </Button>
            <Button
              onClick={() => navigateVideo("next")}
              disabled={selectedVideoIndex >= formData.videos.length - 1}
              endIcon={<ArrowForwardIos />}
            >
              Sonraki
            </Button>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ color: "white", fontSize: "14px" }}>
              {formData.videos[selectedVideoIndex]?.name} -{" "}
              {(
                formData.videos[selectedVideoIndex]?.size /
                (1024 * 1024)
              ).toFixed(1)}{" "}
              MB
            </Typography>
            <Typography sx={{ color: "#ccc", fontSize: "12px" }}>
              ESC: Kapat • ←→: Gezin
            </Typography>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={submitSuccess} onClose={handleSuccessClose}>
        <DialogTitle sx={{ textAlign: "center" }}>
          <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5">İlan Başarıyla Gönderildi!</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            İlanınız admin onayına gönderilmiştir. Onaylandıktan sonra
            yayınlanacaktır.
          </Alert>
          <Typography variant="body1" align="center">
            İlanınızın durumunu "İlanlarım" sayfasından takip edebilirsiniz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button onClick={handleSuccessClose} variant="contained" size="large">
            İlanlarım Sayfasına Git
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateMinibusAdForm;
