import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all ads with filters
export const getAds = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      brandId,
      modelId,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      location,
      status = "APPROVED",
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      status: status as string,
    };

    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (brandId) where.brandId = parseInt(brandId as string);
    if (modelId) where.modelId = parseInt(modelId as string);
    if (location)
      where.location = { contains: location as string, mode: "insensitive" };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear as string);
      if (maxYear) where.year.lte = parseInt(maxYear as string);
    }

    const ads = await prisma.ad.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            city: true,
            phone: true,
          },
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: {
        [sortBy as string]: sortOrder as "asc" | "desc",
      },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.ad.count({ where });

    res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get ad by ID
export const getAdById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ad = await prisma.ad.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            city: true,
            phone: true,
            email: true,
          },
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Increment view count
    await prisma.ad.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } },
    });

    return res.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Create new ad
export const createAd = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      categoryId,
      brandId,
      modelId,
      variantId,
      title,
      description,
      price,
      year,
      mileage,
      location,
      latitude,
      longitude,
      customFields,
    } = req.body;

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: parseInt(categoryId),
        brandId: brandId ? parseInt(brandId) : null,
        modelId: modelId ? parseInt(modelId) : null,
        variantId: variantId ? parseInt(variantId) : null,
        title,
        description,
        price: price ? parseFloat(price) : null,
        year: year ? parseInt(year) : null,
        mileage: mileage ? parseInt(mileage) : null,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        customFields: customFields || null,
        status: "PENDING", // All ads require approval
      },
      include: {
        category: true,
        brand: true,
        model: true,
        variant: true,
      },
    });

    res.status(201).json(ad);
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update ad
export const updateAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const existingAd = await prisma.ad.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAd) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check ownership or admin rights
    if (
      existingAd.userId !== userId &&
      !["ADMIN", "MODERATOR"].includes(userRole)
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const {
      title,
      description,
      price,
      year,
      mileage,
      location,
      latitude,
      longitude,
      customFields,
      status,
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined)
      updateData.price = price ? parseFloat(price) : null;
    if (year !== undefined) updateData.year = year ? parseInt(year) : null;
    if (mileage !== undefined)
      updateData.mileage = mileage ? parseInt(mileage) : null;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined)
      updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined)
      updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (customFields !== undefined) updateData.customFields = customFields;

    // Only admins/moderators can change status
    if (status !== undefined && ["ADMIN", "MODERATOR"].includes(userRole)) {
      updateData.status = status;
    }

    const ad = await prisma.ad.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        brand: true,
        model: true,
        variant: true,
        images: true,
      },
    });

    return res.json(ad);
  } catch (error) {
    console.error("Error updating ad:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Delete ad
export const deleteAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const existingAd = await prisma.ad.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingAd) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check ownership or admin rights
    if (
      existingAd.userId !== userId &&
      !["ADMIN", "MODERATOR"].includes(userRole)
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.ad.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get user's ads
export const getUserAds = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId };
    if (status) where.status = status;

    const ads = await prisma.ad.findMany({
      where,
      include: {
        category: true,
        brand: true,
        model: true,
        variant: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.ad.count({ where });

    res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching user ads:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin ilan onaylama/reddetme
export const moderateAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = (req as any).user.id;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const ad = await prisma.ad.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(status === "APPROVED" && { publishedAt: new Date() }),
        ...(status === "REJECTED" && {
          rejectedAt: new Date(),
          rejectedReason: reason,
        }),
      },
    });

    // Admin review kaydı oluştur - şimdilik console'a yazdır
    console.log(
      `Admin ${adminId} ${status} ad ${id}. Reason: ${
        reason || "No reason provided"
      }`
    );

    return res.json({ message: `Ad ${status.toLowerCase()} successfully`, ad });
  } catch (error) {
    console.error("Error moderating ad:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// İlan oluştur (Minibüs & Midibüs)
export const createMinibusAd = async (req: Request, res: Response) => {
  try {
    console.log("🚛 Minibüs İlanı API'ye istek geldi");
    console.log("📦 Request body:", req.body);
    console.log("📦 Request headers:", req.headers);
    console.log("📦 Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı girişi gerekli" });
    }

    const {
      title,
      description,
      year,
      price,
      mileage,
      condition,
      engineVolume,
      drivetrain,
      color,
      seatCount,
      roofType,
      chassis,
      transmission,
      fuelType,
      exchange,
      plateType,
      plateNumber,
      cityId,
      districtId,
      address,
      detailedInfo,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      // Detay bilgiler
      features,
    } = req.body;

    // Enum değerlerini dönüştür
    const vehicleConditionMap: Record<string, string> = {
      "ikinci-el": "USED",
      "yurtdisindan-ithal": "IMPORTED",
      sifir: "NEW",
    };

    const driveTypeMap: Record<string, string> = {
      "onden-cekis": "FRONT_WHEEL_DRIVE",
      "arkadan-itis": "REAR_WHEEL_DRIVE",
      "4wd-surekli": "ALL_WHEEL_DRIVE",
      "arkadan-itis-elektronik": "REAR_WHEEL_ELECTRONIC",
    };

    const transmissionMap: Record<string, string> = {
      manuel: "MANUAL",
      otomatik: "AUTOMATIC",
    };

    const fuelTypeMap: Record<string, string> = {
      benzinli: "GASOLINE",
      "benzinli-lpg": "GASOLINE_LPG",
      dizel: "DIESEL",
    };

    const roofTypeMap: Record<string, string> = {
      "normal-tavan": "NORMAL",
      "yuksek-tavan": "HIGH",
    };

    const chassisTypeMap: Record<string, string> = {
      kisa: "SHORT",
      orta: "MEDIUM",
      uzun: "LONG",
      "ekstra-uzun": "EXTRA_LONG",
    };

    const plateTypeMap: Record<string, string> = {
      "tr-plakali": "TR_PLATE",
      "mavi-plakali": "BLUE_PLATE",
    };

    // Detay özelliklerini JSON olarak hazırla
    let detailFeaturesJson = null;
    if (features) {
      try {
        detailFeaturesJson =
          typeof features === "string" ? JSON.parse(features) : features;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        detailFeaturesJson = features; // Fallback
      }
    }

    // Minibüs kategorisini bul
    const minibusCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "minibus" },
          { slug: "minibus-midibus" },
          { name: { contains: "Minibüs" } },
        ],
      },
    });

    if (!minibusCategory) {
      return res.status(400).json({ error: "Minibüs kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: minibusCategory.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        mileage: mileage ? parseInt(mileage) : null,
        customFields: {
          condition: condition || null,
          engineVolume: engineVolume || null,
          drivetrain: drivetrain || null,
          color: color || null,
          seatCount: seatCount || null,
          roofType: roofType || null,
          chassis: chassis || null,
          transmission: transmission || null,
          fuelType: fuelType || null,
          exchange: exchange || null,
          plateType: plateType || null,
          plateNumber: plateNumber || null,
          address: address || null,
          detailedInfo: detailedInfo || null,
          detailFeatures: detailFeaturesJson || null,
          cityId: cityId ? parseInt(cityId) : null,
          districtId: districtId ? parseInt(districtId) : null,
        },
        status: "PENDING",
      },
      include: {
        category: true,
        user: true,
      },
    });

    return res.status(201).json({
      message: "İlan başarıyla oluşturuldu ve onay bekliyor",
      ad,
    });
  } catch (error: any) {
    console.error("İlan oluşturma hatası detayı:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "İlan oluşturulurken hata oluştu",
      details: error.message,
    });
  }
};

