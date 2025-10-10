import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Fiat modellerini ve varyantlarını kontrol ediliyor...\n");

  const category = await prisma.category.findFirst({
    where: { slug: "minivan-panelvan" },
  });

  if (!category) {
    console.error("❌ Minivan & Panelvan kategorisi bulunamadı");
    return;
  }

  const fiatBrand = await prisma.brand.findFirst({
    where: { slug: "fiat" },
  });

  if (!fiatBrand) {
    console.error("❌ Fiat markası bulunamadı");
    return;
  }

  const models = await prisma.model.findMany({
    where: {
      brandId: fiatBrand.id,
      categoryId: category.id,
    },
    include: {
      variants: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  console.log(`📊 Fiat - Toplam ${models.length} model bulundu:\n`);

  let totalVariants = 0;

  models.forEach((model) => {
    console.log(`\n✅ ${model.name} (${model.variants.length} varyant):`);
    model.variants.forEach((variant) => {
      console.log(`   - ${variant.name}`);
      totalVariants++;
    });
  });

  console.log(
    `\n\n📈 TOPLAM: ${models.length} model, ${totalVariants} varyant`
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
