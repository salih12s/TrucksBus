const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkMinivanVariants() {
  try {
    console.log(
      "🔍 Minivan & Panelvan kategorisi varyantları kontrol ediliyor...\n"
    );

    // Get Minivan & Panelvan category
    const category = await prisma.category.findUnique({
      where: { slug: "minivan-panelvan" },
    });

    if (!category) {
      console.error("❌ Minivan & Panelvan kategorisi bulunamadı!");
      return;
    }

    // Get BMC brand
    const bmcBrand = await prisma.brand.findFirst({
      where: { name: "BMC" },
    });

    if (!bmcBrand) {
      console.error("❌ BMC markası bulunamadı!");
      return;
    }

    // Get all BMC models in Minivan category
    const bmcModels = await prisma.model.findMany({
      where: {
        brandId: bmcBrand.id,
        categoryId: category.id,
      },
      include: {
        variants: true,
      },
    });

    console.log("📦 BMC Minivan & Panelvan Modelleri:\n");

    for (const model of bmcModels) {
      console.log(`Model: ${model.name} (ID: ${model.id})`);
      console.log(`  Varyantlar (${model.variants.length} adet):`);

      if (model.variants.length === 0) {
        console.log("    ⚠️  Varyant yok!");
      } else {
        model.variants.forEach((variant: any, index: number) => {
          console.log(
            `    ${index + 1}. ${variant.name} (ID: ${variant.id}, Slug: ${
              variant.slug
            })`
          );
        });
      }
      console.log("");
    }

    // Get ASKAM brand
    const askamBrand = await prisma.brand.findFirst({
      where: { name: "Askam" },
    });

    if (askamBrand) {
      const askamModels = await prisma.model.findMany({
        where: {
          brandId: askamBrand.id,
          categoryId: category.id,
        },
        include: {
          variants: true,
        },
      });

      console.log("📦 ASKAM Minivan & Panelvan Modelleri:\n");

      for (const model of askamModels) {
        console.log(`Model: ${model.name} (ID: ${model.id})`);
        console.log(`  Varyantlar (${model.variants.length} adet):`);

        if (model.variants.length === 0) {
          console.log("    ⚠️  Varyant yok!");
        } else {
          model.variants.forEach((variant: any, index: number) => {
            console.log(
              `    ${index + 1}. ${variant.name} (ID: ${variant.id}, Slug: ${
                variant.slug
              })`
            );
          });
        }
        console.log("");
      }
    }
  } catch (error) {
    console.error("❌ Hata:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkMinivanVariants()
  .then(() => {
    console.log("✅ Kontrol tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Hata:", error);
    process.exit(1);
  });
