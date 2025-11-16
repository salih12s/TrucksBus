import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  LocalOffer as LocalOfferIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  subscriptionApi,
  type Package,
  type PackageDetails,
} from "../../api/subscription";
import SubscriptionModal from "./SubscriptionModal";

const PackageSelection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );
  const [packages, setPackages] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<{
    type: string;
    data: Package;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await subscriptionApi.getPackages();
      setPackages(data);
    } catch (error) {
      console.error("Paketler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (packageType: string, packageData: Package) => {
    if (!isAuthenticated || !token) {
      console.error("❌ User not authenticated");
      alert("Lütfen önce giriş yapınız");
      navigate("/login");
      return;
    }

    console.log(
      "✅ User authenticated, token:",
      token?.substring(0, 20) + "..."
    );
    setSelectedPackage({ type: packageType, data: packageData });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPackage(null);
  };

  const handleSuccess = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/profile")}
          sx={{
            mb: 3,
            color: "#666",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          }}
        >
          Geri Dön
        </Button>

        <Box sx={{ textAlign: "center", mb: 6 }}>
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
            Dükkan Açın, İlanlarınızı Yayınlayın
          </Typography>
          <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
            İhtiyacınıza uygun paketi seçin ve hemen başlayın
          </Typography>
          <Chip
            icon={<LocalOfferIcon />}
            label="İlk 3 Ay Ücretsiz!"
            color="error"
            sx={{ fontSize: "16px", fontWeight: 600, py: 2, px: 1 }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {packages &&
            Object.entries(packages).map(([key, pkg]) => {
              const colors = {
                trucks: {
                  primary: "#4CAF50",
                  gradient: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                },
                trucks_plus: {
                  primary: "#2196F3",
                  gradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                },
                trucksbus: {
                  primary: "#D34237",
                  gradient: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                },
              };

              const color = colors[key as keyof typeof colors];

              return (
                <Box key={key}>
                  <Card
                    elevation={4}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      transition: "all 0.3s ease-in-out",
                      border:
                        key === "trucks_plus" ? "2px solid #2196F3" : "none",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{ flexGrow: 1, p: 2, textAlign: "center" }}
                    >
                      <Box
                        sx={{
                          background: color.gradient,
                          borderRadius: "50%",
                          width: 50,
                          height: 50,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 12px",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: "white", fontWeight: 700 }}
                        >
                          {pkg.adLimit}
                        </Typography>
                      </Box>

                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, mb: 1.5 }}
                      >
                        {pkg.name}
                      </Typography>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: "#999",
                            textDecoration: "line-through",
                            mb: 0.5,
                          }}
                        >
                          {pkg.originalPrice} ₺/ay
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#D34237", fontWeight: 600 }}
                        >
                          İlk 3 ay ücretsiz!
                        </Typography>
                      </Box>

                      <List dense>
                        {pkg.features.map((feature: string, index: number) => (
                          <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleIcon
                                sx={{ color: color.primary, fontSize: 18 }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                fontSize: "13px",
                                color: "#666",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={() => handleSelectPackage(key, pkg)}
                        sx={{
                          background: color.gradient,
                          color: "white",
                          fontWeight: 600,
                          py: 1,
                          fontSize: "13px",
                          borderRadius: 2,
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        Paketi Seç
                      </Button>
                    </Box>
                  </Card>
                </Box>
              );
            })}
        </Box>

        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            p: 2,
            backgroundColor: "#fff",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#666", mb: 0.5, fontSize: "13px" }}
          >
            💡 <strong>Not:</strong> İlk 3 ay ücretsiz deneme süresi sonunda
            otomatik olarak ücretlendirme başlar. İstediğiniz zaman iptal
            edebilirsiniz.
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", fontSize: "13px" }}>
            Tüm paketlerde 24/7 müşteri desteği ve güvenli ödeme seçenekleri
            mevcuttur.
          </Typography>
        </Box>
      </Container>

      {selectedPackage && (
        <SubscriptionModal
          open={modalOpen}
          onClose={handleCloseModal}
          packageType={selectedPackage.type}
          packageData={selectedPackage.data}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
};

export default PackageSelection;
