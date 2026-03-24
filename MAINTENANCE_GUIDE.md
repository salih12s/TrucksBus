# Bakım Modu Kullanım Kılavuzu

## 🔧 Bakım Modunu Aktifleştirme

### 1. Development (Geliştirme) Ortamında

`.env.local` dosyasında:

```bash
VITE_MAINTENANCE_MODE=true
```

Sonra sunucuyu yeniden başlatın:

```bash
npm run dev
```

### 2. Production (Canlı Site) Ortamında

#### Seçenek A: Environment Variable ile

```bash
# Build sırasında
VITE_MAINTENANCE_MODE=true npm run build

# Veya server'da environment variable set edin
export VITE_MAINTENANCE_MODE=true
```

#### Seçenek B: .env.production dosyası ile

`.env.production` dosyası oluşturun:

```bash
VITE_MAINTENANCE_MODE=true
```

### 3. Hızlı Bakım Modu (Railway/Vercel gibi platformlar için)

Platform dashboard'unuzda environment variable ekleyin:

- **Variable Name**: `VITE_MAINTENANCE_MODE`
- **Value**: `true`

## 🚀 Bakım Modundan Çıkma

Aynı şekilde değeri `false` yapın ve yeniden deploy edin.

## 📱 Özelleştirme

`src/components/MaintenanceMode.tsx` dosyasını düzenleyerek:

- Mesajları değiştirebilirsiniz
- İletişim bilgilerini güncelleyebilirsiniz
- Tasarımı özelleştirebilirsiniz
- Logo/renkler değiştirebilirsiniz

## 🛠️ Gelişmiş Kullanım

### Belirli IP'leri hariç tutma (gelecek versiyon):

```tsx
const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE === "true" &&
  !["192.168.1.1", "10.0.0.1"].includes(userIP);
```

### Zamanlı bakım modu:

```tsx
const maintenanceStart = new Date("2025-09-21T02:00:00Z");
const maintenanceEnd = new Date("2025-09-21T04:00:00Z");
const now = new Date();
const isMaintenanceMode = now >= maintenanceStart && now <= maintenanceEnd;
```

## ⚠️ Önemli Notlar

1. **Environment variable değişiklikleri build gerektirir**
2. **Bakım modunda tüm sayfalara erişim engellenir**
3. **Admin panel de dahil tüm erişim kapanır**
4. **API çağrıları normal çalışmaya devam eder**
