import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create categories
  const categories = [
    {
      name: "Çekici",
      slug: "cekici",
      displayOrder: 1,
    },
    {
      name: "Dorse",
      slug: "dorse",
      displayOrder: 2,
    },
    {
      name: "Kamyon & Kamyonet",
      slug: "kamyon-kamyonet",
      displayOrder: 3,
    },
    {
      name: "Karoser & Üst Yapı",
      slug: "karoser-ust-yapi",
      displayOrder: 4,
    },
    {
      name: "Minibüs & Midibüs",
      slug: "minibus-midibus",
      displayOrder: 5,
    },
    {
      name: "Otobüs",
      slug: "otobus",
      displayOrder: 6,
    },
    {
      name: "Oto Kurtarıcı & Taşıyıcı",
      slug: "oto-kurtarici-tasiyici",
      displayOrder: 7,
    },
    {
      name: "Römork",
      slug: "romork",
      displayOrder: 8,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // Create some sample brands
  const brands = [
    { name: "Mercedes-Benz", slug: "mercedes-benz" },
    { name: "Volvo", slug: "volvo" },
    { name: "Scania", slug: "scania" },
    { name: "MAN", slug: "man" },
    { name: "Iveco", slug: "iveco" },
    { name: "DAF", slug: "daf" },
    { name: "Renault", slug: "renault" },
    { name: "Ford", slug: "ford" },
    { name: "Isuzu", slug: "isuzu" },
    { name: "Mitsubishi", slug: "mitsubishi" },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }

  console.log(`✅ Created ${brands.length} brands`);

  // Create admin user
  const bcrypt = require("bcryptjs");
  const adminPassword = await bcrypt.hash("Saydam8181!", 12);

  await prisma.user.upsert({
    where: { email: "selocan81@codlean.com" },
    update: {},
    create: {
      email: "selocan81@codlean.com",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    },
  });

  console.log("✅ Created admin user (selocan81@codlean.com / Saydam8181!)");

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