// İlan oluştur (Çekici)
export const createCekiciAd = async (req: Request, res: Response) => {
  try {
    console.log("🚚 Çekici İlanı API'ye istek geldi");
    console.log("📦 Request body:", req.body);
    console.log("📦 Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı girişi gerekli" });
    }

    const {
      title,
      description,
      year,
      price,
      mileage,
      condition,
      color,
      fuelType,
      transmission,
      enginePower,
      engineCapacity,
      cabinType,
      bedCount,
      dorseAvailable,
      plateType,
      plateNumber,
      tireCondition,
      damageRecord,
      paintChange,
      exchange,
      cityId,
      districtId,
      detailedInfo,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      features,
    } = req.body;

    // Özellikleri JSON olarak hazırla
    let featuresJson = null;
    if (features) {
      try {
        featuresJson =
          typeof features === "string" ? JSON.parse(features) : features;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        featuresJson = features;
      }
    }

    // Çekici kategorisini bul
    const cekiciCategory = await prisma.category.findFirst({
      where: {
        OR: [{ slug: "cekici" }, { name: { contains: "Çekici" } }],
      },
    });

    if (!cekiciCategory) {
      return res.status(400).json({ error: "Çekici kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: cekiciCategory.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        mileage: mileage ? parseInt(mileage) : null,
        customFields: {
          condition: condition || null,
          color: color || null,
          fuelType: fuelType || null,
          transmission: transmission || null,
          enginePower: enginePower || null,
          engineCapacity: engineCapacity || null,
          cabinType: cabinType || null,
          bedCount: bedCount || null,
          dorseAvailable: dorseAvailable || null,
          plateType: plateType || null,
          plateNumber: plateNumber || null,
          tireCondition: tireCondition || null,
          damageRecord: damageRecord || null,
          paintChange: paintChange || null,
          exchange: exchange || null,
          cityId: cityId || null,
          districtId: districtId || null,
          detailedInfo: detailedInfo || null,
          features: featuresJson,
        },
        status: "PENDING",
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      message: "Çekici ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad,
    });
  } catch (error: any) {
    console.error("Çekici ilanı oluşturma hatası detayı:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "İlan oluşturulurken hata oluştu",
      details: error.message,
    });
  }
};

