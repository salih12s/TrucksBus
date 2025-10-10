import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Hyundai modelleri kontrol ediliyor...\n");

  const hyundai = await prisma.brand.findFirst({
    where: { slug: "hyundai" },
    include: {
      models: {
        include: {
          variants: true,
        },
      },
    },
  });

  if (!hyundai) {
    console.log("❌ Hyundai markası bulunamadı!");
    return;
  }

  console.log(`✅ Marka: ${hyundai.name}\n`);

  let totalVariants = 0;

  hyundai.models.forEach((model) => {
    console.log(`📦 ${model.name} (${model.variants.length} varyant)`);
    model.variants.forEach((variant) => {
      console.log(`   - ${variant.name}`);
      totalVariants++;
    });
    console.log("");
  });

  console.log(`📊 ÖZET:`);
  console.log(`   Toplam Model: ${hyundai.models.length}`);
  console.log(`   Toplam Varyant: ${totalVariants}`);
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
