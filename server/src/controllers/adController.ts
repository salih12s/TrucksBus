import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { io } from "../app";
import { applyPriceModeration, applyAdvancedPriceModeration } from "../services/moderationService";
import { getMarketStats } from "../services/marketPriceService";
import { getUserTrustScore } from "../services/trustScoreService";
import { getModelMarketPrice } from "../services/modelPriceService";
import { toBase64WithWatermark } from "../utils/watermark";

// Helper function to safely parse query/params that can be string or string[]
const parseStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

const parseIntParam = (param: string | string[] | undefined): number => {
  const str = parseStringParam(param);
  return parseInt(str) || 0;
};

// â— ULTRA PERFORMANCE: Connection pool optimize
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: [], // Log'larÄ± kapat performance iÃ§in
});

// Helper function for automatic brand/model/variant creation
const ensureBrandModelVariant = async (
  categoryId: number,
  brandSlug?: string,
  brandName?: string,
  modelSlug?: string,
  modelName?: string,
  variantSlug?: string,
  variantName?: string,
  existingBrandId?: number,
  existingModelId?: number,
  existingVariantId?: number,
) => {
  let brandId = existingBrandId;
  let modelId = existingModelId;
  let variantId = existingVariantId;

  // Brand'Ä± bul veya oluÅŸtur
  if (!brandId && (brandSlug || brandName)) {
    // Slug'dan name'i Ã§Ä±kar (eÄŸer name gelmemiÅŸse)
    const finalBrandName =
      brandName ||
      (brandSlug
        ? brandSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "");

    let brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { slug: brandSlug || "" },
          { name: { equals: finalBrandName || "", mode: "insensitive" } },
        ],
      },
    });

    if (!brand && finalBrandName) {
      console.log(
        "ğŸ†• Yeni brand oluÅŸturuluyor:",
        finalBrandName,
        "(slug:",
        brandSlug,
        ")",
      );
      brand = await prisma.brand.create({
        data: {
          name: finalBrandName,
          slug:
            brandSlug ||
            finalBrandName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
        },
      });

      // Brand-Category iliÅŸkisini oluÅŸtur
      try {
        await prisma.categoryBrand.create({
          data: {
            brandId: brand.id,
            categoryId: categoryId,
          },
        });
      } catch (error) {
        console.log("Brand-Category iliÅŸkisi zaten var veya hata:", error);
      }

      console.log("âœ… Brand oluÅŸturuldu:", brand);
    }
    brandId = brand?.id || undefined;
  }

  // Model'i bul veya oluÅŸtur
  if (!modelId && (modelSlug || modelName) && brandId) {
    // Slug'dan name'i Ã§Ä±kar (eÄŸer name gelmemiÅŸse)
    const finalModelName =
      modelName ||
      (modelSlug
        ? modelSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "");

    let model = await prisma.model.findFirst({
      where: {
        brandId: brandId,
        categoryId: categoryId,
        OR: [
          { slug: modelSlug || "" },
          { name: { equals: finalModelName || "", mode: "insensitive" } },
        ],
      },
    });

    if (!model && finalModelName) {
      console.log(
        "ğŸ†• Yeni model oluÅŸturuluyor:",
        finalModelName,
        "(slug:",
        modelSlug,
        ") for brand ID:",
        brandId,
      );
      model = await prisma.model.create({
        data: {
          name: finalModelName,
          slug:
            modelSlug ||
            finalModelName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          brandId: brandId,
          categoryId: categoryId,
        },
      });
      console.log("âœ… Model oluÅŸturuldu:", model);
    }
    modelId = model?.id || undefined;
  }

  // Variant'Ä± bul veya oluÅŸtur
  if (!variantId && (variantSlug || variantName) && modelId) {
    // Slug'dan name'i Ã§Ä±kar (eÄŸer name gelmemiÅŸse)
    const finalVariantName =
      variantName ||
      (variantSlug
        ? variantSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "");

    let variant = await prisma.variant.findFirst({
      where: {
        modelId: modelId,
        OR: [
          { slug: variantSlug || "" },
          { name: { equals: finalVariantName || "", mode: "insensitive" } },
        ],
      },
    });

    if (!variant && finalVariantName) {
      console.log(
        "ğŸ†• Yeni variant oluÅŸturuluyor:",
        finalVariantName,
        "(slug:",
        variantSlug,
        ") for model ID:",
        modelId,
      );
      variant = await prisma.variant.create({
        data: {
          name: finalVariantName,
          slug:
            variantSlug ||
            finalVariantName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          modelId: modelId,
        },
      });
      console.log("âœ… Variant oluÅŸturuldu:", variant);
    }
    variantId = variant?.id || undefined;
  }

  return { brandId, modelId, variantId };
};

// Get all ads with filters
export const getAds = async (req: Request, res: Response) => {
  const startTime = Date.now(); // â— Performance monitoring
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
      limit = 20, // â— Anasayfa iÃ§in 20 ilan
      sortBy = "createdAt",
      sortOrder = "desc",
      minimal = false, // â— Minimal mode ekledik
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

    // â— Minimal mode - ULTRA FAST RAW SQL
    if (minimal === "true") {
      console.log("ğŸš€ Using RAW SQL for ultra performance...");

      const rawQuery = `
        SELECT 
          a.id,
          a.title,
          a.price,
          a.currency,
          a.year,
          a.mileage,
          a.is_exchangeable as "isExchangeable",
          a.is_example as "isExample",
          a.custom_fields as "customFields",
          a.created_at as "createdAt",
          c.name as city_name,
          d.name as district_name,
          b.name as brand_name,
          b.slug as brand_slug,
          cat.id as category_id,
          cat.name as category_name,
          cat.slug as category_slug,
          m.name as model_name,
          m.slug as model_slug,
          v.name as variant_name,
          v.slug as variant_slug,
          img.image_url as image_url,
          u.id as user_id,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.phone as user_phone,
          u.company_name as user_company_name,
          u.role as user_role,
          u.user_type as user_user_type
        FROM ads a
        LEFT JOIN cities c ON a.city_id = c.id
        LEFT JOIN districts d ON a.district_id = d.id
        LEFT JOIN brands b ON a.brand_id = b.id
        LEFT JOIN models m ON a.model_id = m.id
        LEFT JOIN variants v ON a.variant_id = v.id
        LEFT JOIN categories cat ON a.category_id = cat.id
        LEFT JOIN users u ON a.user_id = u.id
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
        skip,
      );

      const responseTime = Date.now() - startTime;
      console.log(`ğŸš€ RAW SQL Response Time: ${responseTime}ms`);

      res.set("Cache-Control", "public, max-age=300");
      return res.json({
        ads: (ads as any[]).map((ad) => ({
          id: ad.id,
          title: ad.title,
          price: ad.price,
          currency: ad.currency,
          year: ad.year,
          mileage: ad.mileage,
          createdAt: ad.createdAt,
          isExchangeable: ad.isExchangeable,
          isExample: ad.isExample,
          customFields: ad.customFields,
          city: ad.city_name ? { name: ad.city_name } : null,
          district: ad.district_name ? { name: ad.district_name } : null,
          brand: ad.brand_name
            ? { name: ad.brand_name, slug: ad.brand_slug }
            : null,
          model: ad.model_name
            ? { name: ad.model_name, slug: ad.model_slug }
            : null,
          variant: ad.variant_name
            ? { name: ad.variant_name, slug: ad.variant_slug }
            : null,
          category: ad.category_name
            ? {
              id: ad.category_id,
              name: ad.category_name,
              slug: ad.category_slug,
            }
            : null,
          images: ad.image_url ? [{ imageUrl: ad.image_url }] : [],
          user: {
            id: ad.user_id,
            firstName: ad.user_first_name,
            lastName: ad.user_last_name,
            phone: ad.user_phone,
            companyName: ad.user_company_name,
            role: ad.user_role,
            userType: ad.user_user_type,
          },
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

    // â— Normal mode - detaylÄ± veri
    const ads = await prisma.ad.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        year: true,
        mileage: true,
        location: true,
        isExchangeable: true,
        isExample: true,
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
          where: { isPrimary: true }, // â— Sadece ana resimi yÃ¼kle
          orderBy: { displayOrder: "asc" },
          take: 1, // â— Sadece 1 resim
        },
      },
      orderBy: {
        [sortBy as string]: sortOrder as "asc" | "desc",
      },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.ad.count({ where });

    // â— CRITICAL: Cache headers for better performance
    res.set({
      "Cache-Control": "public, max-age=300", // 5 dakika cache (ads deÄŸiÅŸebilir)
      ETag: `ads-${categoryId || "all"}-${page}-${limit}-${sortBy}-${minimal}`,
      Expires: new Date(Date.now() + 5 * 60 * 1000).toUTCString(),
    });

    const responseTime = Date.now() - startTime;
    console.log(`ğŸš€ API Response Time (normal): ${responseTime}ms`);

    return res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      _debug: { responseTime }, // â— Frontend'e timing gÃ¶nder
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// â— SAFE IN-MEMORY CACHE for frequently accessed ads
const adCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();
const CACHE_TTL = 2 * 60 * 1000; // 2 dakika cache (daha kÄ±sa)

// â— Cache cleaning utility
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

// Get ad by ID - LIGHTNING FAST VERSION 3.0 âš¡ (SAFE)
export const getAdById = async (req: Request, res: Response) => {
  console.log("ğŸ” getAdById Ã§aÄŸrÄ±ldÄ±, ID:", req.params.id);
  const startTime = performance.now();
  const { id } = req.params;
  const adId = parseIntParam(id);

  // â— SAFE CACHE CHECK - only for valid IDs
  if (!adId || adId <= 0) {
    return res.status(400).json({ error: "Invalid ad ID" });
  }

  const cacheKey = `ad_${id}`;
  const cached = adCache.get(cacheKey);

  // â— SAFE cache validation - check if ad still exists
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(
      `âš¡ CACHE HIT for ad ${id} - ${(performance.now() - startTime).toFixed(
        2,
      )}ms`,
    );
    res.set({
      "Cache-Control": "public, max-age=1800", // 30 dakika (daha gÃ¼venli)
      "X-Cache": "HIT",
      "X-Response-Time": `${(performance.now() - startTime).toFixed(2)}ms`,
    });
    return res.json(cached.data);
  }

  try {
    console.log(`ğŸš€ FRESH fetch for ID: ${id}`);

    // â— OPTIMIZED SQL - keep base64 but limit size and count
    const lightningQuery = `
      SELECT 
        a.id, a.title, a.description, a.price, a.currency, a.year, a.mileage,
        a.location, a.latitude, a.longitude, a.status, a.view_count,
        a.is_promoted, a.promoted_until, a.custom_fields, 
        a.created_at, a.updated_at, a.chassis_type, a.color, 
        a.detail_features, a.drive_type, a.engine_capacity,
        a.fuel_type, a.is_exchangeable, a.has_accident_record, a.has_tramer_record, 
        a.plate_number, a.plate_type, 
        a.roof_type, a.seat_count, a.transmission_type,
        u.id as user_id, u.first_name, u.last_name, u.company_name, 
        u.phone, u.email, u.user_type, u.created_at as user_created_at, u.is_verified,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        b.name as brand_name, b.slug as brand_slug,
        m.name as model_name, m.slug as model_slug,
        v.name as variant_name, v.slug as variant_slug,
        city.name as city_name, dist.name as district_name,
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
              'thumbnailUrl', av.thumbnail_url,
              'duration', av.duration,
              'mimeType', av.mime_type,
              'displayOrder', av.display_order,
              'description', av.description,
              'hasVideo', true
            )
          )
          FROM (
            SELECT av.id, av.thumbnail_url, av.duration, 
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

    // â— IMMEDIATE view count increment (fire and forget)
    setImmediate(() => {
      prisma
        .$executeRawUnsafe(
          `UPDATE ads SET view_count = view_count + 1 WHERE id = $1`,
          adId,
        )
        .catch(() => { }); // Silent fail
    });

    if (!ad) {
      console.log(
        `âŒ Ad ${id} not found - ${(performance.now() - startTime).toFixed(
          2,
        )}ms`,
      );
      // â— Clear any cached version of this ad
      adCache.delete(cacheKey);
      return res.status(404).json({ error: "Ad not found" });
    }

    // â— Don't cache if ad is PENDING (might change status)
    const shouldCache = ad.status === "APPROVED";

    const responseTime = performance.now() - startTime;
    console.log(`âš¡ SAFE Ad Detail Response: ${responseTime.toFixed(2)}ms`);

    // â— OPTIMIZED response object (pre-formatted)
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
          "Bilinmeyen SatÄ±cÄ±",
        totalAds: ad.user_total_ads || 0,
      },
      category: ad.category_name
        ? { id: ad.category_id, name: ad.category_name, slug: ad.category_slug }
        : null,
      brand: ad.brand_name
        ? { name: ad.brand_name, slug: ad.brand_slug }
        : null,
      model: ad.model_name
        ? { name: ad.model_name, slug: ad.model_slug }
        : null,
      variant: ad.variant_name
        ? { name: ad.variant_name, slug: ad.variant_slug }
        : null,
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

    // â— SELECTIVE CACHE - only cache approved ads
    if (shouldCache) {
      adCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
        ttl: CACHE_TTL,
      });
    }

    // â— SAFE cache headers based on ad status
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

    console.log("ğŸ“¤ GÃ¶nderilen Response Data Keys:", Object.keys(responseData));
    console.log("ğŸ“¤ Response Data ID:", responseData.id);
    console.log("ğŸ“¤ Response Data Title:", responseData.title);

    return res.json(responseData);
  } catch (error) {
    console.error("âŒ Error fetching ad:", error);
    console.error("âŒ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      adId: adId,
      timestamp: new Date().toISOString(),
    });
    const errorTime = performance.now() - startTime;
    console.log(`âŒ Error response time: ${errorTime.toFixed(2)}ms`);

    // â— Clear cache on error
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

