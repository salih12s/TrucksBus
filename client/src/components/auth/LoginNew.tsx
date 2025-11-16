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
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginUser, clearError } from "../../store/authSlice";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

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
        height: "100vh",
        display: "flex",
        backgroundColor: "#f8f9fa",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <IconButton
        onClick={() => navigate("/login-selection")}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#666",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)",
          },
        }}
      >
        <ArrowBack />
      </IconButton>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          overflow: "auto",
          maxHeight: "90vh",
        }}
      >
        {/* Header with Logo/Brand */}
        <Box
          sx={{
            textAlign: "center",
            pt: 3,
            pb: 2,
            px: 3,
          }}
        >
          {/* TrucksBus.com Brand */}
          <Box
            sx={{
              display: "inline-block",
              backgroundColor: "#E53E3E",
              color: "white",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontSize: "14px",
              fontWeight: "bold",
              mb: 1.5,
              letterSpacing: "0.5px",
            }}
          >
            TrucksBus.com.tr
          </Box>

          {/* Logo */}
          <Box sx={{ mb: 2 }}>
            <img
              src="/Trucksbus.png"
              alt="TrucksBus Logo"
              style={{
                height: "60px",
                width: "auto",
              }}
            />
          </Box>

          {/* Login Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "600",
              color: "#333",
              mb: 1,
              fontSize: "20px",
            }}
          >
            Giriş yap
          </Typography>
        </Box>

        {/* Form Container */}
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, py: 0.5, fontSize: "13px" }}>
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
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "transparent",
                  borderRadius: 1,
                  "& fieldset": {
                    borderColor: "#ddd",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4A90E2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "1px",
                  },
                },
                "& .MuiInputBase-input": {
                  py: 1.2,
                  fontSize: "14px",
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
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "transparent",
                  borderRadius: 1,
                  "& fieldset": {
                    borderColor: "#ddd",
                    borderWidth: "1px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4A90E2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "1px",
                  },
                },
                "& .MuiInputBase-input": {
                  py: 1.2,
                  fontSize: "14px",
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
                mb: 2.5,
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
                      padding: "6px",
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "13px", color: "#666" }}>
                    Oturumumu açık kalsın
                  </Typography>
                }
              />
              <Link
                to="/forgot-password"
                style={{
                  color: "#4A90E2",
                  textDecoration: "none",
                  fontSize: "13px",
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
                py: 1.3,
                mb: 2.5,
                backgroundColor: "#4A90E2",
                fontSize: "14px",
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
              <Typography
                variant="body2"
                sx={{ color: "#666", fontSize: "13px" }}
              >
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
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
