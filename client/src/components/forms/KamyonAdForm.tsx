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

// Vites sayısı seçenekleri
const gearCountOptions = ["6+1", "8+1", "12+1", "16+1", "Otomatik", "Diğer"];

// Süspansiyon seçenekleri
const suspensionOptions = ["Yaprak", "Hava", "Parabolik"];

// Araç tipi seçenekleri
const vehicleTypeOptions = [
  "Damperli",
  "Tenteli",
  "Açık Kasa",
  "Kapalı Kasa",
  "Tanker",
  "Çimento Mikseri",
  "Vinç",
  "Çöp Aracı",
  "İtfaiye",
  "Ambulans",
  "Kargo",
  "Nakliye",
];

// Kasa boyutu seçenekleri
const kasaSizeOptions = [
  "3-4 m",
  "4-5 m",
  "5-6 m",
  "6-7 m",
  "7-8 m",
  "8-9 m",
  "9-10 m",
  "10+ m",
];

// Araç durumu seçenekleri
const conditionOptions = ["Sıfır", "Sıfır Ayarında", "İkinci El", "Hasarlı"];

// Yakıt tipi seçenekleri
const fuelTypeOptions = ["Dizel", "Benzin", "LPG", "Elektrik", "Hibrit"];

// Çekiş seçenekleri
const drivetrainOptions = [
  "4x2",
  "4x4",
  "6x2",
  "6x4",
  "8x2",
  "8x4",
  "8x6",
  "8x8",
];

interface FormData {
  title: string;
  description: string;
  year: string;
  price: string;
  mileage: string;
  condition: string;
  engineVolume: string;
  motorPower: string;
  drivetrain: string;
  color: string;
  vehicleType: string;
  kasaSize: string;
  gearCount: string;
  suspension: string;
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
  // Detay özellikleri
  detailFeatures: {
    abs?: boolean;
    asr?: boolean;
    esp?: boolean;
    ebs?: boolean;
    klima?: boolean;
    airCondition?: boolean;
    webasto?: boolean;
    buzdolabi?: boolean;
    radyoTeyp?: boolean;
    cdCalar?: boolean;
    navigasyon?: boolean;
    bluetooth?: boolean;
    geriGorusKamerasi?: boolean;
    korna?: boolean;
    alarm?: boolean;
    immobilizer?: boolean;
    merkeziKilit?: boolean;
    elektrikliCam?: boolean;
    elektrikliAyna?: boolean;
    hidrolikDireksiyon?: boolean;
    tempomat?: boolean;
    retarder?: boolean;
    diferansielKilidi?: boolean;
    yakit?: boolean;
    adBlue?: boolean;
    yakitTankHacmi?: boolean;
    lastikEbadi?: boolean;
    jantTipi?: boolean;
    alasimJant?: boolean;
    celikJant?: boolean;
    farTipi?: boolean;
    xenonFar?: boolean;
    ledFar?: boolean;
    sisLambasi?: boolean;
    strobon?: boolean;
    takograf?: boolean;
    frenTipi?: boolean;
    diskFren?: boolean;
    tambur?: boolean;
    motorFreni?: boolean;
  };
}

const steps = [
  "Temel Bilgiler",
  "Araç Detayları",
  "Detay Özellikleri",
  "Fotoğraflar",
];