// Get ad videos - Lazy loaded separately for performance
export const getAdVideos = async (req: Request, res: Response) => {
  console.log("ğŸ¥ getAdVideos called for ad:", req.params.id);
  const startTime = performance.now();

  try {
    const { id } = req.params;
    const adId = parseIntParam(id);

    if (!adId || adId <= 0) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }

    // Quick cache check for videos
    const videoCacheKey = `videos_${id}`;
    const cachedVideos = adCache.get(videoCacheKey);

    if (cachedVideos && Date.now() - cachedVideos.timestamp < 3600000) {
      // 1 hour cache
      console.log(`âš¡ VIDEO CACHE HIT for ad ${id}`);
      return res.json({ videos: cachedVideos.data });
    }

    // Fetch videos with videoUrl included
    const videos = await prisma.adVideo.findMany({
      where: { adId: adId },
      select: {
        id: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        fileSize: true,
        mimeType: true,
        displayOrder: true,
        description: true,
      },
      orderBy: { displayOrder: "asc" },
    });

    // Debug: Log video details
    console.log(`ğŸ¥ Found ${videos.length} videos for ad ${id}`);
    videos.forEach((video, index) => {
      console.log(`Video ${index + 1}:`, {
        id: video.id,
        hasVideoUrl: !!video.videoUrl,
        videoUrlLength: video.videoUrl?.length || 0,
        videoUrlType: typeof video.videoUrl,
        mimeType: video.mimeType,
      });
    });

    console.log(`ğŸ¥ Found ${videos.length} videos for ad ${id}`);
    videos.forEach((video, index) => {
      console.log(`Video ${index + 1}:`, {
        id: video.id,
        hasVideoUrl: !!video.videoUrl,
        videoUrlLength: video.videoUrl?.length || 0,
        mimeType: video.mimeType,
        fileSize: video.fileSize,
      });
    });

    // Cache the result
    adCache.set(videoCacheKey, {
      data: videos,
      timestamp: Date.now(),
      ttl: 3600000, // 1 hour
    });

    const responseTime = performance.now() - startTime;
    console.log(`ğŸ¥ Videos loaded in: ${responseTime.toFixed(2)}ms`);

    res.set("Cache-Control", "public, max-age=3600"); // 1 hour cache
    return res.json({ videos });
  } catch (error) {
    console.error("âŒ Error fetching ad videos:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Create new ad
export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("ğŸš› createAd API called");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ“ Request files:", req.files?.length || 0);

    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) {
      res
        .status(401)
        .json({ success: false, error: "KullanÄ±cÄ± doÄŸrulamasÄ± gerekli" });
      return;
    }

    const files = req.files as Express.Multer.File[];

    // Debug: Log all received data
    console.log("ğŸ“¥ Received brandId:", req.body.brandId);
    console.log("ğŸ“¥ Received modelId:", req.body.modelId);
    console.log("ğŸ“¥ Received variantId:", req.body.variantId);
    console.log("ğŸ“¥ Received category:", req.body.category);
    console.log("ğŸ“¥ Received subcategory:", req.body.subcategory);

    const {
      // Basic fields
      title,
      description,
      price,
      currency: rawCurrency,
      year,
      productionYear,
      category,
      subcategory,
      subType, // KonteynerTasiyiciSasiGrubu forms send subType
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

      // KuruyÃ¼k specific fields
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

      // Tanker specific fields
      hacim,
      gozSayisi,
      renk,

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

    // Normalize currency - FormData may send it as array if appended twice
    const currency = Array.isArray(rawCurrency) ? rawCurrency[0] : rawCurrency;

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

    // Handle new format (tenteli forms and KuruyÃ¼k forms and KonteynerTasiyiciSasiGrubu forms)
    if (category && (subcategory || subType)) {
      const actualSubcategory = subcategory || subType;
      console.log(
        "ğŸ¯ Using NEW FORMAT branch - category:",
        category,
        "subcategory:",
        actualSubcategory,
      );
      console.log("ğŸ·ï¸ Brand/Model/Variant IDs:", {
        brandId,
        modelId,
        variantId,
      });

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
          .json({ success: false, error: `Kategori bulunamadÄ±: ${category}` });
        return;
      }

      adData.categoryId = categoryRecord.id;
      adData.brandId = brandId ? parseInt(brandId) : null;
      adData.modelId = modelId ? parseInt(modelId) : null;
      adData.variantId = variantId
        ? parseInt(variantId)
        : variant_id
          ? parseInt(variant_id)
          : null;
      adData.price = price ? parseFloat(price) : null;
      adData.currency = currency || "TRY";
      adData.year = year
        ? parseInt(year)
        : productionYear
          ? parseInt(productionYear)
          : null;

      // Construct location string from cityId and districtId
      let locationString = "";
      if (cityId && districtId) {
        const cityRecord = await prisma.city.findUnique({
          where: { id: parseInt(cityId) },
        });
        const districtRecord = await prisma.district.findUnique({
          where: { id: parseInt(districtId) },
        });
        if (cityRecord && districtRecord) {
          locationString = `${cityRecord.name}, ${districtRecord.name}`;
        }
      } else if (city && district) {
        locationString = `${city}, ${district}`;
      }

      adData.location = locationString;
      adData.cityId = cityId ? parseInt(cityId) : null;
      adData.districtId = districtId ? parseInt(districtId) : null;

      // Add seller contact info to custom fields for now
      adData.customFields = {
        subType: actualSubcategory, // Store subType for filtering
        sellerName: seller_name || sellerName,
        sellerPhone: seller_phone || phone,
        sellerEmail: seller_email || email,
        hasWarranty: warranty === "evet" || warranty === "true",
        isNegotiable: negotiable === "evet" || negotiable === "true",
        isExchangeable: exchange === "evet" || exchange === "true",
        city: city,
        district: district,
        detailedInfo: detailedInfo,

        // KuruyÃ¼k specific fields
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

        // Tanker specific data
        hacim: hacim || null,
        gozSayisi: gozSayisi || null,
        renk: renk || null,

        // Store all form data from KonteynerTasiyiciSasiGrubu
        ...req.body,
      };
    }
    // Handle legacy format and direct KuruyÃ¼k submissions
    else {
      console.log("ğŸ¯ Using LEGACY FORMAT branch");
      console.log("ğŸ·ï¸ Legacy Brand/Model/Variant IDs:", {
        brandId,
        modelId,
        variantId,
      });

      adData.categoryId = categoryId ? parseInt(categoryId) : null;
      adData.brandId = brandId ? parseInt(brandId) : null;
      adData.modelId = modelId ? parseInt(modelId) : null;
      adData.variantId = variantId ? parseInt(variantId) : null;
      adData.price = price ? parseFloat(price) : null;
      adData.currency = currency || "TRY";
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

      // Merge custom fields with KuruyÃ¼k fields
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

        // KuruyÃ¼k specific fields
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

    console.log("ğŸ’¾ Final adData before save:", adData);

    const ad = await prisma.ad.create({
      data: adData,
      include: {
        category: true,
        brand: true,
        model: true,
        variant: true,
        city: true,
        district: true,
      },
    });

    console.log("âœ… Ad created with relations:", {
      id: ad.id,
      categoryId: ad.categoryId,
      brandId: ad.brandId,
      modelId: ad.modelId,
      variantId: ad.variantId,
      category: ad.category?.name,
      brand: ad.brand?.name,
      model: ad.model?.name,
      variant: ad.variant?.name,
    });

    // Verify brand/model/variant relationships
    if (ad.brandId) {
      const brandVerify = await prisma.brand.findUnique({
        where: { id: ad.brandId },
        select: { id: true, name: true, slug: true },
      });
      console.log("ğŸ” Brand verification:", brandVerify);
    }

    if (ad.modelId) {
      const modelVerify = await prisma.model.findUnique({
        where: { id: ad.modelId },
        select: { id: true, name: true, slug: true, brandId: true },
      });
      console.log("ğŸ” Model verification:", modelVerify);
    }

    if (ad.variantId) {
      const variantVerify = await prisma.variant.findUnique({
        where: { id: ad.variantId },
        select: { id: true, name: true, slug: true, modelId: true },
      });
      console.log("ğŸ” Variant verification:", variantVerify);
    }

    // Handle images if provided
    if (files && files.length > 0) {
      const showcaseIndex = showcase_image_index
        ? parseInt(showcase_image_index)
        : 0;

      const imagePromises = files.map(async (file, index) => {
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        return prisma.adImage.create({
          data: {
            adId: ad.id,
            imageUrl: base64Image,
            displayOrder: index,
            isPrimary: index === showcaseIndex,
            altText: `${title} - FotoÄŸraf ${index + 1}`,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    // Handle videos if provided
    const videoFiles = files
      ? files.filter((f) => f.fieldname.startsWith("video_"))
      : [];
    console.log(`ğŸ¥ Total files received: ${files?.length || 0}`);
    console.log(`ğŸ¥ Video files found: ${videoFiles.length}`);

    if (videoFiles.length > 0) {
      console.log(`ğŸ¥ Processing ${videoFiles.length} videos for ad ${ad.id}`);
      videoFiles.forEach((file, index) => {
        console.log(`ğŸ“¹ Video ${index + 1}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      });

      const videoPromises = videoFiles.map((videoFile, index) => {
        const base64Video = `data:${videoFile.mimetype
          };base64,${videoFile.buffer.toString("base64")}`;

        console.log(
          `ğŸ’¾ Saving video ${index + 1} to database for ad ${ad.id}`,
          {
            fieldname: videoFile.fieldname,
            mimetype: videoFile.mimetype,
            size: videoFile.size,
            base64Length: base64Video.length,
          },
        );

        return prisma.adVideo.create({
          data: {
            adId: ad.id,
            videoUrl: base64Video,
            displayOrder: index,
          },
        });
      });

      await Promise.all(videoPromises);
      console.log(
        `âœ… ${videoFiles.length} videos saved successfully to database for ad ${ad.id}`,
      );

      // Verify videos were saved
      const savedVideos = await prisma.adVideo.findMany({
        where: { adId: ad.id },
        select: { id: true, displayOrder: true, adId: true },
      });
      console.log(
        `ğŸ” Verification: ${savedVideos.length} videos found in database for ad ${ad.id}`,
      );
    } else {
      console.log("â„¹ï¸ No video files to process");
    }

    console.log(`âœ… Ä°lan oluÅŸturuldu: ${ad.id}`);

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(ad.id);

    res.status(201).json({
      success: true,
      message:
        moderationResult.decision === "APPROVED"
          ? "Ä°lan baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Ä°lan oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Ä°lan baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      listing: { id: ad.id },
      ad, // Legacy compatibility
      moderation: moderationResult,
    });
  } catch (error) {
    console.error("Ä°lan oluÅŸturulurken hata:", error);
    res.status(500).json({
      success: false,
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
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
      where: { id: parseIntParam(id) },
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
      currency,
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
    if (currency !== undefined) updateData.currency = currency;
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
      where: { id: parseIntParam(id) },
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
      where: { id: parseIntParam(id) },
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
      where: { id: parseIntParam(id) },
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
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        year: true,
        mileage: true,
        status: true,
        viewCount: true,
        isPromoted: true,
        promotedUntil: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
            isPrimary: true,
            displayOrder: true,
            altText: true,
          },
          orderBy: { displayOrder: "asc" },
          take: 1, // Sadece ilk resmi al
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
      where: { id: parseIntParam(id) },
      data: {
        status,
        ...(status === "APPROVED" && { publishedAt: new Date() }),
        ...(status === "REJECTED" && {
          rejectedAt: new Date(),
          rejectedReason: reason,
        }),
      },
    });

    // Admin review kaydÄ± oluÅŸtur - ÅŸimdilik console'a yazdÄ±r
    console.log(
      `Admin ${adminId} ${status} ad ${id}. Reason: ${reason || "No reason provided"
      }`,
    );

    return res.json({ message: `Ad ${status.toLowerCase()} successfully`, ad });
  } catch (error) {
    console.error("Error moderating ad:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Ä°lan oluÅŸtur (MinibÃ¼s & MidibÃ¼s)
export const createMinibusAd = async (req: Request, res: Response) => {
  try {
    console.log("ğŸš› MinibÃ¼s Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ï¿½ ID DeÄŸerleri:");
    console.log("  - categoryId:", req.body.categoryId);
    console.log("  - brandId:", req.body.brandId);
    console.log("  - modelId:", req.body.modelId);
    console.log("  - variantId:", req.body.variantId);
    console.log("ï¿½ğŸ“¦ Request headers:", req.headers);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
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
      // ID'ler - Frontend'den gelen asÄ±l ID deÄŸerleri
      categoryId,
      brandId,
      modelId,
      variantId,
      // Detay bilgiler
      features,
      currency,
    } = req.body;

    // Motor gÃ¼cÃ¼ debug (MinibÃ¼s)
    console.log("MinibÃ¼s Backend received motorPower:", motorPower);

    // Form data debug
    console.log("âœ… Form Data (MinibÃ¼s):");
    console.log("  - Title:", title);
    console.log("  - Motor Power:", motorPower);
    console.log("  - Engine Volume:", engineVolume);
    console.log("  - Transmission:", transmission);
    console.log("  - Fuel Type:", fuelType);
    console.log("  - Has Accident Record:", req.body.hasAccidentRecord);
    console.log("  - Has Tramer Record:", req.body.hasTramerRecord);

    // Enum deÄŸerlerini dÃ¶nÃ¼ÅŸtÃ¼r
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

    // Detay Ã¶zelliklerini JSON olarak hazÄ±rla
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

    // MinibÃ¼s kategorisini bul
    const minibusCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "minibus" },
          { slug: "minibus-midibus" },
          { name: { contains: "MinibÃ¼s" } },
        ],
      },
    });

    if (!minibusCategory) {
      return res.status(400).json({ error: "MinibÃ¼s kategorisi bulunamadÄ±" });
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
        currency: currency || "TRY",
        mileage: mileage ? parseInt(mileage) : null,
        // City ve District'i asÄ±l sÃ¼tunlara kaydet
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
          // IDs (backward compatibility iÃ§in)
          categoryId: categoryId ? parseInt(categoryId) : null,
          brandId: brandId ? parseInt(brandId) : null,
          modelId: modelId ? parseInt(modelId) : null,
          variantId: variantId ? parseInt(variantId) : null,
          // Slugs (eski uyumluluk iÃ§in)
          categorySlug: categorySlug || null,
          brandSlug: brandSlug || null,
          modelSlug: modelSlug || null,
          variantSlug: variantSlug || null,
          // CustomFields'ta da sakla (backward compatibility iÃ§in)
          cityId: cityId ? parseInt(cityId) : null,
          districtId: districtId ? parseInt(districtId) : null,
        },
        status: "PENDING",
      },
    });

    // Resim yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ğŸ“· Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(`ğŸ“· Resim ${displayOrder} base64 formatÄ±nda kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          }),
        );
        displayOrder++;
      }

      // TÃ¼m resimleri veritabanÄ±na kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} resim baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
        );
      }

      // Video yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
      const videoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("video_"),
      );
      if (videoFiles.length > 0) {
        console.log(
          "ğŸ¬ Videolar base64 formatÄ±nda kaydediliyor:",
          videoFiles.map((f: any) => f.fieldname),
        );

        const videoPromises = [];
        let videoDisplayOrder = 1;

        for (const file of videoFiles) {
          // Base64 formatÄ±na Ã§evir
          const base64Video = `data:${file.mimetype
            };base64,${file.buffer.toString("base64")}`;

          console.log(
            `ğŸ¬ Video ${videoDisplayOrder} base64 formatÄ±nda kaydediliyor`,
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
            }),
          );
          videoDisplayOrder++;
        }

        // TÃ¼m videolarÄ± veritabanÄ±na kaydet
        if (videoPromises.length > 0) {
          await Promise.all(videoPromises);
          console.log(
            `âœ… ${videoPromises.length} video baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
          );
        }
      }
    }

    // OluÅŸturulan ilanÄ± resimler ve videolarla birlikte getir
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

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(createdAd?.id || 0);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "MinibÃ¼s ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "MinibÃ¼s ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "MinibÃ¼s ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad: createdAd,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("Ä°lan oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
    });
  }
};

// Ä°lan oluÅŸtur (Ã‡ekici)
export const createCekiciAd = async (req: Request, res: Response) => {
  try {
    console.log("ğŸšš Ã‡ekici Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
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
      hasAccidentRecord,
      hasTramerRecord,
      cityId,
      districtId,
      detailedInfo,
      // Category/Brand/Model/Variant IDs
      categoryId,
      brandId,
      modelId,
      variantId,
      // Legacy slug support
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      features,
      currency,
    } = req.body;

    // Ã–zellikleri JSON olarak hazÄ±rla
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

    // Ã‡ekici kategorisini bul veya oluÅŸtur
    let cekiciCategory = await prisma.category.findFirst({
      where: {
        OR: [{ slug: "cekici" }, { name: { contains: "Ã‡ekici" } }],
      },
    });

    // EÄŸer kategori yoksa oluÅŸtur
    if (!cekiciCategory) {
      console.log("ğŸ—ï¸ Ã‡ekici kategorisi bulunamadÄ±, oluÅŸturuluyor...");
      cekiciCategory = await prisma.category.create({
        data: {
          name: "Ã‡ekici",
          slug: "cekici",
          displayOrder: 2,
          isActive: true,
          description: "Ã‡ekici araÃ§lar kategorisi",
        },
      });
      console.log("âœ… Ã‡ekici kategorisi oluÅŸturuldu:", cekiciCategory.id);
    }

    // CategoryId doÄŸrulama - eÄŸer geÃ§ersizse fallback kullan
    let finalCategoryId = cekiciCategory.id;
    if (categoryId) {
      const parsedCategoryId = parseInt(categoryId);
      if (!isNaN(parsedCategoryId)) {
        // Gelen categoryId'nin database'de olup olmadÄ±ÄŸÄ±nÄ± kontrol et
        const categoryExists = await prisma.category.findUnique({
          where: { id: parsedCategoryId },
        });
        if (categoryExists) {
          finalCategoryId = parsedCategoryId;
          console.log("âœ… Frontend categoryId kullanÄ±lÄ±yor:", finalCategoryId);
        } else {
          console.log(
            "âš ï¸ GeÃ§ersiz categoryId, fallback kullanÄ±lÄ±yor:",
            finalCategoryId,
          );
        }
      }
    }

    console.log("ğŸ”§ ID deÄŸerleri debug:", {
      categoryId,
      brandId,
      modelId,
      variantId,
      finalCategoryId,
      parsedBrandId: brandId ? parseInt(brandId) : null,
      parsedModelId: modelId ? parseInt(modelId) : null,
      parsedVariantId: variantId ? parseInt(variantId) : null,
    });

    const ad = await prisma.ad.create({
      data: {
        userId,
        // DoÄŸrulanmÄ±ÅŸ categoryId'yi kullan
        categoryId: finalCategoryId,
        // Brand, Model ve Variant ID'lerini kaydet
        brandId: brandId ? parseInt(brandId) : null,
        modelId: modelId ? parseInt(modelId) : null,
        variantId: variantId ? parseInt(variantId) : null,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
        mileage: mileage ? parseInt(mileage) : null,
        // City ve District'i asÄ±l sÃ¼tunlara kaydet
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
          hasAccidentRecord: hasAccidentRecord || null,
          hasTramerRecord: hasTramerRecord || null,
          tramerRecord: hasTramerRecord || null, // Yeni alan: rakam olarak
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

    console.log("âœ… Ã‡ekici ilanÄ± oluÅŸturuldu, ID:", ad.id);

    // Resim yÃ¼kleme iÅŸlemleri
    const files = req.files as any;
    console.log("ğŸ“‚ YÃ¼klenen dosyalar:", files);

    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises: any[] = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ï¿½ Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(`ğŸ“· Resim ${displayOrder} base64 formatÄ±nda kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          }),
        );
        displayOrder++;
      }

      // TÃ¼m resimleri veritabanÄ±na kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} resim baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
        );
      }

      // Video yÃ¼kleme iÅŸlemleri (resimsiz olsa bile video olabilir)
      console.log("ğŸ¬ Video dosyalarÄ± filtreleniyor...");
      const videoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("video_"),
      );
      console.log(`ğŸ¬ Bulunan video dosya sayÄ±sÄ±: ${videoFiles.length}`);
      console.log(
        "ğŸ¬ Video dosya isimleri:",
        videoFiles.map((f: any) => f.fieldname),
      );

      if (videoFiles && videoFiles.length > 0) {
        console.log(
          "ğŸ¬ Videolar base64 formatÄ±nda kaydediliyor:",
          videoFiles.map((f: any) => f.fieldname),
        );

        const videoPromises: any[] = [];
        let videoDisplayOrder = 1;

        for (const file of videoFiles) {
          // Base64 formatÄ±na Ã§evir
          const base64Video = `data:${file.mimetype
            };base64,${file.buffer.toString("base64")}`;

          console.log(
            `ğŸ¬ Video ${videoDisplayOrder} base64 formatÄ±nda kaydediliyor`,
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
            }),
          );
          videoDisplayOrder++;
        }

        // TÃ¼m videolarÄ± veritabanÄ±na kaydet
        if (videoPromises.length > 0) {
          await Promise.all(videoPromises);
          console.log(
            `âœ… ${videoPromises.length} video baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
          );
        }
      }
    }

    // OluÅŸturulan ilanÄ± resimler ve videolarla birlikte getir
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

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(createdAd?.id || 0);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Ã‡ekici ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Ã‡ekici ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Ã‡ekici ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad: createdAd,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("ğŸš¨ Ã‡ekici ilanÄ± oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      requestBody: Object.keys(req.body),
      files: req.files ? (req.files as any[]).length : 0,
    });

    // Prisma hatalarÄ±nÄ± Ã¶zel olarak handle et
    if (error.code && error.code.startsWith("P")) {
      console.error("ğŸ”´ Prisma Database Error:", {
        code: error.code,
        meta: error.meta,
        clientVersion: error.clientVersion,
      });
    }

    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
      errorCode: error.code || "UNKNOWN_ERROR",
    });
  }
};

// Ä°l listesi
export const getCities = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Cities endpoint called - checking database...");

    // GeÃ§ici olarak ham SQL kullan
    const cities =
      await prisma.$queryRaw`SELECT id, name, plate_code as "plateCode" FROM cities WHERE is_active = true ORDER BY name ASC`;

    console.log(`Returning cities:`, cities);
    res.json(cities);
  } catch (error) {
    console.error("Ä°l listesi hatasÄ±:", error);
    console.error("Error details:", error);
    res.status(500).json({ error: "Ä°l listesi alÄ±nÄ±rken hata oluÅŸtu" });
  }
};

// Ä°lÃ§e listesi
export const getDistricts = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;

    const districts =
      await prisma.$queryRaw`SELECT id, name, city_id as "cityId" FROM districts WHERE city_id = ${parseIntParam(
        cityId,
      )} AND is_active = true ORDER BY name ASC`;

    res.json(districts);
  } catch (error) {
    console.error("Ä°lÃ§e listesi hatasÄ±:", error);
    res.status(500).json({ error: "Ä°lÃ§e listesi alÄ±nÄ±rken hata oluÅŸtu" });
  }
};

// Admin: Onay bekleyen ilanlarÄ± getir
export const getPendingAds = async (req: Request, res: Response) => {
  try {
    console.log("ğŸ” getPendingAds Ã§aÄŸrÄ±ldÄ±");
    console.log(
      "ğŸ“‹ Request headers:",
      req.headers.authorization ? "Auth header var" : "Auth header YOK",
    );

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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
          select: {
            id: true,
            imageUrl: true,
            isPrimary: true,
            displayOrder: true,
            altText: true,
          },
          orderBy: { displayOrder: "asc" },
        },
        videos: {
          select: {
            id: true,
            videoUrl: true,
            thumbnailUrl: true,
            description: true,
            displayOrder: true,
            duration: true,
            mimeType: true,
          },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // En fazla 50 ilan getir
    });

    console.log("ğŸ“Š Pending ads fetched:", pendingAds.length);
    if (pendingAds.length > 0) {
      console.log("ğŸ“ Sample ad fields:", Object.keys(pendingAds[0]));
      console.log("ğŸ¯ Ä°lk ilan Ã¶rneÄŸi:", {
        id: pendingAds[0].id,
        title: pendingAds[0].title,
        status: pendingAds[0].status,
        userId: pendingAds[0].userId,
        createdAt: pendingAds[0].createdAt,
        imagesCount: pendingAds[0].images?.length || 0,
        videosCount: pendingAds[0].videos?.length || 0,
      });

      // Her ilan iÃ§in detaylÄ± log
      pendingAds.forEach((ad, index) => {
        console.log(`ğŸ“· Ä°lan ${index + 1} (ID: ${ad.id}):`, {
          title: ad.title,
          images: ad.images?.length || 0,
          videos: ad.videos?.length || 0,
          imageDetails:
            ad.images?.map((img) => ({
              id: img.id,
              isPrimary: img.isPrimary,
              hasUrl: !!img.imageUrl,
            })) || [],
          videoDetails:
            ad.videos?.map((vid) => ({
              id: vid.id,
              hasUrl: !!vid.videoUrl,
              hasThumbnail: !!vid.thumbnailUrl,
            })) || [],
        });
      });
    } else {
      console.log("âŒ PENDING durumunda hiÃ§ ilan bulunamadÄ±!");

      // TÃ¼m ilanlarÄ± kontrol et
      const allAds = await prisma.ad.findMany({
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      console.log("ğŸ” Son 10 ilan durumu:", allAds);
    }

    res.json(pendingAds);
  } catch (error) {
    console.error("Onay bekleyen ilanlar hatasÄ±:", error);
    res
      .status(500)
      .json({ error: "Onay bekleyen ilanlar alÄ±nÄ±rken hata oluÅŸtu" });
  }
};

// Admin: Ä°lanÄ± onayla
export const approveAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Ä°lanÄ± onayla
    const ad = await prisma.ad.update({
      where: { id: parseIntParam(id) },
      data: {
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        brand: true,
        model: true,
      },
    });

    console.log("âœ… Ä°lan onaylandÄ± - Cache yenileniyor:", ad.id);

    // âœ… KullanÄ±cÄ±ya bildirim gÃ¶nder
    await prisma.notification.create({
      data: {
        userId: ad.userId,
        title: "Ä°lanÄ±nÄ±z OnaylandÄ±! ğŸ‰",
        message: `"${ad.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±z onaylandÄ±. Ä°lanÄ±nÄ±z birkaÃ§ dakika iÃ§inde anasayfada gÃ¶rÃ¼necektir.`,
        type: "SUCCESS",
        relatedId: ad.id,
      },
    });

    // â— GERÃ‡EK ZAMANLI BÄ°LDÄ°RÄ°M: Socket.io ile tÃ¼m baÄŸlÄ± kullanÄ±cÄ±lara bildir
    io.emit("adApproved", {
      adId: ad.id,
      title: ad.title,
      message: "Yeni bir ilan onaylandÄ±!",
    });

    // KullanÄ±cÄ±ya Ã¶zel bildirim gÃ¶nder
    io.to(`user_${ad.userId}`).emit("notification", {
      title: "Ä°lanÄ±nÄ±z OnaylandÄ±! ğŸ‰",
      message: `"${ad.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±z onaylandÄ±. Ä°lanÄ±nÄ±z kÄ±sa sÃ¼re iÃ§inde anasayfada gÃ¶rÃ¼necektir.`,
      type: "SUCCESS",
    });

    // Log
    console.log(
      `ğŸ“£ Ä°lan onaylandÄ± ve socket bildirimi gÃ¶nderildi: ${ad.title} - KullanÄ±cÄ±: ${ad.user.email}`,
    );

    res.json({ message: "Ä°lan baÅŸarÄ±yla onaylandÄ±", ad });
  } catch (error) {
    console.error("Ä°lan onaylama hatasÄ±:", error);
    res.status(500).json({ error: "Ä°lan onaylanÄ±rken hata oluÅŸtu" });
  }
};

