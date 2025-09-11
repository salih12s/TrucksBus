import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create categories
  const categories = [
    {
      name: "Minibüs & Midibüs",
      slug: "minibus-midibus",
      displayOrder: 1,
    },
    {
      name: "Kamyon & Kamyonet",
      slug: "kamyon-kamyonet",
      displayOrder: 2,
    },
    {
      name: "Otobüs",
      slug: "otobus",
      displayOrder: 3,
    },
    {
      name: "Dorse",
      slug: "dorse",
      displayOrder: 4,
    },
    {
      name: "Çekici",
      slug: "cekici",
      displayOrder: 5,
    },
    {
      name: "Karoser & Üst Yapı",
      slug: "karoser-ust-yapi",
      displayOrder: 6,
    },
    {
      name: "Römork",
      slug: "romork",
      displayOrder: 7,
    },
    {
      name: "Oto Kurtarıcı & Taşıyıcı",
      slug: "oto-kurtarici-tasiyici",
      displayOrder: 8,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`Created category: ${category.name}`);
  }

  // Create doping packages
  const dopingPackages = [
    {
      name: "Anasayfa Vitrini",
      description: "İlanınız anasayfada öne çıkarılır",
      features: ["Anasayfa vitrinde görünüm", "7 gün süreyle öne çıkarma", "Maksimum görünürlük"],
      price: 3000,
      originalPrice: 5679,
      duration: 7,
      isActive: true,
      icon: "home",
      color: "#1976d2",
    },
    {
      name: "Kategori Vitrini",
      description: "Kategori sayfasında öne çıkarılır",
      features: ["Kategori vitrinde görünüm", "5 gün süreyle öne çıkarma", "Kategori içinde üst sırada"],
      price: 1200,
      originalPrice: 1719,
      duration: 5,
      isActive: true,
      icon: "category",
      color: "#9c27b0",
    },
    {
      name: "Detaylı Arama Vitrini",
      description: "Arama sonuçlarında öne çıkarılır",
      features: ["Arama sonuçlarında üst sıra", "3 gün süreyle öne çıkarma", "Özel vurgulama"],
      price: 500,
      originalPrice: 679,
      duration: 3,
      isActive: true,
      icon: "search",
      color: "#ff9800",
    },
    {
      name: "Güncelim Dopingi",
      description: "İlanınız sürekli yenilenir",
      features: ["Günlük güncelleme", "Her gün üst sırada", "7 gün boyunca güncel"],
      price: 300,
      originalPrice: 449,
      duration: 7,
      isActive: true,
      icon: "refresh",
      color: "#4caf50",
    },
    {
      name: "Üst Sıradayım",
      description: "İlanınız sürekli üst sırada kalır",
      features: ["Sürekli üst sıra", "10 gün boyunca", "Premium görünüm"],
      price: 2000,
      originalPrice: 3359,
      duration: 10,
      isActive: true,
      icon: "trending_up",
      color: "#f44336",
    },
    {
      name: "Acil Acil",
      description: "İlanınız acil olarak işaretlenir",
      features: ["Acil etiketi", "Kırmızı vurgulama", "5 gün süreyle öne çıkarma"],
      price: 1000,
      originalPrice: 1349,
      duration: 5,
      isActive: true,
      icon: "priority_high",
      color: "#e91e63",
    },
  ];

  for (const dopingPackage of dopingPackages) {
    await prisma.dopingPackage.upsert({
      where: { name: dopingPackage.name },
      update: {},
      create: dopingPackage,
    });
    console.log(`Created doping package: ${dopingPackage.name}`);
  }

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
