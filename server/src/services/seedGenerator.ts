/**
 * MarketPriceSeed Otomatik Üretici
 *
 * priceRules.ts'deki mevcut kurallardan MarketPriceSeed tablosunu doldurur.
 * Kategori bazlı (marka/model yok, genel referans fiyat).
 *
 * Kullanım: npx ts-node src/services/seedGenerator.ts
 */

import { PrismaClient } from "@prisma/client";
import { PRICE_RULES } from "../config/priceRules";

const prisma = new PrismaClient();

/**
 * Slug → DB kategori ID eşleştirmesi yap, seed kayıtlarını üret
 */
async function generateMarketPriceSeeds(): Promise<void> {
    console.log("🌱 MarketPriceSeed üretimi başlıyor...\n");

    // Mevcut kategorileri DB'den çek (slug → id)
    const categories = await prisma.category.findMany({
        select: { id: true, slug: true },
    });

    const slugToId: Record<string, number> = {};
    for (const cat of categories) {
        slugToId[cat.slug] = cat.id;
    }

    let created = 0;
    let skipped = 0;

    for (const rule of PRICE_RULES) {
        // Her rule'un slug'larından ilk eşleşeni bul
        let categoryId: number | null = null;
        let matchedSlug = "";

        for (const slug of rule.slugs) {
            if (slugToId[slug] !== undefined) {
                categoryId = slugToId[slug];
                matchedSlug = slug;
                break;
            }
        }

        if (categoryId === null) {
            console.log(`  ⚠️ ${rule.label}: Kategori bulunamadı (slugs: ${rule.slugs.join(", ")})`);
            skipped += rule.ranges.length;
            continue;
        }

        const catIdStr = String(categoryId);

        for (const range of rule.ranges) {
            // avgPrice = (min + max) / 2
            const avgPrice = Math.round((range.minPrice + range.maxPrice) / 2);

            // Mevcut kayıt var mı kontrol et (duplicate önleme)
            const existing = await prisma.marketPriceSeed.findFirst({
                where: {
                    categoryId: catIdStr,
                    brandId: null,
                    modelId: null,
                    yearFrom: range.yearMin,
                    yearTo: range.yearMax,
                },
            });

            if (existing) {
                // Güncelle (fiyatlar değişmiş olabilir)
                await prisma.marketPriceSeed.update({
                    where: { id: existing.id },
                    data: {
                        minPrice: range.minPrice,
                        maxPrice: range.maxPrice,
                        avgPrice,
                    },
                });
                console.log(`  ✏️ ${rule.label} (${range.yearMin}-${range.yearMax}): güncellendi → avg ${avgPrice.toLocaleString("tr-TR")} ₺`);
                skipped++;
            } else {
                await prisma.marketPriceSeed.create({
                    data: {
                        categoryId: catIdStr,
                        brandId: null,
                        modelId: null,
                        yearFrom: range.yearMin,
                        yearTo: range.yearMax,
                        minPrice: range.minPrice,
                        maxPrice: range.maxPrice,
                        avgPrice,
                    },
                });
                console.log(`  ✅ ${rule.label} (${range.yearMin}-${range.yearMax}): oluşturuldu → avg ${avgPrice.toLocaleString("tr-TR")} ₺`);
                created++;
            }
        }
    }

    console.log(`\n📊 Sonuç: ${created} yeni kayıt, ${skipped} güncelleme/atlanma`);
}

// Direkt çalıştırılırsa
if (require.main === module) {
    generateMarketPriceSeeds()
        .then(() => {
            console.log("✅ MarketPriceSeed üretimi tamamlandı!");
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ Seed üretimi hatası:", err);
            process.exit(1);
        })
        .finally(() => prisma.$disconnect());
}

export { generateMarketPriceSeeds };
