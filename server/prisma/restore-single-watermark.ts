/**
 * Yedek veritabanından orijinal görselleri çekip TEK filigran uygular.
 * Kullanım: cd server && npx ts-node prisma/restore-single-watermark.ts
 */
import { PrismaClient } from "@prisma/client";
import { Client } from "pg";
import { applyWatermark } from "../src/utils/watermark";

const prisma = new PrismaClient();

// Yedek veritabanı bağlantısı
const backupClient = new Client({
    connectionString:
        "postgresql://postgres:12345@localhost:5432/trucksbus_backup",
});

async function main() {
    await backupClient.connect();
    console.log("✅ Yedek veritabanına bağlanıldı");

    // Yedekten tüm görselleri çek
    const backupResult = await backupClient.query(
        "SELECT id, image_url, ad_id, is_primary, display_order, alt_text FROM ad_images ORDER BY id",
    );

    const backupImages = backupResult.rows;
    console.log(`📷 Yedekte ${backupImages.length} görsel bulundu`);

    // Mevcut DB'deki görselleri çek
    const currentImages = await prisma.adImage.findMany({
        select: { id: true, adId: true },
        orderBy: { id: "asc" },
    });
    console.log(`📷 Mevcut DB'de ${currentImages.length} görsel var`);

    // ID eşleştirmesi ile güncelle
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const bImg of backupImages) {
        try {
            const imageUrl = bImg.image_url;

            // Sadece base64 görselleri işle
            const match = imageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
            if (!match) {
                skipped++;
                continue;
            }

            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, "base64");

            // Tek filigran uygula
            const watermarked = await applyWatermark(buffer);
            const newUrl = `data:image/jpeg;base64,${watermarked.toString("base64")}`;

            // Mevcut DB'deki aynı ID'li görseli güncelle
            await prisma.adImage.update({
                where: { id: bImg.id },
                data: { imageUrl: newUrl },
            });

            updated++;
            if (updated % 10 === 0) {
                console.log(`  ✅ ${updated}/${backupImages.length} işlendi...`);
            }
        } catch (err: any) {
            // ID bulunamadıysa (silinen görsel) atla
            if (err.code === "P2025") {
                skipped++;
                continue;
            }
            failed++;
            console.error(
                `  ❌ Image ID ${bImg.id} Ad ${bImg.ad_id} hata: ${err.message}`,
            );
        }
    }

    console.log(`\n🏁 Tamamlandı!`);
    console.log(`  ✅ Güncellenen: ${updated}`);
    console.log(`  ⏩ Atlanan: ${skipped}`);
    console.log(`  ❌ Hatalı: ${failed}`);

    await backupClient.end();
    process.exit(0);
}

main();
