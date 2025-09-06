import React, { useState } from "react";
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
  useTheme,
  useMediaQuery,
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
} from "@mui/icons-material";
import { useAppSelector } from "@/hooks/redux";
import type { RootState } from "@/store";

const Profile: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    companyName: user?.companyName || "",
    address: user?.address || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: API call to update user profile
    console.log("Saving profile:", formData);
    setIsEditing(false);
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

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#313B4C",
            fontSize: { xs: "1.5rem", sm: "2.125rem" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Profil Bilgileri
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: { xs: "center", sm: "left" } }}
        >
          Hesap bilgilerinizi görüntüleyin ve güncelleyin
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, sm: 3 },
          flexDirection: { xs: "column", lg: "row" },
          alignItems: { xs: "stretch", lg: "flex-start" },
        }}
      >
        {/* Profile Card */}
        <Box sx={{ flex: { lg: "0 0 350px" }, width: "100%" }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: "center" }}>
            <Avatar
              sx={{
                width: { xs: 80, sm: 120 },
                height: { xs: 80, sm: 120 },
                mx: "auto",
                mb: 2,
                bgcolor: "#D34237",
                fontSize: "2rem",
              }}
            >
              {getUserInitials()}
            </Avatar>

            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                mb: 1,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Kullanıcı"}
            </Typography>

            <Chip
              label={
                user?.role === "CORPORATE" ? "Kurumsal Hesap" : "Bireysel Hesap"
              }
              color={user?.role === "CORPORATE" ? "success" : "primary"}
              sx={{ mb: 2 }}
              size={isMobile ? "small" : "medium"}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {user?.email}
            </Typography>

            {user?.role === "CORPORATE" && user?.companyName && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<BusinessIcon />}
                  label={user.companyName}
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}
          </Paper>
        </Box>

        {/* Profile Details */}
        <Box sx={{ flex: 1, width: "100%" }}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.125rem", sm: "1.25rem" },
                }}
              >
                Kişisel Bilgiler
              </Typography>

              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Düzenle
                </Button>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: { xs: "column", sm: "row" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    Kaydet
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    variant="outlined"
                    color="secondary"
                    size={isMobile ? "small" : "medium"}
                    fullWidth={isMobile}
                  >
                    İptal
                  </Button>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(auto-fit, minmax(250px, 1fr))",
                },
                gap: { xs: 2, sm: 3 },
              }}
            >
              {/* Personal Information */}
              <TextField
                fullWidth
                label="Ad"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: "#666", mr: 1 }} />,
                }}
              />

              <TextField
                fullWidth
                label="Soyad"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <TextField
                fullWidth
                label="E-posta"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: "#666", mr: 1 }} />,
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
                  startAdornment: <PhoneIcon sx={{ color: "#666", mr: 1 }} />,
                }}
              />

              {/* Corporate Information */}
              {user?.role === "CORPORATE" && (
                <>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
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
                        <BusinessIcon sx={{ color: "#666", mr: 1 }} />
                      ),
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
                        <LocationIcon sx={{ color: "#666", mr: 1 }} />
                      ),
                    }}
                  />
                </>
              )}
            </Box>
          </Paper>

          {/* Account Statistics */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Hesap İstatistikleri
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 2,
              }}
            >
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam İlan
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography
                    variant="h4"
                    color="success.main"
                    sx={{ fontWeight: "bold" }}
                  >
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktif İlan
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography
                    variant="h4"
                    color="warning.main"
                    sx={{ fontWeight: "bold" }}
                  >
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Beklemede
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography
                    variant="h4"
                    color="info.main"
                    sx={{ fontWeight: "bold" }}
                  >
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Görüntülenme
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Profile;
