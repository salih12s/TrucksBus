import apiClient from "./client";

export interface SiteSettings {
  id: number;
  // Header / Slogan
  sloganLeft: string;
  sloganRight: string;
  logoUrl: string | null;
  // Ana Sayfa
  showcaseTitle: string;
  searchPlaceholder: string;
  // İlan Kartları
  showExampleBadge: boolean;
  exampleBadgeText: string;
  exampleBadgeColor: string;
  cardPriceColor: string;
  adsPerPage: number;
  // Renk Teması
  primaryColor: string;
  headerBgColor: string;
  footerBgColor: string;
  // İletişim
  contactEmail: string;
  contactPhone: string | null;
  contactAddress: string;
  // Footer
  footerText: string;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  // SEO
  siteTitle: string;
  siteDescription: string;
  // Genel
  maintenanceMode: boolean;
  maintenanceMsg: string;
  announcementText: string | null;
  announcementColor: string;
  showAnnouncement: boolean;
  updatedAt?: string;
}

// Default ayarlar - API erişilemezse kullanılır
export const DEFAULT_SETTINGS: SiteSettings = {
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

// Cache: settings'i localStorage'da tut
const CACHE_KEY = "siteSettings";
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

function getCachedSettings(): SiteSettings | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch {}
  return null;
}

function setCachedSettings(data: SiteSettings) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {}
}

export function clearSettingsCache() {
  localStorage.removeItem(CACHE_KEY);
}

// GET - Site ayarlarını getir (public)
export async function fetchSiteSettings(): Promise<SiteSettings> {
  // Önce cache'e bak
  const cached = getCachedSettings();
  if (cached) return cached;

  try {
    const response = await apiClient.get<{
      success: boolean;
      data: SiteSettings;
    }>("/settings");
    const settings = response.data.data || DEFAULT_SETTINGS;
    setCachedSettings(settings);
    return settings;
  } catch (error) {
    console.warn("⚠️ Settings API erişilemedi, default kullanılıyor");
    return DEFAULT_SETTINGS;
  }
}

// PUT - Site ayarlarını güncelle (admin only)
export async function updateSiteSettings(
  data: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const response = await apiClient.put<{
    success: boolean;
    data: SiteSettings;
  }>("/settings", data);
  const settings = response.data.data;
  // Cache'i güncelle
  setCachedSettings(settings);
  return settings;
}
