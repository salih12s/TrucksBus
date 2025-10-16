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

// Tarım Römork Forms
import SulamaForm from "./forms/TarimRomork/SulamaForm";
import TarimTankerForm from "./forms/TarimRomork/TarimTankerForm";

// Taşıma Römorkları Forms
import BoruRomorkForm from "./forms/TasimaRomorklari/BoruRomorkForm";
import FrigoRomorkForm from "./forms/TasimaRomorklari/FrigoRomorkForm";
import HayvanRomorkForm from "./forms/TasimaRomorklari/HayvanRomorkForm";
import PlatformRomorkForm from "./forms/TasimaRomorklari/PlatformRomorkForm";
import SeyehatRomorkForm from "./forms/TasimaRomorklari/SeyehatRomorkForm";
import TupDamacanaRomorkForm from "./forms/TasimaRomorklari/TupDamacanaRomorkForm";
import VasitaRomorkForm from "./forms/TasimaRomorklari/VasitaRomorkForm";
import YukRomorkForm from "./forms/TasimaRomorklari/YukRomorkForm";
import OzelAmacliRomorkForm from "./forms/OzelAmacliRomorkForm";

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

// Tenteli Forms
import MidilliForm from "./forms/Tenteli/MidilliForm";
import PilotForm from "./forms/Tenteli/PilotForm";
import YariMidilliForm from "./forms/Tenteli/YariMidilliForm";

// Frigorifik Form
import FrigofirikForm from "./forms/FrigofirikForm";

// Oto Kurtarıcı ve Taşıyıcı Forms
import TekliAracForm from "./forms/OtoKurtariciTasiyici/TekliAracForm";
import CokluAracForm from "./forms/OtoKurtariciTasiyici/CokluAracForm";

// Konteyner Taşıyıcı Şasi Grubu Forms
import DamperSasiForm from "./forms/KonteynerTasiyiciSasiGrubu/DamperSasi/DamperSasiForm";
import KilcikSasiForm from "./forms/KonteynerTasiyiciSasiGrubu/KilcikSasi/KilcikSasiForm";
import PlatformSasiForm from "./forms/KonteynerTasiyiciSasiGrubu/PlatformSasi/PlatformSasiForm";
import RomorkKonvantöruForm from "./forms/KonteynerTasiyiciSasiGrubu/RomorkKonvantoru/RomorkKonvantöruForm";
import TankerSasiForm from "./forms/KonteynerTasiyiciSasiGrubu/TankerSasi/TankerSasiForm";
import UzayabilirSasiForm from "./forms/KonteynerTasiyiciSasiGrubu/UzayabilirSasi/UzayabilirSasiForm";

