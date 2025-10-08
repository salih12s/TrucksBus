const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixCategoryBrands() {
  try {
    console.log("🔍 Checking CategoryBrand records...");

    // Use raw query to find orphaned records
    const orphanedRecords = await prisma.$queryRaw`
      SELECT cb.category_id, cb.brand_id
      FROM category_brands cb
      LEFT JOIN brands b ON cb.brand_id = b.id
      WHERE b.id IS NULL
    `;

    console.log(
      `📊 Found ${
        Array.isArray(orphanedRecords) ? orphanedRecords.length : 0
      } orphaned records`
    );

    if (Array.isArray(orphanedRecords) && orphanedRecords.length > 0) {
      console.log(`❌ Invalid records with missing brand:`);
      orphanedRecords.forEach((record: any) => {
        console.log(
          `   - CategoryID: ${record.category_id}, BrandID: ${record.brand_id}`
        );
      });

      console.log("\n🗑️  Deleting invalid records...");

      // Delete orphaned records
      const deleteResult = await prisma.$executeRaw`
        DELETE FROM category_brands
        WHERE brand_id NOT IN (SELECT id FROM brands)
      `;

      console.log(
        `\n✅ Cleanup complete! Deleted ${deleteResult} invalid records.`
      );
    } else {
      console.log("✅ No invalid records found. Database is clean!");
    }
  } catch (error) {
    console.error("❌ Error fixing CategoryBrand records:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixCategoryBrands()
  .then(() => {
    console.log("🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
