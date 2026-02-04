import { Request, Response } from "express";
import { prisma } from "../config/database";

// Helper function to safely parse query/params that can be string or string[]
const parseStringParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
};

const parseIntParam = (param: string | string[] | undefined): number => {
  const str = parseStringParam(param);
  return parseInt(str) || 0;
};

// Get all cities - OPTIMIZED
export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        plateCode: true,
      },
    });

    // ❗ CRITICAL: Cache headers - 30 dakika cache (cities çok değişmez)
    res.set({
      "Cache-Control": "public, max-age=1800, stale-while-revalidate=300",
      ETag: `cities-${cities.length}`,
    });

    res.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get districts by city
export const getDistrictsByCity = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params;

    const districts = await prisma.district.findMany({
      where: {
        cityId: parseInt(cityId),
        isActive: true,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        cityId: true,
      },
    });

    res.json(districts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ error: "Server error" });
  }
};
