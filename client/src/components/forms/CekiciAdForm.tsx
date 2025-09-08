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
} from "@mui/material";
import {
  CheckCircle,
  CloudUpload,
  PhotoCamera,
  EditNote,
  Build,
  LocationOn,
  Star,
  CameraAlt,
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

interface FormData {
  // Temel bilgiler
  title: string;
  description: string;
  year: string;
  price: string;
  mileage: string;
  condition: string;
  color: string;
  fuelType: string;
  transmission: string;

  // Çekici spesifik alanlar
  enginePower: string;
  engineCapacity: string;
  cabinType: string;
  bedCount: string;
  dorseAvailable: string;
  plateType: string;
  plateNumber: string;
  tireCondition: string;
  damageRecord: string;
  paintChange: string;
  exchange: string;

  // Konum
  cityId: string;
  districtId: string;

  // Detaylı bilgi
  detailedInfo: string;

  // Fotoğraflar
  showcasePhoto: File | null;
  photos: File[];

  // Özellikler
  features: {
    abs: boolean;
    esp: boolean;
    asr: boolean;
    alarm: boolean;
    ebv: boolean;
    airBag: boolean;
    sideAirbag: boolean;
    passengerAirbag: boolean;
    centralLock: boolean;
    immobilizer: boolean;
    headlightSensor: boolean;
    headlightWasher: boolean;
    rainSensor: boolean;
    pto: boolean;
    cruiseControl: boolean;
    airCondition: boolean;
    alloyWheel: boolean;
    cd: boolean;
    towHook: boolean;
    leatherSeat: boolean;
    electricMirror: boolean;
    electricWindow: boolean;
    fogLight: boolean;
    heatedSeats: boolean;
    powerSteering: boolean;
    memorySeats: boolean;
    retarder: boolean;
    spoiler: boolean;
    sunroof: boolean;
    radio: boolean;
    gps: boolean;
    tripComputer: boolean;
    windDeflector: boolean;
    table: boolean;
    flexibleReadingLight: boolean;
  };
}

// Yatak sayısı seçenekleri
const bedCountOptions = [
  { label: "Yok", value: "yok" },
  { label: "1 Yatak", value: "1" },
  { label: "2 Yatak", value: "2" },
  { label: "3 Yatak", value: "3" },
  { label: "4 Yatak", value: "4" },
];

// Kabin tipi seçenekleri
const cabinTypeOptions = ["Çift Kabin", "Yüksek", "Normal"];

const CekiciAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Temel bilgiler
    title: "",
    description: "",
    year: "",
    price: "",
    mileage: "",
    condition: "ikinci-el",
    color: "",
    fuelType: "dizel",
    transmission: "manuel",

    // Çekici spesifik alanlar
    enginePower: "",
    engineCapacity: "",
    cabinType: "",
    bedCount: "yok",
    dorseAvailable: "yok",
    plateType: "tr-plakali",
    plateNumber: "",
    tireCondition: "",
    damageRecord: "hayir",
    paintChange: "hayir",
    exchange: "olabilir",

    // Konum
    cityId: "",
    districtId: "",

    // Detaylı bilgi
    detailedInfo: "",

    // Fotoğraflar
    showcasePhoto: null,
    photos: [],

    // Özellikler
    features: {
      abs: false,
      esp: false,
      asr: false,
      alarm: false,
      ebv: false,
      airBag: false,
      sideAirbag: false,
      passengerAirbag: false,
      centralLock: false,
      immobilizer: false,
      headlightSensor: false,
      headlightWasher: false,
      rainSensor: false,
      pto: false,
      cruiseControl: false,
      airCondition: false,
      alloyWheel: false,
      cd: false,
      towHook: false,
      leatherSeat: false,
      electricMirror: false,
      electricWindow: false,
      fogLight: false,
      heatedSeats: false,
      powerSteering: false,
      memorySeats: false,
      retarder: false,
      spoiler: false,
      sunroof: false,
      radio: false,
      gps: false,
      tripComputer: false,
      windDeflector: false,
      table: false,
      flexibleReadingLight: false,
    },
  });

  // Şehirler ve ilçeleri yükle
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

  useEffect(() => {
    if (formData.cityId) {
      const fetchDistricts = async () => {
        try {
          const response = await apiClient.get(
            `/cities/${formData.cityId}/districts`
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

  const handleFeatureChange = (
    feature: keyof FormData["features"],
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked,
      },
    }));
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (isShowcase) {
      setFormData((prev) => ({
        ...prev,
        showcasePhoto: files[0],
      }));
    } else {
      const newPhotos = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 15),
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
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
          key !== "features" &&
          value
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

      // Özellikleri JSON olarak ekle
      submitData.append("features", JSON.stringify(formData.features));

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/cekici", submitData, {
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
          mb: 6,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "100vh",
          borderRadius: 3,
          p: 0,
        }}
      >
        {/* Ana Başlık */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
            color: "white",
            p: 4,
            borderRadius: "24px 24px 0 0",
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            🚛 Çekici İlanı Ver
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Çekici aracınızı hızlıca satmak için detaylı bilgilerini girin
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} style={{ padding: "0 32px 32px" }}>
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
                  📝 Genel Bilgiler
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
                  },
                }}
              />

              {/* Yıl, Fiyat, KM */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <TextField
                  label="Yıl"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  required
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <TextField
                  label="Fiyat (TL)"
                  value={formatNumber(formData.price)}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("price", rawValue);
                  }}
                  required
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <TextField
                  label="Kilometre"
                  value={formatNumber(formData.mileage)}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleInputChange("mileage", rawValue);
                  }}
                  required
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Durum, Renk */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.condition}
                    onChange={(e) =>
                      handleInputChange("condition", e.target.value)
                    }
                    required
                    label="Durum"
                  >
                    <MenuItem value="sifir">Sıfır</MenuItem>
                    <MenuItem value="ikinci-el">İkinci El</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Renk"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  required
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Yakıt, Vites */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Yakıt Türü</InputLabel>
                  <Select
                    value={formData.fuelType}
                    onChange={(e) =>
                      handleInputChange("fuelType", e.target.value)
                    }
                    required
                    label="Yakıt Türü"
                  >
                    <MenuItem value="dizel">Dizel</MenuItem>
                    <MenuItem value="benzin">Benzin</MenuItem>
                    <MenuItem value="lpg">LPG</MenuItem>
                    <MenuItem value="elektrik">Elektrik</MenuItem>
                    <MenuItem value="hibrit">Hibrit</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Vites</InputLabel>
                  <Select
                    value={formData.transmission}
                    onChange={(e) =>
                      handleInputChange("transmission", e.target.value)
                    }
                    required
                    label="Vites"
                  >
                    <MenuItem value="manuel">Manuel</MenuItem>
                    <MenuItem value="otomatik">Otomatik</MenuItem>
                    <MenuItem value="yarimotomatik">Yarı Otomatik</MenuItem>
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
                  <Build sx={{ color: "white", fontSize: 28 }} />
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
                  🔧 Teknik Özellikler
                </Typography>
              </Box>

              {/* Motor Gücü, Motor Hacmi */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <TextField
                  label="Motor Gücü (HP)"
                  type="number"
                  value={formData.enginePower}
                  onChange={(e) =>
                    handleInputChange("enginePower", e.target.value)
                  }
                  required
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <TextField
                  label="Motor Hacmi (cc)"
                  type="number"
                  value={formData.engineCapacity}
                  onChange={(e) =>
                    handleInputChange("engineCapacity", e.target.value)
                  }
                  required
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Kabin Tipi, Yatak Sayısı */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Kabin Tipi</InputLabel>
                  <Select
                    value={formData.cabinType}
                    onChange={(e) =>
                      handleInputChange("cabinType", e.target.value)
                    }
                    required
                    label="Kabin Tipi"
                  >
                    {cabinTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Yatak Sayısı</InputLabel>
                  <Select
                    value={formData.bedCount}
                    onChange={(e) =>
                      handleInputChange("bedCount", e.target.value)
                    }
                    required
                    label="Yatak Sayısı"
                  >
                    {bedCountOptions.map((bed) => (
                      <MenuItem key={bed.value} value={bed.value}>
                        {bed.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Dorse, Plaka Tipi */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Dorse Var Mı?</InputLabel>
                  <Select
                    value={formData.dorseAvailable}
                    onChange={(e) =>
                      handleInputChange("dorseAvailable", e.target.value)
                    }
                    required
                    label="Dorse Var Mı?"
                  >
                    <MenuItem value="var">Var</MenuItem>
                    <MenuItem value="yok">Yok</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Plaka Tipi</InputLabel>
                  <Select
                    value={formData.plateType}
                    onChange={(e) =>
                      handleInputChange("plateType", e.target.value)
                    }
                    required
                    label="Plaka Tipi"
                  >
                    <MenuItem value="tr-plakali">TR Plakalı</MenuItem>
                    <MenuItem value="yabanci-plakali">Yabancı Plakalı</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Plaka No, Lastik Durumu */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <TextField
                  label="Plaka No"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    handleInputChange("plateNumber", e.target.value)
                  }
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <TextField
                  label="Lastik Durumu"
                  value={formData.tireCondition}
                  onChange={(e) =>
                    handleInputChange("tireCondition", e.target.value)
                  }
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Hasar Kaydı, Boya, Takas */}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Hasar Kaydı</InputLabel>
                  <Select
                    value={formData.damageRecord}
                    onChange={(e) =>
                      handleInputChange("damageRecord", e.target.value)
                    }
                    required
                    label="Hasar Kaydı"
                  >
                    <MenuItem value="evet">Evet</MenuItem>
                    <MenuItem value="hayir">Hayır</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Boyalı</InputLabel>
                  <Select
                    value={formData.paintChange}
                    onChange={(e) =>
                      handleInputChange("paintChange", e.target.value)
                    }
                    required
                    label="Boyalı"
                  >
                    <MenuItem value="evet">Evet</MenuItem>
                    <MenuItem value="hayir">Hayır</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>Takas</InputLabel>
                  <Select
                    value={formData.exchange}
                    onChange={(e) =>
                      handleInputChange("exchange", e.target.value)
                    }
                    required
                    label="Takas"
                  >
                    <MenuItem value="olabilir">Olabilir</MenuItem>
                    <MenuItem value="olmaz">Olmaz</MenuItem>
                  </Select>
                </FormControl>
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
                  📍 Konum Bilgileri
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>İl</InputLabel>
                  <Select
                    value={formData.cityId}
                    onChange={(e) =>
                      handleInputChange("cityId", e.target.value)
                    }
                    required
                    label="İl"
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.id} value={city.id.toString()}>
                        {city.plateCode} - {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                >
                  <InputLabel>İlçe</InputLabel>
                  <Select
                    value={formData.districtId}
                    onChange={(e) =>
                      handleInputChange("districtId", e.target.value)
                    }
                    disabled={!formData.cityId}
                    required
                    label="İlçe"
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
            </CardContent>
          </Card>

          {/* Araç Özellikleri Kartı */}
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
                  <Star sx={{ color: "white", fontSize: 28 }} />
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
                  ⭐ Araç Özellikleri
                </Typography>
              </Box>

              {/* Güvenlik Özellikleri */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, fontWeight: "bold", color: "#1976d2" }}
              >
                🛡️ Güvenlik
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 2,
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.abs}
                      onChange={(e) =>
                        handleFeatureChange("abs", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="ABS"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.esp}
                      onChange={(e) =>
                        handleFeatureChange("esp", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="ESP"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.asr}
                      onChange={(e) =>
                        handleFeatureChange("asr", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="ASR"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.alarm}
                      onChange={(e) =>
                        handleFeatureChange("alarm", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Alarm"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.ebv}
                      onChange={(e) =>
                        handleFeatureChange("ebv", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="EBV"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.airBag}
                      onChange={(e) =>
                        handleFeatureChange("airBag", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hava Yastığı (Sürücü)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.sideAirbag}
                      onChange={(e) =>
                        handleFeatureChange("sideAirbag", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hava Yastığı (Yan)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.passengerAirbag}
                      onChange={(e) =>
                        handleFeatureChange("passengerAirbag", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hava Yastığı (Yolcu)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.centralLock}
                      onChange={(e) =>
                        handleFeatureChange("centralLock", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Merkezi Kilit"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.immobilizer}
                      onChange={(e) =>
                        handleFeatureChange("immobilizer", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Immobilizer"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.headlightSensor}
                      onChange={(e) =>
                        handleFeatureChange("headlightSensor", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Far Sensörü"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.headlightWasher}
                      onChange={(e) =>
                        handleFeatureChange("headlightWasher", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Far Yıkama Sistemi"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.rainSensor}
                      onChange={(e) =>
                        handleFeatureChange("rainSensor", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Yağmur Sensörü"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.pto}
                      onChange={(e) =>
                        handleFeatureChange("pto", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="PTO"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.cruiseControl}
                      onChange={(e) =>
                        handleFeatureChange("cruiseControl", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Yokuş Kalkış Desteği"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
              </Box>

              {/* Donanım Özellikleri */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 3, fontWeight: "bold", color: "#1976d2" }}
              >
                🔧 Donanım
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 2,
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.airCondition}
                      onChange={(e) =>
                        handleFeatureChange("airCondition", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Klima"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.alloyWheel}
                      onChange={(e) =>
                        handleFeatureChange("alloyWheel", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Alaşım Jant"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.cd}
                      onChange={(e) =>
                        handleFeatureChange("cd", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="CD Çalar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.towHook}
                      onChange={(e) =>
                        handleFeatureChange("towHook", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Çeki Demiri"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.leatherSeat}
                      onChange={(e) =>
                        handleFeatureChange("leatherSeat", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Deri Döşeme"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.electricMirror}
                      onChange={(e) =>
                        handleFeatureChange("electricMirror", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Elektrikli Aynalar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.electricWindow}
                      onChange={(e) =>
                        handleFeatureChange("electricWindow", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Elektrikli Cam"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.fogLight}
                      onChange={(e) =>
                        handleFeatureChange("fogLight", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Far (Sis)"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.heatedSeats}
                      onChange={(e) =>
                        handleFeatureChange("heatedSeats", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hafızalı Koltuklar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.powerSteering}
                      onChange={(e) =>
                        handleFeatureChange("powerSteering", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Hidrolik Direksiyon"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.memorySeats}
                      onChange={(e) =>
                        handleFeatureChange("memorySeats", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Isıtmalı Koltuklar"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.retarder}
                      onChange={(e) =>
                        handleFeatureChange("retarder", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Retarder"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.spoiler}
                      onChange={(e) =>
                        handleFeatureChange("spoiler", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Spoiler"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.sunroof}
                      onChange={(e) =>
                        handleFeatureChange("sunroof", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Sunroof"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.radio}
                      onChange={(e) =>
                        handleFeatureChange("radio", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Radio - Teyp"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.gps}
                      onChange={(e) =>
                        handleFeatureChange("gps", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="TV / Navigasyon"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.tripComputer}
                      onChange={(e) =>
                        handleFeatureChange("tripComputer", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Yol Bilgisayarı"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.windDeflector}
                      onChange={(e) =>
                        handleFeatureChange("windDeflector", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Cam Rüzgarlığı"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.table}
                      onChange={(e) =>
                        handleFeatureChange("table", e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Masa"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.flexibleReadingLight}
                      onChange={(e) =>
                        handleFeatureChange(
                          "flexibleReadingLight",
                          e.target.checked
                        )
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                      }}
                    />
                  }
                  label="Esnek Okuma Lambası"
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    m: 0,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#1976d2",
                    },
                  }}
                />
              </Box>

              {/* Detaylı Bilgi */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Detaylı Bilgi"
                value={formData.detailedInfo}
                onChange={(e) =>
                  handleInputChange("detailedInfo", e.target.value)
                }
                placeholder="Aracınız hakkında detaylı bilgi verebilirsiniz..."
                sx={{
                  mt: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
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
                  <CameraAlt sx={{ color: "white", fontSize: 28 }} />
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
                  📸 Fotoğraflar
                </Typography>
              </Box>

              {/* Vitrin Fotoğrafı */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#1976d2", fontWeight: 600 }}
                >
                  📌 Vitrin Fotoğrafı *
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
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    fullWidth
                    sx={{
                      mb: 2,
                      py: 2,
                      borderRadius: 3,
                      borderStyle: "dashed",
                      borderWidth: 2,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    Vitrin Fotoğrafı Seç
                  </Button>
                </label>
                {formData.showcasePhoto && (
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      border: "2px solid #e0e0e0",
                      borderRadius: 3,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(formData.showcasePhoto)}
                      alt="Vitrin"
                      style={{
                        maxWidth: "300px",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      {formData.showcasePhoto.name}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Diğer Fotoğraflar */}
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#1976d2", fontWeight: 600 }}
                >
                  🖼️ Diğer Fotoğraflar (En fazla 15 adet)
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
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{
                      mb: 3,
                      py: 2,
                      borderRadius: 3,
                      borderStyle: "dashed",
                      borderWidth: 2,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    Fotoğraf Ekle
                  </Button>
                </label>

                {formData.photos.length > 0 && (
                  <Box
                    sx={{
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
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "2px solid #e0e0e0",
                          "&:hover": {
                            borderColor: "#1976d2",
                            "& .delete-btn": {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          className="delete-btn"
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            minWidth: "24px",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            bgcolor: "error.main",
                            color: "white",
                            opacity: 0.7,
                            transition: "opacity 0.2s",
                            "&:hover": {
                              bgcolor: "error.dark",
                              opacity: 1,
                            },
                          }}
                        >
                          ×
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
              disabled={loading || !formData.showcasePhoto}
              size="large"
              sx={{
                py: 2,
                px: 6,
                borderRadius: 3,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #2c3540 0%, #b8392f 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                },
                "&:disabled": {
                  background: "#cccccc",
                },
              }}
            >
              {loading ? "İlan Yayınlanıyor..." : "🚀 İlanı Yayınla"}
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

export default CekiciAdForm;
