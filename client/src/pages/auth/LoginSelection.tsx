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
          minHeight: "100vh",
          backgroundColor: "white",
          pt: 10,
          pb: 4,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              sx={{
                position: "absolute",
                top: 120,
                left: 32,
                color: "#666",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Ana Sayfaya Dön
            </Button>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
              }}
            >
              Giriş Türünü Seçin
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#666",
                fontWeight: 400,
              }}
            >
              Hesap türünüze uygun giriş seçeneğini kullanın
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
            }}
          >
            {/* Normal Üye Girişi */}
            <Box>
              <Card
                elevation={8}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                      borderRadius: "50%",
                      width: 80,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px",
                    }}
                  >
                    <PersonIcon sx={{ color: "white", fontSize: 40 }} />
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Bireysel Üye
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{ color: "#666", mb: 3, lineHeight: 1.6 }}
                  >
                    Bireysel hesabınızla giriş yapın ve araç alım-satım
                    işlemlerinizi yönetin.
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      ✓ Kişisel hesap girişi
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      ✓ İlan yönetimi
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      ✓ Mesajlaşma
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888" }}>
                      ✓ Favoriler
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{
                      background:
                        "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                      color: "white",
                      fontWeight: 600,
                      py: 1.5,
                      fontSize: "16px",
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
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                      borderRadius: "50%",
                      width: 80,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px",
                    }}
                  >
                    <BusinessIcon sx={{ color: "white", fontSize: 40 }} />
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Kurumsal Üye
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{ color: "#666", mb: 3, lineHeight: 1.6 }}
                  >
                    Kurumsal hesabınızla giriş yapın ve profesyonel araç
                    ticareti yapın.
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      ✓ Kurumsal hesap girişi
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      ✓ Sınırsız ilan
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888", mb: 1 }}>
                      ✓ Öncelikli destek
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888" }}>
                      ✓ Gelişmiş raporlar
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/login?type=corporate")}
                    sx={{
                      background:
                        "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                      color: "white",
                      fontWeight: 600,
                      py: 1.5,
                      fontSize: "16px",
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

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body2" sx={{ color: "#888" }}>
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
