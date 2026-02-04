import React, { useState } from "react";
import { Box, Typography, Container } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  VerifiedUser,
  CheckCircle,
  Support,
} from "@mui/icons-material";

const MeetUs: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const infoCards = [
    {
      icon: <VerifiedUser sx={{ fontSize: 28, color: "#dc3545" }} />,
      title: "Güvenli Alım Satım",
    },
    {
      icon: <CheckCircle sx={{ fontSize: 28, color: "#dc3545" }} />,
      title: "Onaylı İlan Sistemi",
    },
    {
      icon: <Support sx={{ fontSize: 28, color: "#dc3545" }} />,
      title: "Profesyonel Destek",
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        background: "linear-gradient(180deg, #F6F6F6 0%, #FFFFFF 100%)",
        py: { xs: 6, md: 8 },
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          {/* Animated Badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.5,
              mb: 2,
              background:
                "linear-gradient(90deg, #dc3545 0%, #ff6b6b 50%, #dc3545 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite linear",
              borderRadius: "20px",
              "@keyframes shimmer": {
                "0%": { backgroundPosition: "100% 0" },
                "100%": { backgroundPosition: "-100% 0" },
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ✨ Bizi Yakından Tanıyın
            </Typography>
          </Box>

          {/* Main Title with Gradient */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "32px", md: "48px" },
              background:
                "linear-gradient(135deg, #1a1a1a 0%, #dc3545 50%, #1a1a1a 100%)",
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "textShimmer 3s ease-in-out infinite",
              mb: 2,
              "@keyframes textShimmer": {
                "0%": { backgroundPosition: "0% center" },
                "50%": { backgroundPosition: "100% center" },
                "100%": { backgroundPosition: "0% center" },
              },
            }}
          >
            Bizimle Tanışın
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontSize: { xs: "15px", md: "20px" },
              color: "#555",
              maxWidth: "650px",
              mx: "auto",
              mb: 4,
              fontWeight: 500,
            }}
          >
            Türkiye'nin ticari araç pazarında{" "}
            <Box
              component="span"
              sx={{
                color: "#dc3545",
                fontWeight: 700,
              }}
            >
              güvenin
            </Box>{" "}
            ve{" "}
            <Box
              component="span"
              sx={{
                color: "#dc3545",
                fontWeight: 700,
              }}
            >
              şeffaflığın
            </Box>{" "}
            adresi
          </Typography>

          {/* Main CTA Button - Enhanced */}
          <Box
            onClick={handleToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleToggle();
              }
            }}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              py: 2.5,
              px: 5,
              background:
                "linear-gradient(135deg, #dc3545 0%, #ff4757 50%, #c82333 100%)",
              backgroundSize: "200% 200%",
              animation: "buttonGradient 3s ease infinite",
              color: "white",
              borderRadius: "50px",
              cursor: "pointer",
              boxShadow:
                "0 8px 32px rgba(220, 53, 69, 0.4), 0 0 0 0 rgba(220, 53, 69, 0.5)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
              "@keyframes buttonGradient": {
                "0%": { backgroundPosition: "0% 50%" },
                "50%": { backgroundPosition: "100% 50%" },
                "100%": { backgroundPosition: "0% 50%" },
              },
              "@keyframes pulse": {
                "0%": {
                  boxShadow:
                    "0 8px 32px rgba(220, 53, 69, 0.4), 0 0 0 0 rgba(220, 53, 69, 0.5)",
                },
                "70%": {
                  boxShadow:
                    "0 8px 32px rgba(220, 53, 69, 0.4), 0 0 0 15px rgba(220, 53, 69, 0)",
                },
                "100%": {
                  boxShadow:
                    "0 8px 32px rgba(220, 53, 69, 0.4), 0 0 0 0 rgba(220, 53, 69, 0)",
                },
              },
              animationName: "buttonGradient, pulse",
              animationDuration: "3s, 2s",
              animationIterationCount: "infinite, infinite",
              animationTimingFunction: "ease, ease-out",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                transition: "left 0.5s",
              },
              "&:hover": {
                transform: "translateY(-4px) scale(1.02)",
                boxShadow: "0 12px 40px rgba(220, 53, 69, 0.5)",
                "&::before": {
                  left: "100%",
                },
              },
              "&:focus": {
                outline: "3px solid rgba(220, 53, 69, 0.5)",
                outlineOffset: "3px",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "18px", md: "22px" },
                fontWeight: 700,
                letterSpacing: "0.5px",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              🚀 Hikayemizi Keşfedin
            </Typography>
            {isExpanded ? (
              <KeyboardArrowUp
                sx={{ fontSize: 28, animation: "bounce 1s infinite" }}
              />
            ) : (
              <KeyboardArrowDown
                sx={{
                  fontSize: 28,
                  animation: "bounceDown 1.5s infinite",
                  "@keyframes bounceDown": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(5px)" },
                  },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Expandable Content */}
        <Box
          sx={{
            maxHeight: isExpanded ? "2000px" : "0px",
            opacity: isExpanded ? 1 : 0,
            overflow: "hidden",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isExpanded ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              mt: 4,
            }}
          >
            {/* Left Card - About Company */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
                p: { xs: 3, md: 4 },
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {/* Company Logo */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Box
                  component="img"
                  src="/OELogo.jpeg"
                  alt="TrucksBus Logo"
                  sx={{
                    width: { xs: 120, md: 150 },
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "8px",
                    transition: "transform 0.4s ease",
                    animation: isExpanded ? "zoomIn 0.6s ease-out" : "none",
                    "@keyframes zoomIn": {
                      "0%": {
                        transform: "scale(0.8)",
                        opacity: 0,
                      },
                      "100%": {
                        transform: "scale(1)",
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* About Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "20px", md: "24px" },
                  color: "#1a1a1a",
                  mb: 2,
                  textAlign: "center",
                }}
              >
                NG Hakkında
              </Typography>

              {/* About Text */}
              <Typography
                sx={{
                  fontSize: { xs: "14px", md: "15px" },
                  color: "#555",
                  lineHeight: 1.8,
                  textAlign: "center",
                  mb: 4,
                }}
              >
                TrucksBus, ticari araç alım satımında güven, şeffaflık ve
                kaliteyi merkezine alan yeni nesil dijital pazaryeridir. Kamyon,
                tır, otobüs, çekici ve özel amaçlı araçları tek platformda
                buluşturur. Amacımız, alıcı ile satıcıyı güvenli ve hızlı
                şekilde bir araya getirmektir.
              </Typography>

              {/* Info Cards */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                {infoCards.map((card, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      p: 2,
                      backgroundColor: "#fafafa",
                      borderRadius: "12px",
                      border: "1px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#fff5f5",
                        borderColor: "#dc3545",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {card.icon}
                    <Typography
                      sx={{
                        fontSize: { xs: "12px", md: "13px" },
                        fontWeight: 600,
                        color: "#333",
                        textAlign: "center",
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right Card - Founder */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
                p: { xs: 3, md: 4 },
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {/* Founder Photo */}
              <Box
                sx={{
                  width: { xs: 140, md: 180 },
                  height: { xs: 140, md: 180 },
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  mb: 3,
                  border: "4px solid #fff",
                  outline: "2px solid #dc3545",
                }}
              >
                <Box
                  component="img"
                  src="/nurettin-gokce.jpeg"
                  alt="Kurucu & Genel Müdür"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    animation: isExpanded
                      ? "zoomInPhoto 0.7s ease-out"
                      : "none",
                    "@keyframes zoomInPhoto": {
                      "0%": {
                        transform: "scale(1.2)",
                        opacity: 0,
                      },
                      "100%": {
                        transform: "scale(1)",
                        opacity: 1,
                      },
                    },
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
              </Box>

              {/* Founder Name */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "20px", md: "24px" },
                  color: "#1a1a1a",
                  mb: 0.5,
                }}
              >
                Nurettin Gökçe
              </Typography>

              {/* Founder Title */}
              <Typography
                sx={{
                  fontSize: { xs: "14px", md: "15px" },
                  color: "#dc3545",
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Kurucu & Genel Müdür
              </Typography>

              {/* Vision Text */}
              <Box
                sx={{
                  position: "relative",
                  p: 3,
                  backgroundColor: "#fafafa",
                  borderRadius: "12px",
                  border: "1px solid #f0f0f0",
                }}
              >
                {/* Quote Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-10px",
                    left: "20px",
                    fontSize: "48px",
                    color: "#dc3545",
                    opacity: 0.3,
                    lineHeight: 1,
                    fontFamily: "Georgia, serif",
                  }}
                >
                  "
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: "14px", md: "15px" },
                    color: "#555",
                    lineHeight: 1.8,
                    textAlign: "center",
                    fontStyle: "italic",
                    pt: 2,
                  }}
                >
                  Ticari araç sektöründe dijitalleşmenin öncüsü olmayı
                  hedefliyoruz. Her ilan, her kullanıcı ve her işlem bizim için
                  bir sorumluluktur.
                </Typography>
              </Box>

              {/* Additional Vision Points */}
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    backgroundColor: "#fff5f5",
                    borderRadius: "8px",
                  }}
                >
                  <CheckCircle sx={{ fontSize: 18, color: "#dc3545" }} />
                  <Typography sx={{ fontSize: "13px", color: "#333" }}>
                    Sektörde 30+ yıllık deneyim
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    backgroundColor: "#fff5f5",
                    borderRadius: "8px",
                  }}
                >
                  <CheckCircle sx={{ fontSize: 18, color: "#dc3545" }} />
                  <Typography sx={{ fontSize: "13px", color: "#333" }}>
                    Müşteri memnuniyeti odaklı yaklaşım
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MeetUs;
