import React from "react";
import { useParams } from "react-router-dom";
import CreateMinibusAdForm from "./ads/CreateMinibusAdForm";
import CekiciAdForm from "./forms/CekiciAdForm";
import KamyonAdForm from "./forms/KamyonAdForm";
import OtobusAdForm from "./forms/OtobusAdForm";

const VehicleFormSelector: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  // Debug için console'a yazdır
  console.log("VehicleFormSelector - categorySlug:", categorySlug);

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
    case "dorse":
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
