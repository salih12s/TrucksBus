import React, { useState, useEffect } from "react";
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
  Umbrella,
  DateRange,
  VideoLibrary,
  PlayArrow,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/client";
import SuccessModal from "../../common/SuccessModal";

// Çatı Perde Sistemi Türleri
const CATI_PERDE_SISTEMLERI = [
  "Hızlı Kayar Perde",
  "Sabit Tente",
  "Tulum Kayar Perde",
  "Yana Kayar Perde",
  "Tavana Sabit Yana Kayar Perde",
];

// Midilli Dorse Markaları - MainLayout'tan alındı
const MIDILLI_BRANDS = [
  "Seçiniz",
  "Abd Treyler",
  "Adem Usta Proohauss",
  "AGS Treyler",
  "Ağaçlı Treyler",
  "Akar Cihat",
  "Akmanlar Damper",
  "Alamen",
  "Alp-Kar",
  "Alpsan",
  "Altınordu",
  "ART Trailer",
  "Askan Treyler",
  "ASY Treyler",
  "Beyfem Dorse",
  "Bio Treyler",
  "Can Damper Karoser",
  "Cangüller Treyler",
  "Carrier Trailer",
  "Caselli",
  "Coşgun Dorse",
  "Çavdaroğlu",
  "Doruk Treyler",
  "EFK Treyler",
  "ELM Treysan Trailer",
  "Esatech Trailer",
  "Fliegl",
  "Fors Treyler",
  "Fruehauf",
  "Global City",
  "Global City Treyler",
  "Gökhanlar",
  "Gülistan",
  "Gürel Dorse",
  "Güreoğlu Dorse",
  "Iskar Treyler",
  "İhsan Treyler",
  "İkiKardeş Dorse",
  "İkon Treyler",
  "İNC Seçkinler",
  "Kalkan Treyler",
  "Karalar Treyler",
  "Kassbohrer",
  "King",
  "Koluman",
  "Konza Trailer",
  "Kögel",
  "Krone",
  "M. Seymak Treyler",
  "Margaritelli",
  "Marrka Treyler",
  "MAS Trailer",
  "Maxtır Trailer",
  "Mehsan Treyler",
  "Merttaş Dorse",
  "Mobil Treyler",
  "MRC Treyler",
  "MS Muratsan Treyler",
  "Nedex",
  "Neka Treyler",
  "Nett",
  "Nükte Trailer",
  "Oktar Treyler",
  "Optimak Treyler",
  "Ormanlı Treyler",
  "Orthaus Treyler",
  "OtoÇinler",
  "Oymak Cargomaster",
  "Oymak Träger",
  "Öztfn Treyler",
  "Paşalar Mehmet Treyler",
  "Paşalar Treyler",
  "Paşaoğlu Dorse Treyler",
  "Ram-Kar",
  "Ram Treyler",
  "Reis Treyler",
  "Sancak Treyler",
  "Schmitz",
  "Self Frigo",
  "Semitürk",
  "Sena Treyler",
  "Serin Treyler",
  "Serra Treyler",
  "Serpin",
  "Serval Dorse Makine",
  "Serval Makine",
  "Set Treyler",
  "Seyit Usta",
  "Simboxx",
  "Sim Treyler",
  "Sistem Damper Treyler",
  "Sommer",
  "Star Yağcılar",
  "Takdir Dorse",
  "Tanı Tır",
  "Taşkır",
  "Temsa",
  "Tirkon",
  "Tırsan",
  "Traco",
  "Transfer Treyler",
  "Warkas",
  "Wielton",
  "Yalımsan Treyler",
  "Yeksan Treyler",
  "Yelsan Treyler",
  "Yıldızlar Damper",
  "Yıldız Treyler",
  "Yiğitsan",
  "Zafer Treyler",
  "Özel Üretim",
  "Diğer",
];

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

interface MidilliFormData {
  // Genel Bilgiler
  title: string;
  description: string;
  year: number;
  price: string;
  currency: string;
  dorseBrand: string; // Dorse markası

  // Brand/Model/Variant
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;

  // Teknik Özellikler
  uzunluk: number;
  lastikDurumu: number;
  catiPerdeSistemi: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // Video
  videos: File[];

