import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  ArrowBackIos,
  ArrowForwardIos,
  Phone,
  Email,
  CalendarToday,
  Speed,
  LocalGasStation,
  Settings,
  Palette,
  Favorite,
  FavoriteBorder,
  Share,
  Print,
  Report,
  PhotoCamera,
  TrendingUp,
  Visibility,
  CompareArrows,
  CheckCircle,
  Info,
  Build,
  DirectionsCar,
  LocationOn,
  FitnessCenter,
  UnfoldMore,
  Height,
} from "@mui/icons-material";
import Header from "../components/layout/Header";
import GoogleMap from "../components/maps/GoogleMap";
import api from "../api/client";
import type { RootState } from "../store";

// Türkiye şehir koordinatları (basit bir liste)
const getCityCoordinates = (cityName: string): { lat: number; lng: number } => {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    Adana: { lat: 37.0, lng: 35.3213 },
    Adıyaman: { lat: 37.7648, lng: 38.2786 },
    Afyonkarahisar: { lat: 38.7507, lng: 30.5567 },
    Ağrı: { lat: 39.7191, lng: 43.0503 },
    Aksaray: { lat: 38.3687, lng: 34.037 },
    Amasya: { lat: 40.6499, lng: 35.8353 },
    Ankara: { lat: 39.9334, lng: 32.8597 },
    Antalya: { lat: 36.8841, lng: 30.7056 },
    Ardahan: { lat: 41.1105, lng: 42.7022 },
    Artvin: { lat: 41.1828, lng: 41.8183 },
    Aydın: { lat: 37.856, lng: 27.8416 },
    Balıkesir: { lat: 39.6484, lng: 27.8826 },
    Bartın: { lat: 41.5811, lng: 32.461 },
    Batman: { lat: 37.8812, lng: 41.1351 },
    Bayburt: { lat: 40.2552, lng: 40.2249 },
    Bilecik: { lat: 40.0567, lng: 30.0665 },
    Bingöl: { lat: 38.8846, lng: 40.7696 },
    Bitlis: { lat: 38.3938, lng: 42.1232 },
    Bolu: { lat: 40.576, lng: 31.6061 },
    Burdur: { lat: 37.4613, lng: 30.0665 },
    Bursa: { lat: 40.2669, lng: 29.0634 },
    Çanakkale: { lat: 40.1553, lng: 26.4142 },
    Çankırı: { lat: 40.6013, lng: 33.6134 },
    Çorum: { lat: 40.5506, lng: 34.9556 },
    Denizli: { lat: 37.7765, lng: 29.0864 },
    Diyarbakır: { lat: 37.9144, lng: 40.2306 },
    Düzce: { lat: 40.8438, lng: 31.1565 },
    Edirne: { lat: 41.6818, lng: 26.5623 },
    Elazığ: { lat: 38.681, lng: 39.2264 },
    Erzincan: { lat: 39.75, lng: 39.5 },
    Erzurum: { lat: 39.9, lng: 41.27 },
    Eskişehir: { lat: 39.7767, lng: 30.5206 },
    Gaziantep: { lat: 37.0662, lng: 37.3833 },
    Giresun: { lat: 40.9128, lng: 38.3895 },
    Gümüşhane: { lat: 40.4386, lng: 39.5086 },
    Hakkari: { lat: 37.5833, lng: 43.7333 },
    Hatay: { lat: 36.4018, lng: 36.3498 },
    Iğdır: { lat: 39.888, lng: 44.0048 },
    Isparta: { lat: 37.7648, lng: 30.5566 },
    İstanbul: { lat: 41.0082, lng: 28.9784 },
    İzmir: { lat: 38.4192, lng: 27.1287 },
    Kahramanmaraş: { lat: 37.5858, lng: 36.9371 },
    Karabük: { lat: 41.2061, lng: 32.6204 },
    Karaman: { lat: 37.1759, lng: 33.2287 },
    Kars: { lat: 40.6013, lng: 43.0975 },
    Kastamonu: { lat: 41.3887, lng: 33.7827 },
    Kayseri: { lat: 38.7312, lng: 35.4787 },
    Kırıkkale: { lat: 39.8468, lng: 33.5153 },
    Kırklareli: { lat: 41.7333, lng: 27.2167 },
    Kırşehir: { lat: 39.1425, lng: 34.1709 },
    Kilis: { lat: 36.7184, lng: 37.1212 },
    Kocaeli: { lat: 40.8533, lng: 29.8815 },
    Konya: { lat: 37.8667, lng: 32.4833 },
    Kütahya: { lat: 39.4167, lng: 29.9833 },
    Malatya: { lat: 38.3552, lng: 38.3095 },
    Manisa: { lat: 38.6191, lng: 27.4289 },
    Mardin: { lat: 37.3212, lng: 40.7245 },
    Mersin: { lat: 36.8, lng: 34.6333 },
    Muğla: { lat: 37.2153, lng: 28.3636 },
    Muş: { lat: 38.9462, lng: 41.7539 },
    Nevşehir: { lat: 38.6939, lng: 34.6857 },
    Niğde: { lat: 37.9667, lng: 34.6833 },
    Ordu: { lat: 40.9839, lng: 37.8764 },
    Osmaniye: { lat: 37.0742, lng: 36.2478 },
    Rize: { lat: 41.0201, lng: 40.5234 },
    Sakarya: { lat: 40.694, lng: 30.4358 },
    Samsun: { lat: 41.2928, lng: 36.3313 },
    Siirt: { lat: 37.9333, lng: 41.95 },
    Sinop: { lat: 42.0231, lng: 35.1531 },
    Sivas: { lat: 39.7477, lng: 37.0179 },
    Şanlıurfa: { lat: 37.1591, lng: 38.7969 },
    Şırnak: { lat: 37.4187, lng: 42.4918 },
    Tekirdağ: { lat: 40.9833, lng: 27.5167 },
    Tokat: { lat: 40.3167, lng: 36.55 },
    Trabzon: { lat: 41.0015, lng: 39.7178 },
    Tunceli: { lat: 39.5401, lng: 39.4846 },
    Uşak: { lat: 38.6823, lng: 29.4082 },
    Van: { lat: 38.4891, lng: 43.4089 },
    Yalova: { lat: 40.65, lng: 29.2667 },
    Yozgat: { lat: 39.8181, lng: 34.8147 },
    Zonguldak: { lat: 41.4564, lng: 31.7987 },
  };

  return cityCoords[cityName] || { lat: 39.9334, lng: 32.8597 }; // Ankara default
};

