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
    xenonFar?: boolean;
    yanHavaYastigi?: boolean;
    yokusKalkisDestegi?: boolean;
    yolBilgisayari?: boolean;
    sogutucuFrigo?: boolean;
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
      xenonFar: false,
      yanHavaYastigi: false,
      yokusKalkisDestegi: false,
      yolBilgisayari: false,
      sogutucuFrigo: false,
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
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Minibüs & Midibüs İlanı Ver
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* İlan Başlığı */}
              <Box>
                <TextField
                  fullWidth
                  label="İlan Başlığı"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
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
                />
              </Box>

              {/* Yıl, Fiyat, KM */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Yıl"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    required
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Fiyat (TL)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
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
                      <MenuItem value="tr-plakali">Türkiye TR Plakalı</MenuItem>
                      <MenuItem value="mavi-plakali">Mavi MA Plakalı</MenuItem>
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
                          {city.name}
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

              <Divider sx={{ my: 2 }}>
                <Chip label="Araç Özellikleri (Detay Bilgisi)" />
              </Divider>

              {/* Detay Bilgisi Checkboxları */}
              <Box>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Aracınızda Bulunan Özellikler
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {/* ABS */}
                    <Box sx={{ minWidth: 200 }}>
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
                          />
                        }
                        label="ABS"
                      />
                    </Box>

                    {/* Alarm */}
                    <Box sx={{ minWidth: 200 }}>
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
                          />
                        }
                        label="Alarm"
                      />
                    </Box>

                    {/* Alaşım Jant */}
                    <Box sx={{ minWidth: 200 }}>
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
                          />
                        }
                        label="Alaşım Jant"
                      />
                    </Box>

                    {/* ASR */}
                    <Box sx={{ minWidth: 200 }}>
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
                          />
                        }
                        label="ASR"
                      />
                    </Box>

                    {/* CD Çalar */}
                    <Box sx={{ minWidth: 200 }}>
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
                          />
                        }
                        label="CD Çalar"
                      />
                    </Box>

                    {/* Çeki Demiri */}
                    <Box sx={{ minWidth: 200 }}>
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
                          />
                        }
                        label="Çeki Demiri"
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
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.showcasePhoto}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? "İlan Yayınlanıyor..." : "İlanı Yayınla"}
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
