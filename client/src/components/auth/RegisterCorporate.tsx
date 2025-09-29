import React, { useState, useEffect } from "react";
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
  MenuItem,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { registerUser, clearError } from "../../store/authSlice";
import apiClient from "../../api/client";

// City/District interfaces
interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  cityId: number;
}

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
    cityId: "",
    districtId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [validationError, setValidationError] = useState("");

  // Load cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiClient.get("/ads/cities");
        setCities(response.data as City[]);
      } catch (error) {
        console.error("Şehirler yüklenirken hata:", error);
      }
    };
    fetchCities();
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (formData.cityId) {
      const fetchDistricts = async () => {
        try {
          const response = await apiClient.get(
            `/ads/cities/${formData.cityId}/districts`
          );
          setDistricts(response.data as District[]);
        } catch (error) {
          console.error("İlçeler yüklenirken hata:", error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [formData.cityId]);

  // Telefon numarası formatlama
  const formatPhoneNumber = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, "");

    if (!digitsOnly.startsWith("0")) {
      return "";
    }

    const limitedDigits = digitsOnly.slice(0, 11);

    if (limitedDigits.length <= 4) {
      return limitedDigits;
    } else if (limitedDigits.length <= 7) {
      return limitedDigits.slice(0, 4) + " " + limitedDigits.slice(4);
    } else if (limitedDigits.length <= 9) {
      return (
        limitedDigits.slice(0, 4) +
        " " +
        limitedDigits.slice(4, 7) +
        " " +
        limitedDigits.slice(7)
      );
    } else {
      return (
        limitedDigits.slice(0, 4) +
        " " +
        limitedDigits.slice(4, 7) +
        " " +
        limitedDigits.slice(7, 9) +
        " " +
        limitedDigits.slice(9)
      );
    }
  };

  // Vergi numarası formatlama
  const formatTaxNumber = (taxNumber: string) => {
    const digitsOnly = taxNumber.replace(/\D/g, "");
    return digitsOnly.slice(0, 10);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "phone") {
      formattedValue = formatPhoneNumber(value);
    } else if (name === "taxNumber") {
      formattedValue = formatTaxNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Reset district when city changes
    if (name === "cityId") {
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
        districtId: "", // Reset district selection
      }));
    }

    if (error) {
      dispatch(clearError());
    }

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Şifre en az 8 karakter olmalıdır";
    }
    if (!/[A-Z]/.test(password)) {
      return "Şifre en az 1 büyük harf içermelidir";
    }
    if (!/[a-z]/.test(password)) {
      return "Şifre en az 1 küçük harf içermelidir";
    }
    if (!/[0-9]/.test(password)) {
      return "Şifre en az 1 rakam içermelidir";
    }
    if (!/[@$!%*?&]/.test(password)) {
      return "Şifre en az 1 özel karakter (@$!%*?&) içermelidir";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationError("");

    // Basic required field validation
    const requiredFields = [
      { field: "companyName", message: "Şirket adı gereklidir" },
      { field: "taxNumber", message: "Vergi numarası gereklidir" },
      { field: "firstName", message: "Ad gereklidir" },
      { field: "lastName", message: "Soyad gereklidir" },
      { field: "email", message: "E-posta adresi gereklidir" },
      { field: "phone", message: "Telefon numarası gereklidir" },
      { field: "address", message: "Adres gereklidir" },
      { field: "password", message: "Şifre gereklidir" },
    ];

    for (const { field, message } of requiredFields) {
      if (
        !formData[field as keyof typeof formData] ||
        formData[field as keyof typeof formData].trim() === ""
      ) {
        setValidationError(message);
        return;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Geçerli bir e-posta adresi giriniz!");
      return;
    }

    // Tax number validation (basic)
    if (formData.taxNumber.replace(/\s/g, "").length < 5) {
      setValidationError("Vergi numarası en az 5 karakter olmalıdır!");
      return;
    }

    // Company name validation
    if (formData.companyName.trim().length < 2) {
      setValidationError("Şirket adı en az 2 karakter olmalıdır!");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Şifreler eşleşmiyor!");
      return;
    }

    if (!acceptTerms) {
      setValidationError("Kullanım şartlarını kabul etmelisiniz!");
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone.replace(/\s/g, ""), // Remove spaces for API call
      password: formData.password,
      role: "CORPORATE" as const,
      companyName: formData.companyName,
      taxId: formData.taxNumber.replace(/\s/g, ""), // Remove spaces from tax number too
      address: formData.address,
      kvkkAccepted: acceptTerms,
    };

    console.log("📤 Sending registration data:", userData);

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
          maxWidth: 900,
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
            pb: 2,
            px: 4,
            position: "relative",
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
              mb: 2,
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
                height: "96px",
                width: "auto",
              }}
            />
          </Box>

          {/* Corporate Register Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: "600",
              color: "#333",
              mb: 1,
              fontSize: "24px",
            }}
          >
            Kurumsal Hesap Aç
          </Typography>
        </Box>
        {/* Form Container */}
        <Box sx={{ px: 6, pb: 6 }}>
          {/* Error Alert */}
          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {validationError || error}
            </Alert>
          )}

          {/* Corporate Register Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Form Grid Layout */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              {/* Company Name - Full width first */}
            </Box>

            {/* Company Name Field */}
            <TextField
              fullWidth
              name="companyName"
              placeholder="Şirket Adı"
              value={formData.companyName}
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

            {/* Name fields in grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              {/* First Name and Last Name */}
              <TextField
                fullWidth
                name="firstName"
                placeholder="Adınız"
                value={formData.firstName}
                onChange={handleChange}
                required
                variant="outlined"
                autoComplete="given-name"
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
                placeholder="Soyadınız"
                value={formData.lastName}
                onChange={handleChange}
                required
                variant="outlined"
                autoComplete="family-name"
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

            {/* Email Address */}
            <TextField
              fullWidth
              name="email"
              type="email"
              placeholder="E-posta Adresiniz"
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

            {/* Password */}
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              autoComplete="new-password"
              helperText="En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter (@$!%*?&)"
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
                "& .MuiFormHelperText-root": {
                  fontSize: "12px",
                  color: "#666",
                  mt: 1,
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

            {/* Confirm Password */}
            <TextField
              fullWidth
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Şifre Tekrarı"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              variant="outlined"
              autoComplete="new-password"
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

            {/* Phone */}
            <TextField
              fullWidth
              name="phone"
              placeholder="Sabit Telefon"
              value={formData.phone}
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

            {/* City and District Fields */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                select
                name="cityId"
                placeholder="İl"
                value={formData.cityId}
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
              >
                <MenuItem value="">
                  <em>İl Seçiniz</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="districtId"
                placeholder="İlçe"
                value={formData.districtId}
                onChange={handleChange}
                required
                variant="outlined"
                disabled={!formData.cityId}
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
              >
                <MenuItem value="">
                  <em>İlçe Seçiniz</em>
                </MenuItem>
                {districts.map((district) => (
                  <MenuItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Address Field */}
            <TextField
              fullWidth
              name="address"
              placeholder="Açık Adres"
              value={formData.address}
              onChange={handleChange}
              required
              variant="outlined"
              multiline
              rows={3}
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

            {/* Business Type Section */}
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#333",
                mb: 2,
              }}
            >
              İşletme Türü
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid #4A90E2",
                      backgroundColor: "#4A90E2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "white",
                      }}
                    />
                  </Box>
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "#333" }}>
                    Şahıs Şirketi
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid #ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1,
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "14px", color: "#333" }}>
                    Limited veya Anonim Şirketi
                  </Typography>
                }
              />
            </Box>

            {/* Tax Information - Only Tax Number */}
            <TextField
              fullWidth
              name="taxNumber"
              placeholder="Vergi Numarası"
              value={formData.taxNumber}
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
                      Kurumsal Hesap Sözleşmesi ve Etkiler
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
                Bu sayfadaki bilgiler sahibinden.com hesabı ve fatura gönderimi
                dahil olmak üzere tüm bilgilendirmelerimiz için alınmaktadır.
                Kişisel verilerin korunması hakkında detaylı bilgiye{" "}
                <Link
                  to="/privacy-policy"
                  style={{ color: "#4A90E2", textDecoration: "none" }}
                >
                  buradan
                </Link>{" "}
                ulaşabilirsiniz.
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
            <Box sx={{ textAlign: "center" }}>
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
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterCorporate;