// Admin: Ä°lanÄ± reddet
export const rejectAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ad = await prisma.ad.update({
      where: { id: parseIntParam(id) },
      data: {
        status: "REJECTED",
      },
      include: {
        user: true,
      },
    });

    // âŒ KullanÄ±cÄ±ya bildirim gÃ¶nder
    await prisma.notification.create({
      data: {
        userId: ad.userId,
        title: "Ä°lanÄ±nÄ±z Reddedildi",
        message: `"${ad.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±z yayÄ±na alÄ±nmadÄ±. Sebep: ${reason || "Belirtilmedi"
          }`,
        type: "ERROR",
        relatedId: ad.id,
      },
    });

    // KullanÄ±cÄ±ya Ã¶zel bildirim gÃ¶nder
    io.to(`user_${ad.userId}`).emit("notification", {
      title: "Ä°lanÄ±nÄ±z Reddedildi",
      message: `"${ad.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±z yayÄ±na alÄ±nmadÄ±.`,
      type: "ERROR",
      reason: reason || "Belirtilmedi",
    });

    // Log
    console.log(
      `Ä°lan reddedildi: ${ad.title} - KullanÄ±cÄ±: ${ad.user.email} - Sebep: ${reason}`,
    );

    res.json({ message: "Ä°lan baÅŸarÄ±yla reddedildi", ad });
  } catch (error) {
    console.error("Ä°lan reddetme hatasÄ±:", error);
    res.status(500).json({ error: "Ä°lan reddedilirken hata oluÅŸtu" });
  }
};

