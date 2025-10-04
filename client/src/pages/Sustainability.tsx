import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  LocalFlorist,
  ElectricBolt,
  Recycling,
  Nature,
  Public,
  TrendingUp,
} from "@mui/icons-material";

const Sustainability: React.FC = () => {
  const sustainabilityGoals = [
    {
      icon: <LocalFlorist sx={{ fontSize: 40, color: "#4CAF50" }} />,
      title: "Karbonsuz Gelecek",
      description: "2030 yılına kadar karbon nötr operasyonlar hedefliyoruz.",
    },
    {
      icon: <Recycling sx={{ fontSize: 40, color: "#2196F3" }} />,
      title: "Geri Dönüşüm",
      description: "Atık yönetiminde %100 geri dönüşüm oranını amaçlıyoruz.",
    },
    {
      icon: <ElectricBolt sx={{ fontSize: 40, color: "#FF9800" }} />,
      title: "Yenilenebilir Enerji",
      description: "Tüm operasyonlarımızda temiz enerji kullanımı.",
    },
    {
      icon: <Nature sx={{ fontSize: 40, color: "#795548" }} />,
      title: "Doğal Koruma",
      description: "Biyoçeşitliliği koruma ve ormanları yenileme projelerimiz.",
    },
    {
      icon: <Public sx={{ fontSize: 40, color: "#607D8B" }} />,
      title: "Sosyal Sorumluluk",
      description:
        "Toplumsal fayda odaklı projeler geliştirerek değer yaratıyoruz.",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: "#FF5722" }} />,
      title: "Sürekli İyileştirme",
      description: "Sürdürülebilirlik hedeflerimizi sürekli geliştiriyoruz.",
    },
  ];

  const achievements = [
    { number: "85%", label: "Dijital İşlem Oranı" },
    { number: "30%", label: "Kağıt Kullanımında Azalma" },
    { number: "50+", label: "Çevre Dostu Ortak" },
    { number: "100%", label: "Yenilenebilir Enerji" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 6,
            borderRadius: 4,
            mb: 6,
            textAlign: "center",
          }}
        >
          <Nature sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Sürdürülebilirlik
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, maxWidth: 600, mx: "auto" }}
          >
            Gelecek nesillere daha iyi bir dünya bırakmak için
            sorumluluklarımızı yerine getiriyoruz
          </Typography>
        </Paper>

        {/* Sürdürülebilirlik Hedefleri */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}
        >
          Sürdürülebilirlik Hedeflerimiz
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
            mb: 6,
          }}
        >
          {sustainabilityGoals.map((goal, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "all 0.3s",
                },
              }}
            >
              <CardContent sx={{ p: 3, textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>{goal.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {goal.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {goal.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Başarılar */}
        <Paper sx={{ p: 4, mb: 6, borderRadius: 3, bgcolor: "#e8f5e8" }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}
          >
            Başarılarımız
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
              mb: 4,
            }}
          >
            {achievements.map((achievement, index) => (
              <Box key={index} sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    mb: 1,
                  }}
                >
                  {achievement.number}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {achievement.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Taahhütler */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}
          >
            Taahhütlerimiz
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
            }}
          >
            {[
              "Karbon Nötr Operasyonlar",
              "Temiz Teknoloji Yatırımları",
              "Sürdürülebilir Tedarik Zinciri",
              "Çevre Dostu İnovasyonlar",
              "Yeşil Finansman",
              "Dijital Dönüşüm",
              "Sosyal Etki Projeleri",
              "Şeffaf Raporlama",
            ].map((commitment, index) => (
              <Chip
                key={index}
                label={commitment}
                variant="outlined"
                sx={{
                  borderColor: "#4caf50",
                  color: "#4caf50",
                  "&:hover": {
                    bgcolor: "#4caf50",
                    color: "white",
                  },
                }}
              />
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Sustainability;
