import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  PhotoCamera,
  CheckCircle,
  DirectionsBus,
  Settings,
  LocationOn,
  Description,
} from "@mui/icons-material";
import { Header, Footer } from "../../layout";
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

interface FormData {
  title: string;
  description: string;
  year: string;
  price: string;
  mileage: string;
  engineVolume: string;
  maxPower: string;
  maxTorque: string;
  fuelType: string;
  platformLength: string;
  platformWidth: string;
  loadCapacity: string;
  plateNumber: string;
  exchange: string;
  cityId: string;
  districtId: string;
  address: string;
  detailedInfo: string;
  photos: File[];
  showcasePhoto: File | null;
  // Çekici Ekipmanı
  cekiciEkipmani: {
    kayarPlatform?: boolean;
    palet?: boolean;
    rampa?: boolean;
    makara?: boolean;
    vinc?: boolean;
    ahtapotVinc?: boolean;
    gozluk?: boolean;
    hiUp?: boolean;
  };
  // Ek Ekipmanlar
  ekEkipmanlar: {
    pistonAyak?: boolean;
    takoz?: boolean;
    sabitlemeHalati?: boolean;
  };
  // Detay Bilgisi alanları (ekler)
  detailFeatures: {
    hidrolikDireksiyon?: boolean;
    abs?: boolean;
    havaYastigi?: boolean;
    tepeLambasi?: boolean;
    takograf?: boolean;
    havaliFreni?: boolean;
    motorFreni?: boolean;
    alarm?: boolean;
    merkeziKilit?: boolean;
    gps?: boolean;
  };
}

