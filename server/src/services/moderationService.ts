/**
 * Otomatik Moderasyon Servisi
 *
 * İlan oluşturulduktan sonra fiyat kontrolü yaparak
 * otomatik onay veya red kararı verir.
 *
 * Mevcut ilan oluşturma akışını BOZMAZ.
 * Ad create edildikten sonra çağrılır ve status günceller.
 */

import { prisma } from "../config/database";
import {
  PRICE_RULES,
  CategoryPriceRule,
  PriceRange,
} from "../config/priceRules";
import {
  getMarketStats,
  MarketStats,
} from "./marketPriceService";
import {
  getUserTrustScore,
  TrustScoreResult,
} from "./trustScoreService";
import {
  getModelMarketPrice,
  ModelPriceResult,
} from "./modelPriceService";

export interface ModerationResult {
  decision: "APPROVED" | "REJECTED" | "PENDING";
  reason: string | null;
  details: {
    categoryLabel: string | null;
    year: number | null;
    price: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    ruleMatched: boolean;
  };
}

/**
 * Kategori slug veya adına göre fiyat kuralını bul
 */
function findPriceRule(
  categorySlug?: string | null,
  categoryName?: string | null,
): CategoryPriceRule | null {
  if (!categorySlug && !categoryName) return null;

  // Önce slug ile eşleştir
  if (categorySlug) {
    const slugLower = categorySlug.toLowerCase();
    const rule = PRICE_RULES.find((r) => r.slugs.some((s) => s === slugLower));
    if (rule) return rule;
  }

  // Sonra isim ile eşleştir
  if (categoryName) {
    const nameLower = categoryName.toLowerCase();
    const rule = PRICE_RULES.find((r) =>
      r.namePatterns.some((p) => nameLower.includes(p.toLowerCase())),
    );
    if (rule) return rule;
  }

  return null;
}

/**
 * Yıl aralığına göre fiyat kuralını bul
 */
function findPriceRange(
  rule: CategoryPriceRule,
  year: number,
): PriceRange | null {
  return (
    rule.ranges.find((r) => year >= r.yearMin && year <= r.yearMax) || null
  );
}

/**
 * Fiyat moderasyon kontrolü yap
 */
export function checkPriceModeration(
  categorySlug: string | null | undefined,
  categoryName: string | null | undefined,
  year: number | null | undefined,
  price: number | null | undefined,
): ModerationResult {
  // Fiyat veya yıl yoksa kontrol yapılamaz → PENDING olarak bırak
  if (!price || !year) {
    return {
      decision: "PENDING",
      reason: null,
      details: {
        categoryLabel: null,
        year: year || null,
        price: price || null,
        minPrice: null,
        maxPrice: null,
        ruleMatched: false,
      },
    };
  }

  // Kategoriyi bul
  const rule = findPriceRule(categorySlug, categoryName);

  // Kategori kuralı yoksa → PENDING olarak bırak (admin manuel onaylasın)
  if (!rule) {
    console.log(
      `⚠️ Moderasyon: Kategori kuralı bulunamadı (slug: ${categorySlug}, name: ${categoryName}) → PENDING`,
    );
    return {
      decision: "PENDING",
      reason: null,
      details: {
        categoryLabel: null,
        year,
        price,
        minPrice: null,
        maxPrice: null,
        ruleMatched: false,
      },
    };
  }

  // Yıl aralığını bul
  const range = findPriceRange(rule, year);

  // Yıl aralığı yoksa → PENDING olarak bırak
  if (!range) {
    console.log(
      `⚠️ Moderasyon: ${rule.label} için ${year} yılı kuralı bulunamadı → PENDING`,
    );
    return {
      decision: "PENDING",
      reason: null,
      details: {
        categoryLabel: rule.label,
        year,
        price,
        minPrice: null,
        maxPrice: null,
        ruleMatched: false,
      },
    };
  }

  // Fiyat kontrolü
  if (price < range.minPrice || price > range.maxPrice) {
    const reason = `Fiyat piyasa aralığı dışında. ${rule.label} (${range.yearMin}-${range.yearMax}) için beklenen aralık: ${range.minPrice.toLocaleString("tr-TR")} ₺ - ${range.maxPrice.toLocaleString("tr-TR")} ₺. Girilen fiyat: ${price.toLocaleString("tr-TR")} ₺`;

    console.log(`❌ Moderasyon RED: ${reason}`);

    return {
      decision: "REJECTED",
      reason,
      details: {
        categoryLabel: rule.label,
        year,
        price,
        minPrice: range.minPrice,
        maxPrice: range.maxPrice,
        ruleMatched: true,
      },
    };
  }

  // Fiyat uygun → Otomatik onayla
  console.log(
    `✅ Moderasyon ONAY: ${rule.label} (${year}) - Fiyat: ${price.toLocaleString("tr-TR")} ₺ (Aralık: ${range.minPrice.toLocaleString("tr-TR")}-${range.maxPrice.toLocaleString("tr-TR")} ₺)`,
  );

  return {
    decision: "APPROVED",
    reason: null,
    details: {
      categoryLabel: rule.label,
      year,
      price,
      minPrice: range.minPrice,
      maxPrice: range.maxPrice,
      ruleMatched: true,
    },
  };
}

