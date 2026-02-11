import { Router, Request, Response } from "express";
import { prisma } from "../config/database";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { AuthenticatedRequest } from "../types/auth";

const router = Router();

// Default settings - Prisma modeli ile senkron
const DEFAULT_SETTINGS = {
  id: 1,
  sloganLeft: "Alın Satın",
  sloganRight: "ile Mutlu Kalın",
  logoUrl: null,
  showcaseTitle: "Vitrin",
  searchPlaceholder: "Araç, marka, model, konum, ilan no ara...",
  showExampleBadge: true,
  exampleBadgeText: "ÖRNEKTİR",
  exampleBadgeColor: "#ff5722",
  cardPriceColor: "#dc3545",
  adsPerPage: 1000,
  primaryColor: "#D34237",
  headerBgColor: "#D7D7D5",
  footerBgColor: "#E8E8E8",
  contactEmail: "info@trucksbus.com.tr",
  contactPhone: null,
  contactAddress: "İçerenköy Mahallesi, Ataşehir, İstanbul",
  footerText: "Tüm hakları saklıdır.",
  facebookUrl: null,
  twitterUrl: null,
  instagramUrl: null,
  linkedinUrl: null,
  siteTitle: "TrucksBus - Ağır Ticari Araç Alım Satım",
  siteDescription:
    "Kamyon, çekici, otobüs, minibüs, dorse alım satım platformu",
  maintenanceMode: false,
  maintenanceMsg: "Site bakım modundadır. Lütfen daha sonra tekrar deneyiniz.",
  announcementText: null,
  announcementColor: "#1976d2",
  showAnnouncement: false,
};

// GET /api/settings — Herkes erişebilir (public)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      // İlk seferde default ayarları oluştur
      settings = await (prisma as any).siteSettings.create({
        data: { id: 1 },
      });
    }

    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("❌ Settings fetch error:", error.message);
    // Tablo henüz yoksa default döndür
    res.json({ success: true, data: DEFAULT_SETTINGS });
  }
});

// PUT /api/settings — Sadece admin güncelleyebilir
router.put(
  "/",
  authenticateToken as any,
  requireAdmin as any,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updateData = { ...req.body };
      delete updateData.id; // id değiştirilemez
      delete updateData.updatedAt; // otomatik

      const settings = await (prisma as any).siteSettings.upsert({
        where: { id: 1 },
        update: updateData,
        create: { id: 1, ...updateData },
      });

      console.log(`✅ Site settings updated by admin ${req.user?.email}`);

      res.json({
        success: true,
        message: "Ayarlar başarıyla güncellendi",
        data: settings,
      });
    } catch (error: any) {
      console.error("❌ Settings update error:", error.message);
      res.status(500).json({
        success: false,
        message: "Ayarlar güncellenirken hata oluştu: " + error.message,
      });
    }
  },
);

export default router;
