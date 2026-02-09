import React, { useState, useEffect } from "react";
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
  Checkbox,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import {
  PhotoCamera,
  CheckCircle,
  Close,
  Videocam,
  PlayArrow,
  PictureAsPdf,
  Add,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../layout/Header";
import apiClient from "@/api/client";
import { getTokenFromStorage } from "@/utils/tokenUtils";

// Interfaces
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

type PartStatus = "Orijinal" | "Lokal Boyalı" | "Boyalı" | "Değişen";

interface PartDetail {
  type: string;
  description?: string;
  color?: string;
}

interface PartInfo {
  status: PartStatus | null;
  details: PartDetail[];
}

interface ExpertiseInfo {
  [key: string]: PartInfo;
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
  currency: string;
  fuelType: string;
  transmission: string;
  condition: string;
  mileage: string;
  bodyType: string;
  chassis: string;
  motorPower: string;
  engineVolume: string;
  drivetrain: string;
  seatCount: string;
  color: string;
  licenseType: string;
  hasAccidentRecord: string;
  plateNumber: string;
  exchange: string;
  plateType: string;
  cityId: string;
  districtId: string;
  photos: File[];
  showcasePhoto: File | null;
  videos: File[];
  safetyFeatures: { [key: string]: boolean };
  interiorFeatures: { [key: string]: boolean };
  exteriorFeatures: { [key: string]: boolean };
  multimediaFeatures: { [key: string]: boolean };
  expertiseInfo: ExpertiseInfo;
  expertiseReport: File | null;
  hasExpertiseInfo: boolean;
}

const CreateMinivanPanelvanForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams<{
    categorySlug: string;
    brandSlug: string;
    modelSlug: string;
    variantSlug: string;
  }>();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    categoryId: "",
    brandId: "",
    modelId: "",
    variantId: "",
    title: "",
    description: "",
    year: "",
    price: "",
    currency: "TRY",
    fuelType: "",
    transmission: "",
    condition: "",
    mileage: "",
    bodyType: "",
    chassis: "",
    motorPower: "",
    engineVolume: "",
    drivetrain: "",
    seatCount: "",
    color: "",
    licenseType: "",
    hasAccidentRecord: "",
    plateNumber: "",
    exchange: "",
    plateType: "",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    videos: [],
    safetyFeatures: {},
    interiorFeatures: {},
    exteriorFeatures: {},
    multimediaFeatures: {},
    expertiseInfo: {},
    expertiseReport: null,
    hasExpertiseInfo: false,
  });

  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [expertiseReportPreview, setExpertiseReportPreview] = useState<
    string | null
  >(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  console.log("URL Parametreleri:", {
    categorySlug,
    brandSlug,
    modelSlug,
    variantSlug,
  });

  // Araç parçaları tanımlamaları - SVG koordinatları (1500x1000 viewBox için)
  const CAR_PARTS = [
    { id: "onTampon", name: "Ön Tampon", x: 500, y: 1200 },
    { id: "motorKaputu", name: "Motor Kaputu", x: 500, y: 1070 },
    { id: "tavan", name: "Tavan", x: 500, y: 650 },
    { id: "sagOnCamurluk", name: "Sağ Ön Çamurluk", x: 650, y: 1070 },
    { id: "sagOnKapi", name: "Sağ Ön Kapı", x: 650, y: 750 },
    { id: "sagArkaKapi", name: "Sağ Arka Kapı", x: 650, y: 520 },
    { id: "sagArkaCamurluk", name: "Sağ Arka Çamurluk", x: 650, y: 380 },
    { id: "solOnCamurluk", name: "Sol Ön Çamurluk", x: 350, y: 1070 },
    { id: "solOnKapi", name: "Sol Ön Kapı", x: 350, y: 750 },
    { id: "solArkaKapi", name: "Sol Arka Kapı", x: 350, y: 520 },
    { id: "solArkaCamurluk", name: "Sol Arka Çamurluk", x: 350, y: 380 },
    { id: "bagajKapagi", name: "Bagaj Kapağı", x: 500, y: 400 },
    { id: "arkaTampon", name: "Arka Tampon", x: 500, y: 320 },
  ];

  // Detay tipleri
  const DETAIL_TYPES = [
    "Hafif Çizik",
    "Derin Çizik",
    "Hafif Ezik",
    "Dolu Eziği",
    "Sürtme",
    "Taş İzi",
    "Göçük",
    "Kırık / Çatlak",
    "Yırtık",
    "Çıkmayan Leke – Kuş, Ağaç Pisliği",
    "Renk Solması",
    "Güneş Yanığı",
    "Paslanma / Oksitlenme",
    "Mini Onarım / Tamir",
    "Boyasız Göçük Düzeltme",
  ];

  // Dropdown Options
  const FUEL_TYPES = [
    "Benzinli",
    "Benzin & LPG",
    "Dizel",
    "Hibrit",
    "Elektrikli",
  ];
  const TRANSMISSIONS = ["Manuel", "Otomatik"];
  const CONDITIONS = ["Sıfır", "Yurtdışından ithal", "ikinci el"];
  const BODY_TYPES = [
    "Camlı Van",
    "Yarım Camlı Van",
    "Panel Van",
    "Frigorifik Panel Van",
    "Minibüs",
  ];
  const CHASSIS_TYPES = ["Standar", "Orta", "Uzun"];
  const MOTOR_POWERS = [
    "50 hp'ye kadar",
    "51–75 hp",
    "76–100 hp",
    "101–125 hp",
    "126–150 hp",
    "151–175 hp",
    "176–200 hp",
    "201–225 hp",
    "226–250 hp",
    "251–275 hp",
    "276–300 hp",
    "301–325 hp",
    "326–350 hp",
    "351–375 hp",
    "376–400 hp",
    "401–425 hp",
    "426–450 hp",
    "451–475 hp",
    "476–500 hp",
    "501 hp ve üzeri",
  ];
  const ENGINE_VOLUMES = [
    "1300 cm³'e kadar",
    "1301–1600 cm³",
    "1601–1800 cm³",
    "1801–2000 cm³",
    "2001–2500 cm³",
    "2501–3000 cm³",
    "3001–3500 cm³",
    "3501–4000 cm³",
    "4001–4500 cm³",
    "4501–5000 cm³",
    "5001 cm³ ve üzeri",
  ];
  const DRIVETRAINS = ["4x2 Arkadan İtişli", "4x2 Önden Çekişli", "4x4"];
  const SEAT_COUNTS = [
    "1+1",
    "2+1",
    "3+1",
    "4+1",
    "5+1",
    "6+1",
    "7+1",
    "8+1",
    "9+1",
    "10+1",
    "11+1",
    "12+1",
    "13+1",
    "14+1",
    "15+1",
  ];
  const COLORS = [
    "Bej",
    "Beyaz",
    "Bordo",
    "Füme",
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
  const LICENSE_TYPES = ["Otomobil", "Minibüs", "Kamyonet", "Kamyon"];
  const PLATE_TYPES = ["Türkiye Plakalı", "Mavi Plakalı"];

  // Safety Features
  const SAFETY_FEATURES = [
    "ABS",
    "AEB",
    "BAS",
    "Çocuk Kilidi",
    "Distronic",
    "ESP / VSA",
    "Gece Görüş Sistemi",
    "Hava Yastığı (Sürücü)",
    "Hava Yastığı (Yolcu)",
    "Immobilizer",
    "Isofix",
    "Kor Nokta Uyarı Sistemi",
    "Merkezi Kilit",
    "Şerit Takip Sistemi",
    "Yokuş Kalkış Desteği",
    "Yorgunluk Tespit Sistemi",
  ];

  // Interior Features
  const INTERIOR_FEATURES = [
    "Anahtar Giriş ve Çalıştırma",
    "Deri Koltuk",
    "Elektrikli Camlar",
    "Elektrikli Koltuklar",
    "Fonksiyonel Direksiyon",
    "Geri Görüş Kamerası",
    "Head-up Display",
    "Hız Sabiteme Sistemi",
    "Hidrolik Direksiyon",
    "İstimlaj Direksiyon",
    "Klima",
    "Koltuklar (Elektrikli)",
    "Koltuklar (Hafızalı)",
    "Koltuklar (Isıtmalı)",
    "Koltuklar (Soğutmalı)",
    "Kumaş Koltuk",
    "Otm.Kararan Dikiz Aynası",
    "Ön Görüş Kamerası",
    "Ön Koltuk Kol Dayaması",
    "Soğutmalı Torpido",
    "Start / Stop",
    "Yol Bilgisayarı",
  ];

  // Exterior Features
  const EXTERIOR_FEATURES = [
    "Akıllı Bagaj Kapağı",
    "Ayakla Açılan Bagaj Kapağı",
    "Aynalar (Elektrikli)",
    "Aynalar (Hafızalı)",
    "Aynalar (Isıtmalı)",
    "Elektrikli Aynalar",
    "Far (Adaptif)",
    "Otomatik Kapı",
    "Panoramik Cam Tavan",
    "Park Asistanı",
    "Park Sensörü",
    "Park Sensörü (Arka)",
    "Park Sensörü (Ön)",
    "Romork Çeki Demiri",
    "Sunroof",
    "Sürgülü Kapı (Çift)",
    "Sürgülü Kapı (Tek)",
  ];

  // Multimedia Features
  const MULTIMEDIA_FEATURES = [
    "Android Auto",
    "Apple CarPlay",
    "Bluetooth",
    "USB / AUX",
  ];

  // Load category, brand, model, variant on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // categorySlug yoksa default olarak "minivan-panelvan" kullan
      const effectiveCategorySlug = categorySlug || "minivan-panelvan";

      // Güvenlik kontrolü: Tüm parametreler var mı?
      if (!effectiveCategorySlug || !brandSlug || !modelSlug || !variantSlug) {
        console.error("Missing URL parameters:", {
          categorySlug: effectiveCategorySlug,
          brandSlug,
          modelSlug,
          variantSlug,
        });
        setError(
          "URL parametreleri eksik. Lütfen kategori seçiminden başlayın."
        );
        return;
      }

      try {
        // Load category
        const categoryResponse = await apiClient.get(
          `/categories/${effectiveCategorySlug}`
        );
        const categoryData = categoryResponse.data as Category;
        setCategory(categoryData);
        setFormData((prev) => ({
          ...prev,
          categoryId: String(categoryData.id),
        }));

        // Load brand
        const brandResponse = await apiClient.get(
          `/categories/${effectiveCategorySlug}/brands/${brandSlug}`
        );
        const brandData = brandResponse.data as Brand;
        setBrand(brandData);
        setFormData((prev) => ({ ...prev, brandId: String(brandData.id) }));

        // Load model
        const modelResponse = await apiClient.get(
          `/categories/${effectiveCategorySlug}/brands/${brandSlug}/models/${modelSlug}`
        );
        const modelData = modelResponse.data as Model;
        setModel(modelData);
        setFormData((prev) => ({ ...prev, modelId: String(modelData.id) }));

        // Load variant
        const variantResponse = await apiClient.get(
          `/categories/${effectiveCategorySlug}/brands/${brandSlug}/models/${modelSlug}/variants/${variantSlug}`
        );
        const variantData = variantResponse.data as Variant;
        setVariant(variantData);
        setFormData((prev) => ({ ...prev, variantId: String(variantData.id) }));

        // Load cities
        const citiesResponse = await apiClient.get("/cities");
        setCities(citiesResponse.data as City[]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("Veri yüklenirken hata oluştu");
      }
    };

    loadInitialData();
  }, [categorySlug, brandSlug, modelSlug, variantSlug]);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.cityId) {
        setDistricts([]);
        return;
      }

      try {
        const response = await apiClient.get(
          `/cities/${formData.cityId}/districts`
        );
        setDistricts(response.data as District[]);
      } catch (error) {
        console.error("Error loading districts:", error);
      }
    };

    loadDistricts();
  }, [formData.cityId]);

  // Format price with thousand separators
  const formatPrice = (value: string): string => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    // Add thousand separators
    return parseInt(numericValue).toLocaleString("tr-TR");
  };

  // Format mileage with thousand separators
  const formatMileage = (value: string): string => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    // Add thousand separators
    return parseInt(numericValue).toLocaleString("tr-TR");
  };

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (
    category:
      | "safetyFeatures"
      | "interiorFeatures"
      | "exteriorFeatures"
      | "multimediaFeatures",
    feature: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [feature]: !prev[category][feature],
      },
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase = false
  ) => {
    const files = event.target.files;
    if (!files) return;

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
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove showcase photo
  const handleRemoveShowcase = () => {
    setFormData((prev) => ({ ...prev, showcasePhoto: null }));
    setShowcasePreview(null);
  };

  // Handle video upload
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

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
  };

  // Remove video
  const handleRemoveVideo = (index: number) => {
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

  // Ekspertiz raporu yükleme
  const handleExpertiseReportUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // PDF format kontrolü
    if (file.type !== "application/pdf") {
      alert("⚠️ Sadece PDF dosyaları yükleyebilirsiniz");
      return;
    }

    // 25MB limit kontrolü
    if (file.size > 25 * 1024 * 1024) {
      alert("⚠️ Dosya boyutu en fazla 25 MB olabilir");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      expertiseReport: file,
    }));

    // PDF önizlemesi için URL oluştur
    const url = URL.createObjectURL(file);
    setExpertiseReportPreview(url);
  };

  // Ekspertiz raporu kaldırma
  const handleRemoveExpertiseReport = () => {
    setFormData((prev) => ({
      ...prev,
      expertiseReport: null,
    }));
    if (expertiseReportPreview) {
      URL.revokeObjectURL(expertiseReportPreview);
    }
    setExpertiseReportPreview(null);
  };

  // Parça durumu değiştirme
  const handlePartStatusChange = (partId: string, status: PartStatus) => {
    setFormData((prev) => ({
      ...prev,
      expertiseInfo: {
        ...prev.expertiseInfo,
        [partId]: {
          status,
          details: prev.expertiseInfo[partId]?.details || [],
        },
      },
    }));
  };

  // Parça detayı ekleme (sadece 1 detay, yeni detay eskinin yerini alır)
  const handleAddPartDetail = (
    partId: string,
    detailType: string,
    description: string = ""
  ) => {
    setFormData((prev) => {
      const status = prev.expertiseInfo[partId]?.status;

      // Status'e göre renk belirle
      let color = "#9E9E9E"; // Orijinal (gri)
      if (status === "Lokal Boyalı") {
        color = "#FFA500"; // Turuncu
      } else if (status === "Boyalı") {
        color = "#2196F3"; // Mavi
      } else if (status === "Değişen") {
        color = "#F44336"; // Kırmızı
      }

      return {
        ...prev,
        expertiseInfo: {
          ...prev.expertiseInfo,
          [partId]: {
            status: status || null,
            // Her zaman tek bir detay - yeni detay eskinin yerini alır
            details: [{ type: detailType, description, color }],
          },
        },
      };
    });
  };

  // Parça detayı kaldırma
  const handleRemovePartDetail = (partId: string, detailIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      expertiseInfo: {
        ...prev.expertiseInfo,
        [partId]: {
          status: prev.expertiseInfo[partId]?.status || null,
          details:
            prev.expertiseInfo[partId]?.details.filter(
              (_, i) => i !== detailIndex
            ) || [],
        },
      },
    }));
  };

  // Parça detay dialog açma
  const handleOpenDetailDialog = (partId: string) => {
    setSelectedPart(partId);
    setShowDetailDialog(true);
  };

  // Parça detay dialog kapatma
  const handleCloseDetailDialog = () => {
    setSelectedPart(null);
    setShowDetailDialog(false);
  };

  // Success modal kapatma
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setError("İlan başlığı gereklidir");
      return;
    }

    if (
      !formData.year ||
      parseInt(formData.year) < 1900 ||
      parseInt(formData.year) > new Date().getFullYear() + 1
    ) {
      setError("Geçerli bir yıl giriniz");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Geçerli bir fiyat giriniz");
      return;
    }

    if (!formData.cityId) {
      setError("İl seçiniz");
      return;
    }

    if (!formData.districtId) {
      setError("İlçe seçiniz");
      return;
    }

    if (!formData.showcasePhoto && formData.photos.length === 0) {
      setError("Vitrin resmi veya en az 1 fotoğraf yüklemelisiniz");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getTokenFromStorage();
      if (!token) {
        throw new Error("Giriş yapmalısınız");
      }

      // Create FormData for multipart/form-data
      const submitData = new FormData();

      // Add basic fields
      submitData.append("categoryId", formData.categoryId);
      submitData.append("brandId", formData.brandId);
      submitData.append("modelId", formData.modelId);
      submitData.append("variantId", formData.variantId);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("year", formData.year);
      submitData.append("price", formData.price);
      submitData.append("currency", formData.currency || "TRY");
      submitData.append("mileage", formData.mileage);
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Add all custom fields individually (backend expects them separately)
      submitData.append("fuelType", formData.fuelType);
      submitData.append("transmission", formData.transmission);
      submitData.append("condition", formData.condition);
      submitData.append("bodyType", formData.bodyType);
      submitData.append("chassis", formData.chassis);
      submitData.append("motorPower", formData.motorPower);
      submitData.append("engineVolume", formData.engineVolume);
      submitData.append("drivetrain", formData.drivetrain);
      submitData.append("seatCount", formData.seatCount);
      submitData.append("color", formData.color);
      submitData.append("licenseType", formData.licenseType);
      submitData.append("hasAccidentRecord", formData.hasAccidentRecord);
      submitData.append("plateNumber", formData.plateNumber);
      submitData.append("exchange", formData.exchange);
      submitData.append("plateType", formData.plateType);

      // Add features as JSON (backend expects "features" parameter)
      const detailFeatures = {
        safetyFeatures: formData.safetyFeatures,
        interiorFeatures: formData.interiorFeatures,
        exteriorFeatures: formData.exteriorFeatures,
        multimediaFeatures: formData.multimediaFeatures,
      };
      submitData.append("features", JSON.stringify(detailFeatures));

      // Add expertise info
      submitData.append(
        "hasExpertiseInfo",
        formData.hasExpertiseInfo.toString()
      );
      if (!formData.hasExpertiseInfo) {
        // hasExpertiseInfo FALSE ise expertiseInfo'yu gönder (boyalı/değişen parça VAR)
        submitData.append(
          "expertiseInfo",
          JSON.stringify(formData.expertiseInfo)
        );
      }

      // Add showcase photo first
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      // Add other photos with specific naming (photo_0, photo_1, etc.)
      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      // Add videos with specific naming (video_0, video_1, etc.)
      formData.videos.forEach((video, index) => {
        submitData.append(`video_${index}`, video);
      });

      // Add expertise report if exists
      if (formData.expertiseReport) {
        submitData.append("expertiseReport", formData.expertiseReport);
      }

      // Submit to API
      const response = await apiClient.post(
        "/ads/minivan-panelvan",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ İlan başarıyla oluşturuldu:", response.data);
      setSuccess(true);
      setShowSuccessModal(true);

      // Navigate to home page after success (removed auto navigation)
    } catch (error: unknown) {
      console.error("Error creating ad:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "İlan oluşturulurken hata oluştu"
          : "İlan oluşturulurken hata oluştu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Minivan & Panelvan İlanı Oluştur
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {category?.name} / {brand?.name} / {model?.name} / {variant?.name}
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            İlanınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardContent>
            {/* İlan Detayları */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
              İlan Detayları
            </Typography>

            <Box sx={{ display: "grid", gap: 3 }}>
              <TextField
                label="İlan Başlığı"
                required
                fullWidth
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Örn: KALIN YAZı ve Renkli Çerçeve (479,00 TL)"
              />

              <TextField
                label="Açıklama"
                required
                fullWidth
                multiline
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Bireysel kullanıcılarımızda alıcı ve satıcı güvenliğini sağlamak için açıklama alanına telefon numarası yazılan ilanlar onaylanmamaktadır."
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Yıl"
                  required
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                />

                <TextField
                  label="Fiyat"
                  required
                  type="text"
                  value={formatPrice(formData.price)}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    handleInputChange("price", numericValue);
                  }}
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
                        <ToggleButton value="TRY">₺ TL</ToggleButton>
                        <ToggleButton value="USD">$ USD</ToggleButton>
                        <ToggleButton value="EUR">€ EUR</ToggleButton>
                      </ToggleButtonGroup>
                    </InputAdornment>
                ),
                  }}
                  placeholder="0"
                />
              </Box>
            </Box>

            {/* Araç Özellikleri */}
            <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: "bold" }}>
              Araç Özellikleri
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <FormControl fullWidth required>
                <InputLabel>Yakıt Tipi</InputLabel>
                <Select
                  value={formData.fuelType}
                  onChange={(e) =>
                    handleInputChange("fuelType", e.target.value)
                  }
                >
                  {FUEL_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Vites</InputLabel>
                <Select
                  value={formData.transmission}
                  onChange={(e) =>
                    handleInputChange("transmission", e.target.value)
                  }
                >
                  {TRANSMISSIONS.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Araç Durumu</InputLabel>
                <Select
                  value={formData.condition}
                  onChange={(e) =>
                    handleInputChange("condition", e.target.value)
                  }
                >
                  {CONDITIONS.map((cond) => (
                    <MenuItem key={cond} value={cond}>
                      {cond}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="KM"
                required
                type="text"
                value={formatMileage(formData.mileage)}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, "");
                  handleInputChange("mileage", numericValue);
                }}
                InputProps={{
                  endAdornment: (
                    <Box component="span" sx={{ ml: 1 }}>
                      km
                    </Box>
                  ),
                }}
                placeholder="0"
              />

              <FormControl fullWidth required>
                <InputLabel>Kasa Tipi</InputLabel>
                <Select
                  value={formData.bodyType}
                  onChange={(e) =>
                    handleInputChange("bodyType", e.target.value)
                  }
                >
                  {BODY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Şasi</InputLabel>
                <Select
                  value={formData.chassis}
                  onChange={(e) => handleInputChange("chassis", e.target.value)}
                >
                  {CHASSIS_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Motor Gücü</InputLabel>
                <Select
                  value={formData.motorPower}
                  onChange={(e) =>
                    handleInputChange("motorPower", e.target.value)
                  }
                >
                  {MOTOR_POWERS.map((power) => (
                    <MenuItem key={power} value={power}>
                      {power}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Motor Hacmi</InputLabel>
                <Select
                  value={formData.engineVolume}
                  onChange={(e) =>
                    handleInputChange("engineVolume", e.target.value)
                  }
                >
                  {ENGINE_VOLUMES.map((volume) => (
                    <MenuItem key={volume} value={volume}>
                      {volume}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Çekiş</InputLabel>
                <Select
                  value={formData.drivetrain}
                  onChange={(e) =>
                    handleInputChange("drivetrain", e.target.value)
                  }
                >
                  {DRIVETRAINS.map((drive) => (
                    <MenuItem key={drive} value={drive}>
                      {drive}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Koltuk Sayısı</InputLabel>
                <Select
                  value={formData.seatCount}
                  onChange={(e) =>
                    handleInputChange("seatCount", e.target.value)
                  }
                >
                  {SEAT_COUNTS.map((count) => (
                    <MenuItem key={count} value={count}>
                      {count}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Renk</InputLabel>
                <Select
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                >
                  {COLORS.map((color) => (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Ruhsat Kaydı</InputLabel>
                <Select
                  value={formData.licenseType}
                  onChange={(e) =>
                    handleInputChange("licenseType", e.target.value)
                  }
                >
                  {LICENSE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Ağır Hasar Kaydı</InputLabel>
                <Select
                  value={formData.hasAccidentRecord}
                  onChange={(e) =>
                    handleInputChange("hasAccidentRecord", e.target.value)
                  }
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Araç Plakası"
                value={formData.plateNumber}
                onChange={(e) =>
                  handleInputChange("plateNumber", e.target.value)
                }
              />

              <FormControl fullWidth required>
                <InputLabel>Takaslı</InputLabel>
                <Select
                  value={formData.exchange}
                  onChange={(e) =>
                    handleInputChange("exchange", e.target.value)
                  }
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Plaka / Uyruk</InputLabel>
                <Select
                  value={formData.plateType}
                  onChange={(e) =>
                    handleInputChange("plateType", e.target.value)
                  }
                >
                  {PLATE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Adres Bilgileri */}
            <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: "bold" }}>
              Adres Bilgileri
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <FormControl fullWidth required>
                <InputLabel>İl</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => {
                    handleInputChange("cityId", e.target.value);
                    handleInputChange("districtId", "");
                  }}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required disabled={!formData.cityId}>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    handleInputChange("districtId", e.target.value)
                  }
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={String(district.id)}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Donanım Bilgisi - Güvenlik */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: "bold" }}>
              Donanım Bilgisi
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold", color: "primary.main" }}
              >
                Güvenlik
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1,
                }}
              >
                {SAFETY_FEATURES.map((feature) => (
                  <FormControlLabel
                    key={feature}
                    control={
                      <Checkbox
                        checked={!!formData.safetyFeatures[feature]}
                        onChange={() =>
                          handleCheckboxChange("safetyFeatures", feature)
                        }
                      />
                    }
                    label={feature}
                  />
                ))}
              </Box>
            </Box>

            {/* Donanım Bilgisi - İç Donanım */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold", color: "primary.main" }}
              >
                İç Donanım
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1,
                }}
              >
                {INTERIOR_FEATURES.map((feature) => (
                  <FormControlLabel
                    key={feature}
                    control={
                      <Checkbox
                        checked={!!formData.interiorFeatures[feature]}
                        onChange={() =>
                          handleCheckboxChange("interiorFeatures", feature)
                        }
                      />
                    }
                    label={feature}
                  />
                ))}
              </Box>
            </Box>

            {/* Donanım Bilgisi - Dış Donanım */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold", color: "primary.main" }}
              >
                Dış Donanım
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1,
                }}
              >
                {EXTERIOR_FEATURES.map((feature) => (
                  <FormControlLabel
                    key={feature}
                    control={
                      <Checkbox
                        checked={!!formData.exteriorFeatures[feature]}
                        onChange={() =>
                          handleCheckboxChange("exteriorFeatures", feature)
                        }
                      />
                    }
                    label={feature}
                  />
                ))}
              </Box>
            </Box>

            {/* Donanım Bilgisi - Multimedya */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: "bold", color: "primary.main" }}
              >
                Multimedya
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1,
                }}
              >
                {MULTIMEDIA_FEATURES.map((feature) => (
                  <FormControlLabel
                    key={feature}
                    control={
                      <Checkbox
                        checked={!!formData.multimediaFeatures[feature]}
                        onChange={() =>
                          handleCheckboxChange("multimediaFeatures", feature)
                        }
                      />
                    }
                    label={feature}
                  />
                ))}
              </Box>
            </Box>

            {/* Fotoğraf Ekleme */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: "bold" }}>
              Fotoğraflar
            </Typography>

            {/* Vitrin Fotoğrafı */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Vitrin Fotoğrafı <span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="showcase-upload"
                type="file"
                onChange={(e) => handlePhotoUpload(e, true)}
              />
              <label htmlFor="showcase-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  fullWidth
                >
                  Vitrin Fotoğrafı Seç
                </Button>
              </label>

              {showcasePreview && (
                <Box
                  sx={{
                    mt: 2,
                    position: "relative",
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "2px solid #1976d2",
                  }}
                >
                  <img
                    src={showcasePreview}
                    alt="Vitrin"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                    }}
                    onClick={handleRemoveShowcase}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                  <Chip
                    label="Vitrin Resmi"
                    color="primary"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Diğer Fotoğraflar */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Diğer Fotoğraflar (Maks. 15 adet)
              </Typography>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="photo-upload"
                multiple
                type="file"
                onChange={(e) => handlePhotoUpload(e, false)}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  fullWidth
                >
                  Fotoğraf Seç
                </Button>
              </label>

              {/* Photo Preview Grid */}
              {formData.photos.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
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
                        paddingTop: "75%",
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <img
                        src={photoPreviews[index] || URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                        }}
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Boya, Değişen ve Ekspertiz Bilgisi */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Boya, Değişen ve Ekspertiz Bilgisi
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasExpertiseInfo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        hasExpertiseInfo: e.target.checked,
                      }))
                    }
                  />
                }
                label="Boyalı veya Değişen Parça Yok"
              />

              {!formData.hasExpertiseInfo && (
                <>
                  {/* Araç Şeması ve Tablo Yan Yana */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "350px 1fr" },
                      gap: 3,
                      my: 3,
                      alignItems: "start",
                    }}
                  >
                    {/* Sol Taraf - Araç Şeması */}
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        backgroundColor: "#f9f9f9",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
                      >
                        Boyalı veya Değişen Parça
                      </Typography>

                      {/* Renk Açıklamaları */}
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Chip
                          label="Orijinal"
                          sx={{ backgroundColor: "#9E9E9E", color: "white" }}
                          size="small"
                        />
                        <Chip
                          label="Lokal Boyalı"
                          sx={{ backgroundColor: "#FFA500", color: "white" }}
                          size="small"
                        />
                        <Chip
                          label="Boyalı"
                          sx={{ backgroundColor: "#2196F3", color: "white" }}
                          size="small"
                        />
                        <Chip
                          label="Değişen"
                          sx={{ backgroundColor: "#F44336", color: "white" }}
                          size="small"
                        />
                      </Box>

                      {/* Araç SVG Görseli - DİKEY */}
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          maxWidth: "400px",
                          height: "auto",
                          mx: "auto",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src="/car-diagram.svg"
                          alt="Araç Şeması"
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            transform: "rotate(90deg)",
                            transformOrigin: "center center",
                            margin: "150px 0",
                          }}
                        />

                        {/* Interaktif Noktalar - SVG Üzerine Overlay */}
                        <svg
                          viewBox="0 0 1000 1500"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                          }}
                        >
                          {CAR_PARTS.map((part) => {
                            const partInfo = formData.expertiseInfo[part.id];
                            let fillColor = "rgba(232, 232, 232, 0.8)"; // Orijinal (default)

                            if (partInfo?.status === "Lokal Boyalı") {
                              fillColor = "rgba(255, 165, 0, 0.85)"; // Turuncu
                            } else if (partInfo?.status === "Boyalı") {
                              fillColor = "rgba(33, 150, 243, 0.85)"; // Mavi
                            } else if (partInfo?.status === "Değişen") {
                              fillColor = "rgba(244, 67, 54, 0.85)"; // Kırmızı
                            } else if (partInfo?.status === "Orijinal") {
                              fillColor = "rgba(158, 158, 158, 0.75)"; // Gri
                            }

                            return (
                              <g
                                key={part.id}
                                style={{ pointerEvents: "auto" }}
                              >
                                <circle
                                  cx={part.x}
                                  cy={part.y}
                                  r="45"
                                  fill={fillColor}
                                  stroke="#333"
                                  strokeWidth="3"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleOpenDetailDialog(part.id)
                                  }
                                />
                                <circle
                                  cx={part.x}
                                  cy={part.y}
                                  r="30"
                                  fill="white"
                                  fillOpacity="0.9"
                                  style={{
                                    cursor: "pointer",
                                    pointerEvents: "none",
                                  }}
                                >
                                  <title>{part.name}</title>
                                </circle>
                                <text
                                  x={part.x}
                                  y={part.y + 8}
                                  textAnchor="middle"
                                  fontSize="40"
                                  fontWeight="bold"
                                  fill="#333"
                                  style={{
                                    cursor: "pointer",
                                    pointerEvents: "none",
                                  }}
                                >
                                  +
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </Box>
                    </Box>

                    {/* Sağ Taraf - Parça Durumları Tablosu */}
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: "bold", minWidth: 140 }}
                            >
                              Parça
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", minWidth: 80 }}
                            >
                              Orijinal
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", minWidth: 100 }}
                            >
                              Lokal Boyalı
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", minWidth: 80 }}
                            >
                              Boyalı
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", minWidth: 80 }}
                            >
                              Değişen
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: "bold", minWidth: 70 }}
                            >
                              Detay
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {CAR_PARTS.map((part) => {
                            const partInfo = formData.expertiseInfo[part.id];
                            const status = partInfo?.status || "";

                            return (
                              <TableRow key={part.id}>
                                <TableCell>{part.name}</TableCell>
                                <TableCell align="center">
                                  <Radio
                                    checked={status === "Orijinal"}
                                    onChange={() =>
                                      handlePartStatusChange(
                                        part.id,
                                        "Orijinal"
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Radio
                                    checked={status === "Lokal Boyalı"}
                                    onChange={() =>
                                      handlePartStatusChange(
                                        part.id,
                                        "Lokal Boyalı"
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Radio
                                    checked={status === "Boyalı"}
                                    onChange={() =>
                                      handlePartStatusChange(part.id, "Boyalı")
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Radio
                                    checked={status === "Değişen"}
                                    onChange={() =>
                                      handlePartStatusChange(part.id, "Değişen")
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {partInfo?.details &&
                                  partInfo.details.length > 0 ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                        justifyContent: "center",
                                      }}
                                    >
                                      {partInfo.details.map((detail, idx) => (
                                        <Chip
                                          key={idx}
                                          label={detail.type}
                                          size="small"
                                          sx={{
                                            backgroundColor: detail.color,
                                            color: "white",
                                            fontSize: "0.7rem",
                                            height: 20,
                                          }}
                                          onClick={() =>
                                            handleOpenDetailDialog(part.id)
                                          }
                                        />
                                      ))}
                                    </Box>
                                  ) : (
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleOpenDetailDialog(part.id)
                                      }
                                      disabled={!status}
                                    >
                                      🖊️
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Parça Detay Dialog */}
                  <Dialog
                    open={showDetailDialog}
                    onClose={handleCloseDetailDialog}
                    maxWidth="sm"
                    fullWidth
                  >
                    <DialogTitle>
                      {selectedPart &&
                        CAR_PARTS.find((p) => p.id === selectedPart)?.name}
                    </DialogTitle>
                    <DialogContent>
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend">Durum</FormLabel>
                        <RadioGroup
                          value={
                            selectedPart
                              ? formData.expertiseInfo[selectedPart]?.status ||
                                ""
                              : ""
                          }
                          onChange={(e) => {
                            if (selectedPart) {
                              handlePartStatusChange(
                                selectedPart,
                                e.target.value as PartStatus
                              );
                            }
                          }}
                        >
                          <FormControlLabel
                            value="Orijinal"
                            control={<Radio />}
                            label="Orijinal"
                          />
                          <FormControlLabel
                            value="Lokal Boyalı"
                            control={<Radio />}
                            label="Lokal Boyalı"
                          />
                          <FormControlLabel
                            value="Boyalı"
                            control={<Radio />}
                            label="Boyalı"
                          />
                          <FormControlLabel
                            value="Değişen"
                            control={<Radio />}
                            label="Değişen"
                          />
                        </RadioGroup>
                      </FormControl>

                      {/* Detay Seçimi */}
                      {selectedPart &&
                        formData.expertiseInfo[selectedPart]?.status && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Detay (Opsiyonel)
                            </Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                              <InputLabel>Detay Tipi Seçiniz</InputLabel>
                              <Select
                                label="Detay Tipi Seçiniz"
                                value={
                                  formData.expertiseInfo[selectedPart]
                                    ?.details[0]?.type || ""
                                }
                                onChange={(e) => {
                                  if (selectedPart && e.target.value) {
                                    handleAddPartDetail(
                                      selectedPart,
                                      e.target.value
                                    );
                                  }
                                }}
                              >
                                {DETAIL_TYPES.map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Seçili Detay Gösterimi */}
                            {formData.expertiseInfo[selectedPart]?.details.map(
                              (detail, index) => (
                                <Chip
                                  key={index}
                                  label={detail.type}
                                  onDelete={() =>
                                    handleRemovePartDetail(selectedPart, index)
                                  }
                                  sx={{
                                    mr: 1,
                                    mb: 1,
                                    backgroundColor: detail.color || "#e0e0e0",
                                    color: "white",
                                  }}
                                />
                              )
                            )}
                          </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleCloseDetailDialog} color="inherit">
                        Kapat
                      </Button>
                      {selectedPart &&
                        formData.expertiseInfo[selectedPart]?.status && (
                          <Button
                            onClick={handleCloseDetailDialog}
                            variant="contained"
                            color="primary"
                          >
                            Kaydet
                          </Button>
                        )}
                    </DialogActions>
                  </Dialog>
                </>
              )}
            </Box>

            {/* Ekspertiz Raporu */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Ekspertiz Raporu
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Aracınıza ait sahibinden.com anlaşmalı ekspertiz firmaları
                tarafından yapılan <strong>ekspertiz raporu</strong> varsa
                seçebilir veya bilgisayarınızdan dosya ekleyebilirsiniz.
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Ekleyeceğiniz ekspertiz dosyası <strong>pdf formatında</strong>{" "}
                olmalıdır. Dosyanın boyutu en fazla <strong>25 MB</strong>{" "}
                olabilir.
              </Typography>

              <input
                accept="application/pdf"
                style={{ display: "none" }}
                id="expertise-report-upload"
                type="file"
                onChange={handleExpertiseReportUpload}
              />
              <label htmlFor="expertise-report-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Add />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Dosya Ekle ya da sürükle bırak
                </Button>
              </label>

              {/* PDF Preview */}
              {formData.expertiseReport && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <PictureAsPdf sx={{ fontSize: 40, color: "#d32f2f" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {formData.expertiseReport.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(
                            formData.expertiseReport.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleRemoveExpertiseReport}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Video Ekleme */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Videolar (Maks. 3 adet, Her biri max 50MB)
              </Typography>
              <input
                accept="video/*"
                style={{ display: "none" }}
                id="video-upload"
                multiple
                type="file"
                onChange={handleVideoUpload}
              />
              <label htmlFor="video-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Videocam />}
                  fullWidth
                >
                  Video Seç
                </Button>
              </label>

              {/* Video Preview Grid */}
              {formData.videos.length > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 2,
                  }}
                >
                  {formData.videos.map((video, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        paddingTop: "56.25%", // 16:9 aspect ratio
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "2px solid #1976d2",
                        backgroundColor: "#000",
                      }}
                    >
                      <video
                        src={videoPreviews[index] || URL.createObjectURL(video)}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        controls
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                        }}
                        onClick={() => handleRemoveVideo(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "white",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <PlayArrow fontSize="small" />
                        <Typography variant="caption">
                          Video {index + 1}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Submit Button */}
            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <CheckCircle />
                }
              >
                {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
              </Button>
            </Box>
          </CardContent>
        </Card>

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
              color="primary"
            >
              Ana Sayfaya Dön
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default CreateMinivanPanelvanForm;
