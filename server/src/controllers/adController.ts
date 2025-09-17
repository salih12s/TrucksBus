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
        city: true,
        district: true,
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
            createdAt: true,
            isVerified: true,
          },
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        city: true,
        district: true,
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

    // User'ın toplam ilanlarını çek
    const userTotalAds = await prisma.ad.count({
      where: {
        userId: ad.userId,
        status: "APPROVED",
      },
    });

    // Response'u format et
    const formattedAd = {
      ...ad,
      user: {
        ...ad.user,
        name:
          ad.user.companyName ||
          `${ad.user.firstName || ""} ${ad.user.lastName || ""}`.trim() ||
          "Bilinmeyen Satıcı",
        totalAds: userTotalAds,
      },
    };

    return res.json(formattedAd);
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
        city: true,
        district: true,
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
        // City ve District'i asıl sütunlara kaydet
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
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
          // CustomFields'ta da sakla (backward compatibility için)
          cityId: cityId ? parseInt(cityId) : null,
          districtId: districtId ? parseInt(districtId) : null,
        },
        status: "PENDING",
      },
    });

    // Resim yükleme işlemi (Base64 formatında)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "📷 Resimler base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("📷 Vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );
      for (const file of photoFiles) {
        // Base64 formatına çevir
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(`📷 Resim ${displayOrder} base64 formatında kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          })
        );
        displayOrder++;
      }

      // Tüm resimleri veritabanına kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `✅ ${imagePromises.length} resim başarıyla base64 formatında kaydedildi`
        );
      }
    }

    // Oluşturulan ilanı resimlerle birlikte getir
    const createdAd = await prisma.ad.findUnique({
      where: { id: ad.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return res.status(201).json({
      message: "Minibüs ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad: createdAd,
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
        // City ve District'i asıl sütunlara kaydet
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
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

    console.log("✅ Çekici ilanı oluşturuldu, ID:", ad.id);

    // Resim yükleme işlemleri
    const files = req.files as any;
    console.log("📂 Yüklenen dosyalar:", files);

    if (files && files.length > 0) {
      console.log(
        "📷 Resimler base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises: any[] = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("� Vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );
      for (const file of photoFiles) {
        // Base64 formatına çevir
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(`📷 Resim ${displayOrder} base64 formatında kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          })
        );
        displayOrder++;
      }

      // Tüm resimleri veritabanına kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `✅ ${imagePromises.length} resim başarıyla base64 formatında kaydedildi`
        );
      }
    }

    // Oluşturulan ilanı resimlerle birlikte getir
    const createdAd = await prisma.ad.findUnique({
      where: { id: ad.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return res.status(201).json({
      message: "Çekici ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad: createdAd,
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
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        district: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Pending ads fetched:", pendingAds.length);
    if (pendingAds.length > 0) {
      console.log("Sample ad fields:", Object.keys(pendingAds[0]));
    }

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
        // City ve District'i asıl sütunlara kaydet
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
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

    console.log("✅ Kamyon ilanı oluşturuldu, ID:", ad.id);

    // Resim yükleme işlemleri
    const files = req.files as any;
    console.log("📂 Yüklenen dosyalar:", files);

    if (files && files.length > 0) {
      console.log(
        "📷 Resimler base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises: any[] = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("� Vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );
      for (const file of photoFiles) {
        // Base64 formatına çevir
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(`📷 Resim ${displayOrder} base64 formatında kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          })
        );
        displayOrder++;
      }

      // Tüm resimleri veritabanına kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `✅ ${imagePromises.length} resim başarıyla base64 formatında kaydedildi`
        );
      }
    }

    // Oluşturulan ilanı resimlerle birlikte getir
    const createdAd = await prisma.ad.findUnique({
      where: { id: ad.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return res.status(201).json({
      message: "Kamyon ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad: createdAd,
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

    // Debug için form verilerini log'la
    console.log("🚌 Otobüs form verileri:", {
      condition,
      color,
      fuelType,
      transmission,
      passengerCapacity,
      seatLayout,
      seatBackScreen,
      tireCondition,
      fuelCapacity,
    });

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
        // City ve District'i asıl sütunlara kaydet
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
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

    console.log("✅ Otobüs ilanı oluşturuldu, ID:", ad.id);

    // Resim yükleme işlemleri
    const files = req.files as any;
    console.log("📂 Yüklenen dosyalar:", files);

    if (files && files.length > 0) {
      console.log(
        "📷 Resimler base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises: any[] = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("� Vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );
      for (const file of photoFiles) {
        // Base64 formatına çevir
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(`📷 Resim ${displayOrder} base64 formatında kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          })
        );
        displayOrder++;
      }

      // Tüm resimleri veritabanına kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `✅ ${imagePromises.length} resim başarıyla base64 formatında kaydedildi`
        );
      }
    }

    // Oluşturulan ilanı resimlerle birlikte getir
    const createdAd = await prisma.ad.findUnique({
      where: { id: ad.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return res.status(201).json({
      message: "Otobüs ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad: createdAd,
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
      // Lowbed özel alanları
      havuzDerinligi,
      havuzGenisligi,
      havuzUzunlugu,
      istiapHaddi,
      uzatilabilirProfil,
      dingilSayisi,
      rampaMekanizmasi,
      // İletişim ve detay bilgileri
      sellerName,
      phone,
      email,
      detailedInfo,
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
        cityId: cityId ? parseInt(cityId) : null,
        districtId: districtId ? parseInt(districtId) : null,
        customFields: {
          genislik: genislik || null,
          uzunluk: uzunluk || null,
          lastikDurumu: lastikDurumu || null,
          devrilmeYonu: devrilmeYonu || null,
          warranty: warranty || null,
          negotiable: negotiable || null,
          exchange: exchange || null,
          sellerName: sellerName || null,
          phone: phone || null,
          email: email || null,
          detailedInfo: detailedInfo || null,
          categorySlug: categorySlug || null,
          brandSlug: brandSlug || null,
          modelSlug: modelSlug || null,
          variantSlug: variantSlug || null,
          // Lowbed özel alanları
          havuzDerinligi: havuzDerinligi || null,
          havuzGenisligi: havuzGenisligi || null,
          havuzUzunlugu: havuzUzunlugu || null,
          istiapHaddi: istiapHaddi || null,
          uzatilabilirProfil: uzatilabilirProfil || null,
          dingilSayisi: dingilSayisi || null,
          rampaMekanizmasi: rampaMekanizmasi
            ? typeof rampaMekanizmasi === "string"
              ? rampaMekanizmasi
              : JSON.stringify(rampaMekanizmasi)
            : null,
        },
        status: "PENDING",
      },
      include: {
        category: true,
        user: true,
      },
    });

    // Resim yükleme işlemi (Base64 formatında)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "📷 Dorse resimleri base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("📷 Vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );
      for (const file of photoFiles) {
        // Base64 formatına çevir
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(
          `📷 Dorse resim ${displayOrder} base64 formatında kaydediliyor`
        );

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          })
        );
        displayOrder++;
      }

      // Tüm resimleri paralel olarak kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(`✅ ${imagePromises.length} resim başarıyla kaydedildi`);
      }
    }

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

