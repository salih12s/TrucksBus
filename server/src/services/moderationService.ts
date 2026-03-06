/**
 * Otomatik Moderasyon Servisi
 *
 * İlan oluşturulduktan sonra fiyat kontrolü yaparak
 * otomatik onay veya red kararı verir.
 *
 * Mevcut ilan oluşturma akışını BOZMAZ.
 * Ad create edildikten sonra çağrılır ve status günceller.
 */

import { PrismaClient } from "@prisma/client";
import {
  PRICE_RULES,
  CategoryPriceRule,
  PriceRange,
} from "../config/priceRules";

const prisma = new PrismaClient();

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
