import React from "react";
import { Box, Typography, keyframes } from "@mui/material";
import { styled } from "@mui/material/styles";

// Yazı fade in animasyonu
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Loading dots animasyonu
const loadingDots = keyframes`
  0%, 20% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  80%, 100% {
    opacity: 0;
  }
`;

const LoadingContainer = styled(Box)({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #d0d0d0 100%)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  overflow: "hidden",
});

const LogoContainer = styled(Box)({
  position: "relative",
  width: "450px",
  height: "220px",
  marginBottom: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const Logo = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))",
});

const LoadingText = styled(Typography)({
  color: "#333333",
  fontWeight: 600,
  fontSize: "2rem",
  marginBottom: "20px",
  animation: `${fadeInUp} 1s ease-out 0.5s both`,
  textAlign: "center",
});

const SubText = styled(Typography)({
  color: "#666666",
  fontSize: "1.1rem",
  animation: `${fadeInUp} 1s ease-out 1s both`,
  textAlign: "center",
  marginBottom: "30px",
});

const LoadingDots = styled(Box)({
  display: "flex",
  gap: "8px",
  "& span": {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#dc004e", // Ana kırmızı renk
    animation: `${loadingDots} 1.5s infinite ease-in-out`,
    "&:nth-of-type(1)": {
      animationDelay: "0s",
    },
    "&:nth-of-type(2)": {
      animationDelay: "0.2s",
    },
    "&:nth-of-type(3)": {
      animationDelay: "0.4s",
    },
  },
});

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "TrucksBus'a Hoş Geldiniz",
  subMessage,
}) => {
  return (
    <LoadingContainer>
      <LogoContainer>
        <Logo
          src="/Trucksbus.png"
          alt="TrucksBus Logo"
          onError={() => {
            console.log("Logo yüklenemedi");
          }}
        />
      </LogoContainer>

      <LoadingText variant="h1">{message}</LoadingText>

      {subMessage && <SubText variant="h6">{subMessage}</SubText>}

      <LoadingDots>
        <span></span>
        <span></span>
        <span></span>
      </LoadingDots>
    </LoadingContainer>
  );
};

export default LoadingScreen;
