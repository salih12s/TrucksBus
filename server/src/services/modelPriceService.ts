/**
 * Model Bazlı Piyasa Fiyat Servisi
 *
 * Category → Brand → Model → Year hiyerarşisine göre
 * gerçek veriden (APPROVED ilanlar) veya seed tablosundan fiyat bilgisi döner.
 *
 * Öncelik: DB gerçek veri > MarketPriceSeed > null (fallback)
 * Hata durumunda null döner — mevcut sistemi BOZMAZ.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ModelPriceQuery {
    categoryId: number;
    brandId?: number | null;
    modelId?: number | null;
    year?: number | null;
}

export interface ModelPriceResult {
    source: "database" | "seed";
    median?: number;
    avg?: number;
    min?: number;
    max?: number;
    avgPrice?: number;
    minPrice?: number;
    maxPrice?: number;
    sampleSize?: number;
}

/**
 * Median hesaplama
 */
function calculateMedian(sorted: number[]): number {
    const len = sorted.length;
    if (len === 0) return 0;
    const mid = Math.floor(len / 2);
    return len % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

/**
 * Model bazlı piyasa fiyatını al.
 *
 * Strateji:
 * 1. DB'den aynı kategori+marka+model, yıl±2, APPROVED, son 100 ilan çek
 * 2. Sonuç >= 10 ise → median + avg hesapla, source: "database" döndür
 * 3. Eğer yetersizse → kategori+marka ile genişlet (model kısıtını kaldır)
 * 4. Hâlâ yetersizse → MarketPriceSeed tablosuna bak
 * 5. Seed de yoksa → null döndür
 */
export async function getModelMarketPrice(
    query: ModelPriceQuery,
): Promise<ModelPriceResult | null> {
    try {
        const { categoryId, brandId, modelId, year } = query;

        if (!categoryId) return null;

        const yearMin = year ? year - 2 : undefined;
        const yearMax = year ? year + 2 : undefined;

        // 1. Dar filtre: kategori + marka + model + yıl±2
        if (brandId && modelId) {
            const prices = await fetchModelPrices({
                categoryId,
                brandId,
                modelId,
                yearMin,
                yearMax,
                limit: 100,
            });

            if (prices.length >= 10) {
                return buildDatabaseResult(prices);
            }
        }

        // 2. Genişlet: kategori + marka (model kısıtı yok)
        if (brandId) {
            const prices = await fetchModelPrices({
                categoryId,
                brandId,
                yearMin,
                yearMax,
                limit: 100,
            });

            if (prices.length >= 10) {
                return buildDatabaseResult(prices);
            }
        }

        // 3. En geniş: sadece kategori + yıl
        {
            const prices = await fetchModelPrices({
                categoryId,
                yearMin,
                yearMax,
                limit: 100,
            });

            if (prices.length >= 10) {
                return buildDatabaseResult(prices);
            }
        }

        // 4. DB'den yeterli veri yok → MarketPriceSeed tablosuna bak
        try {
            const seed = await findSeedData(categoryId, brandId, modelId, year);
            if (seed) {
                return {
                    source: "seed",
                    avgPrice: seed.avgPrice,
                    minPrice: seed.minPrice,
                    maxPrice: seed.maxPrice,
                };
            }
        } catch {
            // Seed tablosu yoksa veya hata olursa sessizce geç
        }

        // 5. Hiçbir veri yok
        return null;
    } catch (error) {
        console.error("⚠️ ModelPriceService hatası:", error);
        return null;
    }
}

/**
 * DB'den fiyatları çek
 */
async function fetchModelPrices(params: {
    categoryId: number;
    brandId?: number;
    modelId?: number;
    yearMin?: number;
    yearMax?: number;
    limit: number;
}): Promise<number[]> {
    const { categoryId, brandId, modelId, yearMin, yearMax, limit } = params;

    const where: Record<string, unknown> = {
        categoryId,
        status: "APPROVED",
        price: { not: null, gt: 0 },
    };

    if (brandId) where.brandId = brandId;
    if (modelId) where.modelId = modelId;
    if (yearMin !== undefined && yearMax !== undefined) {
        where.year = { gte: yearMin, lte: yearMax };
    }

    const ads = await prisma.ad.findMany({
        where: where as any,
        select: { price: true },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return ads
        .map((ad) => (ad.price ? Number(ad.price) : 0))
        .filter((p) => p > 0);
}

/**
 * Fiyat dizisinden DB sonucu oluştur
 */
function buildDatabaseResult(prices: number[]): ModelPriceResult {
    prices.sort((a, b) => a - b);
    const sum = prices.reduce((acc, val) => acc + val, 0);

    return {
        source: "database",
        median: Math.round(calculateMedian(prices)),
        avg: Math.round(sum / prices.length),
        min: prices[0],
        max: prices[prices.length - 1],
        sampleSize: prices.length,
    };
}

/**
 * MarketPriceSeed tablosundan eşleşen kayıt bul.
 * Kategori zorunlu, marka ve model opsiyonel.
 * Yıl aralığına göre filtreler.
 */
async function findSeedData(
    categoryId: number,
    brandId?: number | null,
    modelId?: number | null,
    year?: number | null,
): Promise<{ avgPrice: number; minPrice: number; maxPrice: number } | null> {
    const catIdStr = String(categoryId);
    const yearVal = year ?? new Date().getFullYear();

    // Önce en spesifik eşleşme: kategori + marka + model
    if (brandId && modelId) {
        const seed = await prisma.marketPriceSeed.findFirst({
            where: {
                categoryId: catIdStr,
                brandId: String(brandId),
                modelId: String(modelId),
                yearFrom: { lte: yearVal },
                yearTo: { gte: yearVal },
            },
            orderBy: { createdAt: "desc" },
        });
        if (seed) return { avgPrice: seed.avgPrice, minPrice: seed.minPrice, maxPrice: seed.maxPrice };
    }

    // Sonra: kategori + marka
    if (brandId) {
        const seed = await prisma.marketPriceSeed.findFirst({
            where: {
                categoryId: catIdStr,
                brandId: String(brandId),
                modelId: null,
                yearFrom: { lte: yearVal },
                yearTo: { gte: yearVal },
            },
            orderBy: { createdAt: "desc" },
        });
        if (seed) return { avgPrice: seed.avgPrice, minPrice: seed.minPrice, maxPrice: seed.maxPrice };
    }

    // En geniş: sadece kategori
    const seed = await prisma.marketPriceSeed.findFirst({
        where: {
            categoryId: catIdStr,
            brandId: null,
            modelId: null,
            yearFrom: { lte: yearVal },
            yearTo: { gte: yearVal },
        },
        orderBy: { createdAt: "desc" },
    });
    if (seed) return { avgPrice: seed.avgPrice, minPrice: seed.minPrice, maxPrice: seed.maxPrice };

    return null;
}
