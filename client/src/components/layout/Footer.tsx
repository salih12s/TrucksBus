import React from "react";
import { Box, Container, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Phone, Email } from "@mui/icons-material";

const Footer: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: "#F9F9F9", color: "#666", mt: "auto" }}>
      <Container maxWidth="lg" sx={{ py: 1.5, px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 2, md: 3 },
            justifyItems: "center",
            textAlign: "center",
          }}
        >
          {/* Kurumsal */}
          <Box sx={{ width: "100%", maxWidth: 200 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#333",
                fontWeight: "bold",
                mb: 1.5,
                fontSize: "15px",
                textAlign: "center",
              }}
            >
              Kurumsal
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Link
                component={RouterLink}
                to="/about"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "13px",
                  "&:hover": { color: "#333" },
                  textAlign: "center",
                }}
              >
                Hakkımızda
              </Link>
              <Link
                component={RouterLink}
                to="/sustainability"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Sürdürülebilirlik
              </Link>
              <Link
                component={RouterLink}
                to="/human-resources"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                İnsan Kaynakları
              </Link>
              <Link
                component={RouterLink}
                to="/news"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Haberler
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                İletişim
              </Link>
            </Box>
          </Box>

          {/* Gizlilik ve Kullanım */}
          <Box sx={{ width: "100%", maxWidth: 200 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#333",
                fontWeight: "bold",
                mb: 1.5,
                fontSize: "15px",
                textAlign: "center",
              }}
            >
              Gizlilik ve Kullanım
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Link
                component={RouterLink}
                to="/guvenli-alisveris"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Güvenli Alışveriş İpuçları
              </Link>
              <Link
                component={RouterLink}
                to="/kullanim-kosullari"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Kullanım Koşulları
              </Link>
              <Link
                component={RouterLink}
                to="/kisisel-verilerin-korunmasi"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Kişisel Verilerin Korunması
              </Link>
              <Link
                component={RouterLink}
                to="/cerez-yonetimi"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Çerez Yönetimi
              </Link>
            </Box>
          </Box>

          {/* Bizi Takip Edin */}
          <Box sx={{ width: "100%", maxWidth: 200 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#333",
                fontWeight: "bold",
                mb: 1.5,
                fontSize: "15px",
                textAlign: "center",
              }}
            >
              Bizi Takip Edin
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Link
                href="https://facebook.com"
                target="_blank"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Facebook
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                X
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                Instagram
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                LinkedIn
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Alt Kısım - İletişim ve Copyright */}
      <Box sx={{ backgroundColor: "#F9F9F9", py: 1.5 }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 2, md: 4 },
              textAlign: "center",
            }}
          >
            {/* İletişim Bilgileri */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, md: 4 },
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ color: "#d63384", fontSize: 18 }} />
                <Box>
                  <Typography
                    sx={{
                      color: "#d63384",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    7/24 Müşteri Hizmetleri
                  </Typography>
                  <Typography sx={{ color: "#333", fontSize: "12px" }}>
                    0 850 222 44 44
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ color: "#d63384", fontSize: 18 }} />
                <Box>
                  <Typography
                    sx={{
                      color: "#d63384",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    Yardım Merkezi
                  </Typography>
                  <Typography sx={{ color: "#333", fontSize: "12px" }}>
                    yardim.trucksbus.com.tr
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Yasal Metin */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #dee2e6" }}>
            <Typography
              sx={{
                color: "#666",
                fontSize: "11px",
                lineHeight: 1.4,
                mb: 1.5,
                textAlign: "center",
              }}
            >
              trucksbus.com.tr'da yer alan tüm içerik kullanıcılara aittir.
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 1, md: 3 },
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#666", fontSize: "11px" }}>
                Copyright © 2000-2025 trucksbus.com.tr
              </Typography>
              <Typography sx={{ color: "#666", fontSize: "11px" }}>
                ETBİS Kayıtlıdır.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
