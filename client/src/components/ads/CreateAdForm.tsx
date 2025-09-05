import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import apiClient from '../../api/client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Container,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  Euro,
  DateRange,
  Speed,
  Category,
  Business,
  Settings
} from '@mui/icons-material';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean';
  options?: string[];
  required: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

interface Variant {
  id: number;
  name: string;
}

interface AdFormData {
  categoryId: string;
  brandId: string;
  modelId: string;
  variantId?: string;
  title: string;
  description: string;
  price: string;
  year: string;
  mileage: string;
  location: string;
  customFields: Record<string, string | number | boolean>;
}

const CreateAdForm: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categoryFields, setCategoryFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<AdFormData>({
    categoryId: '',
    brandId: '',
    modelId: '',
    variantId: '',
    title: '',
    description: '',
    price: '',
    year: '',
    mileage: '',
    location: '',
    customFields: {}
  });

  const steps = ['Kategori Seçimi', 'Araç Bilgileri', 'İlan Detayları', 'Özel Alanlar'];

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load brands when category changes
  useEffect(() => {
    if (formData.categoryId) {
      loadBrands(formData.categoryId);
      loadCategoryFields(formData.categoryId);
      setBrands([]);
      setModels([]);
      setVariants([]);
      setFormData(prev => ({ ...prev, brandId: '', modelId: '', variantId: '' }));
    }
  }, [formData.categoryId]);

  // Load models when brand changes
  useEffect(() => {
    if (formData.brandId) {
      loadModels(formData.brandId);
      setModels([]);
      setVariants([]);
      setFormData(prev => ({ ...prev, modelId: '', variantId: '' }));
    }
  }, [formData.brandId]);

  // Load variants when model changes
  useEffect(() => {
    if (formData.modelId) {
      loadVariants(formData.modelId);
      setVariants([]);
      setFormData(prev => ({ ...prev, variantId: '' }));
    }
  }, [formData.modelId]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data as Category[]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Kategoriler yüklenemedi');
    }
  };

  const loadBrands = async (categoryId: string) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/brands`);
      setBrands(response.data as Brand[]);
    } catch (error) {
      console.error('Error loading brands:', error);
      setError('Markalar yüklenemedi');
    }
  };

  const loadModels = async (brandId: string) => {
    try {
      const response = await apiClient.get(`/categories/brands/${brandId}/models`);
      setModels(response.data as Model[]);
    } catch (error) {
      console.error('Error loading models:', error);
      setError('Modeller yüklenemedi');
    }
  };

  const loadVariants = async (modelId: string) => {
    try {
      const response = await apiClient.get(`/categories/models/${modelId}/variants`);
      setVariants(response.data as Variant[]);
    } catch (error) {
      console.error('Error loading variants:', error);
      setError('Varyantlar yüklenemedi');
    }
  };

  const loadCategoryFields = async (categoryId: string) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/fields`);
      const data = response.data as { fields: FormField[] };
      setCategoryFields(data.fields);
    } catch (error) {
      console.error('Error loading category fields:', error);
      setError('Kategori alanları yüklenemedi');
    }
  };

  const handleInputChange = (name: string, value: string | number | boolean) => {
    if (name.startsWith('custom_')) {
      const fieldName = name.replace('custom_', '');
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderField = (field: FormField) => {
    const fieldName = `custom_${field.name}`;
    const value = formData.customFields[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <FormControl fullWidth key={field.name} sx={{ mb: 2 }}>
            <InputLabel required={field.required}>{field.label}</InputLabel>
            <Select
              value={String(value)}
              label={field.label}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              required={field.required}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            key={field.name}
            fullWidth
            multiline
            rows={3}
            label={field.label}
            value={String(value)}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            required={field.required}
            sx={{ mb: 2 }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Checkbox
                checked={value === true}
                onChange={(e) => handleInputChange(fieldName, e.target.checked)}
              />
            }
            label={field.label}
            sx={{ mb: 2, display: 'block' }}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            type="number"
            label={field.label}
            value={String(value)}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            required={field.required}
            sx={{ mb: 2 }}
          />
        );

      default:
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            value={String(value)}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            required={field.required}
            sx={{ mb: 2 }}
          />
        );
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Category color="primary" />
              Kategori Seçimi
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel required>Kategori</InputLabel>
              <Select
                value={formData.categoryId}
                label="Kategori"
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DirectionsCar />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business color="primary" />
              Araç Bilgileri
            </Typography>
            
            {brands.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel required>Marka</InputLabel>
                <Select
                  value={formData.brandId}
                  label="Marka"
                  onChange={(e) => handleInputChange('brandId', e.target.value)}
                  required
                >
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {models.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel required>Model</InputLabel>
                <Select
                  value={formData.modelId}
                  label="Model"
                  onChange={(e) => handleInputChange('modelId', e.target.value)}
                  required
                >
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {variants.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Varyant</InputLabel>
                <Select
                  value={formData.variantId}
                  label="Varyant"
                  onChange={(e) => handleInputChange('variantId', e.target.value)}
                >
                  {variants.map((variant) => (
                    <MenuItem key={variant.id} value={variant.id}>
                      {variant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar color="primary" />
              İlan Detayları
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="İlan Başlığı"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Fiyat"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Euro /></InputAdornment>,
                  }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Model Yılı"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  inputProps={{ min: 1980, max: new Date().getFullYear() + 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><DateRange /></InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Kilometre"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Speed /></InputAdornment>,
                  }}
                />

                <TextField
                  fullWidth
                  label="Konum"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                  placeholder="Şehir, İlçe"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                  }}
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Açıklama"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings color="primary" />
              Kategori Özel Alanları
            </Typography>
            
            {categoryFields.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {categoryFields.map((field, index) => (
                  <Box key={index}>
                    {renderField(field)}
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                Bu kategori için özel alan bulunmuyor.
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Bilinmeyen adım';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        modelId: formData.modelId ? parseInt(formData.modelId) : null,
        variantId: formData.variantId ? parseInt(formData.variantId) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null
      };

      await apiClient.post('/ads', submitData);
      setSuccess('İlan başarıyla oluşturuldu ve onay bekliyor!');
      
      // Reset form
      setFormData({
        categoryId: '',
        brandId: '',
        modelId: '',
        variantId: '',
        title: '',
        description: '',
        price: '',
        year: '',
        mileage: '',
        location: '',
        customFields: {}
      });
      setActiveStep(0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'İlan oluşturulurken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          İlan vermek için giriş yapmanız gerekiyor.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Yeni İlan Ver
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {renderStepContent(activeStep)}
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Geri
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'İlan Oluşturuluyor...' : 'İlan Ver'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && !formData.categoryId) ||
                    (activeStep === 1 && !formData.brandId) ||
                    (activeStep === 2 && (!formData.title || !formData.location))
                  }
                >
                  İleri
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAdForm;
