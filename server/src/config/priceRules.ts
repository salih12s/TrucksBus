/**
 * Otomatik Moderasyon - Fiyat Kuralları Konfigürasyonu
 *
 * Kategori ve araç yılına göre belirlenen min/max fiyat aralıkları (TRY).
 * Bu aralıkların dışındaki fiyatlar otomatik reddedilir.
 */

export interface PriceRange {
  yearMin: number;
  yearMax: number;
  minPrice: number;
  maxPrice: number;
}

export interface CategoryPriceRule {
  /** Kategori adı (Türkçe) */
  label: string;
  /** Eşleşecek slug'lar (birden fazla slug aynı kurala bağlanabilir) */
  slugs: string[];
  /** Eşleşecek kategori adı kalıpları (case-insensitive contains) */
  namePatterns: string[];
  /** Yıl aralıklarına göre fiyat kuralları */
  ranges: PriceRange[];
}

export const PRICE_RULES: CategoryPriceRule[] = [
  {
    label: "Çekici (Tractor)",
    slugs: ["cekici", "tractor"],
    namePatterns: ["çekici", "cekici", "tractor"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 350_000, maxPrice: 900_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 700_000, maxPrice: 1_600_000 },
      {
        yearMin: 2011,
        yearMax: 2015,
        minPrice: 1_200_000,
        maxPrice: 3_000_000,
      },
      {
        yearMin: 2016,
        yearMax: 2019,
        minPrice: 2_200_000,
        maxPrice: 4_500_000,
      },
      {
        yearMin: 2020,
        yearMax: 2024,
        minPrice: 3_500_000,
        maxPrice: 8_000_000,
      },
    ],
  },
  {
    label: "Dorse",
    slugs: ["dorse", "trailer"],
    namePatterns: ["dorse"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 120_000, maxPrice: 350_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 200_000, maxPrice: 600_000 },
      { yearMin: 2011, yearMax: 2015, minPrice: 400_000, maxPrice: 1_200_000 },
      { yearMin: 2016, yearMax: 2019, minPrice: 700_000, maxPrice: 1_800_000 },
      {
        yearMin: 2020,
        yearMax: 2024,
        minPrice: 1_200_000,
        maxPrice: 3_000_000,
      },
    ],
  },
  {
    label: "Kamyon & Kamyonet",
    slugs: ["kamyon-kamyonet", "kamyon", "kamyonet", "truck"],
    namePatterns: ["kamyon", "kamyonet"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 200_000, maxPrice: 600_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 350_000, maxPrice: 1_200_000 },
      { yearMin: 2011, yearMax: 2015, minPrice: 700_000, maxPrice: 2_200_000 },
      {
        yearMin: 2016,
        yearMax: 2019,
        minPrice: 1_200_000,
        maxPrice: 3_500_000,
      },
      {
        yearMin: 2020,
        yearMax: 2024,
        minPrice: 2_000_000,
        maxPrice: 6_000_000,
      },
    ],
  },
  {
    label: "Karoser & Üst Yapı",
    slugs: ["karoser", "karoser-ust-yapi", "bodywork"],
    namePatterns: ["karoser", "üst yapı", "ust yapi"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 80_000, maxPrice: 250_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 120_000, maxPrice: 500_000 },
      { yearMin: 2011, yearMax: 2015, minPrice: 250_000, maxPrice: 900_000 },
      { yearMin: 2016, yearMax: 2019, minPrice: 400_000, maxPrice: 1_400_000 },
      { yearMin: 2020, yearMax: 2024, minPrice: 700_000, maxPrice: 2_500_000 },
    ],
  },
  {
    label: "Minibüs & Midibüs",
    slugs: ["minibus-midibus", "minibus", "midibus"],
    namePatterns: ["minibüs", "minibus", "midibüs", "midibus"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 180_000, maxPrice: 500_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 300_000, maxPrice: 900_000 },
      { yearMin: 2011, yearMax: 2015, minPrice: 600_000, maxPrice: 1_800_000 },
      {
        yearMin: 2016,
        yearMax: 2019,
        minPrice: 1_200_000,
        maxPrice: 3_000_000,
      },
      {
        yearMin: 2020,
        yearMax: 2024,
        minPrice: 2_000_000,
        maxPrice: 5_500_000,
      },
    ],
  },
  {
    label: "Otobüs",
    slugs: ["otobus", "bus"],
    namePatterns: ["otobüs", "otobus"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 400_000, maxPrice: 1_200_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 700_000, maxPrice: 2_200_000 },
      {
        yearMin: 2011,
        yearMax: 2015,
        minPrice: 1_500_000,
        maxPrice: 4_000_000,
      },
      {
        yearMin: 2016,
        yearMax: 2019,
        minPrice: 3_000_000,
        maxPrice: 7_000_000,
      },
      {
        yearMin: 2020,
        yearMax: 2024,
        minPrice: 5_000_000,
        maxPrice: 12_000_000,
      },
    ],
  },
  {
    label: "Oto Kurtarıcı & Taşıyıcı",
    slugs: ["oto-kurtarici-tasiyici", "oto-kurtarici", "recovery-vehicle"],
    namePatterns: ["kurtarıcı", "kurtarici", "taşıyıcı", "tasiyici"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 250_000, maxPrice: 700_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 450_000, maxPrice: 1_400_000 },
      { yearMin: 2011, yearMax: 2015, minPrice: 900_000, maxPrice: 2_800_000 },
      {
        yearMin: 2016,
        yearMax: 2019,
        minPrice: 1_500_000,
        maxPrice: 4_000_000,
      },
      {
        yearMin: 2020,
        yearMax: 2024,
        minPrice: 2_500_000,
        maxPrice: 7_000_000,
      },
    ],
  },
  {
    label: "Römork",
    slugs: ["romork", "kamyon-romork", "tarim-romork", "tasima-romork"],
    namePatterns: ["römork", "romork"],
    ranges: [
      { yearMin: 2000, yearMax: 2005, minPrice: 40_000, maxPrice: 120_000 },
      { yearMin: 2006, yearMax: 2010, minPrice: 70_000, maxPrice: 200_000 },
      { yearMin: 2011, yearMax: 2015, minPrice: 120_000, maxPrice: 350_000 },
      { yearMin: 2016, yearMax: 2019, minPrice: 200_000, maxPrice: 600_000 },
      { yearMin: 2020, yearMax: 2024, minPrice: 350_000, maxPrice: 1_200_000 },
    ],
  },
];
