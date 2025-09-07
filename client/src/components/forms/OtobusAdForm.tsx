import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Paper,
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
  Stepper,
  Step,
  StepLabel,
  Slider,
} from "@mui/material";
import { CheckCircle, CloudUpload, PhotoCamera } from "@mui/icons-material";
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

// Koltuk düzeni seçenekleri
const seatLayoutOptions = ["2+1", "2+2"];

// Koltuk arkası ekran seçenekleri
const screenOptions = ["Yok", "7", "9", "10"];

// Vites sayısı seçenekleri
const gearCountOptions = ["6+1", "8+1", "12+1", "Diğer"];

// Araç durumu seçenekleri
const conditionOptions = ["Sıfır", "Sıfır Ayarında", "İkinci El", "Hasarlı"];

// Yakıt tipi seçenekleri
const fuelTypeOptions = ["Dizel", "Benzin", "LPG", "Elektrik", "Hibrit"];

// Vites tipi seçenekleri
const transmissionOptions = ["Manuel", "Otomatik", "Yarı Otomatik"];

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
  warranty: string;
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
    alarm?: boolean;
    immobilizer?: boolean;
    merkeziKilit?: boolean;
    elektrikliCam?: boolean;
    elektrikliAyna?: boolean;
    hidrolikDireksiyon?: boolean;
    tempomat?: boolean;
    esp?: boolean;
    parkSensoru?: boolean;
    geriGorusKamerasi?: boolean;
    navigasyon?: boolean;
    bluetooth?: boolean;
    radyoTeyp?: boolean;
    cdCalar?: boolean;
    dvdPlayer?: boolean;
    xenonFar?: boolean;
    ledFar?: boolean;
    sisLambasi?: boolean;
    alasimJant?: boolean;
    celikJant?: boolean;
  };
}

const steps = [
  "Araç Bilgileri",
  "Teknik Özellikler",
  "Konfor & Güvenlik",
  "Fotoğraflar",
  "İletişim & Fiyat",
];

const OtobusAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [activeStep, setActiveStep] = useState(0);
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
    warranty: "hayir",
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
      alarm: false,
      immobilizer: false,
      merkeziKilit: false,
      elektrikliCam: false,
      elektrikliAyna: false,
      hidrolikDireksiyon: false,
      tempomat: false,
      esp: false,
      parkSensoru: false,
      geriGorusKamerasi: false,
      navigasyon: false,
      bluetooth: false,
      radyoTeyp: false,
      cdCalar: false,
      dvdPlayer: false,
      xenonFar: false,
      ledFar: false,
      sisLambasi: false,
      alasimJant: false,
      celikJant: false,
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

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
          value !== null &&
          value !== undefined
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
    navigate("/dashboard");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Araç Bilgileri
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* İlan Başlığı */}
            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              sx={{ borderRadius: 2 }}
            />

            {/* Açıklama */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              sx={{ borderRadius: 2 }}
            />

            {/* Yıl, KM */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TextField
                  fullWidth
                  label="Yıl"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  required
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <TextField
                  fullWidth
                  label="KM"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange("mileage", e.target.value)}
                  required
                  sx={{ borderRadius: 2 }}
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
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Motor Hacmi (cm³)"
                  type="number"
                  value={formData.engineVolume}
                  onChange={(e) =>
                    handleInputChange("engineVolume", e.target.value)
                  }
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Box>

            {/* Renk ve Yolcu Kapasitesi */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Renk</InputLabel>
                  <Select
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                  >
                    {colorOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Yolcu Kapasitesi"
                  type="number"
                  value={formData.passengerCapacity}
                  onChange={(e) =>
                    handleInputChange("passengerCapacity", e.target.value)
                  }
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Box>
          </Box>
        );

      case 1: // Teknik Özellikler
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Koltuk Düzeni ve Koltuk Arkası Ekran */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Koltuk Düzeni</InputLabel>
                  <Select
                    value={formData.seatLayout}
                    onChange={(e) =>
                      handleInputChange("seatLayout", e.target.value)
                    }
                  >
                    {seatLayoutOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Koltuk Arkası Ekran</InputLabel>
                  <Select
                    value={formData.seatBackScreen}
                    onChange={(e) =>
                      handleInputChange("seatBackScreen", e.target.value)
                    }
                  >
                    {screenOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Vites Tipi ve Vites Sayısı */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Vites</InputLabel>
                  <Select
                    value={formData.transmission}
                    onChange={(e) =>
                      handleInputChange("transmission", e.target.value)
                    }
                  >
                    {transmissionOptions.map((option) => (
                      <MenuItem key={option} value={option.toLowerCase()}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Vites Sayısı</InputLabel>
                  <Select
                    value={formData.gearCount}
                    onChange={(e) =>
                      handleInputChange("gearCount", e.target.value)
                    }
                  >
                    {gearCountOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Yakıt Tipi ve Yakıt Hacmi */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Yakıt Tipi</InputLabel>
                  <Select
                    value={formData.fuelType}
                    onChange={(e) =>
                      handleInputChange("fuelType", e.target.value)
                    }
                  >
                    {fuelTypeOptions.map((option) => (
                      <MenuItem key={option} value={option.toLowerCase()}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Yakıt Hacmi (Litre)"
                  type="number"
                  value={formData.fuelCapacity}
                  onChange={(e) =>
                    handleInputChange("fuelCapacity", e.target.value)
                  }
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Box>

            {/* Lastik Durumu Slider */}
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>
                Lastik Durumu: %{formData.tireCondition}
              </Typography>
              <Slider
                value={formData.tireCondition}
                onChange={(_, newValue) =>
                  handleInputChange("tireCondition", newValue as number)
                }
                aria-labelledby="tire-condition-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
                sx={{ color: "primary.main" }}
              />
            </Box>

            {/* Durumlar */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Hasar Kaydı</InputLabel>
                  <Select
                    value={formData.damageRecord}
                    onChange={(e) =>
                      handleInputChange("damageRecord", e.target.value)
                    }
                  >
                    <MenuItem value="evet">Evet</MenuItem>
                    <MenuItem value="hayir">Hayır</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Boyalı</InputLabel>
                  <Select
                    value={formData.paintChange}
                    onChange={(e) =>
                      handleInputChange("paintChange", e.target.value)
                    }
                  >
                    <MenuItem value="evet">Evet</MenuItem>
                    <MenuItem value="hayir">Hayır</MenuItem>
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

            {/* Garanti */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Garanti</InputLabel>
                  <Select
                    value={formData.warranty}
                    onChange={(e) =>
                      handleInputChange("warranty", e.target.value)
                    }
                  >
                    <MenuItem value="evet">Evet</MenuItem>
                    <MenuItem value="hayir">Hayır</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        );

      case 2: // Konfor & Güvenlik
        return (
          <Box>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Otobüsünüzde Bulunan Özellikler
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minWidth(220px, 1fr))",
                  gap: 2,
                  mt: 2,
                }}
              >
                {/* Otobüs Özel Özellikleri */}
                {[
                  { key: "threeG", label: "3G" },
                  { key: "aracTelefonu", label: "Araç Telefonu" },
                  { key: "buzdolabi", label: "Buzdolabı" },
                  { key: "isitmalSurucuCami", label: "Isıtmalı Sürücü Camı" },
                  { key: "kisiselSesSistemi", label: "Kişisel Ses Sistemi" },
                  { key: "mutfak", label: "Mutfak" },
                  { key: "surucuKabini", label: "Sürücü Kabini" },
                  { key: "televizyon", label: "Televizyon" },
                  { key: "tuvalet", label: "Tuvalet" },
                  { key: "uydu", label: "Uydu" },
                  { key: "wifi", label: "Wi-fi" },
                ].map((feature) => (
                  <Box key={feature.key}>
                    <FormControlLabel
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
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label={feature.label}
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}

                {/* Güvenlik Özellikleri */}
                {[
                  { key: "abs", label: "ABS" },
                  { key: "asr", label: "ASR" },
                  { key: "esp", label: "ESP" },
                  { key: "retarder", label: "Retarder" },
                  { key: "alarm", label: "Alarm" },
                  { key: "immobilizer", label: "Immobilizer" },
                  { key: "merkeziKilit", label: "Merkezi Kilit" },
                  { key: "parkSensoru", label: "Park Sensörü" },
                  { key: "geriGorusKamerasi", label: "Geri Görüş Kamerası" },
                ].map((feature) => (
                  <Box key={feature.key}>
                    <FormControlLabel
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
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label={feature.label}
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}

                {/* Konfor Özellikleri */}
                {[
                  { key: "klima", label: "Klima" },
                  { key: "elektrikliCam", label: "Elektrikli Cam" },
                  { key: "elektrikliAyna", label: "Elektrikli Ayna" },
                  { key: "hidrolikDireksiyon", label: "Hidrolik Direksiyon" },
                  { key: "tempomat", label: "Tempomat" },
                ].map((feature) => (
                  <Box key={feature.key}>
                    <FormControlLabel
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
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label={feature.label}
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}

                {/* Multimedya Özellikleri */}
                {[
                  { key: "navigasyon", label: "Navigasyon" },
                  { key: "bluetooth", label: "Bluetooth" },
                  { key: "radyoTeyp", label: "Radyo Teyp" },
                  { key: "cdCalar", label: "CD Çalar" },
                  { key: "dvdPlayer", label: "DVD Player" },
                ].map((feature) => (
                  <Box key={feature.key}>
                    <FormControlLabel
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
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label={feature.label}
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}

                {/* Dış Donanım */}
                {[
                  { key: "xenonFar", label: "Xenon Far" },
                  { key: "ledFar", label: "LED Far" },
                  { key: "sisLambasi", label: "Sis Lambası" },
                  { key: "alasimJant", label: "Alaşım Jant" },
                  { key: "celikJant", label: "Çelik Jant" },
                ].map((feature) => (
                  <Box key={feature.key}>
                    <FormControlLabel
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
                          sx={{ color: "primary.main" }}
                        />
                      }
                      label={feature.label}
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        );

      case 3: // Fotoğraflar
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Vitrin Fotoğrafı */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Vitrin Fotoğrafı *
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
                    sx={{ mb: 2 }}
                  >
                    Vitrin Fotoğrafı Seç
                  </Button>
                </label>
                {formData.showcasePhoto && (
                  <Typography variant="body2" color="success.main">
                    ✓ {formData.showcasePhoto.name}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Diğer Fotoğraflar */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
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
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Fotoğraf Ekle
                  </Button>
                </label>

                {formData.photos.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Yüklenen Fotoğraflar ({formData.photos.length}/15):
                    </Typography>
                    {formData.photos.map((photo, index) => (
                      <Box
                        key={index}
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {photo.name}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removePhoto(index)}
                        >
                          Sil
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 4: // İletişim & Fiyat
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Fiyat */}
            <TextField
              fullWidth
              label="Fiyat (TL)"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              required
              sx={{ borderRadius: 2 }}
            />

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
                    <MenuItem value="tr-plakali">TR Plakalı</MenuItem>
                    <MenuItem value="yabanci-plakali">Yabancı Plakalı</MenuItem>
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
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            </Box>

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
              placeholder="Otobüsünüz hakkında detaylı bilgi verebilirsiniz..."
              sx={{ borderRadius: 2 }}
            />
          </Box>
        );

      default:
        return null;
    }
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
              background: "linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Otobüs İlanı Ver
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Otobüsünüzün detaylarını girerek profesyonel ilanınızı oluşturun
          </Typography>
        </Box>

        <Paper
          elevation={8}
          sx={{
            p: 4,
            mt: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)",
          }}
        >
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                size="large"
              >
                Geri
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.showcasePhoto}
                  sx={{
                    minWidth: 200,
                    background:
                      "linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #8E24AA 30%, #D81B60 90%)",
                    },
                  }}
                >
                  {loading ? "İlan Yayınlanıyor..." : "İlanı Yayınla"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  size="large"
                  sx={{
                    background:
                      "linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #8E24AA 30%, #D81B60 90%)",
                    },
                  }}
                >
                  İleri
                </Button>
              )}
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

export default OtobusAdForm;