/**
 * İlan oluşturulduktan sonra otomatik moderasyon uygula.
 *
 * Bu fonksiyon mevcut ad.create() çağrısından SONRA çağrılır.
 * Ad'ın status'ünü günceller ve gerekirse PendingAd kaydı oluşturur.
 *
 * @param adId - Oluşturulan ilanın ID'si
 * @returns ModerationResult - Moderasyon kararı
 */
export async function applyPriceModeration(
  adId: number,
): Promise<ModerationResult> {
  try {
    // İlanı veritabanından oku (kategori bilgisi dahil)
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!ad) {
      console.log(`⚠️ Moderasyon: İlan bulunamadı (ID: ${adId})`);
      return {
        decision: "PENDING",
        reason: null,
        details: {
          categoryLabel: null,
          year: null,
          price: null,
          minPrice: null,
          maxPrice: null,
          ruleMatched: false,
        },
      };
    }

    const price = ad.price ? Number(ad.price) : null;
    const year = ad.year;
    const categorySlug = ad.category?.slug || null;
    const categoryName = ad.category?.name || null;

    // Fiyat kontrolü yap
    const result = checkPriceModeration(
      categorySlug,
      categoryName,
      year,
      price,
    );

    // Karar bazında status güncelle
    if (result.decision === "APPROVED") {
      await prisma.ad.update({
        where: { id: adId },
        data: { status: "APPROVED" },
      });

      console.log(`✅ İlan #${adId} otomatik onaylandı`);
    } else if (result.decision === "REJECTED") {
      await prisma.ad.update({
        where: { id: adId },
        data: { status: "REJECTED" },
      });

      // PendingAd kaydı oluştur (ret sebebini kaydet)
      await prisma.pendingAd.upsert({
        where: { adId },
        create: {
          adId,
          adminNotes: `[OTOMATİK RED] ${result.reason}`,
        },
        update: {
          adminNotes: `[OTOMATİK RED] ${result.reason}`,
        },
      });

      console.log(`❌ İlan #${adId} otomatik reddedildi: ${result.reason}`);
    } else {
      // PENDING - status zaten PENDING, bir şey yapma
      console.log(`⏳ İlan #${adId} moderasyon bekliyor (kural eşleşmedi)`);
    }

    return result;
  } catch (error) {
    console.error(`⚠️ Moderasyon hatası (İlan #${adId}):`, error);
    // Hata durumunda PENDING bırak, mevcut akışı bozma
    return {
      decision: "PENDING",
      reason: null,
      details: {
        categoryLabel: null,
        year: null,
        price: null,
        minPrice: null,
        maxPrice: null,
        ruleMatched: false,
      },
    };
  }
}

// ============================================================
// GELIŞMIŞ MODERASYON SİSTEMİ (Mevcut sistemi BOZMAZ)
// ============================================================

export interface AdvancedModerationResult {
  status: "APPROVED" | "PENDING" | "REJECTED";
  reason: string;
  deviation?: number | null;
  trustScore?: number | null;
  marketData?: MarketStats | null;
  modelPrice?: ModelPriceResult | null;
  trustData?: TrustScoreResult | null;
  /** Eski priceRules sonucu (fallback referansı) */
  legacyResult?: ModerationResult | null;
}

