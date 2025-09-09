import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

interface SplashScreenProps {
  children: React.ReactNode;
  duration?: number; // milliseconds
  showOnRefresh?: boolean; // Her sayfa yenilendiğinde göster
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  children,
  duration = 3000,
  showOnRefresh = true,
}) => {
  const [showSplash, setShowSplash] = useState(showOnRefresh);

  useEffect(() => {
    if (showOnRefresh) {
      setShowSplash(true);

      // Belirtilen süre sonra splash screen'i kapat
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, showOnRefresh]);

  // Eğer splash screen gösteriliyorsa
  if (showSplash) {
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
