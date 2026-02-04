import React from "react";
import { Box, Typography } from "@mui/material";

interface AdBannerProps {
  variant?: "horizontal" | "vertical";
}

const AdBanner: React.FC<AdBannerProps> = ({ variant = "horizontal" }) => {
  const adItems = [
    {
      icon: "🚛",
      text: "Reklam alanı kiralık - trucksbus.com.tr'de yerinizi alın!",
    },
    {
      icon: "📢",
      text: "Buraya reklam verebilirsiniz - Geniş kitleye ulaşın!",
    },
    {
      icon: "💼",
      text: "İşletmenizi tanıtın - Binlerce potansiyel müşteri!",
    },
    {
      icon: "⭐",
      text: "Premium reklam alanları - iletisim@trucksbus.com.tr",
    },
    {
      icon: "🎯",
      text: "Hedef kitlenize direkt ulaşın - Etkili reklam çözümleri!",
    },
    {
      icon: "🚀",
      text: "İşinizi büyütün - Profesyonel reklam hizmetleri!",
    },
  ];

  if (variant === "vertical") {
    return (
      <Box
        sx={{
          background:
            "linear-gradient(180deg, #D34237 0%, #e85347 50%, #D34237 100%)",
          height: "100%",
          width: "95px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "-2px 0 8px rgba(211, 66, 55, 0.2)",
          borderRadius: "8px",
          "&:hover .ad-scroll-vertical": {
            animationPlayState: "paused",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-100%",
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)",
            animation: "shimmerVertical 3s infinite",
          },
          "@keyframes shimmerVertical": {
            "0%": { top: "-100%" },
            "100%": { top: "100%" },
          },
        }}
      >
        <Box
          className="ad-scroll-vertical"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            animation: "scrollDown 25s linear infinite",
            py: 1,
            "@keyframes scrollDown": {
              "0%": {
                transform: "translateY(0)",
              },
              "100%": {
                transform: "translateY(-100%)",
              },
            },
          }}
        >
          {/* İlanları iki kez göster (sonsuz döngü efekti için) */}
          {[...adItems, ...adItems].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 1.5,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  fontSize: "22px",
                  animation: "bounce 2s infinite",
                  "@keyframes bounce": {
                    "0%, 20%, 50%, 80%, 100%": {
                      transform: "translateY(0)",
                    },
                    "40%": {
                      transform: "translateY(-3px)",
                    },
                    "60%": {
                      transform: "translateY(-1px)",
                    },
                  },
                }}
              >
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: "9px",
                  color: "#fff",
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.2,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                  maxWidth: "90px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Horizontal variant (ana sayfa için)
  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #D34237 0%, #e85347 50%, #D34237 100%)",
        borderBottom: "2px solid #b8342a",
        py: 1.5,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 2px 8px rgba(211, 66, 55, 0.2)",
        "&:hover .ad-scroll-container": {
          animationPlayState: "paused",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          animation: "shimmer 3s infinite",
        },
        "@keyframes shimmer": {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
      }}
    >
      <Box
        className="ad-scroll-container"
        sx={{
          display: "flex",
          gap: 6,
          width: "fit-content",
          animation: "scrollAds 30s linear infinite",
          alignItems: "center",
          "@keyframes scrollAds": {
            "0%": {
              transform: "translateX(100%)",
            },
            "100%": {
              transform: "translateX(-100%)",
            },
          },
        }}
      >
        {adItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: "450px",
              cursor: "pointer",
              "&:hover": {
                transform: "scale(1.02)",
              },
              transition: "transform 0.3s ease",
            }}
          >
            <Box
              sx={{
                fontSize: "20px",
                animation: "bounce 2s infinite",
                "@keyframes bounce": {
                  "0%, 20%, 50%, 80%, 100%": {
                    transform: "translateY(0)",
                  },
                  "40%": {
                    transform: "translateY(-4px)",
                  },
                  "60%": {
                    transform: "translateY(-2px)",
                  },
                },
              }}
            >
              {item.icon}
            </Box>
            <Typography
              sx={{
                fontSize: "15px",
                color: "#fff",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                letterSpacing: "0.3px",
              }}
            >
              {item.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Corner Accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: "20px solid transparent",
          borderBottom: "20px solid rgba(255,255,255,0.1)",
        }}
      />
    </Box>
  );
};

export default AdBanner;
