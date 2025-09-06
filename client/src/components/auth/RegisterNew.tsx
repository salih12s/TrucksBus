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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { registerUser, clearError } from "../../store/authSlice";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Telefon formatı: 0555 555 55 55
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, "");

    // 11 haneden fazla girişi engelle
    if (numbers.length > 11) return formData.phone;

    // Boşsa return et
    if (numbers.length === 0) return "";

    // İlk rakam 0 olmalı
    if (numbers.length === 1 && numbers !== "0") return "0";

    // Format uygula
    let formatted = numbers;
    if (numbers.length > 4) {
      formatted = numbers.slice(0, 4) + " " + numbers.slice(4);
    }
    if (numbers.length > 7) {
      formatted =
        numbers.slice(0, 4) +
        " " +
        numbers.slice(4, 7) +
        " " +
        numbers.slice(7);
    }
    if (numbers.length > 9) {
      formatted =
        numbers.slice(0, 4) +
        " " +
        numbers.slice(4, 7) +
        " " +
        numbers.slice(7, 9) +
        " " +
        numbers.slice(9);
    }

    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

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
      phone: formData.phone.replace(/\s/g, ""), // Remove spaces for API call
      password: formData.password,
      role: "USER" as const,
      kvkkAccepted: acceptTerms,
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
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(135deg, #313B4C 0%, #2a3441 100%)",
          display: { xs: "none", md: "flex" },
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
          {/* Logo */}
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              mx: "auto",
              overflow: "hidden",
            }}
          >
            <img
              src="/Trucksbus.png"
              alt="TrucksBus Logo"
              style={{
                width: "280px",
                height: "280px",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          </Box>

          {/* Welcome Text */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              mb: 2,
              background: "linear-gradient(45deg, #ffffff 30%, #D34237 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TRUCKS-BUS
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
            Aradığın araç bir tık ötede
          </Typography>

          {/* Features */}
          <Box sx={{ textAlign: "left", maxWidth: 400 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#D34237",
                  mr: 2,
                }}
              />
              <Typography variant="body1">
                Ücretsiz üyelik ve ilan verme
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#D34237",
                  mr: 2,
                }}
              />
              <Typography variant="body1">Güvenli alım-satım imkanı</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#D34237",
                  mr: 2,
                }}
              />
              <Typography variant="body1">Geniş araç portföyü</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Register Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          minHeight: { xs: "100vh", md: "auto" },
        }}
      >
        {/* Mobile Logo */}
        {isMobile && (
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
          >
            <img
              src="/Trucksbus.png"
              alt="TrucksBus Logo"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "contain",
                filter:
                  "brightness(0) saturate(100%) invert(20%) sepia(20%) saturate(500%) hue-rotate(190deg)",
              }}
            />
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            width: "100%",
            maxWidth: 480,
            borderRadius: 3,
            backgroundColor: "white",
            boxShadow: { xs: "none", md: "0 10px 40px rgba(0,0,0,0.1)" },
            mt: { xs: 8, md: 0 },
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#313B4C",
                mb: 1,
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
              }}
            >
              Hesap aç
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
              }}
            >
              Dakikalar içinde başlayalım
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Register Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                name="firstName"
                label="Ad"
                value={formData.firstName}
                onChange={handleChange}
                required
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
              />
            </Box>

            {/* Email Field */}
            <TextField
              fullWidth
              name="email"
              type="email"
              label="E-posta"
              value={formData.email}
              onChange={handleChange}
              required
              size={isMobile ? "small" : "medium"}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Phone Field */}
            <TextField
              fullWidth
              name="phone"
              label="Telefon"
              placeholder="0555 555 55 55"
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
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              label="Şifre"
              placeholder="En az 8 karakter"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 1 }}
              helperText="Şifreniz en az 8 karakter olmalı ve şunları içermeli: 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter (@$!%*?&)"
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
                    color: "#D34237",
                    "&.Mui-checked": {
                      color: "#D34237",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  <Link
                    to="/terms"
                    style={{ color: "#D34237", textDecoration: "none" }}
                  >
                    KVKK Aydınlatma Metni
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
                backgroundColor: "#D34237",
                fontSize: "16px",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#B73429",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}
            >
              {isLoading ? "Hesap oluşturuluyor..." : "Hesap Aç"}
            </Button>

            {/* Login Links */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Zaten hesabın var mı?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#D34237",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Giriş yap
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                Kurumsal hesap mı istiyorsunuz? 🏢{" "}
                <Link
                  to="/register-corporate"
                  style={{
                    color: "#D34237",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Kurumsal Kayıt
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register;