// İl listesi
export const getCities = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Cities endpoint called - checking database...");

    // Geçici olarak ham SQL kullan
    const cities =
      await prisma.$queryRaw`SELECT id, name, plate_code as "plateCode" FROM cities WHERE is_active = true ORDER BY name ASC`;

    console.log(`Returning cities:`, cities);
    res.json(cities);
  } catch (error) {
    console.error("İl listesi hatası:", error);
    console.error("Error details:", error);
    res.status(500).json({ error: "İl listesi alınırken hata oluştu" });
  }
};

// İlçe listesi
export const getDistricts = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;

    const districts =
      await prisma.$queryRaw`SELECT id, name, city_id as "cityId" FROM districts WHERE city_id = ${parseInt(
        cityId
      )} AND is_active = true ORDER BY name ASC`;

    res.json(districts);
  } catch (error) {
    console.error("İlçe listesi hatası:", error);
    res.status(500).json({ error: "İlçe listesi alınırken hata oluştu" });
  }
};

// Admin: Onay bekleyen ilanları getir
export const getPendingAds = async (req: Request, res: Response) => {
  try {
    const pendingAds = await prisma.ad.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(pendingAds);
  } catch (error) {
    console.error("Onay bekleyen ilanlar hatası:", error);
    res
      .status(500)
      .json({ error: "Onay bekleyen ilanlar alınırken hata oluştu" });
  }
};

// Admin: İlanı onayla
export const approveAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ad = await prisma.ad.update({
      where: { id: parseInt(id) },
      data: {
        status: "APPROVED",
      },
      include: {
        user: true,
      },
    });

    // Kullanıcıya onay bildirimi (şimdilik console log)
    console.log(`İlan onaylandı: ${ad.title} - Kullanıcı: ${ad.user.email}`);

    res.json({ message: "İlan başarıyla onaylandı", ad });
  } catch (error) {
    console.error("İlan onaylama hatası:", error);
    res.status(500).json({ error: "İlan onaylanırken hata oluştu" });
  }
};

