/**
 * Railway ve Local DB karşılaştırma + senkronizasyon scripti
 * Kullanım: cd server && npx ts-node prisma/sync-from-railway.ts
 */
import { PrismaClient } from "@prisma/client";

const LOCAL_URL = "postgresql://postgres:12345@localhost:5432/TrucksBus";
const RAILWAY_URL = "postgresql://postgres:EhQDtTWELXSrOpMQZJZsuMHKDCxtTOff@interchange.proxy.rlwy.net:46071/railway";

const local = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const railway = new PrismaClient({ datasources: { db: { url: RAILWAY_URL } } });

async function main() {
    console.log("🔄 Railway ve Local DB karşılaştırılıyor...\n");

    // 1. Categories
    const rwCategories = await railway.category.findMany({ orderBy: { id: "asc" } });
    const lcCategories = await local.category.findMany({ orderBy: { id: "asc" } });
    const lcCatSlugs = new Set(lcCategories.map(c => c.slug));
    const missingCats = rwCategories.filter(c => !lcCatSlugs.has(c.slug));
    console.log(`📂 Categories — Railway: ${rwCategories.length}, Local: ${lcCategories.length}, Eksik: ${missingCats.length}`);

    // 2. Brands
    const rwBrands = await railway.brand.findMany({ orderBy: { id: "asc" } });
    const lcBrands = await local.brand.findMany({ orderBy: { id: "asc" } });
    const lcBrandSlugs = new Set(lcBrands.map(b => b.slug));
    const missingBrands = rwBrands.filter(b => !lcBrandSlugs.has(b.slug));
    console.log(`🏷️  Brands — Railway: ${rwBrands.length}, Local: ${lcBrands.length}, Eksik: ${missingBrands.length}`);

    // 3. CategoryBrands
    const rwCB = await railway.categoryBrand.findMany();
    const lcCB = await local.categoryBrand.findMany();
    const lcCBSet = new Set(lcCB.map(cb => `${cb.categoryId}-${cb.brandId}`));
    const missingCB = rwCB.filter(cb => !lcCBSet.has(`${cb.categoryId}-${cb.brandId}`));
    console.log(`🔗 CategoryBrands — Railway: ${rwCB.length}, Local: ${lcCB.length}, Eksik: ${missingCB.length}`);

    // 4. Models
    const rwModels = await railway.model.findMany({ orderBy: { id: "asc" } });
    const lcModels = await local.model.findMany({ orderBy: { id: "asc" } });
    const lcModelKeys = new Set(lcModels.map(m => `${m.brandId}-${m.categoryId}-${m.slug}`));
    const missingModels = rwModels.filter(m => !lcModelKeys.has(`${m.brandId}-${m.categoryId}-${m.slug}`));
    console.log(`🚗 Models — Railway: ${rwModels.length}, Local: ${lcModels.length}, Eksik: ${missingModels.length}`);

    // 5. Variants
    const rwVariants = await railway.variant.findMany({ orderBy: { id: "asc" } });
    const lcVariants = await local.variant.findMany({ orderBy: { id: "asc" } });
    const lcVarKeys = new Set(lcVariants.map(v => `${v.modelId}-${v.slug}`));
    const missingVariants = rwVariants.filter(v => !lcVarKeys.has(`${v.modelId}-${v.slug}`));
    console.log(`🔧 Variants — Railway: ${rwVariants.length}, Local: ${lcVariants.length}, Eksik: ${missingVariants.length}`);

    // 6. Cities
    const rwCities = await railway.city.findMany({ orderBy: { id: "asc" } });
    const lcCities = await local.city.findMany({ orderBy: { id: "asc" } });
    const lcCityNames = new Set(lcCities.map(c => c.name));
    const missingCities = rwCities.filter(c => !lcCityNames.has(c.name));
    console.log(`🏙️  Cities — Railway: ${rwCities.length}, Local: ${lcCities.length}, Eksik: ${missingCities.length}`);

    // 7. Districts
    const rwDistricts = await railway.district.findMany({ orderBy: { id: "asc" } });
    const lcDistricts = await local.district.findMany({ orderBy: { id: "asc" } });
    const lcDistKeys = new Set(lcDistricts.map(d => `${d.cityId}-${d.name}`));
    const missingDistricts = rwDistricts.filter(d => !lcDistKeys.has(`${d.cityId}-${d.name}`));
    console.log(`📍 Districts — Railway: ${rwDistricts.length}, Local: ${lcDistricts.length}, Eksik: ${missingDistricts.length}`);

    const totalMissing = missingCats.length + missingBrands.length + missingCB.length + missingModels.length + missingVariants.length + missingCities.length + missingDistricts.length;

    if (totalMissing === 0) {
        console.log("\n✅ Veritabanları senkronize! Eksik veri yok.");
        return;
    }

    console.log(`\n⚡ Toplam ${totalMissing} eksik kayıt senkronize ediliyor...\n`);

    // ID mapping tabloları (Railway ID -> Local ID)
    const catIdMap = new Map<number, number>();
    const brandIdMap = new Map<number, number>();
    const modelIdMap = new Map<number, number>();
    const cityIdMap = new Map<number, number>();

    // Mevcut eşlemeleri oluştur
    for (const rwCat of rwCategories) {
        const lcCat = lcCategories.find(c => c.slug === rwCat.slug);
        if (lcCat) catIdMap.set(rwCat.id, lcCat.id);
    }
    for (const rwBrand of rwBrands) {
        const lcBrand = lcBrands.find(b => b.slug === rwBrand.slug);
        if (lcBrand) brandIdMap.set(rwBrand.id, lcBrand.id);
    }
    for (const rwModel of rwModels) {
        const lcModel = lcModels.find(m => m.brandId === (brandIdMap.get(rwModel.brandId) || rwModel.brandId) && m.categoryId === (catIdMap.get(rwModel.categoryId) || rwModel.categoryId) && m.slug === rwModel.slug);
        if (lcModel) modelIdMap.set(rwModel.id, lcModel.id);
    }
    for (const rwCity of rwCities) {
        const lcCity = lcCities.find(c => c.name === rwCity.name);
        if (lcCity) cityIdMap.set(rwCity.id, lcCity.id);
    }

    // SYNC: Categories
    for (const cat of missingCats) {
        const created = await local.category.create({
            data: { name: cat.name, slug: cat.slug, iconUrl: cat.iconUrl, displayOrder: cat.displayOrder, isActive: cat.isActive, description: cat.description },
        });
        catIdMap.set(cat.id, created.id);
        console.log(`  ✅ Category: ${cat.name}`);
    }

    // SYNC: Brands
    for (const brand of missingBrands) {
        const created = await local.brand.create({
            data: { name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl, isActive: brand.isActive },
        });
        brandIdMap.set(brand.id, created.id);
        console.log(`  ✅ Brand: ${brand.name}`);
    }

    // SYNC: CategoryBrands
    for (const cb of missingCB) {
        const localCatId = catIdMap.get(cb.categoryId);
        const localBrandId = brandIdMap.get(cb.brandId);
        if (localCatId && localBrandId) {
            // Check if already exists
            const exists = await local.categoryBrand.findUnique({
                where: { categoryId_brandId: { categoryId: localCatId, brandId: localBrandId } },
            });
            if (!exists) {
                await local.categoryBrand.create({
                    data: { categoryId: localCatId, brandId: localBrandId },
                });
                console.log(`  ✅ CategoryBrand: cat ${localCatId} - brand ${localBrandId}`);
            }
        }
    }

    // SYNC: Models
    for (const model of missingModels) {
        const localBrandId = brandIdMap.get(model.brandId);
        const localCatId = catIdMap.get(model.categoryId);
        if (localBrandId && localCatId) {
            const exists = await local.model.findFirst({
                where: { brandId: localBrandId, categoryId: localCatId, slug: model.slug },
            });
            if (!exists) {
                const created = await local.model.create({
                    data: { brandId: localBrandId, categoryId: localCatId, name: model.name, slug: model.slug, isActive: model.isActive },
                });
                modelIdMap.set(model.id, created.id);
                console.log(`  ✅ Model: ${model.name}`);
            }
        }
    }

    // SYNC: Variants
    for (const variant of missingVariants) {
        const localModelId = modelIdMap.get(variant.modelId);
        if (localModelId) {
            const exists = await local.variant.findFirst({
                where: { modelId: localModelId, slug: variant.slug },
            });
            if (!exists) {
                await local.variant.create({
                    data: { modelId: localModelId, name: variant.name, slug: variant.slug, specifications: variant.specifications || undefined, isActive: variant.isActive },
                });
                console.log(`  ✅ Variant: ${variant.name}`);
            }
        }
    }

    // SYNC: Cities
    for (const city of missingCities) {
        const created = await local.city.create({
            data: { name: city.name, plateCode: city.plateCode },
        });
        cityIdMap.set(city.id, created.id);
        console.log(`  ✅ City: ${city.name}`);
    }

    // SYNC: Districts
    for (const dist of missingDistricts) {
        const localCityId = cityIdMap.get(dist.cityId);
        if (localCityId) {
            const exists = await local.district.findFirst({
                where: { cityId: localCityId, name: dist.name },
            });
            if (!exists) {
                await local.district.create({
                    data: { cityId: localCityId, name: dist.name },
                });
                console.log(`  ✅ District: ${dist.name}`);
            }
        }
    }

    console.log("\n🏁 Senkronizasyon tamamlandı!");
}

main()
    .catch(console.error)
    .finally(async () => {
        await local.$disconnect();
        await railway.$disconnect();
    });
