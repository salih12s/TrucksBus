import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Header from "../../layout/Header";
import apiClient from "../../../api/client";
import SuccessModal from "../../common/SuccessModal";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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

interface FormData {
  title: string;
  description: string;
  productionYear: string;
  price: string;
  currency: string;

  // Category
  categoryId: string;

  // Dorse Markası
  dorseBrand: string;

  // Kuruyük Kapaklı Özel Bilgiler
  dingilSayisi: string;
  uzunluk: string; // metre
  genislik: string; // metre
  kapakYuksekligi: string; // metre
  istiapHaddi: string; // ton
  krikoAyak: string;
  lastikDurumu: string; // yüzde
  takasli: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // İletişim Bilgileri
  sellerName: string;
  phone: string;
  email: string;
}

// Form seçenekleri
const PRODUCTION_YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

const TIRE_CONDITIONS = ["%90-100", "%75-89", "%50-74", "%25-49", "%0-24"];

// Kuruyük Kapaklı Dorse Markaları - MainLayout'tan alındı
const KURUYUK_KAPAKLI_BRANDS = [
  "Seçiniz",
  "Abd Treyler",
  "Acar Treyler",
  "Adakon Treyler",
  "Adem Usta Proohauss",
  "Adil Sert",
  "AGS Treyler",
  "Akar Cihat",
  "Akmanlar Damper",
  "AKY",
  "Akyel Treyler",
  "Alamen",
  "Aldor Treyler",
  "Alfa Treyler",
  "Alim Dorse",
  "Ali Rıza Usta",
  "Alka Group",
  "Alkan Treyler",
  "Alpaslan Treyler",
  "Alp-Kar",
  "Alpsan",
  "Altınel Dorse",
  "Altınışık",
  "Altınordu",
  "Andıç",
  "Arslan",
  "ART Trailer",
  "Asil Treyler",
  "Askan Treyler",
  "ASY Treyler",
  "Aybaba Dorse",
  "Aydeniz",
  "Aydeniz Dorse",
  "Aydın Treyler",
  "Baran Dorse",
  "Barış Dorse",
  "Berkefe Treyler",
  "Beyfem Dorse",
  "Beysan Treyler",
  "Bio Treyler",
  "Bozlar",
  "Can Damper Karoser",
  "Cangüller Treyler",
  "Cangül Treyler",
  "Can Treyler",
  "Carrier Trailer",
  "Caselli",
  "CastroMax Trailers",
  "Ceylan Treyler",
  "Ceytreyler",
  "CNC Dorse",
  "Coşkun",
  "Coşkunlar",
  "Çakır Dorse",
  "Çarşan",
  "Çavdaroğlu",
  "Çavuşoğlu Damper",
  "Çinler",
  "Çinler Treyler",
  "Çoşgun Dorse",
  "Çuhadar Treyler",
  "Dark Tech Treyler",
  "Dekor Damper",
  "Demircan Treyler",
  "Dentir Dorse",
  "Dere Dorse",
  "Dereli Hüseyin",
  "Doğan",
  "Doğuş Treyler",
  "Doruk Treyler",
  "Efe Treyler",
  "EFK Treyler",
  "Ekincİ",
  "Ekol Dorse",
  "Ekrem Treyler",
  "ELM Treysan Trailer",
  "EMK Treyler",
  "Erbaran Treyler",
  "Eren Dorse",
  "Erkan",
  "Erkonsan",
  "Erol İnce Treyler",
  "Esatech Trailer",
  "Eşmeliler",
  "Ferhat Dorse",
  "Fesan Makina",
  "Fors Treyler",
  "Fruehauf",
  "FSM",
  "Gani Şahan Treyler",
  "Global City",
  "Global City Treyler",
  "Gökhanlar",
  "Gökmenoğlu Karoser",
  "Groenewegen",
  "Gülistan",
  "Gümüş Damper",
  "Güneş",
  "Güneyşan Treyler Dorse",
  "Güreloğlu Dorse",
  "Güveneller",
  "Güven TIR",
  "Hacı Ceylan",
  "Han Trailer",
  "Hastrailer",
  "Hürsan",
  "Iskar Treyler",
  "İhsan Treyler",
  "İKA Treyler",
  "İkikardeş",
  "İkon Treyler",
  "İldis",
  "İNC Seçkinler",
  "İşkar Dorse",
  "Kalkan",
  "Kalkan Treyler",
  "Karalar Treyler",
  "Kartallar",
  "Kässbohrer",
  "KKT Trailer",
  "Koluman",
  "Kondekor",
  "Koneksan",
  "Konseymak Treyler",
  "Kontir Dorse",
  "Kontürkşan Dorse",
  "Konza",
  "Konza Trailer",
  "Kögel",
  "Krone",
  "Kuşçuoğlu",
  "Lider Dorse",
  "LTF Treyler",
  "M. Seymak Treyler",
  "Makinsan",
  "Marrka Treyler",
  "MAS Trailer",
  "MAS Treyler",
  "MaxTır Treyler",
  "MAZ",
  "MEC",
  "Mehmet Aydın Treyler",
  "Mehsan Treyler",
  "Meral",
  "Merve",
  "Meshaus Trailer",
  "Meshaus Treyler",
  "Metalsan Dorse",
  "Metsan Treyler",
  "Mobil Treyler",
  "MRC Treyler",
  "Muratsan Treyler",
  "Narin",
  "Nedex",
  "Neka",
  "NEV",
  "Nevkarsan",
  "Nevtirsan",
  "Nevzat Çelik",
  "Nurak Treyler",
  "Nursan Trailer",
  "Nükte Trailer",
  "Oktar Treyler",
  "Omeksan",
  "Optimak Treyler",
  "Ormanlı Treyler",
  "Orthaus Treyler",
  "Oruçlar",
  "Osmanlı",
  "OtoÇinler",
  "Otokar",
  "Otto Trailer",
  "Oymak Cargomaster",
  "Oymak Träger",
  "Ö.M.T.",
  "Öm-san",
  "Önder",
  "Özbay Damper",
  "Özçevik Treyler",
  "Özelsan",
  "Özenir",
  "Özenir Dorse",
  "Özgaranti",
  "Özgül Treyler",
  "Özmen Damper & Dorse",
  "Öztfn Treyler",
  "Öztreyler",
  "Öztürk Treyler",
  "Pacton",
  "Paşalar Mehmet Treyler",
  "Paşalar Treyler",
  "Paşaoğlu Dorse Treyler",
  "Payas",
  "Piroğlu Dorse",
  "Polat",
  "Polifton",
  "Poslu Trailer",
  "Poyraz",
  "Ram-Kar, Ram Treyler",
  "Reis",
  "Reis Treyler",
  "Roms",
  "Sağlam-İş Damper",
  "Sancak Treyler",
  "Sarılmaz",
  "Schmitz",
  "Schwarzmüller",
  "Scorpion Trailer",
  "SDS Sönmez Dorse",
  "Seçen",
  "Seçkinler",
  "Seçsan Treyler",
  "SEG",
  "Self Frigo",
  "Semitürk",
  "Sena Treyler",
  "Seren Treyler",
  "Serin Treyler",
  "Serpin Dorse",
  "Serra Treyler",
  "Sert Makina",
  "Serval Makine",
  "Set Treyler",
  "Sevinç Treyler",
  "Seyit Usta",
  "Sey-Mak Dorse",
  "Simboхx",
  "Simboхx Treyler",
  "Sim Treyler",
  "Sistem Damper Treyler",
  "Starboard",
  "Star Yağcılar",
  "Şahan Dorse",
  "Şahin",
  "Şahsan",
  "Şah Treyler",
  "Takdir Dorse",
  "Tanı Tır",
  "Taşkın",
  "Taşkır Dorse",
  "Tecnotır Dorse",
  "Tekbirsan",
  "Tirkon",
  "Tırsan",
  "Tırser",
  "Töngeloğlu",
  "Traco",
  "Transfer Treyler",
  "Treymak",
  "Tuğsan Treyler",
  "Tuncay İş",
  "Tursan",
  "Türmaksан",
  "Umut Damper",
  "Usta Treyler",
  "Valohr",
  "Warkas",
  "Wielton",
  "Yalçın",
  "Yalımsan Treyler",
  "Yasin Ateş",
  "Yavuz Treyler",
  "Yeksan",
  "Yelsan Treyler",
  "Yıldızlar Damper",
  "Yıldız Treyler",
  "Yiğitsan Treyler",
  "Zafer Treyler",
  "Zak-San Trailer",
  "Özel Üretim",
  "Diğer",
];

const KapakliForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    currency: "TRY",
    categoryId: "6", // Dorse category ID
    dorseBrand: "",
    dingilSayisi: "",
    uzunluk: "",
    genislik: "",
    kapakYuksekligi: "",
    istiapHaddi: "",
    krikoAyak: "hayır",
    lastikDurumu: "",
    takasli: "hayır",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    sellerName: "",
    phone: "",
    email: "",
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);

  // Photo preview states
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Şehirler yüklenirken hata:", error);
      }
    };
    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.cityId) {
        try {
          const response = await apiClient.get(
            `/cities/${formData.cityId}/districts`
          );
          setDistricts(response.data as District[]);
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [formData.cityId]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8)
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    if (digits.length <= 10)
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
        6,
        8
      )} ${digits.slice(8)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(
      6,
      8
    )} ${digits.slice(8, 10)}`;
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | File[] | File | null
  ) => {
    if (field === "phone" && typeof value === "string") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Dosyaları form data'ya ekle
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));

      // Preview'lar oluştur
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setPhotoPreviews((prev) => [...prev, base64String]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleShowcasePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, showcasePhoto: file }));

    // Preview oluştur
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setShowcasePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) newErrors.push("Başlık zorunludur");
    if (!formData.description.trim()) newErrors.push("Açıklama zorunludur");
    if (!formData.productionYear) newErrors.push("Üretim yılı zorunludur");
    if (!formData.price.trim()) newErrors.push("Fiyat zorunludur");
    if (!formData.dingilSayisi.trim())
      newErrors.push("Dingil sayısı zorunludur");
    if (!formData.uzunluk.trim()) newErrors.push("Uzunluk zorunludur");
    if (!formData.genislik.trim()) newErrors.push("Genişlik zorunludur");
    if (!formData.kapakYuksekligi.trim())
      newErrors.push("Kapak yüksekliği zorunludur");
    if (!formData.istiapHaddi.trim()) newErrors.push("İstiap haddi zorunludur");
    if (!formData.lastikDurumu) newErrors.push("Lastik durumu zorunludur");
    if (!formData.cityId) newErrors.push("Şehir zorunludur");
    if (!formData.districtId) newErrors.push("İlçe zorunludur");

    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const submitData = new FormData();

      // Category ID'yi ekle
      submitData.append("categoryId", formData.categoryId);

      // Dorse Markası
      if (formData.dorseBrand && formData.dorseBrand !== "Seçiniz") {
        submitData.append("dorseBrand", formData.dorseBrand);
        // Create slug from brand name
        const brandSlug = formData.dorseBrand
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        submitData.append("brandSlug", brandSlug);
      }

      // Kuruyük Kapaklı için model ve variant slug'larını ekle
      submitData.append("categorySlug", "dorse");
      submitData.append("modelSlug", "kuruyuk-kuruyuk");
      submitData.append("variantSlug", "kuruyuk-kuruyuk-kapakli");

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("year", formData.productionYear);
      submitData.append("price", formData.price);
      submitData.append("currency", formData.currency || "TRY");

      // Kapaklı özel bilgileri
      submitData.append("dingilSayisi", formData.dingilSayisi);
      submitData.append("uzunluk", formData.uzunluk);
      submitData.append("genislik", formData.genislik);
      submitData.append("kapakYuksekligi", formData.kapakYuksekligi);
      submitData.append("istiapHaddi", formData.istiapHaddi);
      submitData.append("krikoAyak", formData.krikoAyak);
      submitData.append("lastikDurumu", formData.lastikDurumu);
      submitData.append("takasli", formData.takasli);

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // İletişim (legacy format field names)
      submitData.append("seller_name", formData.sellerName);
      submitData.append("seller_phone", formData.phone);
      submitData.append("seller_email", formData.email);

      // Fotoğraflar
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/dorse", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("API Response:", response);

      // Response'u kontrol et
      const responseData: Record<string, unknown> =
        ((response.data as Record<string, unknown>)?.data as Record<
          string,
          unknown
        >) || (response.data as Record<string, unknown>);

      console.log("Response Data:", responseData);

      if (response.status === 200 || response.status === 201) {
        const adId = (responseData?.id || responseData?.adId || null) as
          | string
          | null;
        setCreatedAdId(adId);
        setShowSuccessModal(true);
      } else {
        throw new Error(
          (responseData?.message as string) || "İlan oluşturulamadı"
        );
      }
    } catch (error) {
      console.error("Form gönderilirken hata:", error);

      const err = error as Record<string, unknown>;
      const errResponse = err.response as Record<string, unknown>;

      // Eğer response varsa ve başarılıysa, hata olarak gösterme
      if (errResponse?.status === 200 || errResponse?.status === 201) {
        const responseData =
          (errResponse.data as Record<string, unknown>)?.data ||
          errResponse.data;
        const adId = ((responseData as Record<string, unknown>)?.id ||
          (responseData as Record<string, unknown>)?.adId ||
          null) as string | null;
        setCreatedAdId(adId);
        setShowSuccessModal(true);
      } else {
        const errData = errResponse?.data as Record<string, unknown>;
        setErrors([
          (errData?.message as string) ||
            (err.message as string) ||
            "İlan gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        ]);
      }
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

  return (
    <Box>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Kapaklı Kuruyük İlanı Ver
          </Typography>

          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Temel Bilgiler */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Temel Bilgiler
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Üretim Yılı</InputLabel>
                <Select
                  value={formData.productionYear}
                  onChange={(e) =>
                    handleInputChange("productionYear", e.target.value)
                  }
                  label="Üretim Yılı"
                  required
                >
                  {PRODUCTION_YEARS.map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Fiyat"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                margin="normal"
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

            {/* Dorse Markası Seçimi */}
            <FormControl fullWidth required>
              <InputLabel>Dorse Markası</InputLabel>
              <Select
                value={formData.dorseBrand}
                onChange={(e) =>
                  setFormData({ ...formData, dorseBrand: e.target.value })
                }
                label="Dorse Markası"
              >
                {KURUYUK_KAPAKLI_BRANDS.map((brand, index) => (
                  <MenuItem key={index} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Kapaklı Özel Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Kapaklı Kuruyük Bilgileri
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Dingil Sayısı"
                value={formData.dingilSayisi}
                onChange={(e) =>
                  handleInputChange("dingilSayisi", e.target.value)
                }
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Uzunluk (m)"
                value={formData.uzunluk}
                onChange={(e) => handleInputChange("uzunluk", e.target.value)}
                margin="normal"
                required
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Genişlik (m)"
                value={formData.genislik}
                onChange={(e) => handleInputChange("genislik", e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Kapak Yüksekliği (m)"
                value={formData.kapakYuksekligi}
                onChange={(e) =>
                  handleInputChange("kapakYuksekligi", e.target.value)
                }
                margin="normal"
                required
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="İstiap Haddi (ton)"
                value={formData.istiapHaddi}
                onChange={(e) =>
                  handleInputChange("istiapHaddi", e.target.value)
                }
                margin="normal"
                required
              />

              <FormControl fullWidth>
                <InputLabel>Lastik Durumu</InputLabel>
                <Select
                  value={formData.lastikDurumu}
                  onChange={(e) =>
                    handleInputChange("lastikDurumu", e.target.value)
                  }
                  label="Lastik Durumu"
                  required
                >
                  {TIRE_CONDITIONS.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Kriko Ayak</InputLabel>
                <Select
                  value={formData.krikoAyak}
                  onChange={(e) =>
                    handleInputChange("krikoAyak", e.target.value)
                  }
                  label="Kriko Ayak"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Takaslı</InputLabel>
                <Select
                  value={formData.takasli}
                  onChange={(e) => handleInputChange("takasli", e.target.value)}
                  label="Takaslı"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Konum Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Konum Bilgileri
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleInputChange("cityId", e.target.value)}
                  label="Şehir"
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    handleInputChange("districtId", e.target.value)
                  }
                  label="İlçe"
                  required
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
                mb: 3,
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
                    <PhotoCameraIcon sx={{ color: "white", fontSize: 28 }} />
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
                  <Paper
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
                    component="label"
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
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleShowcasePhotoUpload}
                    />
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
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
                  </Paper>

                  {/* Diğer Fotoğraflar */}
                  <Paper
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
                    component="label"
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
                    <VisuallyHiddenInput
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                      disabled={formData.photos.length >= 15}
                    >
                      Fotoğraf Ekle ({formData.photos.length}/15)
                    </Button>

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
                                <Typography variant="caption">
                                  {index + 1}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : "İlanı Yayınla"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Success Modal */}
        <SuccessModal
          open={showSuccessModal}
          onClose={handleSuccessModalClose}
          onGoHome={handleGoHome}
          onViewAd={handleViewAd}
          onMyAds={handleMyAds}
          title="🎉 İlan Başarıyla Yayınlandı!"
          message="Kapaklı Kuruyük ilanınız başarıyla yayınlandı. Artık alıcılar tarafından görülebilir ve iletişime geçebilirler."
        />
      </Container>
    </Box>
  );
};

export default KapakliForm;
