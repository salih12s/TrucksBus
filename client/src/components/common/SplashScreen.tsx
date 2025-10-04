import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
    return <LoadingScreen message={t("common.welcome")} />;
  }

  // Normal içeriği göster
  return <>{children}</>;
};

export default SplashScreen;
