import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateUserTypes() {
  try {
    console.log("🔄 Updating user types based on role...");

    // Update corporate users
    const corporateResult = await prisma.user.updateMany({
      where: { role: "CORPORATE" },
      data: { userType: "corporate" },
    });

    console.log(`✅ Updated ${corporateResult.count} corporate users`);

    // Update individual users
    const individualResult = await prisma.user.updateMany({
      where: { role: "USER" },
      data: { userType: "individual" },
    });

    console.log(`✅ Updated ${individualResult.count} individual users`);

    // Verify results
    const verification = await prisma.user.groupBy({
      by: ["userType", "role"],
      _count: true,
    });

    console.log("\n📊 Verification results:");
    verification.forEach((item) => {
      console.log(
        `${item.role} role -> ${item.userType} type: ${item._count} users`
      );
    });
  } catch (error) {
    console.error("❌ Error updating user types:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserTypes();
