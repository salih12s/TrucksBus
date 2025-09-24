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
  Chip,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  PhotoCamera,
  EditNote,
  LocalShipping,
  LocationOn,
  Settings,
  Security,
  Build,
  Style,
  Close,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import apiClient from "../../api/client";
import Header from "../layout/Header";

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

// Renk seçenekleri
const colorOptions = [
  "Bej",
  "Beyaz",
  "Bordo",
  "Gri",
  "Gümüş Gri",
  "Kahverengi",
  "Kırmızı",
  "Lacivert",
  "Mavi",
  "Mor",
  "Pembe",
  "Sarı",
  "Siyah",
  "Turkuaz",
  "Turuncu",
  "Yeşil",
];

// Motor Gücü seçenekleri
const motorPowerOptions = [
  "200-250 HP",
  "250-300 HP",
  "300-350 HP",
  "350-400 HP",
  "400-450 HP",
  "450-500 HP",
  "500-550 HP",
  "550-600 HP",
  "600+ HP",
];

// Çekiş seçenekleri (yeni)
const drivetrainOptions = [
  "4x2",
  "4x4",
  "6x2",
  "6x4",
  "6x6",
  "8x2",
  "8x2x2",
  "8x2x4",
  "8x4x4",
  "8x8x4",
];

// Taşıma Kapasitesi seçenekleri (yeni)
const loadCapacityOptions = [
  "0 - 1.500",
  "1.501 - 3.000",
  "3.001 - 3.500",
  "3.501 - 5.000",
  "5.001 - 10.000",
  "10.001 - 20.000",
  "20.001 - 30.000",
  "30.001 - 40.000",
];

// Kabin seçenekleri (yeni)
const cabinOptions = ["Çift Kabin", "Yüksek Kabin", "Normal Kabin"];

// Vites seçenekleri (sadeleştirildi)
const transmissionOptions = ["Manuel", "Otomatik"];

// Yakıt tipi seçenekleri
const fuelTypeOptions = ["Dizel", "Benzin", "LPG", "Elektrik", "Hibrit"];

// Durumu seçenekleri
const conditionOptions = ["Sıfır", "Sıfır Ayarında", "İkinci El", "Hasarlı"];

// Üst yapı seçenekleri (yeni)
const superstructureOptions = [
  "Açık Kasa",
  "Ahşap Damper",
  "Ahşap Kasa",
  "Ambulans",
  "Cenaze Aracı",
  "Çöp Kamyonu",
  "Fiber Kasa",
  "Frigorifik",
  "Hardox Damper",
  "Havuz Damper",
  "Kapalı Kasa",
  "Lowbed",
  "Merdivenli İtfaiye Aracı",
  "Meşrubat Kasası",
  "Saç Damper",
  "Saç Kasa",
  "Şasi",
  "Tanker",
  "Temizlik Kamyonu",
  "Tenteli Kasa",
  "Transmikser",
  "Vidanjör",
];

