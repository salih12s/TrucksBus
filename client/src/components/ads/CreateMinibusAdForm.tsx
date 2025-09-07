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
  Card,
  CardContent,
  FormControlLabel,
  Chip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
} from "@mui/material";
import { PhotoCamera, CheckCircle } from "@mui/icons-material";
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

        <Paper
          elevation={8}
          sx={{
            p: 4,
            mt: 3,
            borderRadius: 4,
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            "& .MuiPaper-root": {
              background: "white",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            },
          }}
        >
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Temel Bilgiler Bölümü */}
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: "bold",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📝 Temel Bilgiler
                </Typography>

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
              </Paper>

              {/* Araç Detayları Bölümü */}
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: "bold",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  🚐 Araç Detayları
                </Typography>

                {/* Yıl, Fiyat, KM */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="Yıl"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        handleInputChange("year", e.target.value)
                      }
                      required
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="Fiyat (TL)"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      required
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <TextField
                      fullWidth
                      label="KM"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) =>
                        handleInputChange("mileage", e.target.value)
                      }
                      required
                    />
                  </Box>
                </Box>

                {/* Araç Durumu ve Motor Hacmi */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <FormControl fullWidth>
                      <InputLabel>Araç Durumu</InputLabel>
                      <Select
                        value={formData.condition}
                        onChange={(e) =>
                          handleInputChange("condition", e.target.value)
                        }
                      >
                        <MenuItem value="ikinci-el">İkinci El</MenuItem>
                        <MenuItem value="yurtdisindan-ithal">
                          Yurtdışından İthal
                        </MenuItem>
                        <MenuItem value="sifir">Sıfır</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <FormControl fullWidth>
                      <InputLabel>Motor Hacmi</InputLabel>
                      <Select
                        value={formData.engineVolume}
                        onChange={(e) =>
                          handleInputChange("engineVolume", e.target.value)
                        }
                      >
                        <MenuItem value="1000-1400">1000-1400 cc</MenuItem>
                        <MenuItem value="1400-1600">1400-1600 cc</MenuItem>
                        <MenuItem value="1600-2000">1600-2000 cc</MenuItem>
                        <MenuItem value="2000-2500">2000-2500 cc</MenuItem>
                        <MenuItem value="2500-3000">2500-3000 cc</MenuItem>
                        <MenuItem value="3000+">3000+ cc</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Çekiş ve Renk */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <FormControl fullWidth>
                      <InputLabel>Çekiş</InputLabel>
                      <Select
                        value={formData.drivetrain}
                        onChange={(e) =>
                          handleInputChange("drivetrain", e.target.value)
                        }
                      >
                        <MenuItem value="onden-cekis">Önden Çekiş</MenuItem>
                        <MenuItem value="arkadan-itis">Arkadan İtiş</MenuItem>
                        <MenuItem value="4wd-surekli">4WD Sürekli</MenuItem>
                        <MenuItem value="arkadan-itis-elektronik">
                          Arkadan İtiş Elektronik
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <FormControl fullWidth>
                      <InputLabel>Renk</InputLabel>
                      <Select
                        value={formData.color}
                        onChange={(e) =>
                          handleInputChange("color", e.target.value)
                        }
                      >
                        <MenuItem value="beyaz">Beyaz</MenuItem>
                        <MenuItem value="siyah">Siyah</MenuItem>
                        <MenuItem value="gri">Gri</MenuItem>
                        <MenuItem value="mavi">Mavi</MenuItem>
                        <MenuItem value="kirmizi">Kırmızı</MenuItem>
                        <MenuItem value="yesil">Yeşil</MenuItem>
                        <MenuItem value="sari">Sarı</MenuItem>
                        <MenuItem value="turuncu">Turuncu</MenuItem>
                        <MenuItem value="mor">Mor</MenuItem>
                        <MenuItem value="kahverengi">Kahverengi</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Koltuk Sayısı, Tavan Tipi, Şasi */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth>
                      <InputLabel>Koltuk Sayısı</InputLabel>
                      <Select
                        value={formData.seatCount}
                        onChange={(e) =>
                          handleInputChange("seatCount", e.target.value)
                        }
                      >
                        <MenuItem value="8">8 Kişilik</MenuItem>
                        <MenuItem value="9">9 Kişilik</MenuItem>
                        <MenuItem value="14">14 Kişilik</MenuItem>
                        <MenuItem value="16">16 Kişilik</MenuItem>
                        <MenuItem value="19">19 Kişilik</MenuItem>
                        <MenuItem value="22">22 Kişilik</MenuItem>
                        <MenuItem value="30">30 Kişilik</MenuItem>
                        <MenuItem value="35">35 Kişilik</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth>
                      <InputLabel>Tavan Tipi</InputLabel>
                      <Select
                        value={formData.roofType}
                        onChange={(e) =>
                          handleInputChange("roofType", e.target.value)
                        }
                      >
                        <MenuItem value="normal-tavan">Normal Tavan</MenuItem>
                        <MenuItem value="yuksek-tavan">Yüksek Tavan</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth>
                      <InputLabel>Şasi</InputLabel>
                      <Select
                        value={formData.chassis}
                        onChange={(e) =>
                          handleInputChange("chassis", e.target.value)
                        }
                      >
                        <MenuItem value="kisa">Kısa</MenuItem>
                        <MenuItem value="orta">Orta</MenuItem>
                        <MenuItem value="uzun">Uzun</MenuItem>
                        <MenuItem value="ekstra-uzun">Ekstra Uzun</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Vites, Yakıt Tipi, Takaslı */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth>
                      <InputLabel>Vites</InputLabel>
                      <Select
                        value={formData.transmission}
                        onChange={(e) =>
                          handleInputChange("transmission", e.target.value)
                        }
                      >
                        <MenuItem value="manuel">Manuel</MenuItem>
                        <MenuItem value="otomatik">Otomatik</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth>
                      <InputLabel>Yakıt Tipi</InputLabel>
                      <Select
                        value={formData.fuelType}
                        onChange={(e) =>
                          handleInputChange("fuelType", e.target.value)
                        }
                      >
                        <MenuItem value="benzinli">Benzinli</MenuItem>
                        <MenuItem value="benzinli-lpg">Benzinli + LPG</MenuItem>
                        <MenuItem value="dizel">Dizel</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth>
                      <InputLabel>Takaslı</InputLabel>
                      <Select
                        value={formData.exchange}
                        onChange={(e) =>
                          handleInputChange("exchange", e.target.value)
                        }
                      >
                        <MenuItem value="evet">Evet</MenuItem>
                        <MenuItem value="hayir">Hayır</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Plaka/Uyruk ve Araç Plakası */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <FormControl fullWidth>
                      <InputLabel>Plaka / Uyruk</InputLabel>
                      <Select
                        value={formData.plateType}
                        onChange={(e) =>
                          handleInputChange("plateType", e.target.value)
                        }
                      >
                        <MenuItem value="tr-plakali">
                          Türkiye TR Plakalı
                        </MenuItem>
                        <MenuItem value="mavi-plakali">
                          Mavi MA Plakalı
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <TextField
                      fullWidth
                      label="Araç Plakası"
                      value={formData.plateNumber}
                      onChange={(e) =>
                        handleInputChange("plateNumber", e.target.value)
                      }
                      placeholder="34 ABC 1234"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Chip label="Adres Bilgileri" />
                </Divider>

                {/* İl ve İlçe */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <FormControl fullWidth>
                      <InputLabel>İl</InputLabel>
                      <Select
                        value={formData.cityId}
                        onChange={(e) =>
                          handleInputChange("cityId", e.target.value)
                        }
                        required
                      >
                        {cities.map((city) => (
                          <MenuItem key={city.id} value={city.id.toString()}>
                            {city.plateCode} - {city.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <FormControl fullWidth>
                      <InputLabel>İlçe</InputLabel>
                      <Select
                        value={formData.districtId}
                        onChange={(e) =>
                          handleInputChange("districtId", e.target.value)
                        }
                        disabled={!formData.cityId}
                        required
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
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Chip label="Detaylı Bilgi" />
                </Divider>

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
              </Paper>

              <Divider sx={{ my: 2 }}>
                <Chip label="Araç Özellikleri (Detay Bilgisi)" />
              </Divider>

              {/* Detay Bilgisi Checkboxları */}
              <Box>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Aracınızda Bulunan Özellikler
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 2,
                      mt: 2,
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
                </Paper>
              </Box>

              <Divider sx={{ my: 2 }}>
                <Chip label="Fotoğraflar" />
              </Divider>

              {/* Vitrin Fotoğrafı */}
              <Box>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Vitrin Fotoğrafı (Zorunlu)
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
                        sx={{ mr: 2 }}
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
                  </CardContent>
                </Card>
              </Box>

              {/* Diğer Fotoğraflar */}
              <Box>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Diğer Fotoğraflar (En fazla 15 adet)
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
                  </CardContent>
                </Card>
              </Box>

              {/* Submit Button */}
              <Box sx={{ textAlign: "center", mt: 4 }}>
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
              </Box>
            </Box>
          </form>
        </Paper>
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
