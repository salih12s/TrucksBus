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

// KaroserUstYapi Forms - Damperli
import KaroserKayaTipiForm from "./forms/KaroserUstyapi/Damperli/KayaTipiForm";
import KaroserHavuzHardoxTipiForm from "./forms/KaroserUstyapi/Damperli/HavuzHardoxTipiForm";
import KaroserKapakliTipForm from "./forms/KaroserUstyapi/Damperli/KapakliTipForm";
import KaroserAhsapKasaForm from "./forms/KaroserUstyapi/Damperli/AhsapKasaForm";

// KaroserUstYapi Forms - SabitKabin
import AcikKasaForm from "./forms/KaroserUstyapi/SabitKabin/AcikKasaForm";
import KapaliKasaForm from "./forms/KaroserUstyapi/SabitKabin/KapaliKasaForm";
import OzelKasaForm from "./forms/KaroserUstyapi/SabitKabin/OzelKasaForm";

// Römork Forms
import KamyonRomorkForm from "./forms/KamyonRomorkForm";

// Tanker Form
import TankerForm from "./forms/Tanker/TankerForm";

// Silobas Form
import SilobasForm from "./forms/Silobas/SilobasForm";

// Tekstil Form
import TekstilForm from "./forms/Tekstil/TekstilForm";

// Lowbed Forms
import HavuzluForm from "./forms/Lowbed/HavuzluForm";
import OndekirmalıForm from "./forms/Lowbed/OndekirmalıForm";

// Kuruyük Forms
import KapakliForm from "./forms/Kuruyuk/KapakliForm";
import KapakliKayaTipiForm from "./forms/Kuruyuk/KapakliKayaTipiForm";
import KapaksızPlatformForm from "./forms/Kuruyuk/KapaksızPlatformForm";