  // Ekstra
  warranty: boolean;
  negotiable: boolean;
  exchange: boolean;

  detailedInfo: string;

  // İletişim bilgileri
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  city?: string;
  district?: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "İletişim & Fiyat"];

const MidilliForm: React.FC = () => {
  const navigate = useNavigate();
  const { brandSlug, modelSlug, variantSlug } = useParams<{
    brandSlug: string;
    modelSlug: string;
    variantSlug: string;
  }>();

  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showcaseImageIndex, setShowcaseImageIndex] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  // Video states
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Brand/Model/Variant states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [, setLoadingBrands] = useState(false);
  const [, setLoadingModels] = useState(false);
  const [, setLoadingVariants] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<MidilliFormData>({
    title: "",
    description: "",
    year: 0,
    price: "",
    currency: "TRY",
    dorseBrand: "Seçiniz",
    categoryId: "",
    brandId: "",
    modelId: "",
    variantId: variantSlug || "",
    uzunluk: 0,
    lastikDurumu: 100,
    catiPerdeSistemi: "",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    videos: [],
    warranty: false,
    negotiable: false,
    exchange: false,
    detailedInfo: "",
  });

  // Video handling functions
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const videoFiles = Array.from(files).filter((file) =>
        file.type.startsWith("video/"),
      );

      if (videoFiles.length > 0) {
        const totalVideos = formData.videos.length + videoFiles.length;
        if (totalVideos > 5) {
          alert("En fazla 5 video yükleyebilirsiniz.");
          return;
        }

        videoFiles.forEach((file) => {
          if (file.size > 50 * 1024 * 1024) {
            alert(`${file.name} dosyası 50MB'dan büyük olamaz.`);
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            const videoUrl = e.target?.result as string;

            setFormData((prev) => ({
              ...prev,
              videos: [...prev.videos, file],
            }));

            setVideoPreviews((prev) => [...prev, videoUrl]);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const openVideoModal = (index: number) => {
    setCurrentVideoIndex(index);
    setVideoModalOpen(true);
  };

  // Auto-load category ID - Dorse category ID (integer)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      categoryId: "6", // Dorse category ID
    }));
  }, []);

  // Auto-load brand/model/variant from URL slugs
  useEffect(() => {
    const loadFromSlugs = async () => {
      console.log("🔄 Loading from URL slugs:", {
        brandSlug,
        modelSlug,
        variantSlug,
      });
      try {
        if (brandSlug) {
          console.log(`🔍 Looking for brand: ${brandSlug}`);
          setLoadingBrands(true);
          const response = await apiClient.get("/brands");
          const allBrands = response.data as Brand[];
          setBrands(allBrands);

          const selectedBrand = allBrands.find(
            (b: Brand) => b.slug === brandSlug,
          );
          if (selectedBrand) {
            console.log(
              `✅ Brand found: ${selectedBrand.name} (ID: ${selectedBrand.id})`,
            );
            setFormData((prev) => ({
              ...prev,
              brandId: selectedBrand.id.toString(),
            }));

            if (modelSlug) {
              console.log(`🔍 Looking for model: ${modelSlug}`);
              setLoadingModels(true);
              const modelResponse = await apiClient.get(
                `/brands/${selectedBrand.id}/models`,
              );
              const brandModels = modelResponse.data as Model[];
              setModels(brandModels);

              const selectedModel = brandModels.find(
                (m: Model) => m.slug === modelSlug,
              );
              if (selectedModel) {
                console.log(
                  `✅ Model found: ${selectedModel.name} (ID: ${selectedModel.id})`,
                );
                setFormData((prev) => ({
                  ...prev,
                  modelId: selectedModel.id.toString(),
                }));

                if (variantSlug) {
                  console.log(`🔍 Looking for variant: ${variantSlug}`);
                  setLoadingVariants(true);
                  const variantResponse = await apiClient.get(
                    `/models/${selectedModel.id}/variants`,
                  );
                  const modelVariants = variantResponse.data as Variant[];
                  setVariants(modelVariants);

                  const selectedVariant = modelVariants.find(
                    (v: Variant) => v.slug === variantSlug,
                  );
                  if (selectedVariant) {
                    console.log(
                      `✅ Variant found: ${selectedVariant.name} (ID: ${selectedVariant.id})`,
                    );
                    setFormData((prev) => ({
                      ...prev,
                      variantId: selectedVariant.id.toString(),
                    }));
                  } else {
                    console.log(`❌ Variant not found: ${variantSlug}`);
                  }
                  setLoadingVariants(false);
                } else {
                  console.log("ℹ️ No variantSlug provided");
                }
              } else {
                console.log(`❌ Model not found: ${modelSlug}`);
              }
              setLoadingModels(false);
            } else {
              console.log("ℹ️ No modelSlug provided");
            }
          } else {
            console.log(`❌ Brand not found: ${brandSlug}`);
          }
          setLoadingBrands(false);
        } else {
          console.log("ℹ️ No brandSlug provided - normal form mode");
        }
      } catch (error) {
        console.error("❌ Error loading brand/model/variant data:", error);
        setLoadingBrands(false);
        setLoadingModels(false);
        setLoadingVariants(false);
      }
    };

    loadFromSlugs();
  }, [brandSlug, modelSlug, variantSlug]);

  // Load brands on component mount
  useEffect(() => {
    const loadBrands = async () => {
      console.log("🔄 Loading brands...");
      setLoadingBrands(true);
      try {
        const response = await apiClient.get("/brands");
        const brandsData = response.data as Brand[];
        setBrands(brandsData);
        console.log(
          `✅ ${brandsData.length} marka yüklendi:`,
          brandsData.map((b) => b.name),
        );
      } catch (error) {
        console.error("❌ Brands loading error:", error);
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
            `/brands/${formData.brandId}/models`,
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
            `/models/${formData.modelId}/variants`,
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

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await apiClient.get("/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Cities loading error:", error);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await apiClient.get("/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Şehirler yüklenirken hata:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    if (formData.cityId) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const response = await apiClient.get(
            `/cities/${formData.cityId}/districts`,
          );
          setDistricts(response.data as District[]);
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.cityId]);

  const handleInputChange = (
    field: keyof MidilliFormData,
    value: string | number | File[] | File | null | boolean,
  ) => {
    if (field === "year" || field === "uzunluk" || field === "lastikDurumu") {
      const numValue =
        field === "year" || field === "uzunluk" || field === "lastikDurumu"
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

  // Fotoğraf yükleme fonksiyonları
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false,
  ) => {
    const files = e.target.files;
    if (files) {
      if (isShowcase) {
        const file = files[0];
        setFormData((prev) => ({ ...prev, showcasePhoto: file }));
      } else {
        if (formData.photos.length + files.length <= 10) {
          const newPhotos = Array.from(files);
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos],
          }));
        } else {
          alert("En fazla 10 fotoğraf yükleyebilirsiniz");
        }
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));

    // Showcase index'ini güncelle
    if (showcaseImageIndex >= index && showcaseImageIndex > 0) {
      setShowcaseImageIndex(showcaseImageIndex - 1);
    }
  };

  const setShowcaseImage = (index: number) => {
    setShowcaseImageIndex(index);
  };

  const handleCityChange = (cityName: string) => {
    const selectedCity = cities.find((city) => city.name === cityName);
    if (selectedCity) {
      handleInputChange("cityId", selectedCity.id.toString());
      handleInputChange("city", cityName);
    }
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
        if (formData.uzunluk <= 0) {
          setError("Uzunluk bilgisi gereklidir");
          return false;
        }
        break;
      case 1: // Fotoğraflar
        if (formData.photos.length === 0) {
          setError("En az 1 fotoğraf yüklemeniz gerekli");
          return false;
        }
        break;
      case 2: // İletişim & Fiyat
        if (!formData.sellerPhone?.trim()) {
          setError("Telefon numarası gereklidir");
          return false;
        }
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

  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\D/g, "");
  };

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    return new Intl.NumberFormat("tr-TR").format(parseInt(numbers));
  };

  const handlePriceChange = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, price: numbers }));
  };

  // Form gönderimi
  const handleSubmit = async () => {
    console.log("🚀 MidilliForm handleSubmit başladı");
    console.log("📝 Form Data:", formData);
    setLoading(true);
    try {
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.year.toString());

      // Dorse Brand (dorseBrand olarak customFields'a eklenecek)
      if (formData.dorseBrand && formData.dorseBrand !== "Seçiniz") {
        submitData.append("dorseBrand", formData.dorseBrand);
      }

      // Category/Brand/Model/Variant ID'lerini ekle
      submitData.append("categoryId", formData.categoryId);
      submitData.append("brandId", formData.brandId);
      submitData.append("modelId", formData.modelId);
      submitData.append("variantId", formData.variantId || "");

      // Brand/Model/Variant name'lerini ekle (ensureBrandModelVariant için gerekli)
      const selectedBrand = brands.find(
        (b) => b.id.toString() === formData.brandId,
      );
      const selectedModel = models.find(
        (m) => m.id.toString() === formData.modelId,
      );
      const selectedVariant = variants.find(
        (v) => v.id.toString() === formData.variantId,
      );

      if (selectedBrand) {
        submitData.append("brandName", selectedBrand.name);
        submitData.append("brandSlug", selectedBrand.slug);
      }
      if (selectedModel) {
        submitData.append("modelName", selectedModel.name);
        submitData.append("modelSlug", selectedModel.slug);
      }
      if (selectedVariant) {
        submitData.append("variantName", selectedVariant.name);
        submitData.append("variantSlug", selectedVariant.slug);
      }

      // URL params'tan gelen slug'ları da ekle
      if (brandSlug && !selectedBrand)
        submitData.append("brandSlug", brandSlug);
      if (modelSlug && !selectedModel)
        submitData.append("modelSlug", modelSlug);
      if (variantSlug && !selectedVariant)
        submitData.append("variantSlug", variantSlug);

      // Year field'ı ekle
      submitData.append("year", formData.year.toString());

      console.log("✅ Dorse Category/Brand/Model/Variant IDs:", {
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        modelId: formData.modelId,
        variantId: formData.variantId,
        brandName: selectedBrand?.name,
        modelName: selectedModel?.name,
        variantName: selectedVariant?.name,
      });

      // Fiyatı parse ederek ekle
      const parsedPrice = parseFormattedNumber(formData.price);
      if (parsedPrice) {
        submitData.append("price", parsedPrice);
        submitData.append("currency", formData.currency || "TRY");
      }

      // Seller bilgileri (backend'in beklediği field name'ler)
      if (formData.sellerName)
        submitData.append("sellerName", formData.sellerName);
      if (formData.sellerPhone)
        submitData.append("phone", formData.sellerPhone);
      if (formData.sellerEmail)
        submitData.append("email", formData.sellerEmail);

      // Tenteli midilli özel bilgileri
      submitData.append("uzunluk", formData.uzunluk.toString());
      submitData.append("lastikDurumu", formData.lastikDurumu.toString());
      submitData.append("catiPerdeSistemi", formData.catiPerdeSistemi);

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);
      submitData.append("city", formData.city || "");
      submitData.append("district", formData.district || "");

      // Ekstra
      submitData.append("warranty", formData.warranty ? "evet" : "hayir");
      submitData.append("negotiable", formData.negotiable ? "evet" : "hayir");
      submitData.append("exchange", formData.exchange ? "evet" : "hayir");

      // Detaylı bilgiyi teknik özelliklerle birleştir
      let detailedDescription = formData.detailedInfo;

      // Tenteli teknik özellikler eklentisi
      const technicalSpecs = [];
      if (formData.uzunluk)
        technicalSpecs.push(`Uzunluk: ${formData.uzunluk}m`);
      if (formData.lastikDurumu)
        technicalSpecs.push(`Lastik Durumu: ${formData.lastikDurumu}%`);
      if (formData.catiPerdeSistemi)
        technicalSpecs.push(`Çatı Perde Sistemi: ${formData.catiPerdeSistemi}`);

      if (technicalSpecs.length > 0) {
        const techSpecsText =
          "\n\n--- Teknik Özellikler ---\n" + technicalSpecs.join("\n");
        detailedDescription = detailedDescription
          ? detailedDescription + techSpecsText
          : techSpecsText;
      }

      if (detailedDescription) {
        submitData.append("description", detailedDescription);
      }

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
          `🎥 Adding ${formData.videos.length} videos to submit data`,
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

      console.log(
        "Midilli Tenteli Dorse ilanı başarıyla oluşturuldu:",
        response.data,
      );

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
          "İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Modal handler fonksiyonları
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/"); // Anasayfaya yönlendir
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // İlan Detayları
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Umbrella color="primary" />
              Midilli Tenteli Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Örn: 2018 Model Midilli Tenteli Dorse"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Midilli tenteli dorsenizin detaylı açıklamasını yazın..."
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
                onChange={(e) => handleInputChange("year", e.target.value)}
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

              <TextField
                fullWidth
                type="text"
                label="Uzunluk (m)"
                value={formData.uzunluk}
                onChange={(e) => handleInputChange("uzunluk", e.target.value)}
                placeholder="Örn: 13.60"
                required
              />
            </Box>

            {/* Marka Seçimi */}
            <FormControl fullWidth sx={{ mt: 2 }} required>
              <InputLabel>Dorse Markası</InputLabel>
              <Select
                value={formData.dorseBrand}
                label="Dorse Markası"
                onChange={(e) =>
                  handleInputChange("dorseBrand", e.target.value)
                }
              >
                {MIDILLI_BRANDS.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                fullWidth
                type="number"
                label="Lastik Durumu"
                value={formData.lastikDurumu}
                onChange={(e) =>
                  handleInputChange("lastikDurumu", e.target.value)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, max: 100 }}
                placeholder="Örn: 85"
              />

              <FormControl fullWidth required>
                <InputLabel>Çatı Perde Sistemi</InputLabel>
                <Select
                  value={formData.catiPerdeSistemi}
                  label="Çatı Perde Sistemi"
                  onChange={(e) =>
                    handleInputChange("catiPerdeSistemi", e.target.value)
                  }
                >
                  {CATI_PERDE_SISTEMLERI.map((sistem) => (
                    <MenuItem key={sistem} value={sistem}>
                      {sistem}
                    </MenuItem>
                  ))}
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
              Midilli Tenteli Fotoğrafları
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <CloudUpload
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Midilli Tenteli Fotoğraflarını Yükleyin
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
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={formData.photos.length >= 10}
                    >
                      Fotoğraf Seç
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>

            {formData.photos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({formData.photos.length}/10)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 2,
                  }}
                >
                  {formData.photos.map((file, index) => (
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
                          removePhoto(index);
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
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <VideoLibrary
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Video Yükleyin (Opsiyonel)
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    En fazla 5 video yükleyebilirsiniz. Video boyutu maksimum
                    50MB olmalıdır.
                  </Typography>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                    style={{ display: "none" }}
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<VideoLibrary />}
                      disabled={formData.videos.length >= 5}
                    >
                      Video Seç
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>

            {formData.videos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Yüklenen Videolar ({formData.videos.length}/5)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 2,
                  }}
                >
                  {videoPreviews.map((videoUrl, index) => (
                    <Card key={index} sx={{ position: "relative" }}>
                      <video
                        src={videoUrl}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                        }}
                        onClick={() => openVideoModal(index)}
                      />
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
                          removeVideo(index);
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          bgcolor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
                        }}
                        onClick={() => openVideoModal(index)}
                      >
                        <PlayArrow fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
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
              İletişim & Fiyat Bilgileri
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.name}
                value={
                  cities.find((city) => city.name === formData.city) || null
                }
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCityChange(newValue.name);
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
                    handleInputChange("district", newValue.name);
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
              value={formatPrice(formData.price)}
              onChange={(e) => handlePriceChange(e.target.value)}
              InputProps={{
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
              placeholder="150.000"
              required
            />
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
            Midilli Tenteli İlan Ver
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Midilli tenteli dorsenizi kolayca satışa çıkarın
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
          {videoPreviews[currentVideoIndex] && (
            <video
              src={videoPreviews[currentVideoIndex]}
              controls
              style={{ width: "100%", height: "auto" }}
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
        onClose={handleCloseSuccessModal}
        title="İlan Başarıyla Gönderildi!"
        message="İlanınız başarıyla oluşturuldu. ⚠️ İlanınız henüz yayında değil! Admin onayı bekliyor."
        adId={createdAdId || undefined}
        onViewAd={createdAdId ? handleViewAd : undefined}
        onGoHome={handleGoHome}
        onMyAds={handleMyAds}
      />
    </Container>
  );
};

export default MidilliForm;
