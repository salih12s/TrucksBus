import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Header from "../../layout/Header";
import apiClient from "../../../api/client";

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
  productionYear: string;
  price: string;

  // Kuruyük Kapaklı(Kaya Tipi) Özel Bilgiler
  dingilSayisi: string;
  uzunluk: string; // metre
  genislik: string; // metre
  yukseklik: string; // metre
  istiapHaddi: string; // ton
  kapakSistemi: string;
  lastikDurumu: string; // yüzde
  takasli: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

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

// Form seçenekleri
const PRODUCTION_YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const TIRE_CONDITIONS = [
  "%90-100",
  "%75-89", 
  "%50-74",
  "%25-49",
  "%0-24"
];

const COVER_SYSTEMS = [
  "Hidrolik Kapak",
  "Manuel Kapak",
  "Yan Açılır Kapak",
  "Arka Açılır Kapak",
  "Diğer"
];

const KapakliKayaTipiForm: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    productionYear: '',
    price: '',
    dingilSayisi: '',
    uzunluk: '',
    genislik: '',
    yukseklik: '',
    istiapHaddi: '',
    kapakSistemi: '',
    lastikDurumu: '',
    takasli: 'hayır',
    cityId: '',
    districtId: '',
    photos: [],
    showcasePhoto: null,
    sellerName: '',
    phone: '',
    email: '',
    warranty: 'yok',
    negotiable: 'hayır',
    exchange: 'hayır',
    detailedInfo: ''
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get('/cities');
        setCities(response.data as City[]);
      } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
      }
    };
    fetchCities();
  }, []);

  // İlçeleri yükle
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.cityId) {
        try {
          const response = await apiClient.get(`/districts/${formData.cityId}`);
          setDistricts(response.data as District[]);
        } catch (error) {
          console.error('İlçeler yüklenirken hata:', error);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [formData.cityId]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  };

  const handleInputChange = (field: keyof FormData, value: string | File[] | File | null) => {
    if (field === 'phone' && typeof value === 'string') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };

  const handleShowcasePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, showcasePhoto: file }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) newErrors.push('Başlık zorunludur');
    if (!formData.description.trim()) newErrors.push('Açıklama zorunludur');
    if (!formData.productionYear) newErrors.push('Üretim yılı zorunludur');
    if (!formData.price.trim()) newErrors.push('Fiyat zorunludur');
    if (!formData.dingilSayisi.trim()) newErrors.push('Dingil sayısı zorunludur');
    if (!formData.uzunluk.trim()) newErrors.push('Uzunluk zorunludur');
    if (!formData.genislik.trim()) newErrors.push('Genişlik zorunludur');
    if (!formData.yukseklik.trim()) newErrors.push('Yükseklik zorunludur');
    if (!formData.istiapHaddi.trim()) newErrors.push('İstiap haddi zorunludur');
    if (!formData.kapakSistemi) newErrors.push('Kapak sistemi zorunludur');
    if (!formData.lastikDurumu) newErrors.push('Lastik durumu zorunludur');
    if (!formData.cityId) newErrors.push('Şehir zorunludur');
    if (!formData.districtId) newErrors.push('İlçe zorunludur');
    if (!formData.sellerName.trim()) newErrors.push('Satıcı adı zorunludur');
    if (!formData.phone.trim()) newErrors.push('Telefon zorunludur');
    if (!formData.email.trim()) newErrors.push('E-posta zorunludur');

    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const submitData = new FormData();
      
      // Temel bilgiler
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('productionYear', formData.productionYear);
      submitData.append('price', formData.price);
      
      // Kapaklı Kaya Tipi özel bilgileri
      submitData.append('dingilSayisi', formData.dingilSayisi);
      submitData.append('uzunluk', formData.uzunluk);
      submitData.append('genislik', formData.genislik);
      submitData.append('yukseklik', formData.yukseklik);
      submitData.append('istiapHaddi', formData.istiapHaddi);
      submitData.append('kapakSistemi', formData.kapakSistemi);
      submitData.append('lastikDurumu', formData.lastikDurumu);
      submitData.append('takasli', formData.takasli);
      
      // Konum
      submitData.append('cityId', formData.cityId);
      submitData.append('districtId', formData.districtId);
      
      // İletişim
      submitData.append('sellerName', formData.sellerName);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      
      // Ekstra
      submitData.append('warranty', formData.warranty);
      submitData.append('negotiable', formData.negotiable);
      submitData.append('exchange', formData.exchange);
      submitData.append('detailedInfo', formData.detailedInfo);

      // Fotoğraflar
      if (formData.showcasePhoto) {
        submitData.append('showcasePhoto', formData.showcasePhoto);
      }
      formData.photos.forEach((photo) => {
        submitData.append(`photos`, photo);
      });

      await apiClient.post('/ads/dorse', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/ads/success');
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      setErrors(['İlan gönderilirken bir hata oluştu. Lütfen tekrar deneyin.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Kapaklı Kaya Tipi İlanı Ver
          </Typography>

          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Temel Bilgiler */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Temel Bilgiler
            </Typography>

            <TextField
              fullWidth
              label="İlan Başlığı"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Üretim Yılı</InputLabel>
                <Select
                  value={formData.productionYear}
                  onChange={(e) => handleInputChange('productionYear', e.target.value)}
                  label="Üretim Yılı"
                  required
                >
                  {PRODUCTION_YEARS.map(year => (
                    <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Fiyat (TL)"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                margin="normal"
                required
              />
            </Box>

            {/* Kapaklı Kaya Tipi Özel Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Kapaklı Kaya Tipi Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Dingil Sayısı"
                value={formData.dingilSayisi}
                onChange={(e) => handleInputChange('dingilSayisi', e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Uzunluk (m)"
                value={formData.uzunluk}
                onChange={(e) => handleInputChange('uzunluk', e.target.value)}
                margin="normal"
                required
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Genişlik (m)"
                value={formData.genislik}
                onChange={(e) => handleInputChange('genislik', e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Yükseklik (m)"
                value={formData.yukseklik}
                onChange={(e) => handleInputChange('yukseklik', e.target.value)}
                margin="normal"
                required
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="İstiap Haddi (ton)"
                value={formData.istiapHaddi}
                onChange={(e) => handleInputChange('istiapHaddi', e.target.value)}
                margin="normal"
                required
              />

              <FormControl fullWidth>
                <InputLabel>Kapak Sistemi</InputLabel>
                <Select
                  value={formData.kapakSistemi}
                  onChange={(e) => handleInputChange('kapakSistemi', e.target.value)}
                  label="Kapak Sistemi"
                  required
                >
                  {COVER_SYSTEMS.map(system => (
                    <MenuItem key={system} value={system}>{system}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Lastik Durumu</InputLabel>
                <Select
                  value={formData.lastikDurumu}
                  onChange={(e) => handleInputChange('lastikDurumu', e.target.value)}
                  label="Lastik Durumu"
                  required
                >
                  {TIRE_CONDITIONS.map(condition => (
                    <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Takaslı</InputLabel>
                <Select
                  value={formData.takasli}
                  onChange={(e) => handleInputChange('takasli', e.target.value)}
                  label="Takaslı"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Konum Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Konum Bilgileri
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.cityId}
                  onChange={(e) => handleInputChange('cityId', e.target.value)}
                  label="Şehir"
                  required
                >
                  {cities.map(city => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.districtId}
                  onChange={(e) => handleInputChange('districtId', e.target.value)}
                  label="İlçe"
                  required
                  disabled={!formData.cityId}
                >
                  {districts.map(district => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Fotoğraflar */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Fotoğraflar
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mr: 2 }}
              >
                Vitrin Fotoğrafı Yükle
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleShowcasePhotoUpload}
                />
              </Button>
              {formData.showcasePhoto && (
                <Chip 
                  label={formData.showcasePhoto.name} 
                  onDelete={() => handleInputChange('showcasePhoto', null)}
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Diğer Fotoğrafları Yükle
                <VisuallyHiddenInput
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </Button>
            </Box>

            {formData.photos.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.photos.map((photo, index) => (
                  <Chip
                    key={index}
                    label={photo.name}
                    onDelete={() => removePhoto(index)}
                  />
                ))}
              </Box>
            )}

            {/* İletişim Bilgileri */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              İletişim Bilgileri
            </Typography>

            <TextField
              fullWidth
              label="Satıcı Adı"
              value={formData.sellerName}
              onChange={(e) => handleInputChange('sellerName', e.target.value)}
              margin="normal"
              required
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                margin="normal"
                required
              />
            </Box>

            {/* Ekstra Bilgiler */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Ekstra Bilgiler
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Garanti</InputLabel>
                <Select
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  label="Garanti"
                >
                  <MenuItem value="var">Var</MenuItem>
                  <MenuItem value="yok">Yok</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Pazarlık</InputLabel>
                <Select
                  value={formData.negotiable}
                  onChange={(e) => handleInputChange('negotiable', e.target.value)}
                  label="Pazarlık"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Takas</InputLabel>
                <Select
                  value={formData.exchange}
                  onChange={(e) => handleInputChange('exchange', e.target.value)}
                  label="Takas"
                >
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Detaylı Bilgi"
              value={formData.detailedInfo}
              onChange={(e) => handleInputChange('detailedInfo', e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : 'İlanı Yayınla'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default KapakliKayaTipiForm;
