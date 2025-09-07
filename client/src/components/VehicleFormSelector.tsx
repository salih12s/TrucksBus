import React from "react";
import { useParams } from "react-router-dom";
import CreateMinibusAdForm from "./ads/CreateMinibusAdForm";
import CekiciAdForm from "./forms/CekiciAdForm";
import KamyonAdForm from "./forms/KamyonAdForm";
import OtobusAdForm from "./forms/OtobusAdForm";

// Dorse Forms
import HafriyatTipiForm from "./forms/Damperli/HafriyatTipiForm";
import HavuzHardoxTipiForm from "./forms/Damperli/HavuzHardoxTipiForm";
import KapakliTipForm from "./forms/Damperli/KapakliTipForm";
import KayaTipiForm from "./forms/Damperli/KayaTipiForm";

const VehicleFormSelector: React.FC = () => {
  const { categorySlug, variantSlug, modelSlug } = useParams<{
    categorySlug: string;
    variantSlug?: string;
    modelSlug?: string;
  }>();

  // Debug için console'a yazdır
  console.log("🔍 VehicleFormSelector DEBUG:");
  console.log("  categorySlug:", categorySlug);
  console.log("  variantSlug:", variantSlug);
  console.log("  modelSlug:", modelSlug);
  console.log("  URL:", window.location.pathname);

  // Dorse kategorisi için özel mantık
  if (categorySlug === "dorse" || categorySlug === "damperli-dorse") {
    console.log("🎯 DORSE KATEGORİSİ ALGILANDI!");
    console.log("  Checking variant:", variantSlug);
    console.log("  Checking model:", modelSlug);
    // Eğer variant var ise, variant'a göre seç
    if (variantSlug) {
      switch (variantSlug) {
        case "hafriyat-tipi":
          console.log("✅ Hafriyat Tipi Dorse formu seçildi (variant)");
          return <HafriyatTipiForm />;
        case "havuz-hardox-tipi":
          console.log("✅ Havuz Hardox Tipi Dorse formu seçildi (variant)");
          return <HavuzHardoxTipiForm />;
        case "kapakli-tip":
          console.log("✅ Kapaklı Tip Dorse formu seçildi (variant)");
          return <KapakliTipForm />;
        case "kaya-tipi":
          console.log("✅ Kaya Tipi Dorse formu seçildi (variant)");
          return <KayaTipiForm />;
        default:
          console.log(
            "⚠️ Bilinmeyen dorse variant:",
            variantSlug,
            "- Hafriyat Tipi açılıyor"
          );
          return <HafriyatTipiForm />;
      }
    }

    // Eğer variant yok ise, model slug'ına göre seç
    if (modelSlug) {
      console.log("📍 Model slug kontrolü:", modelSlug);

      // Tam slug eşleşmesi önce
      switch (modelSlug) {
        case "hafriyat-tip":
          console.log("✅ Hafriyat Tipi Dorse formu seçildi (tam slug)");
          return <HafriyatTipiForm />;
        case "havuz-hardox-tip":
        case "havuzhardox-tip": // Veritabanındaki gerçek slug
          console.log("✅ Havuz Hardox Tipi Dorse formu seçildi (tam slug)");
          return <HavuzHardoxTipiForm />;
        case "kapakli-tip":
          console.log("✅ Kapaklı Tip Dorse formu seçildi (tam slug)");
          return <KapakliTipForm />;
        case "kaya-tip":
          console.log("✅ Kaya Tipi Dorse formu seçildi (tam slug)");
          return <KayaTipiForm />;
      }

      // Eğer tam eşleşme yoksa, içerik kontrolü (fallback)
      const modelLower = modelSlug.toLowerCase();
      console.log("  🔎 Model slug lowercase:", modelLower);

      if (modelLower.includes("hafriyat") || modelLower.includes("kazı")) {
        console.log("✅ Hafriyat Tipi Dorse formu seçildi (içerik)");
        return <HafriyatTipiForm />;
      } else if (
        modelLower.includes("havuz") ||
        modelLower.includes("hardox")
      ) {
        console.log("✅ Havuz Hardox Tipi Dorse formu seçildi (içerik)");
        return <HavuzHardoxTipiForm />;
      } else if (
        modelLower.includes("kapaklı") ||
        modelLower.includes("kapali")
      ) {
        console.log("✅ Kapaklı Tip Dorse formu seçildi (içerik)");
        return <KapakliTipForm />;
      } else if (modelLower.includes("kaya") || modelLower.includes("taş")) {
        console.log("✅ Kaya Tipi Dorse formu seçildi (içerik)");
        return <KayaTipiForm />;
      } else {
        console.log("❌ HİÇBİR DORSE FORMU EŞLEŞMEDİ! Model:", modelSlug);
        console.log("  Fallback olarak Hafriyat Tipi açılacak");
      }
    }

    // Fallback - varsayılan olarak Hafriyat Tipi
    console.log("⚠️ Dorse için varsayılan form açılıyor - Hafriyat Tipi");
    return <HafriyatTipiForm />;
  }

  // Kategori slug'ına göre doğru formu seç - GERÇEK SLUG'LARA GÖRE
  switch (categorySlug) {
    // Minibüs & Midibüs
    case "minibus-midibus":
      console.log("✅ Minibüs formu seçildi");
      return <CreateMinibusAdForm />;

    // Çekici
    case "cekici":
      console.log("✅ Çekici formu seçildi");
      return <CekiciAdForm />;

    // Kamyon & Kamyonet
    case "kamyon-kamyonet":
      console.log("✅ Kamyon formu seçildi");
      return <KamyonAdForm />;

    // Otobüs
    case "otobus":
      console.log("✅ Otobüs formu seçildi");
      return <OtobusAdForm />;

    // Diğer kategoriler için varsayılan form (şimdilik minibüs)
    case "karoser-ust-yapi":
    case "oto-kurtarici-tasiyici":
    case "romork":
      console.log(
        "⚠️ Bu kategori için henüz özel form yok:",
        categorySlug,
        "- Minibüs formu açılıyor"
      );
      return <CreateMinibusAdForm />;

    default:
      console.log(
        "⚠️ Bilinmeyen kategori slug:",
        categorySlug,
        "- Minibüs formu açılıyor (fallback)"
      );
      return <CreateMinibusAdForm />;
  }
};

export default VehicleFormSelector;
