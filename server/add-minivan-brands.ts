const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MINIVAN_BRANDS = [
  "Askam",
  "BMC",
  "Centnro",
  "Chery",
  "Chevrolet",
  "Chrysler",
  "Citroen",
  "Dacia",
  "Daewoo",
  "Daihatsu",
  "DFM",
  "DESK",
  "DFSK",
  "Dodge",
  "FAW",
  "Fest",
  "Fiat",
  "Ford",
  "GAZ",
  "GMC",
  "HFKanuni",
  "Honda",
  "Hyundai",
  "Isuzu",
  "Iveco",
  "Kia",
  "Lancia",
  "LDV",
  "MAN",
  "Maxus",
  "Mazda",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Oldsmobile",
  "Opel",
  "Peugeot",
  "Piaggio",
  "Pontiac",
  "Proton",
  "Regal Raptor",
  "Renault",
  "Seat",
  "Skoda",
  "Skywell",
  "SsangYong",
  "Subaru",
  "Suzuki",
  "SWM",
  "Temsa",
  "Tenax",
  "Toyota",
  "Victory",
  "Volkswagen",
];

async function addMinivanBrands() {
  try {
    console.log("🚐 Minivan & Panelvan kategorisi için markalar ekleniyor...");

    // Get Minivan & Panelvan category
    const category = await prisma.category.findUnique({
      where: { slug: "minivan-panelvan" },
    });

    if (!category) {
      console.error("❌ Minivan & Panelvan kategorisi bulunamadı!");
      console.log("Önce kategoriyi ekleyin: npm run add-category");
      return;
    }

    console.log(`✅ Kategori bulundu: ${category.name} (ID: ${category.id})`);

    let addedCount = 0;
    let existingCount = 0;
    let linkedCount = 0;

    for (const brandName of MINIVAN_BRANDS) {
      try {
        // Create slug from brand name
        const slug = brandName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        // Check if brand exists
        let brand = await prisma.brand.findUnique({
          where: { slug },
        });

        if (!brand) {
          // Create brand if it doesn't exist
          brand = await prisma.brand.create({
            data: {
              name: brandName,
              slug: slug,
              isActive: true,
            },
          });
          console.log(`  ✅ Marka eklendi: ${brandName}`);
          addedCount++;
        } else {
          console.log(`  ℹ️  Marka zaten var: ${brandName}`);
          existingCount++;
        }

        // Link brand to category (if not already linked)
        const existingLink = await prisma.categoryBrand.findUnique({
          where: {
            categoryId_brandId: {
              categoryId: category.id,
              brandId: brand.id,
            },
          },
        });

        if (!existingLink) {
          await prisma.categoryBrand.create({
            data: {
              categoryId: category.id,
              brandId: brand.id,
            },
          });
          console.log(`     🔗 Kategoriye bağlandı`);
          linkedCount++;
        } else {
          console.log(`     🔗 Zaten bağlı`);
        }
      } catch (error) {
        console.error(`  ❌ Hata (${brandName}):`, error);
      }
    }

    console.log("\n📊 Özet:");
    console.log(`   Yeni eklenen markalar: ${addedCount}`);
    console.log(`   Zaten var olan markalar: ${existingCount}`);
    console.log(`   Kategoriye bağlanan: ${linkedCount}`);
    console.log(`   Toplam: ${MINIVAN_BRANDS.length} marka`);
  } catch (error) {
    console.error("❌ Hata:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addMinivanBrands()
  .then(() => {
    console.log("\n🎉 İşlem tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
