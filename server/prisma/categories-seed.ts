import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Kategoriler ekleniyor...");

  // Kategorileri sırayla ekle
  const categories = [
    {
      name: "Minibüs & Midibüs",
      slug: "minibus-midibus",
      iconUrl: "/CategoryImage/minibus-midibus.png",
      description: "Minibüs ve midibüs araçları",
      displayOrder: 1,
    },
    {
      name: "Kamyon & Kamyonet",
      slug: "kamyon-kamyonet",
      iconUrl: "/CategoryImage/KamyonKamyonet.png",
      description: "Kamyon ve kamyonet araçları",
      displayOrder: 2,
    },
    {
      name: "Karoser & Üst Yapı",
      slug: "karoser-ust-yapi",
      iconUrl: "/CategoryImage/karoser-ust-yapi.png",
      description: "Karoser ve üst yapı hizmetleri",
      displayOrder: 3,
    },
    {
      name: "Dorse",
      slug: "dorse",
      iconUrl: "/CategoryImage/Dorse.png",
      description: "Dorse araçları",
      displayOrder: 4,
    },
    {
      name: "Çekici",
      slug: "cekici",
      iconUrl: "/CategoryImage/cekici.png",
      description: "Çekici araçları",
      displayOrder: 5,
    },
    {
      name: "Otobüs",
      slug: "otobus",
      iconUrl: "/CategoryImage/otobus.png",
      description: "Otobüs araçları",
      displayOrder: 6,
    },
    {
      name: "Oto Kurtarıcı & Taşıyıcı",
      slug: "oto-kurtarici-tasiyici",
      iconUrl: "/CategoryImage/oto-kurtarici-tasiyici.png",
      description: "Oto kurtarıcı ve taşıyıcı araçları",
      displayOrder: 7,
    },
    {
      name: "Römork",
      slug: "romork",
      iconUrl: "/CategoryImage/romork.png",
      description: "Römork araçları",
      displayOrder: 8,
    },
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ ${category.name} kategorisi eklendi`);
    } else {
      console.log(`⚠️ ${category.name} kategorisi zaten mevcut`);
    }
  }

  console.log("🎉 Tüm kategoriler başarıyla işlendi!");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