// Admin: Ä°lanÄ± dÃ¼zenle ve kullanÄ±cÄ±ya bildirim gÃ¶nder
export const adminUpdateAd = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;

    // Mevcut ilanÄ± al
    const existingAd = await prisma.ad.findUnique({
      where: { id: parseIntParam(id) },
      include: { user: true },
    });

    if (!existingAd) {
      res.status(404).json({ error: "Ä°lan bulunamadÄ±" });
      return;
    }

    const {
      title,
      description,
      price,
      currency,
      year,
      mileage,
      status,
      cityId,
      districtId,
      customFields,
      editNote,
    } = req.body;

    // DeÄŸiÅŸiklikleri hazÄ±rla
    const updateData: any = {};
    const changes: string[] = [];

    if (title !== undefined && title !== existingAd.title) {
      updateData.title = title;
      changes.push("baÅŸlÄ±k");
    }
    if (description !== undefined && description !== existingAd.description) {
      updateData.description = description;
      changes.push("aÃ§Ä±klama");
    }
    if (price !== undefined && parseFloat(price) !== Number(existingAd.price)) {
      updateData.price = price ? parseFloat(price) : null;
      changes.push("fiyat");
    }
    if (currency !== undefined && currency !== existingAd.currency) {
      updateData.currency = currency;
      changes.push("para birimi");
    }
    if (year !== undefined && parseInt(year) !== existingAd.year) {
      updateData.year = year ? parseInt(year) : null;
      changes.push("model yÄ±lÄ±");
    }
    if (mileage !== undefined && parseInt(mileage) !== existingAd.mileage) {
      updateData.mileage = mileage ? parseInt(mileage) : null;
      changes.push("kilometre");
    }
    if (status !== undefined && status !== existingAd.status) {
      updateData.status = status;
      changes.push("durum");
    }
    if (cityId !== undefined && parseInt(cityId) !== existingAd.cityId) {
      updateData.cityId = cityId ? parseInt(cityId) : null;
      changes.push("ÅŸehir");
    }
    if (
      districtId !== undefined &&
      parseInt(districtId) !== existingAd.districtId
    ) {
      updateData.districtId = districtId ? parseInt(districtId) : null;
      changes.push("ilÃ§e");
    }
    if (customFields !== undefined) {
      updateData.customFields = customFields;
      changes.push("ilan detaylarÄ±");
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "DeÄŸiÅŸiklik yapÄ±lmadÄ±" });
      return;
    }

    // Ä°lanÄ± gÃ¼ncelle
    const updatedAd = await prisma.ad.update({
      where: { id: parseIntParam(id) },
      data: updateData,
      include: {
        category: true,
        brand: true,
        model: true,
        city: true,
        district: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    // KullanÄ±cÄ±ya bildirim gÃ¶nder
    const changesList = changes.join(", ");
    const notificationMessage = editNote
      ? `"${updatedAd.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±zda admin tarafÄ±ndan dÃ¼zenleme yapÄ±ldÄ±. DeÄŸiÅŸen alanlar: ${changesList}. Not: ${editNote}`
      : `"${updatedAd.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±zda admin tarafÄ±ndan dÃ¼zenleme yapÄ±ldÄ±. DeÄŸiÅŸen alanlar: ${changesList}`;

    await prisma.notification.create({
      data: {
        userId: existingAd.userId,
        title: "Ä°lanÄ±nÄ±z DÃ¼zenlendi âœï¸",
        message: notificationMessage,
        type: "INFO",
        relatedId: updatedAd.id,
      },
    });

    // Socket.io ile anlÄ±k bildirim
    io.to(`user_${existingAd.userId}`).emit("notification", {
      title: "Ä°lanÄ±nÄ±z DÃ¼zenlendi âœï¸",
      message: notificationMessage,
      type: "INFO",
    });

    console.log(
      `âœï¸ Admin (${adminId}) ilanÄ± dÃ¼zenledi: ${updatedAd.title} - KullanÄ±cÄ±: ${existingAd.user.email} - DeÄŸiÅŸiklikler: ${changesList}`,
    );

    res.json({
      message: "Ä°lan baÅŸarÄ±yla gÃ¼ncellendi",
      ad: updatedAd,
      changes: changes,
    });
  } catch (error) {
    console.error("Admin ilan dÃ¼zenleme hatasÄ±:", error);
    res.status(500).json({ error: "Ä°lan dÃ¼zenlenirken hata oluÅŸtu" });
  }
};

// Ä°lan oluÅŸtur (Kamyon)
export const createKamyonAd = async (req: Request, res: Response) => {
  try {
    console.log("===========================================");
    console.log("ğŸš› KAMYON AD API CALLED - DEBUG");
    console.log("===========================================");
    console.log("ğŸš› Kamyon Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ†” ID DeÄŸerleri:");
    console.log("  - categoryId:", req.body.categoryId);
    console.log("  - brandId:", req.body.brandId);
    console.log("  - modelId:", req.body.modelId);
    console.log("  - variantId:", req.body.variantId);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    // FILES DEBUG - Ã–NCE BURAYA BAK
    let files = req.files as any;
    console.log("ğŸ” FILES CONTROL:");
    console.log("  - Files var mÄ±?", !!files);
    console.log("  - Files type:", typeof files);
    console.log(
      "  - Files length:",
      files ? files.length : "files null/undefined",
    );
    console.log("  - Files content:", files);
    if (files && files.length > 0) {
      console.log(
        "  - File names:",
        files.map((f: any) => f.fieldname),
      );
      console.log(
        "  - Video files:",
        files.filter((f: any) => f.fieldname.startsWith("video_")),
      );
    }

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
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
      lastikDurumu,
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
      // ID'ler - Frontend'den gelen asÄ±l ID deÄŸerleri
      categoryId,
      brandId,
      modelId,
      variantId,
      features,
      currency,
    } = req.body;

    // Ã–zellikleri JSON olarak hazÄ±rla
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

    // Motor gÃ¼cÃ¼ debug
    console.log("Backend received motorPower:", motorPower);

    // Kamyon Form data debug
    console.log("âœ… Form Data (Kamyon):");
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
      return res.status(400).json({ error: "Kamyon kategorisi bulunamadÄ±" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        // Frontend'den gelen categoryId'yi kullan, yoksa fallback olarak kamyonCategory.id
        categoryId: categoryId ? parseInt(categoryId) : kamyonCategory.id,
        // Brand, Model ve Variant ID'lerini kaydet
        brandId: brandId ? parseInt(brandId) : null,
        modelId: modelId ? parseInt(modelId) : null,
        variantId: variantId ? parseInt(variantId) : null,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
        mileage: mileage ? parseInt(mileage) : null,
        // City ve District'i asÄ±l sÃ¼tunlara kaydet
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
          tireCondition: tireCondition || lastikDurumu || null,
          lastikDurumu: lastikDurumu || tireCondition || null,
          superstructure: superstructure || null,
          exchange: exchange || null,
          hasAccidentRecord: hasAccidentRecord || null,
          hasTramerRecord: hasTramerRecord || null,
          tramerRecord: hasTramerRecord || null, // Yeni alan: rakam olarak
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

    console.log("âœ… Kamyon ilanÄ± oluÅŸturuldu, ID:", ad.id);

    // Resim yÃ¼kleme iÅŸlemleri
    console.log("ğŸ“‚ YÃ¼klenen dosyalar:", files);

    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises: any[] = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ï¿½ Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(`ğŸ“· Resim ${displayOrder} base64 formatÄ±nda kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          }),
        );
        displayOrder++;
      }

      // TÃ¼m resimleri veritabanÄ±na kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} resim baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
        );
      }
    }

    // Video yÃ¼kleme iÅŸlemleri (Ana createAd fonksiyonundan kopyalanmÄ±ÅŸ)
    const videoFiles = files
      ? files.filter((f: any) => f.fieldname.startsWith("video_"))
      : [];
    console.log(`ğŸ¥ Total files received: ${files?.length || 0}`);
    console.log(`ğŸ¥ Video files found: ${videoFiles.length}`);

    if (videoFiles.length > 0) {
      console.log(`ğŸ¥ Processing ${videoFiles.length} videos for ad ${ad.id}`);
      videoFiles.forEach((file: any, index: number) => {
        console.log(`ğŸ“¹ Video ${index + 1}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      });

      const videoPromises = videoFiles.map((videoFile: any, index: number) => {
        const base64Video = `data:${videoFile.mimetype
          };base64,${videoFile.buffer.toString("base64")}`;

        console.log(
          `ğŸ’¾ Saving video ${index + 1} to database for ad ${ad.id}`,
          {
            fieldname: videoFile.fieldname,
            mimetype: videoFile.mimetype,
            size: videoFile.size,
            base64Length: base64Video.length,
          },
        );

        return prisma.adVideo.create({
          data: {
            adId: ad.id,
            videoUrl: base64Video,
            displayOrder: index,
            mimeType: videoFile.mimetype,
            fileSize: videoFile.size,
            description: `Video ${index + 1}`,
          },
        });
      });

      await Promise.all(videoPromises);
      console.log(`âœ… ${videoFiles.length} video baÅŸarÄ±yla kaydedildi!`);
    }

    // OluÅŸturulan ilanÄ± resimler ve videolarla birlikte getir
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

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(createdAd?.id || 0);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Kamyon ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Kamyon ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Kamyon ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad: createdAd,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("Kamyon ilanÄ± oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
    });
  }
};

