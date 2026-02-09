import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import {
  CheckCircle,
  PhotoCamera,
  EditNote,
  LocationOn,
} from "@mui/icons-material";
import apiClient from "../../../../api/client";
import Header from "../../../layout/Header";

// Tarım Römork Markaları
const TARIM_ROMORK_BRANDS = [
  "Seçiniz",
  "ACG Römork",
  "Akdoğan",
  "Aksoylu Treyler",
  "Alim Dorse",
  "Alpsan",
  "Altınordu Treyler",
  "Aydınlık Kardeşler",
  "Aysan Römork",
  "Başaran Römork",
  "Başarır Römork",
  "Baysallar",
  "Bey Treyler",
  "Biçeroğlu",
  "Brosco",
  "Caselli",
  "CastroMax Trailers",
  "Cebeci",
  "Ceytech",
  "Çarşan Treyler",
  "Çetiner",
  "Ekol",
  "Eliçelik",
  "Elit Römork",
  "Emekçiler",
  "Emekçiler Tarım Makinaları",
  "Erdallar",
  "Ersel Trailer",
  "Eroğlu",
  "Ferhat",
  "Fesan",
  "Fruehauf",
  "Gani Şahan Treyler",
  "Goldoni",
  "Gündoğdu",
  "Gürler",
  "Hocaoğlu Römork",
  "Hürsan Treyler",
  "İbrahim Örs",
  "Kabay",
  "Kandil Römork",
  "Karalar",
  "Kasasan",
  "Keskin",
  "Koluman",
  "Kontir",
  "Köseoğlu",
  "Makinsan",
  "Meiller",
  "Meral Kasa",
  "Merttaş",
  "Minicargo",
  "Mutlusan",
  "New Holland",
  "Nil Cargo Römork",
  "Oktar Makina",
  "Oruç Karoser",
  "Otto",
  "Özalsan",
  "Özçevik",
  "Özdemir",
  "Özen İş",
  "Özgül Treyler",
  "Önder Treyler",
  "Palazoğlu",
  "Paşaoğlu Dorse Treyler",
  "Pino Römork",
  "Poslu",
  "Schmitz",
  "Seçilen",
  "Seçkin",
  "Serin Treyler",
  "Sistem Damper Treyler",
  "Sommer",
  "Süperaktif",
  "Şen",
  "Tako",
  "Taral",
  "Tarım Kredi",
  "Tinaz",
  "Tirsan",
  "Topaloğlu Karoser",
  "TowGo",
  "Toygar",
  "Üçel",
  "Vuraner",
  "Westfalia",
  "Yeksan",
  "Yenkar",
  "Yıldız Treyler",
  "Yılmaz",
  "Yükselen Treyler",
  "Özel İmalat",
  "Diğer",
];

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
  productionYear: string;
  price: string;
  currency: string;
  romorkMarkasi: string; // Yeni alan
  volume: string;
  condition: string;
  isExchangeable: string;
  hasDamper: string;

  // Konum
  cityId: string;
  districtId: string;

  // İletişim
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;
}

const KapaliKasaForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    currency: "TRY",
    romorkMarkasi: "Seçiniz",
    volume: "",
    condition: "ikinci-el",
    isExchangeable: "olabilir",
    hasDamper: "Hayır",
    cityId: "",
    districtId: "",
    sellerName: "",
    sellerPhone: "",
    sellerEmail: "",
    photos: [],
    showcasePhoto: null,
  });

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

  const handleCityChange = async (cityId: string) => {
    setFormData((prev) => ({ ...prev, cityId, districtId: "" }));
    setDistricts([]);

    if (cityId) {
      try {
        const response = await apiClient.get(`/ads/cities/${cityId}/districts`);
        setDistricts(response.data as District[]);
      } catch (error) {
        console.error("İlçeler yüklenirken hata:", error);
      }
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | File[] | File | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isShowcase = false,
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
          newPhotos.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              newPreviews.push(e.target?.result as string);
              if (newPreviews.length === newPhotos.length) {
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
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year);
    }
    return years;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Backend'in beklediği field isimleriyle gönder
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("volume", formData.volume);
      submitData.append("exchangeable", formData.isExchangeable);
      submitData.append(
        "hasDamper",
        formData.hasDamper === "Evet" ? "true" : "false",
      );
      submitData.append("cityId", formData.cityId);
      submitData.append("districtId", formData.districtId);
      submitData.append("contactName", formData.sellerName);
      submitData.append("phone", formData.sellerPhone);
      submitData.append("email", formData.sellerEmail);
      submitData.append("currency", "TL");

      // Kategori bilgilerini ekle
      submitData.append("categorySlug", categorySlug || "");
      submitData.append("brandSlug", brandSlug || "");
      submitData.append("modelSlug", modelSlug || "");
      submitData.append("variantSlug", variantSlug || "");
      submitData.append("subType", "kapali-kasa");

      // Debug: URL'den gelen kategori bilgilerini kontrol et
      console.log("URL'den gelen kategori bilgileri:", {
        categorySlug,
        brandSlug,
        modelSlug,
        variantSlug,
      });

      // Tüm fotoğrafları tek bir array olarak gönder (backend'in beklediği şekilde)
      if (formData.showcasePhoto) {
        submitData.append("photos", formData.showcasePhoto);
      }

      formData.photos.forEach((photo) => {
        submitData.append("photos", photo);
      });

      const response = await apiClient.post("/ads/tarim-romork", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("İlan başarıyla oluşturuldu:", response.data);
      setSubmitSuccess(true);

      // Başarılı olduğunda anasayfaya yönlendir
      setTimeout(() => {
        navigate("/");
      }, 2000); // 2 saniye sonra yönlendir
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

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* 📝 Temel Bilgiler */}
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
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <EditNote sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Temel Bilgiler
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* İlan Başlığı */}
                  <TextField
                    fullWidth
                    label="İlan Başlığı"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Örn: 2020 Model                   Kapalı Kasa Tarım Römorku"
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />

                  {/* Açıklama */}
                  <TextField
                    fullWidth
                    label="İlan Açıklaması"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Araç hakkında detaylı bilgi veriniz..."
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  />

                  {/* Alanlar Grid */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 3,
                    }}
                  >
                    {/* Üretim Yılı */}
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          "&:hover fieldset": { borderColor: "primary.main" },
                        },
                      }}
                    >
                      <InputLabel>Üretim Yılı</InputLabel>
                      <Select
                        value={formData.productionYear}
                        onChange={(e) =>
                          handleInputChange("productionYear", e.target.value)
                        }
                        label="Üretim Yılı"
                      >
                        {generateYearOptions().map((year) => (
                          <MenuItem key={year} value={year.toString()}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Hacim */}

                    {/* Durum */}

                    {/* Takas */}
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          "&:hover fieldset": { borderColor: "primary.main" },
                        },
                      }}
                    >
                      <InputLabel>Takas</InputLabel>
                      <Select
                        value={formData.isExchangeable}
                        onChange={(e) =>
                          handleInputChange("isExchangeable", e.target.value)
                        }
                        label="Takas"
                      >
                        <MenuItem value="evet">✅ Evet</MenuItem>
                        <MenuItem value="hayir">❌ Hayır</MenuItem>
                        <MenuItem value="olabilir">🤔 Olabilir</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Damperli */}
                    <FormControl
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          "&:hover fieldset": { borderColor: "primary.main" },
                        },
                      }}
                    >
                      <InputLabel>Damperli</InputLabel>
                      <Select
                        value={formData.hasDamper}
                        onChange={(e) =>
                          handleInputChange("hasDamper", e.target.value)
                        }
                        label="Damperli"
                      >
                        <MenuItem value="Evet">🚛 Evet</MenuItem>
                        <MenuItem value="Hayır">❌ Hayır</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Römork Markası */}
                    <FormControl fullWidth required>
                      <InputLabel>Römork Markası</InputLabel>
                      <Select
                        value={formData.romorkMarkasi}
                        label="Römork Markası"
                        onChange={(e) =>
                          handleInputChange("romorkMarkasi", e.target.value)
                        }
                      >
                        {TARIM_ROMORK_BRANDS.map((brand) => (
                          <MenuItem key={brand} value={brand}>
                            {brand}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Fiyat */}
                    <TextField
                      fullWidth
                      label="Fiyat"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <ToggleButtonGroup
                              value={formData.currency || "TRY"}
                              exclusive
                              onChange={(_, v) =>
                                v &&
                                setFormData((prev: any) => ({
                                  ...prev,
                                  currency: v,
                                }))
                              }
                              size="small"
                              sx={{
                                "& .MuiToggleButton-root": {
                                  py: 0.5,
                                  px: 1,
                                  fontSize: "0.75rem",
                                  "&.Mui-selected": {
                                    bgcolor: "#D34237",
                                    color: "#fff",
                                  },
                                },
                              }}
                            >
                              <ToggleButton value="TRY">₺ TL</ToggleButton>
                              <ToggleButton value="USD">$ USD</ToggleButton>
                              <ToggleButton value="EUR">€ EUR</ToggleButton>
                            </ToggleButtonGroup>
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Örn: 150000"
                      type="number"
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          "&:hover fieldset": { borderColor: "primary.main" },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* 📸 Fotoğraf Yükleme */}
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
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
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
                        "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Fotoğraf Yükleme
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Vitrin Fotoğrafı */}
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
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
                            }}
                          />
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
                      Aracınızın farklı açılardan fotoğraflarını ekleyin (En
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
                          }}
                        >
                          {formData.photos.map((file, index) => (
                            <Box
                              key={index}
                              sx={{
                                position: "relative",
                                width: "100%",
                                paddingTop: "75%", // 4:3 Aspect Ratio
                                border: "1px solid #ddd",
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: 1,
                              }}
                            >
                              <img
                                src={
                                  photoPreviews[index] ||
                                  URL.createObjectURL(file)
                                }
                                alt={`Fotoğraf ${index + 1}`}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />

                              <Box
                                onClick={() => removePhoto(index)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "rgba(255,255,255,0.9)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  "&:hover": {
                                    background: "#ff1744",
                                    color: "white",
                                  },
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: "bold",
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

            {/* 📍 Konum ve İletişim Bilgileri */}
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
                        "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      mr: 2,
                    }}
                  >
                    <LocationOn sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Konum
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                  }}
                >
                  {/* Satıcı Adı */}

                  {/* Şehir */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>İl</InputLabel>
                    <Select
                      value={formData.cityId}
                      onChange={(e) => handleCityChange(e.target.value)}
                      label="İl"
                      required
                    >
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id.toString()}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>🏙️</span> {city.plateCode} - {city.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* İlçe */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "primary.main" },
                      },
                    }}
                  >
                    <InputLabel>İlçe</InputLabel>
                    <Select
                      value={formData.districtId}
                      onChange={(e) =>
                        handleInputChange("districtId", e.target.value)
                      }
                      label="İlçe"
                      disabled={!formData.cityId}
                      required
                    >
                      {districts.map((district) => (
                        <MenuItem
                          key={district.id}
                          value={district.id.toString()}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>🏘️</span> {district.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                size="large"
                sx={{
                  minWidth: 300,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                  background:
                    "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #388e3c 30%, #689f38 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(76,175,80,0.3)",
                  },
                  "&:disabled": {
                    background: "#ccc",
                  },
                }}
              >
                {loading ? "🔄 Gönderiliyor..." : "🚀 İlanı Yayınla"}
              </Button>
            </Box>
          </Box>
        </form>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle color="success" />
            İlan Başarıyla Oluşturuldu
          </DialogTitle>
          <DialogContent>
            <Alert severity="success">
              İlanınız başarıyla yayınlandı! Anasayfaya yönlendiriliyorsunuz.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuccessClose} variant="contained">
              Tamam
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default KapaliKasaForm;
