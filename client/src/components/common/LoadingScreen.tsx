import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

// Tır animasyonu keyframes - Daha smooth hareket
const truckMove = keyframes`
  0% {
    transform: translateX(-100%) scale(0.8);
    opacity: 0.7;
  }
  20% {
    opacity: 1;
    transform: translateX(-20%) scale(1);
  }
  50% {
    transform: translateX(30vw) scale(1);
  }
  80% {
    transform: translateX(80vw) scale(1);
  }
  100% {
    transform: translateX(120vw) scale(0.8);
    opacity: 0.7;
  }
`;

// Tekerlek dönme animasyonu
const wheelRotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

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
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  overflow: 'hidden',
});

const TruckContainer = styled(Box)({
  position: 'relative',
  width: '200px',
  height: '100px',
  animation: `${truckMove} 4s ease-in-out infinite`,
  marginBottom: '60px',
});

const TruckSVG = styled('svg')({
  width: '100%',
  height: '100%',
  '& .wheel': {
    transformOrigin: 'center',
    animation: `${wheelRotate} 0.5s linear infinite`,
  },
  '& .truck-body': {
    fill: '#e53935', // Kırmızı kabin
  },
  '& .truck-cargo': {
    fill: '#1976d2', // Mavi kargo alanı
  },
  '& .wheel-tire': {
    fill: '#212121', // Siyah lastik
  },
  '& .wheel-rim': {
    fill: '#9e9e9e', // Gri jant
  },
});

const LoadingText = styled(Typography)({
  color: 'white',
  fontWeight: 600,
  fontSize: '2rem',
  marginBottom: '20px',
  animation: `${fadeInUp} 1s ease-out 0.5s both`,
  textAlign: 'center',
});

const SubText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '1.1rem',
  animation: `${fadeInUp} 1s ease-out 1s both`,
  textAlign: 'center',
  marginBottom: '30px',
});

const LoadingDots = styled(Box)({
  display: 'flex',
  gap: '8px',
  '& span': {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'white',
    animation: `${loadingDots} 1.5s infinite ease-in-out`,
    '&:nth-of-type(1)': {
      animationDelay: '0s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
});

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "TrucksBus'a Hoş Geldiniz",
  subMessage = "En kaliteli ticari araç ilanları yükleniyor..."
}) => {
  return (
    <LoadingContainer>
      <TruckContainer>
        <TruckSVG viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          {/* Tır gövdesi */}
          <rect 
            className="truck-cargo" 
            x="10" 
            y="30" 
            width="80" 
            height="35" 
            rx="5" 
          />
          
          {/* Tır kabini */}
          <rect 
            className="truck-body" 
            x="90" 
            y="35" 
            width="40" 
            height="30" 
            rx="3" 
          />
          
          {/* Ön cam */}
          <rect 
            x="125" 
            y="40" 
            width="8" 
            height="20" 
            fill="#87ceeb" 
            rx="2" 
          />
          
          {/* Arka tekerlek */}
          <circle 
            className="wheel wheel-tire" 
            cx="30" 
            cy="75" 
            r="12" 
          />
          <circle 
            className="wheel wheel-rim" 
            cx="30" 
            cy="75" 
            r="8" 
          />
          
          {/* Orta tekerlek */}
          <circle 
            className="wheel wheel-tire" 
            cx="60" 
            cy="75" 
            r="12" 
          />
          <circle 
            className="wheel wheel-rim" 
            cx="60" 
            cy="75" 
            r="8" 
          />
          
          {/* Ön tekerlek */}
          <circle 
            className="wheel wheel-tire" 
            cx="110" 
            cy="75" 
            r="12" 
          />
          <circle 
            className="wheel wheel-rim" 
            cx="110" 
            cy="75" 
            r="8" 
          />
          
          {/* Farlar */}
          <circle cx="140" cy="45" r="3" fill="#ffeb3b" />
          <circle cx="140" cy="55" r="3" fill="#ffeb3b" />
          
          {/* Detaylar */}
          <rect x="15" y="35" width="70" height="2" fill="#1565c0" />
          <rect x="15" y="60" width="70" height="2" fill="#1565c0" />
        </TruckSVG>
      </TruckContainer>

      <LoadingText variant="h1">
        {message}
      </LoadingText>
      
      <SubText variant="h6">
        {subMessage}
      </SubText>

      <LoadingDots>
        <span></span>
        <span></span>
        <span></span>
      </LoadingDots>
    </LoadingContainer>
  );
};

export default LoadingScreen;
