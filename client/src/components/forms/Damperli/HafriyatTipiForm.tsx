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
  CardMedia,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle,
  PhotoCamera,
  Close,
  Delete as DeleteIcon,
  PlayArrow,
  VideoLibrary as VideoLibraryIcon,
  CloudUpload as CloudUploadIcon,
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

interface HafriyatFormData {
  title: string;
  description: string;
  year: number;
  productionYear: number;
  price: string;
  currency: string;

  // Brand/Model/Variant IDs
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;

  // Dorse Markası
  dorseBrand: string;

  // Hafriyat Dorse Teknik Özellikler
  genislik: string; // metre
  uzunluk: string; // metre
  lastikDurumu: number; // yüzde
  devrilmeYonu: string;

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
  warranty: string;
  negotiable: string;
  exchange: string;

  detailedInfo: string;
}

// Devrilme Yönleri
const DEVRILME_YONLERI = ["Arkaya", "Sağa", "Sola"];

// Hafriyat Tipi Dorse Markaları (MainLayout'tan alınan)
const HAFRIYAT_TIPI_MARKALARI = [
  "Seçiniz",
  "Adakon Treyler",
  "ADB Treyler",
  "Adem Usta Proohauss",
  "AGS Treyler",
  "Akar Cihat",
  "Akmanlar Damper",
  "Akyel Treyler",
  "Alamen",
  "Alim Dorse",
  "Alpaslan Dorse",
  "Alp-Kar",
  "Alpsan",
  "Anıl Damper",
  "Arslan Damper",
  "ART Trailer",
  "Askan Treyler",
  "ASY Treyler",
  "Aydeniz Dorse",
  "Beyfem Dorse",
  "Bio Treyler",
  "Can Damper Karoser",
  "Cangüller Treyler",
  "Carrier Trailer",
  "Caselli",
  "CastroMax Trailers",
  "Cey Treyler",
  "Coşkunlar",
  "Çakır Şase",
  "Çarşan",
  "Çavdaroğlu",
  "Çavuşoğlu",
  "Çetin",
  "Çimenler",
  "Çobanoğlu",
  "Doruk Treyler",
  "Dosa Treyler",
  "EFK Treyler",
  "Ekinci Damper",
  "ELM Treysan Trailer",
  "EMK Treyler",
  "EMS Erhan Makina",
  "Esatech Trailer",
  "Fesan",
  "Fors Treyler",
  "FSM Treyler",
  "Global City",
  "Global City Treyler",
  "Gökhanlar",
  "Gülüstan",
  "Güneyşan Treyler Dorse",
  "Haşimoğlu",
  "Hidro-Has Damper",
  "Hürsan Treyler",
  "Iskar Treyler",
  "İkikardeş",
  "İkon Treyler",
  "İNC Seçkinler",
  "Kaim",
  "Kalkan Treyler",
  "KAM",
  "Karalar Treyler",
  "KKT Trailer",
  "Konişmak",
  "Kontir",
  "Konza Trailer",
  "Kögel Trailer",
  "Langendorf",
  "M. Seymak Treyler",
  "Makinsan Treyler",
  "Marrka Treyler",
  "MAS Trailer",
  "Mas Treyler",
  "Maxtır Trailer",
  "MEC Dorse",
  "Mehsan Treyler",
  "Meiller",
  "Meshaus Treyler",
  "Mobil Treyler",
  "MRC Treyler",
  "MS Muratsan Treyler",
  "Nedex",
  "Neka Treyler",
  "Nükte Trailer",
  "Oktar Treyler",
  "OKT Trailer",
  "Optimak Treyler",
  "Ormanlı Treyler",
  "Ortaus Treyler",
  "OtoÇinler",
  "Oymak Cargomaster",
  "Oymak Träger",
  "Öm-San Treyler",
  "Özçevik Treyler",
  "Özenir Osmanlı",
  "Özgül Treyler",
  "Öztfn Treyler",
  "Öztreyler",
  "Özusta",
  "Özünlü",
  "Paşalar Mehmet Treyler",
  "Paşalar Treyler",
  "Paşaoğlu Dorse Treyler",
  "Ram-Kar",
  "Ram Treyler",
  "Reis Treyler",
  "Rekor",
  "Roms Treyler",
  "SAF Treyler",
  "Sağlamış",
  "Sancak Treyler",
  "Sarıılmaz",
  "Seçen",
  "Seçkinler",
  "Self Frigo",
  "Semitürk",
  "Sena Treyler",
  "Serin Treyler",
  "Serra Treyler",
  "Sert Treyler",
  "Set Treyler",
  "Seyit Usta",
  "SimbOxx",
  "Sim Treyler",
  "Sistem Damper Treyler",
  "Star Yağcılar",
  "Takdir Dorse",
  "Tanı Tır",
  "Tecno Tır Treyler",
  "Tırsan",
  "Traco",
  "Transfer Treyler",
  "Warkas",
  "Wielton",
  "Yalımsan Treyler",
  "Yasin Ateş Damper",
  "Yeksan Treyler",
  "Yelsan Treyler",
  "Yıldızlar Damper",
  "Zafer Treyler",
  "Zak-San Trailer",
  "Özel Üretim",
  "Diğer",
];

const HafriyatTipiForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();
  const user = useSelector((state: RootState) => state.auth.user);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Video states
  const [videos, setVideos] = useState<File[]>([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<File | null>(null);

  // Brand/Model/Variant states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [, setLoadingBrands] = useState(false);
  const [, setLoadingModels] = useState(false);
  const [, setLoadingVariants] = useState(false);

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-load category ID - Dorse category ID (integer)
  const [formData, setFormData] = useState<HafriyatFormData>({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    productionYear: new Date().getFullYear(),
    price: "",
    currency: "TRY",

    // Brand/Model/Variant IDs
    categoryId: "6", // Dorse category ID
    brandId: "",
    modelId: "",
    variantId: "",

    // Dorse Markası
    dorseBrand: "",

    // Hafriyat Dorse Teknik Özellikler
    genislik: "",
    uzunluk: "",
    lastikDurumu: 100,
    devrilmeYonu: "",

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
    warranty: "hayir",
    negotiable: "hayir",
    exchange: "hayir",

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
    field: keyof HafriyatFormData,
    value: string | number | File[] | File | null | boolean
  ) => {
    if (
      field === "year" ||
      field === "productionYear" ||
      field === "lastikDurumu"
    ) {
      const numValue =
        field === "year" ||
        field === "productionYear" ||
        field === "lastikDurumu"
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
      if (videos.length + videoFiles.length > 3) {
        alert("En fazla 3 video yükleyebilirsiniz.");
        return;
      }

      videoFiles.forEach((file) => {
        setVideos((prev) => [...prev, file]);
      });
    }
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const openVideoModal = (video: File) => {
    setCurrentVideo(video);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
  };

  // Parse formatted number for submission
  const parseFormattedNumber = (formatted: string) => {
    return formatted.replace(/[^\d]/g, "");
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

  // Sayı formatlama fonksiyonları
  const formatNumber = (value: string): string => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";

    // Sayıyı formatlayalım (binlik ayracı)
    return new Intl.NumberFormat("tr-TR").format(parseInt(numbers));
  };

  const handleSubmit = async () => {
    console.log("🚀 HafriyatTipiForm handleSubmit başladı");
    console.log("📝 Form Data:", formData);
    setLoading(true);
    try {
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("year", formData.year.toString());

      // Category/Brand/Model/Variant ID'lerini ekle
      submitData.append("categoryId", formData.categoryId);
      submitData.append("brandId", formData.brandId);
      submitData.append("modelId", formData.modelId);
      submitData.append("variantId", formData.variantId || "");

      // Brand/Model/Variant name'lerini ekle (ensureBrandModelVariant için gerekli)
      const selectedBrand = brands.find(
        (b) => b.id.toString() === formData.brandId
      );
      const selectedModel = models.find(
        (m) => m.id.toString() === formData.modelId
      );
      const selectedVariant = variants.find(
        (v) => v.id.toString() === formData.variantId
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
      if (categorySlug) submitData.append("categorySlug", categorySlug);
      if (brandSlug && !selectedBrand)
        submitData.append("brandSlug", brandSlug);
      if (modelSlug && !selectedModel)
        submitData.append("modelSlug", modelSlug);
      if (variantSlug && !selectedVariant)
        submitData.append("variantSlug", variantSlug);

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

      // Yıl bilgisi
      submitData.append("year", formData.year.toString());

      // Dorse Markası
      submitData.append("dorseBrand", formData.dorseBrand);

      // Hafriyat dorse özel bilgileri
      submitData.append("genislik", formData.genislik);
      submitData.append("uzunluk", formData.uzunluk);
      submitData.append("lastikDurumu", formData.lastikDurumu.toString());
      submitData.append("devrilmeYonu", formData.devrilmeYonu);

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
      let detailedDescription =
        formData.description || formData.detailedInfo || "";

      // Hafriyat dorse teknik özellikler eklentisi
      const technicalSpecs = [];
      if (formData.genislik)
        technicalSpecs.push(`Dorse Genişliği: ${formData.genislik}m`);
      if (formData.uzunluk)
        technicalSpecs.push(`Dorse Uzunluğu: ${formData.uzunluk}m`);
      if (formData.lastikDurumu)
        technicalSpecs.push(`Lastik Durumu: ${formData.lastikDurumu}%`);
      if (formData.devrilmeYonu)
        technicalSpecs.push(`Devrilme Yönü: ${formData.devrilmeYonu}`);

      if (technicalSpecs.length > 0) {
        const techSpecsText =
          "\n\n--- Teknik Özellikler ---\n" + technicalSpecs.join("\n");
        detailedDescription = detailedDescription
          ? detailedDescription + techSpecsText
          : techSpecsText;
      }

      // Description ve detailedInfo'yu ayır
      submitData.append("description", formData.description || "");
      if (detailedDescription) {
        submitData.append("detailedInfo", detailedDescription);
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

      console.log(
        "Hafriyat Tipi Dorse ilanı başarıyla oluşturuldu:",
        response.data
      );

      // Başarı modal'ını göster
      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("İlan oluşturulurken hata:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error("❌ İlan gönderme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handler fonksiyonları
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/"); // Anasayfaya yönlendir
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Temel Bilgiler */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              Temel Bilgiler
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <TextField
                fullWidth
                label="İlan Başlığı *"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Örn: Tertemiz 2020 Model Hafriyat Tipi Damperli Dorse"
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
                placeholder="Dorsenizin detaylı açıklamasını yazın..."
                required
              />

              {/* Video Upload Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Video Ekle
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: "text.secondary" }}
                >
                  Aracınızın videolarını ekleyerek potansiyel alıcıların daha
                  iyi karar vermesine yardımcı olun. (Maksimum 3 video, her
                  video için 50MB limit)
                </Typography>

                {videos.length < 3 && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Video Yükle
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={handleVideoUpload}
                    />
                  </Button>
                )}

                {videos.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    {videos.map((video, index) => (
                      <Card key={index}>
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <VideoLibraryIcon sx={{ mr: 1 }} />
                              <Typography variant="body2" noWrap>
                                Video {index + 1}
                              </Typography>
                            </Box>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => openVideoModal(video)}
                                sx={{ mr: 1 }}
                              >
                                <PlayArrow />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => removeVideo(index)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {(video.size / (1024 * 1024)).toFixed(2)} MB
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Üretim Yılı *"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  inputProps={{
                    min: 1980,
                    max: new Date().getFullYear() + 1,
                  }}
                  required
                />

                <TextField
                  fullWidth
                  type="text"
                  label="Fiyat"
                  value={formatNumber(formData.price)}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("price", rawValue);
                  }}
                  placeholder="Örn: 150.000"
                  required
                
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ToggleButtonGroup
                      value={formData.currency || "TRY"}
                      exclusive
                      onChange={(_, v) => v && setFormData((prev: any) => ({ ...prev, currency: v }))}
                      size="small"
                      sx={{ "& .MuiToggleButton-root": { py: 0.5, px: 1, fontSize: "0.75rem", "&.Mui-selected": { bgcolor: "#D34237", color: "#fff" } } }}
                    >
                      <ToggleButton value="TRY">₺</ToggleButton>
                      <ToggleButton value="USD">$</ToggleButton>
                      <ToggleButton value="EUR">€</ToggleButton>
                    </ToggleButtonGroup>
                  </InputAdornment>
                ),
              }}
              />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Teknik Özellikler */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              Teknik Özellikler
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              {/* Dorse Markası */}
              <FormControl fullWidth required>
                <InputLabel>Dorse Markası *</InputLabel>
                <Select
                  value={formData.dorseBrand}
                  onChange={(e) =>
                    handleInputChange("dorseBrand", e.target.value)
                  }
                  label="Dorse Markası *"
                >
                  {HAFRIYAT_TIPI_MARKALARI.map((marka) => (
                    <MenuItem key={marka} value={marka}>
                      {marka}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="text"
                  label="Genişlik (metre) *"
                  value={formData.genislik}
                  onChange={(e) =>
                    handleInputChange("genislik", e.target.value)
                  }
                  placeholder="Örn: 2.45"
                  required
                />

                <TextField
                  fullWidth
                  type="text"
                  label="Uzunluk (metre) *"
                  value={formData.uzunluk}
                  onChange={(e) => handleInputChange("uzunluk", e.target.value)}
                  placeholder="Örn: 13.60"
                  required
                />
              </Box>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Lastik Durumu (%)"
                  value={formData.lastikDurumu}
                  onChange={(e) =>
                    handleInputChange("lastikDurumu", e.target.value)
                  }
                  inputProps={{ min: 0, max: 100 }}
                />

                <FormControl fullWidth required>
                  <InputLabel>Devrilme Yönü</InputLabel>
                  <Select
                    value={formData.devrilmeYonu}
                    onChange={(e) =>
                      handleInputChange("devrilmeYonu", e.target.value)
                    }
                    label="Devrilme Yönü"
                  >
                    {DEVRILME_YONLERI.map((yon) => (
                      <MenuItem key={yon} value={yon}>
                        {yon}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Konum Bilgileri */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              Fotoğraflar
            </Typography>

            {/* Vitrin Fotoğrafı */}
            <Card sx={{ mb: 3, border: "2px solid #e3f2fd" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  Vitrin Fotoğrafı
                  <Chip
                    label="Zorunlu"
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  İlk bakışta dikkat çeken en iyi fotoğrafınızı seçin
                </Typography>

                {showcasePreview ? (
                  <Card sx={{ position: "relative", maxWidth: 300 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={showcasePreview}
                      alt="Vitrin fotoğrafı"
                      sx={{ objectFit: "cover" }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                      }}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          showcasePhoto: null,
                        }));
                        setShowcasePreview(null);
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Card>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{
                      height: 100,
                      border: "2px dashed #ccc",
                      "&:hover": { border: "2px dashed #1976d2" },
                    }}
                  >
                    Vitrin Fotoğrafı Seç
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handlePhotoUpload(e, true)}
                    />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Diğer Fotoğraflar */}
            <Card sx={{ mb: 4, border: "2px solid #e8f5e8" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  Diğer Fotoğraflar
                  <Chip
                    label={`${formData.photos.length}/15`}
                    size="small"
                    color="secondary"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Arabanızın farklı açılardan fotoğraflarını ekleyin (en fazla
                  15 adet)
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{
                    mb: 2,
                    border: "2px dashed #4caf50",
                    color: "#4caf50",
                    "&:hover": { border: "2px solid #4caf50" },
                  }}
                  disabled={formData.photos.length >= 15}
                >
                  {formData.photos.length === 0
                    ? "Fotoğraf Ekle"
                    : "Daha Fazla Fotoğraf Ekle"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handlePhotoUpload(e, false)}
                  />
                </Button>

                {formData.photos.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {photoPreviews.map((preview, index) => (
                      <Card key={index} sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="150"
                          image={preview}
                          alt={`Fotoğraf ${index + 1}`}
                          sx={{ objectFit: "cover" }}
                        />
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(244, 67, 54, 0.8)",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "rgba(244, 67, 54, 1)",
                            },
                          }}
                          onClick={() => removePhoto(index)}
                          size="small"
                        >
                          <Close />
                        </IconButton>
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            left: 8,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          {index + 1}
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Detaylı Bilgi */}

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
          <DialogTitle sx={{ textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 60, color: "green", mb: 2 }} />
            <Typography variant="h4">İlan Başarıyla Gönderildi!</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
              İlanınız başarıyla oluşturuldu.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "warning.main",
                fontWeight: "bold",
              }}
            >
              ⚠️ İlanınız henüz yayında değil! Admin onayı bekliyor.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              onClick={handleCloseSuccessModal}
              variant="contained"
              size="large"
              sx={{
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              }}
            >
              Anasayfaya Dön
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
          <DialogTitle>Video Önizleme</DialogTitle>
          <DialogContent>
            {currentVideo && (
              <video
                controls
                style={{ width: "100%", height: "auto" }}
                src={URL.createObjectURL(currentVideo)}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeVideoModal}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default HafriyatTipiForm;
