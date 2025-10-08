const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixBMCVariants() {
  try {
    console.log("🔍 BMC Levend ve Megastar varyantları kontrol ediliyor...");

    // Get Minivan & Panelvan category
    const category = await prisma.category.findUnique({
      where: { slug: "minivan-panelvan" },
    });

    if (!category) {
      console.error("❌ Kategori bulunamadı!");
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

    // Get Levend and Megastar models
    const levendModel = await prisma.model.findFirst({
      where: {
        brandId: bmcBrand.id,
        categoryId: category.id,
        slug: "levend",
      },
      include: {
        variants: true,
      },
    });

    const megastarModel = await prisma.model.findFirst({
      where: {
        brandId: bmcBrand.id,
        categoryId: category.id,
        slug: "megastar",
      },
      include: {
        variants: true,
      },
    });

    // Correct variants for Levend
    const correctLevendVariants = ["1.8 Panel Van", "3.0 Panelvan"];

    // Correct variants for Megastar
    const correctMegastarVariants = [
      "290 V Kombi",
      "290 V Kombi Van",
      "290 V Panelvan",
      "360 VH Panelvan",
      "360 V Panelvan",
      "400 VH Panelvan",
    ];

    console.log("\n📋 Levend mevcut varyantlar:");
    if (levendModel) {
      levendModel.variants.forEach((v) => {
        console.log(`   - ${v.name} (${v.slug})`);
      });

      // Delete incorrect variants
      for (const variant of levendModel.variants) {
        if (!correctLevendVariants.includes(variant.name)) {
          await prisma.variant.delete({
            where: { id: variant.id },
          });
          console.log(`   ❌ Silindi: ${variant.name}`);
        }
      }
    }

    console.log("\n📋 Megastar mevcut varyantlar:");
    if (megastarModel) {
      megastarModel.variants.forEach((v) => {
        console.log(`   - ${v.name} (${v.slug})`);
      });

      // Delete incorrect variants
      for (const variant of megastarModel.variants) {
        if (!correctMegastarVariants.includes(variant.name)) {
          await prisma.variant.delete({
            where: { id: variant.id },
          });
          console.log(`   ❌ Silindi: ${variant.name}`);
        }
      }
    }

    console.log("\n✅ Temizleme tamamlandı!");
  } catch (error) {
    console.error("❌ Hata:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixBMCVariants()
  .then(() => {
    console.log("\n🎉 İşlem tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
