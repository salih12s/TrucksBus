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
  Chip,
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
  plateType: string;
  plateNumber: string;
  cityId: string;
  districtId: string;
  address: string;
  detailedInfo: string;
  photos: File[];
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

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
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
    showcasePhoto: null,
    detailFeatures: {},
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "showcasePhoto" &&
          key !== "detailFeatures" &&
          value
        ) {
          submitData.append(key, value.toString());
        }
      });

      // Kategori bilgilerini ekle
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
    navigate("/dashboard");
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            🚛 Kamyon İlanı Ver
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
          >
            Kamyonunuzun tüm detaylarını girerek profesyonel ilanınızı oluşturun
            ve binlerce alıcıya ulaşın
          </Typography>
        </Box>

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
    </>
  );
};

export default KamyonAdForm;
