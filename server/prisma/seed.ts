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
      name: "Temel Paket",
      description: "Araç ilanınızı daha görünür kılın",
      features: ["3 gün öne çıkarma", "Özel renk vurgulama", "Temel destek"],
      price: 29.99,
      originalPrice: 39.99,
      duration: 3,
      isActive: true,
      icon: "rocket",
      color: "#1976d2",
    },
    {
      name: "Standart Paket",
      description: "Daha fazla görünürlük ve özellik",
      features: [
        "7 gün öne çıkarma",
        "Premium vurgulama",
        "Öncelikli listeleme",
        "E-posta bildirimleri",
      ],
      price: 49.99,
      originalPrice: 69.99,
      duration: 7,
      isActive: true,
      icon: "star",
      color: "#9c27b0",
    },
    {
      name: "Premium Paket",
      description: "Maksimum görünürlük garantisi",
      features: [
        "15 gün öne çıkarma",
        "Altın çerçeve",
        "Ana sayfa öne çıkarma",
        "SMS bildirimleri",
        "Öncelikli destek",
      ],
      price: 79.99,
      originalPrice: 99.99,
      duration: 15,
      isActive: true,
      icon: "crown",
      color: "#ff9800",
    },
    {
      name: "Süper Paket",
      description: "Profesyonel satıcılar için",
      features: [
        "30 gün öne çıkarma",
        "Platinyum çerçeve",
        "Kategoride ilk sıra",
        "Whatsapp desteği",
        "7/24 destek",
      ],
      price: 129.99,
      originalPrice: 159.99,
      duration: 30,
      isActive: true,
      icon: "diamond",
      color: "#4caf50",
    },
    {
      name: "Ultra Paket",
      description: "En üst düzey görünürlük",
      features: [
        "60 gün öne çıkarma",
        "Özel tasarım çerçeve",
        "Tüm sayfalarda öne çıkarma",
        "Kişisel danışman",
        "Ücretsiz ek hizmetler",
      ],
      price: 199.99,
      originalPrice: 249.99,
      duration: 60,
      isActive: true,
      icon: "fire",
      color: "#f44336",
    },
    {
      name: "Mega Paket",
      description: "Galeri sahipleri için özel",
      features: [
        "90 gün öne çıkarma",
        "VIP işaretleme",
        "Anasayfa banner",
        "Sosyal medya paylaşımı",
        "Pazarlama desteği",
        "Özel raporlama",
      ],
      price: 299.99,
      originalPrice: 399.99,
      duration: 90,
      isActive: true,
      icon: "thunderbolt",
      color: "#2196f3",
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
