// Enum çevirileri ve seçenekleri

// Durum çevirileri
export const conditionOptions = [
  { value: "sifir", label: "Sıfır Kilometre" },
  { value: "ikinci-el", label: "İkinci El" },
  { value: "hasarli", label: "Hasarlı" },
  { value: "yurtdisindan-ithal", label: "Yurtdışından İthal" },
];

// Şanzıman çevirileri
export const transmissionOptions = [
  { value: "manuel", label: "Manuel" },
  { value: "otomatik", label: "Otomatik" },
  { value: "yari-otomatik", label: "Yarı Otomatik" },
];

// Yakıt tipi çevirileri
export const fuelTypeOptions = [
  { value: "benzinli", label: "Benzinli" },
  { value: "benzinli-lpg", label: "Benzinli + LPG" },
  { value: "dizel", label: "Dizel" },
  { value: "elektrik", label: "Elektrik" },
  { value: "hibrit", label: "Hibrit" },
  { value: "cng", label: "CNG" },
  { value: "lpg", label: "LPG" },
];

// Çekiş tipi çevirileri
export const drivetrainOptions = [
  { value: "onden-cekis", label: "Önden Çekiş" },
  { value: "arkadan-itis", label: "Arkadan İtiş" },
  { value: "4wd-surekli", label: "4WD Sürekli" },
  { value: "arkadan-itis-elektronik", label: "Arkadan İtiş Elektronik" },
  { value: "4x2", label: "4x2" },
  { value: "4x4", label: "4x4" },
  { value: "6x2", label: "6x2" },
  { value: "6x4", label: "6x4" },
  { value: "6x6", label: "6x6" },
  { value: "8x2", label: "8x2" },
  { value: "8x4", label: "8x4" },
  { value: "8x8", label: "8x8" },
];

// Çatı tipi çevirileri
export const roofTypeOptions = [
  { value: "normal-tavan", label: "Normal Tavan" },
  { value: "yuksek-tavan", label: "Yüksek Tavan" },
];

// Plaka tipi çevirileri
export const plateTypeOptions = [
  { value: "tr-plaka", label: "TR Plaka" },
  { value: "mavi-plaka", label: "Mavi Plaka" },
  { value: "ma-plaka", label: "MA Plaka" },
];

// Takas seçenekleri
export const exchangeOptions = [
  { value: "evet", label: "Evet" },
  { value: "hayir", label: "Hayır" },
  { value: "olabilir", label: "Olabilir" },
];

// Lastik durumu seçenekleri
export const tireConditionOptions = [
  { value: "yeni", label: "Yeni" },
  { value: "cok-iyi", label: "Çok İyi" },
  { value: "iyi", label: "İyi" },
  { value: "orta", label: "Orta" },
  { value: "degismeli", label: "Değişmeli" },
];

// Renk seçenekleri
export const colorOptions = [
  { value: "beyaz", label: "Beyaz" },
  { value: "siyah", label: "Siyah" },
  { value: "gri", label: "Gri" },
  { value: "kirmizi", label: "Kırmızı" },
  { value: "mavi", label: "Mavi" },
  { value: "yesil", label: "Yeşil" },
  { value: "sari", label: "Sarı" },
  { value: "turuncu", label: "Turuncu" },
  { value: "mor", label: "Mor" },
  { value: "pembe", label: "Pembe" },
  { value: "kahverengi", label: "Kahverengi" },
  { value: "gümüs", label: "Gümüş" },
  { value: "turkuaz", label: "Turkuaz" },
];

// Motor gücü seçenekleri (HP)
export const motorPowerOptions = [
  { value: "100-150", label: "100-150 HP" },
  { value: "150-200", label: "150-200 HP" },
  { value: "200-250", label: "200-250 HP" },
  { value: "250-300", label: "250-300 HP" },
  { value: "300-350", label: "300-350 HP" },
  { value: "350-400", label: "350-400 HP" },
  { value: "400-450", label: "400-450 HP" },
  { value: "450-500", label: "450-500 HP" },
  { value: "500-550", label: "500-550 HP" },
  { value: "550-600", label: "550-600 HP" },
  { value: "600+", label: "600+ HP" },
];

// Motor hacmi seçenekleri (cc)
export const engineVolumeOptions = [
  { value: "1000-1400", label: "1000-1400 cc" },
  { value: "1400-1600", label: "1400-1600 cc" },
  { value: "1600-2000", label: "1600-2000 cc" },
  { value: "2000-2500", label: "2000-2500 cc" },
  { value: "2500-3000", label: "2500-3000 cc" },
  { value: "3000+", label: "3000+ cc" },
];

