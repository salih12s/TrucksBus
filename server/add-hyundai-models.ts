import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Hyundai modelleri ve varyantları ekleniyor...\n");

  // Minivan & Panelvan kategorisini bul
  const category = await prisma.category.findFirst({
    where: { slug: "minivan-panelvan" },
  });

  if (!category) {
    throw new Error("Minivan & Panelvan kategorisi bulunamadı!");
  }

  console.log(`✅ Kategori bulundu: ${category.name} (ID: ${category.id})\n`);

  // Hyundai markasını bul
  const hyundai = await prisma.brand.findFirst({
    where: { slug: "hyundai" },
  });

  if (!hyundai) {
    throw new Error("Hyundai markası bulunamadı!");
  }

  console.log(`✅ Marka bulundu: ${hyundai.name} (ID: ${hyundai.id})\n`);

  // Modeller ve varyantlar
  const modelsData = [
    {
      name: "H 100",
      variants: [
        "2.5 Camlıvan",
        "2.5 D DLX Camlıvan",
        "2.5 D DLX Panelvan",
        "2.5 D STD Camlıvan",
        "2.5 D STD Panelvan",
        "2.5 Grand Salon",
        "2.5 Panelvan",
        "2.5 SPR",
        "2.5 STD",
        "2.5 STD PAS PL",
        "2.5 T/C",
        "2.5 TCI",
        "2.6 D PAS",
        "2.6 D PL",
        "2.6 D SPR",
        "2.6 D STD",
      ],
    },
    {
      name: "H 200",
      variants: ["2.5 DLX"],
    },
    {
      name: "H 350",
      variants: ["2.5 CRDi"],
    },
    {
      name: "H 1",
      variants: [
        "2.5 VGT AJ-Select",
        "2.5 VGT AJ-Start",
        "2.5 VGT AJ-Style",
        "2.5 VGT AJ-Team",
        "2.5 VGT Crew Select",
        "2.5 VGT Crew Start",
        "2.5 VGT Crew Style",
        "2.5 VGT Crew Team",
        "2.5 VGT Harmony Select",
        "2.5 VGT Harmony Start",
        "2.5 VGT Harmony Style",
        "2.5 VGT Harmony Team",
        "2.5 VGT Panorama Select",
        "2.5 VGT Panorama Start",
        "2.5 VGT Panorama Style",
        "2.5 VGT Panorama Team",
        "2.5 VGT Select",
        "2.5 VGT Start",
        "2.5 VGT Style",
        "2.5 VGT Team",
        "2.5 VGT Workstar",
        "2.5 VGT Workstar S",
        "2.5 VGT Workstar Select",
        "2.5 VGT Workstar Start",
        "2.5 VGT Workstar Style",
        "2.5 VGT Workstar Team",
      ],
    },
    {
      name: "Starex",
      variants: ["Cargovan", "Multiway", "Space", "Camlı Van", "Panelvan"],
    },
    {
      name: "Staria",
      variants: ["1.6 T-GDI Elite", "2.2 CRDi Elite", "2.2 CRDi Prime"],
    },
  ];

  let totalModels = 0;
  let totalVariants = 0;

  for (const modelData of modelsData) {
    console.log(`\n📦 Model: ${modelData.name}`);

    // Model ekle veya bul
    let model = await prisma.model.findFirst({
      where: {
        name: modelData.name,
        brandId: hyundai.id,
        categoryId: category.id,
      },
    });

    if (!model) {
      model = await prisma.model.create({
        data: {
          name: modelData.name,
          slug: modelData.name.toLowerCase().replace(/\s+/g, "-"),
          brandId: hyundai.id,
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
            slug: variantName.toLowerCase().replace(/\s+/g, "-"),
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

  console.log(`\n✅ İşlem tamamlandı!`);
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
