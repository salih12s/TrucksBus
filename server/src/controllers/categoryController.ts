import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// Helper function to safely parse query/params that can be string or string[]
const parseStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

const parseIntParam = (param: string | string[] | undefined): number => {
  const str = parseStringParam(param);
  return parseInt(str) || 0;
};

const prisma = new PrismaClient();

// Get all categories - OPTIMIZED for fast loading
export const getCategories = async (req: Request, res: Response) => {
  try {
    // ❗ CRITICAL: Categories'i sadece temel bilgilerle yükle - brands ve models lazy loading
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        iconUrl: true,
        displayOrder: true,
        isActive: true,
        description: true,
      },
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    // ❗ CRITICAL: Cache headers ekle - 10 dakika cache
    res.set({
      "Cache-Control": "public, max-age=600, stale-while-revalidate=120",
      ETag: `categories-${categories.length}`,
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get category by ID or slug with all related data
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if id is numeric (ID) or string (slug)
    const isNumeric = /^\d+$/.test(parseStringParam(id));

    // ❗ FIX: Sadece category bilgisini çek, brands'i ayrı çek
    const category = await prisma.category.findUnique({
      where: isNumeric ? { id: parseIntParam(id) } : { slug: parseStringParam(id) },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Brands'i ayrı çek (silinmiş olanları otomatik filtreler)
    const brands = await prisma.brand.findMany({
      where: {
        categories: {
          some: {
            categoryId: category.id,
          },
        },
        isActive: true,
      },
      include: {
        models: {
          include: {
            variants: true,
          },
        },
      },
    });

    // Response'u eski formatla uyumlu hale getir
    const response = {
      ...category,
      brands: brands.map((brand) => ({
        brand,
      })),
    };

    return res.json(response);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get brands for a specific category by slug - OPTIMIZED
export const getBrandsByCategory = async (req: Request, res: Response) => {
  try {
    const { categorySlug } = req.params;

    console.log("🔍 getBrandsByCategory called with slug:", categorySlug);

    // ❗ CRITICAL: Simplified query for performance
    const category = await prisma.category.findUnique({
      where: { slug: parseStringParam(categorySlug) },
      select: { id: true },
    });

    console.log("🔍 Category found:", category);

    if (!category) {
      console.log("❌ Category not found for slug:", categorySlug);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("🔍 Searching for brands with categoryId:", category.id);

    // ❗ FIX: Direkt brands tablosundan çek, category_brands ile JOIN yap
    // Bu şekilde silinmiş brand'ler otomatik filtrelenir
    const brands = await prisma.brand.findMany({
      where: {
        categories: {
          some: {
            categoryId: category.id,
          },
        },
        isActive: true, // Sadece aktif markaları getir
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log("🔍 Valid brands found:", brands.length);
    console.log("🔍 First 3 brands:", brands.slice(0, 3));

    // ❗ CRITICAL: Cache headers - 15 dakika cache
    res.set({
      "Cache-Control": "public, max-age=900, stale-while-revalidate=180",
      ETag: `brands-${categorySlug}-${brands.length}`,
    });

    return res.json(brands);
  } catch (error) {
    console.error("❌ ERROR in getBrandsByCategory:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
    console.error(
      "❌ Error message:",
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({ error: "Server error" });
  }
};

// Get models for a specific brand by slug
export const getModelsByBrand = async (req: Request, res: Response) => {
  try {
    const { categorySlug, brandSlug } = req.params;

    // First find the category and brand
    const category = await prisma.category.findUnique({
      where: { slug: parseStringParam(categorySlug) },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const brand = await prisma.brand.findUnique({
      where: { slug: parseStringParam(brandSlug) },
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    // Get models that belong to BOTH the specific brand AND category
    const models = await prisma.model.findMany({
      where: {
        brandId: brand.id,
        categoryId: category.id, // ⭐ Bu satır eklendi - kategoriye özel filtreleme
      },
      include: {
        _count: {
          select: {
            variants: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(
      `🔍 Found ${models.length} models for brand ${brand.name} in category ${category.name}`,
    );
    console.log(
      `📋 Models:`,
      models.map((m: any) => m.name),
    );

    return res.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get variants for a specific model by slug
export const getVariantsByModel = async (req: Request, res: Response) => {
  try {
    const { categorySlug, brandSlug, modelSlug } = req.params;

    console.log("🔍 Variant İsteği Alındı:");
    console.log("  - categorySlug:", categorySlug);
    console.log("  - brandSlug:", brandSlug);
    console.log("  - modelSlug:", modelSlug);

    // Find the category first
    const category = await prisma.category.findUnique({
      where: { slug: parseStringParam(categorySlug) },
    });

    if (!category) {
      console.log("❌ Category bulunamadı:", categorySlug);
      return res.status(404).json({ error: "Category not found" });
    }

    console.log("✅ Category bulundu:", category.name, "ID:", category.id);

    // Find the brand
    const brand = await prisma.brand.findUnique({
      where: { slug: parseStringParam(brandSlug) },
    });

    if (!brand) {
      console.log("❌ Brand bulunamadı:", brandSlug);
      return res.status(404).json({ error: "Brand not found" });
    }

    console.log("✅ Brand bulundu:", brand.name);

    // Find the model - MUST be in the specified category
    const model = await prisma.model.findFirst({
      where: {
        slug: parseStringParam(modelSlug),
        brandId: brand.id,
        categoryId: category.id, // ✅ Kategoriye göre filtrele
      },
    });

    if (!model) {
      console.log(
        "❌ Model bulunamadı:",
        modelSlug,
        "brandId:",
        brand.id,
        "categoryId:",
        category.id,
      );
      return res
        .status(404)
        .json({ error: "Model not found in this category" });
    }

    console.log(
      "✅ Model bulundu:",
      model.name,
      "categoryId:",
      model.categoryId,
    );

    const variants = await prisma.variant.findMany({
      where: { modelId: model.id },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`✅ ${variants.length} varyant bulundu`);

    return res.json(variants);
  } catch (error) {
    console.error("Error fetching variants:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Admin: Create new brand
export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, categoryId } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
      },
    });

    // Create category-brand relationship
    await prisma.categoryBrand.create({
      data: {
        categoryId: parseInt(categoryId),
        brandId: brand.id,
      },
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin: Create new model
export const createModel = async (req: Request, res: Response) => {
  try {
    const { name, brandId, categoryId } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const model = await prisma.model.create({
      data: {
        name,
        slug,
        brandId: parseInt(brandId),
        categoryId: parseInt(categoryId),
      } as any,
      include: {
        brand: true,
      },
    });

    res.status(201).json(model);
  } catch (error) {
    console.error("Error creating model:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin: Create new variant
export const createVariant = async (req: Request, res: Response) => {
  try {
    const { name, modelId, specifications } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const variant = await prisma.variant.create({
      data: {
        name,
        slug,
        modelId: parseInt(modelId),
        specifications: specifications || null,
      },
      include: {
        model: {
          include: {
            brand: true,
          },
        },
      },
    });

    res.status(201).json(variant);
  } catch (error) {
    console.error("Error creating variant:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get category field configurations
export const getCategoryFields = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    // Category-specific field configurations
    const fieldConfigurations: Record<number, any> = {
      1: {
        // Çekici
        fields: [
          {
            name: "enginePower",
            label: "Motor Gücü (HP)",
            type: "number",
            required: true,
          },
          {
            name: "transmission",
            label: "Şanzıman",
            type: "select",
            options: ["Manuel", "Otomatik", "Yarı Otomatik"],
            required: true,
          },
          {
            name: "fuelType",
            label: "Yakıt Türü",
            type: "select",
            options: ["Dizel", "LPG", "CNG", "Elektrik"],
            required: true,
          },
          {
            name: "axleConfiguration",
            label: "Aks Konfigürasyonu",
            type: "select",
            options: ["4x2", "6x2", "6x4", "8x4"],
            required: true,
          },
          {
            name: "cabinType",
            label: "Kabin Tipi",
            type: "select",
            options: ["Günlük", "Yataklı"],
            required: true,
          },
          {
            name: "emissions",
            label: "Emisyon Standardı",
            type: "select",
            options: ["Euro 3", "Euro 4", "Euro 5", "Euro 6"],
            required: false,
          },
        ],
      },
      2: {
        // Dorse
        fields: [
          { name: "length", label: "Boy (m)", type: "number", required: true },
          { name: "width", label: "En (m)", type: "number", required: true },
          {
            name: "height",
            label: "Yükseklik (m)",
            type: "number",
            required: true,
          },
          {
            name: "loadCapacity",
            label: "Yük Kapasitesi (ton)",
            type: "number",
            required: true,
          },
          {
            name: "dorseType",
            label: "Dorse Tipi",
            type: "select",
            options: [
              "Kapalı Kasa",
              "Açık Kasa",
              "Soğutucu",
              "Tanker",
              "Lowbed",
              "Konteyner Taşıyıcı",
            ],
            required: true,
          },
          {
            name: "axleCount",
            label: "Aks Sayısı",
            type: "select",
            options: ["2 Aks", "3 Aks", "4 Aks"],
            required: true,
          },
          {
            name: "suspensionType",
            label: "Süspansiyon Tipi",
            type: "select",
            options: ["Yaprak Yay", "Hava Süspansiyon"],
            required: false,
          },
        ],
      },
      3: {
        // Kamyon & Kamyonet
        fields: [
          {
            name: "enginePower",
            label: "Motor Gücü (HP)",
            type: "number",
            required: true,
          },
          {
            name: "loadCapacity",
            label: "Yük Kapasitesi (ton)",
            type: "number",
            required: true,
          },
          {
            name: "transmission",
            label: "Şanzıman",
            type: "select",
            options: ["Manuel", "Otomatik", "Yarı Otomatik"],
            required: true,
          },
          {
            name: "fuelType",
            label: "Yakıt Türü",
            type: "select",
            options: ["Dizel", "Benzin", "LPG", "CNG", "Elektrik"],
            required: true,
          },
          {
            name: "bodyType",
            label: "Kasa Tipi",
            type: "select",
            options: [
              "Açık Kasa",
              "Kapalı Kasa",
              "Soğutucu",
              "Damperli",
              "Tanker",
            ],
            required: true,
          },
          {
            name: "driveType",
            label: "Çekiş Tipi",
            type: "select",
            options: ["Önden Çekiş", "Arkadan İtiş", "4x4"],
            required: false,
          },
        ],
      },
      4: {
        // Karoser & Üst Yapı
        fields: [
          {
            name: "applicationArea",
            label: "Uygulama Alanı",
            type: "select",
            options: [
              "İtfaiye",
              "Ambulans",
              "Polis",
              "Kargo",
              "Soğutucu",
              "Tanker",
              "Çöp Toplama",
            ],
            required: true,
          },
          {
            name: "specialEquipment",
            label: "Özel Ekipmanlar",
            type: "textarea",
            required: false,
          },
          {
            name: "certification",
            label: "Sertifikalar",
            type: "textarea",
            required: false,
          },
          {
            name: "customization",
            label: "Özelleştirme Seçenekleri",
            type: "textarea",
            required: false,
          },
        ],
      },
      5: {
        // Minibüs & Midibüs
        fields: [
          {
            name: "passengerCapacity",
            label: "Yolcu Kapasitesi",
            type: "number",
            required: true,
          },
          {
            name: "enginePower",
            label: "Motor Gücü (HP)",
            type: "number",
            required: true,
          },
          {
            name: "transmission",
            label: "Şanzıman",
            type: "select",
            options: ["Manuel", "Otomatik"],
            required: true,
          },
          {
            name: "fuelType",
            label: "Yakıt Türü",
            type: "select",
            options: ["Dizel", "Benzin", "LPG", "CNG", "Elektrik"],
            required: true,
          },
          {
            name: "doorConfiguration",
            label: "Kapı Konfigürasyonu",
            type: "select",
            options: ["1 Kapı", "2 Kapı", "3 Kapı"],
            required: false,
          },
          {
            name: "accessibility",
            label: "Engelli Erişimi",
            type: "boolean",
            required: false,
          },
        ],
      },
      6: {
        // Otobüs
        fields: [
          {
            name: "passengerCapacity",
            label: "Yolcu Kapasitesi",
            type: "number",
            required: true,
          },
          {
            name: "enginePower",
            label: "Motor Gücü (HP)",
            type: "number",
            required: true,
          },
          { name: "length", label: "Boy (m)", type: "number", required: true },
          {
            name: "transmission",
            label: "Şanzıman",
            type: "select",
            options: ["Manuel", "Otomatik"],
            required: true,
          },
          {
            name: "fuelType",
            label: "Yakıt Türü",
            type: "select",
            options: ["Dizel", "CNG", "Elektrik", "Hibrit"],
            required: true,
          },
          {
            name: "serviceType",
            label: "Hizmet Tipi",
            type: "select",
            options: ["Şehir İçi", "Şehirlerarası", "Turizm"],
            required: true,
          },
          {
            name: "floorType",
            label: "Zemin Tipi",
            type: "select",
            options: ["Alçak Zemin", "Yüksek Zemin"],
            required: false,
          },
          {
            name: "accessibility",
            label: "Engelli Erişimi",
            type: "boolean",
            required: false,
          },
        ],
      },
      7: {
        // Oto Kurtarıcı & Taşıyıcı
        fields: [
          {
            name: "liftingCapacity",
            label: "Kaldırma Kapasitesi (ton)",
            type: "number",
            required: true,
          },
          {
            name: "platformLength",
            label: "Platform Uzunluğu (m)",
            type: "number",
            required: true,
          },
          {
            name: "platformWidth",
            label: "Platform Genişliği (m)",
            type: "number",
            required: true,
          },
          {
            name: "equipmentType",
            label: "Ekipman Tipi",
            type: "select",
            options: ["Kurtarıcı", "Taşıyıcı", "Hibrit"],
            required: true,
          },
          {
            name: "hydraulicSystem",
            label: "Hidrolik Sistem",
            type: "boolean",
            required: false,
          },
          {
            name: "winchCapacity",
            label: "Vinç Kapasitesi (ton)",
            type: "number",
            required: false,
          },
        ],
      },
      8: {
        // Römork
        fields: [
          { name: "length", label: "Boy (m)", type: "number", required: true },
          { name: "width", label: "En (m)", type: "number", required: true },
          {
            name: "loadCapacity",
            label: "Yük Kapasitesi (ton)",
            type: "number",
            required: true,
          },
          {
            name: "trailerType",
            label: "Römork Tipi",
            type: "select",
            options: ["Kapalı", "Açık", "Soğutucu", "Tanker", "Özel Amaçlı"],
            required: true,
          },
          {
            name: "axleCount",
            label: "Aks Sayısı",
            type: "select",
            options: ["1 Aks", "2 Aks", "3 Aks"],
            required: true,
          },
          {
            name: "brakeSystem",
            label: "Fren Sistemi",
            type: "select",
            options: ["Hidrolik", "Elektrikli", "Hava Frenli"],
            required: false,
          },
        ],
      },
    };

    const config = fieldConfigurations[parseIntParam(categoryId)];
    if (!config) {
      return res
        .status(404)
        .json({ error: "Category configuration not found" });
    }

    return res.json(config);
  } catch (error) {
    console.error("Error fetching category fields:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get single brand by slug
export const getBrandBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { categorySlug, brandSlug } = req.params;

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { slug: parseStringParam(categorySlug) },
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const brand = await prisma.brand.findUnique({
      where: { slug: parseStringParam(brandSlug) },
      include: {
        _count: {
          select: { models: true },
        },
      },
    });

    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    res.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single model by slug
export const getModelBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { categorySlug, brandSlug, modelSlug } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { slug: parseStringParam(brandSlug) },
    });

    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    const model = await prisma.model.findFirst({
      where: {
        slug: parseStringParam(modelSlug),
        brandId: brand.id,
      },
      include: {
        _count: {
          select: { variants: true },
        },
      },
    });

    if (!model) {
      res.status(404).json({ error: "Model not found" });
      return;
    }

    res.json(model);
  } catch (error) {
    console.error("Error fetching model:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single variant by slug
export const getVariantBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { categorySlug, brandSlug, modelSlug, variantSlug } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { slug: parseStringParam(brandSlug) },
    });

    if (!brand) {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    const model = await prisma.model.findFirst({
      where: {
        slug: parseStringParam(modelSlug),
        brandId: brand.id,
      },
    });

    if (!model) {
      res.status(404).json({ error: "Model not found" });
      return;
    }

    const variant = await prisma.variant.findFirst({
      where: {
        slug: parseStringParam(variantSlug),
        modelId: model.id,
      },
    });

    if (!variant) {
      res.status(404).json({ error: "Variant not found" });
      return;
    }

    res.json(variant);
  } catch (error) {
    console.error("Error fetching variant:", error);
    res.status(500).json({ error: "Server error" });
  }
};
