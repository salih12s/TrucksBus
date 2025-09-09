// Şehir ve ilçe isimlerini koordinatlara çeviren fonksiyon
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: LocationCoordinates;
  formattedAddress: string;
  success: boolean;
  error?: string;
}

// Türkiye şehir koordinatları (fallback için)
const TURKEY_CITY_COORDINATES: Record<string, LocationCoordinates> = {
  ADANA: { lat: 37.0, lng: 35.3213 },
  ADIYAMAN: { lat: 37.7648, lng: 38.2786 },
  AFYONKARAHİSAR: { lat: 38.7507, lng: 30.5567 },
  AĞRI: { lat: 39.7191, lng: 43.0503 },
  AMASYA: { lat: 40.6499, lng: 35.8353 },
  ANKARA: { lat: 39.9334, lng: 32.8597 },
  ANTALYA: { lat: 36.8969, lng: 30.7133 },
  ARTVİN: { lat: 41.1828, lng: 41.8183 },
  AYDIN: { lat: 37.8444, lng: 27.8458 },
  BALIKESİR: { lat: 39.6484, lng: 27.8826 },
  BİLECİK: { lat: 40.1553, lng: 29.9833 },
  BİNGÖL: { lat: 38.8847, lng: 40.4986 },
  BİTLİS: { lat: 38.4015, lng: 42.1232 },
  BOLU: { lat: 40.576, lng: 31.5788 },
  BURDUR: { lat: 37.72, lng: 30.29 },
  BURSA: { lat: 40.2669, lng: 29.0634 },
  ÇANAKKALE: { lat: 40.1553, lng: 26.4142 },
  ÇANKIRI: { lat: 40.6013, lng: 33.6134 },
  ÇORUM: { lat: 40.5506, lng: 34.9556 },
  DENİZLİ: { lat: 37.7765, lng: 29.0864 },
  DİYARBAKIR: { lat: 37.9144, lng: 40.2306 },
  EDİRNE: { lat: 41.6818, lng: 26.5623 },
  ELAZIĞ: { lat: 38.6748, lng: 39.2226 },
  ERZİNCAN: { lat: 39.75, lng: 39.5 },
  ERZURUM: { lat: 39.9, lng: 41.27 },
  ESKİŞEHİR: { lat: 39.7667, lng: 30.5256 },
  GAZİANTEP: { lat: 37.0662, lng: 37.3833 },
  GİRESUN: { lat: 40.9128, lng: 38.3895 },
  GÜMÜŞHANE: { lat: 40.4386, lng: 39.5086 },
  HAKKARİ: { lat: 37.5744, lng: 43.7408 },
  HATAY: { lat: 36.4018, lng: 36.3498 },
  ISPARTA: { lat: 37.7648, lng: 30.5566 },
  MERSİN: { lat: 36.8, lng: 34.6333 },
  İSTANBUL: { lat: 41.0082, lng: 28.9784 },
  İZMİR: { lat: 38.4237, lng: 27.1428 },
  KARS: { lat: 40.6013, lng: 43.0975 },
  KASTAMONU: { lat: 41.3887, lng: 33.7827 },
  KAYSERİ: { lat: 38.7312, lng: 35.4787 },
  KIRKLARELİ: { lat: 41.7333, lng: 27.2167 },
  KIRŞEHİR: { lat: 39.1425, lng: 34.1709 },
  KOCAELİ: { lat: 40.8533, lng: 29.8815 },
  KONYA: { lat: 37.8667, lng: 32.4833 },
  KÜTAHYA: { lat: 39.4167, lng: 29.9833 },
  MALATYA: { lat: 38.3552, lng: 38.3095 },
  MANİSA: { lat: 38.6191, lng: 27.4289 },
  KAHRAMANMARAŞ: { lat: 37.5858, lng: 36.9371 },
  MARDİN: { lat: 37.3212, lng: 40.7245 },
  MUĞLA: { lat: 37.2153, lng: 28.3636 },
  MUŞ: { lat: 38.9462, lng: 41.7539 },
  NEVŞEHİR: { lat: 38.6939, lng: 34.6857 },
  NİĞDE: { lat: 37.9667, lng: 34.6833 },
  ORDU: { lat: 40.9839, lng: 37.8764 },
  RİZE: { lat: 41.0201, lng: 40.5234 },
  SAKARYA: { lat: 40.694, lng: 30.4358 },
  SAMSUN: { lat: 41.2928, lng: 36.3313 },
  SİİRT: { lat: 37.9333, lng: 41.95 },
  SİNOP: { lat: 42.0231, lng: 35.1531 },
  SİVAS: { lat: 39.7477, lng: 37.0179 },
  TEKİRDAĞ: { lat: 40.9833, lng: 27.5167 },
  TOKAT: { lat: 40.3167, lng: 36.55 },
  TRABZON: { lat: 41.0015, lng: 39.7178 },
  TUNCELİ: { lat: 39.3074, lng: 39.4388 },
  ŞANLIURFA: { lat: 37.1591, lng: 38.7969 },
  UŞAK: { lat: 38.6823, lng: 29.4082 },
  VAN: { lat: 38.4891, lng: 43.4089 },
  YOZGAT: { lat: 39.8181, lng: 34.8147 },
  ZONGULDAK: { lat: 41.4564, lng: 31.7987 },
  AKSARAY: { lat: 38.3687, lng: 34.037 },
  BAYBURT: { lat: 40.2552, lng: 40.2249 },
  KARAMAN: { lat: 37.1759, lng: 33.2287 },
  KIRIKKALE: { lat: 39.8468, lng: 33.5153 },
  BATMAN: { lat: 37.8812, lng: 41.1351 },
  ŞIRNAK: { lat: 37.4187, lng: 42.4918 },
  BARTIN: { lat: 41.5811, lng: 32.461 },
  ARDAHAN: { lat: 41.1105, lng: 42.7022 },
  IĞDIR: { lat: 39.888, lng: 44.0048 },
  YALOVA: { lat: 40.65, lng: 29.2667 },
  KARABÜK: { lat: 41.2061, lng: 32.6204 },
  KİLİS: { lat: 36.7184, lng: 37.1212 },
  OSMANİYE: { lat: 37.213, lng: 36.1763 },
  DÜZCE: { lat: 40.8438, lng: 31.1565 },
};

