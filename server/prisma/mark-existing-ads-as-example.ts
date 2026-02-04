/**
 * Migration Script: Mevcut tüm ilanları "örnek ilan" olarak işaretle
 *
 * Kullanım:
 * cd server
 * npx ts-node prisma/mark-existing-ads-as-example.ts
 *
 * Bu script bir kez çalıştırılmalıdır.
 * Bundan sonra oluşturulan yeni ilanlar varsayılan olarak isExample: false olacaktır.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Mevcut ilanlar 'ÖRNEKTİR' olarak işaretleniyor...\n");

  // Mevcut tüm ilanların sayısını al
  const totalAds = await prisma.ad.count();
  console.log(`📊 Toplam ilan sayısı: ${totalAds}`);

  // Tüm ilanları isExample: true olarak güncelle
  const result = await prisma.ad.updateMany({
    where: {
      isExample: false, // Sadece henüz işaretlenmemiş olanları güncelle
    },
    data: {
      isExample: true,
    },
  });

  console.log(`✅ ${result.count} ilan 'ÖRNEKTİR' olarak işaretlendi.`);
  console.log(
    "\n📌 Bundan sonra oluşturulan yeni ilanlar otomatik olarak isExample: false olacaktır.",
  );
  console.log("📌 Anasayfada bu ilanlarda 'ÖRNEKTİR' etiketi görünecektir.");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
