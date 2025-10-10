import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Dodge, Faw ve Fest modelleri kontrol ediliyor...\n");

  const minivanCategory = await prisma.category.findFirst({
    where: {
      OR: [{ slug: "minivan-panelvan" }, { name: { contains: "Minivan" } }],
    },
  });

  if (!minivanCategory) {
    console.error("❌ Minivan & Panelvan kategorisi bulunamadı!");
    return;
  }

  const brands = ["Dodge", "FAW", "Fest"];
  let totalModels = 0;
  let totalVariants = 0;

  for (const brandName of brands) {
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [{ name: brandName }, { slug: brandName.toLowerCase() }],
      },
    });

    if (!brand) {
      console.log(`❌ ${brandName} markası bulunamadı!\n`);
      continue;
    }

    const models = await prisma.model.findMany({
      where: {
        brandId: brand.id,
        categoryId: minivanCategory.id,
      },
      include: {
        variants: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`📦 ${brandName.toUpperCase()} - ${models.length} model`);
    totalModels += models.length;

    for (const model of models) {
      console.log(`  📋 ${model.name} (${model.variants.length} varyant)`);
      totalVariants += model.variants.length;

      for (const variant of model.variants) {
        console.log(`    - ${variant.name}`);
      }
    }
    console.log("");
  }

  console.log("📊 TOPLAM ÖZET:");
  console.log(`   Toplam Model: ${totalModels}`);
  console.log(`   Toplam Varyant: ${totalVariants}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
