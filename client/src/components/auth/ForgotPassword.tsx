import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { Email, ArrowBack } from "@mui/icons-material";
import { Link } from "react-router-dom";
import apiClient from "../../api/client";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("E-posta adresi gerekli");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Geçerli bir e-posta adresi girin");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as { response?: { data?: { error?: string } } };
        setError(
          apiError.response?.data?.error ||
            "Bir hata oluştu. Lütfen tekrar deneyin."
        );
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
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
          Ticari araç alım satımında güvenilir adresiniz
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
          {!isSubmitted ? (
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
                  Şifremi Unuttum
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  E-posta adresinizi girin, şifre sıfırlama bağlantısı
                  göndereceğiz
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
                  name="email"
                  type="email"
                  label="E-posta"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mb: 4 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#666" }} />
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
                  {isLoading
                    ? "Gönderiliyor..."
                    : "Şifre Sıfırlama Bağlantısı Gönder"}
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    <ArrowBack sx={{ fontSize: 16 }} />
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
                <Email sx={{ fontSize: 40, color: "white" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#313B4C",
                  mb: 2,
                }}
              >
                E-posta Gönderildi!
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı
                gönderildi.
                <br />
                E-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi
                sıfırlayın.
              </Typography>

              <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
                <Typography variant="body2">
                  • E-posta 5-10 dakika içinde gelecektir
                  <br />
                  • Spam klasörünüzü de kontrol edin
                  <br />• Bağlantı 1 saat süreyle geçerlidir
                </Typography>
              </Alert>

              <Button
                variant="outlined"
                onClick={() => setIsSubmitted(false)}
                sx={{
                  mr: 2,
                  color: "#D34237",
                  borderColor: "#D34237",
                  "&:hover": {
                    borderColor: "#B73429",
                    backgroundColor: "rgba(211, 66, 55, 0.04)",
                  },
                }}
              >
                Tekrar Gönder
              </Button>

              <Button
                variant="contained"
                component={Link}
                to="/login"
                sx={{
                  backgroundColor: "#D34237",
                  "&:hover": {
                    backgroundColor: "#B73429",
                  },
                }}
              >
                Giriş Sayfasına Dön
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
