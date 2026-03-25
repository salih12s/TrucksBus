/**
 * Local DB'den seed-models.json dosyasını yeniden oluşturur.
 * Böylece localde eklenen yeni model/variant'lar Git'e push yapılınca
 * Railway deploy'unda seed.ts tarafından otomatik oluşturulur.
 *
 * Kullanım: cd server && npx ts-node prisma/export-seed-models.ts
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface SeedVariant {
    name: string;
    slug: string;
}

interface SeedModel {
    name: string;
    slug: string;
    variants: SeedVariant[];
}

interface SeedEntry {
    brandSlug: string;
    categorySlug: string;
    models: SeedModel[];
}

async function main() {
    console.log("📤 Local DB'den seed-models.json export ediliyor...\n");

    // Tüm modelleri variant'larıyla birlikte al
    const models = await prisma.model.findMany({
        orderBy: [{ brandId: "asc" }, { categoryId: "asc" }, { name: "asc" }],
        include: {
            brand: { select: { slug: true } },
            category: { select: { slug: true } },
            variants: {
                orderBy: { name: "asc" },
                select: { name: true, slug: true },
            },
        },
    });

    // brandSlug + categorySlug bazında grupla
    const groupMap = new Map<string, SeedEntry>();

    for (const model of models) {
        const key = `${model.brand.slug}::${model.category.slug}`;
        if (!groupMap.has(key)) {
            groupMap.set(key, {
                brandSlug: model.brand.slug,
                categorySlug: model.category.slug,
                models: [],
            });
        }
        groupMap.get(key)!.models.push({
            name: model.name,
            slug: model.slug,
            variants: model.variants.map(v => ({ name: v.name, slug: v.slug })),
        });
    }

    const seedData: SeedEntry[] = Array.from(groupMap.values()).sort((a, b) => {
        if (a.brandSlug !== b.brandSlug) return a.brandSlug.localeCompare(b.brandSlug);
        return a.categorySlug.localeCompare(b.categorySlug);
    });

    const outputPath = path.join(__dirname, "seed-models.json");

    // Mevcut dosyayı yedekle
    if (fs.existsSync(outputPath)) {
        const backupPath = path.join(__dirname, `seed-models.backup-${Date.now()}.json`);
        fs.copyFileSync(outputPath, backupPath);
        console.log(`  💾 Mevcut dosya yedeklendi: ${path.basename(backupPath)}`);
    }

    fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2), "utf-8");

    // İstatistikler
    const totalModels = seedData.reduce((sum, e) => sum + e.models.length, 0);
    const totalVariants = seedData.reduce((sum, e) => sum + e.models.reduce((s, m) => s + m.variants.length, 0), 0);
    const brandCount = new Set(seedData.map(e => e.brandSlug)).size;
    const catCount = new Set(seedData.map(e => e.categorySlug)).size;

    console.log("\n📊 Export sonucu:");
    console.log(`  🏷️  ${brandCount} marka`);
    console.log(`  📂 ${catCount} kategori`);
    console.log(`  🚗 ${totalModels} model`);
    console.log(`  🔧 ${totalVariants} varyant`);
    console.log(`\n✅ seed-models.json güncellendi!`);
    console.log(`\n📌 Şimdi "git add" ve "git push" yaparak Railway'e gönderebilirsiniz.`);
    console.log(`   Railway deploy sırasında seed.ts bu verileri otomatik oluşturacak.`);
}

main()
    .catch((e) => {
        console.error("❌ Export hatası:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