// Ä°lan oluÅŸtur (OtobÃ¼s)
export const createOtobusAd = async (req: Request, res: Response) => {
  try {
    console.log("ğŸšŒ OtobÃ¼s Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
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
      passengerCapacity,
      seatLayout,
      seatBackScreen,
      tireCondition,
      fuelCapacity,
      exchange,
      damageRecord,
      paintChange,
      hasAccidentRecord,
      hasTramerRecord,
      plateType,
      plateNumber,
      cityId,
      districtId,
      detailedInfo,
      features,
      drivetrain,
      gearType,
      gearCount,
      // Brand/Model/Variant ID'leri
      categoryId,
      brandId,
      modelId,
      variantId,
      currency,
    } = req.body;

    // Debug iÃ§in form verilerini log'la
    console.log("ğŸšŒ OtobÃ¼s form verileri:", {
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

    // Debug ID'leri kontrol et
    console.log("ğŸ” ID Validation - OtobÃ¼s:", {
      categoryId,
      brandId,
      modelId,
      variantId,
    });

    // Ã–zellikleri JSON olarak hazÄ±rla
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

    // OtobÃ¼s kategorisini bul
    let validCategoryId = null;
    if (categoryId && categoryId !== "" && categoryId !== "undefined") {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (categoryExists && categoryExists.slug === "otobus") {
        validCategoryId = parseInt(categoryId);
        console.log("âœ… Frontend OtobÃ¼s categoryId geÃ§erli:", validCategoryId);
      } else {
        console.log(
          "âŒ Frontend categoryId yanlÄ±ÅŸ, OtobÃ¼s kategori ID'sini arayacaÄŸÄ±m:",
          categoryId,
        );
      }
    }

    // EÄŸer geÃ§erli OtobÃ¼s categoryId yoksa, database'den bul
    if (!validCategoryId) {
      console.log("ğŸ” OtobÃ¼s kategorisini database'de arÄ±yorum...");
      const otobusCategory = await prisma.category.findFirst({
        where: {
          OR: [{ slug: "otobus" }, { id: 5 }], // OtobÃ¼s ID = 5
        },
      });

      if (!otobusCategory) {
        console.error("âŒ OtobÃ¼s kategorisi bulunamadÄ±!");
        return res.status(400).json({ error: "OtobÃ¼s kategorisi bulunamadÄ±" });
      }

      validCategoryId = otobusCategory.id;
      console.log("âœ… KullanÄ±lacak OtobÃ¼s categoryId:", validCategoryId);
    }

    // Brand/Model/Variant'larÄ± bul veya oluÅŸtur
    const {
      brandSlug,
      modelSlug,
      variantSlug,
      brandName,
      modelName,
      variantName,
    } = req.body;

    const result = await ensureBrandModelVariant(
      validCategoryId, // OtobÃ¼s kategorisi
      brandSlug,
      brandName,
      modelSlug,
      modelName,
      variantSlug,
      variantName,
      brandId && brandId !== "" ? parseInt(brandId) : undefined,
      modelId && modelId !== "" ? parseInt(modelId) : undefined,
      variantId && variantId !== "" ? parseInt(variantId) : undefined,
    );

    const parsedBrandId = result.brandId || null;
    const parsedModelId = result.modelId || null;
    const parsedVariantId = result.variantId || null;

    console.log("ğŸ”§ Final OtobÃ¼s IDs:", {
      categoryId: validCategoryId,
      brandId: parsedBrandId,
      modelId: parsedModelId,
      variantId: parsedVariantId,
    });

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: validCategoryId,
        brandId: parsedBrandId,
        modelId: parsedModelId,
        variantId: parsedVariantId,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
        mileage: mileage ? parseInt(mileage) : null,
        // City ve District'i asÄ±l sÃ¼tunlara kaydet
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
        customFields: {
          condition: condition || null,
          color: color || null,
          fuelType: fuelType || null,
          transmission: transmission || null,
          enginePower: enginePower || null,
          passengerCapacity: passengerCapacity || null,
          seatLayout: seatLayout || null,
          seatBackScreen: seatBackScreen || null,
          tireCondition: tireCondition ? parseInt(tireCondition) : null,
          fuelCapacity: fuelCapacity || null,
          exchange: exchange || null,
          damageRecord: damageRecord || null,
          paintChange: paintChange || null,
          hasAccidentRecord: hasAccidentRecord || null,
          hasTramerRecord: hasTramerRecord || null,
          tramerRecord: hasTramerRecord || null, // Yeni alan: rakam olarak
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

    console.log("âœ… OtobÃ¼s ilanÄ± oluÅŸturuldu, ID:", ad.id);

    // Resim yÃ¼kleme iÅŸlemleri
    const files = req.files as any;
    console.log("ğŸ“‚ YÃ¼klenen dosyalar:", files);

    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises: any[] = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ï¿½ Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(`ğŸ“· Resim ${displayOrder} base64 formatÄ±nda kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          }),
        );
        displayOrder++;
      }

      // TÃ¼m resimleri veritabanÄ±na kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} resim baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
        );
      }

      // Video yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda) - MinibÃ¼sAd'daki gibi files blok iÃ§inde
      const videoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("video_"),
      );
      if (videoFiles.length > 0) {
        console.log(
          "ğŸ¬ Videolar base64 formatÄ±nda kaydediliyor:",
          videoFiles.map((f: any) => f.fieldname),
        );

        const videoPromises = [];
        let videoDisplayOrder = 1;

        for (const file of videoFiles) {
          // Base64 formatÄ±na Ã§evir
          const base64Video = `data:${file.mimetype
            };base64,${file.buffer.toString("base64")}`;

          console.log(
            `ğŸ¬ Video ${videoDisplayOrder} base64 formatÄ±nda kaydediliyor`,
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
            }),
          );
          videoDisplayOrder++;
        }

        // TÃ¼m videolarÄ± veritabanÄ±na kaydet
        if (videoPromises.length > 0) {
          await Promise.all(videoPromises);
          console.log(
            `âœ… ${videoPromises.length} video baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
          );
        }
      }
    }

    // OluÅŸturulan ilanÄ± resimlerle birlikte getir
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

    // Final video kontrol
    console.log(`ğŸ¯ FINAL CHECK - KamyonAd ID: ${ad.id}`);
    console.log(`ğŸ“¸ Saved images count: ${createdAd?.images?.length || 0}`);
    console.log(`ğŸ¥ Saved videos count: ${createdAd?.videos?.length || 0}`);

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(createdAd?.id || 0);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "OtobÃ¼s ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "OtobÃ¼s ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "OtobÃ¼s ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad: createdAd,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("ğŸšŒ OtobÃ¼s ilanÄ± oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      meta: error.meta,
      requestBody: req.body,
    });

    // Prisma foreign key constraint hatalarÄ±nÄ± yakala
    if (error.code === "P2003") {
      console.error("âŒ Foreign key constraint violation:", error.meta);
      return res.status(400).json({
        error: "VeritabanÄ± baÄŸÄ±mlÄ±lÄ±k hatasÄ±",
        details: "GeÃ§ersiz kategori, marka, model veya varyant ID'si",
      });
    }

    // Prisma unique constraint hatalarÄ±nÄ± yakala
    if (error.code === "P2002") {
      console.error("âŒ Unique constraint violation:", error.meta);
      return res.status(400).json({
        error: "Benzersiz alan hatasÄ±",
        details: "Bu deÄŸerle daha Ã¶nce kayÄ±t oluÅŸturulmuÅŸ",
      });
    }

    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
    });
  }
};

// Ä°lan oluÅŸtur (Dorse)
export const createDorseAd = async (req: Request, res: Response) => {
  try {
    console.log("ğŸš› Dorse Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ“¦ Request headers:", req.headers);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
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
      // Dorse Ã¶zel alanlarÄ±
      dorseBrand,
      genislik,
      uzunluk,
      lastikDurumu,
      devrilmeYonu,
      catiPerdeSistemi,
      warranty,
      negotiable,
      exchange,
      // KuruyÃ¼k Ã¶zel alanlarÄ±
      kapakYuksekligi,
      yukseklik,
      krikoAyak,
      takasli,
      kapakSistemi,
      // Lowbed Ã¶zel alanlarÄ±
      havuzDerinligi,
      havuzGenisligi,
      havuzUzunlugu,
      istiapHaddi,
      uzatilabilirProfil,
      dingilSayisi,
      rampaMekanizmasi,
      // Ä°letiÅŸim ve detay bilgileri
      sellerName,
      phone,
      email,
      detailedInfo,
      currency,
    } = req.body;

    // Dorse kategorisini bul
    let categoryId = req.body.categoryId;
    console.log("ğŸ“‹ Provided categoryId:", categoryId);

    if (categoryId) {
      // Validate provided categoryId
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!categoryExists || categoryExists.slug !== "dorse") {
        console.log(
          "âš ï¸ Provided categoryId yanlÄ±ÅŸ, Dorse kategori ID'sini arayacaÄŸÄ±m:",
          categoryId,
        );
        categoryId = null;
      } else {
        console.log(
          "âœ… Dorse CategoryId validation successful:",
          categoryExists.name,
        );
        categoryId = parseInt(categoryId);
      }
    }

    if (!categoryId) {
      // Database'den Dorse kategorisini bul
      const dorseCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: "dorse" },
            { id: 6 }, // Dorse ID = 6
          ],
        },
      });

      if (!dorseCategory) {
        console.error("âŒ Dorse kategorisi bulunamadÄ±!");
        return res.status(400).json({ error: "Dorse kategorisi bulunamadÄ±" });
      }

      categoryId = dorseCategory.id;
    }

    console.log("ğŸ¯ Final Dorse categoryId:", categoryId);

    // âŒ Dorse iÃ§in Brand/Model/Variant OLUÅTURMA - Sadece dorseBrand string olarak kaydedilecek
    // Dorse markasÄ± customFields iÃ§inde string olarak saklanÄ±r
    const brandId = null;
    const modelId = null;
    const variantId = null;

    console.log(
      "ğŸ·ï¸ Dorse - Brand/Model/Variant NULL (dorseBrand customFields'ta):",
      {
        categoryId,
        dorseBrand,
      },
    );

    // Ensure categoryId is a valid number
    if (!categoryId || isNaN(parseInt(categoryId))) {
      console.error("âŒ Invalid categoryId:", categoryId);
      return res.status(400).json({
        error: "GeÃ§ersiz kategori ID'si",
        details: `categoryId: ${categoryId}`,
      });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: parseInt(categoryId),
        brandId,
        modelId,
        variantId,
        title,
        description,
        detailedInfo,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
        cityId: cityId ? parseInt(cityId) : null,
        districtId: districtId ? parseInt(districtId) : null,
        customFields: {
          dorseBrand: dorseBrand || null,
          genislik: genislik || null,
          uzunluk: uzunluk || null,
          lastikDurumu: lastikDurumu || null,
          devrilmeYonu: devrilmeYonu || null,
          catiPerdeSistemi: catiPerdeSistemi || null,
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
          // KuruyÃ¼k Ã¶zel alanlarÄ±
          kapakYuksekligi: kapakYuksekligi || null,
          yukseklik: yukseklik || null,
          krikoAyak: krikoAyak || null,
          takasli: takasli || null,
          kapakSistemi: kapakSistemi || null,
          // Lowbed Ã¶zel alanlarÄ±
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

    // Resim yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Dorse resimleri base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ğŸ“· Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(
          `ğŸ“· Dorse resim ${displayOrder} base64 formatÄ±nda kaydediliyor`,
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
          }),
        );
        displayOrder++;
      }

      // TÃ¼m resimleri paralel olarak kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(`âœ… ${imagePromises.length} resim baÅŸarÄ±yla kaydedildi`);
      }
    }

    // Video processing (Base64)
    const videoFiles = files
      ? files.filter((f: any) => f.fieldname.startsWith("video_"))
      : [];
    if (videoFiles.length > 0) {
      console.log(`ğŸ¥ Processing ${videoFiles.length} videos for Dorse ad`);

      const videoPromises = videoFiles.map((videoFile: any, index: number) => {
        const base64Video = `data:${videoFile.mimetype
          };base64,${videoFile.buffer.toString("base64")}`;

        console.log(`ğŸ¥ Saving Dorse video ${index + 1} as base64`);

        return prisma.adVideo.create({
          data: {
            adId: ad.id,
            videoUrl: base64Video,
            displayOrder: index,
          },
        });
      });

      await Promise.all(videoPromises);
      console.log(
        `âœ… ${videoFiles.length} videos saved successfully for Dorse ad`,
      );
    }

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(ad.id);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Dorse ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Dorse ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Dorse ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("Dorse ilanÄ± oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });

    // Enhanced error handling for Prisma errors
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Duplicate entry detected",
        details: error.message,
      });
    } else if (error.code === "P2003") {
      return res.status(400).json({
        error: "Foreign key constraint violation",
        details: error.message,
      });
    } else if (error.code === "P2025") {
      return res.status(404).json({
        error: "Record not found",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
    });
  }
};

// Ä°lan oluÅŸtur (Karoser Ãœst YapÄ±)
export const createKaroserAd = async (req: Request, res: Response) => {
  try {
    console.log("ğŸ—ï¸ Karoser Ãœst YapÄ± Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
    }

    const {
      title,
      description,
      year,
      productionYear, // Sabit Kabin formlarÄ±nda productionYear kullanÄ±lÄ±yor
      price,
      cityId,
      districtId,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      // Karoser Ã¶zel alanlarÄ± (Damperli)
      genislik,
      uzunluk,
      lastikDurumu,
      devrilmeYonu,
      tippingDirection, // AhÅŸap Kasa
      // Sabit Kabin Ã¶zel alanlarÄ±
      length, // AÃ§Ä±k Kasa, KapalÄ± Kasa
      width, // AÃ§Ä±k Kasa, KapalÄ± Kasa
      isExchangeable, // AÃ§Ä±k Kasa, KapalÄ± Kasa
      usageArea, // KapalÄ± Kasa
      bodyStructure, // KapalÄ± Kasa
      caseType, // Ã–zel Kasa
      warranty,
      negotiable,
      exchange,
      // Ä°letiÅŸim ve detay bilgileri
      sellerName,
      phone,
      email,
      detailedInfo,
      currency,
    } = req.body;

    // Karoser kategorisini bul (ID = 7)
    const karoserCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "karoser-ust-yapi" },
          { slug: "karoser" },
          { id: 7 }, // Karoser Ãœst YapÄ± ID = 7
        ],
      },
    });

    if (!karoserCategory) {
      return res.status(400).json({ error: "Karoser kategorisi bulunamadÄ±" });
    }

    // Form tipine gÃ¶re brand ve model belirle
    let brandName = "DiÄŸer Markalar";
    let modelName = "Standart";

    // Damperli formlarÄ± - geniÅŸlik/uzunluk/devrilme yÃ¶nÃ¼ varsa
    if (
      req.body.genislik ||
      req.body.uzunluk ||
      req.body.devrilmeYonu ||
      req.body.tippingDirection
    ) {
      brandName = "Damperli";

      if (req.body.tippingDirection) {
        modelName = "AhÅŸap Kasa";
      } else if (req.body.devrilmeYonu === "geri") {
        modelName = "Hafriyat Tipi";
      } else if (req.body.devrilmeYonu === "yan") {
        modelName = "Kaya Tipi";
      } else if (req.body.genislik && req.body.uzunluk) {
        modelName = "KapaklÄ± Tip";
      } else {
        modelName = "Havuz Hardox Tipi";
      }
    }
    // Sabit Kabin formlarÄ± - length/width kombinasyonu
    else if (req.body.length && req.body.width) {
      brandName = "Sabit Kabin";

      if (req.body.usageArea) {
        modelName = "KapalÄ± Kasa";
      } else if (req.body.isExchangeable !== undefined) {
        modelName = "AÃ§Ä±k Kasa";
      } else if (req.body.caseType) {
        modelName = "Ã–zel Kasa";
      } else {
        modelName = "Standart";
      }
    }

    // Brand/Model/Variant'larÄ± otomatik oluÅŸtur
    const result = await ensureBrandModelVariant(
      karoserCategory.id,
      undefined, // brandSlug
      brandName,
      undefined, // modelSlug
      modelName,
      undefined, // variantSlug
      "Standart", // variant her zaman Standart
      undefined, // brandId
      undefined, // modelId
      undefined, // variantId
    );

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: karoserCategory.id,
        brandId: result.brandId || null,
        modelId: result.modelId || null,
        variantId: result.variantId || null,
        title,
        description,
        year: year
          ? parseInt(year)
          : productionYear
            ? parseInt(productionYear)
            : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
        // Åehir ve ilÃ§e bilgilerini ana tablo alanlarÄ±na kaydet
        cityId: cityId ? parseInt(cityId) : null,
        districtId: districtId ? parseInt(districtId) : null,
        customFields: {
          // Damperli alanlarÄ±
          genislik: genislik || null,
          uzunluk: uzunluk || null,
          lastikDurumu: lastikDurumu || null,
          devrilmeYonu: devrilmeYonu || null,
          tippingDirection: tippingDirection || null,

          // Sabit Kabin alanlarÄ±
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

    // Resim yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Karoser ilanÄ± iÃ§in resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ğŸ“· Karoser vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle (photo_0, photo_1, photo_2, ...)
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );

      for (let index = 0; index < photoFiles.length; index++) {
        const file = photoFiles[index] as any;
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(
          `ğŸ“· Karoser resim ${index + 1} base64 formatÄ±nda kaydediliyor`,
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
          }),
        );
      }

      // TÃ¼m resimleri kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} adet karoser resmi baÅŸarÄ±yla kaydedildi`,
        );
      }
    } else {
      console.log("âš ï¸ Karoser ilanÄ± iÃ§in resim bulunamadÄ±");
    }

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(ad.id);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Karoser Ã¼st yapÄ± ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Karoser ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Karoser Ã¼st yapÄ± ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("Karoser ilanÄ± oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
    });
  }
};

