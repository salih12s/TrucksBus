import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import Header from "../../../layout/Header";
import apiClient from "../../../../api/client";
import ConfirmationModal from "../../../modals/ConfirmationModal";

// Kılçık Şasi Markaları (MainLayout'tan alındı)
const KILCIK_SASI_BRANDS = [
  "Seçiniz",
  "Abd Treyler",
  "Adakon Treyler",
  "Adem Usta Proohauss",
  "AGS Treyler",
  "Akar Cihat",
  "Akmanlar Damper",
  "Alamen",
  "Alim",
  "Alp-Kar",
  "Alpsan",
  "ART Trailer",
  "Askan Treyler",
  "ASY Treyler",
  "Aydeniz Dorse",
  "Beyfem Dorse",
  "Bio Treyler",
  "Can Damper Karoser",
  "Cangüll Treyler",
  "Caselli Treyler",
  "CastroMax Trailers",
  "Ceytech",
  "Coşkun",
  "Doğuş Dorse",
  "Doruk Treyler",
  "ELM Treysan Trailer",
  "EMK Treyler",
  "Esatech Trailer",
  "Eşmeliler",
  "Fesan Makina",
  "Fors Treyler",
  "Fruehauf",
  "FSM",
  "Global City",
  "Global City Trailer",
  "Gülistan",
  "Güneş",
  "Güneyşan",
  "Güreoğlu",
  "Gürleşenyl Treyler",
  "Güveneller",
  "Has Treyler",
  "Hürsan",
  "Iskar Treyler",
  "İhsan Treyler",
  "İki Kardeş",
  "İkon Treyler",
  "Kalkan Treyler",
  "Kardeşler",
  "Kartallar",
  "Konza Trailer",
  "Kögel Trailer",
  "Krone",
  "LTF Treyler",
  "Marrka Treyler",
  "MAS Trailer",
  "Mas Treyler",
  "Maxtır Trailer",
  "Mehsan Treyler",
  "Meral Dorse",
  "Meshaus Dorse",
  "Metsan",
  "Mobil Treyler",
  "MRC Treyler",
  "MS Muratsan Treyler",
  "Nedex",
  "Neka",
  "Nevkarsan",
  "Nuri Usta Treyler",
  "Nükte Trailer",
  "Oktar Treyler",
  "OKT Trailer",
  "Optimak Treyler",
  "Orthaus Treyler",
  "OtoÇinler",
  "Otokar",
  "Oymak Cargomaster",
  "Oymak Träger",
  "Özenir Dorse",
  "Özgül Treyler",
  "Öztfn Treyler",
  "Öztreyler",
  "Paşalar Mehmet Treyler",
  "Paşalar Treyler",
  "Paşaoğlu Dorse Treyler",
  "Payas Dorse",
  "Ram-Kar",
  "Ram Treyler",
  "Reis Treyler",
  "Sancak Treyler",
  "Schmitz Cargobull",
  "Seçsan Treyler",
  "Self Frigo",
  "Semiturk",
  "Sena Treyler",
  "Serin Dorse",
  "Set Treyler",
  "Seyit Usta",
  "Simbоxx",
  "Sim Treyler",
  "Sistem Damper Treyler",
  "Star Yağcılar",
  "Şen–San",
  "Takdir Dorse",
  "Tanı Tır",
  "Tırsan",
  "Tirkon",
  "Töke Makina",
  "Traco",
  "Transfer Treyler",
  "Tuncay İş",
  "Warkas",
  "Wielton",
  "Yalçın Dorse",
  "Yeksan",
  "Yelsan Treyler",
  "Yıldız",
  "Yıldızlar Damper",
  "Zafer Treyler",
  "Özel Üretim",
  "Diğer",
];

