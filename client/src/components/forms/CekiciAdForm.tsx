import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  CloudUpload,
  PhotoCamera,
  Close,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import apiClient, { videoUploadClient } from "../../api/client";
import Header from "../layout/Header";
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

// Motor hacmi seçenekleri
const engineCapacityOptions = [
  { value: "", label: "Motor Hacmi Seçin" },
  { value: "1300-", label: "1300 cm³'e kadar" },
  { value: "1301-1600", label: "1301 - 1600 cm³" },
  { value: "1601-1800", label: "1601 - 1800 cm³" },
  { value: "1801-2000", label: "1801 - 2000 cm³" },
  { value: "2001-2500", label: "2001 - 2500 cm³" },
  { value: "2501-3000", label: "2501 - 3000 cm³" },
  { value: "3001-3500", label: "3001 - 3500 cm³" },
  { value: "3501-4000", label: "3501 - 4000 cm³" },
  { value: "4001-4500", label: "4001 - 4500 cm³" },
  { value: "4501-5000", label: "4501 - 5000 cm³" },
  { value: "5001+", label: "5001 cm³ ve üzeri" },
];

// Motor gücü seçenekleri
const enginePowerOptions = [
  { value: "", label: "Motor Gücü Seçin" },
  { value: "100-", label: "100 hp'ye kadar" },
  { value: "101-125", label: "101 - 125 hp" },
  { value: "126-150", label: "126 - 150 hp" },
  { value: "151-175", label: "151 - 175 hp" },
  { value: "176-200", label: "176 - 200 hp" },
  { value: "201-225", label: "201 - 225 hp" },
  { value: "226-250", label: "226 - 250 hp" },
  { value: "251-275", label: "251 - 275 hp" },
  { value: "276-300", label: "276 - 300 hp" },
  { value: "301-325", label: "301 - 325 hp" },
  { value: "326-350", label: "326 - 350 hp" },
  { value: "351-375", label: "351 - 375 hp" },
  { value: "376-400", label: "376 - 400 hp" },
  { value: "401-425", label: "401 - 425 hp" },
  { value: "426-450", label: "426 - 450 hp" },
  { value: "451-475", label: "451 - 475 hp" },
  { value: "476-500", label: "476 - 500 hp" },
  { value: "501+", label: "501 hp ve üzeri" },
];

// Renk seçenekleri
const colorOptions = [
  { value: "", label: "Renk Seçin" },
  { value: "bej", label: "Bej" },
  { value: "beyaz", label: "Beyaz" },
  { value: "bordo", label: "Bordo" },
  { value: "gri", label: "Gri" },
  { value: "gumus-gri", label: "Gümüş Gri" },
  { value: "kirmizi", label: "Kırmızı" },
  { value: "lacivert", label: "Lacivert" },
  { value: "mavi", label: "Mavi" },
  { value: "mor", label: "Mor" },
  { value: "pembe", label: "Pembe" },
  { value: "sari", label: "Sarı" },
  { value: "siyah", label: "Siyah" },
  { value: "turkuaz", label: "Turkuaz" },
  { value: "turuncu", label: "Turuncu" },
  { value: "yesil", label: "Yeşil" },
];

interface FormData {
  // Category/Brand/Model/Variant IDs
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;

  // Temel bilgiler
  title: string;
  description: string;
  year: string;
  price: string;
  mileage: string;
  condition: string;
  color: string;
  fuelType: string;
  transmission: string;

  // Çekici spesifik alanlar
  enginePower: string;
  engineCapacity: string;
  cabinType: string;
  bedCount: string;
  dorseAvailable: string;
  plateType: string;
  plateNumber: string;
  tireCondition: string;
  damageRecord: string;
  paintChange: string;
  exchange: string;
  hasAccidentRecord: string; // Hasar kaydı
  hasTramerRecord: string; // Tramer kaydı

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  showcasePhoto: File | null;
  photos: File[];
  videos: File[];

  // Özellikler
  features: {
    abs: boolean;
    esp: boolean;
    asr: boolean;
    alarm: boolean;
    ebv: boolean;
    airBag: boolean;
    sideAirbag: boolean;
    passengerAirbag: boolean;
    centralLock: boolean;
    immobilizer: boolean;
    headlightSensor: boolean;
    headlightWasher: boolean;
    rainSensor: boolean;
    pto: boolean;
    cruiseControl: boolean;
    airCondition: boolean;
    alloyWheel: boolean;
    cd: boolean;
    towHook: boolean;
    leatherSeat: boolean;
    electricMirror: boolean;
    electricWindow: boolean;
    fogLight: boolean;
    heatedSeats: boolean;
    powerSteering: boolean;
    memorySeats: boolean;
    retarder: boolean;
    spoiler: boolean;
    sunroof: boolean;
    radio: boolean;
    gps: boolean;
    tripComputer: boolean;
    windDeflector: boolean;
    table: boolean;
    flexibleReadingLight: boolean;
  };
}