// Benzer ilanlarÄ± getir
export const getSimilarAds = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adId = parseIntParam(id);

    // Ã–nce mevcut ilanÄ± bul
    const currentAd = await prisma.ad.findUnique({
      where: { id: adId },
      include: { category: true },
    });

    if (!currentAd) {
      return res.status(404).json({ error: "Ä°lan bulunamadÄ±" });
    }

    // Benzer ilanlarÄ± bul (aynÄ± kategori, farklÄ± ID)
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

// Ä°lan oluÅŸtur (Oto KurtarÄ±cÄ± - Tekli AraÃ§) - UNIQUE_MARKER_FOR_TEKLI
export const createOtoKurtariciTekliAd = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("ğŸš› Oto KurtarÄ±cÄ± Tekli Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
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
      vehicleBrandName, // KullanÄ±cÄ±nÄ±n seÃ§tiÄŸi araÃ§ markasÄ± (Ford, Mercedes-Benz vb.)
      currency,
    } = req.body;

    console.log("ğŸš— SeÃ§ilen araÃ§ markasÄ±:", vehicleBrandName);

    // Fuel type enum mapping
    const fuelTypeMap: Record<string, string> = {
      benzin: "GASOLINE",
      dizel: "DIESEL",
      elektrik: "ELECTRIC",
      hybrid: "HYBRID",
    };

    // Ã–zellikleri JSON olarak hazÄ±rla
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

    // Oto KurtarÄ±cÄ± kategorisini bul (ID = 9)
    const otoKurtariciCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "oto-kurtarici-tasiyici" },
          { slug: "oto-kurtarici" },
          { id: 9 }, // Oto KurtarÄ±cÄ± ve TaÅŸÄ±yÄ±cÄ± ID = 9
        ],
      },
    });

    if (!otoKurtariciCategory) {
      return res
        .status(400)
        .json({ error: "Oto KurtarÄ±cÄ± kategorisi bulunamadÄ±" });
    }

    // "Tekli AraÃ§" markasÄ±nÄ± bul veya oluÅŸtur
    let tekliAracBrand = await prisma.brand.findFirst({
      where: {
        name: "Tekli AraÃ§",
      },
    });

    if (!tekliAracBrand) {
      console.log("ğŸ·ï¸ 'Tekli AraÃ§' markasÄ± oluÅŸturuluyor...");
      tekliAracBrand = await prisma.brand.create({
        data: {
          name: "Tekli AraÃ§",
          slug: "tekli-arac",
          isActive: true,
        },
      });
      console.log(
        "âœ… 'Tekli AraÃ§' markasÄ± oluÅŸturuldu, ID:",
        tekliAracBrand.id,
      );
    }

    // "Tekli AraÃ§" modelini bul veya oluÅŸtur
    let tekliAracModel = await prisma.model.findFirst({
      where: {
        name: "Tekli AraÃ§",
        brandId: tekliAracBrand.id,
      },
    });

    if (!tekliAracModel) {
      console.log("ğŸ“¦ 'Tekli AraÃ§' modeli oluÅŸturuluyor...");
      tekliAracModel = await prisma.model.create({
        data: {
          name: "Tekli AraÃ§",
          slug: "tekli-arac",
          brandId: tekliAracBrand.id,
          categoryId: otoKurtariciCategory.id,
          isActive: true,
        },
      });
      console.log("âœ… 'Tekli AraÃ§' modeli oluÅŸturuldu, ID:", tekliAracModel.id);
    }

    // "Tekli AraÃ§" varyantÄ±nÄ± bul veya oluÅŸtur
    let tekliAracVariant = await prisma.variant.findFirst({
      where: {
        name: "Tekli AraÃ§",
        modelId: tekliAracModel.id,
      },
    });

    if (!tekliAracVariant) {
      console.log("ğŸ”§ 'Tekli AraÃ§' varyantÄ± oluÅŸturuluyor...");
      tekliAracVariant = await prisma.variant.create({
        data: {
          name: "Tekli AraÃ§",
          slug: "tekli-arac",
          modelId: tekliAracModel.id,
          isActive: true,
        },
      });
      console.log(
        "âœ… 'Tekli AraÃ§' varyantÄ± oluÅŸturuldu, ID:",
        tekliAracVariant.id,
      );
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: otoKurtariciCategory.id,
        brandId: tekliAracBrand.id,
        modelId: tekliAracModel.id,
        variantId: tekliAracVariant.id,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
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
          vehicleBrandName: vehicleBrandName || null, // KullanÄ±cÄ±nÄ±n seÃ§tiÄŸi araÃ§ markasÄ±
          engineVolume: req.body.engineVolume || null,
          maxPower: maxPower || null,
          maxTorque: maxTorque || null,
          fuelType: fuelType || null,
          platformLength: platformLength || null,
          platformWidth: platformWidth || null,
          loadCapacity: loadCapacity || null,
          plateNumber: plateNumber || null,
          exchange: exchange || null,
          address: address || null,
          detailedInfo: detailedInfo || null,
          features: featuresJson || null,
          cekiciEkipmani: cekiciEkipmani
            ? typeof cekiciEkipmani === "string"
              ? JSON.parse(cekiciEkipmani)
              : cekiciEkipmani
            : null,
          ekEkipmanlar: ekEkipmanlar
            ? typeof ekEkipmanlar === "string"
              ? JSON.parse(ekEkipmanlar)
              : ekEkipmanlar
            : null,
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

    console.log("âœ… Oto KurtarÄ±cÄ± Tekli ilanÄ± oluÅŸturuldu, ID:", ad.id);
    console.log(
      "ğŸš— SeÃ§ilen araÃ§ markasÄ± customFields'a kaydedildi:",
      vehicleBrandName,
    );

    // Resim yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Oto KurtarÄ±cÄ± Tekli - Resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ğŸ“· Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(`ğŸ“· Resim ${displayOrder} base64 formatÄ±nda kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          }),
        );
        displayOrder++;
      }

      // TÃ¼m resimleri veritabanÄ±na kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} resim baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
        );
      }
    }

    // OluÅŸturulan ilanÄ± resimlerle birlikte getir
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

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(createdAd?.id || 0);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Oto KurtarÄ±cÄ± Tekli ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Oto KurtarÄ±cÄ± Tekli ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Oto KurtarÄ±cÄ± Tekli ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad: createdAd,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("Oto KurtarÄ±cÄ± Tekli ilanÄ± oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
    });
  }
};

// Ä°lan oluÅŸtur (Oto KurtarÄ±cÄ± - Ã‡oklu AraÃ§)
export const createOtoKurtariciCokluAd = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("ğŸš› Oto KurtarÄ±cÄ± Ã‡oklu Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);
    console.log("ğŸ“¦ Content-Type:", req.headers["content-type"]);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
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
      vehicleBrandName,
      engineVolume,
      currency,
    } = req.body;

    // Fuel type enum mapping
    const fuelTypeMap: Record<string, string> = {
      benzin: "GASOLINE",
      dizel: "DIESEL",
      elektrik: "ELECTRIC",
      hybrid: "HYBRID",
    };

    // Ã–zellikleri JSON olarak hazÄ±rla
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

    // Oto KurtarÄ±cÄ± kategorisini bul (ID = 9)
    const otoKurtariciCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: "oto-kurtarici-tasiyici" },
          { slug: "oto-kurtarici" },
          { id: 9 }, // Oto KurtarÄ±cÄ± ve TaÅŸÄ±yÄ±cÄ± ID = 9
        ],
      },
    });

    if (!otoKurtariciCategory) {
      return res
        .status(400)
        .json({ error: "Oto KurtarÄ±cÄ± kategorisi bulunamadÄ±" });
    }

    // Brand/Model/Variant'larÄ± bul veya oluÅŸtur
    const result = await ensureBrandModelVariant(
      otoKurtariciCategory.id, // Oto KurtarÄ±cÄ± kategorisi
      req.body.brandSlug,
      req.body.brandName,
      req.body.modelSlug,
      req.body.modelName,
      req.body.variantSlug,
      req.body.variantName,
      undefined, // brandId
      undefined, // modelId
      undefined, // variantId
    );

    console.log("ï¿½ Ã‡oklu AraÃ§ - SeÃ§ilen araÃ§ markasÄ±:", vehicleBrandName);

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: otoKurtariciCategory.id,
        brandId: result.brandId || null,
        modelId: result.modelId || null,
        variantId: result.variantId || null,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
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
          vehicleBrandName: vehicleBrandName || null,
          engineVolume: engineVolume || null,
          maxPower: maxPower || null,
          maxTorque: maxTorque || null,
          fuelType: fuelType || null,
          platformLength: platformLength || null,
          platformWidth: platformWidth || null,
          maxVehicleCapacity: maxVehicleCapacity || null,
          loadCapacity: loadCapacity || null,
          plateNumber: plateNumber || null,
          exchange: exchange || null,
          address: address || null,
          detailedInfo: detailedInfo || null,
          features: featuresJson || null,
          detailFeatures: featuresJson || null,
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

    console.log("âœ… Oto KurtarÄ±cÄ± Ã‡oklu ilanÄ± oluÅŸturuldu, ID:", ad.id);
    console.log(
      "ğŸš— SeÃ§ilen araÃ§ markasÄ± customFields'a kaydedildi:",
      vehicleBrandName,
    );
    console.log("ğŸ“Š CustomFields iÃ§eriÄŸi:", ad.customFields);

    // Resim yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Oto KurtarÄ±cÄ± Ã‡oklu - Resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ğŸ“· Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        // Base64 formatÄ±na Ã§evir
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(`ğŸ“· Resim ${displayOrder} base64 formatÄ±nda kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          }),
        );
        displayOrder++;
      }

      // TÃ¼m resimleri veritabanÄ±na kaydet
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} resim baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
        );
      }
    }

    // OluÅŸturulan ilanÄ± resimlerle birlikte getir
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

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(createdAd?.id || 0);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Oto KurtarÄ±cÄ± Ã‡oklu ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Oto KurtarÄ±cÄ± Ã‡oklu ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Oto KurtarÄ±cÄ± Ã‡oklu ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad: createdAd,
      moderation: moderationResult,
    });
  } catch (error: any) {
    console.error("Oto KurtarÄ±cÄ± Ã‡oklu ilanÄ± oluÅŸturma hatasÄ± detayÄ±:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestBody: req.body,
    });
    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error.message,
    });
  }
};

// Admin: TÃ¼m ilanlarÄ± getir (filtreli)
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
    console.error("Admin tÃ¼m ilanlarÄ± getirme hatasÄ±:", error);
    res.status(500).json({ error: "Ä°lanlar alÄ±nÄ±rken hata oluÅŸtu" });
  }
};

// =============================================================
// OTOMATÄ°K MODERASYON - Admin Endpoints
// =============================================================

/**
 * Admin: Fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ± (otomatik reddedilen) ilanlarÄ± getir
 */
export const getPriceRejectedAds = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // PendingAd tablosunda "[OTOMATÄ°K RED]" notu olan ilanlarÄ± bul
    const pendingAds = await prisma.pendingAd.findMany({
      where: {
        adminNotes: {
          contains: "[OTOMATÄ°K RED]",
        },
      },
      include: {
        ad: {
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
            city: { select: { id: true, name: true } },
            district: { select: { id: true, name: true } },
            images: { orderBy: { displayOrder: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.pendingAd.count({
      where: {
        adminNotes: {
          contains: "[OTOMATÄ°K RED]",
        },
      },
    });

    const ads = pendingAds
      .filter((p) => p.ad) // Ad silinmemiÅŸ olanlarÄ± filtrele
      .map((p) => ({
        ...p.ad,
        moderationNote: p.adminNotes,
        pendingAdId: p.id,
      }));

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
    console.error("Fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ± ilanlarÄ± getirme hatasÄ±:", error);
    res
      .status(500)
      .json({ error: "Fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ± ilanlar alÄ±nÄ±rken hata oluÅŸtu" });
  }
};

/**
 * Admin: Otomatik reddedilen ilanÄ± manuel olarak onayla
 */
export const manualApproveRejectedAd = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;
    const adId = parseIntParam(id);

    // Ä°lanÄ±n var olup olmadÄ±ÄŸÄ±nÄ± kontrol et
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        category: true,
      },
    });

    if (!ad) {
      res.status(404).json({ error: "Ä°lan bulunamadÄ±" });
      return;
    }

    // Ä°lanÄ± onayla
    await prisma.ad.update({
      where: { id: adId },
      data: { status: "APPROVED" },
    });

    // PendingAd kaydÄ±nÄ± gÃ¼ncelle
    try {
      await prisma.pendingAd.update({
        where: { adId },
        data: {
          adminNotes: `[MANUEL ONAY] Admin tarafÄ±ndan onaylandÄ± (Ã¶nceki: otomatik red)`,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      });
    } catch {
      // PendingAd kaydÄ± yoksa sorun deÄŸil
    }

    // KullanÄ±cÄ±ya bildirim gÃ¶nder
    await prisma.notification.create({
      data: {
        userId: ad.userId,
        title: "Ä°lanÄ±nÄ±z OnaylandÄ±! ğŸ‰",
        message: `"${ad.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±z admin tarafÄ±ndan onaylandÄ± ve yayÄ±na alÄ±ndÄ±.`,
        type: "SUCCESS",
        relatedId: ad.id,
      },
    });

    // Socket.io bildirimi
    io.emit("adApproved", {
      adId: ad.id,
      title: ad.title,
      message: "Reddedilen ilan admin tarafÄ±ndan onaylandÄ±!",
    });

    io.to(`user_${ad.userId}`).emit("notification", {
      title: "Ä°lanÄ±nÄ±z OnaylandÄ±! ğŸ‰",
      message: `"${ad.title}" baÅŸlÄ±klÄ± ilanÄ±nÄ±z admin tarafÄ±ndan onaylandÄ±.`,
      type: "SUCCESS",
    });

    console.log(`âœ… Ä°lan #${adId} admin tarafÄ±ndan manuel onaylandÄ±`);

    res.json({
      message: "Ä°lan baÅŸarÄ±yla onaylandÄ±",
      ad: { id: adId, status: "APPROVED" },
    });
  } catch (error) {
    console.error("Manuel onay hatasÄ±:", error);
    res.status(500).json({ error: "Ä°lan onaylanÄ±rken hata oluÅŸtu" });
  }
};