const VehicleFormSelector: React.FC = () => {
  const { categorySlug, variantSlug, modelSlug } = useParams<{
    categorySlug: string;
    variantSlug?: string;
    modelSlug?: string;
  }>();

  // URL'den categorySlug'ı parse et (fallback)
  const currentPath = window.location.pathname;
  const urlParts = currentPath.split("/");
  const categoriesIndex = urlParts.indexOf("categories");
  const urlCategorySlug =
    categoriesIndex !== -1 && urlParts[categoriesIndex + 1]
      ? urlParts[categoriesIndex + 1]
      : categorySlug;

  // Aktif categorySlug'ı belirle
  const activeCategorySlug = categorySlug || urlCategorySlug;

  // Debug için console'a yazdır
  console.log("🔍 VehicleFormSelector DEBUG:");
  console.log("  categorySlug (from params):", categorySlug);
  console.log("  categorySlug (from URL):", urlCategorySlug);
  console.log("  activeCategorySlug:", activeCategorySlug);
  console.log("  variantSlug:", variantSlug);
  console.log("  modelSlug:", modelSlug);
  console.log("  URL:", window.location.pathname);

  // Dorse kategorisi için özel mantık
  if (
    activeCategorySlug === "dorse" ||
    activeCategorySlug === "damperli-dorse"
  ) {
    console.log("🎯 DORSE KATEGORİSİ ALGILANDI!");
    console.log("  Checking variant:", variantSlug);
    console.log("  Checking model:", modelSlug);

    // Eğer variant var ise, variant'a göre seç
    if (variantSlug) {
      // Konteyner Taşıyıcı Şasi Grubu - içinde anahtar kelime araması
      if (variantSlug.includes("damper-sasi")) {
        console.log(
          "✅ Damper Şasi formu seçildi (variant contains damper-sasi)"
        );
        return <DamperSasiForm />;
      }
      if (
        variantSlug.includes("kilcik-sasi") ||
        variantSlug.includes("kılçık-sasi")
      ) {
        console.log(
          "✅ Kılçık Şasi formu seçildi (variant contains kilcik-sasi)"
        );
        return <KilcikSasiForm />;
      }
      if (variantSlug.includes("platform-sasi")) {
        console.log(
          "✅ Platform Şasi formu seçildi (variant contains platform-sasi)"
        );
        return <PlatformSasiForm />;
      }
      if (
        variantSlug.includes("romork-konvantoru") ||
        variantSlug.includes("römork-konvantörü")
      ) {
        console.log(
          "✅ Römork Konvantörü formu seçildi (variant contains romork-konvantoru)"
        );
        return <RomorkKonvantöruForm />;
      }
      if (variantSlug.includes("tanker-sasi")) {
        console.log(
          "✅ Tanker Şasi formu seçildi (variant contains tanker-sasi)"
        );
        return <TankerSasiForm />;
      }
      if (variantSlug.includes("uzayabilir-sasi")) {
        console.log(
          "✅ Uzayabilir Şasi formu seçildi (variant contains uzayabilir-sasi)"
        );
        return <UzayabilirSasiForm />;
      }

      // Diğer variant kontrolleri
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
        // Tenteli Dorse Variants
        case "tenteli-tenteli-midilli":
        case "tenteli-tenteli-tenteli":
        case "midilli":
          console.log("✅ Midilli Tenteli Dorse formu seçildi (variant)");
          return <MidilliForm />;
        case "tenteli-tenteli-pilot":
        case "pilot":
          console.log("✅ Pilot Tenteli Dorse formu seçildi (variant)");
          return <PilotForm />;
        case "tenteli-tenteli-yari-midilli":
        case "tenteli-tenteli-yarimidilli":
        case "yari-midilli":
          console.log("✅ Yarı Midilli Tenteli Dorse formu seçildi (variant)");
          return <YariMidilliForm />;
        // Kuruyük Dorse Variants
        case "kuru-yuk-kuru-yuk-kapakli":
          console.log("✅ Kuruyük Kapaklı Dorse formu seçildi (variant)");
          return <KapakliForm />;
        case "kuru-yuk-kuru-yuk-kapakli-kaya-tip":
          console.log(
            "✅ Kuruyük Kapaklı Kaya Tipi Dorse formu seçildi (variant)"
          );
          return <KapakliKayaTipiForm />;
        case "kuru-yuk-kuru-yuk-kapaksiz-platform":
          console.log(
            "✅ Kuruyük Kapaksız Platform Dorse formu seçildi (variant)"
          );
          return <KapaksızPlatformForm />;
        // Frigorifik Dorse Variants
        case "frigorifik-frigorifik-frigorifik":
        case "frigorifik":
          console.log("✅ Frigorifik Dorse formu seçildi (variant)");
          return <FrigofirikForm />;
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
        // Konteyner Taşıyıcı Şasi Grubu Models
        case "damper-sasi":
          console.log("✅ Damper Şasi formu seçildi (model slug)");
          return <DamperSasiForm />;
        case "kilcik-sasi":
          console.log("✅ Kılçık Şasi formu seçildi (model slug)");
          return <KilcikSasiForm />;
        case "platform-sasi":
          console.log("✅ Platform Şasi formu seçildi (model slug)");
          return <PlatformSasiForm />;
        case "romork-konvantoru":
        case "romork-konvantörü":
          console.log("✅ Römork Konvantörü formu seçildi (model slug)");
          return <RomorkKonvantöruForm />;
        case "tanker-sasi":
          console.log("✅ Tanker Şasi formu seçildi (model slug)");
          return <TankerSasiForm />;
        case "uzayabilir-sasi":
          console.log("✅ Uzayabilir Şasi formu seçildi (model slug)");
          return <UzayabilirSasiForm />;
      }

      // Eğer tam eşleşme yoksa, içerik kontrolü (fallback)
      const modelLower = modelSlug.toLowerCase();
      console.log("  🔎 Model slug lowercase:", modelLower);

      // Önce daha spesifik kontroller (2 kelime içerenler)
      if (modelLower.includes("tanker") && modelLower.includes("sasi")) {
        console.log("✅ Tanker Şasi formu seçildi (içerik)");
        return <TankerSasiForm />;
      } else if (modelLower.includes("damper") && modelLower.includes("sasi")) {
        console.log("✅ Damper Şasi formu seçildi (içerik)");
        return <DamperSasiForm />;
      } else if (
        modelLower.includes("platform") &&
        modelLower.includes("sasi")
      ) {
        console.log("✅ Platform Şasi formu seçildi (içerik)");
        return <PlatformSasiForm />;
      } else if (
        modelLower.includes("platform") &&
        modelLower.includes("kapaksız")
      ) {
        console.log(
          "✅ Kapaksız Platform Kuruyük Dorse formu seçildi (içerik)"
        );
        return <KapaksızPlatformForm />;
      } else if (
        modelLower.includes("havuz") ||
        modelLower.includes("hardox")
      ) {
        console.log("✅ Havuz Hardox Tipi Dorse formu seçildi (içerik)");
        return <HavuzHardoxTipiForm />;
        // Konteyner Taşıyıcı Şasi Grubu kontrolleri
      } else if (
        modelLower.includes("kilcik") ||
        modelLower.includes("kılçık")
      ) {
        console.log("✅ Kılçık Şasi formu seçildi (içerik)");
        return <KilcikSasiForm />;
      } else if (
        modelLower.includes("konvantör") ||
        modelLower.includes("konvantor")
      ) {
        console.log("✅ Römork Konvantörü formu seçildi (içerik)");
        return <RomorkKonvantöruForm />;
      } else if (modelLower.includes("uzayabilir")) {
        console.log("✅ Uzayabilir Şasi formu seçildi (içerik)");
        return <UzayabilirSasiForm />;
        // Genel dorse kontrolleri
      } else if (
        modelLower.includes("hafriyat") ||
        modelLower.includes("kazı")
      ) {
        console.log("✅ Hafriyat Tipi Dorse formu seçildi (içerik)");
        return <HafriyatTipiForm />;
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
      } else if (modelLower.includes("kuruyuk")) {
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
    console.log("  📋 URL Parametreleri:");
    console.log("    - categorySlug:", categorySlug);
    console.log("    - modelSlug:", modelSlug);
    console.log("    - variantSlug:", variantSlug);
    console.log("  🔍 Ahşap Kasa Kontrolleri:");
    if (variantSlug) {
      console.log("    - variant toLowerCase:", variantSlug.toLowerCase());
      console.log(
        "    - variant includes 'ahsap':",
        variantSlug.toLowerCase().includes("ahsap")
      );
      console.log(
        "    - variant includes 'ahşap':",
        variantSlug.toLowerCase().includes("ahşap")
      );
    }
    if (modelSlug) {
      console.log("    - model toLowerCase:", modelSlug.toLowerCase());
      console.log(
        "    - model includes 'ahsap':",
        modelSlug.toLowerCase().includes("ahsap")
      );
      console.log(
        "    - model includes 'ahşap':",
        modelSlug.toLowerCase().includes("ahşap")
      );
    }

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
        case "hafriyat-tipi":
        case "damperli-grup-hafriyat-tipi-hafriyat-tipi":
          console.log("✅ Karoser Hafriyat Tipi formu seçildi (variant)");
          return <HafriyatTipiForm />;
        case "ahsap-kasa":
        case "damperli-grup-ahsap-kasa-ahsap-kasa":
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
        default: {
          console.log(
            "⚠️ Bilinmeyen karoser variant:",
            variantSlug,
            "- String matching kontrol ediliyor..."
          );

          // String matching ile variant kontrol et
          const variantLower = variantSlug.toLowerCase();

          if (
            variantLower.includes("ahsap") ||
            variantLower.includes("ahşap")
          ) {
            console.log("✅ Ahşap Kasa formu seçildi (string match)");
            return <KaroserAhsapKasaForm />;
          } else if (
            variantLower.includes("hafriyat") ||
            variantLower.includes("hafrıyat")
          ) {
            console.log("✅ Hafriyat Tipi formu seçildi (string match)");
            return <HafriyatTipiForm />;
          } else if (variantLower.includes("kaya")) {
            console.log("✅ Kaya Tipi formu seçildi (string match)");
            return <KaroserKayaTipiForm />;
          } else if (
            variantLower.includes("havuz") ||
            variantLower.includes("hardox")
          ) {
            console.log("✅ Havuz Hardox Tipi formu seçildi (string match)");
            return <KaroserHavuzHardoxTipiForm />;
          } else if (
            variantLower.includes("kapakli") ||
            variantLower.includes("kapaklı")
          ) {
            console.log("✅ Kapaklı Tip formu seçildi (string match)");
            return <KaroserKapakliTipForm />;
          } else if (
            variantLower.includes("acik") ||
            variantLower.includes("açık")
          ) {
            console.log("✅ Açık Kasa formu seçildi (string match)");
            return <AcikKasaForm />;
          } else if (
            variantLower.includes("kapali") ||
            variantLower.includes("kapalı")
          ) {
            console.log("✅ Kapalı Kasa formu seçildi (string match)");
            return <KapaliKasaForm />;
          } else if (
            variantLower.includes("ozel") ||
            variantLower.includes("özel")
          ) {
            console.log("✅ Özel Kasa formu seçildi (string match)");
            return <OzelKasaForm />;
          } else {
            console.log("⚠️ Hiçbir match bulunamadı - Kaya Tipi açılıyor");
            return <KaroserKayaTipiForm />;
          }
        }
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
        case "hafriyat-tipi":
        case "damperli-grup-hafriyat-tipi":
          console.log("✅ Karoser Hafriyat Tipi formu seçildi (tam slug)");
          return <HafriyatTipiForm />;
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
        modelLower.includes("hafriyat") ||
        modelLower.includes("hafrıyat")
      ) {
        console.log("✅ Karoser Hafriyat Tipi formu seçildi (içerik)");
        return <HafriyatTipiForm />;
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
  if (activeCategorySlug === "romork") {
    console.log("🎯 RÖMORK KATEGORİSİ ALGILANDI!");
    console.log("  Variant kontrolü yapılıyor:", variantSlug);
    console.log("  Model kontrolü yapılıyor:", modelSlug);

    // ===== TARIM RÖMORK =====
    // Tarım Römork Tanker
    if (variantSlug?.includes("tarim-romorklari-tanker")) {
      console.log("✅ Tarım Tanker formu seçildi");
      return <TarimTankerForm />;
    }

    // Tarım Römork Sulama
    if (variantSlug?.includes("tarim-romorklari-sulama")) {
      console.log("✅ Sulama formu seçildi");
      return <SulamaForm />;
    }

    // ===== TAŞIMA RÖMORKLAR =====
    // Boru Taşıma Römorku
    if (
      variantSlug?.includes("boru-romork") ||
      variantSlug?.includes("boru-romorku") ||
      variantSlug?.includes("boru-tasima") ||
      modelSlug?.includes("boru-tasima") ||
      modelSlug?.includes("boru-romorku") ||
      modelSlug?.includes("boru-romork")
    ) {
      console.log("✅ Boru Taşıma Römorku formu seçildi");
      return <BoruRomorkForm />;
    }

    // Frigo Taşıma Römorku
    if (
      variantSlug?.includes("frigo-romork") ||
      variantSlug?.includes("frigo-romorku") ||
      variantSlug?.includes("frigo-tasima") ||
      modelSlug?.includes("frigo-tasima") ||
      modelSlug?.includes("frigo-romorku") ||
      modelSlug?.includes("frigo-romork")
    ) {
      console.log("✅ Frigo Taşıma Römorku formu seçildi");
      return <FrigoRomorkForm />;
    }

    // Hayvan Taşıma Römorku
    if (
      variantSlug?.includes("hayvan-romorku") ||
      variantSlug?.includes("hayvan-romork") ||
      variantSlug?.includes("hayvan-tasima") ||
      modelSlug?.includes("hayvan-tasima") ||
      modelSlug?.includes("hayvan-romorku") ||
      modelSlug?.includes("hayvan-romork")
    ) {
      console.log("✅ Hayvan Taşıma Römorku formu seçildi");
      return <HayvanRomorkForm />;
    }

    // Platform Taşıma Römorku
    if (
      variantSlug?.includes("platform-romorku") ||
      variantSlug?.includes("platform-romork") ||
      variantSlug?.includes("platform-tasima") ||
      modelSlug?.includes("platform-tasima") ||
      modelSlug?.includes("platform-romorku") ||
      modelSlug?.includes("platform-romork")
    ) {
      console.log("✅ Platform Taşıma Römorku formu seçildi");
      return <PlatformRomorkForm />;
    }

    // Seyahat Römorku
    if (
      variantSlug?.includes("seyahat-romork") ||
      variantSlug?.includes("seyahat-romorku") ||
      modelSlug?.includes("seyahat-romork") ||
      modelSlug?.includes("seyahat-romorku")
    ) {
      console.log("✅ Seyahat Römorku formu seçildi");
      return <SeyehatRomorkForm />;
    }

    // Tüp Damacana Taşıma Römorku
    if (
      variantSlug?.includes("tup-damacana") ||
      variantSlug?.includes("tup-damacana-romork") ||
      variantSlug?.includes("tup-damacana-romorku") ||
      modelSlug?.includes("tup-damacana") ||
      modelSlug?.includes("tup-damacana-romork") ||
      modelSlug?.includes("tup-damacana-romorku")
    ) {
      console.log("✅ Tüp Damacana Taşıma Römorku formu seçildi");
      return <TupDamacanaRomorkForm />;
    }

    // Vasıta Taşıma Römorku
    if (
      variantSlug?.includes("vasita-romorku") ||
      variantSlug?.includes("vasita-romork") ||
      variantSlug?.includes("vasita-tasima") ||
      modelSlug?.includes("vasita-tasima") ||
      modelSlug?.includes("vasita-romorku") ||
      modelSlug?.includes("vasita-romork")
    ) {
      console.log("✅ Vasıta Taşıma Römorku formu seçildi");
      return <VasitaRomorkForm />;
    }

    // Yük Taşıma Römorku
    if (
      variantSlug?.includes("yuk-romorku") ||
      variantSlug?.includes("yuk-romork") ||
      variantSlug?.includes("yuk-tasima") ||
      modelSlug?.includes("yuk-tasima") ||
      modelSlug?.includes("yuk-romorku") ||
      modelSlug?.includes("yuk-romork")
    ) {
      console.log("✅ Yük Taşıma Römorku formu seçildi");
      return <YukRomorkForm />;
    }

    // Özel Amaçlı Römork
    if (
      variantSlug?.includes("ozel-amacli-romorklar") ||
      variantSlug?.includes("ozel-amacli-romork") ||
      modelSlug?.includes("ozel-amacli-romorklar") ||
      modelSlug?.includes("ozel-amacli-romork")
    ) {
      console.log("✅ Özel Amaçlı Römork formu seçildi");
      return <OzelAmacliRomorkForm />;
    }

    // ===== FALLBACK KONTROLLER =====
    // Model slug kontrolü (fallback for tarım)
    if (modelSlug?.includes("tarim-romorklari-tanker")) {
      console.log("✅ Model'e göre Tarım Tanker formu seçildi");
      return <TarimTankerForm />;
    }

    if (modelSlug?.includes("tarim-romorklari-sulama")) {
      console.log("✅ Model'e göre Sulama formu seçildi");
      return <SulamaForm />;
    }

    // Varsayılan Kamyon Römork
    console.log("⚠️ Varsayılan Kamyon Römork formu açılıyor");
    return <KamyonRomorkForm />;
  }

  // Kategori slug'ına göre doğru formu seç - GERÇEK SLUG'LARA GÖRE
  switch (activeCategorySlug) {
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
        activeCategorySlug,
        "- Minibüs formu açılıyor (fallback)"
      );
      return <CreateMinibusAdForm />;
  }
};

export default VehicleFormSelector;
