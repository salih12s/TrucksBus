import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import Header from '../../../layout/Header';
import apiClient from '../../../../api/client';

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
  axleCount: string;
  loadCapacity: string;
  chassisType: string;
  tireCondition: string;
  isExchangeable: string;
  
  // Fotoğraf bilgileri
  uploadedImages: File[];
  showcaseImageIndex: number;
  
  // İletişim ve fiyat bilgileri
  price: string;
  priceType: string;
  currency: string;
  sellerPhone: string;
  sellerName: string;
  sellerEmail: string;
  city: string;
  district: string;
}

interface RootState {
  auth: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
    } | null;
  };
}

const steps = ['İlan Detayları', 'Fotoğraflar', 'İletişim & Fiyat'];

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const KapaliKasaForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Seçilen marka, model, varyant bilgileri location.state'den gelir
  const selectedBrand = location.state?.brand;
  const selectedModel = location.state?.model;
  const selectedVariant = location.state?.variant;

  const [activeStep, setActiveStep] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    productionYear: '',
    axleCount: '',
    loadCapacity: '',
    chassisType: '',
    tireCondition: '',
    isExchangeable: 'Hayır',
    uploadedImages: [],
    showcaseImageIndex: 0,
    price: '',
    priceType: 'Sabit',
    currency: 'TRY',
    sellerPhone: user?.phone || '',
    sellerName: user?.name || '',
    sellerEmail: user?.email || '',
    city: '',
    district: ''
  });

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/locations/cities');
        setCities(response.data as City[]);
      } catch (error) {
        console.error('Şehirler yüklenirken hata oluştu:', error);
        setSnackbar({ open: true, message: 'Şehirler yüklenirken hata oluştu', severity: 'error' });
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
        const response = await apiClient.get(`/locations/districts/${formData.city}`);
        setDistricts(response.data as District[]);
      } catch (error) {
        console.error('İlçeler yüklenirken hata oluştu:', error);
        setSnackbar({ open: true, message: 'İlçeler yüklenirken hata oluştu', severity: 'error' });
      }
    };

    fetchDistricts();
  }, [formData.city]);

  const handleInputChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = _event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (_event: SelectChangeEvent<string>) => {
    const { name, value } = _event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 10) {
      setSnackbar({ open: true, message: 'En fazla 10 fotoğraf yükleyebilirsiniz', severity: 'error' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      uploadedImages: files
    }));
  };

  const handleShowcaseImageSelect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      showcaseImageIndex: index
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.uploadedImages.filter((_, i) => i !== index);
      return {
        ...prev,
        uploadedImages: newImages,
        showcaseImageIndex: prev.showcaseImageIndex >= newImages.length ? 0 : prev.showcaseImageIndex
      };
    });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.title.trim()) {
          setSnackbar({ open: true, message: 'İlan başlığı zorunludur', severity: 'error' });
          return false;
        }
        if (!formData.description.trim()) {
          setSnackbar({ open: true, message: 'Açıklama zorunludur', severity: 'error' });
          return false;
        }
        if (!formData.productionYear) {
          setSnackbar({ open: true, message: 'Üretim yılı zorunludur', severity: 'error' });
          return false;
        }
        return true;
      case 1:
        if (formData.uploadedImages.length === 0) {
          setSnackbar({ open: true, message: 'En az bir fotoğraf yüklemeniz gerekiyor', severity: 'error' });
          return false;
        }
        return true;
      case 2:
        if (!formData.price) {
          setSnackbar({ open: true, message: 'Fiyat zorunludur', severity: 'error' });
          return false;
        }
        if (!formData.sellerName.trim()) {
          setSnackbar({ open: true, message: 'Satıcı adı zorunludur', severity: 'error' });
          return false;
        }
        if (!formData.sellerPhone.trim()) {
          setSnackbar({ open: true, message: 'Telefon numarası zorunludur', severity: 'error' });
          return false;
        }
        if (!formData.city) {
          setSnackbar({ open: true, message: 'Şehir seçimi zorunludur', severity: 'error' });
          return false;
        }
        if (!formData.district) {
          setSnackbar({ open: true, message: 'İlçe seçimi zorunludur', severity: 'error' });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    const confirmed = window.confirm('İlanınızı yayınlamak istediğinizden emin misiniz?');
    if (!confirmed) return;

    try {
      setSubmitLoading(true);

      const submitData = new FormData();
      
      // Temel bilgiler
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('productionYear', formData.productionYear);
      submitData.append('axleCount', formData.axleCount);
      submitData.append('loadCapacity', formData.loadCapacity);
      submitData.append('chassisType', formData.chassisType);
      submitData.append('tireCondition', formData.tireCondition);
      submitData.append('isExchangeable', formData.isExchangeable);
      
      // Marka, model, varyant bilgileri
      if (selectedBrand) {
        submitData.append('brandId', selectedBrand.id);
        submitData.append('brandName', selectedBrand.name);
      }
      if (selectedModel) {
        submitData.append('modelId', selectedModel.id);
        submitData.append('modelName', selectedModel.name);
      }
      if (selectedVariant) {
        submitData.append('variantId', selectedVariant.id);
        submitData.append('variantName', selectedVariant.name);
      }
      
      // Kategori bilgisi
      submitData.append('category', 'TarimRomork');
      submitData.append('subType', 'KapaliKasa');
      
      // Fiyat ve iletişim bilgileri
      submitData.append('price', formData.price);
      submitData.append('priceType', formData.priceType);
      submitData.append('currency', formData.currency);
      submitData.append('sellerName', formData.sellerName);
      submitData.append('sellerPhone', formData.sellerPhone);
      submitData.append('sellerEmail', formData.sellerEmail);
      submitData.append('city', formData.city);
      submitData.append('district', formData.district);
      
      // Fotoğraflar
      formData.uploadedImages.forEach((file, index) => {
        submitData.append('images', file);
        if (index === formData.showcaseImageIndex) {
          submitData.append('showcaseImageIndex', index.toString());
        }
      });

      const response = await apiClient.post('/listings', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        setSnackbar({ open: true, message: 'İlanınız başarıyla yayınlandı!', severity: 'success' });
        setTimeout(() => {
          navigate('/listings');
        }, 2000);
      }
    } catch (error) {
      console.error('İlan yayınlanırken hata oluştu:', error);
      setSnackbar({ open: true, message: 'İlan yayınlanırken hata oluştu', severity: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="İlan Başlığı *"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Kapalı kasa tarım römork"
            />
            
            <TextField
              fullWidth
              label="Açıklama *"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              placeholder="Kapalı kasa tarım romorkunuz hakkında detaylı bilgi verin"
            />

            <FormControl fullWidth>
              <InputLabel>Üretim Yılı *</InputLabel>
              <Select
                name="productionYear"
                value={formData.productionYear}
                onChange={handleSelectChange}
                label="Üretim Yılı *"
              >
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
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
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Yük Kapasitesi (ton)"
              name="loadCapacity"
              value={formData.loadCapacity}
              onChange={handleInputChange}
              placeholder="Örn: 8"
            />

            <FormControl fullWidth>
              <InputLabel>Şasi Tipi</InputLabel>
              <Select
                name="chassisType"
                value={formData.chassisType}
                onChange={handleSelectChange}
                label="Şasi Tipi"
              >
                <MenuItem value="Çelik Şasi">Çelik Şasi</MenuItem>
                <MenuItem value="Galvanizli Şasi">Galvanizli Şasi</MenuItem>
                <MenuItem value="Alüminyum Şasi">Alüminyum Şasi</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Lastik Durumu</InputLabel>
              <Select
                name="tireCondition"
                value={formData.tireCondition}
                onChange={handleSelectChange}
                label="Lastik Durumu"
              >
                <MenuItem value="Yeni">Yeni</MenuItem>
                <MenuItem value="Çok İyi">Çok İyi</MenuItem>
                <MenuItem value="İyi">İyi</MenuItem>
                <MenuItem value="Orta">Orta</MenuItem>
                <MenuItem value="Değişmeli">Değişmeli</MenuItem>
              </Select>
            </FormControl>

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Fotoğraf Yükleyin (En fazla 10 adet)</Typography>
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ alignSelf: 'flex-start' }}
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {formData.uploadedImages.map((file, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Yüklenen ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          border: formData.showcaseImageIndex === index ? '3px solid #1976d2' : '1px solid #ddd',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleShowcaseImageSelect(index)}
                      />
                      <Button
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          minWidth: 24,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                      >
                        ×
                      </Button>
                      {formData.showcaseImageIndex === index && (
                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            bottom: -20,
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            color: 'primary.main',
                            fontWeight: 'bold'
                          }}
                        >
                          Vitrin
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Vitrin fotoğrafı seçmek için fotoğrafa tıklayın
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">İletişim Bilgileri</Typography>
            
            <TextField
              fullWidth
              label="Satıcı Adı *"
              name="sellerName"
              value={formData.sellerName}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              label="Telefon Numarası *"
              name="sellerPhone"
              value={formData.sellerPhone}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              label="E-posta"
              name="sellerEmail"
              type="email"
              value={formData.sellerEmail}
              onChange={handleInputChange}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
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

            <Typography variant="h6">Fiyat Bilgileri</Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Fiyat *"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Para Birimi</InputLabel>
                <Select
                  name="currency"
                  value={formData.currency}
                  onChange={handleSelectChange}
                  label="Para Birimi"
                >
                  <MenuItem value="TRY">TRY</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Fiyat Tipi</InputLabel>
              <Select
                name="priceType"
                value={formData.priceType}
                onChange={handleSelectChange}
                label="Fiyat Tipi"
              >
                <MenuItem value="Sabit">Sabit Fiyat</MenuItem>
                <MenuItem value="Pazarlık">Pazarlığa Açık</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              Kapalı Kasa Tarım Römorku İlanı Ver
            </Typography>

            {selectedBrand && selectedModel && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>{selectedBrand.name} {selectedModel.name} {selectedVariant?.name || ''}</strong> için ilan oluşturuyorsunuz
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Geri
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    startIcon={submitLoading ? <CircularProgress size={20} /> : null}
                  >
                    {submitLoading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
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
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default KapaliKasaForm;
