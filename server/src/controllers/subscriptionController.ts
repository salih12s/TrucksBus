import { Response } from "express";
import { prisma } from "../config/database";
import { AuthenticatedRequest } from "../types/auth";
import { io } from "../app";

// Paket fiyatları ve detayları
export const PACKAGE_DETAILS = {
  trucks: {
    name: "Trucks Paket",
    adLimit: 3,
    price: 0,
    originalPrice: 300,
    features: [
      "3 ilan hakkı",
      "30 gün süreyle yayında",
      "Temel destek",
      "İlan düzenleme",
    ],
  },
  trucks_plus: {
    name: "Trucks+ Paket",
    adLimit: 5,
    price: 0,
    originalPrice: 500,
    features: [
      "5 ilan hakkı",
      "45 gün süreyle yayında",
      "Öncelikli destek",
      "İlan düzenleme",
      "Öne çıkarma (+3 gün)",
    ],
  },
  trucksbus: {
    name: "TrucksBus Paket",
    adLimit: 10,
    price: 0,
    originalPrice: 800,
    features: [
      "10 ilan hakkı",
      "60 gün süreyle yayında",
      "7/24 öncelikli destek",
      "İlan düzenleme",
      "Öne çıkarma (+7 gün)",
      "Analitik raporlar",
    ],
  },
};

// Tüm paketleri getir
export const getPackages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      packages: PACKAGE_DETAILS,
    });
  } catch (error) {
    console.error("Paket listesi getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Paketler yüklenirken bir hata oluştu",
    });
  }
};

// Kullanıcının aktif paketini getir
export const getUserSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Yetkilendirme hatası",
      });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        message: "Aktif paket bulunamadı",
      });
    }

    const packageDetails =
      PACKAGE_DETAILS[subscription.packageType as keyof typeof PACKAGE_DETAILS];

    return res.json({
      success: true,
      subscription: {
        ...subscription,
        packageName: packageDetails.name,
        remainingAds: subscription.adLimit - subscription.adsUsed,
      },
    });
  } catch (error) {
    console.error("Kullanıcı paketi getirme hatası:", error);
    return res.status(500).json({
      success: false,
      message: "Paket bilgisi alınırken bir hata oluştu",
    });
  }
};

// Yeni paket satın al
export const createSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { packageType } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Yetkilendirme hatası",
      });
    }

    if (
      !packageType ||
      !PACKAGE_DETAILS[packageType as keyof typeof PACKAGE_DETAILS]
    ) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz paket türü",
      });
    }

    // Aktif paketi kontrol et
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "Zaten aktif bir paketiniz bulunmaktadır",
      });
    }

    const packageDetails =
      PACKAGE_DETAILS[packageType as keyof typeof PACKAGE_DETAILS];

    // İlk 6 ay ücretsiz
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        packageType,
        adLimit: packageDetails.adLimit,
        adsUsed: 0,
        price: packageDetails.price,
        isActive: true,
        isTrial: true,
        startDate,
        endDate,
      },
    });

    // 🏪 Kullanıcıya bildirim gönder - Dükkan açıldı
    await prisma.notification.create({
      data: {
        userId,
        title: "Dükkanınız Açıldı! 🏪🎉",
        message: `Tebrikler! "${packageDetails.name}" başarıyla aktif edildi. ${packageDetails.adLimit} ilan hakkınız bulunmaktadır. İlk 6 ay ücretsiz, sonraki dönemde %50 indirimli!`,
        type: "SUCCESS",
        relatedId: subscription.id,
      },
    });

    // Gerçek zamanlı bildirim gönder
    io.to(`user_${userId}`).emit("notification", {
      title: "Dükkanınız Açıldı! 🏪🎉",
      message: `"${packageDetails.name}" aktif edildi. ${packageDetails.adLimit} ilan hakkınız var!`,
      type: "SUCCESS",
    });

    console.log(
      `🏪 Dükkan açıldı ve bildirim gönderildi - Kullanıcı ID: ${userId}, Paket: ${packageDetails.name}`,
    );

    return res.json({
      success: true,
      message:
        "Paket başarıyla aktif edildi! İlk 6 ay ücretsiz, sonraki dönemde %50 indirimli.",
      subscription: {
        ...subscription,
        packageName: packageDetails.name,
        remainingAds: subscription.adLimit,
      },
    });
  } catch (error) {
    console.error("Paket oluşturma hatası:", error);
    return res.status(500).json({
      success: false,
      message: "Paket oluşturulurken bir hata oluştu",
    });
  }
};

