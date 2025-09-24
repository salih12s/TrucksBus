import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import * as adController from "../controllers/adController";

const router = Router();

// Multer configuration for handling multipart/form-data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 20, // Max 20 files (15 photos + 3 videos + 1 showcase + 1 extra)
  },
});

// İl ve İlçe routes (specific routes must come before generic /:id route)
router.get("/cities", adController.getCities);
router.get("/cities/:cityId/districts", adController.getDistricts);

// İlan CRUD routes
router.get("/", adController.getAds);
router.get("/:id/similar", adController.getSimilarAds);
router.get(
  "/:id",
  (req, res, next) => {
    console.log("🎯 ADS Route /:id yakalandı - ID:", req.params.id);
    next();
  },
  adController.getAdById
);
router.post("/", authenticateToken, upload.any(), adController.createAd);
router.put("/:id", authenticateToken, adController.updateAd);
router.delete("/:id", authenticateToken, adController.deleteAd);

// Video routes
router.post(
  "/:id/videos",
  authenticateToken,
  upload.single("video"),
  adController.uploadVideo
);
router.get("/:id/videos", adController.getAdVideos);
router.delete(
  "/:id/videos/:videoId",
  authenticateToken,
  adController.deleteVideo
);

// Minibüs ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/minibus",
  authenticateToken,
  upload.any(),
  adController.createMinibusAd
);

// Çekici ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/cekici",
  authenticateToken,
  upload.any(),
  adController.createCekiciAd
);

// Kamyon ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/kamyon",
  authenticateToken,
  upload.any(),
  adController.createKamyonAd
);

// Otobüs ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/otobus",
  authenticateToken,
  upload.any(),
  adController.createOtobusAd
);

// Dorse ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/dorse",
  authenticateToken,
  upload.any(),
  adController.createDorseAd
);

// Karoser üst yapı ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/karoser",
  authenticateToken,
  upload.any(),
  adController.createKaroserAd
);

// Oto Kurtarıcı Tekli ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/oto-kurtarici-tekli",
  authenticateToken,
  upload.any(),
  adController.createOtoKurtariciTekliAd
);

// Oto Kurtarıcı Çoklu ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/oto-kurtarici-coklu",
  authenticateToken,
  upload.any(),
  adController.createOtoKurtariciCokluAd
);

// Uzayabilir Şasi ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/uzayabilir-sasi",
  authenticateToken,
  upload.any(),
  adController.createUzayabilirSasiAd
);

// Kamyon Römork ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/kamyon-romork",
  authenticateToken,
  upload.any(),
  adController.createKamyonRomorkAd
);

// Tarım Römork ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/tarim-romork",
  authenticateToken,
  upload.any(),
  adController.createKamyonRomorkAd // Aynı controller'ı kullanabilir
);

// Taşıma Römorkları ilan oluşturma (multipart/form-data desteği ile)
router.post(
  "/tasima-romork",
  authenticateToken,
  upload.any(),
  adController.createKamyonRomorkAd // Aynı controller'ı kullanabilir
);

// Kullanıcının ilanları
router.get("/user/my-ads", authenticateToken, adController.getUserAds);

// Admin routes
router.get(
  "/admin/pending",
  authenticateToken,
  requireAdmin,
  adController.getPendingAds
);
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  adController.getAllAdsForAdmin
);
router.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  adController.getAdminStats
);
router.put(
  "/admin/:id/approve",
  authenticateToken,
  requireAdmin,
  adController.approveAd
);
router.put(
  "/admin/:id/reject",
  authenticateToken,
  requireAdmin,
  adController.rejectAd
);
router.delete(
  "/admin/:id/force-delete",
  authenticateToken,
  requireAdmin,
  adController.forceDeleteAd
);

export default router;
