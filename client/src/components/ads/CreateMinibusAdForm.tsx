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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import {
  PhotoCamera,
  CheckCircle,
  EditNote,
  DirectionsBus,
  Settings,
  LocationOn,
  Description,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../layout/Header";
import apiClient from "@/api/client";

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
  year: string;
  price: string;
  mileage: string;
  condition: string;
  engineVolume: string;
  drivetrain: string;
  color: string;
  seatCount: string;
  roofType: string;
  chassis: string;
  transmission: string;
  fuelType: string;
  exchange: string;
  plateType: string;
  plateNumber: string;
  cityId: string;
  districtId: string;
  address: string;
  detailedInfo: string;
  photos: File[];
  showcasePhoto: File | null;
  // Detay Bilgisi alanları
  detailFeatures: {
    abs?: boolean;
    alarm?: boolean;
    alasimJant?: boolean;
    asr?: boolean;
    cdCalar?: boolean;
    cekiDemiri?: boolean;
    deriDoseme?: boolean;
    elektrikliAynalar?: boolean;
    elektrikliCam?: boolean;
    esp?: boolean;
    farSis?: boolean;
    farSensoru?: boolean;
    farYikamaSistemi?: boolean;
    havaYastigi?: boolean;
    havaYastigiYolcu?: boolean;
    hizSabitleme?: boolean;
    hidrolikDireksiyon?: boolean;
    immobilizer?: boolean;
    isitmalKoltuklar?: boolean;
    klima?: boolean;
    merkeziKilit?: boolean;
    okulAraci?: boolean;
    otomatikCam?: boolean;
    otomatikKapi?: boolean;
    parkSensoru?: boolean;
    radioTeyp?: boolean;
    spoyler?: boolean;
    sunroof?: boolean;
    turizmPaketi?: boolean;
    tvNavigasyon?: boolean;
    xenonFar?: boolean;
    yagmurSensoru?: boolean;
    yanHavaYastigi?: boolean;
    yokusKalkisDestegi?: boolean;
    yolBilgisayari?: boolean;
    sogutucuFrigo?: boolean;
    // Ek özellikler
    dvdPlayer?: boolean;
    muzikSistemi?: boolean;
    geriGorusKamerasi?: boolean;
    elFreni?: boolean;
    ayakFreni?: boolean;
    bagajHacmi?: boolean;
    sigortali?: boolean;
    garantili?: boolean;
  };
}

const CreateMinibusAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    year: "",
    price: "",
    mileage: "",
    condition: "ikinci-el",
    engineVolume: "",
    drivetrain: "onden-cekis",
    color: "",
    seatCount: "",
    roofType: "normal-tavan",
    chassis: "kisa",
    transmission: "manuel",
    fuelType: "dizel",
    exchange: "hayir",
    plateType: "tr-plakali",
    plateNumber: "",
    cityId: "",
    districtId: "",
    address: "",
    detailedInfo: "",
    photos: [],
    showcasePhoto: null,
    detailFeatures: {
      abs: false,
      alarm: false,
      alasimJant: false,
      asr: false,
      cdCalar: false,
      cekiDemiri: false,
      deriDoseme: false,
      elektrikliAynalar: false,
      elektrikliCam: false,
      esp: false,
      farSis: false,
      farSensoru: false,
      farYikamaSistemi: false,
      havaYastigi: false,
      havaYastigiYolcu: false,
      hizSabitleme: false,
      hidrolikDireksiyon: false,
      immobilizer: false,
      isitmalKoltuklar: false,
      klima: false,
      merkeziKilit: false,
      okulAraci: false,
      otomatikCam: false,
      otomatikKapi: false,
      parkSensoru: false,
      radioTeyp: false,
      spoyler: false,
      sunroof: false,
      turizmPaketi: false,
      tvNavigasyon: false,
      xenonFar: false,
      yagmurSensoru: false,
      yanHavaYastigi: false,
      yokusKalkisDestegi: false,
      yolBilgisayari: false,
      sogutucuFrigo: false,
      // Ek özellikler
      dvdPlayer: false,
      muzikSistemi: false,
      geriGorusKamerasi: false,
      elFreni: false,
      ayakFreni: false,
      bagajHacmi: false,
      sigortali: false,
      garantili: false,
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
        setFormData((prev) => ({ ...prev, showcasePhoto: files[0] }));
      } else {
        const currentPhotos = formData.photos;
        const newPhotos = Array.from(files);
        const totalPhotos = currentPhotos.length + newPhotos.length;

        if (totalPhotos <= 15) {
          setFormData((prev) => ({
            ...prev,
            photos: [...currentPhotos, ...newPhotos],
          }));
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

      // Detay özelliklerini JSON olarak ekle
      submitData.append(
        "detailFeatures",
        JSON.stringify(formData.detailFeatures)
      );

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/minibus", submitData, {
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
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            🚐 Minibüs & Midibüs İlanı Ver
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
          >
            Aracınızın tüm detaylarını girerek profesyonel ilanınızı oluşturun
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
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

            {/* 🚐 Araç Detayları */}
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
                    <DirectionsBus sx={{ color: "white", fontSize: 28 }} />
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
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                    inputProps={{ min: 0 }}
                  />

                  <TextField
                    fullWidth
                    label="Kilometre"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) =>
                      handleInputChange("mileage", e.target.value)
                    }
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                    inputProps={{ min: 0 }}
                  />
                </Box>

                {/* Araç Durumu ve Motor Hacmi */}
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
                      <MenuItem value="ikinci-el">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔄</span> İkinci El
                        </Box>
                      </MenuItem>
                      <MenuItem value="yurtdisindan-ithal">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🌍</span> Yurtdışından İthal
                        </Box>
                      </MenuItem>
                      <MenuItem value="sifir">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>✨</span> Sıfır
                        </Box>
                      </MenuItem>
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
                    <InputLabel>Motor Hacmi</InputLabel>
                    <Select
                      value={formData.engineVolume}
                      onChange={(e) =>
                        handleInputChange("engineVolume", e.target.value)
                      }
                      label="Motor Hacmi"
                    >
                      <MenuItem value="1000-1400">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⚡</span> 1000-1400 cc
                        </Box>
                      </MenuItem>
                      <MenuItem value="1400-1600">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔋</span> 1400-1600 cc
                        </Box>
                      </MenuItem>
                      <MenuItem value="1600-2000">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🚀</span> 1600-2000 cc
                        </Box>
                      </MenuItem>
                      <MenuItem value="2000-2500">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>💪</span> 2000-2500 cc
                        </Box>
                      </MenuItem>
                      <MenuItem value="2500-3000">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔥</span> 2500-3000 cc
                        </Box>
                      </MenuItem>
                      <MenuItem value="3000+">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>💥</span> 3000+ cc
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Çekiş ve Renk */}
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
                    <InputLabel>Çekiş</InputLabel>
                    <Select
                      value={formData.drivetrain}
                      onChange={(e) =>
                        handleInputChange("drivetrain", e.target.value)
                      }
                      label="Çekiş"
                    >
                      <MenuItem value="onden-cekis">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⬆️</span> Önden Çekiş
                        </Box>
                      </MenuItem>
                      <MenuItem value="arkadan-itis">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⬇️</span> Arkadan İtiş
                        </Box>
                      </MenuItem>
                      <MenuItem value="4wd-surekli">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔄</span> 4WD Sürekli
                        </Box>
                      </MenuItem>
                      <MenuItem value="arkadan-itis-elektronik">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⚡</span> Arkadan İtiş Elektronik
                        </Box>
                      </MenuItem>
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
                    <InputLabel>Renk</InputLabel>
                    <Select
                      value={formData.color}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      label="Renk"
                    >
                      <MenuItem value="beyaz">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⚪</span> Beyaz
                        </Box>
                      </MenuItem>
                      <MenuItem value="siyah">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⚫</span> Siyah
                        </Box>
                      </MenuItem>
                      <MenuItem value="gri">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔘</span> Gri
                        </Box>
                      </MenuItem>
                      <MenuItem value="mavi">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔵</span> Mavi
                        </Box>
                      </MenuItem>
                      <MenuItem value="kirmizi">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔴</span> Kırmızı
                        </Box>
                      </MenuItem>
                      <MenuItem value="yesil">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🟢</span> Yeşil
                        </Box>
                      </MenuItem>
                      <MenuItem value="sari">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🟡</span> Sarı
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Koltuk Sayısı Grid */}
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
                    🪑 Koltuk Sayısı Seçimi
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    {[
                      { value: "8+1", label: "8+1" },
                      { value: "9+1", label: "9+1" },
                      { value: "10+1", label: "10+1" },
                      { value: "11+1", label: "11+1" },
                      { value: "12+1", label: "12+1" },
                      { value: "13+1", label: "13+1" },
                      { value: "14+1", label: "14+1" },
                      { value: "15+1", label: "15+1" },
                      { value: "16+1", label: "16+1" },
                      { value: "17+1", label: "17+1" },
                      { value: "18+1", label: "18+1" },
                      { value: "19+1", label: "19+1" },
                      { value: "20+1", label: "20+1" },
                      { value: "21+1", label: "21+1" },
                      { value: "22+1", label: "22+1" },
                      { value: "23+1", label: "23+1" },
                      { value: "24+1", label: "24+1" },
                      { value: "25+1", label: "25+1" },
                      { value: "26+1", label: "26+1" },
                    ].map((seat) => (
                      <Box
                        key={seat.value}
                        onClick={() =>
                          handleInputChange("seatCount", seat.value)
                        }
                        sx={{
                          p: 2,
                          border: "2px solid",
                          borderColor:
                            formData.seatCount === seat.value
                              ? "#1976d2"
                              : "#e0e0e0",
                          borderRadius: 2,
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          backgroundColor:
                            formData.seatCount === seat.value
                              ? "#e3f2fd"
                              : "white",
                          "&:hover": {
                            borderColor: "#1976d2",
                            backgroundColor: "#f5f5f5",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              formData.seatCount === seat.value ? 600 : 400,
                            color:
                              formData.seatCount === seat.value
                                ? "#1976d2"
                                : "#666",
                          }}
                        >
                          {seat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Tavan Tipi ve Şasi */}
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
                    <InputLabel>Tavan Tipi</InputLabel>
                    <Select
                      value={formData.roofType}
                      onChange={(e) =>
                        handleInputChange("roofType", e.target.value)
                      }
                      label="Tavan Tipi"
                    >
                      <MenuItem value="normal-tavan">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🏠</span> Normal Tavan
                        </Box>
                      </MenuItem>
                      <MenuItem value="yuksek-tavan">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🏢</span> Yüksek Tavan
                        </Box>
                      </MenuItem>
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
                    <InputLabel>Şasi</InputLabel>
                    <Select
                      value={formData.chassis}
                      onChange={(e) =>
                        handleInputChange("chassis", e.target.value)
                      }
                      label="Şasi"
                    >
                      <MenuItem value="kisa">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>📏</span> Kısa
                        </Box>
                      </MenuItem>
                      <MenuItem value="orta">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>📐</span> Orta
                        </Box>
                      </MenuItem>
                      <MenuItem value="uzun">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>📏</span> Uzun
                        </Box>
                      </MenuItem>
                      <MenuItem value="ekstra-uzun">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>📋</span> Ekstra Uzun
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Vites, Yakıt Tipi, Takas */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                    <InputLabel>Vites</InputLabel>
                    <Select
                      value={formData.transmission}
                      onChange={(e) =>
                        handleInputChange("transmission", e.target.value)
                      }
                      label="Vites"
                    >
                      <MenuItem value="manuel">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🦾</span> Manuel
                        </Box>
                      </MenuItem>
                      <MenuItem value="otomatik">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🤖</span> Otomatik
                        </Box>
                      </MenuItem>
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
                    <InputLabel>Yakıt Tipi</InputLabel>
                    <Select
                      value={formData.fuelType}
                      onChange={(e) =>
                        handleInputChange("fuelType", e.target.value)
                      }
                      label="Yakıt Tipi"
                    >
                      <MenuItem value="benzinli">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>⛽</span> Benzinli
                        </Box>
                      </MenuItem>
                      <MenuItem value="benzinli-lpg">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔥</span> Benzinli + LPG
                        </Box>
                      </MenuItem>
                      <MenuItem value="dizel">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🛢️</span> Dizel
                        </Box>
                      </MenuItem>
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

                {/* Plaka Bilgileri */}
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
                          <span>🇹🇷</span> Türkiye TR Plakalı
                        </Box>
                      </MenuItem>
                      <MenuItem value="mavi-plakali">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>🔵</span> Mavi MA Plakalı
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
                    placeholder="Aracınız hakkında detaylı bilgi verebilirsiniz..."
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
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

            {/* 📝 Detaylı Bilgi */}
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
                    <Description sx={{ color: "white", fontSize: 28 }} />
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
                    Detaylı Bilgi
                  </Typography>
                </Box>

                {/* Detaylı Bilgi */}
                <Box>
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
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                  Aracınızda bulunan özel özellikleri seçerek ilanınızı daha
                  çekici hale getirin
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 3,
                    mt: 3,
                  }}
                >
                  {/* ABS */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.abs}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                abs: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="ABS"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Alarm */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.alarm}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                alarm: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Alarm"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Alaşım Jant */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.alasimJant}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                alasimJant: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Alaşım Jant"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* ASR */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.asr}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                asr: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="ASR"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* CD Çalar */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.cdCalar}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                cdCalar: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="CD Çalar"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Çeki Demiri */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.cekiDemiri}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                cekiDemiri: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Çeki Demiri"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Deri Döşeme */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.deriDoseme}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                deriDoseme: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Deri Döşeme"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Elektrikli Aynalar */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.elektrikliAynalar}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                elektrikliAynalar: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Elektrikli Aynalar"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Elektrikli Cam */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.elektrikliCam}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                elektrikliCam: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Elektrikli Cam"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* ESP */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.esp}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                esp: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="ESP"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Far (Sis) */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.farSis}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                farSis: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Far (Sis)"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Far Sensörü */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.farSensoru}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                farSensoru: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Far Sensörü"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Far Yıkama Sistemi */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.farYikamaSistemi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                farYikamaSistemi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Far Yıkama Sistemi"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Hava Yastığı (Sürücü) */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.havaYastigi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                havaYastigi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Hava Yastığı (Sürücü)"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Hava Yastığı (Yolcu) */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.havaYastigiYolcu}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                havaYastigiYolcu: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Hava Yastığı (Yolcu)"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Hız Sabitleme */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.hizSabitleme}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                hizSabitleme: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Hız Sabitleme"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Hidrolik Direksiyon */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.hidrolikDireksiyon}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                hidrolikDireksiyon: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Hidrolik Direksiyon"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Immobilizer */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.immobilizer}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                immobilizer: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Immobilizer"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Isıtmalı Koltuklar */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.isitmalKoltuklar}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                isitmalKoltuklar: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Isıtmalı Koltuklar"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Klima */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.klima}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                klima: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Klima"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Merkezi Kilit */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.merkeziKilit}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                merkeziKilit: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Merkezi Kilit"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Okul Aracı */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.okulAraci}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                okulAraci: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Okul Aracı"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Otomatik Cam */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.otomatikCam}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                otomatikCam: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Otomatik Cam"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Otomatik Kapı */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.otomatikKapi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                otomatikKapi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Otomatik Kapı"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Park Sensörü */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.parkSensoru}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                parkSensoru: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Park Sensörü"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Radio - Teyp */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.radioTeyp}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                radioTeyp: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Radio - Teyp"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Spoyler */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.spoyler}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                spoyler: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Spoyler"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Sunroof */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.sunroof}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                sunroof: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Sunroof"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Turizm Paketi */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.turizmPaketi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                turizmPaketi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Turizm Paketi"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* TV / Navigasyon */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.tvNavigasyon}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                tvNavigasyon: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="TV / Navigasyon"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Xenon Far */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.xenonFar}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                xenonFar: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Xenon Far"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Yağmur Sensörü */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.yagmurSensoru}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                yagmurSensoru: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Yağmur Sensörü"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Yan Hava Yastığı */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.yanHavaYastigi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                yanHavaYastigi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Yan Hava Yastığı"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Yokuş Kalkış Desteği */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.yokusKalkisDestegi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                yokusKalkisDestegi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Yokuş Kalkış Desteği"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Yol Bilgisayarı */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.yolBilgisayari}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                yolBilgisayari: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Yol Bilgisayarı"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Soğutucu / Frigo */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.sogutucuFrigo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                sogutucuFrigo: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Soğutucu / Frigo"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* DVD Player */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.dvdPlayer}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                dvdPlayer: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="DVD Player"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Müzik Sistemi */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.muzikSistemi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                muzikSistemi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Müzik Sistemi"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Geri Görüş Kamerası */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.geriGorusKamerasi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                geriGorusKamerasi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Geri Görüş Kamerası"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* El Freni */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.elFreni}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                elFreni: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="El Freni"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Ayak Freni */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.ayakFreni}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                ayakFreni: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Ayak Freni"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Bagaj Hacmi */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.bagajHacmi}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                bagajHacmi: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Bagaj Hacmi"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Sigortali */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.sigortali}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                sigortali: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Sigortali"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Garantili */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.garantili}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                garantili: e.target.checked,
                              },
                            }))
                          }
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label="Garantili"
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {/* Deri Döşeme */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.deriDoseme}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                deriDoseme: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Deri Döşeme"
                    />
                  </Box>

                  {/* Elektrikli Aynalar */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.elektrikliAynalar}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                elektrikliAynalar: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Elektrikli Aynalar"
                    />
                  </Box>

                  {/* Elektrikli Cam */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.elektrikliCam}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                elektrikliCam: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Elektrikli Cam"
                    />
                  </Box>

                  {/* ESP */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.esp}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                esp: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="ESP"
                    />
                  </Box>

                  {/* Far (Sis) */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.farSis}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                farSis: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Far (Sis)"
                    />
                  </Box>

                  {/* Far Sensörü */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.farSensoru}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                farSensoru: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Far Sensörü"
                    />
                  </Box>

                  {/* Hız Sabitleme */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.hizSabitleme}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                hizSabitleme: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Hız Sabitleme"
                    />
                  </Box>

                  {/* Klima */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.klima}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                klima: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Klima"
                    />
                  </Box>

                  {/* Soğutucu / Frigo */}
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.sogutucuFrigo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              detailFeatures: {
                                ...prev.detailFeatures,
                                sogutucuFrigo: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Soğutucu / Frigo"
                    />
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
                    {formData.showcasePhoto && (
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
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {formData.photos.map((photo, index) => (
                            <Chip
                              key={index}
                              label={photo.name}
                              onDelete={() => removePhoto(index)}
                              color="secondary"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Card>
                </Box>
              </CardContent>
            </Card>

            {/* 🚀 İlan Yayınlama */}
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
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.showcasePhoto}
                  sx={{
                    minWidth: 250,
                    height: 56,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                      boxShadow: "0 6px 25px rgba(25, 118, 210, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                      background: "#e0e0e0",
                      boxShadow: "none",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {loading ? "İlan Yayınlanıyor..." : "🚀 İlanı Yayınla"}
                </Button>
              </CardContent>
            </Card>
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

export default CreateMinibusAdForm;
