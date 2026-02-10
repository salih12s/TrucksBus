import React, { useState, useEffect, useCallback } from "react";
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

interface KapakliFormData {
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

  // Dorse Markası (Sidebar'dan alınan markalar)
  dorseBrand: string;

  // Kapaklı Dorse Teknik Özellikler
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

// Kapaklı Tip Dorse Markaları (MainLayout'tan alınan)
const KAPAKLI_TIP_MARKALARI = [
  "Seçiniz",
  "Acar Treyler",
  "Adakon Treyler",
  "ADB Treyler",
  "Adem Tekin Treyler",
  "Adem Usta Proohauss",
  "Adil Sert",
  "ADS Treyler",
  "AGS",
  "AGS Treyler",
  "Ağır-İş",
  "Akar Cihat",
  "Akbaş Treyler",
  "Akın",
  "Akmanlar Damper",
  "Akyel Treyler",
  "Alamen",
  "Aldor Trailer",
  "Alim Dorse",
  "Ali Rıza Usta",
  "Alkan Group",
  "ALM Damper",
  "Alpaslan Dorse",
  "Alp-Kar",
  "Alpsan",
  "Altınel Dorse",
  "Altınordu Treyler",
  "Anıl Damper",
  "Arslan",
  "ART Trailer",
  "Askan Treyler",
  "ASY Treyler",
  "Aydeniz Dorse",
  "Batu Treyler",
  "Belgem",
  "Beyfem Dorse",
  "Beytır",
  "Bio Treyler",
  "Boydak",
  "Büyük Yüksel Damper",
  "Can Damper Karoser",
  "Cangüller Treyler",
  "Cangül Treyler",
  "Carrier Trailer",
  "Caselli",
  "CastroMax Trailers",
  "Ceylan",
  "Cey-Treyler",
  "CNC",
  "Coşkunlar",
  "Çakır Dorse",
  "Çarşan",
  "Çavdaroğlu",
  "Çeliksan",
  "Çimenler",
  "Çinler Treyler",
  "Çobanoğlu",
  "Çuhadar Treyler",
  "Dark Tech Treyler",
  "Dekor",
  "Dentur",
  "Dereli",
  "Dereli Hüseyin",
  "Dorsan",
  "Doruk Treyler",
  "Dosa Treyler",
  "Efe Dorse",
  "EFK Treyler",
  "Ekinci Karoser",
  "Ekol",
  "Ekrem",
  "ELM Treysan Trailer",
  "EMK Treyler",
  "Erbaran",
  "Erdal Damper",
  "Erdoğan-Öz Dorse",
  "Erhan Ünsal Treyler",
  "Erkan Karoser",
  "Erkonsan Treyler",
  "Esatech Trailer",
  "Eyüp Coşgun",
  "Ferhat Dorse",
  "Fesan",
  "Fors Treyler",
  "Fruehauf",
  "FSM Treyler",
  "Global City",
  "Global City Treyler",
  "Gökhanlar",
  "Gülüstän",
  "Gümüş Treyler",
  "Güneş",
  "Güneyşan Treyler Dorse",
  "Gürkon Trailer",
  "Gürleşenyıl Treyler",
  "Güven Makina",
  "Güzelogulları Damper",
  "Hacı Ceylan",
  "Has Trailer",
  "Hidro Çan",
  "Hidrosin",
  "Hürsan",
  "Hürsan Treyler",
  "Iskar Treyler",
  "İhsan Treyler",
  "İkikardeş",
  "İkon Treyler",
  "İKT Treyler",
  "İldiz",
  "İNÇ Seçkinler",
  "Kaim Kardeşler",
  "Kalkan Treyler",
  "Karalar Treyler",
  "Karcı",
  "Kartallar Damper",
  "KKT Trailer",
  "Koluman",
  "Komodo",
  "Koneksan",
  "Konlider",
  "Konseymak",
  "Kontir",
  "Kontürksan",
  "Konza Trailer",
  "Kögel Trailer",
  "Kössbohrer",
  "Krone",
  "Kuşcuoğlu",
  "Lider Dekor",
  "Lider Dorse",
  "Lider Treyler",
  "M. Seymak Treyler",
  "Makinsan",
  "Marrka Treyler",
  "MAS Trailer",
  "Mas Treyler",
  "Maxtır Trailer",
  "MEC Dorse",
  "Mehmet Aydın",
  "Mehsan Treyler",
  "Mektür",
  "Merve Dorse",
  "Meshaus Treyler",
  "Metsan Treyler",
  "Mobil Treyler",
  "MRC Treyler",
  "MS Muratsan Treyler",
  "Nasuh Can",
  "Nedex",
  "Neka",
  "Nevkarsan",
  "Nkt Treyler",
  "Nuh Damper",
  "Nurak Treyler",
  "Nursan Dorse",
  "Nükte Trailer",
  "Ok Kardeşler",
  "Oktar Treyler",
  "OKT Trailer",
  "Omeksan",
  "Optimak Treyler",
  "Ormanlı",
  "Orthaüs Treyler",
  "OtoÇinler",
  "Otto Trailer",
  "Oymak Cargomaster",
  "Oymak Träger",
  "Ö.M.T.",
  "Ömsan Treyler",
  "Önder",
  "Öz Asil",
  "Özbay Damper",
  "Özçevik Treyler",
  "Özdemir",
  "Özelsan Treyler",
  "Özenir Osmanlı",
  "Özgaranti",
  "Özgül Treyler",
  "Özkınalılar Damper",
  "Özmen Damper",
  "Özmetal",
  "Özseç",
  "Öztfn Treyler",
  "Öztreyler",
  "ÖzustaÖzünlü",
  "Paşalar Mehmet Treyler",
  "Paşalar Treyler",
  "Paşaoğlu Dorse Treyler",
  "Polifton Trailer",
  "Poslu Treyler",
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
  "Sert",
  "Set Treyler",
  "Sevinç",
  "Sevinç Karoser",
  "Seyit Usta",
  "Sey-Mak Dorse",
  "Simboxx",
  "Sim Treyler",
  "Sistem Damper Treyler",
  "SLK Mertcan Treyler",
  "Snin Trailer",
  "Sönmezler",
  "Starboard",
  "Star Yağcılar",
  "Şen San",
  "Takdir Dorse",
  "Tanı Tır",
  "Taşkır",
  "Tecno Tır Treyler",
  "Tekin Treyler",
  "Tırsan",
  "Tirkon",
  "Traco",
  "Transfer Treyler",
  "Tunalar",
  "Tursan",
  "Warkas",
  "Wielton",
  "Yalımsan Treyler",
  "Yasin Ateş Treyler",
  "Yavuz Treyler",
  "Yeksan Treyler",
  "Yelsan Treyler",
  "Yeşil Yol Treyler",
  "Yıldızlar Damper",
  "Yıldız Treyler",
  "Yiğitsan Treyler",
  "Zafer Dorse",
  "Zafer Treyler",
  "Zak-San Trailer",
  "Özel Üretim",
  "Diğer",
];

const KapakliTipForm: React.FC = () => {
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
  const [formData, setFormData] = useState<KapakliFormData>({
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

  // Load brands on component mount
  useEffect(() => {
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await apiClient.get("/brands");
        setBrands((response.data as Brand[]) || []);
        console.log("✅ Brands loaded:", (response.data as Brand[]).length);
      } catch (error) {
        console.error("❌ Brand loading error:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

  // Auto-load brand/model/variant from URL parameters
  useEffect(() => {
    const loadVariantDetails = async () => {
      console.log("🔍 [KAPAKLI] variantSlug from URL:", variantSlug);
      console.log("🔍 [KAPAKLI] brandSlug from URL:", brandSlug);
      console.log("🔍 [KAPAKLI] modelSlug from URL:", modelSlug);

      if (variantSlug && brandSlug && modelSlug && brands.length > 0) {
        console.log("✅ [KAPAKLI] Loading variant details for slugs:", {
          brandSlug,
          modelSlug,
          variantSlug,
        });

        try {
          // Find brand by slug
          const brand = brands.find((b) => b.slug === brandSlug);
          if (brand) {
            console.log("✅ [KAPAKLI] Brand found:", brand);

            // Load models for this brand
            const modelsResponse = await apiClient.get(
              `/brands/${brand.id}/models`
            );
            const modelsList = modelsResponse.data as Model[];
            setModels(modelsList);
            console.log("✅ [KAPAKLI] Models loaded:", modelsList.length);

            // Find model by slug
            const model = modelsList.find((m) => m.slug === modelSlug);
            if (model) {
              console.log("✅ [KAPAKLI] Model found:", model);

              // Load variants for this model
              const variantsResponse = await apiClient.get(
                `/models/${model.id}/variants`
              );
              const variantsList = variantsResponse.data as Variant[];
              setVariants(variantsList);
              console.log("✅ [KAPAKLI] Variants loaded:", variantsList.length);

              // Find variant by slug
              const variant = variantsList.find((v) => v.slug === variantSlug);
              if (variant) {
                console.log("✅ [KAPAKLI] Variant found:", variant);

                // Set form data
                setFormData((prev) => ({
                  ...prev,
                  brandId: brand.id.toString(),
                  modelId: model.id.toString(),
                  variantId: variant.id.toString(),
                }));
              }
            }
          }
        } catch (error) {
          console.error("❌ [KAPAKLI] Error loading variant details:", error);
        }
      }
    };

    loadVariantDetails();
  }, [variantSlug, brandSlug, modelSlug, brands]);

  // Load models when brand changes - using brand ID like TekstilForm
  const handleBrandChange = useCallback(
    async (brandId: string) => {
      setFormData((prev) => ({
        ...prev,
        brandId,
        modelId: "",
        variantId: "",
      }));
      setModels([]);
      setVariants([]);

      if (brandId) {
        setLoadingModels(true);
        try {
          console.log("🔗 [KAPAKLI] Loading models for brandId:", brandId);
          const response = await apiClient.get(`/brands/${brandId}/models`);
          setModels(response.data as Model[]);
          console.log(
            "✅ [KAPAKLI] Models loaded:",
            (response.data as Model[]).length
          );
        } catch (error) {
          console.error("❌ [KAPAKLI] Model loading error:", error);
          setModels([]);
        } finally {
          setLoadingModels(false);
        }
      }
    },
    [setFormData, setModels, setVariants, setLoadingModels]
  );

  // Load variants when model changes - using model ID like TekstilForm
  const handleModelChange = useCallback(
    async (modelId: string) => {
      setFormData((prev) => ({
        ...prev,
        modelId,
        variantId: "",
      }));
      setVariants([]);

      if (modelId) {
        setLoadingVariants(true);
        try {
          console.log("🔗 [KAPAKLI] Loading variants for modelId:", modelId);
          const response = await apiClient.get(`/models/${modelId}/variants`);
          setVariants(response.data as Variant[]);
          console.log(
            "✅ [KAPAKLI] Variants loaded:",
            (response.data as Variant[]).length
          );
        } catch (error) {
          console.error("❌ [KAPAKLI] Variant loading error:", error);
          setVariants([]);
        } finally {
          setLoadingVariants(false);
        }
      }
    },
    [setFormData, setVariants, setLoadingVariants]
  );

  // Set variant from URL
  useEffect(() => {
    if (variantSlug && variants.length > 0) {
      const variant = variants.find((v) => v.slug === variantSlug);
      if (variant) {
        handleInputChange("variantId", variant.id.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantSlug, variants]);

  const handleInputChange = useCallback(
    (
      field: keyof KapakliFormData,
      value: string | number | File[] | File | null | boolean
    ) => {
      // Handle brand change - call handleBrandChange function
      if (field === "brandId") {
        handleBrandChange(value as string);
        return;
      }

      // Handle model change - call handleModelChange function
      if (field === "modelId") {
        handleModelChange(value as string);
        return;
      }

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
    },
    [handleBrandChange, handleModelChange]
  );

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
    console.log("🚀 KapakliTipForm handleSubmit başladı");
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

      // Kapaklı dorse özel bilgileri
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
        "Kapaklı Tip Dorse ilanı başarıyla oluşturuldu:",
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
                placeholder="Örn: Tertemiz 2020 Model Kapaklı Tip Damperli Dorse"
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
                  {KAPAKLI_TIP_MARKALARI.map((marka) => (
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

export default KapakliTipForm;
