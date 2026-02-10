import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";

const LoginSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          pt: { xs: 2, md: 0 },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Geri Dön Butonu - İçerik akışı içinde */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            size="small"
            sx={{
              color: "#666",
              mb: 2,
              fontSize: { xs: "0.8rem", md: "0.9rem" },
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            Ana Sayfaya Dön
          </Button>

          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
              }}
            >
              Giriş Türünü Seçin
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#666",
                fontWeight: 400,
                fontSize: { xs: "0.9rem", md: "1.1rem" },
              }}
            >
              Hesap türünüze uygun giriş seçeneğini kullanın
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2.5,
              maxWidth: "850px",
              margin: "0 auto",
            }}
          >
            {/* Normal Üye Girişi */}
            <Box>
              <Card
                elevation={8}
                onClick={() => navigate("/login")}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "all 0.3s ease-in-out",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                      borderRadius: "50%",
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <PersonIcon sx={{ color: "white", fontSize: 32 }} />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 1, fontSize: "1.35rem" }}
                  >
                    Bireysel Üye
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      mb: 1.5,
                      lineHeight: 1.4,
                      fontSize: "0.875rem",
                    }}
                  >
                    Bireysel hesabınızla giriş yapın ve araç alım-satım
                    işlemlerinizi yönetin.
                  </Typography>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#888", mb: 0.3, fontSize: "0.8rem" }}
                    >
                      ✓ Kişisel hesap girişi
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#888", mb: 0.3, fontSize: "0.8rem" }}
                    >
                      ✓ İlan yönetimi
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#888", mb: 0.3, fontSize: "0.8rem" }}
                    >
                      ✓ Mesajlaşma
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2.5, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      background:
                        "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                      color: "white",
                      fontWeight: 600,
                      py: 1,
                      fontSize: "14px",
                      borderRadius: 2,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
                      },
                    }}
                  >
                    Bireysel Üye Girişi
                  </Button>
                </CardActions>
              </Card>
            </Box>

            {/* Kurumsal Üye Girişi */}
            <Box>
              <Card
                elevation={8}
                onClick={() => navigate("/login?type=corporate")}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "all 0.3s ease-in-out",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                      borderRadius: "50%",
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <BusinessIcon sx={{ color: "white", fontSize: 32 }} />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 1, fontSize: "1.35rem" }}
                  >
                    Kurumsal Üye
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      mb: 1.5,
                      lineHeight: 1.4,
                      fontSize: "0.875rem",
                    }}
                  >
                    Kurumsal hesabınızla giriş yapın ve profesyonel araç
                    ticareti yapın.
                  </Typography>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#888", mb: 0.3, fontSize: "0.8rem" }}
                    >
                      ✓ Kurumsal hesap girişi
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#888", mb: 0.3, fontSize: "0.8rem" }}
                    >
                      ✓ Sınırsız ilan
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#888", mb: 0.3, fontSize: "0.8rem" }}
                    >
                      ✓ Öncelikli destek
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2.5, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      background:
                        "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                      color: "white",
                      fontWeight: 600,
                      py: 1,
                      fontSize: "14px",
                      borderRadius: 2,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #2a3441 0%, #b92d24 100%)",
                      },
                    }}
                  >
                    Kurumsal Üye Girişi
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </Box>

          <Box sx={{ textAlign: "center", mt: 1.5 }}>
            <Typography
              variant="body2"
              sx={{ color: "#888", fontSize: "0.85rem" }}
            >
              Henüz hesabınız yok mu?{" "}
              <Button
                component="span"
                onClick={() => navigate("/membership-selection")}
                sx={{
                  color: "#D34237",
                  fontWeight: 600,
                  textTransform: "none",
                  p: 0,
                  minWidth: "auto",
                  fontSize: "0.85rem",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                Üye Ol
              </Button>
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LoginSelection;
