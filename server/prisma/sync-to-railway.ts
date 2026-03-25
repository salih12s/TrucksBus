/**
 * Local DB → Railway DB senkronizasyon scripti
 * Localdeki tüm referans verilerini (categories, brands, models, variants, cities, districts, categoryBrands)
 * Railway veritabanına gönderir.
 *
 * Kullanım: cd server && npx ts-node prisma/sync-to-railway.ts
 *
 * NOT: Bu script sadece referans (lookup) verilerini senkronize eder.
 * Kullanıcı, ilan, mesaj gibi uygulama verileri için ayrı bir mekanizma gerekir. 
 */
import { PrismaClient } from "@prisma/client";

const LOCAL_URL = "postgresql://postgres:12345@localhost:5432/TrucksBus";
const RAILWAY_URL = "postgresql://postgres:EhQDtTWELXSrOpMQZJZsuMHKDCxtTOff@interchange.proxy.rlwy.net:46071/railway";

const local = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const railway = new PrismaClient({ datasources: { db: { url: RAILWAY_URL } } });

async function main() {
    console.log("🚀 Local → Railway DB senkronizasyonu başlıyor...\n");

    // ==========================================
    // OKUMA: Local verileri al
    // ==========================================
    const lcCategories = await local.category.findMany({ orderBy: { id: "asc" } });
    const lcBrands = await local.brand.findMany({ orderBy: { id: "asc" } });
    const lcCB = await local.categoryBrand.findMany();
    const lcModels = await local.model.findMany({ orderBy: { id: "asc" } });
    const lcVariants = await local.variant.findMany({ orderBy: { id: "asc" } });
    const lcCities = await local.city.findMany({ orderBy: { id: "asc" } });
    const lcDistricts = await local.district.findMany({ orderBy: { id: "asc" } });

    // ==========================================
    // OKUMA: Railway verileri al
    // ==========================================
    const rwCategories = await railway.category.findMany({ orderBy: { id: "asc" } });
    const rwBrands = await railway.brand.findMany({ orderBy: { id: "asc" } });
    const rwCB = await railway.categoryBrand.findMany();
    const rwModels = await railway.model.findMany({ orderBy: { id: "asc" } });
    const rwVariants = await railway.variant.findMany({ orderBy: { id: "asc" } });
    const rwCities = await railway.city.findMany({ orderBy: { id: "asc" } });
    const rwDistricts = await railway.district.findMany({ orderBy: { id: "asc" } });

    // Eksik kayıtları bul (Local'de var, Railway'de yok)
    const rwCatSlugs = new Set(rwCategories.map(c => c.slug));
    const missingCats = lcCategories.filter(c => !rwCatSlugs.has(c.slug));

    const rwBrandSlugs = new Set(rwBrands.map(b => b.slug));
    const missingBrands = lcBrands.filter(b => !rwBrandSlugs.has(b.slug));

    const rwCBSet = new Set(rwCB.map(cb => `${cb.categoryId}-${cb.brandId}`));

    const rwModelKeys = new Set(rwModels.map(m => `${m.brandId}-${m.categoryId}-${m.slug}`));

    const rwVarKeys = new Set(rwVariants.map(v => `${v.modelId}-${v.slug}`));

    const rwCityNames = new Set(rwCities.map(c => c.name));
    const missingCities = lcCities.filter(c => !rwCityNames.has(c.name));

    const rwDistKeys = new Set(rwDistricts.map(d => `${d.cityId}-${d.name}`));

    // ==========================================
    // DURUM RAPORU
    // ==========================================
    console.log("📊 Karşılaştırma sonucu:");
    console.log(`  📂 Categories — Local: ${lcCategories.length}, Railway: ${rwCategories.length}, Eksik: ${missingCats.length}`);
    console.log(`  🏷️  Brands — Local: ${lcBrands.length}, Railway: ${rwBrands.length}, Eksik: ${missingBrands.length}`);
    console.log(`  🚗 Models — Local: ${lcModels.length}, Railway: ${rwModels.length}`);
    console.log(`  🔧 Variants — Local: ${lcVariants.length}, Railway: ${rwVariants.length}`);
    console.log(`  🏙️  Cities — Local: ${lcCities.length}, Railway: ${rwCities.length}, Eksik: ${missingCities.length}`);
    console.log(`  📍 Districts — Local: ${lcDistricts.length}, Railway: ${rwDistricts.length}`);

    // ==========================================
    // ID MAPPING tabloları (Local ID → Railway ID)
    // ==========================================
    const catIdMap = new Map<number, number>();   // localCatId → railwayCatId
    const brandIdMap = new Map<number, number>(); // localBrandId → railwayBrandId
    const modelIdMap = new Map<number, number>(); // localModelId → railwayModelId
    const cityIdMap = new Map<number, number>();  // localCityId → railwayCityId

    // Mevcut eşlemeleri oluştur (slug bazında)
    for (const lcCat of lcCategories) {
        const rwCat = rwCategories.find(c => c.slug === lcCat.slug);
        if (rwCat) catIdMap.set(lcCat.id, rwCat.id);
    }
    for (const lcBrand of lcBrands) {
        const rwBrand = rwBrands.find(b => b.slug === lcBrand.slug);
        if (rwBrand) brandIdMap.set(lcBrand.id, rwBrand.id);
    }
    for (const lcModel of lcModels) {
        const localBrandId = lcModel.brandId;
        const localCatId = lcModel.categoryId;
        const rwBrandId = brandIdMap.get(localBrandId);
        const rwCatId = catIdMap.get(localCatId);
        if (rwBrandId && rwCatId) {
            const rwModel = rwModels.find(m => m.brandId === rwBrandId && m.categoryId === rwCatId && m.slug === lcModel.slug);
            if (rwModel) modelIdMap.set(lcModel.id, rwModel.id);
        }
    }
    for (const lcCity of lcCities) {
        const rwCity = rwCities.find(c => c.name === lcCity.name);
        if (rwCity) cityIdMap.set(lcCity.id, rwCity.id);
    }

    let totalCreated = 0;

    // ==========================================
    // SYNC: Categories → Railway
    // ==========================================
    if (missingCats.length > 0) {
        console.log("\n📂 Categories senkronize ediliyor...");
        for (const cat of missingCats) {
            const created = await railway.category.create({
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    iconUrl: cat.iconUrl,
                    displayOrder: cat.displayOrder,
                    isActive: cat.isActive,
                    description: cat.description,
                },
            });
            catIdMap.set(cat.id, created.id);
            totalCreated++;
            console.log(`  ✅ Category: ${cat.name}`);
        }
    }

    // ==========================================
    // SYNC: Brands → Railway
    // ==========================================
    if (missingBrands.length > 0) {
        console.log("\n🏷️  Brands senkronize ediliyor...");
        for (const brand of missingBrands) {
            const created = await railway.brand.create({
                data: {
                    name: brand.name,
                    slug: brand.slug,
                    logoUrl: brand.logoUrl,
                    isActive: brand.isActive,
                },
            });
            brandIdMap.set(brand.id, created.id);
            totalCreated++;
            console.log(`  ✅ Brand: ${brand.name}`);
        }
    }

    // ==========================================
    // SYNC: CategoryBrands → Railway
    // ==========================================
    console.log("\n🔗 CategoryBrands senkronize ediliyor...");
    let cbCreated = 0;
    for (const cb of lcCB) {
        const rwCatId = catIdMap.get(cb.categoryId);
        const rwBrandId = brandIdMap.get(cb.brandId);
        if (rwCatId && rwBrandId) {
            const key = `${rwCatId}-${rwBrandId}`;
            // Railway'deki mevcut setde var mı kontrol et
            const existsInRw = rwCB.some(r => r.categoryId === rwCatId && r.brandId === rwBrandId);
            if (!existsInRw) {
                try {
                    await railway.categoryBrand.create({
                        data: { categoryId: rwCatId, brandId: rwBrandId },
                    });
                    cbCreated++;
                } catch (e: any) {
                    // Unique constraint ihlali olabilir, atla
                    if (!e.message?.includes("Unique constraint")) {
                        console.error(`  ❌ CategoryBrand hatası: cat ${rwCatId}, brand ${rwBrandId} — ${e.message}`);
                    }
                }
            }
        }
    }
    if (cbCreated > 0) {
        console.log(`  ✅ ${cbCreated} yeni CategoryBrand eklendi`);
        totalCreated += cbCreated;
    } else {
        console.log(`  ℹ️  CategoryBrands zaten senkronize`);
    }

    // ==========================================
    // SYNC: Models → Railway
    // ==========================================
    console.log("\n🚗 Models senkronize ediliyor...");
    let modelCreated = 0;
    for (const model of lcModels) {
        const rwBrandId = brandIdMap.get(model.brandId);
        const rwCatId = catIdMap.get(model.categoryId);
        if (rwBrandId && rwCatId) {
            // Bu model Railway'de var mı?
            const existsInRw = rwModels.some(m => m.brandId === rwBrandId && m.categoryId === rwCatId && m.slug === model.slug);
            if (!existsInRw) {
                try {
                    const created = await railway.model.create({
                        data: {
                            brandId: rwBrandId,
                            categoryId: rwCatId,
                            name: model.name,
                            slug: model.slug,
                            isActive: model.isActive,
                        },
                    });
                    modelIdMap.set(model.id, created.id);
                    modelCreated++;
                    console.log(`  ✅ Model: ${model.name} (brand: ${rwBrandId}, cat: ${rwCatId})`);
                } catch (e: any) {
                    if (!e.message?.includes("Unique constraint")) {
                        console.error(`  ❌ Model hatası: ${model.name} — ${e.message}`);
                    }
                }
            }
        }
    }
    if (modelCreated > 0) {
        console.log(`  📦 ${modelCreated} yeni model eklendi`);
        totalCreated += modelCreated;
    } else {
        console.log(`  ℹ️  Models zaten senkronize`);
    }

    // ==========================================
    // SYNC: Variants → Railway
    // ==========================================
    console.log("\n🔧 Variants senkronize ediliyor...");
    let variantCreated = 0;
    for (const variant of lcVariants) {
        const rwModelId = modelIdMap.get(variant.modelId);
        if (rwModelId) {
            // Bu variant Railway'de var mı?
            const existsInRw = rwVariants.some(v => v.modelId === rwModelId && v.slug === variant.slug);
            if (!existsInRw) {
                try {
                    await railway.variant.create({
                        data: {
                            modelId: rwModelId,
                            name: variant.name,
                            slug: variant.slug,
                            specifications: variant.specifications || undefined,
                            isActive: variant.isActive,
                        },
                    });
                    variantCreated++;
                    console.log(`  ✅ Variant: ${variant.name} (model: ${rwModelId})`);
                } catch (e: any) {
                    if (!e.message?.includes("Unique constraint")) {
                        console.error(`  ❌ Variant hatası: ${variant.name} — ${e.message}`);
                    }
                }
            }
        }
    }
    if (variantCreated > 0) {
        console.log(`  📦 ${variantCreated} yeni variant eklendi`);
        totalCreated += variantCreated;
    } else {
        console.log(`  ℹ️  Variants zaten senkronize`);
    }

    // ==========================================
    // SYNC: Cities → Railway
    // ==========================================
    if (missingCities.length > 0) {
        console.log("\n🏙️  Cities senkronize ediliyor...");
        for (const city of missingCities) {
            const created = await railway.city.create({
                data: { name: city.name, plateCode: city.plateCode },
            });
            cityIdMap.set(city.id, created.id);
            totalCreated++;
            console.log(`  ✅ City: ${city.name}`);
        }
    }

    // ==========================================
    // SYNC: Districts → Railway
    // ==========================================
    console.log("\n📍 Districts senkronize ediliyor...");
    let distCreated = 0;
    for (const dist of lcDistricts) {
        const rwCityId = cityIdMap.get(dist.cityId);
        if (rwCityId) {
            const existsInRw = rwDistricts.some(d => d.cityId === rwCityId && d.name === dist.name);
            if (!existsInRw) {
                try {
                    await railway.district.create({
                        data: { cityId: rwCityId, name: dist.name },
                    });
                    distCreated++;
                } catch (e: any) {
                    console.error(`  ❌ District hatası: ${dist.name} — ${e.message}`);
                }
            }
        }
    }
    if (distCreated > 0) {
        console.log(`  📦 ${distCreated} yeni district eklendi`);
        totalCreated += distCreated;
    } else {
        console.log(`  ℹ️  Districts zaten senkronize`);
    }

    // ==========================================
    // ÖZET
    // ==========================================
    console.log("\n" + "=".repeat(50));
    if (totalCreated === 0) {
        console.log("✅ Her şey zaten senkronize! Railway ve Local DB eşit.");
    } else {
        console.log(`🏁 Toplam ${totalCreated} yeni kayıt Railway'e eklendi!`);
    }
    console.log("=".repeat(50));
}

main()
    .catch((e) => {
        console.error("❌ Senkronizasyon hatası:", e);
        process.exit(1);
    })
    .finally(async () => {
        await local.$disconnect();
        await railway.$disconnect();
    });
