import { Response } from "express";
import { prisma } from "../config/database";
import type { AuthenticatedRequest } from "../middleware/auth";

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

// GET /api/store/:slug — Public store page
export async function getStoreBySlug(req: AuthenticatedRequest, res: Response) {
    try {
        const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

        const store = await prisma.store.findUnique({
            where: { slug },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        profileImageUrl: true,
                        createdAt: true,
                        role: true,
                        _count: { select: { ads: true } },
                    },
                },
            },
        });

        if (!store || !store.isActive) {
            res.status(404).json({ error: "Mağaza bulunamadı" });
            return;
        }

        res.json(store);
    } catch (error) {
        console.error("getStoreBySlug error:", error);
        res.status(500).json({ error: "Sunucu hatası" });
    }
}

// GET /api/store/user/:userId — Public store by user ID
export async function getStoreByUserId(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        const userIdParam = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) {
            res.status(400).json({ error: "Geçersiz kullanıcı ID" });
            return;
        }

        const store = await prisma.store.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        profileImageUrl: true,
                        createdAt: true,
                        role: true,
                        _count: { select: { ads: true } },
                    },
                },
            },
        });

        if (!store || !store.isActive) {
            res.status(404).json({ error: "Mağaza bulunamadı" });
            return;
        }

        res.json(store);
    } catch (error) {
        console.error("getStoreByUserId error:", error);
        res.status(500).json({ error: "Sunucu hatası" });
    }
}

// GET /api/store/:slug/ads — Store ads with pagination & filters
export async function getStoreAds(req: AuthenticatedRequest, res: Response) {
    try {
        const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
        const sort = (req.query.sort as string) || "newest";
        const brandId = req.query.brandId
            ? parseInt(req.query.brandId as string)
            : undefined;
        const categoryId = req.query.categoryId
            ? parseInt(req.query.categoryId as string)
            : undefined;
        const minPrice = req.query.minPrice
            ? parseFloat(req.query.minPrice as string)
            : undefined;
        const maxPrice = req.query.maxPrice
            ? parseFloat(req.query.maxPrice as string)
            : undefined;

        const store = await prisma.store.findUnique({
            where: { slug },
            select: { userId: true, isActive: true },
        });

        if (!store || !store.isActive) {
            res.status(404).json({ error: "Mağaza bulunamadı" });
            return;
        }

        const where: Record<string, unknown> = {
            userId: store.userId,
            status: "APPROVED",
        };

        if (brandId) where.brandId = brandId;
        if (categoryId) where.categoryId = categoryId;
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            };
        }

        const orderBy =
            sort === "price_asc"
                ? { price: "asc" as const }
                : sort === "price_desc"
                    ? { price: "desc" as const }
                    : { createdAt: "desc" as const };

        const [ads, total] = await Promise.all([
            prisma.ad.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    images: { take: 1, orderBy: { displayOrder: "asc" } },
                    category: { select: { id: true, name: true, slug: true } },
                    brand: { select: { id: true, name: true, slug: true } },
                    model: { select: { id: true, name: true, slug: true } },
                    city: { select: { id: true, name: true } },
                },
            }),
            prisma.ad.count({ where }),
        ]);

        res.json({
            ads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("getStoreAds error:", error);
        res.status(500).json({ error: "Sunucu hatası" });
    }
}

// GET /api/store/my — Get current user's store (protected)
export async function getMyStore(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user!.id;

        const store = await prisma.store.findUnique({
            where: { userId },
        });

        if (!store) {
            res.status(404).json({ error: "Mağaza bulunamadı" });
            return;
        }

        res.json(store);
    } catch (error) {
        console.error("getMyStore error:", error);
        res.status(500).json({ error: "Sunucu hatası" });
    }
}

// POST /api/store — Create or update store (protected, CORPORATE only)
export async function upsertStore(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user!.id;
        const {
            name,
            description,
            phone,
            whatsapp,
            email,
            website,
            address,
            city,
            district,
            latitude,
            longitude,
            workingHours,
        } = req.body;

        if (!name || name.trim().length < 2) {
            res
                .status(400)
                .json({ error: "Mağaza adı en az 2 karakter olmalıdır" });
            return;
        }

        // Handle logo and banner from files (base64)
        let logoUrl: string | undefined;
        let bannerUrl: string | undefined;

        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
                if (file.fieldname === "logo") logoUrl = base64;
                if (file.fieldname === "banner") bannerUrl = base64;
            }
        }

        // Generate unique slug
        let baseSlug = slugify(name);
        if (!baseSlug) baseSlug = `store-${userId}`;
        let finalSlug = baseSlug;

        const existing = await prisma.store.findUnique({ where: { userId } });

        if (!existing) {
            // Check slug uniqueness for new stores
            const slugExists = await prisma.store.findUnique({
                where: { slug: finalSlug },
            });
            if (slugExists) {
                finalSlug = `${baseSlug}-${userId}`;
            }
        }

        const data: Record<string, unknown> = {
            name: name.trim(),
            description: description || null,
            phone: phone || null,
            whatsapp: whatsapp || null,
            email: email || null,
            website: website || null,
            address: address || null,
            city: city || null,
            district: district || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            workingHours: workingHours ? JSON.parse(workingHours) : undefined,
        };

        if (logoUrl) data.logoUrl = logoUrl;
        if (bannerUrl) data.bannerUrl = bannerUrl;

        let store;

        if (existing) {
            // Update — keep existing slug unless name changed
            if (name.trim() !== existing.name) {
                data.slug = finalSlug;
            }
            store = await prisma.store.update({
                where: { userId },
                data,
            });
        } else {
            // Create
            store = await prisma.store.create({
                data: {
                    ...data,
                    slug: finalSlug,
                    userId,
                } as any,
            });
        }

        res.json(store);
    } catch (error) {
        console.error("upsertStore error:", error);
        res.status(500).json({ error: "Sunucu hatası" });
    }
}
