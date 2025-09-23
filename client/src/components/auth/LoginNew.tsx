import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginUser, clearError } from "../../store/authSlice";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if this is corporate login
  const isCorporateLogin = searchParams.get("type") === "corporate";

  useEffect(() => {
    // If this is corporate login, redirect to corporate registration page
    if (isCorporateLogin) {
      navigate("/register-corporate");
    }
  }, [isCorporateLogin, navigate]);

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
        backgroundColor: "#f8f9fa",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
        }}
      >
        {/* Header with Logo/Brand */}
        <Box
          sx={{
            textAlign: "center",
            pt: 6,
            pb: 4,
            px: 4,
          }}
        >
          {/* TrucksBus.com Brand */}
          <Box
            sx={{
              display: "inline-block",
              backgroundColor: "#E53E3E",
              color: "white",
              px: 3,
              py: 1,
              borderRadius: 1,
              fontSize: "18px",
              fontWeight: "bold",
              mb: 6,
              letterSpacing: "0.5px",
            }}
          >
            TrucksBus.com.tr
          </Box>

          {/* Login Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "600",
              color: "#333",
              mb: 2,
              fontSize: "24px",
            }}
          >
            Giriş yap
          </Typography>
        </Box>

        {/* Form Container */}
        <Box sx={{ px: 4, pb: 6 }}>
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
              placeholder="E-posta adresi"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              autoComplete="email"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "transparent",
                  borderRadius: 1,
                  "& fieldset": {
                    borderColor: "#ddd",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4A90E2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputBase-input": {
                  py: 2,
                  fontSize: "16px",
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              autoComplete="current-password"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "transparent",
                  borderRadius: 1,
                  "& fieldset": {
                    borderColor: "#ddd",
                    borderWidth: "2px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4A90E2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputBase-input": {
                  py: 2,
                  fontSize: "16px",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#666" }}
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
                      color: "#4A90E2",
                      "&.Mui-checked": {
                        color: "#4A90E2",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "#666" }}>
                    Oturumumu açık kalsın
                  </Typography>
                }
              />
              <Link
                to="/forgot-password"
                style={{
                  color: "#4A90E2",
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
                py: 2,
                mb: 4,
                backgroundColor: "#4A90E2",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: 1,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#357ABD",
                  boxShadow: "none",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}
            >
              {isLoading ? "Giriş yapılıyor..." : "E-posta ile giriş yap"}
            </Button>

            {/* Register Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                Henüz hesabın yok mu?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#4A90E2",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  Hesap aç ▸
                </Link>
              </Typography>
            </Box>

            {/* Divider */}
            <Box sx={{ textAlign: "center", my: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#999",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                VEYA
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
