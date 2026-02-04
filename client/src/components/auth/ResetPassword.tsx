import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from "@mui/icons-material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../api/client";

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Geçersiz şifre sıfırlama bağlantısı");
      setTokenValid(false);
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        await apiClient.get(`/auth/verify-reset-token?token=${token}`);
        setTokenValid(true);
      } catch {
        setTokenValid(false);
        setError("Bu bağlantı geçersiz veya süresi dolmuş");
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Tüm alanlar gerekli");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır");
      return;
    }

    // Password strength validation - daha esnek
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumber = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(
      formData.newPassword,
    );

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError(
        "Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir",
      );
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword: formData.newPassword,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as { response?: { data?: { error?: string } } };
        setError(
          apiError.response?.data?.error ||
            "Şifre sıfırlanırken bir hata oluştu",
        );
      } else {
        setError("Şifre sıfırlanırken bir hata oluştu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  if (tokenValid === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography>Doğrulanıyor...</Typography>
      </Box>
    );
  }

  if (tokenValid === false) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Bu bağlantı geçersiz veya süresi dolmuş"}
          </Alert>
          <Button
            variant="contained"
            component={Link}
            to="/forgot-password"
            sx={{
              backgroundColor: "#D34237",
              "&:hover": { backgroundColor: "#B73429" },
            }}
          >
            Yeni Şifre Sıfırlama Talebi
          </Button>
        </Paper>
      </Box>
    );
  }

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
          flex: { xs: "none", md: 1 },
          background: "linear-gradient(135deg, #D34237 0%, #B73429 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          position: "relative",
          minHeight: { xs: "200px", md: "100vh" },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "white",
            fontWeight: "bold",
            mb: 2,
            textAlign: "center",
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          TrucksBus
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            maxWidth: 400,
            fontSize: { xs: "1rem", md: "1.25rem" },
          }}
        >
          Alın Satın TrucksBus ile Mutlu Kalın
        </Typography>
      </Box>

      {/* Right Side - Reset Form */}
      <Box
        sx={{
          flex: { xs: "1", md: 1 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 480,
            borderRadius: 3,
            backgroundColor: "white",
            boxShadow: { xs: "none", md: "0 10px 40px rgba(0,0,0,0.1)" },
            mt: { xs: 8, md: 0 },
          }}
        >
          {!isSuccess ? (
            <>
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
                  Yeni Şifre Oluştur
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  Hesabınız için yeni bir şifre belirleyin
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  label="Yeni Şifre"
                  placeholder="En az 8 karakter"
                  value={formData.newPassword}
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
                  sx={{ mb: 4 }}
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
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Submit Button */}
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
                  {isLoading ? "Şifre güncelleniyor..." : "Şifreyi Güncelle"}
                </Button>

                {/* Back to Login Link */}
                <Box sx={{ textAlign: "center" }}>
                  <MuiLink
                    component={Link}
                    to="/login"
                    sx={{
                      color: "#D34237",
                      textDecoration: "none",
                      fontSize: "14px",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Giriş sayfasına dön
                  </MuiLink>
                </Box>
              </form>
            </>
          ) : (
            /* Success State */
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#4caf50",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <CheckCircle sx={{ fontSize: 40, color: "white" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#313B4C",
                  mb: 2,
                }}
              >
                Şifre Başarıyla Güncellendi!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş
                yapabilirsiniz.
              </Typography>

              <Button
                variant="contained"
                onClick={handleLoginRedirect}
                sx={{
                  backgroundColor: "#D34237",
                  py: 1.5,
                  px: 4,
                  "&:hover": {
                    backgroundColor: "#B73429",
                  },
                }}
              >
                Giriş Sayfasına Git
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ResetPassword;
