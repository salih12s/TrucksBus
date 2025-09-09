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
  return (
    <Box sx={{ backgroundColor: "#313B4C", color: "white", mt: "auto" }}>
      {/* Ana Footer İçeriği */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {/* Sol Kısım - Şirket Bilgileri */}
          <Box sx={{ flex: "1 1 300px", minWidth: 280 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: "#D34237", fontWeight: "bold", mb: 1 }}
              >
                Trucksbus
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 2, fontSize: "0.85rem", lineHeight: 1.6 }}
              >
                Ticari Araçlar alım satım platformu Kamyon,Kamyonet çekici,
                Treyler Romork Otobüs,Midübüs ,Minübüs,aynı platformda
              </Typography>

              {/* Butonlar */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#D34237", fontWeight: "bold" }}
                  >
                    1200+
                  </Typography>
                  <Typography variant="caption">Doğrulanmış İlan</Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#D34237", fontWeight: "bold" }}
                  >
                    7/24
                  </Typography>
                  <Typography variant="caption">Destek</Typography>
                </Box>
              </Box>
            </Box>

            {/* İletişim Bilgileri */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ fontSize: 16, color: "#D34237" }} />
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  +90 (555) 123 45 67
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ fontSize: 16, color: "#D34237" }} />
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  info@trucksbus.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: "#D34237" }} />
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  İstanbul, Türkiye
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Hızlı Linkler */}
          <Box sx={{ flex: "1 1 200px", minWidth: 160 }}>
            <Typography
              variant="h6"
              sx={{ color: "#D34237", fontWeight: "bold", mb: 2 }}
            >
              • Hızlı Linkler
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                href="#"
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
                href="#"
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
                href="#"
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
                href="#"
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
                href="#"
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
          <Box sx={{ flex: "1 1 200px", minWidth: 160 }}>
            <Typography
              variant="h6"
              sx={{ color: "#D34237", fontWeight: "bold", mb: 2 }}
            >
              • Kategoriler
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocalShipping sx={{ fontSize: 16, color: "#D34237" }} />
                <Link
                  href="#"
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
                  href="#"
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
                  href="#"
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
                  href="#"
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
                  href="#"
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
                  href="#"
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

          {/* Kurumsal */}
          <Box sx={{ flex: "1 1 200px", minWidth: 160 }}>
            <Typography
              variant="h6"
              sx={{ color: "#D34237", fontWeight: "bold", mb: 2 }}
            >
              • Kurumsal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={RouterLink}
                to="/about"
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
                href="#"
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
                href="#"
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
                href="#"
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