// Admin: İlanı reddet
export const rejectAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ad = await prisma.ad.update({
      where: { id: parseInt(id) },
      data: {
        status: "REJECTED",
      },
      include: {
        user: true,
      },
    });

    // Kullanıcıya red bildirimi (şimdilik console log)
    console.log(
      `İlan reddedildi: ${ad.title} - Kullanıcı: ${ad.user.email} - Sebep: ${reason}`
    );

    res.json({ message: "İlan başarıyla reddedildi", ad });
  } catch (error) {
    console.error("İlan reddetme hatası:", error);
    res.status(500).json({ error: "İlan reddedilirken hata oluştu" });
  }
};

// İlan oluştur (Kamyon)
export const createKamyonAd = async (req: Request, res: Response) => {
  try {
    console.log("🚛 Kamyon İlanı API'ye istek geldi");
    console.log("📦 Request body:", req.body);
    console.log("📦 Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı girişi gerekli" });
    }

    const {
      title,
      description,
      year,
      price,
      mileage,
      condition,
      color,
      fuelType,
      transmission,
      motorPower,
      drivetrain,
      loadCapacity,
      cabin,
      tireCondition,
      superstructure,
      exchange,
      plateType,
      plateNumber,
      cityId,
      districtId,
      address,
      detailedInfo,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      features,
    } = req.body;

    // Özellikleri JSON olarak hazırla
    let featuresJson = null;
    if (features) {
      try {
        featuresJson =
          typeof features === "string" ? JSON.parse(features) : features;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        featuresJson = features;
      }
    }

    // Kamyon kategorisini bul
    const kamyonCategory = await prisma.category.findFirst({
      where: {
        OR: [{ slug: "kamyon" }, { name: { contains: "Kamyon" } }],
      },
    });

    if (!kamyonCategory) {
      return res.status(400).json({ error: "Kamyon kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: kamyonCategory.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        mileage: mileage ? parseInt(mileage) : null,
        customFields: {
          condition: condition || null,
          color: color || null,
          fuelType: fuelType || null,
          transmission: transmission || null,
          motorPower: motorPower || null,
          drivetrain: drivetrain || null,
          loadCapacity: loadCapacity || null,
          cabin: cabin || null,
          tireCondition: tireCondition || null,
          superstructure: superstructure || null,
          exchange: exchange || null,
          plateType: plateType || null,
          plateNumber: plateNumber || null,
          address: address || null,
          cityId: cityId ? parseInt(cityId) : null,
          districtId: districtId ? parseInt(districtId) : null,
          detailedInfo: detailedInfo || null,
          features: featuresJson || null,
        },
        status: "PENDING",
      },
      include: {
        category: true,
        user: true,
      },
    });

    return res.status(201).json({
      message: "Kamyon ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad,
    });
  } catch (error: any) {
    console.error("Kamyon ilanı oluşturma hatası detayı:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "İlan oluşturulurken hata oluştu",
      details: error.message,
    });
  }
};