// Paket değiştir (upgrade/downgrade)
export const changeSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { packageType } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Yetkilendirme hatası" });
    }

    if (!packageType || !PACKAGE_DETAILS[packageType as keyof typeof PACKAGE_DETAILS]) {
      return res.status(400).json({ success: false, message: "Geçersiz paket türü" });
    }

    const existing = await prisma.subscription.findFirst({
      where: { userId, isActive: true, endDate: { gte: new Date() } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Aktif paket bulunamadı" });
    }

    if (existing.packageType === packageType) {
      return res.status(400).json({ success: false, message: "Zaten bu paketi kullanıyorsunuz" });
    }

    const newPkg = PACKAGE_DETAILS[packageType as keyof typeof PACKAGE_DETAILS];

    // Eski paketi pasife al
    await prisma.subscription.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    // Yeni paket oluştur — kalan süreyi koru
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        packageType,
        adLimit: newPkg.adLimit,
        adsUsed: Math.min(existing.adsUsed, newPkg.adLimit),
        price: newPkg.price,
        isActive: true,
        isTrial: existing.isTrial,
        startDate: new Date(),
        endDate: existing.endDate,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Paketiniz Değiştirildi! 🔄",
        message: `"${newPkg.name}" paketine geçiş yapıldı. Yeni ilan limitiniz: ${newPkg.adLimit}`,
        type: "SUCCESS",
        relatedId: subscription.id,
      },
    });

    io.to(`user_${userId}`).emit("notification", {
      title: "Paketiniz Değiştirildi! 🔄",
      message: `"${newPkg.name}" paketine geçtiniz.`,
      type: "SUCCESS",
    });

    return res.json({
      success: true,
      message: `${newPkg.name} paketine başarıyla geçiş yapıldı.`,
      subscription: {
        ...subscription,
        packageName: newPkg.name,
        remainingAds: subscription.adLimit - subscription.adsUsed,
      },
    });
  } catch (error) {
    console.error("Paket değiştirme hatası:", error);
    return res.status(500).json({ success: false, message: "Paket değiştirilirken bir hata oluştu" });
  }
};

// Paketi iptal et
export const cancelSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Yetkilendirme hatası" });
    }

    const existing = await prisma.subscription.findFirst({
      where: { userId, isActive: true, endDate: { gte: new Date() } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Aktif paket bulunamadı" });
    }

    await prisma.subscription.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Paketiniz İptal Edildi",
        message: "Aboneliğiniz iptal edildi. Dilediğiniz zaman yeni bir paket seçebilirsiniz.",
        type: "INFO",
        relatedId: existing.id,
      },
    });

    io.to(`user_${userId}`).emit("notification", {
      title: "Paketiniz İptal Edildi",
      message: "Aboneliğiniz iptal edildi.",
      type: "INFO",
    });

    return res.json({ success: true, message: "Paketiniz başarıyla iptal edildi." });
  } catch (error) {
    console.error("Paket iptal hatası:", error);
    return res.status(500).json({ success: false, message: "Paket iptal edilirken bir hata oluştu" });
  }
};

// İlan oluştururken paket kontrolü
export const checkAdLimit = async (
  userId: number,
): Promise<{ allowed: boolean; message?: string }> => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (!subscription) {
      return {
        allowed: false,
        message: "İlan vermek için bir paket satın almalısınız",
      };
    }

    if (subscription.adsUsed >= subscription.adLimit) {
      return {
        allowed: false,
        message: `Paket limitiniz doldu. ${subscription.adLimit} ilan hakkınızı kullandınız.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("İlan limiti kontrolü hatası:", error);
    return {
      allowed: false,
      message: "Kontrol sırasında bir hata oluştu",
    };
  }
};

// İlan oluşturulduğunda kullanılan ilan sayısını artır
export const incrementAdsUsed = async (userId: number): Promise<void> => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          adsUsed: subscription.adsUsed + 1,
        },
      });
    }
  } catch (error) {
    console.error("İlan sayısı artırma hatası:", error);
  }
};
