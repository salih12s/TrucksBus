import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
  Card,
  CardContent,
  Dialog,
  DialogContent,
} from "@mui/material";
import { PhotoCamera, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../layout/Header";
import apiClient from "../../api/client";

interface FormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  condition: string;

  // Konum Bilgileri
  cityId: string;
  districtId: string;

  // Araç Bilgileri
  year: string;
  mileage: string;
  enginePower: string;
  fuelType: string;
  transmission: string;

  // Otobüs Özel Bilgileri
  capacity: string;
  seatArrangement: string;
  seatBackScreen: string;
  color: string;
  fuelCapacity: string;
  tireCondition: string;
  detailedInfo: string;

  // Özellikler
  features: string[];

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;
}

const OtobusAdForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  // Loading ve success state'leri
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    condition: "",
    cityId: "",
    districtId: "",
    year: "",
    mileage: "",
    enginePower: "",
    fuelType: "",
    transmission: "",
    capacity: "",
    seatArrangement: "",
    seatBackScreen: "",
    color: "",
    fuelCapacity: "",
    tireCondition: "",
    detailedInfo: "",
    features: [],
    photos: [],
    showcasePhoto: null,
  });

  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [districts, setDistricts] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showcasePreview, setShowcasePreview] = useState<string>("");

  // Statik seçenekler
  const yearOptions = Array.from({ length: 30 }, (_, i) =>
    (2024 - i).toString()
  );

  const fuelTypeOptions = ["Dizel", "Benzin", "LPG", "Elektrik", "Hibrit"];

  const transmissionOptions = ["Manuel", "Otomatik", "Yarı Otomatik"];

  const conditionOptions = ["Sıfır", "2. El", "Hasarlı"];

  const enginePowerOptions = [
    "150-200 HP",
    "200-250 HP",
    "250-300 HP",
    "300-350 HP",
    "350-400 HP",
    "400+ HP",
  ];

  const seatArrangementOptions = ["2+1", "2+2"];

  const seatBackScreenOptions = ["7", "9", "10", "Yok"];

  const colorOptions = [
    "Amarant",
    "Bal Rengi",
    "Bej",
    "Beyaz",
    "Bordo",
    "Füme",
    "Gri",
    "Gümüş Gri",
    "İhtamur",
    "Kahverengi",
    "Kırmızı",
    "Kiremit",
    "Krem",
    "Kum Rengi",
    "Lacivert",
    "Mavi",
    "Mor",
    "Pembe",
    "Sarı",
    "Siyah",
    "Somon",
    "Şampanya",
    "Tarçın",
    "Turkuaz",
    "Turuncu",
    "Yakut",
    "Yeşil",
    "Zeytin Gri",
  ];

  const availableFeatures = [
    "3G",
    "ABS",
    "Araç Telefonu",
    "ASR",
    "Buzdolabı",
    "Klima",
    "Mutfak",
    "Retarder",
    "Sürücü Kabini",
    "Televizyon",
    "Tuvalet",
    "Uydu",
    "Wi-Fi",
  ];

  // API çağrıları
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/ads/cities");
        setCities((response.data as Array<{ id: string; name: string }>) || []);
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
          setDistricts(
            (response.data as Array<{ id: string; name: string }>) || []
          );
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        }
      };
      fetchDistricts();
    }
  }, [formData.cityId]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[] | File[] | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase: boolean = false
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

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

        // Fotoğraf önizlemeleri oluştur
        newPhotos.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        });
      } else {
        alert(
          `En fazla 15 fotoğraf yükleyebilirsiniz. Şu anda ${currentPhotos.length} fotoğraf var.`
        );
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "İlan başlığı gerekli";
    if (!formData.description.trim())
      newErrors.description = "Açıklama gerekli";
    if (!formData.price.trim()) newErrors.price = "Fiyat gerekli";
    if (!formData.cityId) newErrors.cityId = "Şehir seçimi gerekli";
    if (!formData.districtId) newErrors.districtId = "İlçe seçimi gerekli";
    if (!formData.year) newErrors.year = "Yıl seçimi gerekli";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      // Debug için console.log ekleyelim
      console.log("🚌 Otobüs form data:", formData);

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      if (formData.condition && formData.condition.trim() !== "") {
        submitData.append("condition", formData.condition);
      }

      // Konum bilgileri
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);

      // Araç bilgileri - Boş string kontrolü
      if (formData.year && formData.year.trim() !== "") {
        submitData.append("year", formData.year);
      }
      if (formData.mileage && formData.mileage.trim() !== "") {
        submitData.append("mileage", formData.mileage);
      }
      if (formData.enginePower && formData.enginePower.trim() !== "") {
        submitData.append("enginePower", formData.enginePower);
      }
      if (formData.fuelType && formData.fuelType.trim() !== "") {
        submitData.append("fuelType", formData.fuelType);
      }
      if (formData.transmission && formData.transmission.trim() !== "") {
        submitData.append("transmission", formData.transmission);
      }

      // Otobüs özel bilgileri - Boş string kontrolü ekleyelim
      if (formData.capacity && formData.capacity.trim() !== "") {
        submitData.append("passengerCapacity", formData.capacity);
      }
      if (formData.seatArrangement && formData.seatArrangement.trim() !== "") {
        submitData.append("seatLayout", formData.seatArrangement);
      }
      if (formData.seatBackScreen && formData.seatBackScreen.trim() !== "") {
        submitData.append("seatBackScreen", formData.seatBackScreen);
      }
      if (formData.color && formData.color.trim() !== "") {
        submitData.append("color", formData.color);
      }
      if (formData.fuelCapacity && formData.fuelCapacity.trim() !== "") {
        submitData.append("fuelCapacity", formData.fuelCapacity);
      }
      if (formData.tireCondition && formData.tireCondition.trim() !== "") {
        submitData.append("tireCondition", formData.tireCondition);
      }

      if (formData.detailedInfo && formData.detailedInfo.trim() !== "") {
        submitData.append("detailedInfo", formData.detailedInfo);
      }

      // Özellikler - JSON olarak gönder
      if (formData.features.length > 0) {
        // Features array'ini object'e çevir
        const featuresObject: Record<string, boolean> = {};
        formData.features.forEach((feature) => {
          featuresObject[feature] = true;
        });
        submitData.append("features", JSON.stringify(featuresObject));
      }

      // URL parametrelerini ekle
      if (categorySlug) submitData.append("categorySlug", categorySlug);
      if (brandSlug) submitData.append("brandSlug", brandSlug);
      if (modelSlug) submitData.append("modelSlug", modelSlug);
      if (variantSlug) submitData.append("variantSlug", variantSlug);

      // Vitrin fotoğrafı
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      // Diğer fotoğraflar - server photo_0, photo_1, photo_2 şeklinde bekliyor
      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/otobus", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error("İlan gönderme hatası:", error);
      // Hata durumunu handle edebiliriz
    } finally {
      setLoading(false);
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
              background: "linear-gradient(45deg, #313B4C 30%, #D34237 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            🚍 Otobüs İlanı Ver
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
          >
            Otobüsünüzün tüm detaylarını girerek profesyonel ilanınızı oluşturun
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
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    📝 Temel Bilgiler
                  </Typography>
                </Box>

                {/* İlan Başlığı */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="İlan Başlığı"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                    variant="outlined"
                    placeholder="Örn: 2020 Model Mercedes Tourismo Otobüs"
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
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Açıklama"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    error={!!errors.description}
                    helperText={errors.description}
                    required
                    variant="outlined"
                    placeholder="Otobüsünüz hakkında detaylı bilgi verin..."
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

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Fiyat (₺)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    error={!!errors.price}
                    helperText={errors.price}
                    placeholder="1500000"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                  <FormControl fullWidth error={!!errors.condition}>
                    <InputLabel>Durumu</InputLabel>
                    <Select
                      value={formData.condition}
                      onChange={(e) =>
                        handleInputChange("condition", e.target.value)
                      }
                      label="Durumu"
                      sx={{ borderRadius: 3 }}
                    >
                      {conditionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* 📍 Konum Bilgileri */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    📍 Konum Bilgileri
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Autocomplete
                    fullWidth
                    options={cities}
                    getOptionLabel={(option) => option.name}
                    value={
                      cities.find((city) => city.id === formData.cityId) || null
                    }
                    onChange={(_, newValue) => {
                      handleInputChange("cityId", newValue?.id || "");
                      handleInputChange("districtId", "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Şehir"
                        error={!!errors.city}
                        helperText={errors.city}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    )}
                  />
                  <Autocomplete
                    fullWidth
                    options={districts}
                    getOptionLabel={(option) => option.name}
                    value={
                      districts.find(
                        (district) => district.id === formData.districtId
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleInputChange("districtId", newValue?.id || "")
                    }
                    disabled={!formData.cityId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="İlçe"
                        error={!!errors.district}
                        helperText={errors.district}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 🚍 Araç Bilgileri */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    🚍 Araç Bilgileri
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth error={!!errors.year}>
                    <InputLabel>Yıl</InputLabel>
                    <Select
                      value={formData.year}
                      onChange={(e) =>
                        handleInputChange("year", e.target.value)
                      }
                      label="Yıl"
                      sx={{ borderRadius: 3 }}
                    >
                      {yearOptions.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Kilometre"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) =>
                      handleInputChange("mileage", e.target.value)
                    }
                    placeholder="100000"
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

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Motor Gücü</InputLabel>
                    <Select
                      value={formData.enginePower}
                      onChange={(e) =>
                        handleInputChange("enginePower", e.target.value)
                      }
                      label="Motor Gücü"
                      sx={{ borderRadius: 3 }}
                    >
                      {enginePowerOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Yakıt Türü</InputLabel>
                    <Select
                      value={formData.fuelType}
                      onChange={(e) =>
                        handleInputChange("fuelType", e.target.value)
                      }
                      label="Yakıt Türü"
                      sx={{ borderRadius: 3 }}
                    >
                      {fuelTypeOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Vites</InputLabel>
                    <Select
                      value={formData.transmission}
                      onChange={(e) =>
                        handleInputChange("transmission", e.target.value)
                      }
                      label="Vites"
                      sx={{ borderRadius: 3 }}
                    >
                      {transmissionOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Kapasite (Kişi)"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleInputChange("capacity", e.target.value)
                    }
                    placeholder="50"
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

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Koltuk Düzeni</InputLabel>
                    <Select
                      value={formData.seatArrangement}
                      onChange={(e) =>
                        handleInputChange("seatArrangement", e.target.value)
                      }
                      label="Koltuk Düzeni"
                      sx={{ borderRadius: 3 }}
                    >
                      {seatArrangementOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Koltuk Arkası Ekran</InputLabel>
                    <Select
                      value={formData.seatBackScreen}
                      onChange={(e) =>
                        handleInputChange("seatBackScreen", e.target.value)
                      }
                      label="Koltuk Arkası Ekran"
                      sx={{ borderRadius: 3 }}
                    >
                      {seatBackScreenOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Renk</InputLabel>
                    <Select
                      value={formData.color}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      label="Renk"
                      sx={{ borderRadius: 3 }}
                    >
                      {colorOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Yakıt Hacmi (Litre)"
                    type="number"
                    value={formData.fuelCapacity}
                    onChange={(e) =>
                      handleInputChange("fuelCapacity", e.target.value)
                    }
                    placeholder="300"
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

                <Box>
                  <TextField
                    fullWidth
                    label="Lastik Durumu (%)"
                    type="number"
                    value={formData.tireCondition}
                    onChange={(e) =>
                      handleInputChange("tireCondition", e.target.value)
                    }
                    placeholder="85"
                    inputProps={{ min: 0, max: 100 }}
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

                <Box>
                  <TextField
                    fullWidth
                    label="Detaylı Bilgi"
                    multiline
                    rows={4}
                    value={formData.detailedInfo}
                    onChange={(e) =>
                      handleInputChange("detailedInfo", e.target.value)
                    }
                    placeholder="Otobüs hakkında detaylı açıklama yazın..."
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

            {/* ⭐ Özellikler */}
            <Card
              elevation={6}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e1e8ed",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    ⭐ Konfor & Güvenlik Özellikleri
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {availableFeatures.map((feature) => (
                    <FormControlLabel
                      key={feature}
                      control={
                        <Checkbox
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          color="primary"
                        />
                      }
                      label={feature}
                      sx={{ minWidth: "200px" }}
                    />
                  ))}
                </Box>

                {formData.features.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Seçili Özellikler:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {formData.features.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          onDelete={() => handleFeatureToggle(feature)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* � Fotoğraflar */}
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
                              setShowcasePreview("");
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
                      Otobüsünüzün farklı açılardan fotoğraflarını ekleyin (En
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

            {/* Hata Mesajları */}
            {Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                Lütfen tüm zorunlu alanları doldurun.
              </Alert>
            )}

            {/* Submit Button */}
            <Box sx={{ textAlign: "center" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  minWidth: 250,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                  },
                }}
              >
                {loading ? <CircularProgress size={28} /> : "🚀 İlanı Yayınla"}
              </Button>
            </Box>
          </Box>
        </form>
      </Container>

      {/* Success Modal */}
      <Dialog
        open={submitSuccess}
        onClose={() => setSubmitSuccess(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircle
            sx={{
              fontSize: 80,
              color: "success.main",
              mb: 2,
            }}
          />
          <Typography variant="h5" component="h2" gutterBottom>
            İlanınız Başarıyla Oluşturuldu!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Otobüs ilanınız başarıyla yayınlandı. İlanınızı yönetmek için
            ilanlarım sayfasına gidebilirsiniz.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSubmitSuccess(false);
                navigate("/");
              }}
              sx={{ minWidth: 120 }}
            >
              Ana Sayfa
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSubmitSuccess(false);
                navigate("/user/ads");
              }}
              sx={{ minWidth: 120 }}
            >
              İlanlarım
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OtobusAdForm;