// Types
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
  dorseBrand: string;
  axleCount: string;
  loadCapacity: string;
  hookType: string;
  hydraulicSystem: string;
  tireCondition: string;
  isExchangeable: string;

  // Fotoğraf bilgileri
  uploadedImages: File[];
  showcaseImageIndex: number;

  // Fiyat ve konum bilgileri
  price: string;
  currency: string;
  city: string;
  district: string;
}

const steps = ["İlan Detayları", "Fotoğraflar", "Konum & Fiyat"];

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const KilcikSasiForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Seçilen marka, model, varyant bilgileri location.state'den gelir
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;
  const selectedCategory = location.state?.category;

  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    dorseBrand: "Seçiniz",
    axleCount: "",
    loadCapacity: "",
    hookType: "",
    hydraulicSystem: "",
    tireCondition: "",
    isExchangeable: "Hayır",
    uploadedImages: [],
    showcaseImageIndex: 0,
    price: "",
    currency: "TRY",
    city: "",
    district: "",
  });

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Şehirler yüklenirken hata oluştu:", error);
        setSnackbar({
          open: true,
          message: "Şehirler yüklenirken hata oluştu",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.city) {
        setDistricts([]);
        return;
      }

      try {
        const response = await apiClient.get(
          `/cities/${formData.city}/districts`,
        );
        setDistricts(response.data as District[]);
      } catch (error) {
        console.error("İlçeler yüklenirken hata oluştu:", error);
        setSnackbar({
          open: true,
          message: "İlçeler yüklenirken hata oluştu",
          severity: "error",
        });
      }
    };

    fetchDistricts();
  }, [formData.city]);

  const handleInputChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = _event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (_event: SelectChangeEvent<string>) => {
    const { name, value } = _event.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 10) {
      setSnackbar({
        open: true,
        message: "En fazla 10 fotoğraf yükleyebilirsiniz",
        severity: "error",
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      uploadedImages: files,
    }));
  };

  const handleShowcaseImageSelect = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      showcaseImageIndex: index,
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.uploadedImages.filter((_, i) => i !== index);
      return {
        ...prev,
        uploadedImages: newImages,
        showcaseImageIndex:
          prev.showcaseImageIndex >= newImages.length
            ? 0
            : prev.showcaseImageIndex,
      };
    });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.title.trim()) {
          setSnackbar({
            open: true,
            message: "İlan başlığı zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.description.trim()) {
          setSnackbar({
            open: true,
            message: "Açıklama zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.productionYear) {
          setSnackbar({
            open: true,
            message: "Üretim yılı zorunludur",
            severity: "error",
          });
          return false;
        }
        return true;
      case 1:
        if (formData.uploadedImages.length === 0) {
          setSnackbar({
            open: true,
            message: "En az bir fotoğraf yüklemeniz gerekiyor",
            severity: "error",
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.price) {
          setSnackbar({
            open: true,
            message: "Fiyat zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.city) {
          setSnackbar({
            open: true,
            message: "Şehir seçimi zorunludur",
            severity: "error",
          });
          return false;
        }
        if (!formData.district) {
          setSnackbar({
            open: true,
            message: "İlçe seçimi zorunludur",
            severity: "error",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setConfirmModalOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    setConfirmModalOpen(false);

    try {
      setSubmitLoading(true);

      const submitData = new FormData();

      // Temel bilgiler
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("productionYear", formData.productionYear);
      submitData.append("axleCount", formData.axleCount);
      submitData.append("loadCapacity", formData.loadCapacity);
      submitData.append("hookType", formData.hookType);
      submitData.append("hydraulicSystem", formData.hydraulicSystem);
      submitData.append("tireCondition", formData.tireCondition);
      submitData.append("isExchangeable", formData.isExchangeable);

      // Dorse markası
      if (formData.dorseBrand && formData.dorseBrand !== "Seçiniz") {
        submitData.append("dorseBrand", formData.dorseBrand);
      }

      // Marka, model, varyant bilgileri
      if (selectedBrand) {
        submitData.append("brandId", selectedBrand.id);
        submitData.append("brandName", selectedBrand.name);
      }
      if (selectedModel) {
        submitData.append("modelId", selectedModel.id);
        submitData.append("modelName", selectedModel.name);
      }
      if (selectedVariant) {
        submitData.append("variantId", selectedVariant.id);
        submitData.append("variantName", selectedVariant.name);
      }

      // Kategori bilgisi - location.state'den gelen category slug'ını kullan
      if (selectedCategory?.slug) {
        submitData.append("category", selectedCategory.slug);
      } else {
        // Fallback: URL'den category slug'ı al
        const pathParts = location.pathname.split("/");
        const categoryIndex = pathParts.indexOf("categories");
        if (categoryIndex !== -1 && pathParts[categoryIndex + 1]) {
          submitData.append("category", pathParts[categoryIndex + 1]);
        }
      }
      submitData.append("subType", "KilcikSasi");

      // Fiyat ve konum bilgileri
      submitData.append("price", formData.price.replace(/\./g, ""));
      submitData.append("currency", formData.currency || "TRY"); // Formatlamayı kaldır
      submitData.append("cityId", formData.city);
      submitData.append("districtId", formData.district);

      // Fotoğraflar
      formData.uploadedImages.forEach((file, index) => {
        submitData.append("images", file);
        if (index === formData.showcaseImageIndex) {
          submitData.append("showcaseImageIndex", index.toString());
        }
      });

      const response = await apiClient.post("/ads", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setSnackbar({
          open: true,
          message: "İlanınız başarıyla yayınlandı!",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("İlan yayınlanırken hata oluştu:", error);
      setSnackbar({
        open: true,
        message: "İlan yayınlanırken hata oluştu",
        severity: "error",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="İlan Başlığı *"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Kılçık şasi"
            />

            <TextField
              fullWidth
              label="Açıklama *"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              placeholder="Kılçık şasiniz hakkında detaylı bilgi verin"
            />

            <FormControl fullWidth>
              <InputLabel>Üretim Yılı *</InputLabel>
              <Select
                name="productionYear"
                value={formData.productionYear}
                onChange={handleSelectChange}
                label="Üretim Yılı *"
              >
                {Array.from(
                  { length: 30 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Dorse Markası</InputLabel>
              <Select
                name="dorseBrand"
                value={formData.dorseBrand}
                onChange={handleSelectChange}
                label="Dorse Markası"
              >
                {KILCIK_SASI_BRANDS.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Aks Sayısı</InputLabel>
              <Select
                name="axleCount"
                value={formData.axleCount}
                onChange={handleSelectChange}
                label="Aks Sayısı"
              >
                <MenuItem value="1">1 Aks</MenuItem>
                <MenuItem value="2">2 Aks</MenuItem>
                <MenuItem value="3">3 Aks</MenuItem>
                <MenuItem value="4">4 Aks</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Yük Kapasitesi (ton)"
              name="loadCapacity"
              value={formData.loadCapacity}
              onChange={handleInputChange}
              placeholder="Örn: 25"
            />

            <FormControl fullWidth>
              <InputLabel>Kanca Tipi</InputLabel>
              <Select
                name="hookType"
                value={formData.hookType}
                onChange={handleSelectChange}
                label="Kanca Tipi"
              >
                <MenuItem value="Sabit Kanca">Sabit Kanca</MenuItem>
                <MenuItem value="Hareketli Kanca">Hareketli Kanca</MenuItem>
                <MenuItem value="Çift Kanca">Çift Kanca</MenuItem>
                <MenuItem value="Tek Kanca">Tek Kanca</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Hidrolik Sistemi</InputLabel>
              <Select
                name="hydraulicSystem"
                value={formData.hydraulicSystem}
                onChange={handleSelectChange}
                label="Hidrolik Sistemi"
              >
                <MenuItem value="Var">Var</MenuItem>
                <MenuItem value="Yok">Yok</MenuItem>
                <MenuItem value="Modifiye Edilmiş">Modifiye Edilmiş</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Lastik Durumu (%)"
              name="tireCondition"
              type="number"
              value={formData.tireCondition}
              onChange={handleInputChange}
              placeholder="Örn: 80"
              helperText="Lastik durumunu yüzde olarak girin (0-100)"
              inputProps={{ min: 0, max: 100 }}
            />

            <FormControl fullWidth>
              <InputLabel>Takas</InputLabel>
              <Select
                name="isExchangeable"
                value={formData.isExchangeable}
                onChange={handleSelectChange}
                label="Takas"
              >
                <MenuItem value="Evet">Evet</MenuItem>
                <MenuItem value="Hayır">Hayır</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">
              Fotoğraf Yükleyin (En fazla 10 adet)
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Fotoğraf Seç
              <VisuallyHiddenInput
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>

            {formData.uploadedImages.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Yüklenen Fotoğraflar ({formData.uploadedImages.length}/10)
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {formData.uploadedImages.map((file, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Yüklenen ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          border:
                            formData.showcaseImageIndex === index
                              ? "3px solid #1976d2"
                              : "1px solid #ddd",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                        onClick={() => handleShowcaseImageSelect(index)}
                      />
                      <Button
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          minWidth: 24,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: "error.main",
                          color: "white",
                          "&:hover": { bgcolor: "error.dark" },
                        }}
                      >
                        ×
                      </Button>
                      {formData.showcaseImageIndex === index && (
                        <Typography
                          variant="caption"
                          sx={{
                            position: "absolute",
                            bottom: -20,
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            color: "primary.main",
                            fontWeight: "bold",
                          }}
                        >
                          Vitrin
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Vitrin fotoğrafı seçmek için fotoğrafa tıklayın
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6">Konum Bilgileri</Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Şehir *</InputLabel>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={handleSelectChange}
                  label="Şehir *"
                  disabled={loading}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>İlçe *</InputLabel>
                <Select
                  name="district"
                  value={formData.district}
                  onChange={handleSelectChange}
                  label="İlçe *"
                  disabled={!formData.city || districts.length === 0}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              Fiyat Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="Fiyat"
              name="price"
              value={formData.price}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setFormData({ ...formData, price: formatted });
              }}
              placeholder="Örn: 1.500.000"
              helperText="Fiyatı Türk Lirası (TL) cinsinden giriniz"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ToggleButtonGroup
                      value={formData.currency || "TRY"}
                      exclusive
                      onChange={(_, v) =>
                        v &&
                        setFormData((prev: any) => ({ ...prev, currency: v }))
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
                      <ToggleButton value="TRY">₺</ToggleButton>
                      <ToggleButton value="USD">$</ToggleButton>
                      <ToggleButton value="EUR">€</ToggleButton>
                    </ToggleButtonGroup>
                  </InputAdornment>
                ),
              }}
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
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              Kılçık Şasi İlanı Ver
            </Typography>

            {selectedBrand && selectedModel && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>
                  {selectedBrand.name} {selectedModel.name}{" "}
                  {selectedVariant?.name || ""}
                </strong>{" "}
                için ilan oluşturuyorsunuz
              </Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Geri
              </Button>

              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    startIcon={
                      submitLoading ? <CircularProgress size={20} /> : null
                    }
                  >
                    {submitLoading ? "Yayınlanıyor..." : "İlanı Yayınla"}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    İleri
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

        <ConfirmationModal
          open={confirmModalOpen}
          title="İlanı Yayınla"
          message="İlanınızı yayınlamak istediğinizden emin misiniz? Yayınlandıktan sonra inceleme sürecine girecektir."
          onConfirm={handleConfirmedSubmit}
          onCancel={() => setConfirmModalOpen(false)}
          confirmText="Yayınla"
          cancelText="İptal"
        />
      </Box>
    </>
  );
};

export default KilcikSasiForm;
