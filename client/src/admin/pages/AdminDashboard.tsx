import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh,
  TrendingUp,
  Message,
} from "@mui/icons-material";

interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  activeAds: number;
  pendingAds: number;
  todayRegistrations: number;
  thisWeekRegistrations: number;
  totalMessages: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAds: 0,
    activeAds: 0,
    pendingAds: 0,
    todayRegistrations: 0,
    thisWeekRegistrations: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Backend'den dashboard verilerini çek
      // Şimdilik mock data kullanalım
      setTimeout(() => {
        setStats({
          totalUsers: 13,
          totalAds: 2,
          activeAds: 2,
          pendingAds: 0,
          todayRegistrations: 0,
          thisWeekRegistrations: 0,
          totalMessages: 16,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Dashboard verileri yüklenirken hata:", error);
      setLoading(false);
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

  return (
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
          value={stats.totalUsers}
          icon={<PeopleIcon />}
          color="#ff5252"
        />
        <StatCard
          title="Toplam İlan"
          value={stats.totalAds}
          icon={<AssignmentIcon />}
          color="#2196f3"
        />
        <StatCard
          title="Aktif İlan"
          value={stats.activeAds}
          icon={<CheckCircleIcon />}
          color="#4caf50"
        />
        <StatCard
          title="Onay Bekleyen"
          value={stats.pendingAds}
          icon={<WarningIcon />}
          color="#ff9800"
        />
      </Box>

      {/* Aktivite Özeti */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          Aktivite Özeti
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bugün, bu hafta ve mesaj hacmi
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
            title="Bugün Kayıt"
            value={stats.todayRegistrations}
            icon={<PeopleIcon />}
            color="#4caf50"
          />
          <StatCard
            title="Bu Hafta"
            value={stats.thisWeekRegistrations}
            icon={<TrendingUp />}
            color="#2196f3"
          />
          <StatCard
            title="Toplam Mesaj"
            value={stats.totalMessages}
            icon={<Message />}
            color="#9c27b0"
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
          Son Aktiviteler
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Yakında güncel aktivite listesi burada görünecek...
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