// Yük kapasitesi seçenekleri (kg)
export const loadCapacityOptions = [
  { value: "0-1500", label: "0 - 1.500 kg" },
  { value: "1501-3000", label: "1.501 - 3.000 kg" },
  { value: "3001-3500", label: "3.001 - 3.500 kg" },
  { value: "3501-5000", label: "3.501 - 5.000 kg" },
  { value: "5001-10000", label: "5.001 - 10.000 kg" },
  { value: "10001-20000", label: "10.001 - 20.000 kg" },
  { value: "20001-30000", label: "20.001 - 30.000 kg" },
  { value: "30001-40000", label: "30.001 - 40.000 kg" },
  { value: "40000+", label: "40.000+ kg" },
];

// Yolcu kapasitesi seçenekleri
export const passengerCapacityOptions = [
  { value: "8-14", label: "8-14 Kişi" },
  { value: "15-22", label: "15-22 Kişi" },
  { value: "23-30", label: "23-30 Kişi" },
  { value: "31-45", label: "31-45 Kişi" },
  { value: "46-60", label: "46-60 Kişi" },
  { value: "60+", label: "60+ Kişi" },
];

// Kabin tipi seçenekleri
export const cabinTypeOptions = [
  { value: "normal-kabin", label: "Normal Kabin" },
  { value: "yuksek-kabin", label: "Yüksek Kabin" },
  { value: "cift-kabin", label: "Çift Kabin" },
  { value: "gunluk", label: "Günlük" },
  { value: "yatakli", label: "Yataklı" },
];

// Üst yapı seçenekleri
export const superstructureOptions = [
  { value: "acik-kasa", label: "Açık Kasa" },
  { value: "kapali-kasa", label: "Kapalı Kasa" },
  { value: "damperli", label: "Damperli" },
  { value: "sogutucu", label: "Soğutucu" },
  { value: "tanker", label: "Tanker" },
  { value: "lowbed", label: "Lowbed" },
  { value: "konteyner-tasiyici", label: "Konteyner Taşıyıcı" },
];

// Koltuk düzeni seçenekleri
export const seatLayoutOptions = [
  { value: "2+1", label: "2+1" },
  { value: "2+2", label: "2+2" },
  { value: "1+1", label: "1+1" },
  { value: "2+3", label: "2+3" },
];

// Boolean seçenekleri (Evet/Hayır)
export const booleanOptions = [
  { value: "evet", label: "Evet" },
  { value: "hayir", label: "Hayır" },
];

// Hasar kaydı seçenekleri
export const damageRecordOptions = [
  { value: "yok", label: "Yok" },
  { value: "var-az", label: "Var (Az)" },
  { value: "var-orta", label: "Var (Orta)" },
  { value: "var-cok", label: "Var (Çok)" },
];

// Boya değişimi seçenekleri
export const paintChangeOptions = [
  { value: "yok", label: "Yok" },
  { value: "var-az", label: "Var (Az)" },
  { value: "var-cok", label: "Var (Çok)" },
  { value: "tamamen-boyali", label: "Tamamen Boyalı" },
];

// Çeviri fonksiyonları
export const translateCondition = (condition: string): string => {
  const option = conditionOptions.find((opt) => opt.value === condition);
  return option ? option.label : condition;
};

export const translateTransmission = (transmission: string): string => {
  const option = transmissionOptions.find((opt) => opt.value === transmission);
  return option ? option.label : transmission;
};

export const translateFuelType = (fuelType: string): string => {
  const option = fuelTypeOptions.find((opt) => opt.value === fuelType);
  return option ? option.label : fuelType;
};

export const translateDrivetrain = (drivetrain: string): string => {
  const option = drivetrainOptions.find((opt) => opt.value === drivetrain);
  return option ? option.label : drivetrain;
};

export const translateRoofType = (roofType: string): string => {
  const option = roofTypeOptions.find((opt) => opt.value === roofType);
  return option ? option.label : roofType;
};

export const translatePlateType = (plateType: string): string => {
  const option = plateTypeOptions.find((opt) => opt.value === plateType);
  return option ? option.label : plateType;
};

export const translateExchange = (exchange: string): string => {
  const option = exchangeOptions.find((opt) => opt.value === exchange);
  return option ? option.label : exchange;
};

export const translateColor = (color: string): string => {
  const option = colorOptions.find((opt) => opt.value === color);
  return option ? option.label : color;
};

export const translateTireCondition = (tireCondition: string): string => {
  const option = tireConditionOptions.find(
    (opt) => opt.value === tireCondition
  );
  return option ? option.label : tireCondition;
};
