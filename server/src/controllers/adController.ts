import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { io } from "../app";

// ❗ ULTRA PERFORMANCE: Connection pool optimize
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: [], // Log'ları kapat performance için
});

// Get all ads with filters
export const getAds = async (req: Request, res: Response) => {
  const startTime = Date.now(); // ❗ Performance monitoring
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
      limit = 20, // ❗ Anasayfa için 20 ilan
      sortBy = "createdAt",
      sortOrder = "desc",
      minimal = false, // ❗ Minimal mode ekledik
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

    // ❗ Minimal mode - ULTRA FAST RAW SQL
    if (minimal === "true") {
      console.log("🚀 Using RAW SQL for ultra performance...");

      const rawQuery = `
        SELECT 
          a.id,
          a.title,
          a.price,
          a.year,
          a.is_exchangeable as "isExchangeable",
          a.custom_fields as "customFields",
          a.created_at as "createdAt",
          c.name as city_name,
          d.name as district_name,
          b.name as brand_name,
          cat.name as category_name,
          img.image_url as image_url
        FROM ads a
        LEFT JOIN cities c ON a.city_id = c.id
        LEFT JOIN districts d ON a.district_id = d.id
        LEFT JOIN brands b ON a.brand_id = b.id
        LEFT JOIN categories cat ON a.category_id = cat.id
        LEFT JOIN (
          SELECT DISTINCT ON (ad_id) ad_id, image_url 
          FROM ad_images 
          WHERE is_primary = true 
          ORDER BY ad_id, display_order ASC
        ) img ON a.id = img.ad_id
        WHERE a.status = 'APPROVED'
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const ads = await prisma.$queryRawUnsafe(
        rawQuery,
        parseInt(limit as string),
        skip
      );

      const responseTime = Date.now() - startTime;
      console.log(`🚀 RAW SQL Response Time: ${responseTime}ms`);

      res.set("Cache-Control", "public, max-age=300");
      return res.json({
        ads: (ads as any[]).map((ad) => ({
          id: ad.id,
          title: ad.title,
          price: ad.price,
          year: ad.year,
          createdAt: ad.createdAt,
          city: ad.city_name ? { name: ad.city_name } : null,
          district: ad.district_name ? { name: ad.district_name } : null,
          brand: ad.brand_name ? { name: ad.brand_name } : null,
          category: ad.category_name ? { name: ad.category_name } : null,
          images: ad.image_url ? [{ imageUrl: ad.image_url }] : [],
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: 0,
          pages: 0,
        },
        _debug: { responseTime },
      });
    }

    // ❗ Normal mode - detaylı veri
    const ads = await prisma.ad.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        year: true,
        mileage: true,
        location: true,
        isExchangeable: true,
        customFields: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            userType: true,
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
          where: { isPrimary: true }, // ❗ Sadece ana resimi yükle
          orderBy: { displayOrder: "asc" },
          take: 1, // ❗ Sadece 1 resim
        },
      },
      orderBy: {
        [sortBy as string]: sortOrder as "asc" | "desc",
      },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.ad.count({ where });

    // ❗ CRITICAL: Cache headers for better performance
    res.set({
      "Cache-Control": "public, max-age=300", // 5 dakika cache (ads değişebilir)
      ETag: `ads-${categoryId || "all"}-${page}-${limit}-${sortBy}-${minimal}`,
      Expires: new Date(Date.now() + 5 * 60 * 1000).toUTCString(),
    });

    const responseTime = Date.now() - startTime;
    console.log(`🚀 API Response Time (normal): ${responseTime}ms`);

    return res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      _debug: { responseTime }, // ❗ Frontend'e timing gönder
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ❗ SAFE IN-MEMORY CACHE for frequently accessed ads
const adCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();
const CACHE_TTL = 2 * 60 * 1000; // 2 dakika cache (daha kısa)

// ❗ Cache cleaning utility
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of adCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      adCache.delete(key);
    }
  }
};

// Clean cache every 5 minutes
setInterval(cleanExpiredCache, 5 * 60 * 1000);

// Get ad by ID - LIGHTNING FAST VERSION 3.0 ⚡ (SAFE)
export const getAdById = async (req: Request, res: Response) => {
  console.log("🔍 getAdById çağrıldı, ID:", req.params.id);
  const startTime = performance.now();
  const { id } = req.params;
  const adId = parseInt(id);

  // ❗ SAFE CACHE CHECK - only for valid IDs
  if (!adId || adId <= 0) {
    return res.status(400).json({ error: "Invalid ad ID" });
  }

  const cacheKey = `ad_${id}`;
  const cached = adCache.get(cacheKey);

  // ❗ SAFE cache validation - check if ad still exists
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(
      `⚡ CACHE HIT for ad ${id} - ${(performance.now() - startTime).toFixed(
        2
      )}ms`
    );
    res.set({
      "Cache-Control": "public, max-age=1800", // 30 dakika (daha güvenli)
      "X-Cache": "HIT",
      "X-Response-Time": `${(performance.now() - startTime).toFixed(2)}ms`,
    });
    return res.json(cached.data);
  }

  try {
    console.log(`🚀 FRESH fetch for ID: ${id}`);

    // ❗ OPTIMIZED SQL - keep base64 but limit size and count
    const lightningQuery = `
      SELECT 
        a.id, a.title, a.description, a.price, a.year, a.mileage,
        a.location, a.latitude, a.longitude, a.status, a.view_count,
        a.is_promoted, a.promoted_until, a.custom_fields, 
        a.created_at, a.updated_at, a.chassis_type, a.color, 
        a.detail_features, a.drive_type, a.engine_capacity,
        a.fuel_type, a.is_exchangeable, a.has_accident_record, a.has_tramer_record, 
        a.plate_number, a.plate_type, 
        a.roof_type, a.seat_count, a.transmission_type,
        u.id as user_id, u.first_name, u.last_name, u.company_name, 
        u.phone, u.email, u.user_type, u.created_at as user_created_at, u.is_verified,
        c.name as category_name, b.name as brand_name, m.name as model_name, 
        v.name as variant_name, city.name as city_name, dist.name as district_name,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', ai.id,
              'imageUrl', ai.image_url,
              'isPrimary', ai.is_primary,
              'displayOrder', ai.display_order,
              'altText', ai.alt_text
            )
          )
          FROM (
            SELECT ai.id, ai.image_url, ai.is_primary, ai.display_order, ai.alt_text
            FROM ad_images ai 
            WHERE ai.ad_id = a.id
            ORDER BY ai.is_primary DESC, ai.display_order ASC 
          ) ai
        ), '[]'::json) as images_json,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', av.id,
              'videoUrl', av.video_url,
              'thumbnailUrl', av.thumbnail_url,
              'duration', av.duration,
              'fileSize', av.file_size,
              'mimeType', av.mime_type,
              'displayOrder', av.display_order,
              'description', av.description
            )
          )
          FROM (
            SELECT av.id, av.video_url, av.thumbnail_url, av.duration, av.file_size, 
                   av.mime_type, av.display_order, av.description
            FROM ad_videos av 
            WHERE av.ad_id = a.id
            ORDER BY av.display_order ASC 
          ) av
        ), '[]'::json) as videos_json,
        (SELECT COUNT(*)::int FROM ads a2 WHERE a2.user_id = a.user_id AND a2.status = 'APPROVED') as user_total_ads
      FROM ads a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN brands b ON a.brand_id = b.id
      LEFT JOIN models m ON a.model_id = m.id
      LEFT JOIN variants v ON a.variant_id = v.id
      LEFT JOIN cities city ON a.city_id = city.id
      LEFT JOIN districts dist ON a.district_id = dist.id
      WHERE a.id = $1 AND a.status IN ('APPROVED', 'PENDING')
    `;

    const result = await prisma.$queryRawUnsafe(lightningQuery, adId);
    const ad = (result as any[])[0] as any;

    // ❗ IMMEDIATE view count increment (fire and forget)
    setImmediate(() => {
      prisma
        .$executeRawUnsafe(
          `UPDATE ads SET view_count = view_count + 1 WHERE id = $1`,
          adId
        )
        .catch(() => {}); // Silent fail
    });

    if (!ad) {
      console.log(
        `❌ Ad ${id} not found - ${(performance.now() - startTime).toFixed(
          2
        )}ms`
      );
      // ❗ Clear any cached version of this ad
      adCache.delete(cacheKey);
      return res.status(404).json({ error: "Ad not found" });
    }

    // ❗ Don't cache if ad is PENDING (might change status)
    const shouldCache = ad.status === "APPROVED";

    const responseTime = performance.now() - startTime;
    console.log(`⚡ SAFE Ad Detail Response: ${responseTime.toFixed(2)}ms`);

    // ❗ OPTIMIZED response object (pre-formatted)
    const responseData = {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      year: ad.year,
      mileage: ad.mileage,
      location: ad.location,
      latitude: ad.latitude,
      longitude: ad.longitude,
      status: ad.status,
      viewCount: ad.view_count,
      isPromoted: ad.is_promoted,
      promotedUntil: ad.promoted_until,
      customFields: ad.custom_fields,
      createdAt: ad.created_at,
      updatedAt: ad.updated_at,
      chassisType: ad.chassis_type,
      color: ad.color,
      detailFeatures: ad.detail_features,
      driveType: ad.drive_type,
      engineCapacity: ad.engine_capacity,
      fuelType: ad.fuel_type,
      isExchangeable: ad.is_exchangeable,
      hasAccidentRecord: ad.has_accident_record,
      hasTramerRecord: ad.has_tramer_record,
      plateNumber: ad.plate_number,
      plateType: ad.plate_type,
      roofType: ad.roof_type,
      seatCount: ad.seat_count,
      transmissionType: ad.transmission_type,
      user: {
        id: ad.user_id,
        firstName: ad.first_name,
        lastName: ad.last_name,
        companyName: ad.company_name,
        phone: ad.phone,
        email: ad.email,
        userType: ad.user_type,
        createdAt: ad.user_created_at,
        isVerified: ad.is_verified,
        name:
          ad.company_name ||
          `${ad.first_name || ""} ${ad.last_name || ""}`.trim() ||
          "Bilinmeyen Satıcı",
        totalAds: ad.user_total_ads || 0,
      },
      category: ad.category_name ? { name: ad.category_name } : null,
      brand: ad.brand_name ? { name: ad.brand_name } : null,
      model: ad.model_name ? { name: ad.model_name } : null,
      variant: ad.variant_name ? { name: ad.variant_name } : null,
      city: ad.city_name ? { name: ad.city_name } : null,
      district: ad.district_name ? { name: ad.district_name } : null,
      images: ad.images_json || [],
      videos: ad.videos_json || [],
      _debug: {
        responseTime: responseTime.toFixed(2) + "ms",
        queryType: "SAFE_SINGLE_QUERY_WITH_SELECTIVE_CACHE",
        cacheStatus: "MISS",
        shouldCache: shouldCache,
        adStatus: ad.status,
      },
    };

    // ❗ SELECTIVE CACHE - only cache approved ads
    if (shouldCache) {
      adCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
        ttl: CACHE_TTL,
      });
    }

    // ❗ SAFE cache headers based on ad status
    const cacheMaxAge = shouldCache ? 1800 : 300; // Approved: 30min, Pending: 5min
    res.set({
      "Cache-Control": `public, max-age=${cacheMaxAge}`,
      ETag: `"ad-${id}-v3-${ad.updated_at}-${ad.status}"`,
      Expires: new Date(Date.now() + cacheMaxAge * 1000).toUTCString(),
      "Last-Modified": new Date(ad.updated_at).toUTCString(),
      "X-Response-Time": `${responseTime.toFixed(2)}ms`,
      "X-Cache": "MISS",
      "X-Ad-Status": ad.status,
      Vary: "Accept-Encoding",
    });

    console.log("📤 Gönderilen Response Data Keys:", Object.keys(responseData));
    console.log("📤 Response Data ID:", responseData.id);
    console.log("📤 Response Data Title:", responseData.title);

    return res.json(responseData);
  } catch (error) {
    console.error("❌ Error fetching ad:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      adId: adId,
      timestamp: new Date().toISOString(),
    });
    const errorTime = performance.now() - startTime;
    console.log(`❌ Error response time: ${errorTime.toFixed(2)}ms`);

    // ❗ Clear cache on error
    adCache.delete(cacheKey);

    return res.status(500).json({
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
      _debug: {
        responseTime: errorTime.toFixed(2) + "ms",
        adId: adId,
      },
    });
  }
};

// Create new ad
export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) {
      res
        .status(401)
        .json({ success: false, error: "Kullanıcı doğrulaması gerekli" });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const {
      // Basic fields
      title,
      description,
      price,
      year,
      productionYear,
      category,
      subcategory,
      variant_id,
      city,
      district,
      cityId,
      districtId,
      seller_name,
      sellerName,
      seller_phone,
      phone,
      seller_email,
      email,
      warranty,
      negotiable,
      exchange,
      hasAccidentRecord,
      hasTramerRecord,
      showcase_image_index,
      detailedInfo,

      // Kuruyük specific fields
      dingilSayisi,
      uzunluk,
      genislik,
      kapakYuksekligi,
      yukseklik,
      istiapHaddi,
      krikoAyak,
      lastikDurumu,
      takasli,
      kapakSistemi,

      // Tenteli specific fields
      catiPerdeSistemi,
      tenteliType,

      // Legacy fields
      categoryId,
      brandId,
      modelId,
      variantId,
      mileage,
      location,
      latitude,
      longitude,
      customFields,
    } = req.body;

    // Support both new and legacy formats
    const adData: any = {
      userId: parseInt(userId),
      title,
      description,
      status: "PENDING",
      isExchangeable: exchange === "evet" || exchange === "true",
      hasAccidentRecord:
        hasAccidentRecord === "evet" || hasAccidentRecord === "true",
      hasTramerRecord: hasTramerRecord === "evet" || hasTramerRecord === "true",
    };

    // Handle new format (tenteli forms and Kuruyük forms)
    if (category && subcategory) {
      // Find category by name or slug
      const categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { contains: category, mode: "insensitive" } },
            { slug: category.toLowerCase() },
          ],
        },
      });

      if (!categoryRecord) {
        res
          .status(400)
          .json({ success: false, error: `Kategori bulunamadı: ${category}` });
        return;
      }

      adData.categoryId = categoryRecord.id;
      adData.price = price ? parseFloat(price) : null;
      adData.year = year
        ? parseInt(year)
        : productionYear
        ? parseInt(productionYear)
        : null;
      adData.variantId = variant_id ? parseInt(variant_id) : null;
      adData.location = `${city}, ${district}`;
      adData.cityId = cityId ? parseInt(cityId) : null;
      adData.districtId = districtId ? parseInt(districtId) : null;

      // Add seller contact info to custom fields for now
      adData.customFields = {
        sellerName: seller_name || sellerName,
        sellerPhone: seller_phone || phone,
        sellerEmail: seller_email || email,
        hasWarranty: warranty === "evet" || warranty === "true",
        isNegotiable: negotiable === "evet" || negotiable === "true",
        isExchangeable: exchange === "evet" || exchange === "true",
        city: city,
        district: district,
        detailedInfo: detailedInfo,

        // Kuruyük specific fields
        dingilSayisi: dingilSayisi || null,
        uzunluk: uzunluk || null,
        genislik: genislik || null,
        kapakYuksekligi: kapakYuksekligi || null,
        yukseklik: yukseklik || null,
        istiapHaddi: istiapHaddi || null,
        krikoAyak: krikoAyak || null,
        lastikDurumu: lastikDurumu || null,
        takasli: takasli || null,
        kapakSistemi: kapakSistemi || null,

        // Tenteli specific data
        catiPerdeSistemi: catiPerdeSistemi || null,
        tenteliType: tenteliType || null,
      };
    }
    // Handle legacy format and direct Kuruyük submissions
    else {
      adData.categoryId = categoryId ? parseInt(categoryId) : null;
      adData.brandId = brandId ? parseInt(brandId) : null;
      adData.modelId = modelId ? parseInt(modelId) : null;
      adData.variantId = variantId ? parseInt(variantId) : null;
      adData.price = price ? parseFloat(price) : null;
      adData.year = year
        ? parseInt(year)
        : productionYear
        ? parseInt(productionYear)
        : null;
      adData.mileage = mileage ? parseInt(mileage) : null;
      adData.location = location;
      adData.latitude = latitude ? parseFloat(latitude) : null;
      adData.longitude = longitude ? parseFloat(longitude) : null;
      adData.cityId = cityId ? parseInt(cityId) : null;
      adData.districtId = districtId ? parseInt(districtId) : null;

      // Merge custom fields with Kuruyük fields
      adData.customFields = {
        ...(customFields || {}),
        sellerName: seller_name || sellerName,
        sellerPhone: seller_phone || phone,
        sellerEmail: seller_email || email,
        hasWarranty: warranty === "evet" || warranty === "true",
        isNegotiable: negotiable === "evet" || negotiable === "true",
        isExchangeable: exchange === "evet" || exchange === "true",
        hasAccidentRecord:
          hasAccidentRecord === "evet" || hasAccidentRecord === "true",
        hasTramerRecord:
          hasTramerRecord === "evet" || hasTramerRecord === "true",
        detailedInfo: detailedInfo,

        // Kuruyük specific fields
        dingilSayisi: dingilSayisi || null,
        uzunluk: uzunluk || null,
        genislik: genislik || null,
        kapakYuksekligi: kapakYuksekligi || null,
        yukseklik: yukseklik || null,
        istiapHaddi: istiapHaddi || null,
        krikoAyak: krikoAyak || null,
        lastikDurumu: lastikDurumu || null,
        takasli: takasli || null,
        kapakSistemi: kapakSistemi || null,
      };
    }

    const ad = await prisma.ad.create({
      data: adData,
      include: {
        category: true,
        brand: true,
        model: true,
        variant: true,
      },
    });

    // Handle images if provided
    if (files && files.length > 0) {
      const showcaseIndex = showcase_image_index
        ? parseInt(showcase_image_index)
        : 0;

      const imagePromises = files.map((file, index) => {
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        return prisma.adImage.create({
          data: {
            adId: ad.id,
            imageUrl: base64Image,
            displayOrder: index,
            isPrimary: index === showcaseIndex,
            altText: `${title} - Fotoğraf ${index + 1}`,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    console.log(`✅ İlan oluşturuldu: ${ad.id}`);
    res.status(201).json({
      success: true,
      message: "İlan başarıyla oluşturuldu",
      listing: { id: ad.id },
      ad, // Legacy compatibility
    });
  } catch (error) {
    console.error("İlan oluşturulurken hata:", error);
    res.status(500).json({
      success: false,
      error: "İlan oluşturulurken hata oluştu",
      details: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
}; // Update ad
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
    console.log("� ID Değerleri:");
    console.log("  - categoryId:", req.body.categoryId);
    console.log("  - brandId:", req.body.brandId);
    console.log("  - modelId:", req.body.modelId);
    console.log("  - variantId:", req.body.variantId);
    console.log("�📦 Request headers:", req.headers);
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
      motorPower,
      drivetrain,
      color,
      seatCount,
      roofType,
      chassis,
      transmission,
      fuelType,
      exchange,
      hasAccidentRecord,
      hasTramerRecord,
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
      // ID'ler - Frontend'den gelen asıl ID değerleri
      categoryId,
      brandId,
      modelId,
      variantId,
      // Detay bilgiler
      features,
    } = req.body;

    // Motor gücü debug (Minibüs)
    console.log("Minibüs Backend received motorPower:", motorPower);

    // Form data debug
    console.log("✅ Form Data (Minibüs):");
    console.log("  - Title:", title);
    console.log("  - Motor Power:", motorPower);
    console.log("  - Engine Volume:", engineVolume);
    console.log("  - Transmission:", transmission);
    console.log("  - Fuel Type:", fuelType);
    console.log("  - Has Accident Record:", req.body.hasAccidentRecord);
    console.log("  - Has Tramer Record:", req.body.hasTramerRecord);

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
        // Frontend'den gelen categoryId'yi kullan, yoksa fallback olarak minibusCategory.id
        categoryId: categoryId ? parseInt(categoryId) : minibusCategory.id,
        // Brand, Model ve Variant ID'lerini kaydet
        brandId: brandId ? parseInt(brandId) : null,
        modelId: modelId ? parseInt(modelId) : null,
        variantId: variantId ? parseInt(variantId) : null,
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
          motorPower: motorPower || null,
          drivetrain: drivetrain || null,
          color: color || null,
          seatCount: seatCount || null,
          roofType: roofType || null,
          chassis: chassis || null,
          transmission: transmission || null,
          fuelType: fuelType || null,
          exchange: exchange || null,
          hasAccidentRecord: hasAccidentRecord || null,
          hasTramerRecord: hasTramerRecord || null,
          plateType: plateType || null,
          plateNumber: plateNumber || null,
          address: address || null,
          detailedInfo: detailedInfo || null,
          detailFeatures: detailFeaturesJson || null,
          // IDs (backward compatibility için)
          categoryId: categoryId ? parseInt(categoryId) : null,
          brandId: brandId ? parseInt(brandId) : null,
          modelId: modelId ? parseInt(modelId) : null,
          variantId: variantId ? parseInt(variantId) : null,
          // Slugs (eski uyumluluk için)
          categorySlug: categorySlug || null,
          brandSlug: brandSlug || null,
          modelSlug: modelSlug || null,
          variantSlug: variantSlug || null,
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

      // Video yükleme işlemi (Base64 formatında)
      const videoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("video_")
      );
      if (videoFiles.length > 0) {
        console.log(
          "🎬 Videolar base64 formatında kaydediliyor:",
          videoFiles.map((f: any) => f.fieldname)
        );

        const videoPromises = [];
        let videoDisplayOrder = 1;

        for (const file of videoFiles) {
          // Base64 formatına çevir
          const base64Video = `data:${
            file.mimetype
          };base64,${file.buffer.toString("base64")}`;

          console.log(
            `🎬 Video ${videoDisplayOrder} base64 formatında kaydediliyor`
          );

          videoPromises.push(
            prisma.adVideo.create({
              data: {
                adId: ad.id,
                videoUrl: base64Video,
                mimeType: file.mimetype,
                fileSize: file.size,
                displayOrder: videoDisplayOrder,
                description: `${title} - Video ${videoDisplayOrder}`,
              },
            })
          );
          videoDisplayOrder++;
        }

        // Tüm videoları veritabanına kaydet
        if (videoPromises.length > 0) {
          await Promise.all(videoPromises);
          console.log(
            `✅ ${videoPromises.length} video başarıyla base64 formatında kaydedildi`
          );
        }
      }
    }

    // Oluşturulan ilanı resimler ve videolarla birlikte getir
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
        videos: {
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
        // Video yükleme işlemleri
        const videoFiles = files.filter((f: any) =>
          f.fieldname.startsWith("video_")
        );

        if (videoFiles && videoFiles.length > 0) {
          console.log(
            "🎬 Videolar base64 formatında kaydediliyor:",
            videoFiles.map((f: any) => f.fieldname)
          );

          const videoPromises: any[] = [];
          let videoDisplayOrder = 1;

          for (const file of videoFiles) {
            // Base64 formatına çevir
            const base64Video = `data:${
              file.mimetype
            };base64,${file.buffer.toString("base64")}`;

            console.log(
              `🎬 Video ${videoDisplayOrder} base64 formatında kaydediliyor`
            );

            videoPromises.push(
              prisma.adVideo.create({
                data: {
                  adId: ad.id,
                  videoUrl: base64Video,
                  mimeType: file.mimetype,
                  fileSize: file.size,
                  displayOrder: videoDisplayOrder,
                  description: `${title} - Video ${videoDisplayOrder}`,
                },
              })
            );
            videoDisplayOrder++;
          }

          // Tüm videoları veritabanına kaydet
          if (videoPromises.length > 0) {
            await Promise.all(videoPromises);
            console.log(
              `✅ ${videoPromises.length} video başarıyla base64 formatında kaydedildi`
            );
          }
        }
      }
    }

    // Oluşturulan ilanı resimler ve videolarla birlikte getir
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
        videos: {
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
        videos: {
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

    // ❗ GERÇEK ZAMANLI BİLDİRİM: Socket.io ile tüm bağlı kullanıcılara bildir
    io.emit("adApproved", {
      adId: ad.id,
      title: ad.title,
      message: "Yeni bir ilan onaylandı!",
    });

    // Log
    console.log(
      `📣 İlan onaylandı ve socket bildirimi gönderildi: ${ad.title} - Kullanıcı: ${ad.user.email}`
    );

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
      hasAccidentRecord,
      hasTramerRecord,
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

    // Motor gücü debug
    console.log("Backend received motorPower:", motorPower);

    // Kamyon Form data debug
    console.log("✅ Form Data (Kamyon):");
    console.log("  - Title:", title);
    console.log("  - Motor Power:", motorPower);
    console.log("  - Transmission:", transmission);
    console.log("  - Fuel Type:", fuelType);
    console.log("  - Has Accident Record:", hasAccidentRecord);
    console.log("  - Has Tramer Record:", hasTramerRecord);

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
          hasAccidentRecord: hasAccidentRecord || null,
          hasTramerRecord: hasTramerRecord || null,
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

      // Video işleme
      const videoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("video_")
      );
      const videoPromises: any[] = [];

      for (let i = 0; i < videoFiles.length; i++) {
        const videoFile = videoFiles[i];

        // Base64 formatına çevir
        const base64Video = `data:${
          videoFile.mimetype
        };base64,${videoFile.buffer.toString("base64")}`;

        console.log(`🎬 Video ${i + 1} base64 formatında kaydediliyor`);

        videoPromises.push(
          prisma.adVideo.create({
            data: {
              adId: ad.id,
              videoUrl: base64Video,
              description: `Otobüs ilanı videosu ${i + 1}`,
              duration: null, // Frontend'den gönderilirse kullanılabilir
              fileSize: videoFile.size,
              mimeType: videoFile.mimetype,
              displayOrder: i + 1,
            },
          })
        );
      }

      // Tüm videoları veritabanına kaydet
      if (videoPromises.length > 0) {
        await Promise.all(videoPromises);
        console.log(
          `✅ ${videoPromises.length} video başarıyla base64 formatında kaydedildi`
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
        videos: {
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
        detailedInfo,
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
        videos: {
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

// Kamyon Römork ilan oluşturma
export const createKamyonRomorkAd = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      title,
      description,
      price,
      productionYear,
      volume,
      length,
      width,
      hasTent,
      hasDamper,
      isExchangeable, // Modern form alanı
      exchangeable = isExchangeable, // Backward compatibility
      cityId,
      districtId,
      sellerName, // Modern form alanı
      contactName = sellerName, // Backward compatibility
      sellerPhone, // Modern form alanı
      phone = sellerPhone, // Backward compatibility
      sellerEmail, // Modern form alanı
      email = sellerEmail, // Backward compatibility
      currency,
      detailedInfo,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      // Modern form ID tabanlı alanlar
      brandId: formBrandId,
      modelId: formModelId,
      variantId: formVariantId,
      brandName,
      modelName,
      variantName,
      category,
      subType,
    } = req.body;

    // Slug'lardan ID'leri bul
    let categoryId = null;
    let brandId = formBrandId ? parseInt(formBrandId) : null;
    let modelId = formModelId ? parseInt(formModelId) : null;
    let variantId = formVariantId ? parseInt(formVariantId) : null;
    if (categorySlug) {
      console.log("🔍 Gelen categorySlug:", categorySlug);
      const category = await prisma.category.findFirst({
        where: { slug: categorySlug },
      });
      console.log("📁 Bulunan kategori:", category);
      categoryId = category?.id || null;
    }

    // Brand ID slug'dan veya direkt ID'den al
    if (!brandId && brandSlug) {
      const brand = await prisma.brand.findFirst({
        where: { slug: brandSlug },
      });
      brandId = brand?.id || null;
    }

    // Model ID slug'dan veya direkt ID'den al
    if (!modelId && modelSlug) {
      const model = await prisma.model.findFirst({
        where: { slug: modelSlug },
      });
      modelId = model?.id || null;
    }

    // Variant ID slug'dan veya direkt ID'den al
    if (!variantId && variantSlug) {
      const variant = await prisma.variant.findFirst({
        where: { slug: variantSlug },
      });
      variantId = variant?.id || null;
    }

    // Şehir ve ilçe bilgilerini al
    let locationString = "";
    if (cityId && districtId) {
      const city = await prisma.city.findUnique({
        where: { id: parseInt(cityId) },
      });
      const district = await prisma.district.findUnique({
        where: { id: parseInt(districtId) },
      });
      locationString = `${city?.name || ""}, ${district?.name || ""}`;
    }

    // Römork özel alanları - modern form uyumlu
    const customFields = {
      volume: volume || "",
      length: length || "",
      width: width || "",
      hasTent: hasTent === "true" || hasTent === true,
      hasDamper: hasDamper === "true" || hasDamper === true,
      isExchangeable: isExchangeable || exchangeable || "",
      sellerName: sellerName || contactName || "",
      sellerPhone: sellerPhone || phone || "",
      sellerEmail: sellerEmail || email || "",
      currency: currency || "TL",
      detailedInfo: detailedInfo || "",
      cityId: cityId || "",
      districtId: districtId || "",
      subType: subType || "",
      // Modern form brand/model bilgileri
      brandName: brandName || "",
      modelName: modelName || "",
      variantName: variantName || "",
      category: category || "",
    };

    // İlanı oluştur
    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: categoryId || 1, // Varsayılan kategori ID'si
        brandId: brandId || undefined,
        modelId: modelId || undefined,
        variantId: variantId || undefined,
        title,
        description,
        price: price ? parseFloat(price) : null,
        year: productionYear ? parseInt(productionYear) : null,
        location: locationString,
        customFields: JSON.stringify(customFields),
        status: "PENDING", // Admin onayı gerekli
        cityId: cityId ? parseInt(cityId) : null,
        districtId: districtId ? parseInt(districtId) : null,
      },
      include: {
        category: true,
        brand: true,
        model: true,
        variant: true,
      },
    });

    // Fotoğraf yükleme (varsa)
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const imagePromises = files.map(async (file, index) => {
        const base64Image = `data:${
          file.mimetype
        };base64,${file.buffer.toString("base64")}`;

        return prisma.adImage.create({
          data: {
            adId: ad.id,
            imageUrl: base64Image,
            displayOrder: index,
            isPrimary: index === 0, // İlk fotoğraf vitrin fotoğrafı
            altText: `${title} - Fotoğraf ${index + 1}`,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    console.log(`✅ Kamyon Römork ilanı oluşturuldu: ${ad.id}`);
    res.status(201).json({
      message: "Kamyon Römork ilanı başarıyla oluşturuldu",
      ad,
    });
  } catch (error) {
    console.error("Kamyon Römork ilanı oluşturulurken hata:", error);
    res.status(500).json({
      error: "İlan oluşturulurken hata oluştu",
      details: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
};

// Video upload
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Video dosyası gerekli" });
    }

    // İlan sahibi kontrolü
    const ad = await prisma.ad.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true },
    });

    if (!ad || ad.userId !== userId) {
      return res.status(403).json({ error: "Bu ilana video ekleyemezsiniz" });
    }

    // Video dosyasını kaydet (şimdilik base64 olarak, ileride file upload service kullanılabilir)
    const videoBase64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const video = await prisma.adVideo.create({
      data: {
        adId: parseInt(id),
        videoUrl: videoBase64,
        mimeType: file.mimetype,
        fileSize: file.size,
        displayOrder: 1,
      },
    });

    return res.json({
      success: true,
      message: "Video başarıyla yüklendi",
      video,
    });
  } catch (error) {
    console.error("Video yüklenirken hata:", error);
    return res.status(500).json({
      error: "Video yüklenirken hata oluştu",
      details: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
};

// Get ad videos
export const getAdVideos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const videos = await prisma.adVideo.findMany({
      where: { adId: parseInt(id) },
      orderBy: { displayOrder: "asc" },
    });

    return res.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Videolar alınırken hata:", error);
    return res.status(500).json({
      error: "Videolar alınırken hata oluştu",
    });
  }
};

// Delete video
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id, videoId } = req.params;
    const userId = (req as any).user?.id;

    // İlan sahibi kontrolü
    const ad = await prisma.ad.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true },
    });

    if (!ad || ad.userId !== userId) {
      return res.status(403).json({ error: "Bu videoyu silemezsiniz" });
    }

    await prisma.adVideo.delete({
      where: {
        id: parseInt(videoId),
        adId: parseInt(id),
      },
    });

    return res.json({
      success: true,
      message: "Video başarıyla silindi",
    });
  } catch (error) {
    console.error("Video silinirken hata:", error);
    return res.status(500).json({
      error: "Video silinirken hata oluştu",
    });
  }
};
