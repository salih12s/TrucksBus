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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../layout/Header";
import apiClient from "../../../../api/client";

// Price formatting fonksiyonları
const formatNumber = (value: string): string => {
  if (!value) return "";
  const number = parseFloat(value.replace(/[^\d]/g, ""));
  if (isNaN(number)) return "";
  return new Intl.NumberFormat("tr-TR").format(number);
};

const parseFormattedNumber = (formattedValue: string): string => {
  if (!formattedValue) return "";
  return formattedValue.replace(/[^\d]/g, "");
};

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

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  name: string;
  slug: string;
}

interface Variant {
  id: number;
  name: string;
  slug: string;
}

interface FormData {
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId: string;
  title: string;
  description: string;
  productionYear: string;
  price: string;
  currency: string;

  // Açık Kasa Özellikleri
  length: string; // cm
  width: string; // cm
  isExchangeable: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar ve Videolar
  photos: File[];
  showcasePhoto: File | null;
  videos: File[];

  // İletişim Bilgileri
  sellerName: string;
  phone: string;
  email: string;

  // Ekstra
  warranty: string;
  negotiable: string;
  exchange: string;

  detailedInfo: string;
}

const AcikKasaForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    categoryId: "7", // Karoser & Üst Yapı
    brandId: "",
    modelId: "",
    variantId: "",
    title: "",
    description: "",
    productionYear: "",
    price: "",
    currency: "TRY",

    // Açık Kasa Özellikleri
    length: "",
    width: "",
    isExchangeable: "",

    // Konum
    cityId: "",
    districtId: "",

    // Fotoğraflar ve Videolar
    photos: [],
    showcasePhoto: null,
    videos: [],

    // İletişim Bilgileri
    sellerName: "",
    phone: "",
    email: "",

    // Ekstra
    warranty: "hayir",
    negotiable: "hayir",
    exchange: "hayir",

    detailedInfo: "",
  });

  // Brand'ları yükle
  useEffect(() => {
    const fetchBrands = async () => {
      if (!formData.categoryId) return;

      setLoadingBrands(true);
      try {
        const response = await apiClient.get(
          `/brands?categoryId=${formData.categoryId}`
        );
        setBrands(response.data as Brand[]);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, [formData.categoryId]);

  // Model'leri yükle
  useEffect(() => {
    const fetchModels = async () => {
      if (!formData.brandId) {
        setModels([]);
        return;
      }

      setLoadingModels(true);
      try {
        const response = await apiClient.get(
          `/brands/${formData.brandId}/models`
        );
        setModels(response.data as Model[]);
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [formData.brandId]);

  // Variant'ları yükle
  useEffect(() => {
    const fetchVariants = async () => {
      if (!formData.modelId) {
        setVariants([]);
        return;
      }

      setLoadingVariants(true);
      try {
        const response = await apiClient.get(
          `/models/${formData.modelId}/variants`
        );
        setVariants(response.data as Variant[]);
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [formData.modelId]);

  // Kullanıcı bilgilerini otomatik yükle
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await apiClient.get("/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const user = response.data as {
            firstName?: string;
            lastName?: string;
            companyName?: string;
            phone?: string;
            email?: string;
          };

          setFormData((prev) => ({
            ...prev,
            sellerName:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.companyName ||
              "",
            phone: user.phone || "",
            email: user.email || "",
          }));
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error);
      }
    };
    fetchUserProfile();
  }, []);

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
    }
  }, [formData.cityId]);

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (e.target.name === "showcasePhoto") {
        setFormData((prev) => ({
          ...prev,
          showcasePhoto: files[0] || null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...files].slice(0, 15), // Max 15 photo
        }));
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Video fonksiyonları
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const currentVideos = formData.videos;
      const newVideos = Array.from(files);
      const totalVideos = currentVideos.length + newVideos.length;

      // En fazla 3 video
      if (totalVideos <= 3) {
        // Video dosya boyutu kontrolü (50MB limit)
        const oversizedFiles = newVideos.filter(
          (file) => file.size > 50 * 1024 * 1024
        );
        if (oversizedFiles.length > 0) {
          console.error("Video dosyası çok büyük:", oversizedFiles);
          alert(
            `⚠️ Video dosyası 50MB'dan büyük olamaz. Büyük dosyalar: ${oversizedFiles
              .map((f) => f.name)
              .join(", ")}`
          );
          return;
        }

        // Video türü kontrolü
        const invalidFiles = newVideos.filter(
          (file) => !file.type.startsWith("video/")
        );
        if (invalidFiles.length > 0) {
          alert(
            `⚠️ Sadece video dosyaları yükleyebilirsiniz. Geçersiz dosyalar: ${invalidFiles
              .map((f) => f.name)
              .join(", ")}`
          );
          return;
        }

        setFormData((prev) => ({
          ...prev,
          videos: [...prev.videos, ...newVideos],
        }));

        console.log(
          `✅ ${newVideos.length} video başarıyla yüklendi:`,
          newVideos.map((v) => v.name)
        );

        // Video önizlemeleri oluştur (URL.createObjectURL direct kullanılacak)
      } else {
        alert("En fazla 3 video yükleyebilirsiniz");
      }
    }
  };

  const removeVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle (price özel olarak parse edilir)
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "showcasePhoto" &&
          key !== "videos" &&
          value
        ) {
          if (key === "price") {
            // Price değerini number olarak parse et
            const parsedPrice = parseFloat(
              parseFormattedNumber(value.toString())
            );
            if (!isNaN(parsedPrice)) {
              submitData.append(key, parsedPrice.toString());
            }
          } else {
            submitData.append(key, value.toString());
          }
        }
      });
    submitData.append("currency", formData.currency || "TRY");

      // Kategori bilgilerini ekle
      submitData.append("categorySlug", categorySlug || "");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");

      // Kategori, marka, model, varyant ID'lerini ekle
      submitData.append("categoryId", formData.categoryId);
      submitData.append("brandId", formData.brandId);
      submitData.append("modelId", formData.modelId);
      submitData.append("variantId", formData.variantId);

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      // Videoları ekle
      console.log("🎥 Video append işlemi başlıyor:", formData.videos.length);
      formData.videos.forEach((video, index) => {
        console.log(
          `🎥 Video ${index} append ediliyor:`,
          video.name,
          video.size
        );
        submitData.append(`video_${index}`, video);
      });
      console.log("🎥 Video append işlemi tamamlandı");

      const response = await apiClient.post("/ads/karoser", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(
        "Açık Kasa Karoser ilanı başarıyla oluşturuldu:",
        response.data
      );
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

  // Üretim yılları (son 30 yıl)
  const currentYear = new Date().getFullYear();
  const productionYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Temel Bilgiler */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📋 Temel Bilgiler
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              {/* Marka, Model, Varyant Seçimi */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 2,
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Marka</InputLabel>
                  <Select
                    value={formData.brandId}
                    label="Marka"
                    onChange={(e) => {
                      handleInputChange("brandId", e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        modelId: "",
                        variantId: "",
                      }));
                    }}
                    disabled={loadingBrands}
                  >
                    {brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingBrands && (
                    <CircularProgress
                      size={20}
                      sx={{ position: "absolute", right: 8, top: 8 }}
                    />
                  )}
                </FormControl>

                <FormControl fullWidth required disabled={!formData.brandId}>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={formData.modelId}
                    label="Model"
                    onChange={(e) => {
                      handleInputChange("modelId", e.target.value);
                      setFormData((prev) => ({ ...prev, variantId: "" }));
                    }}
                    disabled={loadingModels || !formData.brandId}
                  >
                    {models.map((model) => (
                      <MenuItem key={model.id} value={model.id.toString()}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingModels && (
                    <CircularProgress
                      size={20}
                      sx={{ position: "absolute", right: 8, top: 8 }}
                    />
                  )}
                </FormControl>

                <FormControl fullWidth disabled={!formData.modelId}>
                  <InputLabel>Varyant</InputLabel>
                  <Select
                    value={formData.variantId}
                    label="Varyant"
                    onChange={(e) =>
                      handleInputChange("variantId", e.target.value)
                    }
                    disabled={loadingVariants || !formData.modelId}
                  >
                    {variants.map((variant) => (
                      <MenuItem key={variant.id} value={variant.id.toString()}>
                        {variant.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingVariants && (
                    <CircularProgress
                      size={20}
                      sx={{ position: "absolute", right: 8, top: 8 }}
                    />
                  )}
                </FormControl>
              </Box>

              <TextField
                fullWidth
                label="İlan Başlığı *"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Örn: Tertemiz 2020 Model Açık Kasa Sabit Kabin Karoser"
                required
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Açıklama *"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Karoserinizin detaylı açıklamasını yazın..."
                required
              />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Üretim Yılı</InputLabel>
                  <Select
                    value={formData.productionYear}
                    label="Üretim Yılı"
                    onChange={(e) =>
                      handleInputChange("productionYear", e.target.value)
                    }
                  >
                    {productionYears.map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Fiyat"
                  value={formatNumber(formData.price)}
                  onChange={(e) =>
                    handleInputChange(
                      "price",
                      parseFormattedNumber(e.target.value)
                    )
                  }
                  placeholder="Örn: 150.000"
                  required
                
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ToggleButtonGroup
                      value={formData.currency || "TRY"}
                      exclusive
                      onChange={(_, v) => v && setFormData((prev: any) => ({ ...prev, currency: v }))}
                      size="small"
                      sx={{ "& .MuiToggleButton-root": { py: 0.5, px: 1, fontSize: "0.75rem", "&.Mui-selected": { bgcolor: "#D34237", color: "#fff" } } }}
                    >
                      <ToggleButton value="TRY">₺</ToggleButton>
                      <ToggleButton value="USD">$</ToggleButton>
                      <ToggleButton value="EUR">€</ToggleButton>
                    </ToggleButtonGroup>
                  </InputAdornment>
                ),
              }}
              />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Açık Kasa Özellikleri */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📦 Açık Kasa Özellikleri
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  type="number"
                  label="Uzunluk (cm) *"
                  value={formData.length}
                  onChange={(e) => handleInputChange("length", e.target.value)}
                  inputProps={{ min: "0" }}
                  required
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Genişlik (cm) *"
                  value={formData.width}
                  onChange={(e) => handleInputChange("width", e.target.value)}
                  inputProps={{ min: "0" }}
                  required
                />
              </Box>

              <FormControl component="fieldset">
                <FormLabel component="legend">Takaslı</FormLabel>
                <RadioGroup
                  value={formData.isExchangeable}
                  onChange={(e) =>
                    handleInputChange("isExchangeable", e.target.value)
                  }
                  row
                >
                  <FormControlLabel
                    value="evet"
                    control={<Radio />}
                    label="Evet"
                  />
                  <FormControlLabel
                    value="hayır"
                    control={<Radio />}
                    label="Hayır"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Konum Bilgileri */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📍 Konum Bilgileri
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 4,
              }}
            >
              <FormControl fullWidth required>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleInputChange("cityId", e.target.value)}
                  label="Şehir"
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) =>
                    handleInputChange("districtId", e.target.value)
                  }
                  label="İlçe"
                  disabled={!formData.cityId}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* İletişim Bilgileri */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📞 İletişim Bilgileri
            </Typography>

            <Box sx={{ display: "grid", gap: 3, mb: 4 }}>
              <TextField
                fullWidth
                label="Satıcı Adı *"
                value={formData.sellerName}
                onChange={(e) =>
                  handleInputChange("sellerName", e.target.value)
                }
                disabled
                required
                helperText="Profil bilgilerinizden otomatik olarak alınmıştır"
              />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  fullWidth
                  label="Telefon *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(5XX) XXX XX XX"
                  disabled
                  required
                  helperText="Profil bilgilerinizden otomatik alındı"
                />

                <TextField
                  fullWidth
                  type="email"
                  label="E-posta"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled
                  helperText="Profil bilgilerinizden otomatik alındı"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Ek Seçenekler */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              ⚡ Ek Seçenekler
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 2,
                mb: 4,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Garanti</InputLabel>
                <Select
                  value={formData.warranty}
                  onChange={(e) =>
                    handleInputChange("warranty", e.target.value)
                  }
                  label="Garanti"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Pazarlık</InputLabel>
                <Select
                  value={formData.negotiable}
                  onChange={(e) =>
                    handleInputChange("negotiable", e.target.value)
                  }
                  label="Pazarlık"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Takas</InputLabel>
                <Select
                  value={formData.exchange}
                  onChange={(e) =>
                    handleInputChange("exchange", e.target.value)
                  }
                  label="Takas"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Fotoğraflar */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              📸 Fotoğraflar
            </Typography>

            {/* Vitrin Fotoğrafı */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Vitrin Fotoğrafı
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  name="showcasePhoto"
                  style={{ marginBottom: "16px" }}
                />
                {formData.showcasePhoto && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={URL.createObjectURL(formData.showcasePhoto)}
                      alt="Vitrin"
                      style={{
                        width: "200px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Diğer Fotoğraflar */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Diğer Fotoğraflar (En fazla 15 adet)
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ marginBottom: "16px" }}
                />

                {formData.photos.length > 0 && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}
                  >
                    {formData.photos.map((photo, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Fotoğraf ${index + 1}`}
                          style={{
                            width: "150px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <Button
                          size="small"
                          onClick={() => removePhoto(index)}
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            minWidth: "auto",
                            backgroundColor: "red",
                            color: "white",
                            "&:hover": { backgroundColor: "darkred" },
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

            {/* Videolar */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              🎥 Videolar
            </Typography>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Videolar (En fazla 3 adet, maksimum 50MB)
                </Typography>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  style={{ marginBottom: "16px" }}
                />

                {formData.videos.length > 0 && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}
                  >
                    {formData.videos.map((video, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <video
                          width="200"
                          height="150"
                          controls
                          style={{
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        >
                          <source
                            src={URL.createObjectURL(video)}
                            type={video.type}
                          />
                          Tarayıcınız bu video formatını desteklemiyor.
                        </video>
                        <Button
                          size="small"
                          onClick={() => removeVideo(index)}
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            minWidth: "auto",
                            backgroundColor: "red",
                            color: "white",
                            "&:hover": { backgroundColor: "darkred" },
                          }}
                        >
                          ×
                        </Button>
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            bottom: 5,
                            left: 5,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            color: "white",
                            px: 1,
                            borderRadius: 1,
                          }}
                        >
                          {video.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Detaylı Bilgi */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Detaylı Bilgi"
              value={formData.detailedInfo}
              onChange={(e) =>
                handleInputChange("detailedInfo", e.target.value)
              }
              placeholder="Karoseriniz hakkında ek bilgiler..."
              sx={{ mb: 4 }}
            />

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={() => navigate(-1)}
                sx={{ px: 4 }}
              >
                Geri Dön
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  px: 6,
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                  },
                }}
              >
                {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle sx={{ textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 60, color: "green", mb: 2 }} />
            <Typography variant="h4">🎉 Başarılı!</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
              <strong>Açık Kasa Karoser</strong> ilanınız başarıyla oluşturuldu!
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: "center", color: "#666" }}
            >
              İlanınız admin onayından sonra yayınlanacak ve diğer kullanıcılar
              tarafından görülebilecektir.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              onClick={handleSuccessClose}
              variant="contained"
              size="large"
              sx={{
                background: "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #43a047 30%, #4caf50 90%)",
                },
                px: 4,
              }}
            >
              Ana Sayfaya Dön
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default AcikKasaForm;