// Yatak sayısı seçenekleri
const bedCountOptions = [
  { label: "Yok", value: "yok" },
  { label: "1 Yatak", value: "1" },
  { label: "2 Yatak", value: "2" },
  { label: "3 Yatak", value: "3" },
  { label: "4 Yatak", value: "4" },
];

// Kabin tipi seçenekleri
const cabinTypeOptions = ["Çift Kabin", "Yüksek", "Normal"];

const CekiciAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();
  const [searchParams] = useSearchParams();

  // URL'den gelen seçimler
  const selectedBrandSlug = brandSlug || searchParams.get("brand");
  const selectedModelSlug = modelSlug || searchParams.get("model");
  const selectedVariantSlug = variantSlug || searchParams.get("variant");
  const selectedCategorySlug = categorySlug || "cekici";

  console.log("URL Parametreleri:", {
    categorySlug: selectedCategorySlug,
    brandSlug: selectedBrandSlug,
    modelSlug: selectedModelSlug,
    variantSlug: selectedVariantSlug,
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);

  const [formData, setFormData] = useState<FormData>({
    // Category/Brand/Model/Variant IDs
    categoryId: "3", // Çekici kategorisi
    brandId: "",
    modelId: "",
    variantId: "",

    // Temel bilgiler
    title: "",
    description: "",
    year: "",
    price: "",
    mileage: "",
    condition: "ikinci-el",
    color: "",
    fuelType: "dizel",
    transmission: "manuel",

    // Çekici spesifik alanlar
    enginePower: "",
    engineCapacity: "",
    cabinType: "",
    bedCount: "yok",
    dorseAvailable: "yok",
    plateType: "tr-plakali",
    plateNumber: "",
    tireCondition: "",
    damageRecord: "hayir",
    paintChange: "hayir",
    exchange: "evet",
    hasAccidentRecord: "",
    hasTramerRecord: "",

    // Konum
    cityId: "",
    districtId: "",

    // Fotoğraflar
    showcasePhoto: null,
    photos: [],
    videos: [],

    // Özellikler
    features: {
      abs: false,
      esp: false,
      asr: false,
      alarm: false,
      ebv: false,
      airBag: false,
      sideAirbag: false,
      passengerAirbag: false,
      centralLock: false,
      immobilizer: false,
      headlightSensor: false,
      headlightWasher: false,
      rainSensor: false,
      pto: false,
      cruiseControl: false,
      airCondition: false,
      alloyWheel: false,
      cd: false,
      towHook: false,
      leatherSeat: false,
      electricMirror: false,
      electricWindow: false,
      fogLight: false,
      heatedSeats: false,
      powerSteering: false,
      memorySeats: false,
      retarder: false,
      spoiler: false,
      sunroof: false,
      radio: false,
      gps: false,
      tripComputer: false,
      windDeflector: false,
      table: false,
      flexibleReadingLight: false,
    },
  });

  // Şehirler ve ilçeleri yükle
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

  // URL parametrelerinden seçili öğeleri yükle
  useEffect(() => {
    const loadSelectedItems = async () => {
      try {
        // Brand yükle
        if (selectedBrandSlug) {
          console.log("Brand yükleniyor:", selectedBrandSlug);
          const brandResponse = await apiClient.get(
            `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}`
          );
          const brandData = brandResponse.data as Brand;
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
            `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}/models/${selectedModelSlug}`
          );
          const modelData = modelResponse.data as Model;
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
            `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}/models/${selectedModelSlug}/variants/${selectedVariantSlug}`
          );
          const variantData = variantResponse.data as Variant;
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

  // Brand/Model useEffect'leri
  useEffect(() => {
    const initializeForm = async () => {
      await loadBrands("cekici"); // Çekici kategorisi slug'ı
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

  // Brand/Model/Variant yükleme fonksiyonları
  const loadBrands = async (categorySlug: string) => {
    try {
      const response = await apiClient.get(
        `/categories/${categorySlug}/brands`
      );
      const brandsData = response.data as Brand[];

      // İlk brand'ı otomatik seç (eğer seçili değilse)
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
      setFormData((prev) => ({
        ...prev,
        modelId: "",
        variantId: "",
      }));
      return;
    }

    try {
      const response = await apiClient.get(
        `/categories/cekici/brands/${brandId}/models`
      );
      const modelsData = response.data as Model[];

      // Variant'ı temizle çünkü model değişti
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
        // İlk model seçilince variant'ı da yükle
        await loadVariants(firstModelId);
      }
    } catch (error) {
      console.error("❌ Modeller yüklenemedi:", error);
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
      const response = await apiClient.get(
        `/categories/cekici/brands/${formData.brandId}/models/${modelId}/variants`
      );
      const variantsData = response.data as Variant[];

      // İlk variant'ı otomatik seç (eğer seçili değilse)
      if (variantsData.length > 0 && !formData.variantId) {
        setFormData((prev) => ({
          ...prev,
          variantId: variantsData[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("❌ Varyantlar yüklenemedi:", error);
      setFormData((prev) => ({
        ...prev,
        variantId: "",
      }));
    }
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

  const handleFeatureChange = (
    feature: keyof FormData["features"],
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked,
      },
    }));
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (isShowcase) {
      setFormData((prev) => ({
        ...prev,
        showcasePhoto: files[0],
      }));
    } else {
      const newPhotos = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 15),
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
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
          alert(
            `⚠️ Sadece video dosyaları yükleyebilirsiniz. Geçersiz dosyalar: ${invalidFiles
              .map((f) => f.name)
              .join(", ")}`
          );
          return;
        }

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
  }, [videoModalOpen, navigateVideo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle (price ve mileage'ı parse ederek)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "videos" &&
          key !== "showcasePhoto" &&
          key !== "features" &&
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

      // Category/Brand/Model/Variant ID'lerini ekle
      submitData.append("categoryId", formData.categoryId);
      submitData.append("brandId", formData.brandId);
      submitData.append("modelId", formData.modelId);
      submitData.append("variantId", formData.variantId || "");

      // Legacy support için slug'ları da ekle
      submitData.append("categorySlug", categorySlug || "");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");

      // Özellikleri JSON olarak ekle
      submitData.append("features", JSON.stringify(formData.features));

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      // Videoları ekle
      console.log("🎥 Video sayısı:", formData.videos.length);
      formData.videos.forEach((video, index) => {
        console.log(
          `🎥 Video ${index} ekleniyor:`,
          video.name,
          video.size,
          "bytes"
        );
        submitData.append(`video_${index}`, video);
      });
      console.log("🎥 Tüm videolar FormData'ya eklendi");

      // Authentication token'ı al
      const token = getTokenFromStorage();
      if (!token) {
        alert("Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.");
        navigate("/login");
        return;
      }

      console.log("📤 Starting upload...");
      const response = await videoUploadClient.post("/ads/cekici", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
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
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 6,
          minHeight: "100vh",
          p: 0,
        }}
      >
        {/* Ana Başlık */}

        <form onSubmit={handleSubmit} style={{ padding: "0 32px 32px" }}>
          {/* Genel Bilgiler Kartı */}
          <Card
            elevation={6}
            sx={{
              mb: 4,
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
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Genel Bilgiler
                </Typography>
              </Box>

              {/* İlan Başlığı */}
              <TextField
                fullWidth
                label="İlan Başlığı"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
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
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />

              {/* Yıl, Fiyat, KM */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <TextField
                  label="Yıl"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  required
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <TextField
                  label="Fiyat (TL)"
                  value={formatNumber(formData.price)}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("price", rawValue);
                  }}
                  required
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <TextField
                  label="Kilometre"
                  value={formatNumber(formData.mileage)}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("mileage", rawValue);
                  }}
                  required
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Durum, Renk */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.condition}
                    onChange={(e) =>
                      handleInputChange("condition", e.target.value)
                    }
                    required
                    label="Durum"
                  >
                    <MenuItem value="sifir">Sıfır</MenuItem>
                    <MenuItem value="ikinci-el">İkinci El</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                  required
                >
                  <InputLabel>Renk</InputLabel>
                  <Select
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    label="Renk"
                  >
                    {colorOptions.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        {color.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Yakıt, Vites */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Yakıt Türü</InputLabel>
                  <Select
                    value={formData.fuelType}
                    onChange={(e) =>
                      handleInputChange("fuelType", e.target.value)
                    }
                    required
                    label="Yakıt Türü"
                  >
                    <MenuItem value="dizel">Dizel</MenuItem>
                    <MenuItem value="benzin">Benzin</MenuItem>
                    <MenuItem value="lpg">LPG</MenuItem>
                    <MenuItem value="elektrik">Elektrik</MenuItem>
                    <MenuItem value="hibrit">Hibrit</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Vites</InputLabel>
                  <Select
                    value={formData.transmission}
                    onChange={(e) =>
                      handleInputChange("transmission", e.target.value)
                    }
                    required
                    label="Vites"
                  >
                    <MenuItem value="manuel">Manuel</MenuItem>
                    <MenuItem value="otomatik">Otomatik</MenuItem>
                    <MenuItem value="yarimotomatik">Yarı Otomatik</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>

          {/* Teknik Özellikler Kartı */}
          <Card
            elevation={6}
            sx={{
              mb: 4,
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
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Teknik Özellikler
                </Typography>
              </Box>

              {/* Motor Gücü, Motor Hacmi */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                  required
                >
                  <InputLabel>Motor Gücü (HP)</InputLabel>
                  <Select
                    value={formData.enginePower}
                    onChange={(e) =>
                      handleInputChange("enginePower", e.target.value)
                    }
                    label="Motor Gücü (HP)"
                  >
                    {enginePowerOptions.map((power) => (
                      <MenuItem key={power.value} value={power.value}>
                        {power.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                  required
                >
                  <InputLabel>Motor Hacmi (cc)</InputLabel>
                  <Select
                    value={formData.engineCapacity}
                    onChange={(e) =>
                      handleInputChange("engineCapacity", e.target.value)
                    }
                    label="Motor Hacmi (cc)"
                  >
                    {engineCapacityOptions.map((capacity) => (
                      <MenuItem key={capacity.value} value={capacity.value}>
                        {capacity.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Kabin Tipi, Yatak Sayısı */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Kabin Tipi</InputLabel>
                  <Select
                    value={formData.cabinType}
                    onChange={(e) =>
                      handleInputChange("cabinType", e.target.value)
                    }
                    required
                    label="Kabin Tipi"
                  >
                    {cabinTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Yatak Sayısı</InputLabel>
                  <Select
                    value={formData.bedCount}
                    onChange={(e) =>
                      handleInputChange("bedCount", e.target.value)
                    }
                    required
                    label="Yatak Sayısı"
                  >
                    {bedCountOptions.map((bed) => (
                      <MenuItem key={bed.value} value={bed.value}>
                        {bed.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Dorse, Plaka Tipi */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Dorse Var Mı?</InputLabel>
                  <Select
                    value={formData.dorseAvailable}
                    onChange={(e) =>
                      handleInputChange("dorseAvailable", e.target.value)
                    }
                    required
                    label="Dorse Var Mı?"
                  >
                    <MenuItem value="var">Var</MenuItem>
                    <MenuItem value="yok">Yok</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Plaka Tipi</InputLabel>
                  <Select
                    value={formData.plateType}
                    onChange={(e) =>
                      handleInputChange("plateType", e.target.value)
                    }
                    required
                    label="Plaka Tipi"
                  >
                    <MenuItem value="tr-plakali">TR Plakalı</MenuItem>
                    <MenuItem value="yabanci-plakali">Yabancı Plakalı</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Plaka No, Lastik Durumu */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <TextField
                  label="Plaka No"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    handleInputChange("plateNumber", e.target.value)
                  }
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <TextField
                  label="Lastik Durumu"
                  value={formData.tireCondition}
                  onChange={(e) =>
                    handleInputChange("tireCondition", e.target.value)
                  }
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Hasar Kaydı, Boya, Takas */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
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
                    value={formData.damageRecord}
                    onChange={(e) =>
                      handleInputChange("damageRecord", e.target.value)
                    }
                    required
                    label="Hasar Kaydı"
                  >
                    <MenuItem value="evet">Var</MenuItem>
                    <MenuItem value="hayir">Yok</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Boyalı</InputLabel>
                  <Select
                    value={formData.paintChange}
                    onChange={(e) =>
                      handleInputChange("paintChange", e.target.value)
                    }
                    required
                    label="Boyalı"
                  >
                    <MenuItem value="evet">Evet</MenuItem>
                    <MenuItem value="hayir">Hayır</MenuItem>
                  </Select>
                </FormControl>
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
                    value={formData.exchange}
                    onChange={(e) =>
                      handleInputChange("exchange", e.target.value)
                    }
                    required
                    label="Takas"
                  >
                    <MenuItem value="evet">Evet</MenuItem>
                    <MenuItem value="hayır">Hayır</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Hasar Kaydı, Tramer Kaydı */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  mt: 3,
                }}
              >
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
              </Box>
            </CardContent>
          </Card>

          {/* Konum Kartı */}
          <Card
            elevation={6}
            sx={{
              mb: 4,
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
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Konum Bilgileri
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>İl</InputLabel>
                  <Select
                    value={formData.cityId}
                    onChange={(e) =>
                      handleInputChange("cityId", e.target.value)
                    }
                    required
                    label="İl"
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.plateCode} - {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>İlçe</InputLabel>
                  <Select
                    value={formData.districtId}
                    onChange={(e) =>
                      handleInputChange("districtId", e.target.value)
                    }
                    disabled={!formData.cityId}
                    required
                    label="İlçe"
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

          {/* Araç Özellikleri Kartı */}
          <Card
            elevation={6}
            sx={{
              mb: 4,
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
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Araç Özellikleri
                </Typography>
              </Box>

              {/* Güvenlik Özellikleri */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, fontWeight: "bold" }}
              >
                Güvenlik
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 2,
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.abs}
                      onChange={(e) =>
                        handleFeatureChange("abs", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="ABS"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.esp}
                      onChange={(e) =>
                        handleFeatureChange("esp", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="ESP"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.asr}
                      onChange={(e) =>
                        handleFeatureChange("asr", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="ASR"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.alarm}
                      onChange={(e) =>
                        handleFeatureChange("alarm", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Alarm"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.ebv}
                      onChange={(e) =>
                        handleFeatureChange("ebv", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="EBV"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.airBag}
                      onChange={(e) =>
                        handleFeatureChange("airBag", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hava Yastığı (Sürücü)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.sideAirbag}
                      onChange={(e) =>
                        handleFeatureChange("sideAirbag", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hava Yastığı (Yan)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.passengerAirbag}
                      onChange={(e) =>
                        handleFeatureChange("passengerAirbag", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hava Yastığı (Yolcu)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.centralLock}
                      onChange={(e) =>
                        handleFeatureChange("centralLock", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Merkezi Kilit"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.immobilizer}
                      onChange={(e) =>
                        handleFeatureChange("immobilizer", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Immobilizer"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.headlightSensor}
                      onChange={(e) =>
                        handleFeatureChange("headlightSensor", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Far Sensörü"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.headlightWasher}
                      onChange={(e) =>
                        handleFeatureChange("headlightWasher", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Far Yıkama Sistemi"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.rainSensor}
                      onChange={(e) =>
                        handleFeatureChange("rainSensor", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Yağmur Sensörü"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.pto}
                      onChange={(e) =>
                        handleFeatureChange("pto", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="PTO"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.cruiseControl}
                      onChange={(e) =>
                        handleFeatureChange("cruiseControl", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Yokuş Kalkış Desteği"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
              </Box>

              {/* Donanım Özellikleri */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 3, fontWeight: "bold" }}
              >
                Donanım
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 2,
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.airCondition}
                      onChange={(e) =>
                        handleFeatureChange("airCondition", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Klima"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.alloyWheel}
                      onChange={(e) =>
                        handleFeatureChange("alloyWheel", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Alaşım Jant"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.cd}
                      onChange={(e) =>
                        handleFeatureChange("cd", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="CD Çalar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.towHook}
                      onChange={(e) =>
                        handleFeatureChange("towHook", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Çeki Demiri"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.leatherSeat}
                      onChange={(e) =>
                        handleFeatureChange("leatherSeat", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Deri Döşeme"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.electricMirror}
                      onChange={(e) =>
                        handleFeatureChange("electricMirror", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Elektrikli Aynalar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.electricWindow}
                      onChange={(e) =>
                        handleFeatureChange("electricWindow", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Elektrikli Cam"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.fogLight}
                      onChange={(e) =>
                        handleFeatureChange("fogLight", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Far (Sis)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.heatedSeats}
                      onChange={(e) =>
                        handleFeatureChange("heatedSeats", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hafızalı Koltuklar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.powerSteering}
                      onChange={(e) =>
                        handleFeatureChange("powerSteering", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hidrolik Direksiyon"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.memorySeats}
                      onChange={(e) =>
                        handleFeatureChange("memorySeats", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Isıtmalı Koltuklar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.retarder}
                      onChange={(e) =>
                        handleFeatureChange("retarder", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Retarder"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.spoiler}
                      onChange={(e) =>
                        handleFeatureChange("spoiler", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Spoiler"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.sunroof}
                      onChange={(e) =>
                        handleFeatureChange("sunroof", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Sunroof"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.radio}
                      onChange={(e) =>
                        handleFeatureChange("radio", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Radio - Teyp"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.gps}
                      onChange={(e) =>
                        handleFeatureChange("gps", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="TV / Navigasyon"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.tripComputer}
                      onChange={(e) =>
                        handleFeatureChange("tripComputer", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Yol Bilgisayarı"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.windDeflector}
                      onChange={(e) =>
                        handleFeatureChange("windDeflector", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Cam Rüzgarlığı"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.table}
                      onChange={(e) =>
                        handleFeatureChange("table", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Masa"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.flexibleReadingLight}
                      onChange={(e) =>
                        handleFeatureChange(
                          "flexibleReadingLight",
                          e.target.checked
                        )
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Esnek Okuma Lambası"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Fotoğraflar Kartı */}
          <Card
            elevation={6}
            sx={{
              mb: 4,
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
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Fotoğraflar
                </Typography>
              </Box>

              {/* Vitrin Fotoğrafı */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Vitrin Fotoğrafı *
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
                    fullWidth
                    sx={{
                      mb: 2,
                      py: 2,
                      borderRadius: 3,
                      borderStyle: "dashed",
                      borderWidth: 2,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    Vitrin Fotoğrafı Seç
                  </Button>
                </label>
                {formData.showcasePhoto && (
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      border: "2px solid #e0e0e0",
                      borderRadius: 3,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(formData.showcasePhoto)}
                      alt="Vitrin"
                      style={{
                        maxWidth: "300px",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      {formData.showcasePhoto.name}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Diğer Fotoğraflar */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Diğer Fotoğraflar (En fazla 15 adet)
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
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{
                      mb: 3,
                      py: 2,
                      borderRadius: 3,
                      borderStyle: "dashed",
                      borderWidth: 2,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    Fotoğraf Ekle
                  </Button>
                </label>

                {formData.photos.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {formData.photos.map((photo, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "2px solid #e0e0e0",
                          "&:hover": {
                            borderColor: "#1976d2",
                            "& .delete-btn": {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          className="delete-btn"
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            minWidth: "24px",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            bgcolor: "error.main",
                            color: "white",
                            opacity: 0.7,
                            transition: "opacity 0.2s",
                            "&:hover": {
                              bgcolor: "error.dark",
                              opacity: 1,
                            },
                          }}
                        >
                          ×
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Videolar */}
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
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(45deg, #ff6b35 30%, #f7931e 90%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.5rem",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                    }}
                  >
                    🎬
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#1e293b" }}
                  >
                    Videolar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aracınızın video tanıtımını ekleyerek daha fazla ilgi çekin
                    (Opsiyonel - Max 3 video, 100MB/video)
                  </Typography>
                </Box>
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
                      🎬 Videolarınızı buraya sürükleyip bırakın veya seçin
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

          {/* Submit Button */}
          <Box sx={{ textAlign: "center", mb: 4, mt: 5 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.showcasePhoto}
              size="large"
              sx={{
                py: 2,
                px: 6,
                borderRadius: 3,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #2c3540 0%, #b8392f 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                },
                "&:disabled": {
                  background: "#cccccc",
                },
              }}
            >
              {loading ? "İlan Yayınlanıyor..." : "🚀 İlanı Yayınla"}
            </Button>
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
          <IconButton
            onClick={closeVideoModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              zIndex: 10,
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <Close />
          </IconButton>

          {/* Previous Button */}
          {formData.videos.length > 1 && (
            <IconButton
              onClick={() => navigateVideo("prev")}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}

          {/* Next Button */}
          {formData.videos.length > 1 && (
            <IconButton
              onClick={() => navigateVideo("next")}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <ChevronRight />
            </IconButton>
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
      <Dialog open={submitSuccess} onClose={handleSuccessClose}>
        <DialogTitle sx={{ textAlign: "center" }}>
          <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5">İlan Başarıyla Gönderildi!</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            İlanınız henüz yayında değil! Admin onayı bekliyor. Onaylandıktan
            sonra anasayfada görünecektir.
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

export default CekiciAdForm;
