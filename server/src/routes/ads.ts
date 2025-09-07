import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth";
import * as adController from "../controllers/adController";

const router = Router();

// Multer configuration for handling multipart/form-data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// İl ve İlçe routes (specific routes must come before generic /:id route)
router.get("/cities", adController.getCities);
router.get("/cities/:cityId/districts", adController.getDistricts);

// İlan CRUD routes
router.get("/", adController.getAds);
router.get("/:id", adController.getAdById);
router.post("/", authenticateToken, adController.createAd);
router.put("/:id", authenticateToken, adController.updateAd);
router.delete("/:id", authenticateToken, adController.deleteAd);

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

// Kullanıcının ilanları
router.get("/user/my-ads", authenticateToken, adController.getUserAds);

// Admin routes
router.get("/admin/pending", authenticateToken, adController.getPendingAds);
router.put("/admin/:id/approve", authenticateToken, adController.approveAd);
router.put("/admin/:id/reject", authenticateToken, adController.rejectAd);

export default router;
