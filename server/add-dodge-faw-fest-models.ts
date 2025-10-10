import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Dodge, Faw ve Fest model ve varyantları ekleniyor...\n");

  // Minivan & Panelvan kategorisini bul
  const minivanCategory = await prisma.category.findFirst({
    where: {
      OR: [{ slug: "minivan-panelvan" }, { name: { contains: "Minivan" } }],
    },
  });

  if (!minivanCategory) {
    console.error("❌ Minivan & Panelvan kategorisi bulunamadı!");
    return;
  }

  console.log(
    `✅ Kategori bulundu: ${minivanCategory.name} (ID: ${minivanCategory.id})\n`
  );

  // ==================== DODGE ====================
  console.log("📦 DODGE modelleri ekleniyor...");

  const dodgeBrand = await prisma.brand.findFirst({
    where: { name: "Dodge" },
  });

  if (!dodgeBrand) {
    console.error("❌ Dodge markası bulunamadı!");
    return;
  }

  // Grand Caravan modeli
  let grandCaravan = await prisma.model.findFirst({
    where: {
      name: "Grand Caravan",
      brandId: dodgeBrand.id,
      categoryId: minivanCategory.id,
    },
  });

  if (!grandCaravan) {
    grandCaravan = await prisma.model.create({
      data: {
        name: "Grand Caravan",
        slug: "grand-caravan",
        brandId: dodgeBrand.id,
        categoryId: minivanCategory.id,
      },
    });
    console.log(`✅ Model oluşturuldu: Grand Caravan`);
  } else {
    console.log(`✅ Model zaten mevcut: Grand Caravan`);
  }

  // Grand Caravan varyantları
  const grandCaravanVariants = [
    "2.4 L",
    "ES 3.3",
    "LE 3.3",
    "LE 3.8",
    "Wagon 3.0",
  ];

  for (const variantName of grandCaravanVariants) {
    const existing = await prisma.variant.findFirst({
      where: { name: variantName, modelId: grandCaravan.id },
    });

    if (!existing) {
      await prisma.variant.create({
        data: {
          name: variantName,
          slug: variantName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/\./g, "-"),
          modelId: grandCaravan.id,
        },
      });
      console.log(`  ✅ Varyant eklendi: ${variantName}`);
    } else {
      console.log(`  ⏭️  Varyant zaten mevcut: ${variantName}`);
    }
  }

  // Ram modeli
  let ram = await prisma.model.findFirst({
    where: {
      name: "Ram",
      brandId: dodgeBrand.id,
      categoryId: minivanCategory.id,
    },
  });

  if (!ram) {
    ram = await prisma.model.create({
      data: {
        name: "Ram",
        slug: "ram",
        brandId: dodgeBrand.id,
        categoryId: minivanCategory.id,
      },
    });
    console.log(`✅ Model oluşturuldu: Ram`);
  } else {
    console.log(`✅ Model zaten mevcut: Ram`);
  }

  // Ram varyantları
  const ramVariants = ["1500", "2500", "3500"];

  for (const variantName of ramVariants) {
    const existing = await prisma.variant.findFirst({
      where: { name: variantName, modelId: ram.id },
    });

    if (!existing) {
      await prisma.variant.create({
        data: {
          name: variantName,
          slug: variantName.toLowerCase().replace(/\s+/g, "-"),
          modelId: ram.id,
        },
      });
      console.log(`  ✅ Varyant eklendi: ${variantName}`);
    } else {
      console.log(`  ⏭️  Varyant zaten mevcut: ${variantName}`);
    }
  }

  // ==================== FAW ====================
  console.log("\n📦 FAW modelleri ekleniyor...");

  const fawBrand = await prisma.brand.findFirst({
    where: {
      OR: [{ name: "Faw" }, { name: "FAW" }, { slug: "faw" }],
    },
  });

  if (!fawBrand) {
    console.error("❌ Faw markası bulunamadı!");
    return;
  }

  // Actis modeli
  let actis = await prisma.model.findFirst({
    where: {
      name: "Actis",
      brandId: fawBrand.id,
      categoryId: minivanCategory.id,
    },
  });

  if (!actis) {
    actis = await prisma.model.create({
      data: {
        name: "Actis",
        slug: "actis",
        brandId: fawBrand.id,
        categoryId: minivanCategory.id,
      },
    });
    console.log(`✅ Model oluşturuldu: Actis`);
  } else {
    console.log(`✅ Model zaten mevcut: Actis`);
  }

  // Actis varyantı
  const actisVariant = "V70";
  const existingActisVariant = await prisma.variant.findFirst({
    where: { name: actisVariant, modelId: actis.id },
  });

  if (!existingActisVariant) {
    await prisma.variant.create({
      data: {
        name: actisVariant,
        slug: actisVariant.toLowerCase(),
        modelId: actis.id,
      },
    });
    console.log(`  ✅ Varyant eklendi: ${actisVariant}`);
  } else {
    console.log(`  ⏭️  Varyant zaten mevcut: ${actisVariant}`);
  }

  // CA5024 modeli
  let ca5024 = await prisma.model.findFirst({
    where: {
      name: "CA5024",
      brandId: fawBrand.id,
      categoryId: minivanCategory.id,
    },
  });

  if (!ca5024) {
    ca5024 = await prisma.model.create({
      data: {
        name: "CA5024",
        slug: "ca5024",
        brandId: fawBrand.id,
        categoryId: minivanCategory.id,
      },
    });
    console.log(`✅ Model oluşturuldu: CA5024`);
  } else {
    console.log(`✅ Model zaten mevcut: CA5024`);
  }

  // CA5024 varyantları
  const ca5024Variants = ["A2", "A4"];

  for (const variantName of ca5024Variants) {
    const existing = await prisma.variant.findFirst({
      where: { name: variantName, modelId: ca5024.id },
    });

    if (!existing) {
      await prisma.variant.create({
        data: {
          name: variantName,
          slug: variantName.toLowerCase(),
          modelId: ca5024.id,
        },
      });
      console.log(`  ✅ Varyant eklendi: ${variantName}`);
    } else {
      console.log(`  ⏭️  Varyant zaten mevcut: ${variantName}`);
    }
  }

  // ==================== FEST ====================
  console.log("\n📦 FEST modelleri ekleniyor...");

  const festBrand = await prisma.brand.findFirst({
    where: { name: "Fest" },
  });

  if (!festBrand) {
    console.error("❌ Fest markası bulunamadı!");
    return;
  }

  // E-Box modeli
  let ebox = await prisma.model.findFirst({
    where: {
      name: "E-Box",
      brandId: festBrand.id,
      categoryId: minivanCategory.id,
    },
  });

  if (!ebox) {
    ebox = await prisma.model.create({
      data: {
        name: "E-Box",
        slug: "e-box",
        brandId: festBrand.id,
        categoryId: minivanCategory.id,
      },
    });
    console.log(`✅ Model oluşturuldu: E-Box`);
  } else {
    console.log(`✅ Model zaten mevcut: E-Box`);
  }

  // E-Box varyantı
  const eboxVariant = "M";
  const existingEboxVariant = await prisma.variant.findFirst({
    where: { name: eboxVariant, modelId: ebox.id },
  });

  if (!existingEboxVariant) {
    await prisma.variant.create({
      data: {
        name: eboxVariant,
        slug: eboxVariant.toLowerCase(),
        modelId: ebox.id,
      },
    });
    console.log(`  ✅ Varyant eklendi: ${eboxVariant}`);
  } else {
    console.log(`  ⏭️  Varyant zaten mevcut: ${eboxVariant}`);
  }

  console.log(
    "\n✅ Tüm Dodge, Faw ve Fest modelleri ve varyantları başarıyla eklendi!"
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
