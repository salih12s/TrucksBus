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
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import Header from "../layout/Header";
import apiClient from "../../api/client";

interface FormData {
  // Temel Bilgiler
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;

  // Konum Bilgileri
  city: string;
  district: string;

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

  // Özellikler
  features: string[];

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;
}

interface OtobusAdFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const OtobusAdForm: React.FC<OtobusAdFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    category: "otobus",
    condition: "",
    city: "",
    district: "",
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

  const seatBackScreenOptions = ["7 inç", "9 inç", "10 inç", "Yok"];

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
    if (formData.city) {
      const fetchDistricts = async () => {
        try {
          const response = await apiClient.get(
            `/ads/districts?city=${formData.city}`
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
  }, [formData.city]);

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

  const removeShowcasePhoto = () => {
    setFormData((prev) => ({ ...prev, showcasePhoto: null }));
    setShowcasePreview("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "İlan başlığı gerekli";
    if (!formData.description.trim())
      newErrors.description = "Açıklama gerekli";
    if (!formData.price.trim()) newErrors.price = "Fiyat gerekli";
    if (!formData.city) newErrors.city = "Şehir seçimi gerekli";
    if (!formData.district) newErrors.district = "İlçe seçimi gerekli";
    if (!formData.year) newErrors.year = "Yıl seçimi gerekli";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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

                <Box>
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
                      cities.find((city) => city.id === formData.city) || null
                    }
                    onChange={(_, newValue) => {
                      handleInputChange("city", newValue?.id || "");
                      handleInputChange("district", "");
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
                        (district) => district.id === formData.district
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleInputChange("district", newValue?.id || "")
                    }
                    disabled={!formData.city}
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

            {/* 📷 Fotoğraflar */}
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
                    📷 Fotoğraflar
                  </Typography>
                </Box>

                {/* Vitrin Fotoğrafı */}
                <Box sx={{ mb: 4 }}>
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
                    ⭐ Vitrin Fotoğrafı
                    <Chip label="Zorunlu" color="error" size="small" />
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, textAlign: "center" }}
                  >
                    Bu fotoğraf ilanınızın kapak resmi olacak ve arama
                    sonuçlarında görünecek
                  </Typography>

                  {!formData.showcasePhoto ? (
                    <Box>
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
                            width: "100%",
                            py: 3,
                            fontSize: "1.1rem",
                            background:
                              "linear-gradient(45deg, #313B4C 30%, #D34237 90%)",
                            "&:hover": {
                              background:
                                "linear-gradient(45deg, #D34237 30%, #313B4C 90%)",
                            },
                          }}
                        >
                          Vitrin Fotoğrafı Seç
                        </Button>
                      </label>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-block",
                          borderRadius: 3,
                          overflow: "hidden",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                          border: "3px solid #4CAF50",
                        }}
                      >
                        <img
                          src={showcasePreview}
                          alt="Vitrin Fotoğrafı"
                          style={{
                            width: "300px",
                            height: "200px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <Button
                          onClick={removeShowcasePhoto}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            minWidth: "auto",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "rgba(244, 67, 54, 0.9)",
                            color: "white",
                            "&:hover": {
                              background: "rgba(244, 67, 54, 1)",
                            },
                          }}
                        >
                          ×
                        </Button>
                      </Box>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mt: 2, fontWeight: 600 }}
                      >
                        ✅ Vitrin fotoğrafı başarıyla yüklendi
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Diğer Fotoğraflar */}
                <Box>
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
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  background: "rgba(255,0,0,1)",
                                  transform: "scale(1.1)",
                                },
                              }}
                              onClick={() => removePhoto(index)}
                            >
                              <Typography
                                sx={{
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  lineHeight: 1,
                                }}
                              >
                                ×
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
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
                disabled={isLoading}
                sx={{
                  minWidth: 250,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(45deg, #313B4C 30%, #D34237 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #D34237 30%, #313B4C 90%)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={28} />
                ) : (
                  "🚀 İlanı Yayınla"
                )}
              </Button>
            </Box>
          </Box>
        </form>
      </Container>
    </>
  );
};

export default OtobusAdForm;