// Google Maps Geocoding API kullanarak koordinat bulma
export const geocodeLocation = async (
  city: string,
  district?: string
): Promise<GeocodingResult> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      coordinates: { lat: 39.9334, lng: 32.8597 }, // Ankara default
      formattedAddress: `${city}${district ? ` / ${district}` : ""}, Türkiye`,
      success: false,
      error: "Google Maps API key bulunamadı",
    };
  }

  try {
    // Türkçe karakter temizleme ve büyük harfe çevirme
    const cleanCity = city
      .toUpperCase()
      .replace("İ", "I")
      .replace("Ğ", "G")
      .replace("Ü", "U")
      .replace("Ş", "S")
      .replace("Ö", "O")
      .replace("Ç", "C");

    // Önce yerel koordinatlardan kontrol et
    if (TURKEY_CITY_COORDINATES[cleanCity]) {
      return {
        coordinates: TURKEY_CITY_COORDINATES[cleanCity],
        formattedAddress: `${city}${district ? ` / ${district}` : ""}, Türkiye`,
        success: true,
      };
    }

    // Google Geocoding API'yi kullan
    const query = district
      ? `${district}, ${city}, Türkiye`
      : `${city}, Türkiye`;
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${apiKey}&language=tr&region=tr`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        formattedAddress: result.formatted_address,
        success: true,
      };
    } else {
      // API'den sonuç gelmezse fallback kullan
      const fallbackCoords = TURKEY_CITY_COORDINATES[cleanCity] || {
        lat: 39.9334,
        lng: 32.8597,
      };
      return {
        coordinates: fallbackCoords,
        formattedAddress: `${city}${district ? ` / ${district}` : ""}, Türkiye`,
        success: false,
        error: `Konum bulunamadı: ${data.status}`,
      };
    }
  } catch (error) {
    // Hata durumunda fallback koordinatları kullan
    const cleanCity = city
      .toUpperCase()
      .replace("İ", "I")
      .replace("Ğ", "G")
      .replace("Ü", "U")
      .replace("Ş", "S")
      .replace("Ö", "O")
      .replace("Ç", "C");

    const fallbackCoords = TURKEY_CITY_COORDINATES[cleanCity] || {
      lat: 39.9334,
      lng: 32.8597,
    };

    return {
      coordinates: fallbackCoords,
      formattedAddress: `${city}${district ? ` / ${district}` : ""}, Türkiye`,
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
};

// Koordinatlara göre adres bulma (ters geocoding)
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<GeocodingResult> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      coordinates: { lat, lng },
      formattedAddress: "Konum bilgisi alınamadı",
      success: false,
      error: "Google Maps API key bulunamadı",
    };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=tr&region=tr`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      return {
        coordinates: { lat, lng },
        formattedAddress: data.results[0].formatted_address,
        success: true,
      };
    } else {
      return {
        coordinates: { lat, lng },
        formattedAddress: "Adres bulunamadı",
        success: false,
        error: `Geocoding başarısız: ${data.status}`,
      };
    }
  } catch (error) {
    return {
      coordinates: { lat, lng },
      formattedAddress: "Adres bilgisi alınamadı",
      success: false,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
};