const KamyonAdForm: React.FC = () => {
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
    motorPower: "",
    drivetrain: "4x2",
    color: "",
    vehicleType: "",
    kasaSize: "",
    gearCount: "",
    suspension: "yaprak",
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
      asr: false,
      esp: false,
      ebs: false,
      klima: false,
      airCondition: false,
      webasto: false,
      buzdolabi: false,
      radyoTeyp: false,
      cdCalar: false,
      navigasyon: false,
      bluetooth: false,
      geriGorusKamerasi: false,
      korna: false,
      alarm: false,
      immobilizer: false,
      merkeziKilit: false,
      elektrikliCam: false,
      elektrikliAyna: false,
      hidrolikDireksiyon: false,
      tempomat: false,
      retarder: false,
      diferansielKilidi: false,
      yakit: false,
      adBlue: false,
      yakitTankHacmi: false,
      lastikEbadi: false,
      jantTipi: false,
      alasimJant: false,
      celikJant: false,
      farTipi: false,
      xenonFar: false,
      ledFar: false,
      sisLambasi: false,
      strobon: false,
      takograf: false,
      frenTipi: false,
      diskFren: false,
      tambur: false,
      motorFreni: false,
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
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
                  sx={{ borderRadius: 2 }}
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
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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

            {/* Motor Gücü ve Çekiş */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Motor Gücü</InputLabel>
                  <Select
                    value={formData.motorPower}
                    onChange={(e) =>
                      handleInputChange("motorPower", e.target.value)
                    }
                  >
                    {motorPowerOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Çekiş</InputLabel>
                  <Select
                    value={formData.drivetrain}
                    onChange={(e) =>
                      handleInputChange("drivetrain", e.target.value)
                    }
                  >
                    {drivetrainOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Renk ve Araç Tipi */}
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
                <FormControl fullWidth>
                  <InputLabel>Araç Tipi</InputLabel>
                  <Select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      handleInputChange("vehicleType", e.target.value)
                    }
                  >
                    {vehicleTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Kasa Boyutu, Vites Sayısı, Süspansiyon */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Kasa Boyutu</InputLabel>
                  <Select
                    value={formData.kasaSize}
                    onChange={(e) =>
                      handleInputChange("kasaSize", e.target.value)
                    }
                  >
                    {kasaSizeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
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

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Süspansiyon</InputLabel>
                  <Select
                    value={formData.suspension}
                    onChange={(e) =>
                      handleInputChange("suspension", e.target.value)
                    }
                  >
                    {suspensionOptions.map((option) => (
                      <MenuItem key={option} value={option.toLowerCase()}>
                        {option}
                      </MenuItem>
                    ))}
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
                    {fuelTypeOptions.map((option) => (
                      <MenuItem key={option} value={option.toLowerCase()}>
                        {option}
                      </MenuItem>
                    ))}
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
              placeholder="Aracınız hakkında detaylı bilgi verebilirsiniz..."
              sx={{ borderRadius: 2 }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aracınızda Bulunan Özellikler
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 2,
                  mt: 2,
                }}
              >
                {/* Güvenlik Özellikleri */}
                {[
                  { key: "abs", label: "ABS" },
                  { key: "asr", label: "ASR" },
                  { key: "esp", label: "ESP" },
                  { key: "ebs", label: "EBS" },
                  { key: "alarm", label: "Alarm" },
                  { key: "immobilizer", label: "Immobilizer" },
                  { key: "merkeziKilit", label: "Merkezi Kilit" },
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
                  { key: "airCondition", label: "Air Condition" },
                  { key: "webasto", label: "Webasto" },
                  { key: "buzdolabi", label: "Buzdolabı" },
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
                  { key: "radyoTeyp", label: "Radyo Teyp" },
                  { key: "cdCalar", label: "CD Çalar" },
                  { key: "navigasyon", label: "Navigasyon" },
                  { key: "bluetooth", label: "Bluetooth" },
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

                {/* Teknik Özellikler */}
                {[
                  { key: "retarder", label: "Retarder" },
                  { key: "diferansielKilidi", label: "Diferansiyel Kilidi" },
                  { key: "takograf", label: "Takograf" },
                  { key: "adBlue", label: "AdBlue" },
                  { key: "diskFren", label: "Disk Fren" },
                  { key: "tambur", label: "Tambur" },
                  { key: "motorFreni", label: "Motor Freni" },
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
                  { key: "alasimJant", label: "Alaşım Jant" },
                  { key: "celikJant", label: "Çelik Jant" },
                  { key: "xenonFar", label: "Xenon Far" },
                  { key: "ledFar", label: "LED Far" },
                  { key: "sisLambasi", label: "Sis Lambası" },
                  { key: "strobon", label: "Strobon" },
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

      case 3:
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
              background: "linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Kamyon İlanı Ver
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Kamyonunuzun detaylarını girerek profesyonel ilanınızı oluşturun
          </Typography>
        </Box>

        <Paper
          elevation={8}
          sx={{
            p: 4,
            mt: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #fff8f0 0%, #ffe8d6 100%)",
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
                      "linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #E55A2B 30%, #E0841A 90%)",
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
                      "linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #E55A2B 30%, #E0841A 90%)",
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

export default KamyonAdForm;
