import React, { useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';

interface SplashScreenProps {
  children: React.ReactNode;
  duration?: number; // milliseconds
  showOnFirstVisit?: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  children,
  duration = 3000,
  showOnFirstVisit = true
}) => {
  const [showSplash, setShowSplash] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // İlk ziyaret kontrolü
    const hasVisited = localStorage.getItem('trucksbus_visited');
    
    if (!hasVisited && showOnFirstVisit) {
      setIsFirstVisit(true);
      setShowSplash(true);
      localStorage.setItem('trucksbus_visited', 'true');
      
      // Belirtilen süre sonra splash screen'i kapat
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, showOnFirstVisit]);

  // Eğer splash screen gösteriliyorsa
  if (showSplash && isFirstVisit) {
    return (
      <LoadingScreen 
        message="TrucksBus'a Hoş Geldiniz!"
        subMessage="Türkiye'nin en büyük ticari araç platformu..."
      />
    );
  }

  // Normal içeriği göster
  return <>{children}</>;
};

export default SplashScreen;
