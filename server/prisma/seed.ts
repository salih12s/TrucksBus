import { PrismaClient } from "@prisma/client";
import { seedDopingPackages } from "./doping-packages-seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  await seedDopingPackages();

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