// İlan oluştur (Otobüs)
export const createOtobusAd = async (req: Request, res: Response) => {
  try {
    console.log("🚌 Otobüs İlanı API'ye istek geldi");
    console.log("📦 Request body:", req.body);
    console.log("📦 Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı girişi gerekli" });
    }

    const {
      title,
      description,
      year,
      price,
      mileage,
      condition,
      color,
      fuelType,
      transmission,
      passengerCapacity,
      seatLayout,
      seatBackScreen,
      tireCondition,
      fuelCapacity,
      exchange,
      damageRecord,
      paintChange,
      plateType,
      plateNumber,
      cityId,
      districtId,
      detailedInfo,
      features,
      drivetrain,
      gearType,
      gearCount,
    } = req.body;

    // Özellikleri JSON olarak hazırla
    let featuresJson = null;
    if (features) {
      try {
        featuresJson =
          typeof features === "string" ? JSON.parse(features) : features;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        featuresJson = features;
      }
    }

    // Otobüs kategorisini bul
    const otobusCategory = await prisma.category.findFirst({
      where: {
        OR: [{ slug: "otobus" }, { name: { contains: "Otobüs" } }],
      },
    });

    if (!otobusCategory) {
      return res.status(400).json({ error: "Otobüs kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: otobusCategory.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        mileage: mileage ? parseInt(mileage) : null,
        customFields: {
          condition: condition || null,
          color: color || null,
          fuelType: fuelType || null,
          transmission: transmission || null,
          passengerCapacity: passengerCapacity || null,
          seatLayout: seatLayout || null,
          seatBackScreen: seatBackScreen || null,
          tireCondition: tireCondition ? parseInt(tireCondition) : null,
          fuelCapacity: fuelCapacity || null,
          exchange: exchange || null,
          damageRecord: damageRecord || null,
          paintChange: paintChange || null,
          plateType: plateType || null,
          plateNumber: plateNumber || null,
          cityId: cityId ? parseInt(cityId) : null,
          districtId: districtId ? parseInt(districtId) : null,
          detailedInfo: detailedInfo || null,
          drivetrain: drivetrain || null,
          gearType: gearType || null,
          gearCount: gearCount || null,
          features: featuresJson || null,
        },
        status: "PENDING",
      },
      include: {
        category: true,
        user: true,
      },
    });

    // Fotoğraf işleme
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      console.log(`📷 ${files.length} fotoğraf yükleniyor...`);

      const imagePromises = files.map((file, index) => {
        const isShowcase = file.fieldname === "showcasePhoto";

        return prisma.adImage.create({
          data: {
            adId: ad.id,
            imageUrl: `/uploads/${file.filename}`,
            isPrimary: isShowcase,
            displayOrder: isShowcase ? 0 : index + 1,
            altText: `${title} - ${isShowcase ? "Vitrin" : "Fotoğraf"} ${
              index + 1
            }`,
          },
        });
      });

      await Promise.all(imagePromises);
      console.log("✅ Tüm fotoğraflar başarıyla kaydedildi");
    }

    return res.status(201).json({
      message: "Otobüs ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad,
    });
  } catch (error: any) {
    console.error("Otobüs ilanı oluşturma hatası detayı:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "İlan oluşturulurken hata oluştu",
      details: error.message,
    });
  }
};

// İlan oluştur (Dorse)
export const createDorseAd = async (req: Request, res: Response) => {
  try {
    console.log("🚛 Dorse İlanı API'ye istek geldi");
    console.log("📦 Request body:", req.body);
    console.log("📦 Request headers:", req.headers);
    console.log("📦 Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı girişi gerekli" });
    }

    const {
      title,
      description,
      year,
      price,
      cityId,
      districtId,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      // Dorse özel alanları
      genislik,
      uzunluk,
      lastikDurumu,
      devrilmeYonu,
      warranty,
      negotiable,
      exchange,
    } = req.body;

    // Dorse kategorisini bul
    const dorseCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "dorse" },
          { slug: "damperli-dorse" },
          { name: { contains: "Dorse" } },
        ],
      },
    });

    if (!dorseCategory) {
      return res.status(400).json({ error: "Dorse kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: dorseCategory.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        customFields: {
          genislik: genislik || null,
          uzunluk: uzunluk || null,
          lastikDurumu: lastikDurumu || null,
          devrilmeYonu: devrilmeYonu || null,
          warranty: warranty || null,
          negotiable: negotiable || null,
          exchange: exchange || null,
          cityId: cityId ? parseInt(cityId) : null,
          districtId: districtId ? parseInt(districtId) : null,
          categorySlug: categorySlug || null,
          brandSlug: brandSlug || null,
          modelSlug: modelSlug || null,
          variantSlug: variantSlug || null,
        },
        status: "PENDING",
      },
      include: {
        category: true,
        user: true,
      },
    });

    return res.status(201).json({
      message: "Dorse ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad,
    });
  } catch (error: any) {
    console.error("Dorse ilanı oluşturma hatası detayı:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "İlan oluşturulurken hata oluştu",
      details: error.message,
    });
  }
};
