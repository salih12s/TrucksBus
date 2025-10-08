const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addMinivanModels() {
  try {
    console.log("🚐 Minivan & Panelvan modelleri ekleniyor...");

    // Get Minivan & Panelvan category
    const category = await prisma.category.findUnique({
      where: { slug: "minivan-panelvan" },
    });

    if (!category) {
      console.error("❌ Minivan & Panelvan kategorisi bulunamadı!");
      return;
    }

    console.log(`✅ Kategori: ${category.name} (ID: ${category.id})\n`);

    // ASKAM - Fargo Fora
    console.log("📦 ASKAM markaları işleniyor...");
    const askamBrand = await prisma.brand.findFirst({
      where: { name: "Askam" },
    });

    if (askamBrand) {
      // Fargo Fora Model
      const fargoForaModel = await prisma.model.upsert({
        where: {
          brandId_categoryId_slug: {
            brandId: askamBrand.id,
            categoryId: category.id,
            slug: "fargo-fora",
          },
        },
        update: {},
        create: {
          brandId: askamBrand.id,
          categoryId: category.id,
          name: "Fargo Fora",
          slug: "fargo-fora",
          isActive: true,
        },
      });
      console.log(`  ✅ Model: ${fargoForaModel.name}`);

      // Fargo Fora Variants
      const fargoForaVariants = ["2.5 CDI Kısa Şasi", "2.5 CDI uzun Şasi"];

      for (const variantName of fargoForaVariants) {
        const variantSlug = variantName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        await prisma.variant.upsert({
          where: {
            modelId_slug: {
              modelId: fargoForaModel.id,
              slug: variantSlug,
            },
          },
          update: {},
          create: {
            modelId: fargoForaModel.id,
            name: variantName,
            slug: variantSlug,
            isActive: true,
          },
        });
        console.log(`     ✅ Varyant: ${variantName}`);
      }
    }

    // BMC - Levend
    console.log("\n📦 BMC markaları işleniyor...");
    const bmcBrand = await prisma.brand.findFirst({
      where: { name: "BMC" },
    });

    if (bmcBrand) {
      // Levend Model
      const levendModel = await prisma.model.upsert({
        where: {
          brandId_categoryId_slug: {
            brandId: bmcBrand.id,
            categoryId: category.id,
            slug: "levend",
          },
        },
        update: {},
        create: {
          brandId: bmcBrand.id,
          categoryId: category.id,
          name: "Levend",
          slug: "levend",
          isActive: true,
        },
      });
      console.log(`  ✅ Model: ${levendModel.name}`);

      // Levend Variants
      const levendVariants = ["1.8 Panel Van", "3.0 Panelvan"];

      for (const variantName of levendVariants) {
        const variantSlug = variantName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        await prisma.variant.upsert({
          where: {
            modelId_slug: {
              modelId: levendModel.id,
              slug: variantSlug,
            },
          },
          update: {},
          create: {
            modelId: levendModel.id,
            name: variantName,
            slug: variantSlug,
            isActive: true,
          },
        });
        console.log(`     ✅ Varyant: ${variantName}`);
      }

      // Megastar Model
      const megastarModel = await prisma.model.upsert({
        where: {
          brandId_categoryId_slug: {
            brandId: bmcBrand.id,
            categoryId: category.id,
            slug: "megastar",
          },
        },
        update: {},
        create: {
          brandId: bmcBrand.id,
          categoryId: category.id,
          name: "Megastar",
          slug: "megastar",
          isActive: true,
        },
      });
      console.log(`  ✅ Model: ${megastarModel.name}`);

      // Megastar Variants
      const megastarVariants = [
        "290 V Kombi",
        "290 V Kombi Van",
        "290 V Panelvan",
        "360 VH Panelvan",
        "360 V Panelvan",
        "400 VH Panelvan",
      ];

      for (const variantName of megastarVariants) {
        const variantSlug = variantName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        await prisma.variant.upsert({
          where: {
            modelId_slug: {
              modelId: megastarModel.id,
              slug: variantSlug,
            },
          },
          update: {},
          create: {
            modelId: megastarModel.id,
            name: variantName,
            slug: variantSlug,
            isActive: true,
          },
        });
        console.log(`     ✅ Varyant: ${variantName}`);
      }
    }

    console.log("\n📊 Özet:");
    console.log("   ASKAM: 1 model (Fargo Fora), 2 varyant");
    console.log("   BMC: 2 model (Levend, Megastar), 8 varyant");
    console.log("   Toplam: 3 model, 10 varyant");
  } catch (error) {
    console.error("❌ Hata:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addMinivanModels()
  .then(() => {
    console.log("\n🎉 İşlem tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
