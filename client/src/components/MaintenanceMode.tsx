import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { Build as BuildIcon } from "@mui/icons-material";

const MaintenanceMode: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 4 }}>
            <img
              src="/Trucksbus.png"
              alt="TrucksBus"
              style={{
                height: 80,
                marginBottom: 16,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#333",
                mb: 1,
              }}
            >
              <span style={{ color: "#333" }}>Alın Satın </span>
              <span style={{ color: "#D34237" }}>Trucksbus.com.tr</span>
              <span style={{ color: "#333" }}> ile Mutlu Kalın</span>
            </Typography>
          </Box>

          {/* Bakım İkonu */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                backgroundColor: "#D34237",
                borderRadius: "50%",
                p: 3,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 0 rgba(211, 66, 55, 0.7)",
                  },
                  "70%": {
                    transform: "scale(1.05)",
                    boxShadow: "0 0 0 10px rgba(211, 66, 55, 0)",
                  },
                  "100%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 0 rgba(211, 66, 55, 0)",
                  },
                },
              }}
            >
              <BuildIcon sx={{ fontSize: 48, color: "white" }} />
            </Box>
          </Box>

          {/* Ana Mesaj */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#333",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            🔧 Bakım Modundayız
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "#666",
              mb: 4,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              lineHeight: 1.6,
            }}
          >
            Sitemizi daha iyi hizmet verebilmek için geliştiriyoruz.
            <br />
            <strong>Kısa süre sonra tekrar birlikteyiz!</strong>
          </Typography>

          {/* Detay Bilgi */}
          <Box
            sx={{
              backgroundColor: "rgba(211, 66, 55, 0.1)",
              borderRadius: 2,
              p: 3,
              mb: 4,
              border: "1px solid rgba(211, 66, 55, 0.2)",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#555",
                mb: 2,
                fontWeight: 500,
              }}
            >
              📍 Ne yapıyoruz?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                lineHeight: 1.6,
              }}
            >
              • Sistem performansını artırıyoruz
              <br />
              • Yeni özellikler ekliyoruz
              <br />
              • Güvenlik güncellemeleri yapıyoruz
              <br />• Kullanıcı deneyimini iyileştiriyoruz
            </Typography>
          </Box>

          {/* İletişim */}
          <Box
            sx={{
              backgroundColor: "#f8f9fa",
              borderRadius: 2,
              p: 3,
              border: "1px solid #e9ecef",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "#555",
                mb: 1,
                fontWeight: 500,
              }}
            >
              🤝 Acil durumlar için bize ulaşın:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
              }}
            >
              📧 iletisim@trucksbus.com.tr
            </Typography>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              color: "#999",
              mt: 4,
              display: "block",
            }}
          >
            Anlayışınız için teşekkür ederiz 💙
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default MaintenanceMode;
