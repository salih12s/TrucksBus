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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { registerUser, clearError } from "../../store/authSlice";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
            TrucksBus.com
          </Box>

          {/* Register Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "600",
              color: "#333",
              mb: 2,
              fontSize: "24px",
            }}
          >
            Hesap aç
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

          {/* Register Form */}
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
              sx={{
                mb: 2,
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

            {/* Name Fields */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                name="firstName"
                placeholder="Ad"
                value={formData.firstName}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{
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
              <TextField
                fullWidth
                name="lastName"
                placeholder="Soyad"
                value={formData.lastName}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{
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
            </Box>

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

            {/* Terms & Conditions */}
            <Box sx={{ mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
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
                    <Link
                      to="/terms"
                      style={{ color: "#4A90E2", textDecoration: "none" }}
                    >
                      Bireysel Hesap Sözleşmesi ve Etkiler
                    </Link>
                    'ni kabul ediyorum.
                  </Typography>
                }
              />
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#666",
                  mt: 1,
                  ml: 4,
                  lineHeight: 1.4,
                }}
              >
                İletişim bilgilerime kampanya, tanıtım ve reklam içerikli ticari
                elektronik ileti gönderilmesine, bu amaçla kişisel verilerimin
                işlenmesine ve tedarikçilerinizle paylaşılmasına izin veriyorum.
              </Typography>
            </Box>

            {/* Register Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !acceptTerms}
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
              {isLoading ? "Hesap oluşturuluyor..." : "Hesap Aç"}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Zaten hesabın var mı?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#4A90E2",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  Giriş yap ▸
                </Link>
              </Typography>
            </Box>

            {/* Corporate Registration Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Kurumsal hesap mı istiyorsunuz?{" "}
                <Link
                  to="/register-corporate"
                  style={{
                    color: "#4A90E2",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  Kurumsal Kayıt ▸
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
