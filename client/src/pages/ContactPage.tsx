import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { LocationOn, Phone, Email, Schedule } from "@mui/icons-material";

const ContactPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ color: "#313B4C" }}
        >
          İletişim
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Bizimle İletişime Geçin
        </Typography>
      </Box>

      {/* Geri Bildirim Sistemi Alert */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Geri Bildirim Sistemi:</strong> Siteye giriş yaptıktan sonra
          sağ üst köşedeki geri bildirim butonunu kullanarak bizimle iletişim
          kurabilir, site hakkındaki görüş ve önerilerinizi iletebilirsiniz.
        </Typography>
      </Alert>

      {/* Contact Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 6,
          justifyContent: "center",
        }}
      >
        {/* Adres */}
        <Box sx={{ flex: "1 1 250px", maxWidth: "300px" }}>
          <Card
            sx={{
              height: "100%",
              textAlign: "center",
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <LocationOn sx={{ fontSize: 48, color: "#e74c3c", mb: 2 }} />
              <Typography
                variant="h6"
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
        </Box>

        {/* Telefon */}
        <Box sx={{ flex: "1 1 250px", maxWidth: "300px" }}>
          <Card
            sx={{
              height: "100%",
              textAlign: "center",
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Phone sx={{ fontSize: 48, color: "#e74c3c", mb: 2 }} />
              <Typography
                variant="h6"
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
        </Box>

        {/* E-posta */}
        <Box sx={{ flex: "1 1 250px", maxWidth: "300px" }}>
          <Card
            sx={{
              height: "100%",
              textAlign: "center",
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Email sx={{ fontSize: 48, color: "#e74c3c", mb: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#313B4C", fontWeight: "bold" }}
              >
                E-posta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                info@trucksbus.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                destek@trucksbus.com
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Çalışma Saatleri */}
        <Box sx={{ flex: "1 1 250px", maxWidth: "300px" }}>
          <Card
            sx={{
              height: "100%",
              textAlign: "center",
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Schedule sx={{ fontSize: 48, color: "#e74c3c", mb: 2 }} />
              <Typography
                variant="h6"
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
      </Box>

      {/* TrucksBus Hakkında */}
      <Card sx={{ p: 4, textAlign: "center", backgroundColor: "#f8f9fa" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "#313B4C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          🚛 TrucksBus Hakkında
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: "800px", mx: "auto", lineHeight: 1.6 }}
        >
          Türkiye'nin en kapsamlı ticari araç platformu olarak, kamyon, çekici,
          otobüs, minibüs-midibüs, dorse ve benzeri ağır ticari araçların
          alım-satımında güvenilir ve profesyonel hizmet sunuyoruz.
        </Typography>
        <Box mt={3}>
          <Typography
            variant="body2"
            sx={{
              backgroundColor: "#e74c3c",
              color: "white",
              px: 3,
              py: 1,
              borderRadius: 2,
              display: "inline-block",
              fontWeight: "bold",
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
