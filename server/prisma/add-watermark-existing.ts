/**
 * Mevcut ilanların fotoğraflarına trucksbus.com filigranı ekler.
 * Kullanım: cd server && npx ts-node prisma/add-watermark-existing.ts
 */
import { PrismaClient } from "@prisma/client";
import { applyWatermark } from "../src/utils/watermark";

const prisma = new PrismaClient();

async function main() {
    // Belirli ilanları veya tüm ilanları işle
    const targetAdIds = process.argv[2]
        ? process.argv[2].split(",").map(Number)
        : null;

    const where = targetAdIds ? { adId: { in: targetAdIds } } : {};

    const images = await prisma.adImage.findMany({
        where,
        select: { id: true, imageUrl: true, adId: true },
    });

    console.log(`📷 Toplam ${images.length} fotoğraf bulundu.`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const img of images) {
        try {
            const url = img.imageUrl;

            // Sadece base64 data URI olan görselleri işle
            const match = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
            if (!match) {
                skipped++;
                continue;
            }

            const mimetype = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, "base64");

            // Watermark ekle
            const watermarked = await applyWatermark(buffer);
            const newUrl = `data:image/jpeg;base64,${watermarked.toString("base64")}`;

            // Güncelle
            await prisma.adImage.update({
                where: { id: img.id },
                data: { imageUrl: newUrl },
            });

            updated++;
            if (updated % 10 === 0) {
                console.log(`  ✅ ${updated}/${images.length} işlendi...`);
            }
        } catch (err: any) {
            failed++;
            console.error(`  ❌ Ad ${img.adId} Image ID ${img.id} hata: ${err.message}`);
        }
    }

    console.log(`\n🏁 Tamamlandı!`);
    console.log(`  ✅ Güncellenen: ${updated}`);
    console.log(`  ⏩ Atlanan (URL): ${skipped}`);
    console.log(`  ❌ Hatalı: ${failed}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
