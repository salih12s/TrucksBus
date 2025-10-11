import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚐 Oldsmobile, Opel ve Peugeot modelleri ekleniyor...\n");

  // Kategoriyi bul
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: "minivan-panelvan" }, { name: { contains: "Minivan" } }],
    },
  });

  if (!category) {
    throw new Error("❌ Minivan & Panelvan kategorisi bulunamadı!");
  }

  console.log(`✅ Kategori bulundu: ${category.name} (ID: ${category.id})\n`);

  let totalModels = 0;
  let totalVariants = 0;

  // ========== OLDSMOBILE ==========
  const oldsmobile = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "oldsmobile" },
        { name: { equals: "Oldsmobile", mode: "insensitive" } },
      ],
    },
  });

  if (oldsmobile) {
    console.log(`\n📦 ${oldsmobile.name.toUpperCase()} modelleri ekleniyor...`);

    const oldsmobileModels = [
      {
        name: "Silhouette",
        variants: ["3.8 V6"],
      },
    ];

    for (const modelData of oldsmobileModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: oldsmobile.id,
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
            brandId: oldsmobile.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

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
    }
  }

  // ========== OPEL ==========
  const opel = await prisma.brand.findFirst({
    where: {
      OR: [{ slug: "opel" }, { name: { equals: "Opel", mode: "insensitive" } }],
    },
  });

  if (opel) {
    console.log(`\n📦 ${opel.name.toUpperCase()} modelleri ekleniyor...`);

    const opelModels = [
      {
        name: "Combo",
        variants: [
          "1.3 CDTi City",
          "1.3 CDTi City Club",
          "1.3 CDTi City Plus",
          "1.3 CDTi Club",
          "1.3 CDTi Comfort",
          "1.4",
          "1.5 CDTi Edition",
          "1.5 CDTi Enjoy",
          "1.5 CDTi Enjoy Style",
          "1.5 CDTi Essentia",
          "1.5 CDTi Excellence",
          "1.5 CDTi Ultimate",
          "1.5 D Edition",
          "1.5 D Edition Plus",
          "1.5 D Essential",
          "1.5 D Ultimate",
          "1.5 D Ultimate XL",
          "1.6 CDTi City Plus",
          "1.6 Tour",
          "1.6 Tour Club",
          "1.6 Tour Comfort",
          "1.7 CDTi City Plus",
          "1.7 CDTi Comfort",
          "1.7 D",
          "1.7 DTi",
          "1.7 DTi City",
          "1.7 DTi Club",
          "1.7 DTi Comfort",
          "1.7 DTi Tour",
        ],
      },
      {
        name: "Combo Cargo",
        variants: [
          "1.5 D Edition",
          "1.5 D Elegance XL",
          "1.5 D Enjoy",
          "1.5 D Ultimate XL",
        ],
      },
      {
        name: "Combo Elektrik",
        variants: ["Edition"],
      },
      {
        name: "Combo Life",
        variants: ["1.5 D"],
      },
      {
        name: "e-Zafira",
        variants: ["Business"],
      },
      {
        name: "Movano",
        variants: [
          "1.9 DTi",
          "2.2 D",
          "2.5 CDTi",
          "2.5 CDTi Comfort",
          "2.5 D",
          "2.5 DTi",
          "2.8 DTi",
          "2.8 DTi Comfort",
        ],
      },
      {
        name: "Sintra",
        variants: ["2.2 DTİ GLS", "2.2 GLS"],
      },
      {
        name: "Vivaro",
        variants: [
          "1.5 TD Cargo Ultimate",
          "1.6 TD",
          "1.9 CDTi City Plus",
          "1.9 DTi",
          "1.9 DTi Combi",
          "2.0 CDTi",
          "2.0 TD Cargo Edition XL",
          "2.0 TD Cargo Elegance XL",
          "2.0 TD Cargo Ultimate",
          "2.0 TD Cargo Ultimate XL",
          "2.0 TD Cityvan Elegance XL",
          "2.0 TD Cityvan Ultimate XL",
        ],
      },
      {
        name: "Zafira",
        variants: ["2.0 D"],
      },
      {
        name: "Zafira Life",
        variants: ["Elegance XL", "Elegance XL"],
      },
      {
        name: "Astra Van",
        variants: [],
      },
      {
        name: "Corsa Van",
        variants: ["1.2", "1.3 CDTİ", "1.7 CDTi", "1.7 DTi"],
      },
    ];

    for (const modelData of opelModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: opel.id,
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
            brandId: opel.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

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
    }
  }

  // ========== PEUGEOT ==========
  const peugeot = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: "peugeot" },
        { name: { equals: "Peugeot", mode: "insensitive" } },
      ],
    },
  });

  if (peugeot) {
    console.log(`\n📦 ${peugeot.name.toUpperCase()} modelleri ekleniyor...`);

    const peugeotModels = [
      {
        name: "Bipper",
        variants: [
          "1.3 HDi",
          "1.3 HDi Comfort",
          "1.3 HDi Comfort Plus",
          "1.3 HDi Style",
          "1.4",
          "1.4 HDi",
          "1.4 HDi Aktif",
          "1.4 HDi Comfort",
          "1.4 HDi Comfort Pack",
          "1.4 HDi Comfort Plus",
          "1.4 HDi Connect Pack",
          "1.4 HDi Dinamik",
          "1.4 HDi Dinamik Plus",
          "1.4 HDi Elegance",
          "1.4 HDi Family",
          "1.4 HDi Outdoor",
          "1.4 HDi Outdoor Plus",
          "1.4 HDi Outdoor Style Pack",
          "1.4 HDi Sportif",
        ],
      },
      {
        name: "Boxer",
        variants: [
          "1.9 D (7.5 m3)",
          "2.0 (7.5 m3)",
          "2.0 D (7.5 m3)",
          "2.0 HDi (7.5 m3)",
          "2.0 HDi (15 m3)",
          "2.0 HDi (17 m3)",
          "2.2 HDi (7.5 m3)",
          "2.2 HDi (8 m3)",
          "2.2 HDi (10 m3)",
          "2.2 HDi (11.5 m3)",
          "2.2 HDi (13 m3)",
          "2.2 HDi (15 m3)",
          "2.2 HDi (17 m3)",
          "2.5 D (9 m3)",
          "2.5 D (10 m3)",
          "2.5 D (12 m3)",
          "2.5 TDI (10 m3)",
          "2.5 TDI (11.5 m3)",
          "2.8 D (12 m3)",
          "2.8 TDI (12 m3)",
          "2.8 TDI (13 m3)",
          "2.0 BlueHDi (13 m3)",
          "2.2 BlueHDi (11.5 m3)",
          "2.2 BlueHDi (13 m3)",
          "2.2 BlueHDi (15 m3)",
          "2.2 BlueHDi (17 m3)",
        ],
      },
      {
        name: "Expert",
        variants: [
          "1.5",
          "1.5 BlueHDi",
          "1.6",
          "1.6 BlueHDi",
          "1.6 HDi",
          "1.9 D",
          "2.0 BlueHDi",
          "2.0 HDi",
        ],
      },
      {
        name: "Expert Traveller",
        variants: ["2.0 BlueHDI"],
      },
      {
        name: "Partner",
        variants: [
          "1.4",
          "1.4 Break Pack",
          "1.4 Combi",
          "1.4 Combispace",
          "1.4 XR",
          "1.5 BlueHDi Comfort",
          "1.6 BlueHDi Active",
          "1.6 BlueHDi Allure",
          "1.6 BlueHDi Comfort",
          "1.6 BlueHDi Comfort Pack",
          "1.6 BlueHDi Zenith",
          "1.6 HDi",
          "1.6 HDi Access",
          "1.6 HDi Active",
          "1.6 HDi Adventure",
          "1.6 HDi Allure",
          "1.6 HDi Comfort",
          "1.6 HDi Comfort Pack",
          "1.6 HDi Outdoor",
          "1.6 HDi Premium",
          "1.6 HDi Premium Pack",
          "1.6 HDi Premium Style P.",
          "1.6 HDi Premium Zenith P.",
          "1.6 HDi Symbole",
          "1.6 Quiksilver",
          "1.6 Symbole",
          "1.6 XT",
          "1.9",
          "1.9 Comfort",
          "1.9 D",
          "1.9 D Comfort",
          "1.9 D Kombi",
          "1.9 Kombi",
          "2.0 HDi",
          "2.0 HDi Adventure",
          "2.0 HDi Comfort",
        ],
      },
      {
        name: "Rifter",
        variants: [
          "Active",
          "Active Comfort",
          "Active Pro",
          "Active SkyPack",
          "Allure",
          "GT",
          "GT Line",
          "Plus Allure",
          "Plus GT Line",
          "Active",
          "Active Comfort",
          "Active Stil",
        ],
      },
      {
        name: "206 Van",
        variants: ["1.1", "1.4 HDi"],
      },
      {
        name: "207 Van",
        variants: ["1.4 Van"],
      },
      {
        name: "J9",
        variants: ["Panelvan"],
      },
    ];

    for (const modelData of peugeotModels) {
      let model = await prisma.model.findFirst({
        where: {
          name: modelData.name,
          brandId: peugeot.id,
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
            brandId: peugeot.id,
            categoryId: category.id,
          },
        });
        console.log(`  ✅ Model oluşturuldu: ${model.name}`);
        totalModels++;
      } else {
        console.log(`  ℹ️  Model zaten var: ${model.name}`);
      }

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
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 TOPLAM ÖZET:");
  console.log(`   Yeni eklenen model sayısı: ${totalModels}`);
  console.log(`   Yeni eklenen varyant sayısı: ${totalVariants}`);
  console.log("=".repeat(50));
  console.log(
    "\n✅ Oldsmobile, Opel ve Peugeot modelleri başarıyla eklendi!\n"
  );
}

main()
  .catch((e) => {
    console.error("❌ Hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
