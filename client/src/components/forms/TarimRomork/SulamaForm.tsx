import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
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
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import { PhotoCamera, EditNote, LocationOn } from "@mui/icons-material";
import apiClient from "../../../api/client";
import Header from "../../layout/Header";

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

interface SulamaFormData {
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
  hasDamper: boolean;

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

const SulamaForm: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug, brandSlug, modelSlug, variantSlug } = useParams();
  const user = useSelector((state: RootState) => state.auth.user);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showcasePreview, setShowcasePreview] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Sayı formatlama fonksiyonları
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

  const [formData, setFormData] = useState<SulamaFormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    currency: "TRY",
    romorkMarkasi: "Seçiniz",
    volume: "",
    condition: "ikinci-el",
    isExchangeable: "olabilir",
    hasDamper: false,
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
    field: keyof SulamaFormData,
    value: string | boolean | File[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kullanıcı oturum kontrolü
    if (!user) {
      alert("İlan oluşturmak için giriş yapmanız gerekiyor.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();

      // Temel bilgileri ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "photos" && key !== "showcasePhoto" && value) {
          // Price değerini parse et
          if (key === "price") {
            const parsedPrice = parseFormattedNumber(value.toString());
            if (parsedPrice) {
              submitData.append(key, parsedPrice);
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
      submitData.append("subType", "sulama");

      // Fotoğrafları ekle
      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo);
      });

      const response = await apiClient.post("/ads/tarim-romork", submitData, {
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

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            Sulama Tarım Römorku İlanı
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* İlan Detayları Kartı */}
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <EditNote color="primary" />
                  İlan Detayları
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* İlan Başlığı */}
                  <TextField
                    fullWidth
                    label="İlan Başlığı"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Örn: 2020 Model Sulama Tanker Römorku"
                    required
                  />

                  {/* Açıklama */}
                  <TextField
                    fullWidth
                    label="Açıklama"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Ürününüzün detaylı açıklamasını yazın..."
                    required
                  />

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {/* Üretim Yılı */}
                    <TextField
                      label="Üretim Yılı"
                      value={formData.productionYear}
                      onChange={(e) =>
                        handleInputChange("productionYear", e.target.value)
                      }
                      sx={{ minWidth: 150 }}
                      required
                    />

                    {/* Römork Markası */}
                    <FormControl sx={{ minWidth: 200 }} required>
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

                    <TextField
                      label="Fiyat"
                      value={formatNumber(formData.price)}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFormattedNumber(e.target.value)
                        )
                      }
                      placeholder="Örn: 150.000"
                      sx={{ maxWidth: 200 }}
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

                    {/* Hacim */}
                    <TextField
                      label="Hacim (Litre)"
                      value={formData.volume}
                      onChange={(e) =>
                        handleInputChange("volume", e.target.value)
                      }
                      placeholder="Örn: 5000"
                      sx={{ minWidth: 150 }}
                      required
                    />

                    {/* Durum */}
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        value={formData.condition}
                        onChange={(e) =>
                          handleInputChange("condition", e.target.value)
                        }
                        required
                      >
                        <MenuItem value="sifir">Sıfır</MenuItem>
                        <MenuItem value="ikinci-el">İkinci El</MenuItem>
                        <MenuItem value="hasarli">Hasarlı</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Takas */}
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Takas</InputLabel>
                      <Select
                        value={formData.isExchangeable}
                        onChange={(e) =>
                          handleInputChange("isExchangeable", e.target.value)
                        }
                      >
                        <MenuItem value="olabilir">Olabilir</MenuItem>
                        <MenuItem value="olmaz">Olmaz</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Damper */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.hasDamper}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange("hasDamper", e.target.checked)
                        }
                      />
                    }
                    label="Damperli"
                  />
                </Box>
              </Card>

              {/* Konum Kartı */}
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <LocationOn color="primary" />
                  Konum Bilgileri
                </Typography>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {/* Şehir */}
                  <FormControl sx={{ minWidth: 200 }}>
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
                  <FormControl sx={{ minWidth: 200 }}>
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
              </Card>

              {/* Fotoğraflar Kartı */}
              <Card variant="outlined" sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PhotoCamera color="primary" />
                  Fotoğraflar
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Vitrin Fotoğrafı */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      🌟 Vitrin Fotoğrafı
                      <Chip label="Zorunlu" color="error" size="small" />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      İlanınızın ana fotoğrafı olacak en iyi fotoğrafı seçin
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
                        sx={{ mb: 2 }}
                      >
                        {formData.showcasePhoto
                          ? "Vitrin Fotoğrafını Değiştir"
                          : "Vitrin Fotoğrafı Seç"}
                      </Button>
                    </label>

                    {/* Vitrin fotoğrafı önizlemesi */}
                    {formData.showcasePhoto && (
                      <Box
                        sx={{
                          position: "relative",
                          width: 200,
                          height: 150,
                          border: "3px solid",
                          borderColor: "primary.main",
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: 2,
                        }}
                      >
                        <img
                          src={
                            showcasePreview ||
                            URL.createObjectURL(formData.showcasePhoto)
                          }
                          alt="Vitrin Fotoğrafı"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <Chip
                          label="VİTRİN"
                          color="primary"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Diğer Fotoğraflar */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
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
                  </Box>
                </Box>
              </Card>

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "center", pt: 3 }}>
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
            </Box>
          </form>
        </Card>

        {/* Success Dialog */}
        <Dialog open={submitSuccess} onClose={handleSuccessClose}>
          <DialogTitle>Başarılı!</DialogTitle>
          <DialogContent>
            <Alert severity="success">
              İlanınız başarıyla oluşturuldu. Onaylandıktan sonra
              yayınlanacaktır.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuccessClose} variant="contained">
              Anasayfaya Dön
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default SulamaForm;
