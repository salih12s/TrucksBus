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
  IconButton,
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
  Delete as DeleteIcon,
  CheckCircle,
  DirectionsBus,
  Settings,
  LocationOn,
  Description,
  Groups,
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
  maxVehicleCapacity: string;
  loadCapacity: string;
  plateNumber: string;
  exchange: string;
  cityId: string;
  districtId: string;
  address: string;
  detailedInfo: string;
  photos: File[];
  showcasePhoto: File | null;
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
    vinc?: boolean;
    kaldirmaPlatformu?: boolean;
    hidrolikSistem?: boolean;
    uzaktanKumanda?: boolean;
  };
}

const CokluAracForm: React.FC = () => {
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
    fuelType: "dizel",
    platformLength: "",
    platformWidth: "",
    maxVehicleCapacity: "",
    loadCapacity: "",
    plateNumber: "",
    exchange: "hayir",
    cityId: "",
    districtId: "",
    address: "",
    detailedInfo: "",
    photos: [],
    showcasePhoto: null,
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
      vinc: false,
      kaldirmaPlatformu: false,
      hidrolikSistem: false,
      uzaktanKumanda: false,
    },
  });

  // Seçenekler
  const uretimYillari = Array.from(
    { length: 2025 - 1990 + 1 },
    (_, i) => 2025 - i
  );

  const yakitTipleri = [
    { value: "benzin", label: "Benzinli" },
    { value: "benzin-lpg", label: "Benzinli + LPG" },
    { value: "dizel", label: "Dizel" },
    { value: "dizel-lpg", label: "Dizel + LPG" },
  ];

  const exchangeOptions = [
    { value: "evet", label: "Evet" },
    { value: "hayir", label: "Hayır" },
  ];

  // Şehir ve ilçe yükleme
  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (formData.cityId) {
      loadDistricts(parseInt(formData.cityId));
    }
  }, [formData.cityId]);

  const loadCities = async () => {
    try {
      const response = await apiClient.get("/cities");
      setCities(response.data as City[]);
    } catch (error) {
      console.error("Şehirler yüklenirken hata:", error);
    }
  };

  const loadDistricts = async (cityId: number) => {
    try {
      const response = await apiClient.get(`/districts/${cityId}`);
      setDistricts(response.data as District[]);
    } catch (error) {
      console.error("İlçeler yüklenirken hata:", error);
    }
  };

  // Form işlevleri
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  // Fotoğraf işlevleri
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));

      // Preview'lar oluştur
      newPhotos.forEach((photo) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotoPreviews((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(photo);
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const setShowcasePhoto = (photo: File, index: number) => {
    setFormData((prev) => ({
      ...prev,
      showcasePhoto: photo,
    }));
    setShowcasePreview(photoPreviews[index]);
  };

  // Sayı formatlaması
  const formatNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseFormattedNumber = (formatted: string) => {
    return formatted.replace(/\./g, "");
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const formatted = formatNumber(value);
    setFormData((prev) => ({
      ...prev,
      [name]: formatted,
    }));
  };

  // Form gönderimi
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

      // Detay özelliklerini JSON olarak ekle
      submitData.append("features", JSON.stringify(formData.detailFeatures));

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/oto-kurtarici", submitData, {
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
                Çoklu araç kurtarıcı ilanınız başarıyla oluşturuldu ve
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
            Çoklu Araç Kurtarıcı İlanı Oluştur
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
                    onChange={handleInputChange}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Açıklama"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
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
                      placeholder="Örn: 2.500.000"
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
                    onChange={handleInputChange}
                    placeholder="Örn: 2500"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Maksimum Güç (HP)"
                    name="maxPower"
                    value={formData.maxPower}
                    onChange={handleInputChange}
                    placeholder="Örn: 150"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Maksimum Tork"
                    name="maxTorque"
                    value={formData.maxTorque}
                    onChange={handleInputChange}
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
                  <Groups sx={{ mr: 1, verticalAlign: "middle" }} />
                  Platform Özellikleri (Çoklu Araç)
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
                    onChange={handleInputChange}
                    placeholder="Örn: 12.5"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Platform Genişliği (m)"
                    name="platformWidth"
                    value={formData.platformWidth}
                    onChange={handleInputChange}
                    placeholder="Örn: 2.5"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Maksimum Araç Kapasitesi"
                    name="maxVehicleCapacity"
                    value={formData.maxVehicleCapacity}
                    onChange={handleInputChange}
                    placeholder="Örn: 5 araç"
                    required
                  />

                  <TextField
                    fullWidth
                    label="İstiab Haddi (t)"
                    name="loadCapacity"
                    value={formData.loadCapacity}
                    onChange={handleInputChange}
                    placeholder="Örn: 15"
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
                    onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                  placeholder="Mahalle, sokak, bina no vs."
                />
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
                    Kurtarıcı Ekipmanı
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
                          checked={formData.detailFeatures.vinc || false}
                          onChange={() => handleDetailFeatureChange("vinc")}
                        />
                      }
                      label="Vinç"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.detailFeatures.kaldirmaPlatformu || false
                          }
                          onChange={() =>
                            handleDetailFeatureChange("kaldirmaPlatformu")
                          }
                        />
                      }
                      label="Kaldırma Platformu"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.detailFeatures.hidrolikSistem || false
                          }
                          onChange={() =>
                            handleDetailFeatureChange("hidrolikSistem")
                          }
                        />
                      }
                      label="Hidrolik Sistem"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.detailFeatures.uzaktanKumanda || false
                          }
                          onChange={() =>
                            handleDetailFeatureChange("uzaktanKumanda")
                          }
                        />
                      }
                      label="Uzaktan Kumanda"
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
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  placeholder="Çoklu araç kurtarıcınız hakkında detaylı bilgi verebilirsiniz..."
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

                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="photo-upload"
                    multiple
                    type="file"
                    onChange={handlePhotoUpload}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                    >
                      Fotoğraf Ekle
                    </Button>
                  </label>
                </Box>

                {photoPreviews.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {photoPreviews.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{ position: "relative", display: "inline-block" }}
                      >
                        <img
                          src={preview}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            bgcolor: "white",
                          }}
                          onClick={() => removePhoto(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        {showcasePreview === preview && (
                          <Chip
                            label="Vitrin"
                            size="small"
                            color="primary"
                            sx={{ position: "absolute", bottom: 0, left: 0 }}
                          />
                        )}
                        {showcasePreview !== preview && (
                          <Button
                            size="small"
                            sx={{ position: "absolute", bottom: 0, left: 0 }}
                            onClick={() =>
                              setShowcasePhoto(formData.photos[index], index)
                            }
                          >
                            Vitrin Yap
                          </Button>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
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

export default CokluAracForm;
