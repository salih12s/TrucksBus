/**
 * Kullanıcı Güven Skoru Servisi
 *
 * User modeline DOKUNMADAN, runtime'da kullanıcının
 * ilan geçmişi ve şikayet verisinden güven skoru hesaplar.
 *
 * Hata durumunda default 50 döner — mevcut sistemi BOZMAZ.
 */

import { prisma } from "../config/database";

export interface TrustScoreResult {
    score: number; // 0 - 100
    totalAds: number;
    rejectedAds: number;
    complaints: number;
}

/**
 * Kullanıcı güven skorunu hesaplar.
 *
 * Formül: score = 100 - (rejectedAds * 10) - (complaints * 5)
 * Sınır: 0 - 100
 *
 * Kullanıcı bulunamazsa veya hata olursa → default 50
 */
export async function getUserTrustScore(
    userId: number,
): Promise<TrustScoreResult> {
    try {
        if (!userId) {
            return { score: 50, totalAds: 0, rejectedAds: 0, complaints: 0 };
        }

        // Paralel sorgular — performans için
        const [totalAds, rejectedAds, complaints] = await Promise.all([
            // Toplam ilan sayısı
            prisma.ad.count({
                where: { userId },
            }),

            // Reddedilen ilan sayısı
            prisma.ad.count({
                where: { userId, status: "REJECTED" },
            }),

            // Şikayet sayısı (kullanıcının ilanlarına gelen şikayetler)
            prisma.complaint.count({
                where: {
                    ad: { userId },
                },
            }),
        ]);

        // Veri yoksa default
        if (totalAds === 0) {
            return { score: 50, totalAds: 0, rejectedAds: 0, complaints: 0 };
        }

        // Skor hesapla
        let score = 100 - rejectedAds * 10 - complaints * 5;

        // Sınırla: 0 - 100
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            totalAds,
            rejectedAds,
            complaints,
        };
    } catch (error) {
        console.error("⚠️ TrustScoreService hatası:", error);
        // Hata durumunda default skor
        return { score: 50, totalAds: 0, rejectedAds: 0, complaints: 0 };
    }
}
