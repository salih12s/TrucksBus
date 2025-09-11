import React from "react";
import { Box, Container, Typography, Link, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  LocalShipping,
  DirectionsBus,
  Build,
  Engineering,
  ArrowUpward,
} from "@mui/icons-material";

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ backgroundColor: "#313B4C", color: "white", mt: "auto" }}>
      {/* Ana Footer İçeriği */}
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {/* Sol Kısım - Şirket Bilgileri */}
          <Box sx={{ flex: "1 1 250px", minWidth: 220 }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#D34237",
                  fontWeight: "bold",
                  mb: 0.5,
                  fontSize: "1.1rem",
                }}
              >
                Trucksbus
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1.5, fontSize: "0.8rem", lineHeight: 1.5 }}
              >
                Ticari Araçlar alım satım platformu Kamyon,Kamyonet çekici,
                Treyler Romork Otobüs,Midübüs ,Minübüs,aynı platformda
              </Typography>

              {/* Butonlar */}
              <Box sx={{ display: "flex", gap: 0.8, mb: 1.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#D34237",
                    color: "white",
                    fontSize: "0.75rem",
                    py: 0.5,
                    px: 1.5,
                    "&:hover": { backgroundColor: "#B73429" },
                  }}
                >
                  İlan Ver
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    fontSize: "0.75rem",
                    py: 0.5,
                    px: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderColor: "white",
                    },
                  }}
                >
                  Bize Ulaşın
                </Button>
              </Box>

              {/* İstatistikler */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#D34237",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    1200+
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    Doğrulanmış İlan
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#D34237",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    7/24
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    Destek
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* İletişim Bilgileri */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Phone sx={{ fontSize: 14, color: "#D34237" }} />
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  +90 (555) 123 45 67
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Email sx={{ fontSize: 14, color: "#D34237" }} />
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  info@trucksbus.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <LocationOn sx={{ fontSize: 14, color: "#D34237" }} />
                <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                  İstanbul, Türkiye
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Hızlı Linkler */}
          <Box sx={{ flex: "1 1 140px", minWidth: 120 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#D34237",
                fontWeight: "bold",
                mb: 1.5,
                fontSize: "1rem",
              }}
            >
              • Hızlı Linkler
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={RouterLink}
                to="/"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Ana Sayfa
              </Link>
              <Link
                component={RouterLink}
                to="/listings"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Tüm İlanlar
              </Link>
              <Link
                component={RouterLink}
                to="/categories"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Kategoriler
              </Link>
              <Link
                component={RouterLink}
                to="/favorites"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Favorilerim
              </Link>
              <Link
                component={RouterLink}
                to="/my-listings"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                İlanlarım
              </Link>
            </Box>
          </Box>

          {/* Kategoriler */}
          <Box sx={{ flex: "1 1 140px", minWidth: 120 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#D34237",
                fontWeight: "bold",
                mb: 1.5,
                fontSize: "1rem",
              }}
            >
              • Kategoriler
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShipping sx={{ fontSize: 16, color: "#D34237" }} />
                <Link
                  component={RouterLink}
                  to="/categories/kamyon"
                  onClick={scrollToTop}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    "&:hover": { color: "#D34237" },
                  }}
                >
                  Kamyon & Kamyonet
                </Link>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DirectionsBus sx={{ fontSize: 16, color: "#D34237" }} />
                <Link
                  component={RouterLink}
                  to="/categories/otobus"
                  onClick={scrollToTop}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    "&:hover": { color: "#D34237" },
                  }}
                >
                  Otobüs
                </Link>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DirectionsBus sx={{ fontSize: 16, color: "#D34237" }} />
                <Link
                  component={RouterLink}
                  to="/categories/minibus"
                  onClick={scrollToTop}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    "&:hover": { color: "#D34237" },
                  }}
                >
                  Minibüs & Midibüs
                </Link>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShipping sx={{ fontSize: 16, color: "#D34237" }} />
                <Link
                  component={RouterLink}
                  to="/categories/cekici"
                  onClick={scrollToTop}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    "&:hover": { color: "#D34237" },
                  }}
                >
                  Çekici
                </Link>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Build sx={{ fontSize: 16, color: "#D34237" }} />
                <Link
                  component={RouterLink}
                  to="/categories/dorse"
                  onClick={scrollToTop}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    "&:hover": { color: "#D34237" },
                  }}
                >
                  Dorse
                </Link>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Engineering sx={{ fontSize: 16, color: "#D34237" }} />
                <Link
                  component={RouterLink}
                  to="/categories/romork"
                  onClick={scrollToTop}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    "&:hover": { color: "#D34237" },
                  }}
                >
                  Römork
                </Link>
              </Box>
            </Box>
          </Box>

          {/* Gizlilik ve Kullanım */}
          <Box sx={{ flex: "1 1 160px", minWidth: 140 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#D34237",
                fontWeight: "bold",
                mb: 1.5,
                fontSize: "1rem",
              }}
            >
              • Gizlilik ve Kullanım
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={RouterLink}
                to="/privacy-policy"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Gizlilik Politikası
              </Link>
              <Link
                component={RouterLink}
                to="/terms-of-service"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Hizmet Şartları
              </Link>
              <Link
                component={RouterLink}
                to="/kvkk"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                KVKK Bildirimi
              </Link>
              <Link
                component={RouterLink}
                to="/contracts-and-rules"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Sözleşmeler ve Kurallar
              </Link>
              <Link
                component={RouterLink}
                to="/account-agreement"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Hesap Sözleşmesi
              </Link>
              <Link
                component={RouterLink}
                to="/usage-conditions"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Kullanım Koşulları
              </Link>
              <Link
                component={RouterLink}
                to="/personal-data-protection"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Kişisel Verilerin Korunması
              </Link>
              <Link
                component={RouterLink}
                to="/cookie-policy"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Çerez Yönetimi
              </Link>
              <Link
                component={RouterLink}
                to="/help-guide"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Yardım ve İşlem Rehberi
              </Link>
            </Box>
          </Box>

          {/* Kurumsal */}
          <Box sx={{ flex: "1 1 140px", minWidth: 120 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#D34237",
                fontWeight: "bold",
                mb: 1.5,
                fontSize: "1rem",
              }}
            >
              • Kurumsal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={RouterLink}
                to="/about"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Hakkımızda
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                İletişim
              </Link>
              <Link
                component={RouterLink}
                to="/privacy-policy"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Gizlilik Politikası
              </Link>
              <Link
                component={RouterLink}
                to="/terms"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                Kullanım Şartları
              </Link>
              <Link
                component={RouterLink}
                to="/kvkk"
                onClick={scrollToTop}
                sx={{
                  color: "white",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#D34237" },
                }}
              >
                KVKK
              </Link>
            </Box>
          </Box>

          {/* Bizi Takip Edin */}
          <Box sx={{ flex: "1 1 280px", minWidth: 250 }}>
            <Typography
              variant="h6"
              sx={{ color: "#D34237", fontWeight: "bold", mb: 2 }}
            >
              • Bizi Takip Edin
            </Typography>

            {/* Sosyal Medya */}
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <Button
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  backgroundColor: "#4267B2",
                  color: "white",
                  "&:hover": { backgroundColor: "#365899" },
                }}
              >
                <Facebook />
              </Button>
              <Button
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  backgroundColor: "#1DA1F2",
                  color: "white",
                  "&:hover": { backgroundColor: "#0d8bd9" },
                }}
              >
                <Twitter />
              </Button>
              <Button
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  backgroundColor: "#E4405F",
                  color: "white",
                  "&:hover": { backgroundColor: "#d62976" },
                }}
              >
                <Instagram />
              </Button>
              <Button
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  backgroundColor: "#0077B5",
                  color: "white",
                  "&:hover": { backgroundColor: "#005885" },
                }}
              >
                <LinkedIn />
              </Button>
            </Box>

            {/* Newsletter */}
            <Typography variant="body2" sx={{ mb: 2, fontSize: "0.85rem" }}>
              Bültene katıl:
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <input
                type="email"
                placeholder="E-posta adresin"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#D34237",
                  color: "white",
                  px: 2,
                  fontSize: "0.75rem",
                  "&:hover": { backgroundColor: "#B73429" },
                }}
              >
                →
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Alt Kısım */}
      <Box
        sx={{
          borderTop: "1px solid #444",
          py: 2,
          backgroundColor: "#2a3441",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Sol Kısım */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <img
                src="/Trucksbus.png"
                alt="TrucksBus"
                style={{ height: 30 }}
              />
              <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                © 2025 Trucksbus — Türkiye'nin en güvenilir ticari araç
                platformu.
              </Typography>
            </Box>

            {/* Sağ Kısım */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                Tasarım • Performans • Güven
              </Typography>
              <Button
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  backgroundColor: "#D34237",
                  color: "white",
                  borderRadius: "50%",
                  "&:hover": { backgroundColor: "#B73429" },
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ArrowUpward />
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
