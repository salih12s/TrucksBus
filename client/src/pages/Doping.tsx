import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Container,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  Snackbar,
  Stack,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  RocketLaunch as RocketIcon,
  FlashOn as FlashOnIcon,
  Diamond as DiamondIcon,
  LightbulbOutlined as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  LocalOffer as OfferIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getDopingPackages,
  getUserDopings,
  activateDoping,
  type DopingPackage,
  type UserDoping,
} from "../api/doping";

const Doping: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<DopingPackage[]>([]);
  const [userDopings, setUserDopings] = useState<UserDoping[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesData, userDopingsData] = await Promise.all([
        getDopingPackages(),
        getUserDopings(),
      ]);

      setPackages(packagesData);
      setUserDopings(userDopingsData);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      setSnackbar({
        open: true,
        message: "Veriler yüklenirken bir hata oluştu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "crown":
        return <StarIcon sx={{ fontSize: 40, color: "#FFD700" }} />;
      case "star":
        return <StarIcon sx={{ fontSize: 40, color: "#FF6B6B" }} />;
      case "flash":
        return <FlashOnIcon sx={{ fontSize: 40, color: "#FF4757" }} />;
      case "rocket":
        return <RocketIcon sx={{ fontSize: 40, color: "#3742FA" }} />;
      case "sun":
        return <LightbulbIcon sx={{ fontSize: 40, color: "#FFA726" }} />;
      case "diamond":
        return <DiamondIcon sx={{ fontSize: 40, color: "#9C27B0" }} />;
      default:
        return <StarIcon sx={{ fontSize: 40 }} />;
    }
  };

  const isPackageActive = (packageId: string) => {
    return userDopings.some(
      (doping) =>
        doping.packageId === packageId &&
        doping.isActive &&
        new Date(doping.expiresAt) > new Date()
    );
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleActivatePackage = async (packageId: string) => {
    try {
      setActivating(true);

      await activateDoping({
        packageId: packageId,
      });

      setSnackbar({
        open: true,
        message: "Doping paketi başarıyla aktif edildi!",
        severity: "success",
      });

      await loadData(); // Verileri yenile
    } catch {
      setSnackbar({
        open: true,
        message: "Aktivasyon sırasında bir hata oluştu",
        severity: "error",
      });
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress size={60} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={handleGoBack}
              sx={{ mr: 2, color: "primary.main" }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <StarIcon sx={{ mr: 1, color: "warning.main", fontSize: 28 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Doping Paketleri
              </Typography>
            </Box>
          </Box>

          <Alert severity="success" sx={{ mb: 2, backgroundColor: "#e8f5e8" }}>
            <Typography variant="body1" fontWeight="bold">
              🎉 6 Ay Ücretsiz Kullanım Fırsatı!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Tüm doping paketlerini 6 ay boyunca ücretsiz kullanabilirsiniz.
              İstediğiniz paketleri seçin ve hemen aktif edin!
            </Typography>
          </Alert>

          <Typography variant="body1" color="text.secondary">
            İlanlarınızı daha fazla kişiye ulaştırmak ve satış şansınızı
            artırmak için özel doping paketlerimizi kullanın.
          </Typography>
        </Paper>

        {/* Doping Packages Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {packages.map((pkg) => {
            const isActive = isPackageActive(pkg.id);
            return (
              <Card
                key={pkg.id}
                elevation={0}
                sx={{
                  height: "100%",
                  position: "relative",
                  borderRadius: 3,
                  border: `2px solid ${isActive ? "#4CAF50" : "transparent"}`,
                  background: isActive
                    ? "linear-gradient(135deg, #e8f5e8 0%, #f1f8f1 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: isActive ? "default" : "pointer",
                  overflow: "visible",
                  "&:hover": isActive
                    ? {}
                    : {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: `0 20px 40px ${alpha(pkg.color, 0.15)}`,
                        border: `2px solid ${alpha(pkg.color, 0.3)}`,
                      },
                }}
                onClick={() => !isActive && handleActivatePackage(pkg.id)}
              >
                {/* Status Badge */}
                {isActive && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Aktif"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: 16,
                      backgroundColor: "#4CAF50",
                      color: "white",
                      fontWeight: "bold",
                      zIndex: 2,
                      boxShadow: 2,
                    }}
                  />
                )}

                {/* Free Badge */}
                <Chip
                  icon={<OfferIcon />}
                  label="ÜCRETSİZ"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -8,
                    left: 16,
                    background: `linear-gradient(45deg, ${pkg.color}, ${alpha(
                      pkg.color,
                      0.8
                    )})`,
                    color: "white",
                    fontWeight: "bold",
                    zIndex: 2,
                    boxShadow: 2,
                  }}
                />

                <CardContent
                  sx={{
                    p: 3,
                    pt: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Icon and Title */}
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${alpha(
                          pkg.color,
                          0.1
                        )}, ${alpha(pkg.color, 0.2)})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        border: `2px solid ${alpha(pkg.color, 0.2)}`,
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          inset: "-2px",
                          borderRadius: "50%",
                          background: `linear-gradient(45deg, ${
                            pkg.color
                          }, ${alpha(pkg.color, 0.6)})`,
                          zIndex: -1,
                          opacity: 0.3,
                        },
                      }}
                    >
                      {getIconComponent(pkg.icon)}
                    </Box>

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      {pkg.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      {pkg.description}
                    </Typography>
                  </Box>

                  {/* Price Section */}
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    {pkg.originalPrice && (
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: "line-through",
                          color: "text.disabled",
                          fontSize: "0.9rem",
                          mb: 0.5,
                        }}
                      >
                        {pkg.originalPrice.toLocaleString("tr-TR")} ₺
                      </Typography>
                    )}
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{
                        background: `linear-gradient(45deg, ${
                          pkg.color
                        }, ${alpha(pkg.color, 0.8)})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ÜCRETSİZ
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pkg.duration} gün geçerli
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2, opacity: 0.5 }} />

                  {/* Features */}
                  <Stack spacing={1} sx={{ flex: 1, mb: 3 }}>
                    {pkg.features.map((feature: string, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 16,
                            color: pkg.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={isActive || activating}
                    sx={{
                      background: isActive
                        ? "#e0e0e0"
                        : `linear-gradient(45deg, ${pkg.color}, ${alpha(
                            pkg.color,
                            0.8
                          )})`,
                      color: "white",
                      fontWeight: "bold",
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: isActive
                        ? "none"
                        : `0 4px 15px ${alpha(pkg.color, 0.3)}`,
                      "&:hover": isActive
                        ? {}
                        : {
                            background: `linear-gradient(45deg, ${alpha(
                              pkg.color,
                              0.9
                            )}, ${pkg.color})`,
                            boxShadow: `0 6px 20px ${alpha(pkg.color, 0.4)}`,
                            transform: "translateY(-1px)",
                          },
                      "&:disabled": {
                        background: "#e0e0e0",
                        color: "#9e9e9e",
                      },
                    }}
                  >
                    {activating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : isActive ? (
                      "Aktif"
                    ) : (
                      "Hemen Aktifleştir"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Doping;