/**
 * Gelişmiş Moderasyon Değerlendirmesi
 *
 * Mevcut priceRules sistemini KORUYARAK üzerine:
 * - Piyasa fiyat analizi (median/avg/min/max)
 * - Kullanıcı güven skoru
 * - Sapma bazlı akıllı karar
 * ekler.
 *
 * FAILSAFE: Her adımda hata olursa eski sisteme düşer.
 * AI veya dış servis gerektirmez — tamamen veritabanı tabanlıdır.
 *
 * @param adData - İlan verileri (henüz DB'ye yazılmamış olabilir)
 * @param userId - İlanı oluşturan kullanıcı ID'si
 */
export async function evaluateAdvancedModeration(
  adData: {
    price?: number | null;
    year?: number | null;
    categorySlug?: string | null;
    categoryName?: string | null;
    brandSlug?: string | null;
    modelSlug?: string | null;
    categoryId?: number | null;
    brandId?: number | null;
    modelId?: number | null;
  },
  userId: number,
): Promise<AdvancedModerationResult> {
  try {
    // 1. Eski priceRules kontrolü (her zaman çalışır)
    const legacyResult = checkPriceModeration(
      adData.categorySlug,
      adData.categoryName,
      adData.year,
      adData.price,
    );

    // 2a. Model bazlı fiyat verisi çek (yeni sistem — hata olursa null)
    let modelPrice: ModelPriceResult | null = null;
    try {
      if (adData.categoryId) {
        modelPrice = await getModelMarketPrice({
          categoryId: adData.categoryId,
          brandId: adData.brandId || null,
          modelId: adData.modelId || null,
          year: adData.year || null,
        });
      }
    } catch {
      console.warn("⚠️ Gelişmiş moderasyon: Model fiyat verisi alınamadı, devam ediliyor");
    }

    // 2b. Slug bazlı piyasa verisi çek (eski sistem — hata olursa null)
    let marketData: MarketStats | null = null;
    try {
      marketData = await getMarketStats({
        category: adData.categorySlug || adData.categoryName || null,
        brand: adData.brandSlug || null,
        model: adData.modelSlug || null,
        year: adData.year || null,
      });
    } catch {
      console.warn("⚠️ Gelişmiş moderasyon: Market verisi alınamadı, devam ediliyor");
    }

    // 3. Güven skoru al (hata olursa default 50)
    let trustData: TrustScoreResult | null = null;
    try {
      trustData = await getUserTrustScore(userId);
    } catch {
      console.warn("⚠️ Gelişmiş moderasyon: Trust score alınamadı, devam ediliyor");
    }

    const price = adData.price;
    const trustScore = trustData?.score ?? 50;

    // 4a. Model bazlı fiyat VARSA → öncelikli sapma kararı
    if (modelPrice && price) {
      const refPrice = modelPrice.source === "database"
        ? (modelPrice.median || modelPrice.avg || 0)
        : (modelPrice.avgPrice || 0);

      if (refPrice > 0) {
        const deviation = (price - refPrice) / refPrice;
        const absDeviation = Math.abs(deviation);

        console.log(
          `📊 Model Bazlı Moderasyon: Fiyat=${price}, Ref=${refPrice} (${modelPrice.source}), Sapma=${(deviation * 100).toFixed(1)}%, TrustScore=${trustScore}`,
        );

        let approveThreshold = 0.3;
        let flagThreshold = 0.6;

        if (trustScore >= 70) {
          approveThreshold = 0.5;
          flagThreshold = 0.7;
        } else if (trustScore < 30) {
          approveThreshold = 0.2;
          flagThreshold = 0.4;
        }

        if (absDeviation <= approveThreshold) {
          return {
            status: "APPROVED",
            reason: `Fiyat model bazlı ortalamaya uygun (${modelPrice.source}) (Sapma: %${(deviation * 100).toFixed(1)})`,
            deviation,
            trustScore,
            marketData,
            modelPrice,
            trustData,
            legacyResult,
          };
        }

        if (absDeviation > flagThreshold) {
          const direction = deviation > 0 ? "üstünde" : "altında";
          return {
            status: "REJECTED",
            reason: `Fiyat model bazlı ortalamanın %${(absDeviation * 100).toFixed(0)} ${direction} (${modelPrice.source}). Referans: ${refPrice.toLocaleString("tr-TR")} ₺, Girilen: ${price.toLocaleString("tr-TR")} ₺`,
            deviation,
            trustScore,
            marketData,
            modelPrice,
            trustData,
            legacyResult,
          };
        }

        return {
          status: "PENDING",
          reason: `Fiyat model bazlı ortalamadan %${(absDeviation * 100).toFixed(1)} sapıyor (${modelPrice.source}) — admin incelemesi gerekli`,
          deviation,
          trustScore,
          marketData,
          modelPrice,
          trustData,
          legacyResult,
        };
      }
    }

    // 4b. Slug bazlı piyasa verisi VARSA → sapma bazlı akıllı karar
    if (marketData && price && marketData.median > 0) {
      const deviation = (price - marketData.median) / marketData.median;
      const absDeviation = Math.abs(deviation);

      console.log(
        `📊 Gelişmiş Moderasyon: Fiyat=${price}, Median=${marketData.median}, Sapma=${(deviation * 100).toFixed(1)}%, TrustScore=${trustScore}`,
      );

      // Güvenilir kullanıcı (score >= 70) → tolerans %50'ye çıkar
      // Normal kullanıcı → tolerans %30
      // Düşük güvenli (score < 30) → tolerans %20
      let approveThreshold = 0.3;
      let flagThreshold = 0.5;

      if (trustScore >= 70) {
        approveThreshold = 0.5;
        flagThreshold = 0.7;
      } else if (trustScore < 30) {
        approveThreshold = 0.2;
        flagThreshold = 0.35;
      }

      if (absDeviation <= approveThreshold) {
        return {
          status: "APPROVED",
          reason: `Fiyat piyasa ortalamasına uygun (Sapma: %${(deviation * 100).toFixed(1)})`,
          deviation,
          trustScore,
          marketData,
          modelPrice,
          trustData,
          legacyResult,
        };
      }

      if (absDeviation > flagThreshold) {
        const direction = deviation > 0 ? "üstünde" : "altında";
        return {
          status: "REJECTED",
          reason: `Fiyat piyasa ortalamasının %${(absDeviation * 100).toFixed(0)} ${direction}. Piyasa medyanı: ${marketData.median.toLocaleString("tr-TR")} ₺, Girilen: ${price.toLocaleString("tr-TR")} ₺`,
          deviation,
          trustScore,
          marketData,
          modelPrice,
          trustData,
          legacyResult,
        };
      }

      return {
        status: "PENDING",
        reason: `Fiyat piyasa ortalamasından %${(absDeviation * 100).toFixed(1)} sapıyor — admin incelemesi gerekli`,
        deviation,
        trustScore,
        marketData,
        modelPrice,
        trustData,
        legacyResult,
      };
    }

    // 5. Piyasa verisi YOKSA → eski priceRules sonucunu kullan (fallback)
    console.log("📊 Gelişmiş Moderasyon: Piyasa verisi yok, eski sistem kullanılıyor");

    return {
      status: legacyResult.decision,
      reason: legacyResult.reason || "Eski fiyat kuralları uygulandı",
      deviation: null,
      trustScore,
      marketData: null,
      modelPrice: null,
      trustData,
      legacyResult,
    };
  } catch (error) {
    // FAILSAFE: Her şey patlarsa eski sisteme düş
    console.error("⚠️ Gelişmiş moderasyon kritik hata, fallback:", error);

    try {
      const fallback = checkPriceModeration(
        adData.categorySlug,
        adData.categoryName,
        adData.year,
        adData.price,
      );
      return {
        status: fallback.decision,
        reason: fallback.reason || "Fallback: Eski sistem kullanıldı",
        deviation: null,
        trustScore: null,
        marketData: null,
        modelPrice: null,
        trustData: null,
        legacyResult: fallback,
      };
    } catch {
      // Son çare: PENDING bırak
      return {
        status: "PENDING",
        reason: "Moderasyon sistemi geçici olarak kullanılamıyor",
        deviation: null,
        trustScore: null,
        marketData: null,
        modelPrice: null,
        trustData: null,
        legacyResult: null,
      };
    }
  }
}

