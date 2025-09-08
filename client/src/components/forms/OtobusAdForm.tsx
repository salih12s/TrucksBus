import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Slider,
} from "@mui/material";
import {
  CheckCircle,
  PhotoCamera,
  EditNote,
  DirectionsBus,
  Settings,
  LocationOn,
  Description,
} from "@mui/icons-material";
import apiClient from "../../api/client";
import Header from "../layout/Header";

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

// Renk seçenekleri (genişletilmiş)
const colorOptions = [
  "Amarant",
  "Bal Rengi",
  "Bej",
  "Beyaz",
  "Bordo",
  "Füme",
  "Gri",
  "Gümüş Gri",
  "Ihlamur",
  "Kahverengi",
  "Kırmızı",
  "Kiremit",
  "Krem",
  "Kum Rengi",
  "Lacivert",
  "Mavi",
  "Mor",
  "Pembe",
  "Sarı",
  "Siyah",
  "Somon",
  "Şampanya",
  "Tarçın",
  "Turkuaz",
  "Turuncu",
  "Yakut",
  "Yeşil",
  "Zeytin Gri",
];

// Koltuk düzeni seçenekleri
const seatLayoutOptions = ["2+1", "2+2"];

// Koltuk arkası ekran seçenekleri
const screenOptions = ["Yok", "7", "9", "10"];

// Araç durumu seçenekleri
const conditionOptions = ["Sıfır", "Sıfır Ayarında", "İkinci El", "Hasarlı"];

// Yakıt tipi seçenekleri
const fuelTypeOptions = ["Dizel", "Benzin", "LPG", "Elektrik", "Hibrit"];

// Vites tipi seçenekleri
const transmissionOptions = ["Manuel", "Otomatik"];

interface FormData {
  title: string;
  description: string;
  year: string;
  price: string;
  mileage: string;
  condition: string;
  drivetrain: string;
  color: string;
  passengerCapacity: string;
  seatLayout: string;
  seatBackScreen: string;
  gearType: string;
  gearCount: string;
  tireCondition: number;
  fuelCapacity: string;
  transmission: string;
  fuelType: string;
  exchange: string;
  damageRecord: string;
  paintChange: string;
  plateType: string;
  plateNumber: string;
  cityId: string;
  districtId: string;
  detailedInfo: string;
  photos: File[];
  showcasePhoto: File | null;
  // Detay özellikleri
  detailFeatures: {
    threeG?: boolean;
    abs?: boolean;
    aracTelefonu?: boolean;
    asr?: boolean;
    buzdolabi?: boolean;
    isitmalSurucuCami?: boolean;
    kisiselSesSistemi?: boolean;
    klima?: boolean;
    mutfak?: boolean;
    retarder?: boolean;
    surucuKabini?: boolean;
    televizyon?: boolean;
    tuvalet?: boolean;
    uydu?: boolean;
    wifi?: boolean;
  };
}

const OtobusAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showcasePreview, setShowcasePreview] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    year: "",
    price: "",
    mileage: "",
    condition: "ikinci-el",
    drivetrain: "",
    color: "",
    passengerCapacity: "",
    seatLayout: "2+1",
    seatBackScreen: "Yok",
    gearType: "",
    gearCount: "",
    tireCondition: 85,
    fuelCapacity: "",
    transmission: "manuel",
    fuelType: "dizel",
    exchange: "hayir",
    damageRecord: "hayir",
    paintChange: "hayir",
    plateType: "tr-plakali",
    plateNumber: "",
    cityId: "",
    districtId: "",
    detailedInfo: "",
    photos: [],
    showcasePhoto: null,
    detailFeatures: {
      threeG: false,
      abs: false,
      aracTelefonu: false,
      asr: false,
      buzdolabi: false,
      isitmalSurucuCami: false,
      kisiselSesSistemi: false,
      klima: false,
      mutfak: false,
      retarder: false,
      surucuKabini: false,
      televizyon: false,
      tuvalet: false,
      uydu: false,
      wifi: false,
    },
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
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.cityId]);

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

  const handleInputChange = (field: keyof FormData, value: string | number) => {
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
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle (price ve mileage'ı parse ederek)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "showcasePhoto" &&
          key !== "detailFeatures" &&
          value !== null &&
          value !== undefined
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

      // Kategori bilgilerini ekle
      submitData.append("categorySlug", categorySlug || "");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");

      // Detay özelliklerini JSON olarak ekle (backend "features" bekliyor)
      submitData.append("features", JSON.stringify(formData.detailFeatures));

      // Diğer özel alanları ekle
      submitData.append("seatBackScreen", formData.seatBackScreen);
      submitData.append("tireCondition", formData.tireCondition.toString());
      submitData.append("fuelCapacity", formData.fuelCapacity);
      submitData.append("exchange", formData.exchange);
      submitData.append("damageRecord", formData.damageRecord);
      submitData.append("paintChange", formData.paintChange);

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/otobus", submitData, {
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
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 4,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "100vh",
          pt: 4,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            🚌 Otobüs İlanı Ver
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Otobüsünüzün detaylarını girerek profesyonel ilanınızı oluşturun
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
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
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
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
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
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
                    "&:hover fieldset": { borderColor: "primary.main" },
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
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Araç Detayları Kartı */}
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
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    borderRadius: "50%",
                    p: 1.5,
                    mr: 2,
                  }}
                >
                  <DirectionsBus sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Araç Detayları
                </Typography>
              </Box>

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
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("price", rawValue);
                  }}
                  required
                  variant="outlined"
                  placeholder="Örn: 850.000"
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
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("mileage", rawValue);
                  }}
                  required
                  variant="outlined"
                  placeholder="Örn: 425.000"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover fieldset": { borderColor: "primary.main" },
                    },
                  }}
                />
              </Box>

              {/* Durum ve Yolcu Kapasitesi */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 3,
                  mb: 3,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Araç Durumu</InputLabel>
                  <Select
                    value={formData.condition}
                    onChange={(e) =>
                      handleInputChange("condition", e.target.value)
                    }
                    sx={{
                      borderRadius: 3,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {conditionOptions.map((option) => (
                      <MenuItem
                        key={option}
                        value={option.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Yolcu Kapasitesi"
                  type="number"
                  value={formData.passengerCapacity}
                  onChange={(e) =>
                    handleInputChange("passengerCapacity", e.target.value)
                  }
                  required
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover fieldset": { borderColor: "primary.main" },
                    },
                  }}
                />
              </Box>

              {/* Renk Seçimi */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: "#1976d2",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  🎨 Renk Seçimi
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Araç Rengi</InputLabel>
                  <Select
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    sx={{
                      borderRadius: 3,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {colorOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
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
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
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
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Teknik Özellikler
                </Typography>
              </Box>

              {/* Koltuk Düzeni ve Ekran */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 3,
                  mb: 3,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Koltuk Düzeni</InputLabel>
                  <Select
                    value={formData.seatLayout}
                    onChange={(e) =>
                      handleInputChange("seatLayout", e.target.value)
                    }
                    sx={{ borderRadius: 3 }}
                  >
                    {seatLayoutOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Koltuk Arkası Ekran</InputLabel>
                  <Select
                    value={formData.seatBackScreen}
                    onChange={(e) =>
                      handleInputChange("seatBackScreen", e.target.value)
                    }
                    sx={{ borderRadius: 3 }}
                  >
                    {screenOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Vites ve Yakıt */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 3,
                  mb: 3,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Vites</InputLabel>
                  <Select
                    value={formData.transmission}
                    onChange={(e) =>
                      handleInputChange("transmission", e.target.value)
                    }
                    sx={{ borderRadius: 3 }}
                  >
                    {transmissionOptions.map((option) => (
                      <MenuItem key={option} value={option.toLowerCase()}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Yakıt Tipi</InputLabel>
                  <Select
                    value={formData.fuelType}
                    onChange={(e) =>
                      handleInputChange("fuelType", e.target.value)
                    }
                    sx={{ borderRadius: 3 }}
                  >
                    {fuelTypeOptions.map((option) => (
                      <MenuItem key={option} value={option.toLowerCase()}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Yakıt Deposu (L)"
                  type="number"
                  value={formData.fuelCapacity}
                  onChange={(e) =>
                    handleInputChange("fuelCapacity", e.target.value)
                  }
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
              </Box>

              {/* Lastik Durumu */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  Lastik Durumu: {formData.tireCondition}%
                </Typography>
                <Slider
                  value={formData.tireCondition}
                  onChange={(_, newValue) =>
                    handleInputChange("tireCondition", newValue as number)
                  }
                  min={0}
                  max={100}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{
                    color: "#1976d2",
                    "& .MuiSlider-thumb": {
                      backgroundColor: "#1976d2",
                    },
                  }}
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
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
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
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Konum Bilgileri
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 3,
                  mb: 3,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Şehir</InputLabel>
                  <Select
                    value={formData.cityId}
                    onChange={(e) =>
                      handleInputChange("cityId", e.target.value)
                    }
                    required
                    sx={{ borderRadius: 3 }}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.plateCode} - {city.name}
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
                    required
                    disabled={!formData.cityId}
                    sx={{ borderRadius: 3 }}
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

              <TextField
                fullWidth
                label="Plaka Numarası"
                value={formData.plateNumber}
                onChange={(e) =>
                  handleInputChange("plateNumber", e.target.value)
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Özellikler Kartı */}
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
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    borderRadius: "50%",
                    p: 1.5,
                    mr: 2,
                  }}
                >
                  <Description sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Araç Özellikleri
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 2,
                  mb: 3,
                }}
              >
                {Object.entries({
                  threeG: "3G",
                  abs: "ABS",
                  asr: "ASR",
                  retarder: "Retarder",
                  aracTelefonu: "Araç Telefonu",
                  buzdolabi: "Buzdolabı",
                  isitmalSurucuCami: "Isıtmalı Sürücü Camı",
                  kisiselSesSistemi: "Kişisel Ses Sistemi",
                  klima: "Klima",
                  mutfak: "Mutfak",
                  surucuKabini: "Sürücü Kabini",
                  televizyon: "Televizyon",
                  tuvalet: "Tuvalet",
                  uydu: "Uydu",
                  wifi: "Wi-Fi",
                }).map(([key, label]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={
                          formData.detailFeatures[
                            key as keyof typeof formData.detailFeatures
                          ] || false
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            detailFeatures: {
                              ...prev.detailFeatures,
                              [key]: e.target.checked,
                            },
                          }))
                        }
                        sx={{
                          color: "#1976d2",
                          "&.Mui-checked": { color: "#1976d2" },
                        }}
                      />
                    }
                    label={label}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      m: 0,
                      p: 1,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "#1976d2",
                      },
                    }}
                  />
                ))}
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
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
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
                      "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Fotoğraflar
                </Typography>
              </Box>

              {/* Vitrin Fotoğrafı */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Vitrin Fotoğrafı
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed #1976d2",
                    borderRadius: 3,
                    p: 3,
                    textAlign: "center",
                    backgroundColor: "#f8f9ff",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f0f4ff",
                      borderColor: "#1565c0",
                    },
                  }}
                  onClick={() =>
                    document.getElementById("showcase-upload")?.click()
                  }
                >
                  {showcasePreview ? (
                    <Box>
                      <img
                        src={showcasePreview}
                        alt="Vitrin"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "150px",
                          borderRadius: "8px",
                          marginBottom: "10px",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Vitrin fotoğrafını değiştirmek için tıklayın
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <PhotoCamera
                        sx={{ fontSize: 48, color: "#1976d2", mb: 2 }}
                      />
                      <Typography variant="h6" color="primary">
                        Vitrin Fotoğrafı Yükle
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ana fotoğraf olarak gösterilecek
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  id="showcase-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, true)}
                  style={{ display: "none" }}
                />
              </Box>

              {/* Diğer Fotoğraflar */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Diğer Fotoğraflar ({formData.photos.length}/15)
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed #1976d2",
                    borderRadius: 3,
                    p: 3,
                    textAlign: "center",
                    backgroundColor: "#f8f9ff",
                    cursor: "pointer",
                    mb: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f0f4ff",
                      borderColor: "#1565c0",
                    },
                  }}
                  onClick={() =>
                    document.getElementById("photos-upload")?.click()
                  }
                >
                  <PhotoCamera sx={{ fontSize: 48, color: "#1976d2", mb: 2 }} />
                  <Typography variant="h6" color="primary">
                    Fotoğraf Ekle
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En fazla 15 fotoğraf yükleyebilirsiniz
                  </Typography>
                </Box>
                <input
                  id="photos-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, false)}
                  style={{ display: "none" }}
                />

                {/* Fotoğraf Önizlemeleri */}
                {photoPreviews.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: 2,
                      mt: 3,
                    }}
                  >
                    {photoPreviews.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: 2,
                        }}
                      >
                        <img
                          src={preview}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            minWidth: "auto",
                            p: 0.5,
                            backgroundColor: "rgba(255,255,255,0.8)",
                            color: "error.main",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.9)",
                            },
                          }}
                        >
                          ✕
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !formData.showcasePhoto}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #2c3646 0%, #c23530 100%)",
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: "#e0e0e0",
                  color: "#bdbdbd",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "İlan Yayınlanıyor..." : "🚌 İlanı Yayınla"}
            </Button>
          </Box>
        </form>
      </Container>

      {/* Success Modal */}
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
    </>
  );
};

export default OtobusAdForm;