// İlan oluştur (Karoser Üst Yapı)
export const createKaroserAd = async (req: Request, res: Response) => {
  try {
    console.log("🏗️ Karoser Üst Yapı İlanı API'ye istek geldi");
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
      productionYear, // Sabit Kabin formlarında productionYear kullanılıyor
      price,
      cityId,
      districtId,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      // Karoser özel alanları (Damperli)
      genislik,
      uzunluk,
      lastikDurumu,
      devrilmeYonu,
      tippingDirection, // Ahşap Kasa
      // Sabit Kabin özel alanları
      length, // Açık Kasa, Kapalı Kasa
      width, // Açık Kasa, Kapalı Kasa
      isExchangeable, // Açık Kasa, Kapalı Kasa
      usageArea, // Kapalı Kasa
      bodyStructure, // Kapalı Kasa
      caseType, // Özel Kasa
      warranty,
      negotiable,
      exchange,
      // İletişim ve detay bilgileri
      sellerName,
      phone,
      email,
      detailedInfo,
    } = req.body;

    // Karoser kategorisini bul (karoser-ustyapi veya benzer)
    const karoserCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "karoser-ustyapi" },
          { slug: "karoser" },
          { name: { contains: "Karoser" } },
          { name: { contains: "Üst Yapı" } },
        ],
      },
    });

    if (!karoserCategory) {
      return res.status(400).json({ error: "Karoser kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: karoserCategory.id,
        title,
        description,
        year: year
          ? parseInt(year)
          : productionYear
          ? parseInt(productionYear)
          : null,
        price: price ? parseFloat(price) : null,
        // Şehir ve ilçe bilgilerini ana tablo alanlarına kaydet
        cityId: cityId ? parseInt(cityId) : null,
        districtId: districtId ? parseInt(districtId) : null,
        customFields: {
          // Damperli alanları
          genislik: genislik || null,
          uzunluk: uzunluk || null,
          lastikDurumu: lastikDurumu || null,
          devrilmeYonu: devrilmeYonu || null,
          tippingDirection: tippingDirection || null,

          // Sabit Kabin alanları
          length: length || null,
          width: width || null,
          isExchangeable: isExchangeable || null,
          usageArea: usageArea || null,
          bodyStructure: bodyStructure || null,
          caseType: caseType || null,
          productionYear: productionYear || null,

          // Ortak alanlar
          warranty: warranty || null,
          negotiable: negotiable || null,
          exchange: exchange || null,
          sellerName: sellerName || null,
          phone: phone || null,
          email: email || null,
          detailedInfo: detailedInfo || null,
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

    // Resim yükleme işlemi (Base64 formatında)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "📷 Karoser ilanı için resimler base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("📷 Karoser vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle (photo_0, photo_1, photo_2, ...)
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );

      photoFiles.forEach((file: any, index: number) => {
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(
          `📷 Karoser resim ${index + 1} base64 formatında kaydediliyor`
        );

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder: displayOrder + index,
              altText: `${title} - Resim ${index + 1}`,
            },
          })
        );
      });

      // Tüm resimleri kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `✅ ${imagePromises.length} adet karoser resmi başarıyla kaydedildi`
        );
      }
    } else {
      console.log("⚠️ Karoser ilanı için resim bulunamadı");
    }

    return res.status(201).json({
      message: "Karoser üst yapı ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad,
    });
  } catch (error: any) {
    console.error("Karoser ilanı oluşturma hatası detayı:", {
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

// Benzer ilanları getir
export const getSimilarAds = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adId = parseInt(id);

    // Önce mevcut ilanı bul
    const currentAd = await prisma.ad.findUnique({
      where: { id: adId },
      include: { category: true },
    });

    if (!currentAd) {
      return res.status(404).json({ error: "İlan bulunamadı" });
    }

    // Benzer ilanları bul (aynı kategori, farklı ID)
    const similarAds = await prisma.ad.findMany({
      where: {
        categoryId: currentAd.categoryId,
        id: { not: adId },
        status: "APPROVED",
      },
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
        city: true,
        district: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6, // En fazla 6 benzer ilan
    });

    return res.json({ similarAds });
  } catch (error) {
    console.error("Benzer ilanlar getirilirken hata:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// İlan oluştur (Oto Kurtarıcı - Tekli Araç) - UNIQUE_MARKER_FOR_TEKLI
export const createOtoKurtariciTekliAd = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("🚛 Oto Kurtarıcı Tekli İlanı API'ye istek geldi");
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
      maxPower,
      maxTorque,
      fuelType,
      platformLength,
      platformWidth,
      loadCapacity,
      plateNumber,
      exchange,
      cityId,
      districtId,
      address,
      detailedInfo,
      features,
      cekiciEkipmani,
      ekEkipmanlar,
    } = req.body;

    // Fuel type enum mapping
    const fuelTypeMap: Record<string, string> = {
      benzin: "GASOLINE",
      dizel: "DIESEL",
      elektrik: "ELECTRIC",
      hybrid: "HYBRID",
    };

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

    // Oto Kurtarıcı kategorisini bul
    const otoKurtariciCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "oto-kurtarici-tasiyici" },
          { slug: "oto-kurtarici" },
          { name: { contains: "Oto Kurtarıcı" } },
          { name: { contains: "Kurtarıcı" } },
        ],
      },
    });

    if (!otoKurtariciCategory) {
      return res
        .status(400)
        .json({ error: "Oto Kurtarıcı kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: otoKurtariciCategory.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        mileage: mileage ? parseInt(mileage) : null,
        vehicleCondition: "USED",
        maxPower: maxPower ? parseInt(maxPower) : null,
        maxTorque,
        fuelType: fuelType ? fuelTypeMap[fuelType] || fuelType : null,
        platformLength,
        platformWidth,
        loadCapacity,
        plateNumber,
        isExchangeable: exchange === "evet",
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
        address,
        detailedInfo,
        customFields: {
          exchange: exchange || null,
          address: address || null,
          detailedInfo: detailedInfo || null,
          features: featuresJson || null,
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

    console.log("✅ Oto Kurtarıcı Tekli ilanı oluşturuldu, ID:", ad.id);

    // Resim yükleme işlemi (Base64 formatında)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "📷 Oto Kurtarıcı Tekli - Resimler base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("📷 Vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );
      for (const file of photoFiles) {
        // Base64 formatına çevir
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(`📷 Resim ${displayOrder} base64 formatında kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          })
        );
        displayOrder++;
      }

      // Tüm resimleri veritabanına kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `✅ ${imagePromises.length} resim başarıyla base64 formatında kaydedildi`
        );
      }
    }

    // Oluşturulan ilanı resimlerle birlikte getir
    const createdAd = await prisma.ad.findUnique({
      where: { id: ad.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return res.status(201).json({
      message:
        "Oto Kurtarıcı Tekli ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad: createdAd,
    });
  } catch (error: any) {
    console.error("Oto Kurtarıcı Tekli ilanı oluşturma hatası detayı:", {
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

// İlan oluştur (Oto Kurtarıcı - Çoklu Araç)
export const createOtoKurtariciCokluAd = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("🚛 Oto Kurtarıcı Çoklu İlanı API'ye istek geldi");
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
      maxPower,
      maxTorque,
      fuelType,
      platformLength,
      platformWidth,
      maxVehicleCapacity,
      loadCapacity,
      plateNumber,
      exchange,
      cityId,
      districtId,
      address,
      detailedInfo,
      features,
    } = req.body;

    // Fuel type enum mapping
    const fuelTypeMap: Record<string, string> = {
      benzin: "GASOLINE",
      dizel: "DIESEL",
      elektrik: "ELECTRIC",
      hybrid: "HYBRID",
    };

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

    // Oto Kurtarıcı kategorisini bul
    const otoKurtariciCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "oto-kurtarici-tasiyici" },
          { slug: "oto-kurtarici" },
          { name: { contains: "Oto Kurtarıcı" } },
          { name: { contains: "Kurtarıcı" } },
        ],
      },
    });

    if (!otoKurtariciCategory) {
      return res
        .status(400)
        .json({ error: "Oto Kurtarıcı kategorisi bulunamadı" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: otoKurtariciCategory.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        mileage: mileage ? parseInt(mileage) : null,
        vehicleCondition: "USED",
        maxPower: maxPower ? parseInt(maxPower) : null,
        maxTorque,
        fuelType: fuelType ? fuelTypeMap[fuelType] || fuelType : null,
        platformLength,
        platformWidth,
        maxVehicleCapacity,
        loadCapacity,
        plateNumber,
        isExchangeable: exchange === "evet",
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
        address,
        detailedInfo,
        customFields: {
          exchange: exchange || null,
          address: address || null,
          detailedInfo: detailedInfo || null,
          features: featuresJson || null,
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

    console.log("✅ Oto Kurtarıcı Çoklu ilanı oluşturuldu, ID:", ad.id);

    // Resim yükleme işlemi (Base64 formatında)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "📷 Oto Kurtarıcı Çoklu - Resimler base64 formatında kaydediliyor:",
        files.map((f: any) => f.fieldname)
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve işle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto"
      );
      if (showcaseFile) {
        // Base64 formatına çevir
        const base64Image = `data:${
          showcaseFile.mimetype
        };base64,${showcaseFile.buffer.toString("base64")}`;

        console.log("📷 Vitrin resmi base64 formatında kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          })
        );
        displayOrder = 1;
      }

      // Diğer resimleri işle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_")
      );
      for (const file of photoFiles) {
        // Base64 formatına çevir
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        console.log(`📷 Resim ${displayOrder} base64 formatında kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          })
        );
        displayOrder++;
      }

      // Tüm resimleri veritabanına kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `✅ ${imagePromises.length} resim başarıyla base64 formatında kaydedildi`
        );
      }
    }

    // Oluşturulan ilanı resimlerle birlikte getir
    const createdAd = await prisma.ad.findUnique({
      where: { id: ad.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return res.status(201).json({
      message:
        "Oto Kurtarıcı Çoklu ilanı başarıyla oluşturuldu ve onay bekliyor",
      ad: createdAd,
    });
  } catch (error: any) {
    console.error("Oto Kurtarıcı Çoklu ilanı oluşturma hatası detayı:", {
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

// Admin: Tüm ilanları getir (filtreli)
export const getAllAdsForAdmin = async (req: Request, res: Response) => {
  try {
    const {
      status,
      categoryId,
      userId,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};

    if (status && status !== "all") where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (userId) where.userId = parseInt(userId as string);

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        {
          user: {
            OR: [
              {
                firstName: { contains: search as string, mode: "insensitive" },
              },
              { lastName: { contains: search as string, mode: "insensitive" } },
              { email: { contains: search as string, mode: "insensitive" } },
              {
                companyName: {
                  contains: search as string,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    const ads = await prisma.ad.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
          },
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        district: {
          select: {
            id: true,
            name: true,
          },
        },
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
    console.error("Admin tüm ilanları getirme hatası:", error);
    res.status(500).json({ error: "İlanlar alınırken hata oluştu" });
  }
};

// Admin: Dashboard istatistikleri
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // Toplam istatistikler
    const totalAds = await prisma.ad.count();
    const activeAds = await prisma.ad.count({ where: { status: "APPROVED" } });
    const pendingAds = await prisma.ad.count({ where: { status: "PENDING" } });
    const rejectedAds = await prisma.ad.count({
      where: { status: "REJECTED" },
    });

    // Kullanıcı istatistikleri
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Bu ay ve bu hafta kayıtları
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );

    const thisMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const thisWeekUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // Bugün kayıt olanlar
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    // Bu ay eklenen ilanlar
    const thisMonthAds = await prisma.ad.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Toplam mesaj sayısı
    const totalMessages = await prisma.message.count();

    // Kategori bazlı ilan dağılımı
    const adsByCategory = await prisma.ad.groupBy({
      by: ["categoryId"],
      _count: true,
    });

    // Kategori isimlerini ayrı olarak çek
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Kategori adlarını ekle
    const adsByCategoryWithNames = adsByCategory.map((item: any) => {
      const category = categories.find(
        (cat: any) => cat.id === item.categoryId
      );
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || "Bilinmeyen",
        count: item._count,
      };
    });

    // Son aktiviteler
    const recentAds = await prisma.ad.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      totalStats: {
        totalAds,
        activeAds,
        pendingAds,
        rejectedAds,
        totalUsers,
        activeUsers,
        totalMessages,
      },
      timeBasedStats: {
        todayUsers,
        thisWeekUsers,
        thisMonthUsers,
        thisMonthAds,
      },
      adsByCategory: adsByCategoryWithNames,
      recentAds,
    });
  } catch (error) {
    console.error("Admin istatistikleri hatası:", error);
    res.status(500).json({ error: "İstatistikler alınırken hata oluştu" });
  }
};

// Admin: İlanı zorla sil
export const forceDeleteAd = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;
    const adminEmail = (req as any).user.email;

    // İlanı bul
    const ad = await prisma.ad.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ad) {
      res.status(404).json({ error: "İlan bulunamadı" });
      return;
    }

    // İlanı sil
    await prisma.ad.delete({
      where: { id: parseInt(id) },
    });

    // Admin aktivitesini logla
    console.log(
      `Admin ${adminEmail} (ID: ${adminId}) deleted ad "${ad.title}" (ID: ${id}) by user ${ad.user.email}`
    );

    res.json({
      message: "İlan başarıyla silindi",
      deletedAd: {
        id: ad.id,
        title: ad.title,
        userEmail: ad.user.email,
      },
    });
  } catch (error) {
    console.error("Admin ilan silme hatası:", error);
    res.status(500).json({ error: "İlan silinirken hata oluştu" });
  }
};