/**
 * Admin: Moderasyon istatistiklerini getir
 */
export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const autoRejected = await prisma.pendingAd.count({
      where: {
        adminNotes: { contains: "[OTOMATÄ°K RED]" },
      },
    });

    const manuallyApproved = await prisma.pendingAd.count({
      where: {
        adminNotes: { contains: "[MANUEL ONAY]" },
      },
    });

    const pendingAds = await prisma.ad.count({ where: { status: "PENDING" } });
    const approvedAds = await prisma.ad.count({
      where: { status: "APPROVED" },
    });
    const rejectedAds = await prisma.ad.count({
      where: { status: "REJECTED" },
    });

    res.json({
      moderation: {
        autoRejected,
        manuallyApproved,
        pendingReview: pendingAds,
      },
      totals: {
        pending: pendingAds,
        approved: approvedAds,
        rejected: rejectedAds,
      },
    });
  } catch (error) {
    console.error("Moderasyon istatistikleri hatasÄ±:", error);
    res
      .status(500)
      .json({ error: "Moderasyon istatistikleri alÄ±nÄ±rken hata oluÅŸtu" });
  }
};

// Admin: İlan için gelişmiş moderasyon bilgisi (piyasa verisi + trust score)
export const getAdModerationInsights = async (req: Request, res: Response) => {
  try {
    const adId = parseIntParam(req.params.id);
    if (!adId) {
      res.status(400).json({ error: "Geçersiz ilan ID" });
      return;
    }

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        model: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!ad) {
      res.status(404).json({ error: "İlan bulunamadı" });
      return;
    }

    // Piyasa verisi (hata olursa null)
    let marketData = null;
    try {
      marketData = await getMarketStats({
        category: ad.category?.slug || ad.category?.name || null,
        brand: ad.brand?.slug || null,
        model: ad.model?.slug || null,
        year: ad.year || null,
      });
    } catch { /* sessizce geç */ }

    // Model bazlı fiyat verisi (hata olursa null)
    let modelPrice = null;
    try {
      if (ad.category?.id) {
        modelPrice = await getModelMarketPrice({
          categoryId: ad.category.id,
          brandId: ad.brand?.id || null,
          modelId: ad.model?.id || null,
          year: ad.year || null,
        });
      }
    } catch { /* sessizce geç */ }

    // Trust score (hata olursa null)
    let trustData = null;
    try {
      trustData = await getUserTrustScore(ad.userId);
    } catch { /* sessizce geç */ }

    // Sapma hesapla
    const price = ad.price ? Number(ad.price) : null;
    let deviation = null;
    if (price && marketData && marketData.median > 0) {
      deviation = (price - marketData.median) / marketData.median;
    }

    // PriceAnalytics log'unu da çek (varsa)
    let analytics = null;
    try {
      analytics = await prisma.priceAnalytics.findFirst({
        where: { adId },
        orderBy: { createdAt: "desc" },
      });
    } catch { /* tablo yoksa geç */ }

    res.json({
      adId,
      price,
      marketData,
      modelPrice,
      trustData,
      deviation,
      analytics,
    });
  } catch (error) {
    console.error("Moderasyon insight hatası:", error);
    res.status(500).json({ error: "Moderasyon bilgisi alınırken hata oluştu" });
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

    // KullanÄ±cÄ± istatistikleri
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Bu ay ve bu hafta kayÄ±tlarÄ±
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay()),
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

    // BugÃ¼n kayÄ±t olanlar
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

    // Toplam mesaj sayÄ±sÄ±
    const totalMessages = await prisma.message.count();

    // Kategori bazlÄ± ilan daÄŸÄ±lÄ±mÄ±
    const adsByCategory = await prisma.ad.groupBy({
      by: ["categoryId"],
      _count: true,
    });

    // Kategori isimlerini ayrÄ± olarak Ã§ek
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Kategori adlarÄ±nÄ± ekle
    const adsByCategoryWithNames = adsByCategory.map((item: any) => {
      const category = categories.find(
        (cat: any) => cat.id === item.categoryId,
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
    console.error("Admin istatistikleri hatasÄ±:", error);
    res.status(500).json({ error: "Ä°statistikler alÄ±nÄ±rken hata oluÅŸtu" });
  }
};

// Admin: Ä°lanÄ± zorla sil
export const forceDeleteAd = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;
    const adminEmail = (req as any).user.email;

    // Ä°lanÄ± bul
    const ad = await prisma.ad.findUnique({
      where: { id: parseIntParam(id) },
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
      res.status(404).json({ error: "Ä°lan bulunamadÄ±" });
      return;
    }

    // Ä°lanÄ± sil
    await prisma.ad.delete({
      where: { id: parseIntParam(id) },
    });

    // Admin aktivitesini logla
    console.log(
      `Admin ${adminEmail} (ID: ${adminId}) deleted ad "${ad.title}" (ID: ${id}) by user ${ad.user.email}`,
    );

    res.json({
      message: "Ä°lan baÅŸarÄ±yla silindi",
      deletedAd: {
        id: ad.id,
        title: ad.title,
        userEmail: ad.user.email,
      },
    });
  } catch (error) {
    console.error("Admin ilan silme hatasÄ±:", error);
    res.status(500).json({ error: "Ä°lan silinirken hata oluÅŸtu" });
  }
};

// Uzayabilir Åasi ilan oluÅŸturma
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
      currency,
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

    // FotoÄŸraf ayrÄ±ÅŸtÄ±rma
    let showcaseImageUrl = "";
    const galleryImages: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === "showcasePhoto") {
          // Vitrin fotoÄŸrafÄ± iÃ§in base64 encode
          showcaseImageUrl = await toBase64WithWatermark(file.buffer, file.mimetype);
        } else if (file.fieldname === "photos") {
          // Galeri fotoÄŸraflarÄ± iÃ§in base64 encode
          galleryImages.push(
            await toBase64WithWatermark(file.buffer, file.mimetype),
          );
        }
      }
    }

    // Konum bilgisini oluÅŸtur
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) },
    });

    const district = await prisma.district.findUnique({
      where: { id: parseInt(districtId) },
    });

    if (!city || !district) {
      return res.status(400).json({
        error: "GeÃ§ersiz ÅŸehir veya ilÃ§e seÃ§imi",
      });
    }

    const location = `${district.name}, ${city.name}`;

    // Konteyner/TaÅŸÄ±yÄ±cÄ± Åasi kategorisini bul (ID: 10)
    let category = await prisma.category.findFirst({
      where: {
        name: { contains: "Konteyner", mode: "insensitive" },
      },
    });

    // EÄŸer kategori bulunamazsa ID 10'u kullan
    if (!category) {
      category = await prisma.category.findUnique({
        where: { id: 10 },
      });
    }

    if (!category) {
      return res.status(400).json({
        error: "Konteyner kategorisi bulunamadÄ±",
      });
    }

    // Brand, model ve variant'Ä± otomatik oluÅŸtur
    const result = await ensureBrandModelVariant(
      category.id,
      "uzayabilir",
      "Uzayabilir",
      "sasi",
      "Åasi",
      "standart",
      "Standart",
    );

    // Ä°lanÄ± oluÅŸtur
    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        currency: currency || "TRY",
        year: parseInt(productionYear),
        location,
        cityId: parseInt(cityId),
        districtId: parseInt(districtId),
        categoryId: category.id,
        brandId: result.brandId,
        modelId: result.modelId,
        variantId: result.variantId,
        userId,
        status: "PENDING",

        // Uzayabilir ÅŸasi Ã¶zel alanlarÄ±
        loadCapacity: loadCapacity || null,
        isExchangeable: isExchangeable === "Evet",

        // Ã–zel alanlar JSON olarak
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

    // FotoÄŸraflarÄ± kaydet
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

    // Galeri fotoÄŸraflarÄ±nÄ± kaydet
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

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(ad.id);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Uzayabilir ÅŸasi ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Uzayabilir ÅŸasi ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Uzayabilir ÅŸasi ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad,
      moderation: moderationResult,
    });
  } catch (error) {
    console.error("Uzayabilir ÅŸasi ilan oluÅŸturma hatasÄ±:", error);
    return res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
      details: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
};

