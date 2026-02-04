import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocationOn, Phone, Email, Schedule } from "@mui/icons-material";

const ContactPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 1, md: 2 }, px: { xs: 2, md: 3 } }}
    >
      {/* Header */}
      <Box textAlign="center" mb={{ xs: 3, md: 4 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          component="h1"
          gutterBottom
          sx={{
            color: "#313B4C",
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          İletişim
        </Typography>
        <Typography
          variant={isMobile ? "body1" : "h6"}
          color="text.secondary"
          sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
        >
          Bizimle İletişime Geçin
        </Typography>
      </Box>

      {/* Geri Bildirim Sistemi Alert */}
      <Alert severity="info" sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant={isMobile ? "body2" : "body2"}>
          <strong>Geri Bildirim Sistemi:</strong> Siteye giriş yaptıktan sonra
          sağ üst köşedeki geri bildirim butonunu kullanarak bizimle iletişim
          kurabilir, site hakkındaki görüş ve önerilerinizi iletebilirsiniz.
        </Typography>
      </Alert>

      {/* Contact Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: { xs: 2, md: 3 },
          mb: { xs: 4, md: 6 },
        }}
      >
        {/* Adres */}
        <Card
          sx={{
            height: "100%",
            textAlign: "center",
            p: { xs: 1, md: 2 },
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <LocationOn
              sx={{
                fontSize: { xs: 40, md: 48 },
                color: "#e74c3c",
                mb: 2,
              }}
            />
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              gutterBottom
              sx={{ color: "#313B4C", fontWeight: "bold" }}
            >
              Adres
            </Typography>
            <Typography variant="body2" color="text.secondary">
              TrucksBus Merkez Ofis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maslak Mahallesi, Büyükdere Cd.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sarıyer, İstanbul 34398
            </Typography>
          </CardContent>
        </Card>

        {/* Telefon */}
        <Card
          sx={{
            height: "100%",
            textAlign: "center",
            p: { xs: 1, md: 2 },
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Phone
              sx={{
                fontSize: { xs: 40, md: 48 },
                color: "#e74c3c",
                mb: 2,
              }}
            />
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              gutterBottom
              sx={{ color: "#313B4C", fontWeight: "bold" }}
            >
              Telefon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +90 (212) 555 0123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +90 (542) 555 0124
            </Typography>
          </CardContent>
        </Card>

        {/* E-posta */}
        <Card
          sx={{
            height: "100%",
            textAlign: "center",
            p: { xs: 1, md: 2 },
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Email
              sx={{
                fontSize: { xs: 40, md: 48 },
                color: "#e74c3c",
                mb: 2,
              }}
            />
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              gutterBottom
              sx={{ color: "#313B4C", fontWeight: "bold" }}
            >
              E-posta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              iletisim@trucksbus.com.tr
            </Typography>
          </CardContent>
        </Card>

        {/* Çalışma Saatleri */}
        <Card
          sx={{
            height: "100%",
            textAlign: "center",
            p: { xs: 1, md: 2 },
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Schedule
              sx={{
                fontSize: { xs: 40, md: 48 },
                color: "#e74c3c",
                mb: 2,
              }}
            />
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              gutterBottom
              sx={{ color: "#313B4C", fontWeight: "bold" }}
            >
              Çalışma Saatleri
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pazartesi - Cuma: 09:00 - 18:00
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cumartesi: 09:00 - 16:00
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pazar: Kapalı
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* TrucksBus Hakkında */}
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          textAlign: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          gutterBottom
          sx={{
            color: "#313B4C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          🚛 TrucksBus Hakkında
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.6,
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          Alın Satın TrucksBus ile Mutlu Kalın! Kamyon, çekici, otobüs,
          minibüs-midibüs, dorse ve benzeri ağır ticari araçların alım-satımında
          güvenilir ve profesyonel hizmet sunuyoruz.
        </Typography>
        <Box mt={3}>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: "#e74c3c",
              color: "white",
              px: { xs: 2, md: 3 },
              py: 1,
              borderRadius: 2,
              display: "inline-block",
              fontWeight: "bold",
              fontSize: { xs: "0.8rem", md: "0.875rem" },
            }}
          >
            7/24 Online Destek
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default ContactPage;
