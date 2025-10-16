import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  IconButton,
  Avatar,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh,
  TrendingUp,
  Message,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import apiClient from "../../api/client";
import { getTokenFromStorage } from "../../utils/tokenUtils";

interface DashboardStats {
  totalStats: {
    totalUsers: number;
    totalAds: number;
    activeAds: number;
    pendingAds: number;
    rejectedAds: number;
    activeUsers: number;
    totalMessages: number;
  };
  timeBasedStats: {
    todayUsers: number;
    thisWeekUsers: number;
    thisMonthUsers: number;
    thisMonthAds: number;
  };
  adsByCategory: Array<{
    categoryId: number;
    categoryName: string;
    count: number;
  }>;
  recentAds: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    category: {
      name: string;
    };
  }>;
}

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
  };
  category: {
    name: string;
  };
  city?: {
    name: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // All Ads Tab State
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchAllAds = useCallback(async () => {
    try {
      setAdsLoading(true);
      const token = getTokenFromStorage();
      if (!token) {
        setAlert({
          type: "error",
          message: "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.",
        });
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "50");

      const response = await apiClient.get(`/ads/admin/all?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllAds((response.data as { ads: Ad[] }).ads);
    } catch (error) {
      console.error("İlanlar yüklenirken hata:", error);
      setAlert({ type: "error", message: "İlanlar yüklenirken hata oluştu" });
    } finally {
      setAdsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      fetchAllAds();
    }
  }, [tabValue, fetchAllAds]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getTokenFromStorage();
      if (!token) {
        setAlert({
          type: "error",
          message: "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.",
        });
        return;
      }

      const response = await apiClient.get("/ads/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data as DashboardStats);
    } catch (error) {
      console.error("Dashboard verileri yüklenirken hata:", error);
      setAlert({
        type: "error",
        message: "Dashboard verileri yüklenirken hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!selectedAdId) return;

    try {
      const token = getTokenFromStorage();
      if (!token) {
        setAlert({
          type: "error",
          message: "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.",
        });
        return;
      }

      await apiClient.delete(`/ads/admin/${selectedAdId}/force-delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlert({ type: "success", message: "İlan başarıyla silindi" });
      fetchAllAds();
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error("İlan silinirken hata:", error);
      setAlert({ type: "error", message: "İlan silinirken hata oluştu" });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAdId(null);
    }
  };

  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Onaylandı";
      case "PENDING":
        return "Bekliyor";
      case "REJECTED":
        return "Reddedildi";
      default:
        return status;
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography
              variant="h3"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              {loading ? "..." : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDashboardTab = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistem özetinizi ve kritik KPI'ları tek ekranda görün.
          </Typography>
        </Box>
        <IconButton
          onClick={fetchDashboardData}
          sx={{
            backgroundColor: "#f44336",
            color: "white",
            "&:hover": {
              backgroundColor: "#d32f2f",
            },
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Ana İstatistikler */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.totalStats.totalUsers || 0}
          icon={<PeopleIcon />}
          color="#ff5252"
        />
        <StatCard
          title="Toplam İlan"
          value={stats?.totalStats.totalAds || 0}
          icon={<AssignmentIcon />}
          color="#2196f3"
        />
        <StatCard
          title="Aktif İlan"
          value={stats?.totalStats.activeAds || 0}
          icon={<CheckCircleIcon />}
          color="#4caf50"
        />
        <StatCard
          title="Onay Bekleyen"
          value={stats?.totalStats.pendingAds || 0}
          icon={<WarningIcon />}
          color="#ff9800"
        />
      </Box>

      {/* Kullanıcı Kayıt İstatistikleri */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Kullanıcı Kayıtları
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          <StatCard
            title="Bugün Kayıt Olanlar"
            value={stats?.timeBasedStats.todayUsers || 0}
            subtitle={`Toplam: ${stats?.totalStats.totalUsers || 0} kullanıcı`}
            icon={<PeopleIcon />}
            color="#4caf50"
          />
          <StatCard
            title="Bu Hafta Kayıtlar"
            value={stats?.timeBasedStats.thisWeekUsers || 0}
            subtitle={`Aktif: ${stats?.totalStats.activeUsers || 0} kullanıcı`}
            icon={<TrendingUp />}
            color="#2196f3"
          />
          <StatCard
            title="Bu Ay Kayıtlar"
            value={stats?.timeBasedStats.thisMonthUsers || 0}
            subtitle="Son 30 gün"
            icon={<PeopleIcon />}
            color="#ff9800"
          />
          <StatCard
            title="Bu Ay İlanlar"
            value={stats?.timeBasedStats.thisMonthAds || 0}
            subtitle="Yeni eklenen"
            icon={<AssignmentIcon />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      {/* Sistem Aktivitesi */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Sistem Aktivitesi
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          <StatCard
            title="Toplam Mesajlar"
            value={stats?.totalStats.totalMessages || 0}
            subtitle="Tüm konuşmalar"
            icon={<Message />}
            color="#e91e63"
          />
          <StatCard
            title="Aktif Kullanıcılar"
            value={stats?.totalStats.activeUsers || 0}
            subtitle={`${(
              ((stats?.totalStats.activeUsers || 0) /
                (stats?.totalStats.totalUsers || 1)) *
              100
            ).toFixed(0)}% aktif`}
            icon={<CheckCircleIcon />}
            color="#00bcd4"
          />
          <StatCard
            title="Reddedilen İlanlar"
            value={stats?.totalStats.rejectedAds || 0}
            subtitle="Onaylanmayan"
            icon={<WarningIcon />}
            color="#f44336"
          />
        </Box>
      </Box>

      {/* Son Aktiviteler */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Son Eklenen İlanlar
        </Typography>
        {stats?.recentAds && stats.recentAds.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {stats.recentAds.map((ad) => (
              <Box
                key={ad.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {ad.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ad.user.firstName} {ad.user.lastName} • {ad.category.name}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusText(ad.status)}
                  color={getStatusColor(ad.status)}
                  size="small"
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Henüz ilan eklenmemiş...
          </Typography>
        )}
      </Paper>
    </Box>
  );

  const renderAllAdsTab = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Tüm İlanlar
        </Typography>
        <Button
          onClick={fetchAllAds}
          startIcon={<Refresh />}
          variant="outlined"
        >
          Yenile
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="İlan ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Durum</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Durum"
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="APPROVED">Onaylandı</MenuItem>
            <MenuItem value="PENDING">Bekliyor</MenuItem>
            <MenuItem value="REJECTED">Reddedildi</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Alert */}
      {alert && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert(null)}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Ads Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>İlan Başlığı</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Satıcı</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Fiyat</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adsLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : allAds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  İlan bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              allAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {ad.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {ad.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{ad.category.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ad.user.companyName ||
                        `${ad.user.firstName} ${ad.user.lastName}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ad.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(ad.status)}
                      color={getStatusColor(ad.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {ad.price
                      ? `₺${ad.price.toLocaleString()}`
                      : "Belirtilmemiş"}
                  </TableCell>
                  <TableCell>
                    {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => window.open(`/ad/${ad.id}`, "_blank")}
                        title="İlanı görüntüle"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedAdId(ad.id);
                          setDeleteDialogOpen(true);
                        }}
                        title="İlanı sil"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label="Dashboard" />
          <Tab label="Tüm İlanlar" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && renderDashboardTab()}
      {tabValue === 1 && renderAllAdsTab()}

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>İlanı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem
            geri alınamaz.
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

export default AdminDashboard;