// Kamyon RÃ¶mork ilan oluÅŸturma
export const createKamyonRomorkAd = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      title,
      description,
      price,
      productionYear,
      romorkMarkasi, // Yeni alan
      volume,
      length,
      width,
      hasTent,
      hasDamper,
      isExchangeable, // Modern form alanÄ±
      exchangeable = isExchangeable, // Backward compatibility
      cityId,
      districtId,
      sellerName, // Modern form alanÄ±
      contactName = sellerName, // Backward compatibility
      sellerPhone, // Modern form alanÄ±
      phone = sellerPhone, // Backward compatibility
      sellerEmail, // Modern form alanÄ±
      email = sellerEmail, // Backward compatibility
      currency,
      detailedInfo,
      categorySlug,
      brandSlug,
      modelSlug,
      variantSlug,
      // Modern form ID tabanlÄ± alanlar
      brandId: formBrandId,
      modelId: formModelId,
      variantId: formVariantId,
      brandName,
      modelName,
      variantName,
      category,
      subType,
    } = req.body;

    console.log("ğŸš— Kamyon RÃ¶mork - RÃ¶mork MarkasÄ±:", romorkMarkasi);

    // Slug'lardan ID'leri bul
    let categoryId = null;
    let brandId = formBrandId ? parseInt(formBrandId) : null;
    let modelId = formModelId ? parseInt(formModelId) : null;
    let variantId = formVariantId ? parseInt(formVariantId) : null;
    if (categorySlug) {
      console.log("ğŸ” Gelen categorySlug:", categorySlug);
      const category = await prisma.category.findFirst({
        where: { slug: categorySlug },
      });
      console.log("ğŸ“ Bulunan kategori:", category);
      categoryId = category?.id || null;
    }

    // Brand/Model/Variant'larÄ± bul veya oluÅŸtur
    const result = await ensureBrandModelVariant(
      categoryId || 8, // RÃ¶mork kategorisi
      brandSlug,
      brandName,
      modelSlug,
      modelName,
      variantSlug,
      variantName,
      brandId || undefined,
      modelId || undefined,
      variantId || undefined,
    );

    brandId = result.brandId || null;
    modelId = result.modelId || null;
    variantId = result.variantId || null;

    // Åehir ve ilÃ§e bilgilerini al
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

    // RÃ¶mork Ã¶zel alanlarÄ± - modern form uyumlu
    const customFields = {
      romorkMarkasi: romorkMarkasi || "", // RÃ¶mork markasÄ±
      volume: volume || "",
      length: length || "",
      width: width || "",
      hasTent: hasTent === "true" || hasTent === true,
      hasDamper: hasDamper === "true" || hasDamper === true,
      isExchangeable: isExchangeable || exchangeable || "",
      sellerName: sellerName || contactName || "",
      sellerPhone: sellerPhone || phone || "",
      sellerEmail: sellerEmail || email || "",
      currency: currency || "TRY",
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

    // Ä°lanÄ± oluÅŸtur
    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: categoryId || 8, // RÃ¶mork kategorisi
        brandId: brandId || undefined,
        modelId: modelId || undefined,
        variantId: variantId || undefined,
        title,
        description,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
        year: productionYear ? parseInt(productionYear) : null,
        location: locationString,
        customFields: JSON.stringify(customFields),
        status: "PENDING", // Admin onayÄ± gerekli
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

    // FotoÄŸraf yÃ¼kleme (varsa)
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const imagePromises = files.map(async (file, index) => {
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        return prisma.adImage.create({
          data: {
            adId: ad.id,
            imageUrl: base64Image,
            displayOrder: index,
            isPrimary: index === 0, // Ä°lk fotoÄŸraf vitrin fotoÄŸrafÄ±
            altText: `${title} - FotoÄŸraf ${index + 1}`,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    console.log(`âœ… Kamyon RÃ¶mork ilanÄ± oluÅŸturuldu: ${ad.id}`);

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(ad.id);

    res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Kamyon RÃ¶mork ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Kamyon RÃ¶mork ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Kamyon RÃ¶mork ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad,
      moderation: moderationResult,
    });
  } catch (error) {
    console.error("Kamyon RÃ¶mork ilanÄ± oluÅŸturulurken hata:", error);
    res.status(500).json({
      error: "Ä°lan oluÅŸturulurken hata oluÅŸtu",
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
      return res.status(400).json({ error: "Video dosyasÄ± gerekli" });
    }

    // Ä°lan sahibi kontrolÃ¼
    const ad = await prisma.ad.findUnique({
      where: { id: parseIntParam(id) },
      select: { userId: true },
    });

    if (!ad || ad.userId !== userId) {
      return res.status(403).json({ error: "Bu ilana video ekleyemezsiniz" });
    }

    // Video dosyasÄ±nÄ± kaydet (ÅŸimdilik base64 olarak, ileride file upload service kullanÄ±labilir)
    const videoBase64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64",
    )}`;

    const video = await prisma.adVideo.create({
      data: {
        adId: parseIntParam(id),
        videoUrl: videoBase64,
        mimeType: file.mimetype,
        fileSize: file.size,
        displayOrder: 1,
      },
    });

    return res.json({
      success: true,
      message: "Video baÅŸarÄ±yla yÃ¼klendi",
      video,
    });
  } catch (error) {
    console.error("Video yÃ¼klenirken hata:", error);
    return res.status(500).json({
      error: "Video yÃ¼klenirken hata oluÅŸtu",
      details: error instanceof Error ? error.message : "Bilinmeyen hata",
    });
  }
};

// Delete video
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id, videoId } = req.params;
    const userId = (req as any).user?.id;

    // Ä°lan sahibi kontrolÃ¼
    const ad = await prisma.ad.findUnique({
      where: { id: parseIntParam(id) },
      select: { userId: true },
    });

    if (!ad || ad.userId !== userId) {
      return res.status(403).json({ error: "Bu videoyu silemezsiniz" });
    }

    await prisma.adVideo.delete({
      where: {
        id: parseIntParam(videoId),
        adId: parseIntParam(id),
      },
    });

    return res.json({
      success: true,
      message: "Video baÅŸarÄ±yla silindi",
    });
  } catch (error) {
    console.error("Video silinirken hata:", error);
    return res.status(500).json({
      error: "Video silinirken hata oluÅŸtu",
    });
  }
};

// Ä°lan oluÅŸtur (Minivan & Panelvan)
export const createMinivanPanelvanAd = async (req: Request, res: Response) => {
  try {
    console.log("ğŸš Minivan & Panelvan Ä°lanÄ± API'ye istek geldi");
    console.log("ğŸ“¦ Request body:", req.body);

    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "KullanÄ±cÄ± giriÅŸi gerekli" });
    }

    const {
      title,
      description,
      year,
      price,
      mileage,
      condition,
      fuelType,
      transmission,
      bodyType,
      chassis,
      motorPower,
      engineVolume,
      drivetrain,
      seatCount,
      color,
      licenseType,
      hasAccidentRecord,
      plateNumber,
      exchange,
      plateType,
      cityId,
      districtId,
      categoryId,
      brandId,
      modelId,
      variantId,
      features,
      hasExpertiseInfo,
      expertiseInfo,
      currency,
    } = req.body;

    console.log("âœ… Form Data (Minivan & Panelvan):");
    console.log("  - Title:", title);
    console.log("  - Body Type:", bodyType);
    console.log("  - Motor Power:", motorPower);
    console.log("  - Engine Volume:", engineVolume);

    // Detay Ã¶zelliklerini JSON olarak hazÄ±rla
    let detailFeaturesJson = null;
    if (features) {
      try {
        detailFeaturesJson =
          typeof features === "string" ? JSON.parse(features) : features;
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        detailFeaturesJson = features;
      }
    }

    // Ekspertiz bilgilerini JSON olarak hazÄ±rla
    let expertiseInfoJson = null;
    if (expertiseInfo) {
      try {
        expertiseInfoJson =
          typeof expertiseInfo === "string"
            ? JSON.parse(expertiseInfo)
            : expertiseInfo;
      } catch (parseError) {
        console.error("Expertise info parse error:", parseError);
        expertiseInfoJson = expertiseInfo;
      }
    }

    // Minivan & Panelvan kategorisini bul
    const minivanCategory = await prisma.category.findFirst({
      where: {
        OR: [{ slug: "minivan-panelvan" }, { name: { contains: "Minivan" } }],
      },
    });

    if (!minivanCategory) {
      return res
        .status(400)
        .json({ error: "Minivan & Panelvan kategorisi bulunamadÄ±" });
    }

    const ad = await prisma.ad.create({
      data: {
        userId,
        categoryId: categoryId ? parseInt(categoryId) : minivanCategory.id,
        brandId: brandId ? parseInt(brandId) : null,
        modelId: modelId ? parseInt(modelId) : null,
        variantId: variantId ? parseInt(variantId) : null,
        title,
        description,
        year: year ? parseInt(year) : null,
        price: price ? parseFloat(price) : null,
        currency: currency || "TRY",
        mileage: mileage ? parseInt(mileage) : null,
        cityId: cityId && cityId !== "" ? parseInt(cityId) : null,
        districtId:
          districtId && districtId !== "" ? parseInt(districtId) : null,
        customFields: {
          condition: condition || null,
          fuelType: fuelType || null,
          transmission: transmission || null,
          bodyType: bodyType || null,
          chassis: chassis || null,
          motorPower: motorPower || null,
          engineVolume: engineVolume || null,
          drivetrain: drivetrain || null,
          seatCount: seatCount || null,
          color: color || null,
          licenseType: licenseType || null,
          hasAccidentRecord: hasAccidentRecord || null,
          plateNumber: plateNumber || null,
          exchange: exchange || null,
          plateType: plateType || null,
          mileage: mileage || null,
          detailFeatures: detailFeaturesJson || null,
          hasExpertiseInfo:
            hasExpertiseInfo === "true" || hasExpertiseInfo === true,
          expertiseInfo: expertiseInfoJson || null,
          categoryId: categoryId ? parseInt(categoryId) : null,
          brandId: brandId ? parseInt(brandId) : null,
          modelId: modelId ? parseInt(modelId) : null,
          variantId: variantId ? parseInt(variantId) : null,
          cityId: cityId ? parseInt(cityId) : null,
          districtId: districtId ? parseInt(districtId) : null,
        },
        status: "PENDING",
      },
    });

    // Resim yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
    const files = req.files as any;
    if (files && files.length > 0) {
      console.log(
        "ğŸ“· Resimler base64 formatÄ±nda kaydediliyor:",
        files.map((f: any) => f.fieldname),
      );

      const imagePromises = [];
      let displayOrder = 0;

      // Vitrin resmini bul ve iÅŸle
      const showcaseFile = files.find(
        (f: any) => f.fieldname === "showcasePhoto",
      );
      if (showcaseFile) {
        const base64Image = await toBase64WithWatermark(showcaseFile.buffer, showcaseFile.mimetype);

        console.log("ğŸ“· Vitrin resmi base64 formatÄ±nda kaydediliyor");

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: true,
              displayOrder: 0,
              altText: `${title} - Vitrin Resmi`,
            },
          }),
        );
        displayOrder = 1;
      }

      // DiÄŸer resimleri iÅŸle
      const photoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("photo_"),
      );
      for (const file of photoFiles) {
        const base64Image = await toBase64WithWatermark(file.buffer, file.mimetype);

        console.log(`ğŸ“· Resim ${displayOrder} base64 formatÄ±nda kaydediliyor`);

        imagePromises.push(
          prisma.adImage.create({
            data: {
              adId: ad.id,
              imageUrl: base64Image,
              isPrimary: false,
              displayOrder,
              altText: `${title} - Resim ${displayOrder}`,
            },
          }),
        );
        displayOrder++;
      }

      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
        console.log(
          `âœ… ${imagePromises.length} resim baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
        );
      }

      // Video yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
      const videoFiles = files.filter((f: any) =>
        f.fieldname.startsWith("video_"),
      );
      if (videoFiles.length > 0) {
        console.log(
          "ğŸ¬ Videolar base64 formatÄ±nda kaydediliyor:",
          videoFiles.map((f: any) => f.fieldname),
        );

        const videoPromises = [];
        let videoDisplayOrder = 1;

        for (const file of videoFiles) {
          // Base64 formatÄ±na Ã§evir
          const base64Video = `data:${file.mimetype
            };base64,${file.buffer.toString("base64")}`;

          console.log(
            `ğŸ¬ Video ${videoDisplayOrder} base64 formatÄ±nda kaydediliyor`,
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
            }),
          );
          videoDisplayOrder++;
        }

        // TÃ¼m videolarÄ± veritabanÄ±na kaydet
        if (videoPromises.length > 0) {
          await Promise.all(videoPromises);
          console.log(
            `âœ… ${videoPromises.length} video baÅŸarÄ±yla base64 formatÄ±nda kaydedildi`,
          );
        }
      }

      // Ekspertiz raporu yÃ¼kleme iÅŸlemi (Base64 formatÄ±nda)
      const expertiseReportFile = files.find(
        (f: any) => f.fieldname === "expertiseReport",
      );
      if (expertiseReportFile) {
        console.log("ğŸ“„ Ekspertiz raporu base64 formatÄ±nda kaydediliyor");

        // Base64 formatÄ±na Ã§evir
        const base64Report = `data:${expertiseReportFile.mimetype
          };base64,${expertiseReportFile.buffer.toString("base64")}`;

        // Ekspertiz raporunu customFields iÃ§ine kaydet
        const currentCustomFields =
          typeof ad.customFields === "string"
            ? JSON.parse(ad.customFields)
            : ad.customFields || {};

        await prisma.ad.update({
          where: { id: ad.id },
          data: {
            customFields: JSON.stringify({
              ...currentCustomFields,
              expertiseReportFile: {
                url: base64Report,
                mimeType: expertiseReportFile.mimetype,
                fileSize: expertiseReportFile.size,
                uploadedAt: new Date().toISOString(),
              },
            }),
          },
        });

        console.log("âœ… Ekspertiz raporu baÅŸarÄ±yla kaydedildi");
      }
    }

    // OluÅŸturulan ilanÄ± resimler ve videolarla birlikte getir
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

    // ğŸ” Otomatik fiyat moderasyonu
    const moderationResult = await applyAdvancedPriceModeration(createdAd?.id || 0);

    return res.status(201).json({
      message:
        moderationResult.decision === "APPROVED"
          ? "Minivan & Panelvan ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve otomatik onaylandÄ±"
          : moderationResult.decision === "REJECTED"
            ? "Minivan & Panelvan ilanÄ± oluÅŸturuldu ancak fiyat aralÄ±ÄŸÄ± dÄ±ÅŸÄ±nda olduÄŸu iÃ§in reddedildi"
            : "Minivan & Panelvan ilanÄ± baÅŸarÄ±yla oluÅŸturuldu ve onay bekliyor",
      ad: createdAd,
      id: createdAd?.id,
      moderation: moderationResult,
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

// Public: Model bazlı fiyat ipucu (ilan oluşturma sırasında kullanıcıya gösterilir)
export const getModelPriceHint = async (req: Request, res: Response) => {
  try {
    const categoryId = parseIntParam(req.query.categoryId as string);
    const brandId = parseIntParam(req.query.brandId as string) || null;
    const modelId = parseIntParam(req.query.modelId as string) || null;
    const year = parseIntParam(req.query.year as string) || null;

    if (!categoryId) {
      res.status(400).json({ error: "categoryId gereklidir" });
      return;
    }

    const result = await getModelMarketPrice({
      categoryId,
      brandId,
      modelId,
      year,
    });

    if (!result) {
      res.json({ available: false });
      return;
    }

    if (result.source === "database") {
      res.json({
        available: true,
        source: "database",
        avgPrice: result.avg,
        minPrice: result.min,
        maxPrice: result.max,
        median: result.median,
        sampleSize: result.sampleSize,
      });
    } else {
      res.json({
        available: true,
        source: "seed",
        avgPrice: result.avgPrice,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
      });
    }
  } catch (error) {
    console.error("Fiyat ipucu hatası:", error);
    res.status(500).json({ error: "Fiyat bilgisi alınırken hata oluştu" });
  }
};
