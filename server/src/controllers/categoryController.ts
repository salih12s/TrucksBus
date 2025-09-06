import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all categories with their brands and models
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        brands: {
          include: {
            brand: {
              include: {
                models: {
                  include: {
                    variants: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        displayOrder: "asc",
      },
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
    const isNumeric = /^\d+$/.test(id);

    const category = await prisma.category.findUnique({
      where: isNumeric ? { id: parseInt(id) } : { slug: id },
      include: {
        brands: {
          include: {
            brand: {
              include: {
                models: {
                  include: {
                    variants: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get brands for a specific category by slug
export const getBrandsByCategory = async (req: Request, res: Response) => {
  try {
    const { categorySlug } = req.params;

    // First find the category by slug
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryBrands = await prisma.categoryBrand.findMany({
      where: { categoryId: category.id },
      include: {
        brand: {
          include: {
            _count: {
              select: {
                models: true,
              },
            },
          },
        },
      },
    });

    const brands = categoryBrands.map((cb) => cb.brand);
    return res.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get models for a specific brand by slug
export const getModelsByBrand = async (req: Request, res: Response) => {
  try {
    const { categorySlug, brandSlug } = req.params;

    // First find the category and brand
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const models = await prisma.model.findMany({
      where: {
        brandId: brand.id,
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

    // Find the brand and model
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const model = await prisma.model.findFirst({
      where: {
        slug: modelSlug,
        brandId: brand.id,
      },
    });

    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    const variants = await prisma.variant.findMany({
      where: { modelId: model.id },
      orderBy: {
        name: "asc",
      },
    });

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
      },
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

    const config = fieldConfigurations[parseInt(categoryId)];
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
