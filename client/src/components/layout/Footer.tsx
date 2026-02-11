import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Container, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Email } from "@mui/icons-material";
import FeedbackModal from "../modals/FeedbackModal";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { settings } = useSiteSettings();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        backgroundColor: settings.footerBgColor || "#E8E8E8",
        color: "#666",
        mt: "auto",
      }}
    >
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
              {t("footer.corporate")}
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
                onClick={handleLinkClick}
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "13px",
                  "&:hover": { color: "#333" },
                  textAlign: "center",
                }}
              >
                {t("footer.aboutUs")}
              </Link>
              <Link
                component={RouterLink}
                to="/sustainability"
                onClick={handleLinkClick}
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                {t("footer.sustainability")}
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                onClick={handleLinkClick}
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                {t("footer.contact")}
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
              {t("footer.privacyAndUsage")}
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
                to="/kullanim-kosullari"
                onClick={handleLinkClick}
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                {t("footer.termsOfUse")}
              </Link>
              <Link
                component={RouterLink}
                to="/kisisel-verilerin-korunmasi"
                onClick={handleLinkClick}
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                {t("footer.dataProtection")}
              </Link>
              <Link
                component={RouterLink}
                to="/cerez-yonetimi"
                onClick={handleLinkClick}
                sx={{
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "14px",
                  "&:hover": { color: "#333" },
                }}
              >
                {t("footer.cookieManagement")}
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
              {t("footer.followUs")}
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
      <Box sx={{ backgroundColor: "#E8E8E8", py: 1.5 }}>
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
                <Email sx={{ color: "#d63384", fontSize: 18 }} />
                <Box>
                  <Typography
                    sx={{
                      color: "#d63384",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {t("footer.helpCenter")}
                  </Typography>
                  <Typography sx={{ color: "#333", fontSize: "12px" }}>
                    {settings.contactEmail || "info@trucksbus.com.tr"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Yasal Metin */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #dee2e6" }}>
            {/* Geri Bildirim Bölümü - Küçük */}
            <Box
              sx={{
                mb: 2,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#666",
                  fontSize: "12px",
                  mb: 0.5,
                }}
              >
                Görüşlerin bizim için önemli! Hata, öneri ya da fikirlerini{" "}
                <Link
                  component="button"
                  onClick={() => setFeedbackModalOpen(true)}
                  sx={{
                    color: "#1976d2",
                    textDecoration: "underline",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#1565c0",
                    },
                  }}
                >
                  buradan paylaş
                </Link>
                .
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#666",
                fontSize: "11px",
                lineHeight: 1.4,
                mb: 1.5,
                textAlign: "center",
              }}
            >
              {t("footer.allContentBelongsToUsers")}
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
                {t("footer.copyright")}
              </Typography>
              <Typography sx={{ color: "#666", fontSize: "11px" }}>
                {t("footer.registeredWithETBIS")}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </Box>
  );
};

export default Footer;
