import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  IconButton,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  Fab,
  ImageList,
  ImageListItem,
  Skeleton
} from '@mui/material';
import {
  ArrowBack,
  Phone,
  Message,
  Share,
  Favorite,
  FavoriteBorder,
  LocationOn,
  CalendarToday,
  DirectionsCar,
  Visibility,
  Report,
  Close,
  WhatsApp,
  Email,
  Facebook,
  Twitter
} from '@mui/icons-material';
import apiClient from '../api/client';

interface AdDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  status: string;
  createdAt: string;
  viewCount: number;
  year?: number;
  mileage?: number;
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
  variant?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    isVerified: boolean;
  };
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  customFields: Record<string, string | number | boolean>;
}

interface SimilarAd {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
}

const AdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdDetail | null>(null);
  const [similarAds, setSimilarAds] = useState<SimilarAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadAdDetail(id);
      loadSimilarAds(id);
    }
  }, [id]);

  const loadAdDetail = async (adId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/ads/${adId}`);
      setAd(response.data as AdDetail);
      
      // Increment view count
      await apiClient.post(`/ads/${adId}/view`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'İlan yüklenirken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarAds = async (adId: string) => {
    try {
      const response = await apiClient.get(`/ads/${adId}/similar`);
      setSimilarAds(response.data as SimilarAd[]);
    } catch (error) {
      console.error('Similar ads loading error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!ad || !message.trim()) return;

    try {
      await apiClient.post('/messages', {
        receiverId: ad.user.id,
        content: message,
        adId: ad.id
      });
      setMessageDialogOpen(false);
      setMessage('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Mesaj gönderilirken hata oluştu';
      setError(errorMessage);
    }
  };

  const handleToggleFavorite = async () => {
    if (!ad) return;

    try {
      if (isFavorite) {
        await apiClient.delete(`/ads/${ad.id}/favorite`);
      } else {
        await apiClient.post(`/ads/${ad.id}/favorite`);
      }
      setIsFavorite(!isFavorite);
    } catch (error: unknown) {
      console.error('Favorite toggle error:', error);
    }
  };

  const handleReport = async () => {
    if (!ad || !reportReason.trim()) return;

    try {
      await apiClient.post('/complaints', {
        adId: ad.id,
        reason: reportReason
      });
      setReportDialogOpen(false);
      setReportReason('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Şikayet gönderilirken hata oluştu';
      setError(errorMessage);
    }
  };

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

  const getUserDisplayName = (user: { firstName?: string; lastName?: string; email: string }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email.split('@')[0];
  };

  const shareUrl = `${window.location.origin}/ads/${id}`;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (error || !ad) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">
          {error || 'İlan bulunamadı'}
        </Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          color="inherit"
        >
          Geri
        </Button>
      </Box>

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/">
          Ana Sayfa
        </Link>
        <Link color="inherit" href={`/category/${ad.category.id}`}>
          {ad.category.displayName}
        </Link>
        <Typography color="text.primary">{ad.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left Column - Images and Description */}
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          {/* Image Gallery */}
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="400"
              image={ad.images[selectedImageIndex]?.url || '/placeholder-vehicle.jpg'}
              alt={ad.title}
              sx={{ objectFit: 'cover' }}
            />
            {ad.images.length > 1 && (
              <Box sx={{ p: 2 }}>
                <ImageList cols={6} rowHeight={80}>
                  {ad.images.map((image, index) => (
                    <ImageListItem 
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? 2 : 1,
                        borderColor: selectedImageIndex === index ? 'primary.main' : 'divider'
                      }}
                    >
                      <img
                        src={image.url}
                        alt={`${ad.title} ${index + 1}`}
                        loading="lazy"
                        style={{ objectFit: 'cover', height: '100%' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Card>

          {/* Title and Basic Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                  {ad.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={handleToggleFavorite}>
                    {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton onClick={() => setShareDialogOpen(true)}>
                    <Share />
                  </IconButton>
                  <IconButton onClick={() => setReportDialogOpen(true)}>
                    <Report />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <DirectionsCar color="action" />
                  <Typography>
                    {ad.category.displayName}
                    {ad.brand && ` • ${ad.brand.name}`}
                    {ad.model && ` ${ad.model.name}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn color="action" />
                  <Typography>{ad.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday color="action" />
                  <Typography>{formatDate(ad.createdAt)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility color="action" />
                  <Typography>{ad.viewCount} görüntülenme</Typography>
                </Box>
              </Box>

              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {formatCurrency(ad.price, ad.currency)}
              </Typography>
            </CardContent>
          </Card>

          {/* Vehicle Specifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Araç Özellikleri
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    {ad.year && (
                      <TableRow>
                        <TableCell>Model Yılı</TableCell>
                        <TableCell>{ad.year}</TableCell>
                      </TableRow>
                    )}
                    {ad.mileage && (
                      <TableRow>
                        <TableCell>Kilometre</TableCell>
                        <TableCell>{ad.mileage.toLocaleString()} km</TableCell>
                      </TableRow>
                    )}
                    {Object.entries(ad.customFields).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{key}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Açıklama
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {ad.description}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Seller Info and Actions */}
        <Box sx={{ flex: { xs: 1, md: 1 }, minWidth: { md: 300 } }}>
          {/* Seller Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Satıcı Bilgileri
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                  {getUserDisplayName(ad.user).charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {getUserDisplayName(ad.user)}
                  </Typography>
                  {ad.user.isVerified && (
                    <Chip label="Doğrulanmış" color="success" size="small" />
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ad.user.phone && (
                  <Button
                    variant="contained"
                    startIcon={<Phone />}
                    href={`tel:${ad.user.phone}`}
                    fullWidth
                  >
                    Telefon Et
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  startIcon={<Message />}
                  onClick={() => setMessageDialogOpen(true)}
                  fullWidth
                >
                  Mesaj Gönder
                </Button>

                {ad.user.phone && (
                  <Button
                    variant="outlined"
                    startIcon={<WhatsApp />}
                    href={`https://wa.me/${ad.user.phone?.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    fullWidth
                    color="success"
                  >
                    WhatsApp
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Similar Ads */}
          {similarAds.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Benzer İlanlar
                </Typography>
                {similarAds.slice(0, 3).map((similarAd) => (
                  <Box key={similarAd.id} sx={{ mb: 2 }}>
                    <Card variant="outlined">
                      <Box sx={{ display: 'flex' }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 80, height: 60 }}
                          image={similarAd.images.find(img => img.isPrimary)?.url || '/placeholder-vehicle.jpg'}
                          alt={similarAd.title}
                        />
                        <CardContent sx={{ flex: 1, p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="body2" noWrap>
                            {similarAd.title}
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            {formatCurrency(similarAd.price, similarAd.currency)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {similarAd.location}
                          </Typography>
                        </CardContent>
                      </Box>
                    </Card>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Fab color="primary" onClick={() => setMessageDialogOpen(true)}>
          <Message />
        </Fab>
        {ad.user.phone && (
          <Fab color="success" href={`tel:${ad.user.phone}`}>
            <Phone />
          </Fab>
        )}
      </Box>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Mesaj Gönder
          <IconButton
            onClick={() => setMessageDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mesajınız"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`${ad.title} hakkında...`}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSendMessage} variant="contained" disabled={!message.trim()}>
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Paylaş</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="İlan Linki"
              value={shareUrl}
              InputProps={{
                readOnly: true,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                startIcon={<WhatsApp />}
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                color="success"
              >
                WhatsApp
              </Button>
              <Button
                startIcon={<Facebook />}
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
              >
                Facebook
              </Button>
              <Button
                startIcon={<Twitter />}
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(ad.title)}`}
                target="_blank"
              >
                Twitter
              </Button>
              <Button
                startIcon={<Email />}
                href={`mailto:?subject=${encodeURIComponent(ad.title)}&body=${encodeURIComponent(shareUrl)}`}
              >
                E-posta
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>İlanı Şikayet Et</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Şikayet Sebebi"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Şikayet sebebinizi açıklayın..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>İptal</Button>
          <Button onClick={handleReport} color="error" variant="contained" disabled={!reportReason.trim()}>
            Şikayet Et
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdDetail;
