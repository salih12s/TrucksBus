import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Ford modelleri ve varyantları ekleniyor...\n");

  // Minivan & Panelvan kategorisini bul
  const category = await prisma.category.findFirst({
    where: { slug: "minivan-panelvan" },
  });

  if (!category) {
    throw new Error("Minivan & Panelvan kategorisi bulunamadı!");
  }

  console.log(`✅ Kategori bulundu: ${category.name} (ID: ${category.id})\n`);

  // Ford markasını bul
  const ford = await prisma.brand.findFirst({
    where: {
      OR: [{ slug: "ford" }, { name: { equals: "Ford", mode: "insensitive" } }],
    },
  });

  if (!ford) {
    throw new Error("Ford markası bulunamadı!");
  }

  console.log(`✅ Marka bulundu: ${ford.name} (ID: ${ford.id})\n`);

  const models = [
    {
      name: "Tourneo Connect",
      variants: [
        "1.0 EcoBoost Active",
        "1.5 EcoBlue Active",
        "1.5 EcoBlue Deluxe",
        "1.5 EcoBlue Titanium",
        "1.5 EcoBlue Titanium X",
        "1.5 EcoBlue Trend",
        "1.5 EcoBoost Active",
        "1.5 TDCi",
        "1.5 TDCi Deluxe",
        "1.5 TDCi Titanium",
        "1.6 TDCi",
        "1.6 TDCi Deluxe",
        "1.6 TDCi Titanium",
        "1.8",
        "1.8 TDCi",
        "1.8 TDCi Blackline",
        "1.8 TDCi Deluxe",
        "1.8 TDCi GLX",
        "1.8 TDCi Silver",
        "1.8 TDCi Trend",
        "2.0 EcoBlue Active",
        "2.0 EcoBlue Titanium",
      ],
    },
    {
      name: "Tourneo Courier",
      variants: [
        "1.0 EcoBoost Active",
        "1.0 EcoBoost Colorline",
        "1.0 EcoBoost Deluxe",
        "1.0 EcoBoost Journey Deluxe",
        "1.0 EcoBoost Journey Titanium",
        "1.0 EcoBoost Titanium",
        "1.0 EcoBoost Titanium Plus",
        "1.0 EcoBoost Trend",
        "1.5 EcoBlue Active",
        "1.5 EcoBlue Deluxe",
        "1.5 EcoBlue Titanium",
        "1.5 EcoBlue Trend",
        "1.5 TDCi Black Line",
        "1.5 TDCi Delux",
        "1.5 TDCi Journey Delux",
        "1.5 TDCi Journey Titanium",
        "1.5 TDCi Journey Titanium Plus",
        "1.5 TDCi Journey Trend",
        "1.5 TDCi Titanium",
        "1.5 TDCi Titanium Plus",
        "1.5 TDCi Trend",
        "1.6 TDCi Black Line",
        "1.6 TDCi Deluxe",
        "1.6 TDCi Journey Titanium",
        "1.6 TDCi Journey Titanium Plus",
        "1.6 TDCi Journey Trend",
        "1.6 TDCi Titanium",
        "1.6 TDCi Titanium Plus",
        "1.6 TDCi Trend",
      ],
    },
    {
      name: "E-Tourneo Courier",
      variants: ["Titanium"],
    },
    {
      name: "Tourneo Custom",
      variants: [
        "1.0 EcoBoost Hibrit Titanium",
        "2.0 EcoBlue 320 L Titanium",
        "2.0 EcoBlue 320 L Titanium Plus",
        "2.0 EcoBlue 320 L Trend",
        "2.0 EcoBlue 320 S Deluxe",
        "2.0 EcoBlue 320 S Titanium",
        "2.0 EcoBlue 320 S Titanium Plus",
        "2.0 EcoBlue 320 S Trend",
        "2.0 EcoBlue Hibrit 320 L Titanium",
        "2.0 TDCi 310 L Titanium",
        "2.0 TDCi 310 L Titanium Plus",
        "2.0 TDCi 320 L Titanium",
        "2.0 TDCi 320 L Titanium Plus",
        "2.0 TDCi 320 L Trend",
        "2.0 TDCi 320 S Titanium Plus",
        "2.0 TDCi 320 S Trend",
        "2.0 TDCi Hibrit 320 L Titanium",
        "2.2 TDCi 300 S Trend",
        "2.2 TDCi 300 S Titanium",
        "2.2 TDCi 300 S Titanium Plus",
        "2.2 TDCi 300 L Trend",
        "2.2 TDCi 300 L Titanium",
        "2.2 TDCi 300 L Titanium Plus",
      ],
    },
    {
      name: "E-Tourneo Custom",
      variants: ["Titanium"],
    },
    {
      name: "Transit",
      variants: [
        "100 L",
        "100 S",
        "100 V",
        "120",
        "120 V",
        "190 V",
        "260 S",
        "280 M",
        "280 S",
        "300 L",
        "300 M",
        "300 S",
        "300 SF",
        "300 T",
        "305 L",
        "310 S",
        "330 L",
        "330 M",
        "330 S",
        "330 SF",
        "350 E",
        "350 ED",
        "350 EL",
        "350 L",
        "350 LF",
        "350 M",
        "350 MF",
        "410 L",
        "430 ED",
        "440 E",
        "460 E",
        "460 ED",
        "470 ED",
        "500 ED",
        "T 350",
      ],
    },
    {
      name: "E-Transit",
      variants: ["350 E", "350 L", "350 M", "390 M", "420 E"],
    },
    {
      name: "Transit Connect",
      variants: [
        "1.5 EcoBlue Trend",
        "1.5 TDCi Trend",
        "1.6 TDCi Trend",
        "1.8 TDCi GLX 50. Yıl",
        "K200 S",
        "K210 S",
        "K210 S Blackline",
        "K210 S Deluxe",
        "K210 S GLX",
        "K210 S Silver",
        "K230 L",
        "K230 L Deluxe",
        "T200 S",
        "T200 S LX",
        "T220 L",
        "T220 L LX",
        "T220 S",
        "T220 S LX",
        "T230 L",
        "T230 L LX",
      ],
    },
    {
      name: "Transit Courier",
      variants: [
        "1.0 EcoBoost Deluxe",
        "1.0 EcoBoost Trend",
        "1.5 EcoBlue Deluxe",
        "1.5 EcoBlue Trend",
        "1.5 TDCi Deluxe",
        "1.5 TDCi Trend",
        "1.6 TDCi Deluxe",
      ],
    },
    {
      name: "Transit Custom",
      variants: [
        "1.0 EcoBoost Hybrid",
        "300 L 125 PS",
        "300 L 155 PS",
        "310 L 125 PS",
        "310 L 155 PS",
        "310 L Deluxe",
        "310 L Trend",
        "310 S 100 PS",
        "310 S 125 PS",
        "310 S 155 PS",
        "310 S Deluxe",
        "310 S Trend",
        "320 L Deluxe",
        "320 L MS-RT",
        "320 L Trend",
        "320 S Deluxe",
        "320 S Trend",
        "330 L 125 PS",
        "330 L Trend",
        "330 S Trend",
        "340 L Trend",
        "340 S Trend",
      ],
    },
    {
      name: "E-Transit Custom",
      variants: ["Deluxe", "Titanium"],
    },
    {
      name: "Aerostar",
      variants: ["2.3", "2.4", "2.8", "3.0", "4.0"],
    },
    {
      name: "E Serisi",
      variants: ["E150", "E350", "E350 EL", "E450"],
    },
    {
      name: "Fiesta Van",
      variants: ["1.3i", "1.4TDCi", "1.8D"],
    },
    {
      name: "Freestar",
      variants: ["4.2"],
    },
    {
      name: "Windstar",
      variants: ["3.0", "3.0 GL", "3.0 SEL", "3.8 LX", "3.8 SEL"],
    },
  ];

  let totalModels = 0;
  let totalVariants = 0;

  for (const modelData of models) {
    // Model oluştur veya bul
    let model = await prisma.model.findFirst({
      where: {
        name: modelData.name,
        brandId: ford.id,
        categoryId: category.id,
      },
    });

    if (!model) {
      model = await prisma.model.create({
        data: {
          name: modelData.name,
          slug: modelData.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
          brandId: ford.id,
          categoryId: category.id,
        },
      });
      console.log(`  ✅ Model oluşturuldu: ${model.name}`);
      totalModels++;
    } else {
      console.log(`  ℹ️  Model zaten var: ${model.name}`);
    }

    // Varyantları ekle
    for (const variantName of modelData.variants) {
      const existingVariant = await prisma.variant.findFirst({
        where: {
          name: variantName,
          modelId: model.id,
        },
      });

      if (!existingVariant) {
        await prisma.variant.create({
          data: {
            name: variantName,
            slug: variantName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            modelId: model.id,
          },
        });
        console.log(`    ✅ Varyant eklendi: ${variantName}`);
        totalVariants++;
      } else {
        console.log(`    ℹ️  Varyant zaten var: ${variantName}`);
      }
    }

    console.log();
  }

  console.log(`\n🎉 İşlem tamamlandı!`);
  console.log(
    `📊 Toplam ${totalModels} model ve ${totalVariants} varyant eklendi.\n`
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
