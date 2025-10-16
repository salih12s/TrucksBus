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
  CardMedia,
  IconButton,
  Checkbox,
  FormGroup,
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

  // Category
  categoryId: string;

  // Dorse Markası
  dorseBrand: string;

  // Öndekirmalı Özel Bilgileri
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

const OndekirmalıForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Önden Kırmalı Dorse Markaları - MainLayout'tan alındı
  const ONDEKIRMA_BRANDS = [
    "Seçiniz",
    "Abd Treyler",
    "Adem Usta Proohauss",
    "AGS Treyler",
    "Akar Cihat",
    "Akmanlar Damper",
    "Akyel Treyler",
    "Alamen",
    "Alim Dorse",
    "ALM Damper",
    "Alp-Kar",
    "Alpsan",
    "Altınel Dorse",
    "Altınordu",
    "ART Trailer",
    "Askan Treyler",
    "ASY Treyler",
    "Aydeniz Dorse",
    "Başkent Dorse",
    "Beyfem Dorse",
    "Bio Treyler",
    "Can Damper Karoser",
    "Cangüller Treyler",
    "Carrier Trailer",
    "Caselli",
    "CastroMax Trailers",
    "Çavdaroğlu",
    "Çavuşoğlu",
    "Çuhadar Treyler",
    "Doruk Treyler",
    "EFK Treyler",
    "ELM Treysan Trailer",
    "Emirsan Treyler",
    "EMK Treyler",
    "Esatech Trailer",
    "Fors Treyler",
    "Fruehauf",
    "Global City",
    "Global City Treyler",
    "Gülistan",
    "Gürleşen Yıl Treyler",
    "Hürsan Treyler",
    "Iskar Treyler",
    "İkon Treyler",
    "İNC Seçkinler",
    "Kalkan Treyler",
    "Karalar Treyler",
    "KKT Trailer",
    "Komodo",
    "Konza Trailer",
    "Kögel Trailer",
    "M. Seymak Treyler",
    "Makinsan",
    "Marrka Treyler",
    "MAS Trailer",
    "Maxtır Trailer",
    "Mehsan Treyler",
    "Meshaus Treyler",
    "Metsan Treyler",
    "Mobil Treyler",
    "MRC Treyler",
    "MS Muratsan Treyler",
    "Narin Dorse",
    "Nedex",
    "Nükte Trailer",
    "Oktar Treyler",
    "Optimak Treyler",
    "Ormanlı Treyler",
    "OtoÇinler",
    "Oymak Cargomaster",
    "Oymak Träger",
    "Özdemirsan Treyler",
    "Özelsan Treyler",
    "Özgül Treyler",
    "Özsan Treyler",
    "Öztfn Treyler",
    "Öztürk Treyler",
    "Paşalar Mehmet Treyler",
    "Paşalar Treyler",
    "Paşaoğlu Dorse Treyler",
    "Ram-Kar",
    "Ram Treyler",
    "Reis Treyler",
    "Sancak Treyler",
    "Self Frigo",
    "Semitürk",
    "Sena Treyler",
    "Serra Treyler",
    "Serin Treyler",
    "Set Treyler",
    "Seyit Usta",
    "SimbOxx",
    "Sim Treyler",
    "Sistem Damper Treyler",
    "Star Yağcılar",
    "Şahin Damper",
    "Takdir Dorse",
    "Tanı Tır",
    "Tırsan",
    "Töke Makina",
    "Traco",
    "Transfer Treyler",
    "Tuğ-San",
    "Warkas",
    "Wielton",
    "Yalçın Dorse",
    "Yalımsan Treyler",
    "Yelsan Treyler",
    "Yıldızlar Damper",
    "Yol Bak",
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

  // Rampa mekanizması değişikliği
  const handleRampaMekanizmasiChange = (value: string) => {
    const current = formData.rampaMekanizmasi;
    if (current.includes(value)) {
      setFormData({
        ...formData,
        rampaMekanizmasi: current.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        rampaMekanizmasi: [...current, value],
      });
    }
  };

  // Fotoğraf upload
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
        }
      }
    }
  };

  // Fotoğraf silme
  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
    setPhotoPreviews(newPreviews);
  };

  // Vitrin fotoğrafı silme
  const removeShowcasePhoto = () => {
    setFormData({ ...formData, showcasePhoto: null });
    setShowcasePreview(null);
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
      }

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

      // URL params'tan gelen slug'ları da ekle
      if (categorySlug) submitData.append("categorySlug", categorySlug);

      // Lowbed Önden Kırmalı için model ve variant slug'larını ekle
      submitData.append("modelSlug", "lowbed-lowbed");
      submitData.append("variantSlug", "lowbed-lowbed-ondekirma");

      // Year field'ı ekle
      submitData.append("year", formData.productionYear);

      console.log("✅ Dorse Category/Brand Info:", {
        categoryId: formData.categoryId,
        dorseBrand: formData.dorseBrand,
      });

      // Öndekirmalı özel bilgileri
      submitData.append("havuzDerinligi", formData.havuzDerinligi);
      submitData.append("havuzGenisligi", formData.havuzGenisligi);
      submitData.append("havuzUzunlugu", formData.havuzUzunlugu);
      submitData.append("lastikDurumu", formData.lastikDurumu);
      submitData.append("istiapHaddi", formData.istiapHaddi);
      submitData.append("uzatilabilirProfil", formData.uzatilabilirProfil);
      submitData.append("dingilSayisi", formData.dingilSayisi);

      // Rampa mekanizması
      if (formData.rampaMekanizmasi.length > 0) {
        submitData.append(
          "rampaMekanizmasi",
          JSON.stringify(formData.rampaMekanizmasi)
        );
      }

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
      if (formData.istiapHaddi)
        technicalSpecs.push(`İstiap Haddi: ${formData.istiapHaddi} ton`);
      if (formData.dingilSayisi)
        technicalSpecs.push(`Dingil Sayısı: ${formData.dingilSayisi}`);
      if (formData.lastikDurumu)
        technicalSpecs.push(`Lastik Durumu: ${formData.lastikDurumu}`);
      if (formData.uzatilabilirProfil)
        technicalSpecs.push(
          `Uzatılabilir Profil: ${formData.uzatilabilirProfil}`
        );
      if (formData.rampaMekanizmasi.length > 0)
        technicalSpecs.push(
          `Rampa Mekanizması: ${formData.rampaMekanizmasi.join(", ")}`
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
      formData.photos.forEach((photo) => {
        submitData.append("photos", photo);
      });

      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

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
                    <InputAdornment position="end">TL</InputAdornment>
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
                {ONDEKIRMA_BRANDS.map((brand, index) => (
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
                label="Havuz Derinliği (m)"
                value={formData.havuzDerinligi}
                onChange={(e) =>
                  setFormData({ ...formData, havuzDerinligi: e.target.value })
                }
                placeholder="Örn: 1.80"
                sx={{ flex: 1 }}
              />

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

            {/* Rampa Mekanizması */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Rampa Mekanizması</FormLabel>
              <FormGroup row>
                {RAMPA_MEKANIZMASI.map((mekanizma) => (
                  <FormControlLabel
                    key={mekanizma}
                    control={
                      <Checkbox
                        checked={formData.rampaMekanizmasi.includes(mekanizma)}
                        onChange={() => handleRampaMekanizmasiChange(mekanizma)}
                      />
                    }
                    label={mekanizma}
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

        {/* Fotoğraf Yükleme */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Fotoğraflar
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Vitrin Fotoğrafı */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Vitrin Fotoğrafı (Ana fotoğraf)
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={!!formData.showcasePhoto}
              >
                Vitrin Fotoğrafı Seç
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, true)}
                />
              </Button>
              {showcasePreview && (
                <Card sx={{ width: 120, height: 80, position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="80"
                    image={showcasePreview}
                    alt="Vitrin"
                    sx={{ objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                    }}
                  >
                    <IconButton size="small" onClick={removeShowcasePhoto}>
                      <Close sx={{ color: "white", fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Card>
              )}
            </Box>
          </Box>

          {/* Diğer Fotoğraflar */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Diğer Fotoğraflar ({formData.photos.length}/15)
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={formData.photos.length >= 15}
              >
                Fotoğraf Ekle
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                En fazla 15 fotoğraf yükleyebilirsiniz
              </Typography>
            </Box>

            {/* Fotoğraf Önizlemeleri */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {photoPreviews.map((preview, index) => (
                <Card
                  key={index}
                  sx={{ width: 120, height: 80, position: "relative" }}
                >
                  <CardMedia
                    component="img"
                    height="80"
                    image={preview}
                    alt={`Fotoğraf ${index + 1}`}
                    sx={{ objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                    }}
                  >
                    <IconButton size="small" onClick={() => removePhoto(index)}>
                      <Close sx={{ color: "white", fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
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

export default OndekirmalıForm;
