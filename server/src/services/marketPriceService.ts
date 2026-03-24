/**
 * Piyasa Fiyat Analiz Servisi
 *
 * Mevcut APPROVED ilanlardan piyasa verisi çekerek
 * median, ortalama, min, max fiyat istatistiklerini hesaplar.
 *
 * Hata durumunda null döner — mevcut sistemi BOZMAZ.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface MarketStats {
    median: number;
    avg: number;
    min: number;
    max: number;
    sampleSize: number;
}

export interface MarketQuery {
    category?: string | null;
    brand?: string | null;
    model?: string | null;
    year?: number | null;
}

/**
 * Median hesaplama yardımcı fonksiyonu
 */
function calculateMedian(sortedPrices: number[]): number {
    const len = sortedPrices.length;
    if (len === 0) return 0;
    const mid = Math.floor(len / 2);
    return len % 2 === 0
        ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
        : sortedPrices[mid];
}

/**
 * Son onaylanmış ilanlardan piyasa istatistikleri çeker.
 *
 * Strateji:
 * 1. Aynı kategori + marka + model + yıl aralığında (±3 yıl) ara
 * 2. Yeterli veri yoksa (< 5) → kategori + marka ile genişlet
 * 3. Hâlâ yetersizse (< 3) → sadece kategori ile son 100 ilan
 * 4. Hiç veri yoksa → null döner
 *
 * @returns MarketStats | null
 */
export async function getMarketStats(
    query: MarketQuery,
): Promise<MarketStats | null> {
    try {
        const { category, brand, model, year } = query;

        // En az kategori bilgisi gerekli
        if (!category) return null;

        // Kategoriyi bul
        const categoryRecord = await prisma.category.findFirst({
            where: {
                OR: [
                    { slug: category },
                    { name: { contains: category, mode: "insensitive" } },
                ],
            },
        });
        if (!categoryRecord) return null;

        // Markayı bul (varsa)
        let brandId: number | undefined;
        if (brand) {
            const brandRecord = await prisma.brand.findFirst({
                where: {
                    OR: [
                        { slug: brand },
                        { name: { contains: brand, mode: "insensitive" } },
                    ],
                },
            });
            brandId = brandRecord?.id;
        }

        // Modeli bul (varsa)
        let modelId: number | undefined;
        if (model && brandId) {
            const modelRecord = await prisma.model.findFirst({
                where: {
                    brandId,
                    OR: [
                        { slug: model },
                        { name: { contains: model, mode: "insensitive" } },
                    ],
                },
            });
            modelId = modelRecord?.id;
        }

        // Yıl aralığı (±3)
        const yearMin = year ? year - 3 : undefined;
        const yearMax = year ? year + 3 : undefined;

        // 1. Denemek: Dar filtre (kategori + marka + model + yıl aralığı)
        let prices = await fetchPrices({
            categoryId: categoryRecord.id,
            brandId,
            modelId,
            yearMin,
            yearMax,
            limit: 100,
        });

        // 2. Yetersizse: Kategori + marka (model ve yıl kısıtını kaldır)
        if (prices.length < 5 && brandId) {
            prices = await fetchPrices({
                categoryId: categoryRecord.id,
                brandId,
                limit: 100,
            });
        }

        // 3. Hâlâ yetersizse: Sadece kategori
        if (prices.length < 3) {
            prices = await fetchPrices({
                categoryId: categoryRecord.id,
                limit: 100,
            });
        }

        // Hiç veri yoksa null
        if (prices.length === 0) return null;

        // Sıralı fiyat dizisi
        prices.sort((a, b) => a - b);

        const sum = prices.reduce((acc, val) => acc + val, 0);

        return {
            median: Math.round(calculateMedian(prices)),
            avg: Math.round(sum / prices.length),
            min: prices[0],
            max: prices[prices.length - 1],
            sampleSize: prices.length,
        };
    } catch (error) {
        console.error("⚠️ MarketPriceService hatası:", error);
        return null;
    }
}

/**
 * Veritabanından fiyat listesi çeker (dahili yardımcı)
 */
async function fetchPrices(params: {
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
