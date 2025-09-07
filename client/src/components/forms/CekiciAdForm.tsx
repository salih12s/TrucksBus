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
  photos: File[];
  showcasePhoto: File | null;

  // Özellikler
  features: {
    // Güvenlik
    abs: boolean;
    esp: boolean;
    asr: boolean;
    ebv: boolean;
    airBag: boolean;
    sideAirbag: boolean;
    passengerAirbag: boolean;
    centralLock: boolean;
    alarm: boolean;
    immobilizer: boolean;
    laneKeepAssist: boolean;
    cruiseControl: boolean;
    hillStartAssist: boolean;
    adr: boolean;
    retarder: boolean;
    pto: boolean;

    // Sensör & Aydınlatma
    headlightSensor: boolean;
    headlightWasher: boolean;
    rainSensor: boolean;
    xenonHeadlight: boolean;
    fogLight: boolean;

    // Konfor & İç Mekân
    airCondition: boolean;
    electricWindow: boolean;
    electricMirror: boolean;
    powerSteering: boolean;
    leatherSeat: boolean;
    heatedSeats: boolean;
    memorySeats: boolean;
    sunroof: boolean;
    alloyWheel: boolean;
    towHook: boolean;
    spoiler: boolean;
    windDeflector: boolean;
    table: boolean;
    flexibleReadingLight: boolean;

    // Multimedya & Sürüş Bilgi
    radio: boolean;
    cd: boolean;
    bluetooth: boolean;
    gps: boolean;
    tripComputer: boolean;

    // Park & Görüntüleme
    camera: boolean;
    parkingSensor: boolean;
  };
}

// Renk seçenekleri
const colorOptions = [
  "Beyaz",
  "Siyah",
  "Gri",
  "Gümüş",
  "Mavi",
  "Kırmızı",
  "Yeşil",
  "Sarı",
  "Turuncu",
  "Mor",
  "Kahverengi",
  "Altın",
  "Bronz",
  "Pembe",
  "Turkuaz",
  "Bordo",
  "Lacivert",
  "Bej",
];

// Motor gücü seçenekleri
const enginePowerOptions = [
  "100 hp ye kadar",
  "101 - 125 hp",
  "126 - 150 hp",
  "151 - 175 hp",
  "176 - 200 hp",
  "201 - 225 hp",
  "226 - 250 hp",
  "251 - 275 hp",
  "276 - 300 hp",
  "301 - 325 hp",
  "326 - 350 hp",
  "351 - 375 hp",
  "376 - 400 hp",
  "401 - 425 hp",
  "426 - 450 hp",
  "451 - 475 hp",
  "476 - 500 hp",
  "501 hp ve üzeri",
];

// Motor hacmi seçenekleri
const engineCapacityOptions = [
  "1300 cm3' e kadar",
  "1301 - 1600 cm3",
  "1601 - 1800 cm3",
  "1801 - 2000 cm3",
  "2001 - 2500 cm3",
  "2501 - 3000 cm3",
  "3001 - 3500 cm3",
  "3501 - 4000 cm3",
  "4001 - 4500 cm3",
  "4501 - 5000 cm3",
  "5001 cm3 ve üzeri",
];

// Kabin tipi seçenekleri
const cabinTypeOptions = ["Çift Kabin", "Yüksek", "Normal"];

const steps = [
  "Araç Bilgileri",
  "Teknik Özellikler",
  "Özellikler",
  "Fotoğraflar",
  "İletişim & Fiyat",
];

const CekiciAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

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
    photos: [],
    showcasePhoto: null,

    // Özellikler
    features: {
      // Güvenlik
      abs: false,
      esp: false,
      asr: false,
      ebv: false,
      airBag: false,
      sideAirbag: false,
      passengerAirbag: false,
      centralLock: false,
      alarm: false,
      immobilizer: false,
      laneKeepAssist: false,
      cruiseControl: false,
      hillStartAssist: false,
      adr: false,
      retarder: false,
      pto: false,

      // Sensör & Aydınlatma
      headlightSensor: false,
      headlightWasher: false,
      rainSensor: false,
      xenonHeadlight: false,
      fogLight: false,

      // Konfor & İç Mekân
      airCondition: false,
      electricWindow: false,
      electricMirror: false,
      powerSteering: false,
      leatherSeat: false,
      heatedSeats: false,
      memorySeats: false,
      sunroof: false,
      alloyWheel: false,
      towHook: false,
      spoiler: false,
      windDeflector: false,
      table: false,
      flexibleReadingLight: false,

      // Multimedya & Sürüş Bilgi
      radio: false,
      cd: false,
      bluetooth: false,
      gps: false,
      tripComputer: false,

      // Park & Görüntüleme
      camera: false,
      parkingSensor: false,
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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
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
          key !== "features" &&
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
                  onChange={(e) => handleInputChange("mileage", e.target.value)}
                  required
                />
              </Box>
            </Box>

            {/* Araç Durumu ve Renk */}
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
                    <MenuItem value="sifir">Sıfır</MenuItem>
                    <MenuItem value="ikinci-el">İkinci El</MenuItem>
                    <MenuItem value="hasarli">Hasarlı</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Renk</InputLabel>
                  <Select
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                  >
                    {colorOptions.map((color) => (
                      <MenuItem key={color} value={color.toLowerCase()}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Yakıt Tipi ve Vites */}
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
                    <MenuItem value="dizel">Dizel</MenuItem>
                    <MenuItem value="benzin">Benzin</MenuItem>
                    <MenuItem value="lpg">LPG</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
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
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Motor Gücü ve Motor Hacmi */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Motor Gücü</InputLabel>
                  <Select
                    value={formData.enginePower}
                    onChange={(e) =>
                      handleInputChange("enginePower", e.target.value)
                    }
                  >
                    {enginePowerOptions.map((power) => (
                      <MenuItem key={power} value={power}>
                        {power}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Motor Hacmi</InputLabel>
                  <Select
                    value={formData.engineCapacity}
                    onChange={(e) =>
                      handleInputChange("engineCapacity", e.target.value)
                    }
                  >
                    {engineCapacityOptions.map((capacity) => (
                      <MenuItem key={capacity} value={capacity}>
                        {capacity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Kabin Tipi ve Yatak Sayısı */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Kabin Tipi</InputLabel>
                  <Select
                    value={formData.cabinType}
                    onChange={(e) =>
                      handleInputChange("cabinType", e.target.value)
                    }
                  >
                    {cabinTypeOptions.map((cabin) => (
                      <MenuItem key={cabin} value={cabin.toLowerCase()}>
                        {cabin}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Yatak Sayısı</InputLabel>
                  <Select
                    value={formData.bedCount}
                    onChange={(e) =>
                      handleInputChange("bedCount", e.target.value)
                    }
                  >
                    <MenuItem value="yok">Yok</MenuItem>
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Dorse ve Plaka Tipi */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Dorse</InputLabel>
                  <Select
                    value={formData.dorseAvailable}
                    onChange={(e) =>
                      handleInputChange("dorseAvailable", e.target.value)
                    }
                  >
                    <MenuItem value="yok">Yok</MenuItem>
                    <MenuItem value="var">Var</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Plaka / Uyruk</InputLabel>
                  <Select
                    value={formData.plateType}
                    onChange={(e) =>
                      handleInputChange("plateType", e.target.value)
                    }
                  >
                    <MenuItem value="tr-plakali">Türk Plakası</MenuItem>
                    <MenuItem value="yabanci-plakali">Yabancı Plaka</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Plaka Numarası ve Lastik Durumu */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Lastik Durumu"
                  value={formData.tireCondition}
                  onChange={(e) =>
                    handleInputChange("tireCondition", e.target.value)
                  }
                  placeholder="Örn: %80 - 4 adet yeni"
                />
              </Box>
            </Box>

            {/* Hasar Kaydı, Boya Değişimi, Takas */}
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
                    <MenuItem value="hayir">Hayır</MenuItem>
                    <MenuItem value="evet">Evet</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Boya Değişimi</InputLabel>
                  <Select
                    value={formData.paintChange}
                    onChange={(e) =>
                      handleInputChange("paintChange", e.target.value)
                    }
                  >
                    <MenuItem value="hayir">Hayır</MenuItem>
                    <MenuItem value="evet">Evet</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <FormControl fullWidth>
                  <InputLabel>Takas</InputLabel>
                  <Select
                    value={formData.exchange}
                    onChange={(e) =>
                      handleInputChange("exchange", e.target.value)
                    }
                  >
                    <MenuItem value="olabilir">Olabilir</MenuItem>
                    <MenuItem value="olmaz">Olmaz</MenuItem>
                  </Select>
                </FormControl>
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
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Aracınızda Bulunan Özellikler
              </Typography>

              {/* Güvenlik Özellikleri */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, fontWeight: "bold" }}
              >
                Güvenlik
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.abs}
                      onChange={(e) =>
                        handleFeatureChange("abs", e.target.checked)
                      }
                    />
                  }
                  label="ABS"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.esp}
                      onChange={(e) =>
                        handleFeatureChange("esp", e.target.checked)
                      }
                    />
                  }
                  label="ESP"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.asr}
                      onChange={(e) =>
                        handleFeatureChange("asr", e.target.checked)
                      }
                    />
                  }
                  label="ASR (Çekiş Kontrol)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.ebv}
                      onChange={(e) =>
                        handleFeatureChange("ebv", e.target.checked)
                      }
                    />
                  }
                  label="EBV (Fren Gücü Dağıtımı)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.airBag}
                      onChange={(e) =>
                        handleFeatureChange("airBag", e.target.checked)
                      }
                    />
                  }
                  label="Hava Yastığı (Sürücü)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.sideAirbag}
                      onChange={(e) =>
                        handleFeatureChange("sideAirbag", e.target.checked)
                      }
                    />
                  }
                  label="Hava Yastığı (Yan)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.passengerAirbag}
                      onChange={(e) =>
                        handleFeatureChange("passengerAirbag", e.target.checked)
                      }
                    />
                  }
                  label="Hava Yastığı (Yolcu)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.centralLock}
                      onChange={(e) =>
                        handleFeatureChange("centralLock", e.target.checked)
                      }
                    />
                  }
                  label="Merkezi Kilit"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.alarm}
                      onChange={(e) =>
                        handleFeatureChange("alarm", e.target.checked)
                      }
                    />
                  }
                  label="Alarm"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.immobilizer}
                      onChange={(e) =>
                        handleFeatureChange("immobilizer", e.target.checked)
                      }
                    />
                  }
                  label="Immobilizer"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.laneKeepAssist}
                      onChange={(e) =>
                        handleFeatureChange("laneKeepAssist", e.target.checked)
                      }
                    />
                  }
                  label="Şerit Koruma Desteği"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.cruiseControl}
                      onChange={(e) =>
                        handleFeatureChange("cruiseControl", e.target.checked)
                      }
                    />
                  }
                  label="Hız Sabitleyici"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.hillStartAssist}
                      onChange={(e) =>
                        handleFeatureChange("hillStartAssist", e.target.checked)
                      }
                    />
                  }
                  label="Yokuş Kalkış Desteği"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.adr}
                      onChange={(e) =>
                        handleFeatureChange("adr", e.target.checked)
                      }
                    />
                  }
                  label="ADR"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.retarder}
                      onChange={(e) =>
                        handleFeatureChange("retarder", e.target.checked)
                      }
                    />
                  }
                  label="Retarder"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.pto}
                      onChange={(e) =>
                        handleFeatureChange("pto", e.target.checked)
                      }
                    />
                  }
                  label="PTO"
                />
              </Box>

              {/* Sensör & Aydınlatma */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 3, fontWeight: "bold" }}
              >
                Sensör & Aydınlatma
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.headlightSensor}
                      onChange={(e) =>
                        handleFeatureChange("headlightSensor", e.target.checked)
                      }
                    />
                  }
                  label="Far Sensörü"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.headlightWasher}
                      onChange={(e) =>
                        handleFeatureChange("headlightWasher", e.target.checked)
                      }
                    />
                  }
                  label="Far Yıkama Sistemi"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.rainSensor}
                      onChange={(e) =>
                        handleFeatureChange("rainSensor", e.target.checked)
                      }
                    />
                  }
                  label="Yağmur Sensörü"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.xenonHeadlight}
                      onChange={(e) =>
                        handleFeatureChange("xenonHeadlight", e.target.checked)
                      }
                    />
                  }
                  label="Xenon Far"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.fogLight}
                      onChange={(e) =>
                        handleFeatureChange("fogLight", e.target.checked)
                      }
                    />
                  }
                  label="Sis Farı"
                />
              </Box>

              {/* Konfor & İç Mekân */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 3, fontWeight: "bold" }}
              >
                Konfor & İç Mekân
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.airCondition}
                      onChange={(e) =>
                        handleFeatureChange("airCondition", e.target.checked)
                      }
                    />
                  }
                  label="Klima"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.electricWindow}
                      onChange={(e) =>
                        handleFeatureChange("electricWindow", e.target.checked)
                      }
                    />
                  }
                  label="Elektrikli Cam"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.electricMirror}
                      onChange={(e) =>
                        handleFeatureChange("electricMirror", e.target.checked)
                      }
                    />
                  }
                  label="Elektrikli Ayna"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.powerSteering}
                      onChange={(e) =>
                        handleFeatureChange("powerSteering", e.target.checked)
                      }
                    />
                  }
                  label="Hidrolik Direksiyon"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.leatherSeat}
                      onChange={(e) =>
                        handleFeatureChange("leatherSeat", e.target.checked)
                      }
                    />
                  }
                  label="Deri Döşeme"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.heatedSeats}
                      onChange={(e) =>
                        handleFeatureChange("heatedSeats", e.target.checked)
                      }
                    />
                  }
                  label="Isıtmalı Koltuklar"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.memorySeats}
                      onChange={(e) =>
                        handleFeatureChange("memorySeats", e.target.checked)
                      }
                    />
                  }
                  label="Hafızalı Koltuklar"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.sunroof}
                      onChange={(e) =>
                        handleFeatureChange("sunroof", e.target.checked)
                      }
                    />
                  }
                  label="Sunroof"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.alloyWheel}
                      onChange={(e) =>
                        handleFeatureChange("alloyWheel", e.target.checked)
                      }
                    />
                  }
                  label="Alaşım Jant"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.towHook}
                      onChange={(e) =>
                        handleFeatureChange("towHook", e.target.checked)
                      }
                    />
                  }
                  label="Çeki Demiri"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.spoiler}
                      onChange={(e) =>
                        handleFeatureChange("spoiler", e.target.checked)
                      }
                    />
                  }
                  label="Spoyler"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.windDeflector}
                      onChange={(e) =>
                        handleFeatureChange("windDeflector", e.target.checked)
                      }
                    />
                  }
                  label="Cam Rüzgarlığı"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.table}
                      onChange={(e) =>
                        handleFeatureChange("table", e.target.checked)
                      }
                    />
                  }
                  label="Masa"
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
                    />
                  }
                  label="Esnek Okuma Lambası"
                />
              </Box>

              {/* Multimedya & Sürüş Bilgi */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 3, fontWeight: "bold" }}
              >
                Multimedya & Sürüş Bilgi
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.radio}
                      onChange={(e) =>
                        handleFeatureChange("radio", e.target.checked)
                      }
                    />
                  }
                  label="Radio - Teyp"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.cd}
                      onChange={(e) =>
                        handleFeatureChange("cd", e.target.checked)
                      }
                    />
                  }
                  label="CD Çalar"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.bluetooth}
                      onChange={(e) =>
                        handleFeatureChange("bluetooth", e.target.checked)
                      }
                    />
                  }
                  label="Bluetooth"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.gps}
                      onChange={(e) =>
                        handleFeatureChange("gps", e.target.checked)
                      }
                    />
                  }
                  label="TV / Navigasyon"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.tripComputer}
                      onChange={(e) =>
                        handleFeatureChange("tripComputer", e.target.checked)
                      }
                    />
                  }
                  label="Yol Bilgisayarı"
                />
              </Box>

              {/* Park & Görüntüleme */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 3, fontWeight: "bold" }}
              >
                Park & Görüntüleme
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.camera}
                      onChange={(e) =>
                        handleFeatureChange("camera", e.target.checked)
                      }
                    />
                  }
                  label="Geri Görüş Kamerası"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.features.parkingSensor}
                      onChange={(e) =>
                        handleFeatureChange("parkingSensor", e.target.checked)
                      }
                    />
                  }
                  label="Park Sensörü"
                />
              </Box>
            </Paper>

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
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Vitrin Fotoğrafı */}
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Vitrin Fotoğrafı Seç
                  </Button>
                </label>
                {formData.showcasePhoto && (
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      src={URL.createObjectURL(formData.showcasePhoto)}
                      alt="Vitrin"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "150px",
                        objectFit: "cover",
                      }}
                    />
                    <Typography variant="caption" display="block">
                      {formData.showcasePhoto.name}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Diğer Fotoğraflar */}
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
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Fotoğraf Ekle
                  </Button>
                </label>

                {formData.photos.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {formData.photos.map((photo, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            minWidth: "24px",
                            bgcolor: "error.main",
                            color: "white",
                          }}
                        >
                          ×
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Alert severity="info">
              İlanınız admin onayından sonra yayınlanacaktır.
            </Alert>
            <Typography variant="h6">İlan Özeti</Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 2,
              }}
            >
              <Typography>
                <strong>Başlık:</strong> {formData.title}
              </Typography>
              <Typography>
                <strong>Yıl:</strong> {formData.year}
              </Typography>
              <Typography>
                <strong>Fiyat:</strong> {formData.price} TL
              </Typography>
              <Typography>
                <strong>KM:</strong> {formData.mileage}
              </Typography>
              <Typography>
                <strong>Yakıt:</strong> {formData.fuelType}
              </Typography>
              <Typography>
                <strong>Vites:</strong> {formData.transmission}
              </Typography>
            </Box>
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
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Çekici İlanı Ver
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Aracınızın detaylarını girerek profesyonel ilanınızı oluşturun
          </Typography>
        </Box>

        <Paper
          elevation={8}
          sx={{
            p: 5,
            mt: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            "& .MuiPaper-root": {
              background: "white",
            },
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
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
              >
                Geri
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.showcasePhoto}
                  size="large"
                >
                  {loading ? "İlan Yayınlanıyor..." : "İlanı Yayınla"}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained">
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

export default CekiciAdForm;
