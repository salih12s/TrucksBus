import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Button,
  Chip,
  Paper,
  IconButton,
  Tab,
  Tabs,
  Divider,
  LinearProgress,
  Badge,
  Alert,
} from "@mui/material";
import {
  Store,
  Edit,
  Settings,
  TrendingUp,
  Visibility,
  Star,
  Phone,
  Email,
  LocationOn,
  Business,
  VerifiedUser,
  DirectionsCar,
  Schedule,
  PhotoCamera,
  AddCircle,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dukkanim: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data - gerçek uygulamada API'den gelecek
  const storeData = {
    storeName: user?.companyName || user?.firstName || "TrucksBus Mağazası",
    storeDescription: "Türkiye'nin en güvenilir ticari araç satış mağazası. 15 yıllık deneyimimizle kaliteli hizmet sunuyoruz.",
    logo: "/public/Trucksbus.png",
    coverImage: "/public/BrandsImage/FORD.png",
    rating: 4.8,
    reviewCount: 142,
    totalAds: 28,
    activeAds: 24,
    totalViews: 15420,
    responseRate: 95,
    joinDate: "2020-03-15",
    location: "İstanbul, Türkiye",
    phone: "+90 (212) 555 0123",
    email: "info@trucksbus.com",
    workingHours: "Pazartesi - Cumartesi: 09:00 - 18:00",
    isVerified: true,
    specialties: ["Kamyon", "Çekici", "Otobüs", "Minibüs"],
  };

  const mockAds = [
    {
      id: 1,
      title: "2018 Ford Transit Kamyon",
      price: "750,000 TL",
      image: "/public/BrandsImage/FORD.png",
      location: "İstanbul",
      views: 1250,
      status: "active",
    },
    {
      id: 2,
      title: "2020 Mercedes Actros Çekici",
      price: "1,200,000 TL",
      image: "/public/BrandsImage/Mercedes.png",
      location: "Ankara",
      views: 890,
      status: "active",
    },
    {
      id: 3,
      title: "2019 Iveco Daily Minibüs",
      price: "450,000 TL",
      image: "/public/BrandsImage/Iveco-Otoyol.png",
      location: "İzmir",
      views: 650,
      status: "pending",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Paper
        elevation={2}
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
        }}
      >
        {/* Cover Image */}
        <Box
          sx={{
            height: 200,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": { bgcolor: "rgba(255,255,255,1)" },
            }}
          >
            <PhotoCamera />
          </IconButton>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            🚛 {storeData.storeName}
          </Typography>
        </Box>

        {/* Store Info */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                storeData.isVerified ? (
                  <VerifiedUser sx={{ color: "#27ae60", fontSize: 28 }} />
                ) : null
              }
            >
              <Avatar
                src={storeData.logo}
                sx={{
                  width: 100,
                  height: 100,
                  border: "4px solid #fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  mt: -5,
                }}
              >
                <Store sx={{ fontSize: 50 }} />
              </Avatar>
            </Badge>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: "#2c3e50" }}>
                  {storeData.storeName}
                </Typography>
                {storeData.isVerified && (
                  <Chip
                    icon={<VerifiedUser />}
                    label="Doğrulanmış Mağaza"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                {storeData.storeDescription}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Star sx={{ color: "#f39c12", fontSize: 20 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {storeData.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({storeData.reviewCount} değerlendirme)
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" color="text.secondary">
                  {storeData.joinDate} tarihinden beri üye
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {storeData.specialties.map((specialty) => (
                  <Chip
                    key={specialty}
                    label={specialty}
                    size="small"
                    variant="outlined"
                    sx={{ color: "#3498db", borderColor: "#3498db" }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                sx={{ bgcolor: "#3498db", "&:hover": { bgcolor: "#2980b9" } }}
              >
                Düzenle
              </Button>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                sx={{ borderColor: "#95a5a6", color: "#95a5a6" }}
              >
                Ayarlar
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 3,
          mb: 3,
        }}
      >
        <Card sx={{ textAlign: "center", p: 2, bgcolor: "#e8f5e8" }}>
          <DirectionsCar sx={{ fontSize: 40, color: "#27ae60", mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#27ae60">
            {storeData.totalAds}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toplam İlan
          </Typography>
        </Card>
        <Card sx={{ textAlign: "center", p: 2, bgcolor: "#fff3e0" }}>
          <Visibility sx={{ fontSize: 40, color: "#f39c12", mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#f39c12">
            {storeData.totalViews.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toplam Görüntüleme
          </Typography>
        </Card>
        <Card sx={{ textAlign: "center", p: 2, bgcolor: "#e3f2fd" }}>
          <TrendingUp sx={{ fontSize: 40, color: "#3498db", mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#3498db">
            %{storeData.responseRate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Yanıt Oranı
          </Typography>
        </Card>
        <Card sx={{ textAlign: "center", p: 2, bgcolor: "#fce4ec" }}>
          <Star sx={{ fontSize: 40, color: "#e91e63", mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="#e91e63">
            {storeData.rating}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ortalama Puan
          </Typography>
        </Card>
      </Box>

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="İlanlarım" />
            <Tab label="İletişim Bilgileri" />
            <Tab label="İstatistikler" />
            <Tab label="Ayarlar" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* İlanlarım */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight="bold">
              Aktif İlanlarım ({storeData.activeAds})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircle />}
              sx={{ bgcolor: "#27ae60", "&:hover": { bgcolor: "#229954" } }}
            >
              Yeni İlan Ekle
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {mockAds.map((ad) => (
              <Card key={ad.id} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={ad.image}
                  alt={ad.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {ad.title}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
                    {ad.price}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {ad.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Chip
                      label={ad.status === "active" ? "Aktif" : "Beklemede"}
                      color={ad.status === "active" ? "success" : "warning"}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {ad.views} görüntüleme
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* İletişim Bilgileri */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Card sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Business sx={{ color: "#3498db" }} />
                Mağaza Bilgileri
              </Typography>
              <Box sx={{ mt: 2, space: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <LocationOn sx={{ color: "#e74c3c" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Adres</Typography>
                    <Typography variant="body1">{storeData.location}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Phone sx={{ color: "#27ae60" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Telefon</Typography>
                    <Typography variant="body1">{storeData.phone}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Email sx={{ color: "#f39c12" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">E-posta</Typography>
                    <Typography variant="body1">{storeData.email}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Schedule sx={{ color: "#9b59b6" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Çalışma Saatleri</Typography>
                    <Typography variant="body1">{storeData.workingHours}</Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
            <Card sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Mağaza Açıklaması
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
                {storeData.storeDescription}
              </Typography>
              <Button variant="outlined" fullWidth>
                Açıklamayı Düzenle
              </Button>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* İstatistikler */}
          <Typography variant="h6" gutterBottom>
            Mağaza Performansı
          </Typography>
          
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bu Ay Görüntülenme
              </Typography>
              <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
                2,450
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Geçen aya göre %15 artış
              </Typography>
            </Card>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Mesaj Yanıt Oranı
              </Typography>
              <Typography variant="h3" color="success.main" fontWeight="bold" gutterBottom>
                %{storeData.responseRate}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={storeData.responseRate} 
                color="success"
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Ortalama yanıt süresi: 2 saat
              </Typography>
            </Card>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>İpucu:</strong> Daha yüksek görünürlük için ilanlarınızı düzenli olarak güncelleyin ve mesajlara hızlı yanıt verin.
            </Typography>
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Ayarlar */}
          <Typography variant="h6" gutterBottom>
            Mağaza Ayarları
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bildirim Ayarları
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: "flex-start" }}>
                  E-posta Bildirimleri
                </Button>
                <Button variant="outlined" fullWidth sx={{ justifyContent: "flex-start" }}>
                  SMS Bildirimleri
                </Button>
                <Button variant="outlined" fullWidth sx={{ justifyContent: "flex-start" }}>
                  Push Bildirimleri
                </Button>
              </Box>
            </Card>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Gizlilik Ayarları
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: "flex-start" }}>
                  Profil Görünürlüğü
                </Button>
                <Button variant="outlined" fullWidth sx={{ justifyContent: "flex-start" }}>
                  İletişim Bilgileri
                </Button>
                <Button variant="outlined" fullWidth sx={{ justifyContent: "flex-start" }}>
                  İlan Ayarları
                </Button>
              </Box>
            </Card>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Dukkanim;
