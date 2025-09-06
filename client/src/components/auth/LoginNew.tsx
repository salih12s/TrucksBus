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
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginUser, clearError } from "../../store/authSlice";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    if (formData.email && formData.password) {
      const result = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(result)) {
        // Admin kontrolü
        const user = result.payload?.user;
        if (user?.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
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
            TrucksBus'a Hoş Geldin
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
            Türkiye'nin en kapsamlı ticari araç platformu. Hemen giriş yapın,
            hayalinizdeki aracı bulun.
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
                Güvenilir ve doğrulanmış ilanlar
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
              <Typography variant="body1">
                7/24 müşteri destek hizmeti
              </Typography>
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
              <Typography variant="body1">Kolay ve hızlı ilan verme</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
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
              Giriş Yap
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Hesabınıza giriş yaparak devam edin
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <TextField
              fullWidth
              name="email"
              type="email"
              label="E-posta"
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

            {/* Password Field */}
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              label="Şifre"
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

            {/* Remember Me & Forgot Password */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: "#D34237",
                      "&.Mui-checked": {
                        color: "#D34237",
                      },
                    }}
                  />
                }
                label="Oturumumu açık kalsın"
              />
              <Link
                to="/forgot-password"
                style={{
                  color: "#D34237",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Şifremi unuttum
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
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
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            {/* Register Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Hesabın yok mu?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#D34237",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Kayıt Ol
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                Kurumsal hesabın var mı?{" "}
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

export default Login;
