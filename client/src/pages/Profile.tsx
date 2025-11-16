import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  IconButton,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  TrendingUp,
  AccessTime,
  Star,
  Security,
} from "@mui/icons-material";
import { useAppSelector } from "@/hooks/redux";
import type { RootState } from "@/store";
import * as dopingApi from "@/api/doping";
import { authApi } from "@/api/auth";
import { subscriptionApi } from "@/api/subscription";

const Profile: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userDopings, setUserDopings] = useState<
    Array<{
      id: string;
      expiresAt: string;
      package: {
        name: string;
        description: string;
        price: number;
      };
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // User statistics
  const [userStats, setUserStats] = useState({
    totalAds: 0,
    activeAds: 0,
    pendingAds: 0,
    totalViews: 0,
    activeDopings: 0,
  });

  // Subscription data
  const [subscription, setSubscription] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    companyName: user?.companyName || "",
    address: user?.address || "",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user dopings and stats
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch dopings, stats, and subscription in parallel
        const [dopings, stats, userSubscription] = await Promise.all([
          dopingApi.getUserDopings(),
          authApi.getUserStats(),
          subscriptionApi.getMySubscription().catch(() => null),
        ]);

        setUserDopings(dopings);
        setUserStats(stats);
        setSubscription(userSubscription);
      } catch (error: unknown) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // TODO: API call to update user profile
      console.log("Saving profile:", formData);
      setIsEditing(false);
      setAlert({ type: "success", message: "Profil başarıyla güncellendi!" });
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      setAlert({
        type: "error",
        message: "Profil güncellenirken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: "error", message: "Yeni şifreler eşleşmiyor!" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setAlert({ type: "error", message: "Şifre en az 6 karakter olmalıdır!" });
      return;
    }

    try {
      setLoading(true);

      await authApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setAlert({ type: "success", message: "Şifre başarıyla güncellendi!" });
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      let errorMessage = "Şifre güncellenirken bir hata oluştu.";
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as { response?: { data?: { error?: string } } };
        errorMessage = apiError.response?.data?.error || errorMessage;
      }
      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      companyName: user?.companyName || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const formatRemainingTime = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} gün kaldı` : "Süresi dolmuş";
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 1, sm: 3 } }}>
        {/* Alert */}
        {alert && (
          <Alert
            severity={alert.type}
            sx={{ mb: 3 }}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: "#1a1a1a",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                mb: 1,
              }}
            >
              Profil Ayarları
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#6b7280",
                fontSize: isMobile ? "0.875rem" : "1rem",
              }}
            >
              Hesap bilgilerinizi yönetin ve güncelleyin
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => (window.location.href = "/packages")}
            sx={{
              background: "linear-gradient(135deg, #D34237 0%, #313B4C 100%)",
              color: "white",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              "&:hover": {
                background: "linear-gradient(135deg, #313B4C 0%, #D34237 100%)",
                transform: "scale(1.02)",
              },
            }}
          >
            🏪 Dükkan Aç
          </Button>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              label="Kişisel Bilgiler"
              iconPosition="start"
            />
            <Tab icon={<Star />} label="Aktif Dopingler" iconPosition="start" />
            <Tab icon={<Security />} label="Güvenlik" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {currentTab === 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Profile Card */}
            <Box sx={{ flex: { md: "0 0 350px" }, width: "100%" }}>
              <Paper
                sx={{
                  p: isMobile ? 2 : 3,
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                  },
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Avatar
                    sx={{
                      width: isMobile ? 80 : 100,
                      height: isMobile ? 80 : 100,
                      mx: "auto",
                      mb: 2,
                      bgcolor: "rgba(255,255,255,0.2)",
                      fontSize: isMobile ? "2rem" : "2.5rem",
                      fontWeight: 600,
                      border: "3px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>

                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "Kullanıcı"}
                  </Typography>

                  <Chip
                    label={user?.role === "CORPORATE" ? "Kurumsal" : "Bireysel"}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 500,
                      mb: 2,
                    }}
                  />

                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {user?.email}
                  </Typography>

                  {user?.role === "CORPORATE" && user?.companyName && (
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        icon={
                          <BusinessIcon sx={{ color: "white !important" }} />
                        }
                        label={user.companyName}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          color: "white",
                          "& .MuiChip-icon": { color: "white" },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Quick Stats */}
              <Paper sx={{ p: isMobile ? 2 : 3, mt: 3 }}>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 600, mb: 2, color: "#1a1a1a" }}
                >
                  Hesap Özeti
                </Typography>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Toplam İlan
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      fontWeight={600}
                    >
                      {userStats.totalAds}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Aktif İlan
                    </Typography>
                    <Typography
                      variant="h6"
                      color="success.main"
                      fontWeight={600}
                    >
                      {userStats.activeAds}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Görüntülenme
                    </Typography>
                    <Typography variant="h6" color="info.main" fontWeight={600}>
                      {userStats.totalViews.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Aktif Doping
                    </Typography>
                    <Typography
                      variant="h6"
                      color="warning.main"
                      fontWeight={600}
                    >
                      {userStats.activeDopings}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Subscription Card */}
              {subscription && (
                <Paper
                  sx={{
                    p: 2.5,
                    mt: 2,
                    background: subscription.isTrial
                      ? "linear-gradient(135deg, #D34237 0%, #313B4C 100%)"
                      : "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                    color: "white",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    🏪 Aktif Paket
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {subscription.packageType === "trucks"
                          ? "Trucks"
                          : subscription.packageType === "trucks_plus"
                          ? "Trucks+"
                          : "TrucksBus"}
                      </Typography>
                      {subscription.isTrial && (
                        <Chip
                          label="Deneme Süresi"
                          size="small"
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "white",
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">İlan Hakkı</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {subscription.adsUsed} / {subscription.adLimit}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">Bitiş Tarihi</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(subscription.endDate).toLocaleDateString(
                          "tr-TR"
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Box>

            {/* Profile Form */}
            <Box sx={{ flex: 1, width: "100%" }}>
              <Paper sx={{ p: isMobile ? 2 : 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? 2 : 0,
                  }}
                >
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    sx={{ fontWeight: 600, color: "#1a1a1a" }}
                  >
                    Kişisel Bilgiler
                  </Typography>
                  {!isEditing ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Düzenle
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        variant="contained"
                        disabled={loading}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 500,
                        }}
                      >
                        Kaydet
                      </Button>
                      <Button
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        variant="outlined"
                        color="secondary"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 500,
                        }}
                      >
                        İptal
                      </Button>
                    </Stack>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Ad"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ color: "#9ca3af", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Soyad"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="E-posta"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ color: "#9ca3af", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Telefon"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon sx={{ color: "#9ca3af", mr: 1 }} />
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {user?.role === "CORPORATE" && (
                    <>
                      <Box sx={{ gridColumn: "1 / -1" }}>
                        <Divider sx={{ my: 1 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "#1a1a1a" }}
                        >
                          Kurumsal Bilgiler
                        </Typography>
                      </Box>

                      <TextField
                        fullWidth
                        label="Şirket Adı"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <BusinessIcon sx={{ color: "#9ca3af", mr: 1 }} />
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Adres"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: (
                            <LocationIcon sx={{ color: "#9ca3af", mr: 1 }} />
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {/* Active Dopings Tab */}
        {currentTab === 1 && (
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}
            >
              Aktif Doping Paketlerim
            </Typography>

            {userDopings.length === 0 ? (
              <Box sx={{ textAlign: "center", py: isMobile ? 4 : 6 }}>
                <Star
                  sx={{ fontSize: isMobile ? 48 : 64, color: "#e5e7eb", mb: 2 }}
                />
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  color="text.secondary"
                  gutterBottom
                >
                  Aktif doping paketiniz bulunmamaktadır
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  İlanlarınızı öne çıkarmak için doping paketlerimizi inceleyin
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => (window.location.href = "/doping")}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Doping Paketlerini Görüntüle
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {userDopings.map((doping) => (
                  <Card
                    key={doping.id}
                    sx={{
                      height: "100%",
                      border: "1px solid #e5e7eb",
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Star sx={{ color: "#f59e0b", mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {doping.package.name}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {doping.package.description}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <AccessTime
                          sx={{ color: "#6b7280", mr: 1, fontSize: 20 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {formatRemainingTime(doping.expiresAt)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <TrendingUp
                          sx={{ color: "#10b981", mr: 1, fontSize: 20 }}
                        />
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight={500}
                        >
                          Aktif
                        </Typography>
                      </Box>

                      <Typography
                        variant="h6"
                        color="primary.main"
                        sx={{ fontWeight: 700 }}
                      >
                        ₺{doping.package.price}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        )}

        {/* Security Tab */}
        {currentTab === 2 && (
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{ fontWeight: 600, mb: 3, color: "#1a1a1a" }}
            >
              Güvenlik Ayarları
            </Typography>

            <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? 2 : 0,
                  }}
                >
                  <Box>
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Şifre Değiştir
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hesabınızın güvenliği için düzenli olarak şifrenizi
                      değiştirin
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    Şifre Değiştir
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        )}

        {/* Password Change Dialog */}
        <Dialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Şifre Değiştir</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Mevcut Şifre"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Yeni Şifre"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Yeni Şifre Tekrar"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setPasswordDialogOpen(false)}
              sx={{ textTransform: "none" }}
            >
              İptal
            </Button>
            <Button
              onClick={handlePasswordUpdate}
              variant="contained"
              disabled={loading}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Güncelle
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Profile;