// ============================================================
// GELİŞMİŞ MODERASYON WRAPPER — Controller'dan çağrılır
// applyPriceModeration'ın drop-in replace'i olarak çalışır
// ============================================================

/**
 * Gelişmiş moderasyon uygula (applyPriceModeration'ın yerine geçer).
 *
 * Akış:
 * 1. İlanı DB'den oku
 * 2. evaluateAdvancedModeration çağır
 * 3. Sonuca göre ad status güncelle + PendingAd oluştur
 * 4. PriceAnalytics log'u yaz (best-effort)
 * 5. Hata olursa → eski applyPriceModeration'a düş
 *
 * @returns ModerationResult (eski interface ile uyumlu)
 */
export async function applyAdvancedPriceModeration(
  adId: number,
): Promise<ModerationResult> {
  try {
    // İlanı oku
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        model: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!ad) {
      console.log(`⚠️ Gelişmiş Moderasyon: İlan bulunamadı (ID: ${adId})`);
      return applyPriceModeration(adId);
    }

    const price = ad.price ? Number(ad.price) : null;

    // Gelişmiş moderasyonu çalıştır
    const advanced = await evaluateAdvancedModeration(
      {
        price,
        year: ad.year,
        categorySlug: ad.category?.slug || null,
        categoryName: ad.category?.name || null,
        brandSlug: ad.brand?.slug || null,
        modelSlug: ad.model?.slug || null,
        categoryId: ad.category?.id || null,
        brandId: ad.brand?.id || null,
        modelId: ad.model?.id || null,
      },
      ad.userId,
    );

    // Status güncelle
    if (advanced.status === "APPROVED") {
      await prisma.ad.update({
        where: { id: adId },
        data: { status: "APPROVED" },
      });
      console.log(`✅ İlan #${adId} gelişmiş moderasyon ile onaylandı`);
    } else if (advanced.status === "REJECTED") {
      await prisma.ad.update({
        where: { id: adId },
        data: { status: "REJECTED" },
      });
      await prisma.pendingAd.upsert({
        where: { adId },
        create: { adId, adminNotes: `[GELİŞMİŞ MOD] ${advanced.reason}` },
        update: { adminNotes: `[GELİŞMİŞ MOD] ${advanced.reason}` },
      });
      console.log(`❌ İlan #${adId} gelişmiş moderasyon ile reddedildi: ${advanced.reason}`);
    } else {
      console.log(`⏳ İlan #${adId} gelişmiş moderasyon: PENDING`);
    }

    // PriceAnalytics log (best-effort, hata olursa sessizce geç)
    try {
      await prisma.priceAnalytics.create({
        data: {
          adId,
          median: advanced.marketData?.median ?? null,
          avg: advanced.marketData?.avg ?? null,
          min: advanced.marketData?.min ?? null,
          max: advanced.marketData?.max ?? null,
          deviation: advanced.deviation ?? null,
          trustScore: advanced.trustScore ?? null,
          decision: advanced.status,
          reason: advanced.reason,
        },
      });
    } catch {
      // Log hatası sistemi durdurmaz
    }

    // Eski interface'e uyumlu ModerationResult döndür
    return {
      decision: advanced.status,
      reason: advanced.reason,
      details: {
        categoryLabel: ad.category?.name || null,
        year: ad.year,
        price,
        minPrice: advanced.marketData?.min ?? advanced.legacyResult?.details?.minPrice ?? null,
        maxPrice: advanced.marketData?.max ?? advanced.legacyResult?.details?.maxPrice ?? null,
        ruleMatched: true,
      },
    };
  } catch (error) {
    // FAILSAFE: Gelişmiş sistem patlarsa eski sisteme düş
    console.error(`⚠️ Gelişmiş moderasyon hatası, fallback (İlan #${adId}):`, error);
    return applyPriceModeration(adId);
  }
}
