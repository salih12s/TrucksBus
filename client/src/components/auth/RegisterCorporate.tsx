import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Business,
  LocationOn,
  AccountBalance,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { registerUser, clearError } from "../../store/authSlice";

const RegisterCorporate: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    companyName: "",
    taxNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return;
    }

    if (!acceptTerms) {
      alert("Kullanım şartlarını kabul etmelisiniz!");
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: "CORPORATE" as const,
      companyName: formData.companyName,
      taxId: formData.taxNumber,
      address: formData.address,
    };

    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Left Side - Corporate Branding */}
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(135deg, #1a472a 0%, #2d6b3d 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          p: 4,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.03"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.03"/><circle cx="25" cy="75" r="1" fill="%23ffffff" opacity="0.03"/><circle cx="75" cy="25" r="1" fill="%23ffffff" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\') repeat',
            opacity: 0.4,
          },
        }}
      >
        <Box sx={{ textAlign: "center", zIndex: 1 }}>
          {/* Corporate Logo */}
          <Box
            sx={{
              width: 120,
              height: 120,
              backgroundColor: "white",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              mx: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <Business sx={{ fontSize: 60, color: "#1a472a" }} />
          </Box>

          {/* Corporate Welcome Text */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              mb: 2,
              background: "linear-gradient(45deg, #ffffff 30%, #4caf50 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            KURUMSAL
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            İşletmeniz için özel çözümler
          </Typography>

          {/* Corporate Features */}
          <Box sx={{ textAlign: "left", maxWidth: 400 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#4caf50",
                  mr: 2,
                }}
              />
              <Typography variant="body1">Özel kurumsal destek</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#4caf50",
                  mr: 2,
                }}
              />
              <Typography variant="body1">Toplu araç alım-satım</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#4caf50",
                  mr: 2,
                }}
              />
              <Typography variant="body1">Özel fiyatlandırma</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#4caf50",
                  mr: 2,
                }}
              />
              <Typography variant="body1">
                Ticari finansman çözümleri
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Corporate Register Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            width: "100%",
            maxWidth: 520,
            borderRadius: 3,
            backgroundColor: "white",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#1a472a",
                mb: 1,
              }}
            >
              Kurumsal Hesap
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
              }}
            >
              İşletmeniz için özel avantajlar
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Corporate Register Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Company Information */}
            <Typography
              variant="h6"
              sx={{ color: "#1a472a", mb: 2, fontWeight: "bold" }}
            >
              Şirket Bilgileri
            </Typography>

            <TextField
              fullWidth
              name="companyName"
              label="Şirket Adı"
              value={formData.companyName}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                name="taxNumber"
                label="Vergi Numarası"
                value={formData.taxNumber}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                name="address"
                label="Adres"
                value={formData.address}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Contact Person Information */}
            <Typography
              variant="h6"
              sx={{ color: "#1a472a", mb: 2, fontWeight: "bold" }}
            >
              İletişim Sorumlusu
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                name="firstName"
                label="Ad"
                value={formData.firstName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                name="lastName"
                label="Soyad"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Box>

            {/* Contact Information */}
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Kurumsal E-posta"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="phone"
              label="Telefon"
              placeholder="0xxx xxx xx xx"
              value={formData.phone}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Fields */}
            <Typography
              variant="h6"
              sx={{ color: "#1a472a", mb: 2, fontWeight: "bold" }}
            >
              Güvenlik
            </Typography>

            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              label="Şifre"
              placeholder="En az 8 karakter"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Şifre Tekrar"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Terms & Conditions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  sx={{
                    color: "#4caf50",
                    "&.Mui-checked": {
                      color: "#4caf50",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  <Link
                    to="/terms"
                    style={{ color: "#4caf50", textDecoration: "none" }}
                  >
                    Kurumsal Sözleşme
                  </Link>
                  'yi ve{" "}
                  <Link
                    to="/privacy"
                    style={{ color: "#4caf50", textDecoration: "none" }}
                  >
                    KVKK Metni
                  </Link>
                  'ni okudum ve kabul ediyorum.
                </Typography>
              }
              sx={{ mb: 4 }}
            />

            {/* Register Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !acceptTerms}
              sx={{
                py: 1.5,
                mb: 3,
                backgroundColor: "#4caf50",
                fontSize: "16px",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#45a049",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}
            >
              {isLoading
                ? "Kurumsal hesap oluşturuluyor..."
                : "Kurumsal Hesap Aç"}
            </Button>

            {/* Login Links */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Zaten hesabın var mı?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#4caf50",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Giriş yap
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                Bireysel hesap mı istiyorsunuz? 👤{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#4caf50",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Bireysel Kayıt
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterCorporate;