interface AdImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
}

interface AdDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  year?: number;
  mileage?: number;
  categorySlug: string;
  brandSlug: string;
  modelSlug: string;
  variantSlug?: string;
  city: { name: string };
  district: { name: string };
  condition: string;
  isExchangeable: boolean;
  createdAt: string;
  updatedAt: string;
  images: AdImage[];
  customFields: Record<string, unknown>;
  category: { name: string; slug: string };
  brand: { name: string; slug: string };
  model: { name: string; slug: string };
  variant?: { name: string; slug: string };
  viewCount: number;
  isFavorite: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    createdAt: string;
    totalAds: number;
    isVerified: boolean;
  };
}

interface SimilarAd {
  id: number;
  title: string;
  price: number;
  images: AdImage[];
  city: { name: string };
  createdAt: string;
}

// Kategoriye özel görünecek alanlar
const getCategorySpecificFields = (categorySlug: string): string[] => {
  const fieldConfigs: Record<string, string[]> = {
    // Kamyon - tam araç bilgileri
    kamyon: [
      "cabin",
      "color",
      "address",
      "exchange",
      "features",
      "fuelType",
      "condition",
      "plateType",
      "drivetrain",
      "motorPower",
      "plateNumber",
      "detailedInfo",
      "loadCapacity",
      "transmission",
      "tireCondition",
      "superstructure",
      "productionYear",
      "mileage",
      "isExchangeable",
    ],

    // Kamyon & Kamyonet slug'ı için aynı konfigurasyon
    "kamyon-kamyonet": [
      "cabin",
      "color",
      "address",
      "exchange",
      "features",
      "fuelType",
      "condition",
      "plateType",
      "drivetrain",
      "motorPower",
      "plateNumber",
      "detailedInfo",
      "loadCapacity",
      "transmission",
      "tireCondition",
      "superstructure",
      "productionYear",
      "mileage",
      "isExchangeable",
    ],

    // Çekici - tam araç bilgileri + çekici özel
    cekici: [
      "color",
      "bedCount",
      "exchange",
      "features",
      "fuelType",
      "cabinType",
      "condition",
      "plateType",
      "enginePower",
      "paintChange",
      "plateNumber",
      "damageRecord",
      "detailedInfo",
      "transmission",
      "tireCondition",
      "dorseAvailable",
      "engineCapacity",
      "productionYear",
      "mileage",
      "isExchangeable",
    ],

    // Otobüs - tam araç bilgileri + otobüs özel
    otobus: [
      "color",
      "exchange",
      "features",
      "fuelType",
      "gearType",
      "condition",
      "gearCount",
      "plateType",
      "drivetrain",
      "seatLayout",
      "paintChange",
      "plateNumber",
      "damageRecord",
      "detailedInfo",
      "fuelCapacity",
      "transmission",
      "tireCondition",
      "seatBackScreen",
      "passengerCapacity",
      "productionYear",
      "mileage",
      "isExchangeable",
    ],

    // Minibüs - tam araç bilgileri + minibüs özel
    minibus: [
      "color",
      "chassis",
      "exchange",
      "fuelType",
      "roofType",
      "condition",
      "plateType",
      "seatCount",
      "drivetrain",
      "plateNumber",
      "detailedInfo",
      "engineVolume",
      "transmission",
      "detailFeatures",
      "address",
      "productionYear",
      "mileage",
      "isExchangeable",
    ],

    // Minibüs & Midibüs slug'ı için aynı konfigurasyon
    "minibus-midibus": [
      "color",
      "chassis",
      "exchange",
      "fuelType",
      "roofType",
      "condition",
      "plateType",
      "seatCount",
      "drivetrain",
      "plateNumber",
      "detailedInfo",
      "engineVolume",
      "transmission",
      "detailFeatures",
      "address",
      "productionYear",
      "mileage",
      "isExchangeable",
    ],

    // Genel Dorse kategorisi
    dorse: [
      "uzunluk",
      "exchange",
      "genislik",
      "warranty",
      "negotiable",
      "detailedInfo",
      "devrilmeYonu",
      "lastikDurumu",
      "productionYear",
      "condition",
      "isExchangeable",
    ],

    // Dorse alt kategorileri - araç harici bilgiler
    "kaya-tipi": [
      "productionYear",
      "condition",
      "isExchangeable",
      "genislik",
      "uzunluk",
      "lastikDurumu",
      "devrilmeYonu",
      "warranty",
      "negotiable",
    ],

    "kapakli-tip": [
      "productionYear",
      "condition",
      "isExchangeable",
      "genislik",
      "uzunluk",
      "lastikDurumu",
      "devrilmeYonu",
      "warranty",
      "negotiable",
    ],

    "hafriyat-tipi": [
      "productionYear",
      "condition",
      "isExchangeable",
      "genislik",
      "uzunluk",
      "lastikDurumu",
      "devrilmeYonu",
      "warranty",
      "negotiable",
    ],

    "havuz-hardox-tipi": [
      "productionYear",
      "condition",
      "isExchangeable",
      "genislik",
      "uzunlugu",
      "lastikDurumu",
      "devrilmeYonu",
      "warranty",
      "negotiable",
    ],

    // Tanker - sıvı taşıma özel
    tanker: [
      "productionYear",
      "condition",
      "isExchangeable",
      "hacim",
      "gozSayisi",
      "lastikDurumu",
      "renk",
      "warranty",
      "negotiable",
    ],

    // Oto kurtarıcı/taşıyıcı - özel platform bilgileri
    "tekli-arac": [
      "productionYear",
      "mileage",
      "fuelType",
      "condition",
      "isExchangeable",
      "engineVolume",
      "maxPower",
      "maxTorque",
      "platformLength",
      "platformWidth",
      "maxVehicleCapacity",
      "loadCapacity",
    ],

    "coklu-arac": [
      "productionYear",
      "mileage",
      "fuelType",
      "condition",
      "isExchangeable",
      "engineVolume",
      "maxPower",
      "maxTorque",
      "platformLength",
      "platformWidth",
      "maxVehicleCapacity",
      "loadCapacity",
    ],

    // Damperli genel
    damperli: [
      "productionYear",
      "condition",
      "isExchangeable",
      "genislik",
      "uzunluk",
      "lastikDurumu",
      "devrilmeYonu",
      "warranty",
      "negotiable",
    ],

    // Lowbed benzeri - platform bilgileri
    lowbed: [
      "productionYear",
      "condition",
      "isExchangeable",
      "platformLength",
      "platformWidth",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    // Konteyner taşıyıcı
    "konteyner-tasiyici": [
      "productionYear",
      "condition",
      "isExchangeable",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    // Kapalı kasa alt kategorileri - hacim ve boyut bilgileri
    "kapali-kasa": [
      "productionYear",
      "condition",
      "isExchangeable",
      "volume",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    "acik-kasa": [
      "productionYear",
      "condition",
      "isExchangeable",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    silobas: [
      "productionYear",
      "condition",
      "isExchangeable",
      "hacim",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    tekstil: [
      "productionYear",
      "condition",
      "isExchangeable",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    "ahsap-kasa": [
      "productionYear",
      "condition",
      "isExchangeable",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    "ozel-kasa": [
      "productionYear",
      "condition",
      "isExchangeable",
      "loadCapacity",
      "warranty",
      "negotiable",
    ],

    // Oto kurtarıcı taşıyıcı
    "oto-kurtarici-tasiyici": [
      "year",
      "mileage",
      "engineVolume",
      "maxPower",
      "maxTorque",
      "fuelType",
      "platformLength",
      "platformWidth",
      "maxVehicleCapacity",
      "loadCapacity",
      "plateNumber",
      "exchange",
      "address",
      "detailedInfo",
      "features",
    ],
  };

  return (
    fieldConfigs[categorySlug] || [
      "productionYear",
      "condition",
      "isExchangeable",
    ]
  );
};

const AdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [ad, setAd] = useState<AdDetail | null>(null);
  const [similarAds, setSimilarAds] = useState<SimilarAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Google Maps için state'ler
  const [mapCoordinates, setMapCoordinates] = useState({
    lat: 39.9334,
    lng: 32.8597, // Ankara default
  });

  const fetchAdDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ads/${id}`);
      const adData = response.data as AdDetail;

      // Debug için console.log ekleyelim
      console.log("📸 İlan verileri:", adData);
      console.log(
        "📸 Custom Fields Keys:",
        Object.keys(adData.customFields || {})
      );
      console.log("📸 Custom Fields:", adData.customFields);

      // Null olmayan alanları göster
      const nonNullFields = Object.entries(adData.customFields || {})
        .filter(
          ([, value]) => value !== null && value !== undefined && value !== ""
        )
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
      console.log("📸 Non-null Fields:", nonNullFields);

      // Category slug ve allowed fields debug
      const categorySlug = adData.category?.slug || adData.categorySlug || "";
      const allowedFields = getCategorySpecificFields(categorySlug);
      console.log("📸 Category Slug:", categorySlug);
      console.log("📸 Allowed Fields:", allowedFields);

      setAd(adData);
      setIsFavorite(adData.isFavorite);

      // Konum koordinatlarını ayarla (Türkiye şehir koordinatları)
      if (adData.city?.name) {
        const cityCoordinates = getCityCoordinates(adData.city.name);
        setMapCoordinates(cityCoordinates);
      }

      // Benzer ilanları da çek
      try {
        const similarResponse = await api.get(`/ads/${id}/similar`);
        setSimilarAds(similarResponse.data as SimilarAd[]);
      } catch {
        setSimilarAds([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "İlan yüklenirken hata oluştu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAdDetail();
    }
  }, [id, fetchAdDetail]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await api.delete(`/favorites/${ad!.id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${ad!.id}`);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favorilere eklenirken/çıkarılırken hata:", err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad?.title,
        text: ad?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link kopyalandı!");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Güvenli value render fonksiyonu
  const renderFieldValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (typeof value === "boolean") {
      return value ? "Var" : "Yok";
    }

    if (typeof value === "object") {
      try {
        // DetailFeatures objesi için özel parsing
        if (typeof value === "object" && value !== null) {
          const obj = value as Record<string, unknown>;
          if (Object.keys(obj).every((key) => typeof obj[key] === "boolean")) {
            // Boolean değerlerden oluşan obje ise, true olanları listele
            const trueValues = Object.entries(obj)
              .filter(([, val]) => val === true)
              .map(([key]) => getSpecificationLabel(key));
            return trueValues.length > 0 ? trueValues.join(", ") : "Yok";
          }
        }
        return JSON.stringify(value);
      } catch {
        return "[Object]";
      }
    }

    return String(value);
  };

  // Telefon numarasını formatla (0544 444 44 44)
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";

    // Sadece rakamları al
    const numbers = phone.replace(/\D/g, "");

    // Türk telefon numarası formatı (05XXXXXXXXX)
    if (numbers.length === 11 && numbers.startsWith("05")) {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(
        7,
        9
      )} ${numbers.slice(9, 11)}`;
    }

    // Başka formatlar için varsayılan
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSpecificationIcon = (key: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      productionYear: <CalendarToday />,
      mileage: <Speed />,
      fuelType: <LocalGasStation />,
      transmission: <Settings />,
      enginePower: <Build />,
      color: <Palette />,
      condition: <CheckCircle />,
      isExchangeable: <CompareArrows />,

      // Çekici özel iconları
      bedCount: <Build />,
      cabinType: <DirectionsCar />,
      dorseAvailable: <CheckCircle />,
      damageRecord: <Build />,
      paintChange: <Palette />,
      engineCapacity: <Build />,

      // Otobüs özel iconları
      capacity: <DirectionsCar />,
      seatArrangement: <DirectionsCar />,
      seatBackScreen: <CheckCircle />,
      fuelCapacity: <LocalGasStation />,

      // Minibüs özel iconları
      engineVolume: <Build />,
      seatCount: <DirectionsCar />,
      roofType: <DirectionsCar />,
      chassis: <DirectionsCar />,

      // Dorse özel iconları
      genislik: <DirectionsCar />,
      uzunluk: <DirectionsCar />,
      lastikDurumu: <Speed />,
      devrilmeYonu: <Settings />,
      warranty: <CheckCircle />,
      negotiable: <CompareArrows />,

      // Tanker özel iconları
      hacim: <LocalGasStation />,
      gozSayisi: <Settings />,
      renk: <Palette />,

      // Platform/Kurtarıcı özel iconları
      year: <CalendarToday />,
      maxPower: <Build />,
      maxTorque: <Build />,
      plateNumber: <Info />,
      platformLength: <DirectionsCar />,
      platformWidth: <DirectionsCar />,
      maxVehicleCapacity: <FitnessCenter />,
      loadCapacity: <FitnessCenter />,

      // Lowbed özel iconları
      havuzDerinligi: <Height />,
      havuzGenisligi: <DirectionsCar />,
      havuzUzunlugu: <DirectionsCar />,
      istiapHaddi: <FitnessCenter />,
      uzatilabilirProfil: <UnfoldMore />,
      dingilSayisi: <Settings />,
      rampaMekanizmasi: <Build />,

      // Genel
      tireCondition: <Speed />,
      exchange: <CompareArrows />,
    };
    return iconMap[key] || <Info />;
  };

  const getSpecificationLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      // Genel araç özellikleri
      productionYear: "Üretim Yılı",
      mileage: "Kilometre",
      fuelType: "Yakıt Türü",
      transmission: "Vites",
      enginePower: "Motor Gücü",
      color: "Renk",
      condition: "Durum",
      isExchangeable: "Takas",

      // Görseldeki alanlar
      renk: "Renk",
      address: "Adres",
      exchange: "Takas",
      roofType: "Çatı Tipi",
      plateType: "Plaka Tipi",
      districtId: "İlçe",
      plateNumber: "Plaka Numarası",
      engineVolume: "Motor Hacmi",
      detailFeatures: "Detay Özellikler",
      cityId: "Şehir",
      chassis: "Şasi",
      yakitTuru: "Yakıt Türü",
      durum: "Durum",
      seatCount: "Koltuk Sayısı",
      drivetrain: "Çekiş",
      detailedInfo: "Detaylı Bilgi",
      vites: "Vites",

      // Kamyon/Tır özellikleri
      volume: "Hacim",
      capacity: "Kapasite",
      material: "Malzeme",
      hasDamper: "Damper",
      axleCount: "Aks Sayısı",
      length: "Uzunluk",
      width: "Genişlik",
      height: "Yükseklik",
      weight: "Ağırlık",

      // Kamyon Formu Alanları
      loadCapacity: "Yük Kapasitesi",
      tireCondition: "Lastik Durumu",
      superstructure: "Üst Yapı",
      motorPower: "Motor Gücü",
      cabin: "Kabin",

      // Çekici spesifik alanlar
      bedCount: "Yatak Sayısı",
      cabinType: "Kabin Tipi",
      dorseAvailable: "Dorse Var mı",
      damageRecord: "Hasar Kaydı",
      paintChange: "Boya Değişimi",
      engineCapacity: "Motor Hacmi",

      // Otobüs özellikleri
      passengerCapacity: "Yolcu Kapasitesi",
      doorCount: "Kapı Sayısı",
      seatLayout: "Koltuk Düzeni",
      seatBackScreen: "Koltuk Arkası Ekran",

      // Dorse/Damperli özellikleri
      genislik: "Genişlik (m)",
      uzunluk: "Uzunluk (m)",
      lastikDurumu: "Lastik Durumu (%)",
      devrilmeYonu: "Devrilme Yönü",
      warranty: "Garanti",
      negotiable: "Pazarlık",

      // Lowbed özellikleri
      havuzDerinligi: "Havuz Derinliği (m)",
      havuzGenisligi: "Havuz Genişliği (m)",
      havuzUzunlugu: "Havuz Uzunluğu (m)",
      istiapHaddi: "İstiap Haddi (ton)",
      uzatilabilirProfil: "Uzatılabilir Profil",
      dingilSayisi: "Dingil Sayısı",
      rampaMekanizmasi: "Rampa Mekanizması",

      // Güvenlik ve konfor özellikleri
      abs: "ABS",
      asr: "ASR",
      esp: "ESP",
      alarm: "Alarm",
      klima: "Klima",
      farSis: "Far Sis",
      cdCalar: "CD Çalar",
      elFreni: "El Freni",
      spoyler: "Spoyler",
      sunroof: "Sunroof",
      xenonFar: "Xenon Far",
      ayakFreni: "Ayak Freni",
      dvdPlayer: "DVD Player",
      garantili: "Garantili",
      okulAraci: "Okul Aracı",
      radioTeyp: "Radyo Teyp",
      sigortali: "Sigortalı",
      alasimJant: "Alaşım Jant",
      bagajHacmi: "Bagaj Hacmi",
      cekiDemiri: "Çeki Demiri",
      deriDoseme: "Deri Döşeme",
      farSensoru: "Far Sensörü",
      havaYastigi: "Hava Yastığı",
      immobilizer: "Immobilizer",
      otomatikCam: "Otomatik Cam",
      parkSensoru: "Park Sensörü",
      hizSabitleme: "Hız Sabitleme",
      merkeziKilit: "Merkezi Kilit",

      // Çekici özellikleri
      cd: "CD Çalar",
      ebv: "EBV",
      gps: "GPS",
      pto: "PTO",
      radio: "Radyo",
      table: "Masa",
      airBag: "Hava Yastığı",
      spoiler: "Spoyler",
      towHook: "Çeki Demiri",
      retarder: "Retarder",
      fogLight: "Sis Farı",
      alloyWheel: "Alaşım Jant",
      sideAirbag: "Yan Hava Yastığı",
      heatedSeats: "Isıtmalı Koltuklar",

      // Tanker özellikleri
      hacim: "Hacim (Litre)",
      gozSayisi: "Göz Sayısı",

      // Platform/Kurtarıcı özellikleri
      year: "Üretim Yılı",
      maxPower: "Maksimum Güç",
      maxTorque: "Maksimum Tork",
      platformLength: "Platform Uzunluğu",
      platformWidth: "Platform Genişliği",
      maxVehicleCapacity: "Maks. Araç Kapasitesi",

      // Otobüs ek özellikleri
      seatArrangement: "Koltuk Düzeni",
      fuelCapacity: "Yakıt Kapasitesi",
      leatherSeat: "Deri Koltuk",
      airCondition: "Klima",
      cruiseControl: "Hız Sabitleme",
      windDeflector: "Rüzgar Deflektörü",
      centralLock: "Merkezi Kilit",
      memorySeats: "Hafızalı Koltuklar",
      tripComputer: "Yol Bilgisayarı",
      powerSteering: "Hidrolik Direksiyon",
      electricMirror: "Elektrikli Aynalar",
      electricWindow: "Elektrikli Camlar",
      headlightSensor: "Far Sensörü",
      headlightWasher: "Far Yıkama Sistemi",
      rainSensor: "Yağmur Sensörü",
      passengerAirbag: "Yolcu Hava Yastığı",
      flexibleReadingLight: "Esnek Okuma Lambası",
      muzikSistemi: "Müzik Sistemi",
      otomatikKapi: "Otomatik Kapı",
      turizmPaketi: "Turizm Paketi",
      tvNavigasyon: "TV Navigasyon",
      elektrikliCam: "Elektrikli Cam",
      sogutucuFrigo: "Soğutucu Frigo",
      yagmurSensoru: "Yağmur Sensörü",
      yanHavaYastigi: "Yan Hava Yastığı",
      yolBilgisayari: "Yol Bilgisayarı",
      farYikamaSistemi: "Far Yıkama Sistemi",
      havaYastigiYolcu: "Hava Yastığı Yolcu",
      isitmalKoltuklar: "Isıtmalı Koltuklar",
      elektrikliAynalar: "Elektrikli Aynalar",
      geriGorusKamerasi: "Geri Görüş Kamerası",
      hidrolikDireksiyon: "Hidrolik Direksiyon",
      yokusKalkisDestegi: "Yokuş Kalkış Desteği",
    };
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  if (error || !ad) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "İlan bulunamadı"}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            variant="contained"
          >
            Ana Sayfaya Dön
          </Button>
        </Container>
      </>
    );
  }

  // Null check'ler
  if (!ad.images) ad.images = [];
  if (!ad.category) ad.category = { name: "", slug: "" };
  if (!ad.brand) ad.brand = { name: "", slug: "" };
  if (!ad.model) ad.model = { name: "", slug: "" };

  const mainImage = ad.images.find((img) => img.isPrimary) || ad.images[0];

  return (
    <>
      <Header />
      <Container
        maxWidth="lg"
        sx={{
          py: isMobile ? 2 : 3,
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
        }}
      >
        {/* Geri Dön Butonu */}
        <Box mb={isMobile ? 2 : 3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: isMobile ? "0.8rem" : "0.875rem" }}
          >
            Geri Dön
          </Button>
        </Box>

        <Box
          display="flex"
          gap={isMobile ? 2 : 4}
          flexDirection={{ xs: "column", md: "row" }}
          sx={{ mx: { xs: 0, md: 2 } }}
        >
          {/* Sol Taraf - Resimler */}
          <Box flex={2.5} sx={{ maxWidth: { md: "65%" } }}>
            {/* Ana Resim */}
            <Paper
              elevation={3}
              sx={{ mb: 3, overflow: "hidden", borderRadius: 2 }}
            >
              <Box position="relative">
                <CardMedia
                  component="img"
                  height="500"
                  image={mainImage ? mainImage.imageUrl : "/placeholder.jpg"}
                  alt={ad.title || "İlan"}
                  sx={{ cursor: "pointer", objectFit: "cover" }}
                  onClick={() => setImageDialogOpen(true)}
                />

                {/* Resim Badge */}
                <Box
                  position="absolute"
                  top={16}
                  left={16}
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    color: "white",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <PhotoCamera />
                  <Typography variant="body2" fontWeight="bold">
                    {ad.images?.length || 0} Fotoğraf
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box
                  position="absolute"
                  top={16}
                  right={16}
                  display="flex"
                  gap={1}
                >
                  <IconButton
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": { backgroundColor: "white" },
                    }}
                    onClick={handleShare}
                  >
                    <Share />
                  </IconButton>
                  <IconButton
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": { backgroundColor: "white" },
                    }}
                    onClick={() => window.print()}
                  >
                    <Print />
                  </IconButton>
                  <IconButton
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": { backgroundColor: "white" },
                    }}
                    onClick={handleFavoriteToggle}
                    disabled={favoriteLoading}
                    color={isFavorite ? "error" : "default"}
                  >
                    {favoriteLoading ? (
                      <CircularProgress size={24} />
                    ) : isFavorite ? (
                      <Favorite />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </Box>
              </Box>

              {/* Küçük Resimler */}
              {ad.images && ad.images.length > 1 && (
                <Box p={2}>
                  <Box
                    display="flex"
                    gap={1}
                    flexWrap="wrap"
                    sx={{ overflowX: "auto" }}
                  >
                    {ad.images.slice(0, 8).map((image, index) => (
                      <Card
                        key={image.id}
                        sx={{
                          cursor: "pointer",
                          minWidth: 100,
                          width: 100,
                          height: 80,
                          border:
                            selectedImageIndex === index
                              ? "3px solid #1976d2"
                              : "1px solid #e0e0e0",
                          borderRadius: 1,
                        }}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setImageDialogOpen(true);
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="80"
                          image={image.imageUrl}
                          alt={`${ad.title || "İlan"} - ${index + 1}`}
                          sx={{ objectFit: "cover" }}
                        />
                      </Card>
                    ))}
                    {ad.images && ad.images.length > 8 && (
                      <Card
                        sx={{
                          cursor: "pointer",
                          minWidth: 100,
                          width: 100,
                          height: 80,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.8)",
                          color: "white",
                          borderRadius: 1,
                        }}
                        onClick={() => setImageDialogOpen(true)}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          +{(ad.images?.length || 0) - 8}
                        </Typography>
                      </Card>
                    )}
                  </Box>
                </Box>
              )}
            </Paper>

            {/* İlan Detayları - Yeni Konum */}
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: "1px solid #f0f0f0",
                backgroundColor: "#fafafa",
              }}
            >
              <Box sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  fontWeight="600"
                  gutterBottom
                  sx={{ color: "#2c3e50", mb: 3, lineHeight: 1.3 }}
                >
                  {ad.title || "İlan Başlığı"}
                </Typography>

                {/* Temel Bilgiler: Şehir, İlçe, Km (kategoriye özel), Yıl */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 2,
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      backgroundColor: "#fff",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="#666"
                      sx={{ fontWeight: "500" }}
                    >
                      Şehir
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#2c3e50", fontWeight: "600" }}
                    >
                      {ad.city?.name || "Belirtilmemiş"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      backgroundColor: "#fff",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="#666"
                      sx={{ fontWeight: "500" }}
                    >
                      İlçe
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#2c3e50", fontWeight: "600" }}
                    >
                      {ad.district?.name || "Belirtilmemiş"}
                    </Typography>
                  </Box>

                  {/* Kilometre - sadece belirli kategorilerde göster */}
                  {getCategorySpecificFields(
                    ad.category?.slug || ad.categorySlug || ""
                  ).includes("mileage") && (
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        backgroundColor: "#fff",
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="#666"
                        sx={{ fontWeight: "500" }}
                      >
                        Kilometre
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: "#2c3e50", fontWeight: "600" }}
                      >
                        {ad.mileage
                          ? `${ad.mileage.toLocaleString()} km`
                          : "Belirtilmemiş"}
                      </Typography>
                    </Box>
                  )}

                  {/* Model Yılı - çoğu kategoride var */}
                  {getCategorySpecificFields(
                    ad.category?.slug || ad.categorySlug || ""
                  ).includes("productionYear") && (
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        backgroundColor: "#fff",
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="#666"
                        sx={{ fontWeight: "500" }}
                      >
                        Model Yılı
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: "#2c3e50", fontWeight: "600" }}
                      >
                        {ad.year || "Belirtilmemiş"}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  mb={4}
                  flexWrap="wrap"
                >
                  {ad.condition &&
                    getCategorySpecificFields(
                      ad.category?.slug || ad.categorySlug || ""
                    ).includes("condition") && (
                      <Chip
                        label={ad.condition}
                        sx={{
                          backgroundColor: "#f8f9fa",
                          color: "#2c3e50",
                          fontWeight: "500",
                          border: "1px solid #e0e0e0",
                        }}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                  {ad.isExchangeable &&
                    getCategorySpecificFields(
                      ad.category?.slug || ad.categorySlug || ""
                    ).includes("isExchangeable") && (
                      <Chip
                        label="Takas Kabul Edilir"
                        sx={{
                          backgroundColor: "#f8f9fa",
                          color: "#2c3e50",
                          fontWeight: "500",
                          border: "1px solid #e0e0e0",
                        }}
                        size="medium"
                        variant="outlined"
                      />
                    )}
                  <Chip
                    icon={<Visibility />}
                    label={`${ad.viewCount || 0} Görüntülenme`}
                    sx={{
                      backgroundColor: "#f8f9fa",
                      color: "#666",
                      fontWeight: "500",
                      border: "1px solid #e0e0e0",
                    }}
                    size="medium"
                    variant="outlined"
                  />
                </Box>

                <Box
                  sx={{
                    backgroundColor: "#fff",
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    mb: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      color: "#2c3e50",
                      fontWeight: "700",
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    {ad.price ? formatPrice(ad.price) : "Fiyat belirtilmemiş"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "600", color: "#2c3e50", mb: 2 }}
                  >
                    Açıklama
                  </Typography>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      textAlign: "justify",
                      color: "#555",
                      backgroundColor: "#fff",
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    {ad.description || "Açıklama bulunmuyor."}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Araç Özellikleri - Daha Sade Tasarım */}
            <Paper
              elevation={1}
              sx={{ mb: 3, borderRadius: 2, border: "1px solid #f0f0f0" }}
            >
              <Box sx={{ p: 3, borderBottom: "1px solid #f5f5f5" }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#2c3e50",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <DirectionsCar sx={{ color: "#3498db" }} />
                  Araç Özellikleri
                </Typography>
              </Box>

              {ad.customFields && Object.keys(ad.customFields).length > 0 ? (
                <Box sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {Object.entries(ad.customFields)
                      .filter(([key, value]) => {
                        // Kategoriye özel alanları filtrele
                        const allowedFields = getCategorySpecificFields(
                          ad.category?.slug || ad.categorySlug || ""
                        );
                        return (
                          allowedFields.includes(key) &&
                          key !== "detailFeatures" &&
                          key !== "cityId" &&
                          key !== "districtId" &&
                          value !== null &&
                          value !== undefined &&
                          value !== ""
                        );
                      })
                      .map(([key, value]) => (
                        <Box
                          key={key}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems:
                              key === "detailedInfo" ? "flex-start" : "center",
                            py: 1.5,
                            px: 2,
                            backgroundColor: "#fafafa",
                            borderRadius: 1,
                            border: "1px solid #f0f0f0",
                            minHeight: key === "detailedInfo" ? "auto" : "48px",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getSpecificationIcon(key)}
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "500", color: "#34495e" }}
                            >
                              {getSpecificationLabel(key)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "600",
                              color: "#2c3e50",
                              textAlign: "right",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: key === "detailedInfo" ? 3 : 1,
                              WebkitBoxOrient: "vertical",
                              wordBreak: "break-word",
                              hyphens: "auto",
                            }}
                          >
                            {renderFieldValue(value)}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Araç özellikleri bulunmuyor.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Detaylı Özellikler - Sade ve Şık */}
            <Paper
              elevation={0}
              sx={{ mb: 3, borderRadius: 2, border: "1px solid #e9ecef" }}
            >
              <Box sx={{ p: 3, borderBottom: "1px solid #f8f9fa" }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{ color: "#343a40", fontSize: "1.1rem" }}
                >
                  Detaylı Özellikler
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                {(() => {
                  // detailFeatures kontrolü
                  const hasDetailFeatures =
                    ad.customFields?.detailFeatures &&
                    typeof ad.customFields.detailFeatures === "object" &&
                    Object.values(
                      ad.customFields.detailFeatures as Record<string, boolean>
                    ).some((v) => v === true);

                  // features kontrolü
                  const hasFeatures =
                    ad.customFields?.features &&
                    typeof ad.customFields.features === "object" &&
                    Object.values(
                      ad.customFields.features as Record<string, boolean>
                    ).some((v) => v === true);

                  if (!hasDetailFeatures && !hasFeatures) {
                    return (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic", textAlign: "center" }}
                      >
                        Detaylı özellik bulunmuyor.
                      </Typography>
                    );
                  }

                  return (
                    <>
                      {/* detailFeatures rendering */}
                      {hasDetailFeatures && (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: 1.5,
                            mb: hasFeatures ? 3 : 0,
                          }}
                        >
                          {Object.entries(
                            ad.customFields.detailFeatures as Record<
                              string,
                              boolean
                            >
                          )
                            .filter(([, value]) => value === true)
                            .map(([key]) => (
                              <Box
                                key={key}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  py: 1,
                                  px: 2,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: 1,
                                  border: "1px solid #e9ecef",
                                }}
                              >
                                <CheckCircle
                                  sx={{
                                    color: "#28a745",
                                    fontSize: 16,
                                    mr: 1.5,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#495057",
                                    fontWeight: "500",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {getSpecificationLabel(key)}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      )}

                      {/* features rendering */}
                      {hasFeatures && (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: 1.5,
                          }}
                        >
                          {Object.entries(
                            ad.customFields.features as Record<string, boolean>
                          )
                            .filter(([, value]) => value === true)
                            .map(([key]) => (
                              <Box
                                key={key}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  py: 1,
                                  px: 2,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: 1,
                                  border: "1px solid #e9ecef",
                                }}
                              >
                                <CheckCircle
                                  sx={{
                                    color: "#28a745",
                                    fontSize: 16,
                                    mr: 1.5,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#495057",
                                    fontWeight: "500",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {getSpecificationLabel(key)}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      )}
                    </>
                  );
                })()}
              </Box>
            </Paper>
          </Box>

          {/* Sağ Taraf - İlan Sahibi Detayları */}
          <Box
            flex={1}
            sx={{
              minWidth: { md: "300px" },
              maxWidth: { md: "35%" },
            }}
          >
            {/* İlan Sahibi - Yeni Tasarım */}
            <Paper
              elevation={1}
              sx={{ mb: 3, borderRadius: 2, border: "1px solid #f0f0f0" }}
            >
              <Box sx={{ p: 3, borderBottom: "1px solid #f5f5f5" }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#2c3e50",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar sx={{ width: 24, height: 24, bgcolor: "#3498db" }}>
                    <Build sx={{ fontSize: 16 }} />
                  </Avatar>
                  İlan Sahibi
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      ad.user?.isVerified ? (
                        <CheckCircle sx={{ color: "#27ae60", fontSize: 20 }} />
                      ) : null
                    }
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mr: 2,
                        bgcolor: "#3498db",
                        fontSize: "1.3rem",
                        fontWeight: "600",
                      }}
                      src={ad.user?.avatar || undefined}
                    >
                      {ad.user?.name
                        ? ad.user.name.charAt(0).toUpperCase()
                        : "U"}
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{ color: "#2c3e50" }}
                    >
                      {ad.user?.name || "Bilinmeyen Satıcı"}
                    </Typography>
                    {ad.user?.isVerified && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <CheckCircle sx={{ color: "#27ae60", fontSize: 16 }} />
                        <Typography
                          variant="caption"
                          sx={{ color: "#27ae60", fontWeight: "500" }}
                        >
                          Doğrulanmış Hesap
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      variant="body2"
                      color="#7f8c8d"
                      sx={{ mt: 0.5 }}
                    >
                      Üyelik:{" "}
                      {ad.user?.createdAt
                        ? formatDate(ad.user.createdAt)
                        : "Bilinmiyor"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                    mb: 3,
                    p: 2,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 1,
                    border: "1px solid #e9ecef",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{ color: "#2c3e50" }}
                    >
                      {ad.user?.totalAds || 0}
                    </Typography>
                    <Typography variant="caption" color="#7f8c8d">
                      Toplam İlan
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      sx={{ color: "#2c3e50" }}
                    >
                      {ad.viewCount || 0}
                    </Typography>
                    <Typography variant="caption" color="#7f8c8d">
                      Görüntülenme
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Phone />}
                    href={`tel:${ad.user?.phone || ""}`}
                    fullWidth
                    disabled={!ad.user?.phone}
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: "600",
                      backgroundColor: "#27ae60",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#229954",
                      },
                      "&:disabled": {
                        backgroundColor: "#bdc3c7",
                        color: "#7f8c8d",
                      },
                    }}
                  >
                    {ad.user?.phone
                      ? formatPhoneNumber(ad.user.phone)
                      : "Telefon Belirtilmemiş"}
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Email />}
                    href={`mailto:${ad.user?.email || ""}`}
                    fullWidth
                    disabled={!ad.user?.email}
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: "600",
                      borderColor: "#3498db",
                      color: "#3498db",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: "#2980b9",
                        backgroundColor: "#ebf3fd",
                      },
                      "&:disabled": {
                        borderColor: "#bdc3c7",
                        color: "#7f8c8d",
                      },
                    }}
                  >
                    E-posta Gönder
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Report />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color: "error.main",
                      borderColor: "error.main",
                      "&:hover": {
                        borderColor: "error.dark",
                        backgroundColor: "error.light",
                      },
                    }}
                  >
                    Şikayet Et
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Konum Bilgisi */}
            {ad && (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn sx={{ fontSize: 28, color: "#1976d2", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="#1976d2">
                    Konum Bilgisi
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="body1" color="text.secondary">
                    📍 {ad?.city?.name} / {ad?.district?.name}
                  </Typography>
                </Box>

                {/* Google Maps */}
                <Box sx={{ borderRadius: 1, overflow: "hidden" }}>
                  <GoogleMap
                    center={mapCoordinates}
                    zoom={12}
                    cityName={ad?.city?.name || ""}
                    districtName={ad?.district?.name || ""}
                  />
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  📍 İlan konumu (yaklaşık)
                </Typography>
              </Paper>
            )}

            {/* Doping Reklamı */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate("/doping")}
            >
              <Box textAlign="center">
                <TrendingUp sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🚀 İlanınızı Öne Çıkarın!
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Doping paketleri ile ilanınız daha fazla görüntülensin
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  Doping Al
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Benzer İlanlar */}
        {similarAds.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#1976d2", mb: 3 }}
            >
              🔍 Benzer İlanlar
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {similarAds.slice(0, 6).map((similarAd) => (
                <Box
                  key={similarAd.id}
                  sx={{ flex: "0 1 auto", minWidth: 200, maxWidth: 250 }}
                >
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => navigate(`/ad/${similarAd.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={
                        similarAd.images[0]
                          ? similarAd.images[0].imageUrl
                          : "/placeholder.jpg"
                      }
                      alt={similarAd.title}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        noWrap
                        sx={{ mb: 1 }}
                      >
                        {similarAd.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {formatPrice(similarAd.price)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        📍 {similarAd.city?.name} •{" "}
                        {formatDate(similarAd.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Resim Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
        >
          <DialogContent sx={{ p: 0, position: "relative" }}>
            {/* Sol Ok */}
            {ad.images && ad.images.length > 1 && (
              <IconButton
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  zIndex: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.8)",
                  },
                }}
                onClick={() => {
                  const newIndex =
                    selectedImageIndex === 0
                      ? ad.images.length - 1
                      : selectedImageIndex - 1;
                  setSelectedImageIndex(newIndex);
                }}
              >
                <ArrowBackIos />
              </IconButton>
            )}

            {/* Sağ Ok */}
            {ad.images && ad.images.length > 1 && (
              <IconButton
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "white",
                  zIndex: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.8)",
                  },
                }}
                onClick={() => {
                  const newIndex =
                    selectedImageIndex === ad.images.length - 1
                      ? 0
                      : selectedImageIndex + 1;
                  setSelectedImageIndex(newIndex);
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            )}

            <CardMedia
              component="img"
              image={
                ad.images && ad.images[selectedImageIndex]
                  ? ad.images[selectedImageIndex].imageUrl
                  : "/placeholder.jpg"
              }
              alt={`${ad.title || "İlan"} - ${selectedImageIndex + 1}`}
              sx={{
                width: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                backgroundColor: "#000",
              }}
            />

            {/* Resim Navigasyonu */}
            {ad.images && ad.images.length > 1 && (
              <Box
                position="absolute"
                bottom={20}
                left="50%"
                sx={{
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                <Box display="flex" gap={1}>
                  {ad.images.map((_, index) => (
                    <Box
                      key={index}
                      width={12}
                      height={12}
                      borderRadius="50%"
                      bgcolor={
                        selectedImageIndex === index
                          ? "primary.main"
                          : "grey.400"
                      }
                      sx={{
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": { transform: "scale(1.2)" },
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default AdDetail;
