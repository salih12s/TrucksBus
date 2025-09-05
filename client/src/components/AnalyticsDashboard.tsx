import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  Alert,
  Stack
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  ThumbUp,
  Message,
  Share,
  DirectionsCar,
  Refresh,
  Download
} from '@mui/icons-material';

interface DashboardStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  averageResponseTime: number;
  conversionRate: number;
  trends: {
    adsChange: number;
    viewsChange: number;
    messagesChange: number;
  };
}

interface AdPerformance {
  id: string;
  title: string;
  views: number;
  messages: number;
  favorites: number;
  shares: number;
  clickThroughRate: number;
  conversionRate: number;
  createdAt: string;
  status: string;
  category: string;
  price: number;
  currency: string;
}

interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  averagePrice: number;
  totalViews: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adPerformance, setAdPerformance] = useState<AdPerformance[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for development
      const mockStats: DashboardStats = {
        totalAds: 156,
        activeAds: 134,
        totalViews: 12543,
        totalMessages: 234,
        totalFavorites: 567,
        averageResponseTime: 120,
        conversionRate: 8.5,
        trends: {
          adsChange: 12.5,
          viewsChange: 23.4,
          messagesChange: -5.2
        }
      };

      const mockPerformance: AdPerformance[] = [
        {
          id: '1',
          title: '2020 Ford Transit Van - Excellent Condition',
          views: 1245,
          messages: 23,
          favorites: 45,
          shares: 12,
          clickThroughRate: 8.5,
          conversionRate: 12.3,
          createdAt: '2024-01-15',
          status: 'APPROVED',
          category: 'Van',
          price: 85000,
          currency: 'TRY'
        },
        {
          id: '2',
          title: 'Mercedes Sprinter 2019 - High Mileage',
          views: 987,
          messages: 18,
          favorites: 32,
          shares: 8,
          clickThroughRate: 6.2,
          conversionRate: 9.8,
          createdAt: '2024-01-10',
          status: 'APPROVED',
          category: 'Van',
          price: 125000,
          currency: 'TRY'
        }
      ];

      const mockCategories: CategoryStats[] = [
        { category: 'Van', count: 45, percentage: 35, averagePrice: 95000, totalViews: 4567 },
        { category: 'Truck', count: 38, percentage: 30, averagePrice: 180000, totalViews: 3234 },
        { category: 'Bus', count: 25, percentage: 20, averagePrice: 220000, totalViews: 2456 },
        { category: 'Trailer', count: 19, percentage: 15, averagePrice: 75000, totalViews: 1876 }
      ];

      setStats(mockStats);
      setAdPerformance(mockPerformance);
      setCategoryStats(mockCategories);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Analitik veriler yüklenirken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatTrendChange = (change?: number) => {
    if (!change) return '0%';
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return <TrendingUp color="disabled" />;
    if (change > 0) return <TrendingUp color="success" />;
    if (change < 0) return <TrendingDown color="error" />;
    return <TrendingUp color="disabled" />;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return 'text.secondary';
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={loadAnalyticsData}>
          Tekrar Dene
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Analitik Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select
              value={timeRange}
              label="Zaman Aralığı"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7">Son 7 Gün</MenuItem>
              <MenuItem value="30">Son 30 Gün</MenuItem>
              <MenuItem value="90">Son 3 Ay</MenuItem>
              <MenuItem value="365">Son 1 Yıl</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Verileri Yenile">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button startIcon={<Download />} variant="outlined">
            Rapor İndir
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Toplam İlan
                </Typography>
                <Typography variant="h4">
                  {stats?.totalAds || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {getTrendIcon(stats?.trends?.adsChange)}
                  <Typography variant="body2" sx={{ color: getTrendColor(stats?.trends?.adsChange), ml: 0.5 }}>
                    {formatTrendChange(stats?.trends?.adsChange)}
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <DirectionsCar />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Toplam Görüntülenme
                </Typography>
                <Typography variant="h4">
                  {formatNumber(stats?.totalViews || 0)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {getTrendIcon(stats?.trends?.viewsChange)}
                  <Typography variant="body2" sx={{ color: getTrendColor(stats?.trends?.viewsChange), ml: 0.5 }}>
                    {formatTrendChange(stats?.trends?.viewsChange)}
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <Visibility />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Toplam Mesaj
                </Typography>
                <Typography variant="h4">
                  {stats?.totalMessages || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {getTrendIcon(stats?.trends?.messagesChange)}
                  <Typography variant="body2" sx={{ color: getTrendColor(stats?.trends?.messagesChange), ml: 0.5 }}>
                    {formatTrendChange(stats?.trends?.messagesChange)}
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Message />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Dönüşüm Oranı
                </Typography>
                <Typography variant="h4">
                  {stats?.conversionRate || 0}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ortalama yanıt süresi: {stats?.averageResponseTime || 0}s
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <TrendingUp />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Category Stats */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Card sx={{ flex: 2 }}>
          <CardHeader title="Kategori İstatistikleri" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="right">İlan Sayısı</TableCell>
                    <TableCell align="right">Oran</TableCell>
                    <TableCell align="right">Ortalama Fiyat</TableCell>
                    <TableCell align="right">Toplam Görüntülenme</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryStats.map((category) => (
                    <TableRow key={category.category} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {category.category}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {category.count}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${category.percentage}%`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(category.averagePrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {formatNumber(category.totalViews)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      {/* Top Performing Ads */}
      <Card>
        <CardHeader title="En İyi Performans Gösteren İlanlar" />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>İlan</TableCell>
                  <TableCell align="right">Görüntülenme</TableCell>
                  <TableCell align="right">Mesaj</TableCell>
                  <TableCell align="right">Favoriler</TableCell>
                  <TableCell align="right">Paylaşım</TableCell>
                  <TableCell align="right">CTR</TableCell>
                  <TableCell align="center">Durum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adPerformance.slice(0, 10).map((ad) => (
                  <TableRow key={ad.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                          {ad.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {ad.category} • {formatCurrency(ad.price, ad.currency)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {formatNumber(ad.views)}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Message sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {ad.messages}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <ThumbUp sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {ad.favorites}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Share sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        {ad.shares}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color={ad.clickThroughRate > 5 ? 'success.main' : 'text.primary'}>
                        {ad.clickThroughRate.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ad.status}
                        color={ad.status === 'APPROVED' ? 'success' : ad.status === 'PENDING' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard;