// Oto Kurtarıcı ve Taşıyıcı Forms
import TekliAracForm from "./forms/OtoKurtariciTasiyici/TekliAracForm";
import CokluAracForm from "./forms/OtoKurtariciTasiyici/CokluAracForm";

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
        case "damperli-damperli-hafriyat-tip":
          console.log("✅ Hafriyat Tipi Dorse formu seçildi (variant)");
          return <HafriyatTipiForm />;
        case "havuz-hardox-tipi":
        case "damperli-damperli-havuz-hardox-tip":
          console.log("✅ Havuz Hardox Tipi Dorse formu seçildi (variant)");
          return <HavuzHardoxTipiForm />;
        case "kapakli-tip":
        case "damperli-damperli-kapakli-tip":
          console.log("✅ Kapaklı Tip Dorse formu seçildi (variant)");
          return <KapakliTipForm />;
        case "kaya-tipi":
        case "damperli-damperli-kaya-tip":
          console.log("✅ Kaya Tipi Dorse formu seçildi (variant)");
          return <KayaTipiForm />;
        case "tanker":
        case "tanker-tanker":
        case "tanker-tanker-tanker":
          console.log("✅ Tanker Dorse formu seçildi (variant)");
          return <TankerForm />;
        case "silobas":
        case "silobas-silobas":
        case "silobas-silobas-silobas":
          console.log("✅ Silobas Dorse formu seçildi (variant)");
          return <SilobasForm />;
        case "tekstil":
        case "tekstil-tekstil":
        case "tekstil-tekstil-tekstil":
          console.log("✅ Tekstil Dorse formu seçildi (variant)");
          return <TekstilForm />;
        case "lowbed":
          console.log(
            "✅ Lowbed variant algılandı, model kontrol ediliyor:",
            modelSlug
          );
          // Lowbed markası altında model kontrolü
          if (modelSlug === "havuzlu") {
            console.log("✅ Havuzlu Lowbed Dorse formu seçildi");
            return <HavuzluForm />;
          } else if (
            modelSlug === "ondekirmalı" ||
            modelSlug === "onde-kirmalı" ||
            modelSlug === "onden-kirmali"
          ) {
            console.log("✅ Öndekirmalı Lowbed Dorse formu seçildi");
            return <OndekirmalıForm />;
          } else {
            console.log(
              "⚠️ Bilinmeyen Lowbed model:",
              modelSlug,
              "- Havuzlu açılıyor"
            );
            return <HavuzluForm />;
          }
        case "lowbed-lowbed-havuzlu":
        case "havuzlu":
          console.log("✅ Havuzlu Lowbed Dorse formu seçildi (direct variant)");
          return <HavuzluForm />;
        case "lowbed-lowbed-ondekirmalı":
        case "lowbed-lowbed-onde-kirmalı":
        case "lowbed-lowbed-onden-kirmali":
        case "ondekirmalı":
        case "onde-kirmalı":
        case "onden-kirmali":
          console.log(
            "✅ Öndekirmalı Lowbed Dorse formu seçildi (direct variant)"
          );
          return <OndekirmalıForm />;
        case "kuruyuk":
        case "kapakli":
        case "kapaklı":
          console.log("✅ Kapaklı Kuruyük Dorse formu seçildi (variant)");
          return <KapakliForm />;
        case "kapakli-kaya-tipi":
        case "kapaklı-kaya-tipi":
          console.log(
            "✅ Kapaklı Kaya Tipi Kuruyük Dorse formu seçildi (variant)"
          );
          return <KapakliKayaTipiForm />;
        case "kapaksiz-platform":
        case "kapaksız-platform":
          console.log(
            "✅ Kapaksız Platform Kuruyük Dorse formu seçildi (variant)"
          );
          return <KapaksızPlatformForm />;
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
        case "tanker":
        case "tanker-tanker":
        case "tanker-tanker-tanker":
          console.log("✅ Tanker Dorse formu seçildi (tam slug)");
          return <TankerForm />;
        case "silobas":
        case "silobas-silobas":
        case "silobas-silobas-silobas":
          console.log("✅ Silobas Dorse formu seçildi (tam slug)");
          return <SilobasForm />;
        case "tekstil":
        case "tekstil-tekstil":
        case "tekstil-tekstil-tekstil":
          console.log("✅ Tekstil Dorse formu seçildi (tam slug)");
          return <TekstilForm />;
        case "lowbed":
        case "havuzlu":
          console.log("✅ Havuzlu Lowbed Dorse formu seçildi (tam slug)");
          return <HavuzluForm />;
        case "ondekirmalı":
        case "onde-kirmalı":
          console.log("✅ Öndekirmalı Lowbed Dorse formu seçildi (tam slug)");
          return <OndekirmalıForm />;
        case "kuruyuk":
        case "kapakli":
        case "kapaklı":
          console.log("✅ Kapaklı Kuruyük Dorse formu seçildi (tam slug)");
          return <KapakliForm />;
        case "kapakli-kaya-tipi":
        case "kapaklı-kaya-tipi":
          console.log(
            "✅ Kapaklı Kaya Tipi Kuruyük Dorse formu seçildi (tam slug)"
          );
          return <KapakliKayaTipiForm />;
        case "kapaksiz-platform":
        case "kapaksız-platform":
          console.log(
            "✅ Kapaksız Platform Kuruyük Dorse formu seçildi (tam slug)"
          );
          return <KapaksızPlatformForm />;
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
      } else if (modelLower.includes("tanker") || modelLower.includes("tank")) {
        console.log("✅ Tanker Dorse formu seçildi (içerik)");
        return <TankerForm />;
      } else if (
        modelLower.includes("silobas") ||
        modelLower.includes("silo")
      ) {
        console.log("✅ Silobas Dorse formu seçildi (içerik)");
        return <SilobasForm />;
      } else if (
        modelLower.includes("tekstil") ||
        modelLower.includes("textile")
      ) {
        console.log("✅ Tekstil Dorse formu seçildi (içerik)");
        return <TekstilForm />;
      } else if (
        modelLower.includes("lowbed") ||
        modelLower.includes("havuzlu")
      ) {
        console.log("✅ Havuzlu Lowbed Dorse formu seçildi (içerik)");
        return <HavuzluForm />;
      } else if (
        modelLower.includes("kırmalı") ||
        modelLower.includes("kirmalı") ||
        modelLower.includes("onde")
      ) {
        console.log("✅ Öndekirmalı Lowbed Dorse formu seçildi (içerik)");
        return <OndekirmalıForm />;
      } else if (
        modelLower.includes("kuruyuk") ||
        (modelLower.includes("platform") && modelLower.includes("kapaksız"))
      ) {
        console.log(
          "✅ Kapaksız Platform Kuruyük Dorse formu seçildi (içerik)"
        );
        return <KapaksızPlatformForm />;
      } else if (modelLower.includes("platform")) {
        console.log("✅ Kapaklı Kuruyük Dorse formu seçildi (içerik)");
        return <KapakliForm />;
      } else {
        console.log("❌ HİÇBİR DORSE FORMU EŞLEŞMEDİ! Model:", modelSlug);
        console.log("  Fallback olarak Hafriyat Tipi açılacak");
      }
    }

    // Fallback - varsayılan olarak Hafriyat Tipi
    console.log("⚠️ Dorse için varsayılan form açılıyor - Hafriyat Tipi");
    return <HafriyatTipiForm />;
  }

  // KaroserUstYapi kategorisi için özel mantık
  if (categorySlug === "karoser-ust-yapi") {
    console.log("🎯 KAROSER ÜST YAPI KATEGORİSİ ALGILANDI!");
    console.log("  Checking variant:", variantSlug);
    console.log("  Checking model:", modelSlug);

    // Eğer variant var ise, variant'a göre seç
    if (variantSlug) {
      switch (variantSlug) {
        case "kaya-tipi":
          console.log("✅ Karoser Kaya Tipi formu seçildi (variant)");
          return <KaroserKayaTipiForm />;
        case "havuz-hardox-tipi":
          console.log("✅ Karoser Havuz Hardox Tipi formu seçildi (variant)");
          return <KaroserHavuzHardoxTipiForm />;
        case "kapakli-tip":
          console.log("✅ Karoser Kapaklı Tip formu seçildi (variant)");
          return <KaroserKapakliTipForm />;
        case "ahsap-kasa":
          console.log("✅ Karoser Ahşap Kasa formu seçildi (variant)");
          return <KaroserAhsapKasaForm />;
        case "acik-kasa":
          console.log("✅ Açık Kasa formu seçildi (variant)");
          return <AcikKasaForm />;
        case "kapali-kasa":
          console.log("✅ Kapalı Kasa formu seçildi (variant)");
          return <KapaliKasaForm />;
        case "ozel-kasa":
          console.log("✅ Özel Kasa formu seçildi (variant)");
          return <OzelKasaForm />;
        default:
          console.log(
            "⚠️ Bilinmeyen karoser variant:",
            variantSlug,
            "- Kaya Tipi açılıyor"
          );
          return <KaroserKayaTipiForm />;
      }
    }

    // Eğer variant yok ise, model slug'ına göre seç
    if (modelSlug) {
      console.log("📍 Karoser Model slug kontrolü:", modelSlug);

      // Tam slug eşleşmesi önce
      switch (modelSlug) {
        case "kaya-tipi":
          console.log("✅ Karoser Kaya Tipi formu seçildi (tam slug)");
          return <KaroserKayaTipiForm />;
        case "havuz-hardox-tipi":
          console.log("✅ Karoser Havuz Hardox Tipi formu seçildi (tam slug)");
          return <KaroserHavuzHardoxTipiForm />;
        case "kapakli-tip":
          console.log("✅ Karoser Kapaklı Tip formu seçildi (tam slug)");
          return <KaroserKapakliTipForm />;
        case "ahsap-kasa":
          console.log("✅ Karoser Ahşap Kasa formu seçildi (tam slug)");
          return <KaroserAhsapKasaForm />;
        case "acik-kasa":
          console.log("✅ Açık Kasa formu seçildi (tam slug)");
          return <AcikKasaForm />;
        case "kapali-kasa":
          console.log("✅ Kapalı Kasa formu seçildi (tam slug)");
          return <KapaliKasaForm />;
        case "ozel-kasa":
          console.log("✅ Özel Kasa formu seçildi (tam slug)");
          return <OzelKasaForm />;
      }

      // Eğer tam eşleşme yoksa, içerik kontrolü (fallback)
      const modelLower = modelSlug.toLowerCase();
      console.log("  🔎 Karoser Model slug lowercase:", modelLower);

      if (modelLower.includes("kaya") || modelLower.includes("taş")) {
        console.log("✅ Karoser Kaya Tipi formu seçildi (içerik)");
        return <KaroserKayaTipiForm />;
      } else if (
        modelLower.includes("havuz") ||
        modelLower.includes("hardox")
      ) {
        console.log("✅ Karoser Havuz Hardox Tipi formu seçildi (içerik)");
        return <KaroserHavuzHardoxTipiForm />;
      } else if (
        modelLower.includes("kapaklı") ||
        modelLower.includes("kapali")
      ) {
        console.log("✅ Karoser Kapaklı Tip formu seçildi (içerik)");
        return <KaroserKapakliTipForm />;
      } else if (modelLower.includes("ahsap") || modelLower.includes("ahşap")) {
        console.log("✅ Karoser Ahşap Kasa formu seçildi (içerik)");
        return <KaroserAhsapKasaForm />;
      } else if (modelLower.includes("acik") || modelLower.includes("açık")) {
        console.log("✅ Açık Kasa formu seçildi (içerik)");
        return <AcikKasaForm />;
      } else if (
        modelLower.includes("kapali") ||
        modelLower.includes("kapalı")
      ) {
        console.log("✅ Kapalı Kasa formu seçildi (içerik)");
        return <KapaliKasaForm />;
      } else if (modelLower.includes("ozel") || modelLower.includes("özel")) {
        console.log("✅ Özel Kasa formu seçildi (içerik)");
        return <OzelKasaForm />;
      } else {
        console.log("❌ HİÇBİR KAROSER FORMU EŞLEŞMEDİ! Model:", modelSlug);
        console.log("  Fallback olarak Kaya Tipi açılacak");
      }
    }

    // Fallback - varsayılan olarak Kaya Tipi
    console.log("⚠️ Karoser için varsayılan form açılıyor - Kaya Tipi");
    return <KaroserKayaTipiForm />;
  }

  // Römork kategorisi için özel mantık
  if (categorySlug === "romork") {
    console.log("🎯 RÖMORK KATEGORİSİ ALGILANDI!");
    console.log("  Römork formu açılıyor");
    return <KamyonRomorkForm />;
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

    // Oto Kurtarıcı ve Taşıyıcı
    case "oto-kurtarici-tasiyici":
    case "oto-kurtarici":
    case "tasiyici":
      console.log("🎯 OTO KURTARICI VE TAŞIYICI KATEGORİSİ ALGILANDI!");
      console.log("  Category slug:", categorySlug);
      console.log("  Model slug:", modelSlug);
      console.log("  Variant slug:", variantSlug);
      console.log("  Checking variant:", variantSlug);
      console.log("  Checking model:", modelSlug);

      // Variant'a göre form seç
      if (variantSlug) {
        console.log("🔍 Variant kontrolü başlıyor:", variantSlug);
        switch (variantSlug) {
          case "tekli-arac":
          case "tekli":
            console.log("✅ Tekli Araç Kurtarıcı formu seçildi (variant)");
            return <TekliAracForm />;
          case "coklu-arac":
          case "coklu":
          case "çoklu-arac":
          case "çoklu":
            console.log("✅ Çoklu Araç Kurtarıcı formu seçildi (variant)");
            return <CokluAracForm />;
          default: {
            console.log(
              "⚠️ Bilinmeyen oto kurtarıcı variant:",
              variantSlug,
              "- Kontrol ediliyor..."
            );
            // Variant adında 'coklu' veya 'çoklu' geçiyorsa çoklu araç formu aç
            const variantLower = variantSlug.toLowerCase();
            if (
              variantLower.includes("coklu") ||
              variantLower.includes("çoklu") ||
              variantLower.includes("multi")
            ) {
              console.log(
                "✅ Çoklu Araç Kurtarıcı formu seçildi (variant string match)"
              );
              return <CokluAracForm />;
            } else {
              console.log("⚠️ Varsayılan olarak Tekli Araç açılıyor");
              return <TekliAracForm />;
            }
          }
        }
      }

      // Model slug'ına göre seç (fallback)
      if (modelSlug) {
        const modelLower = modelSlug.toLowerCase();
        if (
          modelLower.includes("coklu") ||
          modelLower.includes("çoklu") ||
          modelLower.includes("multi")
        ) {
          console.log("✅ Çoklu Araç Kurtarıcı formu seçildi (model)");
          return <CokluAracForm />;
        } else {
          console.log("✅ Tekli Araç Kurtarıcı formu seçildi (model)");
          return <TekliAracForm />;
        }
      }

      // Varsayılan olarak Tekli Araç
      console.log(
        "⚠️ Oto kurtarıcı için varsayılan form açılıyor - Tekli Araç"
      );
      return <TekliAracForm />;

    // Diğer kategoriler için varsayılan form (şimdilik minibüs)
    case "oto-kurtarici-tasiyici-old":
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
