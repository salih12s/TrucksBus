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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Checkbox,
  FormGroup,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { CheckCircle, PhotoCamera, Close } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
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

// Brand interfaces removed - using constants instead

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

  // Havuzlu Özel Bilgileri
  havuzDerinligi: string;
  havuzGenisligi: string;
  havuzUzunlugu: string;
  lastikDurumu: string;
  istiapHaddi: string;
  uzatilabilirProfil: string;
  dingilSayisi: string;

  // Rampa Mekanizması
  rampaMekanizmasi: string[];

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // Ekstra
  warranty: string;
  negotiable: string;
  exchange: string;

  detailedInfo: string;
}

// Lastik Durumu Seçenekleri
const TIRE_CONDITIONS = ["%90-100", "%75-89", "%50-74", "%25-49", "%0-24"];

// Rampa Mekanizması Seçenekleri
const RAMPA_MEKANIZMASI = ["Hidrolik", "Pnömatik", "Manuel"];

const HavuzluForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Havuzlu Dorse Markaları - MainLayout'tan alındı
  const HAVUZLU_BRANDS = [
    "Seçiniz",
    "Acl Semitreyler",
    "Adem Usta Proohauss",
    "Afa Treyler",
    "AGS Treyler",
    "Akar Cihat",
    "Akar Treyiler",
    "Akmanlar Damper",
    "Akyel Treyler",
    "Alamen",
    "Alim",
    "Alim Dorse",
    "Alp-Kar",
    "Alpsan",
    "Altınel",
    "Altınordu Treyler",
    "Arca Treyler",
    "ART Trailer",
    "Askan Treyler",
    "ASY Treyler",
    "Ataşehir Treyler",
    "Aydeniz Dorse",
    "Balıkesir Maksan",
    "Balıkesir Maksan Lowbed",
    "Barış Dorse",
    "Başkent Dorse",
    "Bayrak Treyler",
    "Belgeman",
    "Bersan Dorse",
    "Beyfem Dorse",
    "Bilsan Makina",
    "Bio Treyler",
    "Bodur Treyler",
    "Borankay",
    "Breg Treyler",
    "Budakoğlu",
    "Bulten Dorse",
    "Burak Treyler",
    "Can Damper Karoser",
    "Cangüller Treyler",
    "Carrier Trailer",
    "Caselli",
    "CastroMax Trailers",
    "Ceylan Treyler",
    "CMK",
    "Coşkun",
    "Çavdaroğlu",
    "Çavuşoğlu",
    "Çetin Sac",
    "Çuhadar",
    "Desan Treyler",
    "Doğan Makina",
    "Dorsan",
    "Dorsan Dorse",
    "Doruk Treyler",
    "EFK Treyler",
    "Ekol Dorse",
    "ELM Treysan Trailer",
    "Emirsan Trailer",
    "EMK Treyler",
    "Emre Treyler",
    "Erc Treyler",
    "Ertuğ",
    "Esatech Trailer",
    "Faymonville",
    "Ferhat Dorse",
    "Fesan",
    "Fors Treyler",
    "Fruehauf",
    "FSM",
    "Global City",
    "Global City Treyler",
    "Gözde Treyler",
    "Gülistan",
    "Güneyşan Treyler Dorse",
    "Gürler",
    "Gürleşen Yıl Treyler",
    "Gvn Trailer",
    "Hacı Ceylan Treyler",
    "Hafızoğlu",
    "Hamza Celik Dorse",
    "HMS",
    "Hürsan Treyler",
    "Irmak Dorse",
    "Iskar Treyler",
    "Iveco",
    "İhsan Treyler",
    "İkon Treyler",
    "İKT Treyler",
    "İNC Seçkinler",
    "İzmir Dorse",
    "Kalkan Treyler",
    "Karalar Treyler",
    "Karaman Dorse",
    "Karayayla Dorse",
    "Kassbohrer",
    "Kitrsan Treyler",
    "KKT Trailer",
    "Komodo",
    "Konza Trailer",
    "Kögel Trailer",
    "Kumru Dorse",
    "Kurtsan Treyler",
    "Logitrailers",
    "M. Seymak Treyler",
    "Makinsan",
    "Maksan Lowbed",
    "Mandalsan Dorse",
    "Marmara Dorse",
    "Marrka Treyler",
    "MAS Trailer",
    "Maxtır Trailer",
    "Mehsan Treyler",
    "Meksan Dorse",
    "Mersan Dorse",
    "Mert Treyler",
    "Meshaus Treyler",
    "Metinler Dorse",
    "Metsan",
    "Meydan Dorse",
    "Mobil Treyler",
    "MRC Treyler",
    "MS Muratsan Treyler",
    "Muratsan Treyler",
    "Murspeed",
    "Musabeyli Tırsan",
    "My Trailer",
    "Nedex",
    "Nehir Dorse",
    "Neka",
    "NKT Trailer",
    "Nursan",
    "Nükte Trailer",
    "Oktar Treyler",
    "Optimak Treyler",
    "Ormanlı Treyler",
    "OtoÇinler",
    "Oymak Cargomaster",
    "Oymak Träger",
    "Önder",
    "Özçevik Dorse",
    "Özdemirsan",
    "Özdersan Dorse",
    "Özelsan Treyler",
    "Özen İş Dorse",
    "Özgül Treyler",
    "Özkan Treyler",
    "Özmaksan",
    "Özsan",
    "Öztfn Treyler",
    "Öztürk Treyler",
    "Özünlü",
    "Palmiye Treyler",
    "Pars Treyler",
    "Paşalar Mehmet Treyler",
    "Paşalar Treyler",
    "Paşaoğlu Dorse Treyler",
    "Prohauass",
    "Ram-Kar",
    "Ram Treyler",
    "Reis Treyler",
    "Safa Dorse",
    "Sancak Treyler",
    "Schmitz",
    "Scorpion Trailer",
    "Seçsan Treyler",
    "Selim Dorse",
    "Self Frigo",
    "Semitürk",
    "Sena Treyler",
    "Serhat Dorse",
    "Serin Treyler",
    "Serra Treyler",
    "Set Treyler",
    "Seyit Usta",
    "SimbOxx",
    "Sim Treyler",
    "Sistem Damper Treyler",
    "SMH",
    "Star Yağcılar",
    "Şahin Damper",
    "Şahsan",
    "Takdir Dorse",
    "Tanı Tır",
    "Tırkon Treyler",
    "Tırsan",
    "Töke Makina",
    "Traco",
    "Transfer Treyler",
    "Tuncay İş Dorse",
    "Warkas",
    "Wielton",
    "Yalçın Dorse",
    "Yalımsan Treyler",
    "Yelsan Treyler",
    "Yeşil Yol Treyler",
    "Yıldızlar Damper",
    "Yılmaz",
    "Yüksel Dorse",
    "Zak-San Trailer",
    "Özel Üretim",
    "Diğer",
  ];

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    currency: "TRY",
    categoryId: "6", // Dorse category ID
    dorseBrand: "",
    havuzDerinligi: "",
    havuzGenisligi: "",
    havuzUzunlugu: "",
    lastikDurumu: "",
    istiapHaddi: "",
    uzatilabilirProfil: "",
    dingilSayisi: "",
    rampaMekanizmasi: [],
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    warranty: "",
    negotiable: "",
    exchange: "",
    detailedInfo: "",
  });

  // Brands are now loaded from constants - no need for API call

  // No need for brand/model/variant loading from API - using constants

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
  const fetchDistricts = async (cityId: string) => {
    if (!cityId) return;
    try {
      const response = await apiClient.get(`/ads/cities/${cityId}/districts`);
      setDistricts(response.data as District[]);
    } catch (error) {
      console.error("İlçeler yüklenirken hata:", error);
    }
  };

  // Şehir değişikliği
  const handleCityChange = (cityId: string) => {
    setFormData({ ...formData, cityId, districtId: "" });
    setDistricts([]);
    fetchDistricts(cityId);
  };

  // Fiyat formatlama fonksiyonları
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

  // Rampa mekanizması seçimi
  const handleRampaChange = (value: string) => {
    const currentValues = formData.rampaMekanizmasi;
    if (currentValues.includes(value)) {
      setFormData({
        ...formData,
        rampaMekanizmasi: currentValues.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        rampaMekanizmasi: [...currentValues, value],
      });
    }
  };

  // Fotoğraf upload
  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase = false,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    // File size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Fotoğraf boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;

      if (isShowcase) {
        setFormData((prev) => ({ ...prev, showcasePhoto: file }));
        setShowcasePreview(preview);
      } else {
        if (formData.photos.length >= 15) {
          alert("En fazla 15 fotoğraf yükleyebilirsiniz");
          return;
        }
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, file] }));
        setPhotoPreviews((prev) => [...prev, preview]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fotoğraf silme
  const removePhoto = (index: number, isShowcase = false) => {
    if (isShowcase) {
      setFormData((prev) => ({ ...prev, showcasePhoto: null }));
      setShowcasePreview(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index),
      }));
      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Form gönderimi
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);

      // Fiyatı parse ederek ekle
      const parsedPrice = parseFormattedNumber(formData.price);
      if (parsedPrice) {
        submitData.append("price", parsedPrice);
        submitData.append("currency", formData.currency || "TRY");
      }

      // Category/Brand/Model/Variant ID'lerini ekle
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

      // URL params'tan gelen slug'ları da ekle
      if (categorySlug) submitData.append("categorySlug", categorySlug);

      // Lowbed için model ve variant slug'larını ekle
      submitData.append("modelSlug", "lowbed-lowbed");
      submitData.append("variantSlug", "lowbed-lowbed-havuzlu");

      // Year field'ı ekle
      submitData.append("year", formData.productionYear);

      console.log("✅ Dorse Category/Brand Info:", {
        categoryId: formData.categoryId,
        dorseBrand: formData.dorseBrand,
      });

      // Havuzlu özel bilgileri
      submitData.append("havuzDerinligi", formData.havuzDerinligi);
      submitData.append("havuzGenisligi", formData.havuzGenisligi);
      submitData.append("havuzUzunlugu", formData.havuzUzunlugu);
      submitData.append("lastikDurumu", formData.lastikDurumu);
      submitData.append("istiapHaddi", formData.istiapHaddi);
      submitData.append("uzatilabilirProfil", formData.uzatilabilirProfil);
      submitData.append("dingilSayisi", formData.dingilSayisi);

      // Rampa mekanizması
      submitData.append(
        "rampaMekanizmasi",
        JSON.stringify(formData.rampaMekanizmasi),
      );

      // Konum
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Ekstra
      submitData.append("warranty", formData.warranty);
      submitData.append("negotiable", formData.negotiable);
      submitData.append("exchange", formData.exchange);

      // Detaylı bilgiyi teknik özelliklerle birleştir
      let detailedDescription = formData.detailedInfo;

      // Teknik özellikler eklentisi
      const technicalSpecs = [];
      if (formData.havuzDerinligi)
        technicalSpecs.push(`Havuz Derinliği: ${formData.havuzDerinligi}m`);
      if (formData.havuzGenisligi)
        technicalSpecs.push(`Havuz Genişliği: ${formData.havuzGenisligi}m`);
      if (formData.havuzUzunlugu)
        technicalSpecs.push(`Havuz Uzunluğu: ${formData.havuzUzunlugu}m`);
      if (formData.lastikDurumu)
        technicalSpecs.push(`Lastik Durumu: ${formData.lastikDurumu}`);
      if (formData.dingilSayisi)
        technicalSpecs.push(`Dingil Sayısı: ${formData.dingilSayisi}`);
      if (formData.rampaMekanizmasi.length > 0)
        technicalSpecs.push(
          `Rampa Mekanizması: ${formData.rampaMekanizmasi.join(", ")}`,
        );

      if (technicalSpecs.length > 0) {
        const techSpecsText =
          "\n\n--- Teknik Özellikler ---\n" + technicalSpecs.join("\n");
        detailedDescription = detailedDescription
          ? detailedDescription + techSpecsText
          : techSpecsText;
      }

      submitData.append("detailedInfo", detailedDescription);

      // Fotoğrafları ekle
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

      console.log("İlan başarıyla oluşturuldu:", response.data);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("İlan oluşturulurken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Başarı dialogu
  const handleSuccessClose = () => {
    setSubmitSuccess(false);
    navigate("/"); // Anasayfaya yönlendir
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Temel Bilgiler
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Açıklama"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Üretim Yılı"
                value={formData.productionYear}
                onChange={(e) =>
                  setFormData({ ...formData, productionYear: e.target.value })
                }
                required
                sx={{ flex: 1 }}
              />

              <TextField
                label="Fiyat"
                value={formatNumber(formData.price)}
                onChange={(e) => {
                  const rawValue = parseFormattedNumber(e.target.value);
                  setFormData({ ...formData, price: rawValue });
                }}
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
                        <ToggleButton value="TRY">₺ TL</ToggleButton>
                        <ToggleButton value="USD">$ USD</ToggleButton>
                        <ToggleButton value="EUR">€ EUR</ToggleButton>
                      </ToggleButtonGroup>
                    </InputAdornment>
                  ),
                }}
                placeholder="Örn: 250.000"
                required
                sx={{ flex: 1 }}
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
                {HAVUZLU_BRANDS.map((brand, index) => (
                  <MenuItem key={index} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Teknik Özellikler
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                type="text"
                label="Havuz Genişliği (m)"
                value={formData.havuzGenisligi}
                onChange={(e) =>
                  setFormData({ ...formData, havuzGenisligi: e.target.value })
                }
                placeholder="Örn: 2.45"
                sx={{ flex: 1 }}
              />

              <TextField
                type="text"
                label="Havuz Uzunluğu (m)"
                value={formData.havuzUzunlugu}
                onChange={(e) =>
                  setFormData({ ...formData, havuzUzunlugu: e.target.value })
                }
                placeholder="Örn: 13.60"
                sx={{ flex: 1 }}
              />

              <TextField
                type="text"
                label="Havuz Derinliği (m)"
                value={formData.havuzDerinligi}
                onChange={(e) =>
                  setFormData({ ...formData, havuzDerinligi: e.target.value })
                }
                placeholder="Örn: 1.80"
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="İstiap Haddi"
                value={formData.istiapHaddi}
                onChange={(e) =>
                  setFormData({ ...formData, istiapHaddi: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ton</InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />

              <TextField
                label="Dingil Sayısı"
                value={formData.dingilSayisi}
                onChange={(e) =>
                  setFormData({ ...formData, dingilSayisi: e.target.value })
                }
                sx={{ flex: 1 }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Lastik Durumu</InputLabel>
              <Select
                value={formData.lastikDurumu}
                onChange={(e) =>
                  setFormData({ ...formData, lastikDurumu: e.target.value })
                }
                label="Lastik Durumu"
              >
                {TIRE_CONDITIONS.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">Uzatılabilir Profil</FormLabel>
              <RadioGroup
                row
                value={formData.uzatilabilirProfil}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    uzatilabilirProfil: e.target.value,
                  })
                }
              >
                <FormControlLabel value="Var" control={<Radio />} label="Var" />
                <FormControlLabel value="Yok" control={<Radio />} label="Yok" />
              </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
              <FormLabel component="legend">
                Rampa Mekanizması (Seçim yapılmadı)
              </FormLabel>
              <FormGroup row>
                {RAMPA_MEKANIZMASI.map((rampa) => (
                  <FormControlLabel
                    key={rampa}
                    control={
                      <Checkbox
                        checked={formData.rampaMekanizmasi.includes(rampa)}
                        onChange={() => handleRampaChange(rampa)}
                        name={rampa}
                      />
                    }
                    label={rampa}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Konum Bilgileri
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Şehir</InputLabel>
              <Select
                value={formData.cityId}
                onChange={(e) => handleCityChange(e.target.value)}
                label="Şehir"
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id.toString()}>
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
                  setFormData({ ...formData, districtId: e.target.value })
                }
                label="İlçe"
              >
                {districts.map((district) => (
                  <MenuItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Fotoğraflar
          </Typography>
          <Divider sx={{ mb: 2 }} />

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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                    onClick={() => removePhoto(0, true)}
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Aracınızın farklı açılardan fotoğraflarını ekleyin (Maksimum 15
                adet)
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                {photoPreviews.map((preview, index) => (
                  <Card
                    key={index}
                    sx={{ position: "relative", width: 120, height: 120 }}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={preview}
                      alt={`Fotoğraf ${index + 1}`}
                      sx={{ objectFit: "cover" }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "white",
                        width: 24,
                        height: 24,
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                      }}
                      onClick={() => removePhoto(index)}
                    >
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Card>
                ))}
              </Box>

              {formData.photos.length < 15 && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{
                    border: "2px dashed #4caf50",
                    color: "#4caf50",
                    "&:hover": {
                      border: "2px dashed #388e3c",
                      color: "#388e3c",
                    },
                  }}
                >
                  Fotoğraf Ekle
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handlePhotoUpload(e, false)}
                  />
                </Button>
              )}
            </CardContent>
          </Card>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Ek Seçenekler
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Takas Yapılır</FormLabel>
              <RadioGroup
                row
                value={formData.exchange}
                onChange={(e) =>
                  setFormData({ ...formData, exchange: e.target.value })
                }
              >
                <FormControlLabel
                  value="Evet"
                  control={<Radio />}
                  label="Evet"
                />
                <FormControlLabel
                  value="Hayır"
                  control={<Radio />}
                  label="Hayır"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Paper>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            İptal
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Yayınlanıyor..." : "İlanı Yayınla"}
          </Button>
        </Box>
      </Container>

      {/* Başarı Dialogu */}
      <Dialog open={submitSuccess} onClose={handleSuccessClose}>
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
            onClick={handleSuccessClose}
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
    </Box>
  );
};

export default HavuzluForm;