const TekliAracForm: React.FC = () => {
  const navigate = useNavigate();

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
    engineVolume: "",
    maxPower: "",
    maxTorque: "",
    fuelType: "DIESEL",
    platformLength: "",
    platformWidth: "",
    loadCapacity: "",
    plateNumber: "",
    exchange: "hayir",
    cityId: "",
    districtId: "",
    address: "",
    detailedInfo: "",
    photos: [],
    showcasePhoto: null,
    cekiciEkipmani: {
      kayarPlatform: false,
      palet: false,
      rampa: false,
      makara: false,
      vinc: false,
      ahtapotVinc: false,
      gozluk: false,
      hiUp: false,
    },
    ekEkipmanlar: {
      pistonAyak: false,
      takoz: false,
      sabitlemeHalati: false,
    },
    detailFeatures: {
      hidrolikDireksiyon: false,
      abs: false,
      havaYastigi: false,
      tepeLambasi: false,
      takograf: false,
      havaliFreni: false,
      motorFreni: false,
      alarm: false,
      merkeziKilit: false,
      gps: false,
    },
  });

  // Seçenekler
  const uretimYillari = Array.from(
    { length: 2025 - 1990 + 1 },
    (_, i) => 2025 - i
  );

  const yakitTipleri = [
    { value: "GASOLINE", label: "Benzinli" },
    { value: "GASOLINE_LPG", label: "Benzinli + LPG" },
    { value: "DIESEL", label: "Dizel" },
    { value: "DIESEL_LPG", label: "Dizel + LPG" },
  ];

  const exchangeOptions = [
    { value: "evet", label: "Evet" },
    { value: "hayir", label: "Hayır" },
  ];

  // Şehir ve ilçe yükleme
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

  // Sayı formatlaması
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

  // Form işlevleri
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleDetailFeatureChange = (featureName: string) => {
    setFormData((prev) => ({
      ...prev,
      detailFeatures: {
        ...prev.detailFeatures,
        [featureName]:
          !prev.detailFeatures[featureName as keyof typeof prev.detailFeatures],
      },
    }));
  };

  const handleCekiciEkipmaniChange = (featureName: string) => {
    setFormData((prev) => ({
      ...prev,
      cekiciEkipmani: {
        ...prev.cekiciEkipmani,
        [featureName]:
          !prev.cekiciEkipmani[featureName as keyof typeof prev.cekiciEkipmani],
      },
    }));
  };

  const handleEkEkipmanChange = (featureName: string) => {
    setFormData((prev) => ({
      ...prev,
      ekEkipmanlar: {
        ...prev.ekEkipmanlar,
        [featureName]:
          !prev.ekEkipmanlar[featureName as keyof typeof prev.ekEkipmanlar],
      },
    }));
  };

  // Fotoğraf işlevleri
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
    // Önizlemeyi de kaldır
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const formatted = formatNumber(value);
    handleInputChange(name as keyof FormData, formatted);
  };

  // Form gönderimi
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
          key !== "cekiciEkipmani" &&
          key !== "ekEkipmanlar" &&
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

      // Detay özelliklerini JSON olarak ekle (backend "features" bekliyor)
      submitData.append("features", JSON.stringify(formData.detailFeatures));

      // Çekici ekipmanlarını JSON olarak ekle
      submitData.append(
        "cekiciEkipmani",
        JSON.stringify(formData.cekiciEkipmani)
      );

      // Ek ekipmanları JSON olarak ekle
      submitData.append("ekEkipmanlar", JSON.stringify(formData.ekEkipmanlar));

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post(
        "/ads/oto-kurtarici-tekli",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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

  if (submitSuccess) {
    return (
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Header />
        <Box sx={{ flex: 1, padding: 3 }}>
          <Dialog open={submitSuccess} onClose={handleSuccessClose}>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle color="success" />
                İlan Başarıyla Oluşturuldu!
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography>
                Tekli araç kurtarıcı ilanınız başarıyla oluşturuldu ve
                onaylanmak üzere yöneticilere gönderildi.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSuccessClose} variant="contained">
                Ana Sayfaya Dön
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box sx={{ flex: 1, padding: 3 }}>
        <Box
          sx={{
            maxWidth: "1200px",
            margin: "0 auto",
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ mb: 4, textAlign: "center" }}
          >
            Tekli Araç Kurtarıcı İlanı Oluştur
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Temel Bilgiler */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <DirectionsBus sx={{ mr: 1, verticalAlign: "middle" }} />
                  Temel Bilgiler
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="İlan Başlığı"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Açıklama"
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    multiline
                    rows={4}
                    required
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: 2,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Model Yılı</InputLabel>
                      <Select
                        name="year"
                        value={formData.year}
                        onChange={handleSelectChange}
                        required
                      >
                        {uretimYillari.map((yil) => (
                          <MenuItem key={yil} value={yil.toString()}>
                            {yil}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Fiyat (TL)"
                      name="price"
                      value={formData.price}
                      onChange={handleNumberChange}
                      placeholder="Örn: 850.000"
                      required
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Teknik Özellikler */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Settings sx={{ mr: 1, verticalAlign: "middle" }} />
                  Teknik Özellikler
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="KM"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleNumberChange}
                    placeholder="Örn: 150.000"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Motor Hacmi (cc)"
                    name="engineVolume"
                    value={formData.engineVolume}
                    onChange={(e) =>
                      handleInputChange("engineVolume", e.target.value)
                    }
                    placeholder="Örn: 2500"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Maksimum Güç (HP)"
                    name="maxPower"
                    value={formData.maxPower}
                    onChange={(e) =>
                      handleInputChange("maxPower", e.target.value)
                    }
                    placeholder="Örn: 150"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Maksimum Tork"
                    name="maxTorque"
                    value={formData.maxTorque}
                    onChange={(e) =>
                      handleInputChange("maxTorque", e.target.value)
                    }
                    placeholder="Örn: 350 Nm"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Yakıt Tipi</InputLabel>
                    <Select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleSelectChange}
                      required
                    >
                      {yakitTipleri.map((yakıt) => (
                        <MenuItem key={yakıt.value} value={yakıt.value}>
                          {yakıt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* Platform Özellikleri */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Platform Özellikleri
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Platform Uzunluğu (m)"
                    name="platformLength"
                    value={formData.platformLength}
                    onChange={(e) =>
                      handleInputChange("platformLength", e.target.value)
                    }
                    placeholder="Örn: 5.5"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Platform Genişliği (m)"
                    name="platformWidth"
                    value={formData.platformWidth}
                    onChange={(e) =>
                      handleInputChange("platformWidth", e.target.value)
                    }
                    placeholder="Örn: 2.3"
                    required
                  />

                  <TextField
                    fullWidth
                    label="İstiab Haddi (t)"
                    name="loadCapacity"
                    value={formData.loadCapacity}
                    onChange={(e) =>
                      handleInputChange("loadCapacity", e.target.value)
                    }
                    placeholder="Örn: 3.5"
                    required
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Araç Bilgileri */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Araç Bilgileri
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Araç Plakası"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      handleInputChange("plateNumber", e.target.value)
                    }
                    placeholder="Örn: 34 ABC 1234"
                    required
                  />

                  <FormControl fullWidth>
                    <InputLabel>Takaslı</InputLabel>
                    <Select
                      name="exchange"
                      value={formData.exchange}
                      onChange={handleSelectChange}
                      required
                    >
                      {exchangeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* Konum Bilgileri */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                  Adres Bilgileri
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 2,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Şehir</InputLabel>
                    <Select
                      name="cityId"
                      value={formData.cityId}
                      onChange={handleSelectChange}
                      required
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
                      name="districtId"
                      value={formData.districtId}
                      onChange={handleSelectChange}
                      required
                      disabled={!formData.cityId}
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
                  label="Detaylı Adres"
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                  placeholder="Mahalle, sokak, bina no vs."
                />
              </CardContent>
            </Card>

            {/* Çekici Ekipmanı */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Settings sx={{ mr: 1, verticalAlign: "middle" }} />
                  Çekici Ekipmanı
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.kayarPlatform || false}
                        onChange={() =>
                          handleCekiciEkipmaniChange("kayarPlatform")
                        }
                      />
                    }
                    label="Kayar Platform"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.palet || false}
                        onChange={() => handleCekiciEkipmaniChange("palet")}
                      />
                    }
                    label="Palet"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.rampa || false}
                        onChange={() => handleCekiciEkipmaniChange("rampa")}
                      />
                    }
                    label="Rampa"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.makara || false}
                        onChange={() => handleCekiciEkipmaniChange("makara")}
                      />
                    }
                    label="Makara"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.vinc || false}
                        onChange={() => handleCekiciEkipmaniChange("vinc")}
                      />
                    }
                    label="Vinç"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.ahtapotVinc || false}
                        onChange={() =>
                          handleCekiciEkipmaniChange("ahtapotVinc")
                        }
                      />
                    }
                    label="Ahtapot Vinç"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.gozluk || false}
                        onChange={() => handleCekiciEkipmaniChange("gozluk")}
                      />
                    }
                    label="Gözlük"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cekiciEkipmani.hiUp || false}
                        onChange={() => handleCekiciEkipmaniChange("hiUp")}
                      />
                    }
                    label="Hi-Up"
                  />
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Ek Ekipmanlar
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.ekEkipmanlar.pistonAyak || false}
                        onChange={() => handleEkEkipmanChange("pistonAyak")}
                      />
                    }
                    label="Piston Ayak"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.ekEkipmanlar.takoz || false}
                        onChange={() => handleEkEkipmanChange("takoz")}
                      />
                    }
                    label="Takoz"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.ekEkipmanlar.sabitlemeHalati || false}
                        onChange={() =>
                          handleEkEkipmanChange("sabitlemeHalati")
                        }
                      />
                    }
                    label="Sabitleme Halatı"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Detaylı Bilgi */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Description sx={{ mr: 1, verticalAlign: "middle" }} />
                  Detaylı Bilgi
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Çekici Ekipmanı
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.detailFeatures.hidrolikDireksiyon || false
                          }
                          onChange={() =>
                            handleDetailFeatureChange("hidrolikDireksiyon")
                          }
                        />
                      }
                      label="Hidrolik Direksiyon"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.abs || false}
                          onChange={() => handleDetailFeatureChange("abs")}
                        />
                      }
                      label="ABS"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.havaYastigi || false}
                          onChange={() =>
                            handleDetailFeatureChange("havaYastigi")
                          }
                        />
                      }
                      label="Hava Yastığı"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.tepeLambasi || false}
                          onChange={() =>
                            handleDetailFeatureChange("tepeLambasi")
                          }
                        />
                      }
                      label="Tepe Lambası"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Araç Donanımları
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.takograf || false}
                          onChange={() => handleDetailFeatureChange("takograf")}
                        />
                      }
                      label="Takograf"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.havaliFreni || false}
                          onChange={() =>
                            handleDetailFeatureChange("havaliFreni")
                          }
                        />
                      }
                      label="Havalı Freni"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.motorFreni || false}
                          onChange={() =>
                            handleDetailFeatureChange("motorFreni")
                          }
                        />
                      }
                      label="Motor Freni"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.alarm || false}
                          onChange={() => handleDetailFeatureChange("alarm")}
                        />
                      }
                      label="Alarm"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.detailFeatures.merkeziKilit || false
                          }
                          onChange={() =>
                            handleDetailFeatureChange("merkeziKilit")
                          }
                        />
                      }
                      label="Merkezi Kilit"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.detailFeatures.gps || false}
                          onChange={() => handleDetailFeatureChange("gps")}
                        />
                      }
                      label="GPS"
                    />
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  label="Detaylı Bilgi"
                  name="detailedInfo"
                  value={formData.detailedInfo}
                  onChange={(e) =>
                    handleInputChange("detailedInfo", e.target.value)
                  }
                  multiline
                  rows={4}
                  placeholder="Aracınız hakkında detaylı bilgi verebilirsiniz..."
                />
              </CardContent>
            </Card>

            {/* Fotoğraflar */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PhotoCamera sx={{ mr: 1, verticalAlign: "middle" }} />
                  Fotoğraflar
                </Typography>

                {/* Vitrin Fotoğrafı */}
                <Card
                  variant="outlined"
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                    border: "2px dashed #ff9800",
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
                    Ana fotoğraf olarak kullanılacak en iyi fotoğrafınızı seçin
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
                          <Typography sx={{ color: "white", fontSize: "14px" }}>
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
                    Aracınızın farklı açılardan fotoğraflarını ekleyin (En fazla
                    15 adet)
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
                    </Box>
                  )}
                </Card>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default TekliAracForm;
