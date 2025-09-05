import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  Menu,
  IconButton,
  Divider,
  Paper,
  Avatar,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  TrendingUp,
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
  Search,
  GridView,
  ViewList,
  LocationOn,
  CalendarToday,
  DirectionsCar
} from '@mui/icons-material';
import apiClient from '../api/client';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  category: {
    id: string;
    name: string;
    displayName: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  model?: {
    id: string;
    name: string;
  };
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  year?: number;
  mileage?: number;
  phone?: string;
}

const MyAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadUserAds();
  }, []);

  const loadUserAds = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/ads/my-ads');
      setAds(response.data as Ad[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'İlanlar yüklenirken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!selectedAdId) return;

    try {
      await apiClient.delete(`/ads/${selectedAdId}`);
      setAds(prev => prev.filter(ad => ad.id !== selectedAdId));
      setDeleteDialogOpen(false);
      setSelectedAdId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'İlan silinirken hata oluştu';
      setError(errorMessage);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, adId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdId(adId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAdId(null);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'EXPIRED': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle />;
      case 'PENDING': return <Schedule />;
      case 'REJECTED': return <Cancel />;
      case 'EXPIRED': return <Warning />;
      default: return <Schedule />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Yayında';
      case 'PENDING': return 'Onay Bekliyor';
      case 'REJECTED': return 'Reddedildi';
      case 'EXPIRED': return 'Süresi Doldu';
      default: return status;
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderAdCard = (ad: Ad) => (
    <Card key={ad.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={ad.images.find(img => img.isPrimary)?.url || '/placeholder-vehicle.jpg'}
          alt={ad.title}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <Chip
            icon={getStatusIcon(ad.status)}
            label={getStatusText(ad.status)}
            color={getStatusColor(ad.status)}
            size="small"
          />
        </Box>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, ad.id)}
            sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {ad.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DirectionsCar sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {ad.category.displayName}
            {ad.brand && ` • ${ad.brand.name}`}
            {ad.model && ` ${ad.model.name}`}
          </Typography>
        </Box>

        {ad.year && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {ad.year} Model
              {ad.mileage && ` • ${ad.mileage.toLocaleString()} km`}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {ad.location}
          </Typography>
        </Box>

        <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
          {formatCurrency(ad.price, ad.currency)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {ad.viewCount} görüntülenme
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formatDate(ad.createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderAdList = (ad: Ad) => (
    <Paper key={ad.id} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar
          src={ad.images.find(img => img.isPrimary)?.url}
          variant="rounded"
          sx={{ width: 80, height: 80 }}
        >
          <DirectionsCar />
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" noWrap sx={{ maxWidth: '60%' }}>
              {ad.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={getStatusIcon(ad.status)}
                label={getStatusText(ad.status)}
                color={getStatusColor(ad.status)}
                size="small"
              />
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, ad.id)}>
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {ad.category.displayName}
            </Typography>
            {ad.year && (
              <Typography variant="body2" color="text.secondary">
                {ad.year} Model
              </Typography>
            )}
            {ad.mileage && (
              <Typography variant="body2" color="text.secondary">
                {ad.mileage.toLocaleString()} km
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              {ad.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {formatCurrency(ad.price, ad.currency)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {ad.viewCount}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatDate(ad.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          İlanlarım ({filteredAds.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={viewMode === 'grid' ? 'Liste Görünümü' : 'Kart Görünümü'}>
            <IconButton
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              color="primary"
            >
              {viewMode === 'grid' ? <ViewList /> : <GridView />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="İlan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              label="Durum"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="APPROVED">Yayında</MenuItem>
              <MenuItem value="PENDING">Onay Bekliyor</MenuItem>
              <MenuItem value="REJECTED">Reddedildi</MenuItem>
              <MenuItem value="EXPIRED">Süresi Doldu</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {filteredAds.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchTerm || statusFilter !== 'all' ? 'Arama kriterlerine uygun ilan bulunamadı' : 'Henüz hiç ilanınız yok'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Farklı filtreler deneyebilir veya arama terimini değiştirebilirsiniz.' 
              : 'İlk ilanınızı vererek başlayın.'}
          </Typography>
          {(!searchTerm && statusFilter === 'all') && (
            <Button variant="contained" startIcon={<Add />}>
              İlan Ver
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 3 
            }}>
              {filteredAds.map((ad) => (
                renderAdCard(ad)
              ))}
            </Box>
          ) : (
            <Box>
              {filteredAds.map(renderAdList)}
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Visibility sx={{ mr: 1 }} />
          Görüntüle
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <TrendingUp sx={{ mr: 1 }} />
          İstatistikler
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>İlanı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button onClick={handleDeleteAd} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAds;