interface FormData {
  // Category/Brand/Model/Variant IDs
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
  motorPower: string;
  drivetrain: string;
  color: string;
  loadCapacity: string; // Taşıma kapasitesi (kg)
  cabin: string; // Kabin tipi
  tireCondition: string; // Lastik durumu (%)
  transmission: string;
  fuelType: string;
  superstructure: string; // Üst yapı
  exchange: string;
  hasAccidentRecord: string; // Hasar kaydı
  hasTramerRecord: string; // Tramer kaydı
  plateType: string;
  plateNumber: string;
  cityId: string;
  districtId: string;
  address: string;
  detailedInfo: string;
  photos: File[];
  videos: File[];
  showcasePhoto: File | null;
  // Detay özellikleri (3 kategoriye ayrıldı)
  detailFeatures: {
    // Güvenlik
    abs?: boolean;
    adr?: boolean;
    alarm?: boolean;
    asr?: boolean;
    ebv?: boolean;
    esp?: boolean;
    havaYastigiSurucu?: boolean;
    havaYastigiYolcu?: boolean;
    immobilizer?: boolean;
    merkeziKilit?: boolean;
    retarder?: boolean;
    yokusKalkisDestegi?: boolean;
    yanHavaYastigi?: boolean;

    // İç Donanım
    cdCalar?: boolean;
    deriDoseme?: boolean;
    elektrikliAynalar?: boolean;
    elektrikliCam?: boolean;
    havatliKoltuk?: boolean;
    hizSabitleme?: boolean;
    hidrolikDireksiyon?: boolean;
    isitmalKoltuklar?: boolean;
    klima?: boolean;
    masa?: boolean;
    radioTeyp?: boolean;
    startStop?: boolean;
    tvNavigasyon?: boolean;
    yolBilgisayari?: boolean;

    // Dış Donanım
    alasimJant?: boolean;
    camRuzgarligi?: boolean;
    cekiDemiri?: boolean;
    farSis?: boolean;
    farSensoru?: boolean;
    farYikamaSistemi?: boolean;
    aynalarElektrikli?: boolean;
    aynalarKattanir?: boolean;
    spoyler?: boolean;
    sunroof?: boolean;
    xenonFar?: boolean;
    yagmurSensoru?: boolean;
  };
}

const KamyonAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();
  const [searchParams] = useSearchParams();

  // URL'den gelen seçimler
  const selectedBrandSlug = brandSlug || searchParams.get("brand");
  const selectedModelSlug = modelSlug || searchParams.get("model");
  const selectedVariantSlug = variantSlug || searchParams.get("variant");
  const selectedCategorySlug = categorySlug || "kamyon-kamyonet";

  console.log("URL Parametreleri:", {
    categorySlug: selectedCategorySlug,
    brandSlug: selectedBrandSlug,
    modelSlug: selectedModelSlug,
    variantSlug: selectedVariantSlug,
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);

  // Seçili olan brand, model ve variant bilgileri
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const [formData, setFormData] = useState<FormData>({
    // Category/Brand/Model/Variant IDs
    categoryId: "2", // Kamyon & Kamyonet kategorisi
    brandId: "",
    modelId: "",
    variantId: "",

    title: "",
    description: "",
    year: "",
    price: "",
    mileage: "",
    condition: "ikinci-el",
    motorPower: "",
    drivetrain: "4x2",
    color: "",
    loadCapacity: "",
    cabin: "standart",
    tireCondition: "",
    transmission: "manuel",
    fuelType: "dizel",
    superstructure: "",
    exchange: "hayir",
    plateType: "tr-plakali",
    plateNumber: "",
    cityId: "",
    districtId: "",
    address: "",
    detailedInfo: "",
    photos: [],
    videos: [],
    showcasePhoto: null,
    detailFeatures: {},
    hasAccidentRecord: "",
    hasTramerRecord: "",
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
          setDistricts([]);
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
            `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}/models/${selectedModelSlug}`
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
            `/categories/${selectedCategorySlug}/brands/${selectedBrandSlug}/models/${selectedModelSlug}/variants/${selectedVariantSlug}`
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
      await loadBrands("kamyon-kamyonet"); // Kamyon kategorisi slug'ı
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
      setBrands(brandsData);

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
    try {
      // Brand ID'den slug'ı bul
      const brand = brands.find((b) => b.id.toString() === brandId);
      if (!brand) {
        console.error("Brand bulunamadı:", brandId);
        return;
      }

      const response = await apiClient.get(
        `/categories/kamyon-kamyonet/brands/${brand.slug}/models`
      );
      const modelsData = response.data as Model[];
      setModels(modelsData);

      // İlk model'i otomatik seç (eğer seçili değilse)
      if (modelsData.length > 0 && !formData.modelId) {
        setFormData((prev) => ({
          ...prev,
          modelId: modelsData[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("Modeller yüklenemedi:", error);
    }
  };

  const loadVariants = async (modelId: string) => {
    try {
      // Model ID'den slug'ı bul
      const model = models.find((m) => m.id.toString() === modelId);
      const brand = brands.find((b) => b.id.toString() === formData.brandId);

      if (!model || !brand) {
        console.error(
          "Model veya Brand bulunamadı:",
          modelId,
          formData.brandId
        );
        return;
      }

      const response = await apiClient.get(
        `/categories/kamyon-kamyonet/brands/${brand.slug}/models/${model.slug}/variants`
      );
      const variantsData = response.data as Variant[];
      setVariants(variantsData);

      // İlk variant'ı otomatik seç (eğer seçili değilse)
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

  const handleInputChange = (field: keyof FormData, value: string) => {
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
          newPhotos.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              newPreviews.push(e.target?.result as string);
              if (newPreviews.length === newPhotos.length) {
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
        // Video dosya boyutu kontrolü (100MB limit)
        const oversizedFiles = newVideos.filter(
          (file) => file.size > 100 * 1024 * 1024
        );
        if (oversizedFiles.length > 0) {
          console.error("Video dosyası çok büyük:", oversizedFiles);
          alert(
            `⚠️ Video dosyası 100MB'dan büyük olamaz. Büyük dosyalar: ${oversizedFiles
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
  }, [videoModalOpen, navigateVideo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Kamyon form debug
      console.log(
        "Kamyon Form Data hasAccidentRecord:",
        formData.hasAccidentRecord
      );
      console.log(
        "Kamyon Form Data hasTramerRecord:",
        formData.hasTramerRecord
      );
      console.log("Kamyon Form Data motorPower:", formData.motorPower);

      const submitData = new FormData();

      // Temel bilgileri ekle (price ve mileage'ı parse ederek)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "videos" &&
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

      // Detay özelliklerini JSON olarak ekle (server "features" alanını bekliyor)
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

      const response = await apiClient.post("/ads/kamyon", submitData, {
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
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <EditNote sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Temel Bilgiler
                  </Typography>
                </Box>

                {/* İlan Başlığı */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="İlan Başlığı"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    variant="outlined"
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
                <Box>
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
                    variant="outlined"
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
              </CardContent>
            </Card>

            {/* 🚛 Araç Detayları */}
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
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <LocalShipping sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Araç Detayları
                  </Typography>
                </Box>

                {/* Marka ve Model Seçimi */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  {/* Marka Seçimi */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Marka *</InputLabel>
                    <Select
                      value={formData.brandId}
                      label="Marka *"
                      disabled={!!selectedBrand}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          brandId: e.target.value,
                          modelId: "",
                          variantId: "",
                        }));
                      }}
                    >
                      {/* Seçili marka varsa onu göster */}
                      {selectedBrand && (
                        <MenuItem value={selectedBrand.id.toString()}>
                          {selectedBrand.name} (Seçili)
                        </MenuItem>
                      )}
                      {/* Diğer markalar */}
                      {!selectedBrand &&
                        brands.map((brand) => (
                          <MenuItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  {/* Model Seçimi */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Model *</InputLabel>
                    <Select
                      value={formData.modelId}
                      label="Model *"
                      disabled={!!selectedModel || !formData.brandId}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          modelId: e.target.value,
                          variantId: "",
                        }));
                      }}
                    >
                      {/* Seçili model varsa onu göster */}
                      {selectedModel && (
                        <MenuItem value={selectedModel.id.toString()}>
                          {selectedModel.name} (Seçili)
                        </MenuItem>
                      )}
                      {/* Diğer modeller */}
                      {!selectedModel &&
                        models.map((model) => (
                          <MenuItem key={model.id} value={model.id.toString()}>
                            {model.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Variant Seçimi */}
                {(variants.length > 0 || selectedVariant) && (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Variant</InputLabel>
                    <Select
                      value={formData.variantId}
                      label="Variant"
                      disabled={!!selectedVariant}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          variantId: e.target.value,
                        }));
                      }}
                    >
                      {/* Seçili variant varsa onu göster */}
                      {selectedVariant && (
                        <MenuItem value={selectedVariant.id.toString()}>
                          {selectedVariant.name} (Seçili)
                        </MenuItem>
                      )}
                      {/* Diğer variantlar */}
                      {!selectedVariant &&
                        variants.map((variant) => (
                          <MenuItem
                            key={variant.id}
                            value={variant.id.toString()}
                          >
                            {variant.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                )}

                {/* Yıl, Fiyat, KM */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Model Yılı"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                    inputProps={{
                      min: 1990,
                      max: new Date().getFullYear() + 1,
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Fiyat (TL)"
                    type="text"
                    value={formatNumber(formData.price)}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFormattedNumber(e.target.value)
                      )
                    }
                    required
                    variant="outlined"
                    placeholder="Örn: 250.000"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Kilometre"
                    type="text"
                    value={formatNumber(formData.mileage)}
                    onChange={(e) =>
                      handleInputChange(
                        "mileage",
                        parseFormattedNumber(e.target.value)
                      )
                    }
                    required
                    variant="outlined"
                    placeholder="Örn: 125.000"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />
                </Box>

                {/* Araç Durumu ve Taşıma Kapasitesi */}
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
                      {conditionOptions.map((option) => (
                        <MenuItem
                          key={option}
                          value={option.toLowerCase().replace(/\s+/g, "-")}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>
                              {option === "Sıfır"
                                ? "✨"
                                : option === "Sıfır Ayarında"
                                ? "🌟"
                                : option === "İkinci El"
                                ? "🔄"
                                : "⚠️"}
                            </span>
                            {option}
                          </Box>
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
                    <InputLabel>Taşıma Kapasitesi (kg)</InputLabel>
                    <Select
                      value={formData.loadCapacity}
                      onChange={(e) =>
                        handleInputChange("loadCapacity", e.target.value)
                      }
                      label="Taşıma Kapasitesi (kg)"
                    >
                      {loadCapacityOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>⚖️</span> {option} kg
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Motor Gücü ve Çekiş */}
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>💪</span> {option}
                          </Box>
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
                    <InputLabel>Çekiş</InputLabel>
                    <Select
                      value={formData.drivetrain}
                      onChange={(e) =>
                        handleInputChange("drivetrain", e.target.value)
                      }
                      label="Çekiş"
                    >
                      {drivetrainOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>🔧</span> {option}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Renk ve Kabin */}
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
                    <InputLabel>Renk</InputLabel>
                    <Select
                      value={formData.color}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      label="Renk"
                    >
                      {colorOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>🎨</span> {option}
                          </Box>
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
                    <InputLabel>Kabin Tipi</InputLabel>
                    <Select
                      value={formData.cabin}
                      onChange={(e) =>
                        handleInputChange("cabin", e.target.value)
                      }
                      label="Kabin Tipi"
                    >
                      {cabinOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>🚗</span> {option}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Lastik Durumu, Vites Tipi, Üst Yapı */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 3,
                    mb: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Lastik Durumu (%)"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    value={formData.tireCondition}
                    onChange={(e) =>
                      handleInputChange("tireCondition", e.target.value)
                    }
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />

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
                    <InputLabel>Vites Tipi</InputLabel>
                    <Select
                      value={formData.transmission}
                      onChange={(e) =>
                        handleInputChange("transmission", e.target.value)
                      }
                      label="Vites Tipi"
                    >
                      {transmissionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>⚙️</span> {option}
                          </Box>
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
                    <InputLabel>Üst Yapı</InputLabel>
                    <Select
                      value={formData.superstructure}
                      onChange={(e) =>
                        handleInputChange("superstructure", e.target.value)
                      }
                      label="Üst Yapı"
                    >
                      {superstructureOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>🏗️</span> {option}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Yakıt Tipi ve Takaslı */}
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
                    <InputLabel>Yakıt Tipi</InputLabel>
                    <Select
                      value={formData.fuelType}
                      onChange={(e) =>
                        handleInputChange("fuelType", e.target.value)
                      }
                      label="Yakıt Tipi"
                    >
                      {fuelTypeOptions.map((option) => (
                        <MenuItem key={option} value={option.toLowerCase()}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>⛽</span> {option}
                          </Box>
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
                      <MenuItem value="evet">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⚠️</span> Evet
                        </Box>
                      </MenuItem>
                      <MenuItem value="hayir">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>✅</span> Hayır
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
                    <InputLabel>Tramer Kaydı</InputLabel>
                    <Select
                      value={formData.hasTramerRecord || ""}
                      onChange={(e) =>
                        handleInputChange("hasTramerRecord", e.target.value)
                      }
                      label="Tramer Kaydı"
                    >
                      <MenuItem value="evet">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>📋</span> Evet
                        </Box>
                      </MenuItem>
                      <MenuItem value="hayir">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>✅</span> Hayır
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Plaka/Uyruk ve Araç Plakası */}
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
                      <MenuItem value="tr-plakali">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🇹🇷</span> TR Plakalı
                        </Box>
                      </MenuItem>
                      <MenuItem value="yabanci-plakali">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🌍</span> Yabancı Plakalı
                        </Box>
                      </MenuItem>
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

                {/* Detaylı Bilgi */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Detaylı Bilgi"
                    value={formData.detailedInfo}
                    onChange={(e) =>
                      handleInputChange("detailedInfo", e.target.value)
                    }
                    placeholder="Kamyonunuz hakkında detaylı bilgi verebilirsiniz..."
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
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <LocationOn sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Konum Bilgileri
                  </Typography>
                </Box>

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
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Adres */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Adres"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Mahalle, sokak, cadde bilgilerinizi giriniz..."
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
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <Settings sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Araç Özellikleri
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4, textAlign: "center", fontStyle: "italic" }}
                >
                  Kamyonunuzda bulunan özel özellikleri seçerek ilanınızı daha
                  çekici hale getirin
                </Typography>

                {/* 🛡️ Güvenlik Özellikleri */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#d32f2f",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Security sx={{ color: "#d32f2f" }} />
                    Güvenlik Özellikleri
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 2,
                      p: 3,
                      backgroundColor: "#ffebee",
                      borderRadius: 2,
                      border: "1px solid #ffcdd2",
                    }}
                  >
                    {[
                      { key: "abs", label: "ABS" },
                      { key: "adr", label: "ADR" },
                      { key: "alarm", label: "Alarm" },
                      { key: "asr", label: "ASR" },
                      { key: "ebv", label: "EBV" },
                      { key: "esp", label: "ESP" },
                      {
                        key: "havaYastigiSurucu",
                        label: "Sürücü Hava Yastığı",
                      },
                      { key: "havaYastigiYolcu", label: "Yolcu Hava Yastığı" },
                      { key: "immobilizer", label: "Immobilizer" },
                      { key: "merkeziKilit", label: "Merkezi Kilit" },
                      { key: "retarder", label: "Retarder" },
                      {
                        key: "yokusKalkisDestegi",
                        label: "Yokuş Kalkış Desteği",
                      },
                      { key: "yanHavaYastigi", label: "Yan Hava Yastığı" },
                    ].map((feature) => (
                      <FormControlLabel
                        key={feature.key}
                        control={
                          <Checkbox
                            checked={
                              formData.detailFeatures[
                                feature.key as keyof typeof formData.detailFeatures
                              ]
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  [feature.key]: e.target.checked,
                                },
                              }))
                            }
                            sx={{ color: "#d32f2f" }}
                          />
                        }
                        label={feature.label}
                        sx={{ m: 0 }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* 🏠 İç Donanım */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#1976d2",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Build sx={{ color: "#1976d2" }} />
                    İç Donanım
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 2,
                      p: 3,
                      backgroundColor: "#e3f2fd",
                      borderRadius: 2,
                      border: "1px solid #bbdefb",
                    }}
                  >
                    {[
                      { key: "cdCalar", label: "CD Çalar" },
                      { key: "deriDoseme", label: "Deri Döşeme" },
                      { key: "elektrikliAynalar", label: "Elektrikli Aynalar" },
                      { key: "elektrikliCam", label: "Elektrikli Cam" },
                      { key: "havatliKoltuk", label: "Havalı Koltuk" },
                      { key: "hizSabitleme", label: "Hız Sabitleme" },
                      {
                        key: "hidrolikDireksiyon",
                        label: "Hidrolik Direksiyon",
                      },
                      { key: "isitmalKoltuklar", label: "Isıtmalı Koltuklar" },
                      { key: "klima", label: "Klima" },
                      { key: "masa", label: "Masa" },
                      { key: "radioTeyp", label: "Radyo Teyp" },
                      { key: "startStop", label: "Start Stop" },
                      { key: "tvNavigasyon", label: "TV Navigasyon" },
                      { key: "yolBilgisayari", label: "Yol Bilgisayarı" },
                    ].map((feature) => (
                      <FormControlLabel
                        key={feature.key}
                        control={
                          <Checkbox
                            checked={
                              formData.detailFeatures[
                                feature.key as keyof typeof formData.detailFeatures
                              ]
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  [feature.key]: e.target.checked,
                                },
                              }))
                            }
                            sx={{ color: "#1976d2" }}
                          />
                        }
                        label={feature.label}
                        sx={{ m: 0 }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* 🎨 Dış Donanım */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#388e3c",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Style sx={{ color: "#388e3c" }} />
                    Dış Donanım
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 2,
                      p: 3,
                      backgroundColor: "#e8f5e8",
                      borderRadius: 2,
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    {[
                      { key: "alasimJant", label: "Alaşım Jant" },
                      { key: "camRuzgarligi", label: "Cam Rüzgarlığı" },
                      { key: "cekiDemiri", label: "Çeki Demiri" },
                      { key: "farSis", label: "Far Sis" },
                      { key: "farSensoru", label: "Far Sensörü" },
                      { key: "farYikamaSistemi", label: "Far Yıkama Sistemi" },
                      { key: "aynalarElektrikli", label: "Elektrikli Aynalar" },
                      { key: "aynalarKattanir", label: "Katlanır Aynalar" },
                      { key: "spoyler", label: "Spoiler" },
                      { key: "sunroof", label: "Sunroof" },
                      { key: "xenonFar", label: "Xenon Far" },
                      { key: "yagmurSensoru", label: "Yağmur Sensörü" },
                    ].map((feature) => (
                      <FormControlLabel
                        key={feature.key}
                        control={
                          <Checkbox
                            checked={
                              formData.detailFeatures[
                                feature.key as keyof typeof formData.detailFeatures
                              ]
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                detailFeatures: {
                                  ...prev.detailFeatures,
                                  [feature.key]: e.target.checked,
                                },
                              }))
                            }
                            sx={{ color: "#388e3c" }}
                          />
                        }
                        label={feature.label}
                        sx={{ m: 0 }}
                      />
                    ))}
                  </Box>
                </Box>
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
                      Aracınızın video tanıtımını ekleyerek daha fazla ilgi
                      çekin (Opsiyonel - Max 3 video, 100MB/video)
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
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !formData.showcasePhoto}
                sx={{
                  minWidth: 250,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  background:
                    "linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)",
                  boxShadow: "0 4px 20px rgba(255, 107, 53, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #E55A2B 30%, #E0841A 90%)",
                    boxShadow: "0 6px 25px rgba(255, 107, 53, 0.6)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "#cccccc",
                    boxShadow: "none",
                  },
                }}
              >
                {loading ? "İlan Yayınlanıyor..." : "🚛 İlanı Yayınla"}
              </Button>
            </Box>
          </Box>
        </form>
      </Container>
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
          <IconButton
            onClick={closeVideoModal}
            sx={{ color: "white" }}
            size="small"
          >
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
              sx={{ color: "white" }}
              startIcon={<ArrowBackIos />}
            >
              Önceki
            </Button>
            <Button
              onClick={() => navigateVideo("next")}
              disabled={selectedVideoIndex >= formData.videos.length - 1}
              sx={{ color: "white" }}
              endIcon={<ArrowForwardIos />}
            >
              Sonraki
            </Button>
          </Box>
          <Button onClick={closeVideoModal} sx={{ color: "white" }}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KamyonAdForm;
