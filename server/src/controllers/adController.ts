import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
      status = 'APPROVED',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {
      status: status as string
    };

    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (brandId) where.brandId = parseInt(brandId as string);
    if (modelId) where.modelId = parseInt(modelId as string);
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    
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
            phone: true
          }
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.ad.count({ where });

    res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Server error' });
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
            email: true
          }
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Increment view count
    await prisma.ad.update({
      where: { id: parseInt(id) },
      data: { viewCount: { increment: 1 } }
    });

    return res.json(ad);
  } catch (error) {
    console.error('Error fetching ad:', error);
    return res.status(500).json({ error: 'Server error' });
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
      customFields
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
        status: 'PENDING' // All ads require approval
      },
      include: {
        category: true,
        brand: true,
        model: true,
        variant: true
      }
    });

    res.status(201).json(ad);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update ad
export const updateAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const existingAd = await prisma.ad.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAd) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Check ownership or admin rights
    if (existingAd.userId !== userId && !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
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
      status
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (year !== undefined) updateData.year = year ? parseInt(year) : null;
    if (mileage !== undefined) updateData.mileage = mileage ? parseInt(mileage) : null;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (customFields !== undefined) updateData.customFields = customFields;
    
    // Only admins/moderators can change status
    if (status !== undefined && ['ADMIN', 'MODERATOR'].includes(userRole)) {
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
        images: true
      }
    });

    return res.json(ad);
  } catch (error) {
    console.error('Error updating ad:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete ad
export const deleteAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const existingAd = await prisma.ad.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAd) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Check ownership or admin rights
    if (existingAd.userId !== userId && !['ADMIN', 'MODERATOR'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.ad.delete({
      where: { id: parseInt(id) }
    });

    return res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return res.status(500).json({ error: 'Server error' });
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
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.ad.count({ where });

    res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching user ads:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: Get pending ads for approval
export const getPendingAds = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const ads = await prisma.ad.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true
          }
        },
        category: true,
        brand: true,
        model: true,
        variant: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.ad.count({ where: { status: 'PENDING' } });

    res.json({
      ads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching pending ads:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: Approve/Reject ad
export const moderateAd = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = (req as any).user.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ad = await prisma.ad.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // Create pending ad record for tracking
    await prisma.pendingAd.create({
      data: {
        adId: parseInt(id),
        reviewedBy: adminId,
        adminNotes: reason || null,
        reviewedAt: new Date()
      }
    });

    return res.json({ message: `Ad ${status.toLowerCase()} successfully`, ad });
  } catch (error) {
    console.error('Error moderating ad:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
