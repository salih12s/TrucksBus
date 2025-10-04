import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚗 Peugeot Rifter GT ekleniyor...\n");

  // 1. Kamyon & Kamyonet kategorisini bul
  const kamyonCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: "kamyon-kamyonet" },
        { name: "Kamyon & Kamyonet" },
        { id: 2 }, // ID: 2 (screenshot'tan görüldü)
      ],
    },
  });

  if (!kamyonCategory) {
    throw new Error("❌ Kamyon & Kamyonet kategorisi bulunamadı!");
  }

  console.log(
    `✅ Kategori bulundu: ${kamyonCategory.name} (ID: ${kamyonCategory.id})`
  );

  // 2. Peugeot markasını oluştur veya bul
  let peugeotBrand = await prisma.brand.findFirst({
    where: {
      slug: "peugeot",
    },
  });

  if (!peugeotBrand) {
    peugeotBrand = await prisma.brand.create({
      data: {
        name: "Peugeot",
        slug: "peugeot",
      },
    });
    console.log(`✅ Peugeot markası oluşturuldu (ID: ${peugeotBrand.id})`);
  } else {
    console.log(`✅ Peugeot markası zaten mevcut (ID: ${peugeotBrand.id})`);
  }

  // 3. Peugeot - Kamyon & Kamyonet ilişkisini oluştur
  const existingCategoryBrand = await prisma.categoryBrand.findFirst({
    where: {
      brandId: peugeotBrand.id,
      categoryId: kamyonCategory.id,
    },
  });

  if (!existingCategoryBrand) {
    await prisma.categoryBrand.create({
      data: {
        brandId: peugeotBrand.id,
        categoryId: kamyonCategory.id,
      },
    });
    console.log(`✅ Peugeot - Kamyon & Kamyonet ilişkisi oluşturuldu`);
  } else {
    console.log(`✅ Peugeot - Kamyon & Kamyonet ilişkisi zaten mevcut`);
  }

  // 4. Rifter modelini oluştur veya bul
  let rifterModel = await prisma.model.findFirst({
    where: {
      slug: "rifter",
      brandId: peugeotBrand.id,
      categoryId: kamyonCategory.id,
    },
  });

  if (!rifterModel) {
    rifterModel = await prisma.model.create({
      data: {
        name: "Rifter",
        slug: "rifter",
        brandId: peugeotBrand.id,
        categoryId: kamyonCategory.id,
      },
    });
    console.log(`✅ Rifter modeli oluşturuldu (ID: ${rifterModel.id})`);
  } else {
    console.log(`✅ Rifter modeli zaten mevcut (ID: ${rifterModel.id})`);
  }

  // 5. GT variantını oluştur veya bul
  let gtVariant = await prisma.variant.findFirst({
    where: {
      slug: "gt",
      modelId: rifterModel.id,
    },
  });

  if (!gtVariant) {
    gtVariant = await prisma.variant.create({
      data: {
        name: "GT",
        slug: "gt",
        modelId: rifterModel.id,
      },
    });
    console.log(`✅ GT variantı oluşturuldu (ID: ${gtVariant.id})`);
  } else {
    console.log(`✅ GT variantı zaten mevcut (ID: ${gtVariant.id})`);
  }

  console.log("\n🎉 İşlem tamamlandı!");
  console.log("\n📊 Özet:");
  console.log(`   Kategori: ${kamyonCategory.name}`);
  console.log(`   Marka: ${peugeotBrand.name}`);
  console.log(`   Model: ${rifterModel.name}`);
  console.log(`   Variant: ${gtVariant.name}`);
}

main()
  .catch((e) => {
    console.error("❌ Hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