// Uzayabilir Şasi ilan oluşturma
export const createUzayabilirSasiAd = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const files = req.files as Express.Multer.File[];

    const {
      title,
      description,
      productionYear,
      axleCount,
      loadCapacity,
      tireCondition,
      isExchangeable,
      cityId,
      districtId,
      sellerName,
      sellerPhone,
      sellerEmail,
      price,
    } = req.body;

    // Validasyonlar
    if (
      !title ||
      !description ||
      !productionYear ||
      !cityId ||
      !districtId ||
      !sellerName ||
      !sellerPhone ||
      !price
    ) {
      return res.status(400).json({
        error: "Zorunlu alanlar eksik",
      });
    }

    // Fotoğraf ayrıştırma
    let showcaseImageUrl = "";
    const galleryImages: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === "showcasePhoto") {
          // Vitrin fotoğrafı için base64 encode
          showcaseImageUrl = `data:${
            file.mimetype
          };base64,${file.buffer.toString("base64")}`;
        } else if (file.fieldname === "photos") {
          // Galeri fotoğrafları için base64 encode
          galleryImages.push(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
          );
        }
      }
    }

    // Konum bilgisini oluştur
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) },
    });

    const district = await prisma.district.findUnique({
      where: { id: parseInt(districtId) },
    });

    if (!city || !district) {
      return res.status(400).json({
        error: "Geçersiz şehir veya ilçe seçimi",
      });
    }

    const location = `${district.name}, ${city.name}`;

    // Konteyner/Taşıyıcı Şasi kategorisini bul
    const category = await prisma.category.findFirst({
      where: {
        name: { contains: "Konteyner", mode: "insensitive" },
      },
    });

    if (!category) {
      return res.status(400).json({
        error: "Konteyner kategorisi bulunamadı",
      });
    }

    // Uzayabilir markasını bul veya oluştur
    let brand = await prisma.brand.findFirst({
      where: { name: "Uzayabilir" },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: "Uzayabilir",
          slug: "uzayabilir",
          logoUrl: "/BrandsImage/DigerMarkalar.png",
        },
      });
    }

    // Şasi modelini bul veya oluştur
    let model = await prisma.model.findFirst({
      where: {
        name: "Şasi",
        brandId: brand.id,
        categoryId: category.id,
      },
    });

    if (!model) {
      model = await prisma.model.create({
        data: {
          name: "Şasi",
          slug: "sasi",
          brandId: brand.id,
          categoryId: category.id,
        },
      });
    }

    // İlanı oluştur
    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        year: parseInt(productionYear),
        location,
        cityId: parseInt(cityId),
        districtId: parseInt(districtId),
        categoryId: category.id,
        brandId: brand.id,
        modelId: model.id,
        userId,
        status: "PENDING",

        // Uzayabilir şasi özel alanları
        loadCapacity: loadCapacity || null,
        isExchangeable: isExchangeable === "Evet",

        // Özel alanlar JSON olarak
        customFields: {
          axleCount: axleCount || null,
          tireCondition: tireCondition || null,
          sellerName,
          sellerPhone,
          sellerEmail: sellerEmail || null,
        },
      },
      include: {
        category: true,
        brand: true,
        model: true,
        city: true,
        district: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Fotoğrafları kaydet
    if (showcaseImageUrl) {
      await prisma.adImage.create({
        data: {
          adId: ad.id,
          imageUrl: showcaseImageUrl,
          isShowcase: true,
          displayOrder: 0,
        },
      });
    }

    // Galeri fotoğraflarını kaydet
    for (let i = 0; i < galleryImages.length; i++) {
      await prisma.adImage.create({
        data: {
          adId: ad.id,
          imageUrl: galleryImages[i],
          isShowcase: false,
          displayOrder: i + 1,
        },
      });
    }

    return res.status(201).json({
      message: "Uzayabilir şasi ilanı başarıyla oluşturuldu",
      ad,
    });
  } catch (error) {
    console.error("Uzayabilir şasi ilan oluşturma hatası:", error);
    return res.status(500).json({
      error: "İlan oluşturulurken hata oluştu",
      details: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
};
