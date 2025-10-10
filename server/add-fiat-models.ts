import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Fiat modelleri ve varyantları ekleniyor...");

  // Minivan & Panelvan kategorisini bul
  const category = await prisma.category.findFirst({
    where: { slug: "minivan-panelvan" },
  });

  if (!category) {
    console.error("❌ Minivan & Panelvan kategorisi bulunamadı");
    return;
  }

  console.log(`✅ Kategori bulundu: ${category.name} (ID: ${category.id})`);

  // Fiat markasını bul
  const fiatBrand = await prisma.brand.findFirst({
    where: { slug: "fiat" },
  });

  if (!fiatBrand) {
    console.error("❌ Fiat markası bulunamadı");
    return;
  }

  console.log(`✅ Marka bulundu: ${fiatBrand.name} (ID: ${fiatBrand.id})`);

  // Modeller ve varyantları
  const modelsData = [
    {
      name: "Doblo Cargo",
      slug: "doblo-cargo",
      variants: [
        "1.2",
        "1.2 Actual",
        "1.3 Ecojet Maxi Plus",
        "1.3 Ecojet Plus",
        "1.3 Multijet",
        "1.3 Multijet Active",
        "1.3 Multijet Active Maxi",
        "1.3 Multijet Actual",
        "1.3 Multijet Actual Maxi",
        "1.3 Multijet Actual Maxi AB",
        "1.3 Multijet Maxi",
        "1.3 Multijet Maxi Frigo",
        "1.3 Multijet Maxi Plus Pack",
        "1.3 Multijet Plus",
        "1.3 Multijet Plus Pack",
        "1.4",
        "1.4 Active",
        "1.4 Actual",
        "1.4 Plus",
        "1.5 BlueHDi",
        "1.5 BlueHDi Maxi",
        "1.6 16V SX",
        "1.6 Malibu",
        "1.6 Multijet",
        "1.6 Multijet Maxi",
        "1.6 Multijet Maxi Frigo",
        "1.6 Multijet Maxi Plus",
        "1.6 Multijet Maxi Plus Pack",
        "1.6 Multijet Maxi XL",
        "1.6 Multijet Maxi XL Plus",
        "1.6 Multijet Plus",
        "1.9 D",
        "1.9 D Actual",
        "1.9 D Actual Maxi",
        "1.9 D Maxi",
        "1.9 D SX",
        "1.9 D SX Maxi",
        "1.9 JTD",
        "1.9 JTD Active",
        "1.9 JTD Active Maxi",
        "1.9 JTD Actual",
        "1.9 JTD Actual Maxi",
        "1.9 JTD Frigo",
        "1.9 JTD Maxi",
        "1.9 JTD SX",
        "1.9 JTD SX Maxi",
        "1.9 JTD VIP",
        "1.9 Multijet",
        "1.9 Multijet Active",
        "1.9 Multijet Actual Maxi",
        "1.9 Multijet Maxi Active",
        "1.9 Multijet Plus",
        "2.0 Multijet",
        "2.0 Multijet Maxi",
        "2.0 Multijet Maxi Plus",
        "2.0 Multijet Plus",
        "2.0 Multijet Plus Pack",
      ],
    },
    {
      name: "Doblo Combi",
      slug: "doblo-combi",
      variants: [
        "1.2 Puretech Easy",
        "1.3 Ecojet Maxi Safeline",
        "1.3 Ecojet Premio",
        "1.3 Ecojet Premio Plus",
        "1.3 Ecojet Safeline",
        "1.3 Multijet",
        "1.3 Multijet 20. Yıl Özel Seri",
        "1.3 Multijet Active",
        "1.3 Multijet Active Plus",
        "1.3 Multijet Carioca",
        "1.3 Multijet Dynamic",
        "1.3 Multijet Easy",
        "1.3 Multijet Elegance",
        "1.3 Multijet Maxi Active",
        "1.3 Multijet Maxi Dynamic",
        "1.3 Multijet Maxi Easy",
        "1.3 Multijet Maxi Safeline",
        "1.3 Multijet MyLife",
        "1.3 Multijet Panorama",
        "1.3 Multijet Plus",
        "1.3 Multijet Premio",
        "1.3 Multijet Premio Plus",
        "1.3 Multijet Safeline",
        "1.3 Multijet Urban",
        "1.3 MultiJet VIP Plus",
        "1.4 Active",
        "1.4 Dynamic",
        "1.4 Easy",
        "1.4 Panorama",
        "1.4 Premio",
        "1.4 Premio Plus",
        "1.4 Safeline",
        "1.5 BlueHDi Easy",
        "1.5 BlueHDi Premio",
        "1.5 BlueHDi Premio Plus",
        "1.5 BlueHDi Urban",
        "1.6 Elegance",
        "1.6 Multijet 20. Yıl Özel Seri",
        "1.6 Multijet Conformatic Premio",
        "1.6 Multijet Dynamic",
        "1.6 Multijet Easy",
        "1.6 Multijet Elegance",
        "1.6 Multijet Maxi Dynamic",
        "1.6 Multijet Maxi Easy",
        "1.6 Multijet Maxi Elegance",
        "1.6 MultiJet Maxi Premio",
        "1.6 Multijet Maxi Premio Plus",
        "1.6 Multijet Maxi Safeline",
        "1.6 Multijet Maxi Urban",
        "1.6 Multijet MyLife",
        "1.6 Multijet Panorama",
        "1.6 Multijet Premio",
        "1.6 Multijet Premio Black",
        "1.6 Multijet Premio Plus",
        "1.6 Multijet Trekking",
        "1.6 Multijet Urban",
        "1.6 Premio",
        "1.9 D",
        "1.9 D Active",
        "1.9 D LX",
        "1.9 D SX",
        "1.9 JTD Active",
        "1.9 JTD Dynamic",
        "1.9 JTD ELX",
        "1.9 JTD ELX Maxi",
        "1.9 JTD Premio",
        "1.9 JTD SX",
        "1.9 JTD SX Maxi",
        "1.9 JTD VIP",
        "1.9 Multijet",
        "1.9 Multijet Active",
        "1.9 Multijet Carioca",
        "1.9 Multijet Dynamic",
        "1.9 Multijet Maxi Active",
        "1.9 Multijet Maxi Active Plus",
        "1.9 Multijet Maxi Dynamic",
        "1.9 Multijet Plus",
        "1.9 Multijet Premio",
        "1.9 Multijet Safeline",
        "1.9 Multijet VIP",
        "2.0 Multijet Elegance",
        "2.0 Multijet Maxi Elegance",
        "2.0 Multijet Premio",
        "2.0 Multijet Premio Black",
      ],
    },
    {
      name: "Doblo Panorama",
      slug: "doblo-panorama",
      variants: [
        "1.2 Active",
        "1.2 ELX",
        "1.2 SX",
        "1.3 JTD Actual",
        "1.3 JTD Dynamic",
        "1.3 JTD Malibu",
        "1.3 Multijet",
        "1.3 Multijet Active",
        "1.3 Multijet Dynamic",
        "1.3 Multijet Easy",
        "1.3 Multijet Family",
        "1.3 Multijet Maxi Plus",
        "1.3 Multijet Premio",
        "1.4",
        "1.4 Active",
        "1.4 Actual",
        "1.4 Dynamic",
        "1.4 Family",
        "1.4 Fire",
        "1.4 Malibu",
        "1.6 Active",
        "1.6 ELX",
        "1.6 Malibu",
        "1.6 Multijet",
        "1.6 Multijet Comfortmatic",
        "1.6 MultiJet Easy",
        "1.6 Multijet Lounge",
        "1.6 Multijet Maxi",
        "1.6 Multijet Maxi Comfortmatic",
        "1.6 Multijet Maxi Easy",
        "1.6 MultiJet Pop",
        "1.6 Multijet Premio",
        "1.6 Multijet Premio Black",
        "1.6 Multijet Premio Comfortmatic",
        "1.6 Multijet Premio Plus",
        "1.6 Multijet Safeline",
        "1.6 SX",
        "1.9 D ELX",
        "1.9 D SX",
        "1.9 JTD Dynamic",
        "1.9 JTD ELX",
        "1.9 JTD Family",
        "1.9 JTD SX",
        "1.9 TD Family",
        "1.9 TD Malibu",
      ],
    },
    {
      name: "e-Doblo Cargo",
      slug: "e-doblo-cargo",
      variants: ["Maxi", "Maxi Premio", "Premio Plus"],
    },
    {
      name: "e-Doblo Panorama",
      slug: "e-doblo-panorama",
      variants: ["Maxi Premio", "Premio Plus"],
    },
    {
      name: "Ducato",
      slug: "ducato",
      variants: [
        "7,5 m³",
        "8 m³",
        "9,0 m³",
        "9,5 m³",
        "10 m³",
        "11,5 m³",
        "12 m³",
        "13 m³",
        "15 m³",
        "17 m³",
      ],
    },
    {
      name: "Fiorino Cargo",
      slug: "fiorino-cargo",
      variants: [
        "1.3 Multijet",
        "1.3 Multijet Active",
        "1.3 Multijet Actual",
        "1.3 Multijet Plus",
        "1.4 Fire",
        "1.4 Fire Active",
        "1.4 Fire Actual",
        "1.4 Fire Plus",
      ],
    },
    {
      name: "Fiorino Combi",
      slug: "fiorino-combi",
      variants: [
        "1.3 Multijet 100. Yıl Özel Seri",
        "1.3 Multijet Active",
        "1.3 Multijet Dynamic",
        "1.3 Multijet Emotion",
        "1.3 Multijet Pop",
        "1.3 Multijet Premio",
        "1.3 Multijet Safeline",
        "1.3 Multijet Trekking",
        "1.3 Multijet Urban",
        "1.4 Eko Pop",
        "1.4 Eko Premio",
        "1.4 Eko Safeline",
        "1.4 Fire Active",
        "1.4 Fire Dynamic",
        "1.4 Fire Pop",
        "1.4 Fire Premio",
        "1.4 Fire Safeline",
      ],
    },
    {
      name: "Fiorino Combi Mix",
      slug: "fiorino-combi-mix",
      variants: ["1.3 Multijet", "1.3 Multijet Active", "1.4 Fire"],
    },
    {
      name: "Fiorino Panorama",
      slug: "fiorino-panorama",
      variants: [
        "1.3 Multijet Dynamic",
        "1.3 Multijet Emotion",
        "1.3 Multijet Pop",
        "1.3 Multijet Premio",
        "1.3 Multijet Safeline",
        "1.4 Dynamic",
        "1.4 Emotion",
      ],
    },
    {
      name: "Scudo",
      slug: "scudo",
      variants: [
        "1.5 Multijet Business",
        "1.5 Multijet Lounge",
        "1.6 Multijet Cargo",
        "1.6 Multijet Combi Mix",
        "1.6 MultiJet L2H1",
        "1.9 D EL Van",
        "1.9 TD EL Van",
        "2.0 JTD EL Van",
        "2.0 Multijet Business",
        "2.0 Multijet Combi Mix",
        "2.0 Multijet L2H1",
        "2.0 Multijet Lounge",
        "2.0 Multijet Maxi Business",
      ],
    },
    {
      name: "e-Scudo",
      slug: "e-scudo",
      variants: ["Maxi Business"],
    },
    {
      name: "Ulysse",
      slug: "ulysse",
      variants: [
        "2.0 Multijet Konfor",
        "2.0 Multijet Lounge",
        "2.0 Multijet Maxi Lounge",
      ],
    },
    {
      name: "Doblo Combi Mix",
      slug: "doblo-combi-mix",
      variants: ["1.3 Multijet Maxi Active"],
    },
    {
      name: "Multipla",
      slug: "multipla",
      variants: ["1.6 16V ELX", "1.9 JTD Active"],
    },
    {
      name: "Palio Van",
      slug: "palio-van",
      variants: [
        "1.2 16V EL",
        "1.2 8V SL",
        "1.3 Multijet Active",
        "1.3 Multijet EL",
        "1.4 Fire Active",
        "1.7 TD",
      ],
    },
    {
      name: "Panda Van",
      slug: "panda-van",
      variants: ["1.1", "1.2", "1.3 JTD"],
    },
    {
      name: "Punto Van",
      slug: "punto-van",
      variants: ["1.2", "1.3 JTD", "1.3 Multijet", "1.7 TD"],
    },
  ];

  let totalModels = 0;
  let totalVariants = 0;

  for (const modelData of modelsData) {
    // Modeli bul veya oluştur
    let model = await prisma.model.findFirst({
      where: {
        slug: modelData.slug,
        brandId: fiatBrand.id,
        categoryId: category.id,
      },
    });

    if (!model) {
      model = await prisma.model.create({
        data: {
          name: modelData.name,
          slug: modelData.slug,
          brandId: fiatBrand.id,
          categoryId: category.id,
        },
      });
      console.log(`  ✅ Model oluşturuldu: ${model.name}`);
      totalModels++;
    } else {
      console.log(`  ℹ️  Model zaten mevcut: ${model.name}`);
    }

    // Varyantları ekle
    for (const variantName of modelData.variants) {
      const variantSlug = variantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existingVariant = await prisma.variant.findFirst({
        where: {
          slug: variantSlug,
          modelId: model.id,
        },
      });

      if (!existingVariant) {
        await prisma.variant.create({
          data: {
            name: variantName,
            slug: variantSlug,
            modelId: model.id,
          },
        });
        console.log(`    ✅ Varyant eklendi: ${variantName}`);
        totalVariants++;
      } else {
        console.log(`    ℹ️  Varyant zaten mevcut: ${variantName}`);
      }
    }
  }

  console.log("\n🎉 İşlem tamamlandı!");
  console.log(
    `📊 Toplam ${totalModels} model ve ${totalVariants} varyant eklendi.`
  );
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
