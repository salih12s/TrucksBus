import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Türkçe çeviriler
import trTranslations from "./locales/tr.json";
// İngilizce çeviriler
import enTranslations from "./locales/en.json";

i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algıla
  .use(initReactI18next) // React i18next'e bağla
  .init({
    resources: {
      tr: {
        translation: trTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    fallbackLng: "tr", // Varsayılan dil Türkçe
    lng: "tr", // Başlangıç dili Türkçe
    debug: true, // Debug mode açık
    interpolation: {
      escapeValue: false, // React zaten XSS koruması yapıyor
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

console.log("✅ i18n initialized:", i18n.language);

export default i18n;
