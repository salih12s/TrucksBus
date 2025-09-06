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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#313B4C" }}>
          Profil Bilgileri
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hesap bilgilerinizi görüntüleyin ve güncelleyin
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {/* Profile Card */}
        <Box sx={{ flex: "1 1 300px", minWidth: "280px" }}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 2,
                bgcolor: "#D34237",
                fontSize: "2rem",
              }}
            >
              {getUserInitials()}
            </Avatar>

            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
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
            />

            <Typography variant="body2" color="text.secondary">
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
        <Box sx={{ flex: "2 1 400px", minWidth: "320px" }}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Kişisel Bilgiler
              </Typography>

              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                >
                  Düzenle
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                  >
                    Kaydet
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    variant="outlined"
                    color="secondary"
                  >
                    İptal
                  </Button>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 3,
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
