# 🚛 TrucksBus - Ticari Araç İlan Platformu

<div align="center">

**Türkiye'nin ticari araç alım-satım platformu**

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app/)

</div>

---

## 📋 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Teknoloji Altyapısı](#-teknoloji-altyapısı)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Geliştirme](#-geliştirme)
- [Veritabanı](#-veritabanı)
- [API Yapısı](#-api-yapısı)
- [Kimlik Doğrulama & Güvenlik](#-kimlik-doğrulama--güvenlik)
- [Araç Kategorileri](#-araç-kategorileri)
- [Özellikler](#-özellikler)
- [Çoklu Dil Desteği](#-çoklu-dil-desteği-i18n)
- [Abonelik Sistemi](#-abonelik-sistemi)
- [Admin Paneli](#-admin-paneli)
- [Gerçek Zamanlı Mesajlaşma](#-gerçek-zamanlı-mesajlaşma)
- [PWA Desteği](#-pwa-desteği)
- [Deployment](#-deployment)
- [Ortam Değişkenleri](#-ortam-değişkenleri)
- [Komut Referansı](#-komut-referansı)
- [Katkıda Bulunma](#-katkıda-bulunma)

---

## 🌍 Genel Bakış

**TrucksBus**, çekici, kamyon, otobüs, dorse, römork ve diğer ticari araçların alım-satımını kolaylaştıran tam kapsamlı bir e-ticaret platformudur. Platform, bireysel ve kurumsal kullanıcıların ilan oluşturması, araması, favorilere eklemesi, mesajlaşması ve abonelik bazlı premium özelliklerden yararlanması için geliştirilmiştir.

### Rakamlarla TrucksBus
- 📊 **9** araç kategorisi, **198** marka, **669** model, **3.207** varyant
- 📋 **51** özelleştirilmiş form bileşeni
- 🏙️ **81** il, **973** ilçe veritabanı
- 🌐 **5** dil desteği (TR, EN, DE, RU, ZH)
- 🔌 **18** API route dosyası, **12** controller

### Temel Hedefler
- 🚛 9 farklı ticari araç kategorisinde detaylı ilan yönetimi
- 🏢 Bireysel ve kurumsal kullanıcı desteği
- 🔒 KVKK uyumlu, güvenli kullanıcı deneyimi
- 🌐 5 dilde uluslararası erişim (TR, EN, DE, RU, ZH)
- 📱 PWA destekli mobil uyumlu arayüz
- ⚡ Gerçek zamanlı mesajlaşma (Socket.io)
- 🛡️ Admin onay mekanizması ve moderasyon sistemi

---

## 🛠 Teknoloji Altyapısı

### Frontend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| **React** | 19 | UI framework |
| **TypeScript** | 5.8 | Tip güvenliği |
| **Vite** | 7.1 | Build & dev server |
| **Redux Toolkit** | 2.9 | Global state yönetimi |
| **TanStack React Query** | 5.87 | Server state & caching |
| **Material-UI (MUI)** | 7.3 | UI bileşen kütüphanesi |
| **Tailwind CSS** | 4.1 | Utility-first CSS |
| **React Router** | 7.8 | Sayfa yönlendirme |
| **React Hook Form + Yup** | 7.62 / 1.7 | Form yönetimi & doğrulama |
| **i18next** | 25.5 | Çoklu dil altyapısı |
| **Socket.io Client** | 4.8 | Gerçek zamanlı iletişim |
| **Recharts** | 3.1 | Grafik & analitik |
| **Axios** | - | HTTP istemcisi |

### Backend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| **Node.js** | 20 LTS | Runtime |
| **Express** | 5.1 | Web framework |
| **TypeScript** | 5.8 | Tip güvenliği |
| **Prisma ORM** | 6 | Veritabanı erişimi |
| **PostgreSQL** | 16 | Veritabanı |
| **Socket.io** | 4.8 | WebSocket sunucusu |
| **JWT** | 9.0 | Token tabanlı kimlik doğrulama |
| **bcryptjs** | 3.0 | Parola şifreleme |
| **Multer** | 2.0 | Dosya yükleme |
| **Sharp** | 0.34 | Görsel işleme & filigran |
| **Nodemailer** | 7.0 | E-posta gönderimi |
| **Helmet** | 8.1 | HTTP güvenlik başlıkları |
| **Joi** | 18.0 | Girdi doğrulama |

### DevOps
| Teknoloji | Kullanım |
|-----------|----------|
| **Docker** | Konteynerizasyon (Node 20 Alpine) |
| **Railway** | Production hosting |
| **nixpacks** | Railway build sistemi |
| **npm Workspaces** | Monorepo yönetimi |
| **Concurrently** | Paralel geliştirme sunucuları |

---

## 📁 Proje Yapısı

```
TrucksBusV2-Share/
├── package.json                  # Root - npm workspaces tanımı
├── Dockerfile                    # Docker imajı
├── nixpacks.toml                 # Railway build yapılandırması
├── railway.json                  # Railway deploy ayarları
│
├── client/                       # ⚛️ React Frontend
│   ├── package.json
│   ├── vite.config.ts            # Vite yapılandırması
│   ├── tailwind.config.js        # Tailwind CSS
│   ├── index.html                # SPA giriş noktası
│   ├── public/
│   │   ├── BrandsImage/          # 198+ marka logosu
│   │   ├── CategoryImage/        # 9 kategori görseli
│   │   ├── manifest.json         # PWA manifest
│   │   └── sw.js                 # Service Worker
│   └── src/
│       ├── main.tsx              # Uygulama başlangıcı
│       ├── App.tsx               # Route tanımları & lazy loading
│       ├── api/                  # API katmanı (Axios)
│       │   ├── client.ts         # Axios instance & interceptor'lar
│       │   ├── auth.ts           # Kimlik doğrulama API
│       │   ├── ads.ts            # İlan CRUD API
│       │   ├── messaging.ts      # Mesajlaşma API
│       │   ├── favorites.ts      # Favoriler API
│       │   ├── complaints.ts     # Şikayet API
│       │   ├── feedback.ts       # Geri bildirim API
│       │   ├── doping.ts         # Premium özellikler API
│       │   ├── notifications.ts  # Bildirim API
│       │   ├── settings.ts       # Site ayarları API
│       │   └── subscription.ts   # Abonelik API
│       ├── admin/                # 🛡️ Admin paneli
│       │   ├── components/       # Admin bileşenleri
│       │   └── pages/            # Admin sayfaları (9 sayfa)
│       ├── components/           # UI bileşenleri
│       │   ├── ads/              # İlan kartları, liste, detay
│       │   ├── analytics/        # Grafik & istatistik
│       │   ├── auth/             # Giriş, kayıt, şifre sıfırlama
│       │   ├── common/           # ErrorBoundary, Loading, Splash
│       │   ├── complaints/       # Şikayet formları
│       │   ├── forms/            # 🚛 Araç formları (51 bileşen, 20+ varyant)
│       │   ├── layout/           # Header, Footer
│       │   ├── maps/             # Google Maps entegrasyonu
│       │   ├── messaging/        # Sohbet arayüzü
│       │   ├── modals/           # Modal bileşenler
│       │   ├── pwa/              # PWA bileşenleri
│       │   ├── search/           # Arama & filtreleme
│       │   └── subscription/     # Abonelik UI
│       ├── constants/            # Sabit veriler (marka listeleri)
│       ├── hooks/                # Custom hook'lar
│       ├── i18n/                 # Çoklu dil dosyaları (5 dil)
│       ├── pages/                # 17+ sayfa bileşeni
│       ├── routes/               # Yönlendirme yapılandırması
│       ├── services/             # Socket.io bağlantısı
│       ├── store/                # Redux store & slice'lar
│       └── utils/                # Yardımcı fonksiyonlar
│
└── server/                       # 🖥️ Node.js Backend
    ├── package.json
    ├── tsconfig.json
    ├── prisma/
    │   ├── schema.prisma         # Veritabanı şeması (20+ model)
    │   ├── seed.ts               # Seed verileri (kategoriler, markalar, modeller, varyantlar)
    │   └── sync-from-railway.ts  # Railway DB senkronizasyon aracı
    └── src/
        ├── app.ts                # Express uygulaması (ana dosya)
        ├── index.ts              # Sunucu başlatma
        ├── config/
        │   ├── database.ts       # Prisma singleton & health check
        │   └── priceRules.ts     # Fiyat kuralları
        ├── controllers/          # İş mantığı (12 controller)
        │   ├── adController.ts   # İlan CRUD & arama
        │   ├── authController.ts # Kimlik doğrulama
        │   ├── categoryController.ts # Kategori/marka/model/varyant
        │   └── ...               # messaging, complaint, feedback vb.
        ├── middleware/
        │   ├── auth.ts           # JWT doğrulama & rol kontrolü
        │   ├── requireAdmin.ts   # Admin koruma katmanı
        │   ├── security.ts       # Rate limiting
        │   └── validation.ts     # Joi doğrulama şemaları
        ├── routes/               # API endpoint tanımları (18 route dosyası)
        ├── services/
        │   ├── emailService.ts   # SMTP e-posta servisi
        │   └── moderationService.ts
        ├── types/                # TypeScript tipleri
        └── utils/
            ├── enumMappings.ts   # Enum dönüşümleri
            └── watermark.ts      # Filigran sistemi
```

---

## 🚀 Kurulum

### Gereksinimler

| Gereksinim | Minimum Versiyon |
|------------|-----------------|
| Node.js | 18.0+ (önerilen: 20 LTS) |
| npm | 9.0+ |
| PostgreSQL | 14+ |
| Git | 2.0+ |

### Hızlı Kurulum (Windows)

```bash
# 1. Depoyu klonlayın
git clone <repo-url>
cd TrucksBusV2-Share

# 2. Otomatik kurulum (tüm bağımlılıklar + veritabanı)
SETUP.bat

# 3. Geliştirme sunucularını başlatın
START.bat
```

### Manuel Kurulum

```bash
# 1. Tüm bağımlılıkları yükleyin (root, client, server)
npm install

# 2. PostgreSQL veritabanı oluşturun
# PostgreSQL'de "trucksbus" adında bir veritabanı oluşturun

# 3. Ortam değişkenlerini ayarlayın
# server/.env dosyası oluşturun (aşağıdaki "Ortam Değişkenleri" bölümüne bakınız)

# 4. Veritabanı şemasını uygulayın ve seed verilerini yükleyin
cd server
npx prisma db push
npx ts-node prisma/seed.ts

# 5. Geliştirme sunucularını başlatın
cd ..
npm run dev
```

### Kurulum Sonrası

Uygulama başarıyla çalıştığında:

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:5173 veya http://localhost:5174 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |
| Prisma Studio | http://localhost:5555 (`npm run db:studio`) |

---

## 💻 Geliştirme

### Sunucuları Başlatma

```bash
# Her iki sunucuyu aynı anda başlat
npm run dev

# Sadece frontend
cd client && npm run dev

# Sadece backend
cd server && npm run dev
```

### Kod Kalitesi

```bash
# Lint kontrolü
npm run lint

# Lint + Build + Commit (güvenli commit)
npm run safe-commit

# Tam CI akışı (lint + build + push)
npm run safe-push
```

### Build

```bash
# Her iki projeyi birlikte build et
npm run build

# Sadece frontend
npm run build:client

# Sadece backend  
npm run build:server

# Bundle analizi (frontend)
cd client && npm run build:analyze
```

### Path Alias'ları (Frontend)

TypeScript path alias yapılandırması ile temiz import'lar:

```typescript
import { useAuth } from '@/hooks/redux';
import { AdCard } from '@/components/ads/AdCard';
import { adsApi } from '@/api/ads';
import { RootState } from '@/store';
```

| Alias | Hedef |
|-------|-------|
| `@/*` | `src/*` |
| `@/components/*` | `src/components/*` |
| `@/pages/*` | `src/pages/*` |
| `@/hooks/*` | `src/hooks/*` |
| `@/utils/*` | `src/utils/*` |
| `@/api/*` | `src/api/*` |
| `@/store/*` | `src/store/*` |
| `@/types/*` | `src/types/*` |

---

## 🗄 Veritabanı

### Şema Genel Bakış

Proje **PostgreSQL** veritabanı kullanır ve **Prisma ORM** ile yönetilir.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │────▶│      Ad      │────▶│   AdImage    │
│              │     │              │     │   AdVideo    │
│  - email     │     │  - title     │     └──────────────┘
│  - role      │     │  - price     │
│  - company   │     │  - status    │     ┌──────────────┐
└──────┬───────┘     │  - location  │────▶│  Category    │
       │             └──────┬───────┘     │  Brand       │
       │                    │             │  Model       │
       ▼                    │             │  Variant     │
┌──────────────┐            │             └──────────────┘
│ Subscription │            │
│ UserDoping   │            ▼
└──────────────┘     ┌──────────────┐
                     │  PendingAd   │
┌──────────────┐     │  Favorite    │
│   Message    │     │  Complaint   │
│   Feedback   │     └──────────────┘
│ Notification │
│  AdminLog    │     ┌──────────────┐
└──────────────┘     │    City      │
                     │  District    │
┌──────────────┐     └──────────────┘
│ SiteSettings │
│DopingPackage │
└──────────────┘
```

### Temel Modeller

| Model | Açıklama |
|-------|----------|
| **User** | Kullanıcı hesapları (bireysel, kurumsal, admin, moderatör) |
| **Ad** | Araç ilanları (fiyat, konum, detaylar, durum, görseller) |
| **AdImage / AdVideo** | İlan görselleri ve video demoları |
| **Category** | 9 araç kategorisi |
| **Brand / Model / Variant** | Marka > Model > Varyant hiyerarşisi |
| **AdFormField** | Kategori bazlı dinamik form alanları |
| **Subscription** | Abonelik paketleri (3 kademe) |
| **DopingPackage / UserDoping** | Premium öne çıkarma özellikleri |
| **Message** | Kullanıcılar arası mesajlaşma |
| **Favorite** | Favori ilanlar |
| **Complaint** | İlan şikayetleri |
| **Feedback** | Kullanıcı geri bildirimleri |
| **Notification** | Bildirim sistemi |
| **AdminLog** | Admin işlem denetim kaydı |
| **City / District** | Türkiye il/ilçe veritabanı |
| **SiteSettings** | Site ayarları (logo, renkler, slogan, bakım modu) |
| **PendingAd** | Admin onay süreci |

### Enum'lar

```
UserRole         : GUEST | USER | CORPORATE | ADMIN | MODERATOR
AdStatus         : PENDING | APPROVED | REJECTED | SOLD | EXPIRED
VehicleCondition : NEW | USED | IMPORTED | DAMAGED
FuelType         : GASOLINE | DIESEL | ELECTRIC | HYBRID | LPG varyantları
TransmissionType : MANUAL | AUTOMATIC | SEMI_AUTOMATIC
DriveType        : FRONT | REAR | ALL_WHEEL_DRIVE | REAR_WHEEL_ELECTRONIC
ComplaintStatus  : OPEN | IN_REVIEW | RESOLVED | CLOSED
FeedbackStatus   : OPEN | REVIEWED | RESPONDED | PENDING | APPROVED | REJECTED
```

### Veritabanı Komutları

```bash
cd server

# Şemayı veritabanına uygula
npx prisma db push

# Seed verilerini yükle (kategoriler, markalar, modeller, şehirler)
npx ts-node prisma/seed.ts

# Prisma Client'ı yeniden oluştur
npx prisma generate

# Migration oluştur
npx prisma migrate dev --name <migration-adi>

# Görsel veritabanı editörü
npx prisma studio

# Veritabanını sıfırla ve yeniden seed'le
npm run db:reset:local
```

---

## 🔌 API Yapısı

Tüm API endpoint'leri `/api` prefix'i altındadır.

### Endpoint Haritası

| Endpoint | Metod | Açıklama | Auth |
|----------|-------|----------|------|
| `/api/auth/register` | POST | Kullanıcı kaydı | - |
| `/api/auth/login` | POST | Giriş yapma | - |
| `/api/auth/refresh` | POST | Token yenileme | Refresh |
| `/api/auth/forgot-password` | POST | Şifre sıfırlama e-postası | - |
| `/api/categories` | GET | Kategori listesi | - |
| `/api/brands` | GET | Marka listesi | - |
| `/api/models` | GET | Model listesi | - |
| `/api/variants` | GET | Varyant listesi | - |
| `/api/ads` | GET | İlan arama & filtreleme | - |
| `/api/ads/:id` | GET | İlan detayı | - |
| `/api/ads` | POST | İlan oluşturma | JWT |
| `/api/ads/:id` | PUT | İlan güncelleme | JWT |
| `/api/ads/:id` | DELETE | İlan silme | JWT |
| `/api/favorites` | GET | Favori listesi | JWT |
| `/api/favorites` | POST | Favorilere ekle | JWT |
| `/api/favorites/:adId` | DELETE | Favorilerden çıkar | JWT |
| `/api/messages` | GET | Konuşmalar | JWT |
| `/api/messages` | POST | Mesaj gönder | JWT |
| `/api/notifications` | GET | Bildirimler | JWT |
| `/api/complaints` | POST | İlan şikayeti | JWT |
| `/api/feedback` | POST | Geri bildirim | JWT |
| `/api/doping` | GET | Doping paketleri | - |
| `/api/subscriptions` | GET | Abonelik paketleri | - |
| `/api/cities` | GET | İl listesi | - |
| `/api/cities/:id/districts` | GET | İlçe listesi | - |
| `/api/settings` | GET | Site ayarları | - |
| `/api/admin/logs` | GET | Admin işlem kayıtları | Admin |
| `/health` | GET | Sunucu sağlık kontrolü | - |

### HTTP İstemcisi (Frontend)

Frontend'de Axios interceptor'ları ile otomatik token yönetimi:

```
İstek → [Axios Instance] → Authorization: Bearer <accessToken> eklenir → Sunucu
                                                                            │
401 Unauthorized? ── Evet → refreshToken ile yeni token al → İsteği tekrarla
                  └─ Hayır → Yanıtı döndür
```

---

## 🔐 Kimlik Doğrulama & Güvenlik

### Kimlik Doğrulama Akışı

```
1. Kayıt     → bcryptjs (12 round) ile şifre hash'lenir → DB'ye kaydedilir
2. Giriş     → Şifre doğrulanır → JWT token çifti oluşturulur
3. Access    → 15 dakika geçerlilik (JWT_SECRET_ACCESS)
4. Refresh   → 7 gün geçerlilik (JWT_SECRET_REFRESH)
5. Saklama   → localStorage (accessToken, refreshToken, user)
6. Yenileme  → 401 yanıtında Axios interceptor otomatik refresh yapar
```

### Rol Tabanlı Erişim Kontrolü

| Rol | Yetkiler |
|-----|----------|
| **GUEST** | Sadece görüntüleme |
| **USER** | İlan oluşturma, mesajlaşma, favoriler |
| **CORPORATE** | USER + kurumsal mağaza sayfası |
| **MODERATOR** | USER + ilan moderasyonu |
| **ADMIN** | Tam yetki: kullanıcı yönetimi, site ayarları, moderasyon |

### Güvenlik Katmanları

| Katman | Detay |
|--------|-------|
| **Şifre Politikası** | Min 8 karakter: büyük + küçük harf + rakam + özel karakter |
| **Hesap Kilitleme** | 5 başarısız giriş → 30 dakika kilitleme |
| **Rate Limiting** | Genel: 1000/15dk, Auth: 50/15dk, Şifre sıfırlama: 3/saat |
| **HTTP Güvenlik** | Helmet başlıkları, CORS whitelist, HPP koruması |
| **Veri Sanitizasyonu** | XSS-clean, MongoDB injection koruması, Joi doğrulama |
| **Admin Denetimi** | Tüm admin işlemleri IP ve user-agent ile loglanır |
| **KVKK Uyumu** | Kayıt sırasında KVKK onayı + zaman damgası |

---

## 🚛 Araç Kategorileri

Platform 9 ana ticari araç kategorisini destekler, her biri özelleştirilmiş form alanlarına sahiptir:

| # | Kategori | Marka | Model | Varyant | Form Varyantları |
|---|----------|-------|-------|---------|------------------|
| 1 | **Çekici** | 22 | 74 | 445 | Standart çekici formu |
| 2 | **Dorse** | 10 | 10 | 29 | Tenteli, Frigofirik, Damperli (4 alt tip), Lowbed, Silobas, Tanker, Kuruyük, Konteyner, Tekstil, Özel Amaçlı |
| 3 | **Kamyon & Kamyonet** | 73 | 248 | 1.061 | Standart kamyon formu |
| 4 | **Karoser & Üst Yapı** | 2 | 7 | 7 | Karoser üst yapı formu |
| 5 | **Minibüs & Midibüs** | 25 | 88 | 381 | Standart minibüs formu |
| 6 | **Otobüs** | 26 | 88 | 249 | Standart otobüs formu |
| 7 | **Oto Kurtarıcı & Taşıyıcı** | 2 | 2 | 2 | Kurtarıcı/taşıyıcı formu |
| 8 | **Römork** | 4 | 14 | 14 | Kamyon römork, tarım (açık/kapalı kasa), taşıma, özel amaçlı römork formları |
| 9 | **Minivan & Panelvan** | 34 | 138 | 1.019 | Minivan/panelvan formu |

### Desteklenen Markalar

Platform **198 aktif ticari araç markasını** destekler:

- **Ağır Ticari (Çekici & Kamyon):** Mercedes-Benz, Volvo, MAN, Scania, DAF, Iveco, Renault Trucks, Ford Trucks, BMC, Kenworth, Peterbilt...
- **Otobüs & Minibüs:** Temsa, Otokar, Karsan, Neoplan, Setra, Irizar, Van Hool...
- **Hafif Ticari (Minivan & Panelvan):** Fiat, Peugeot, Citroën, Dacia, Hyundai, Kia, Opel, Chevrolet...
- **Dorse/Römork:** Krone, Schmitz Cargobull, Tırsan, Schwarzmüller, Wielton...

Her marka için logo görselli ayrıntılı veritabanı mevcuttur (`public/BrandsImage/`).

### Veritabanı Hiyerarşisi

```
Kategori (9) → Marka (198) → Model (669) → Varyant (3.207)
     │              │              │              │
  Çekici       Mercedes       Actros         1845 LS
  Dorse        Tırsan         Tenteli        Mega
  Minivan      Fiat           Doblo          1.6 Multijet
```

---

## ✨ Özellikler

### Kullanıcı Özellikleri
- ✅ E-posta ile kullanıcı kaydı ve giriş
- ✅ Bireysel ve kurumsal hesap türleri
- ✅ Profil yönetimi (resim, bilgiler, firma detayları)
- ✅ İlan oluşturma, düzenleme, silme
- ✅ Çoklu görsel ve video yükleme (sıkıştırma + filigran)
- ✅ GPS konum seçici (Google Maps entegrasyonu)
- ✅ Gelişmiş arama ve filtreleme (fiyat, yıl, km, konum, marka, model...)
- ✅ Favorilere ilan ekleme/çıkarma
- ✅ Gerçek zamanlı mesajlaşma
- ✅ Bildirim sistemi
- ✅ İlan şikayet mekanizması
- ✅ Geri bildirim sistemi
- ✅ Şifre sıfırlama (e-posta ile)
- ✅ Kurumsal mağaza sayfası (Dükkanım)

### Admin Özellikleri
- ✅ İlan onaylama / reddetme (moderasyon paneli)
- ✅ Kullanıcı yönetimi (aktif/pasif, rol değiştirme)
- ✅ Site ayarları (logo, slogan, renkler, sosyal medya linkleri)
- ✅ Bakım modu açma/kapatma
- ✅ Şikayet & geri bildirim yönetimi
- ✅ Doping paketi yönetimi
- ✅ İstatistik & analitik dashboard
- ✅ Admin işlem denetim kayıtları
- ✅ Tüm ilanları görüntüleme & filtreleme

### Teknik Özellikler
- ✅ Progressive Web App (PWA) desteği
- ✅ Service Worker ile offline erişim
- ✅ Lazy loading ile optimize sayfa yükleme
- ✅ Error boundary ile hata yakalama
- ✅ Web Vitals performans izleme
- ✅ Responsive (mobil uyumlu) tasarım
- ✅ Redux persist ile offline UX
- ✅ Chunk error handling (dinamik import hataları)

---

## 🌐 Çoklu Dil Desteği (i18n)

Platform **5 dili** destekler. i18next kütüphanesi ile tüm arayüz metinleri çevrilebilir yapıdadır.

| Dil | Kod | Durum |
|-----|-----|-------|
| 🇹🇷 Türkçe | `tr` | Varsayılan |
| 🇬🇧 İngilizce | `en` | Aktif |
| 🇩🇪 Almanca | `de` | Aktif |
| 🇷🇺 Rusça | `ru` | Aktif |
| 🇨🇳 Çince | `zh` | Aktif |

**Yapılandırma:**
- Tarayıcı dili otomatik algılama
- localStorage'da dil tercihi saklama
- Desteklenmeyen dilde Türkçe'ye fallback
- Dil dosyaları: `client/src/i18n/locales/<kod>.json`

---

## 💎 Abonelik Sistemi

3 kademeli abonelik sistemi ile kullanıcılar farklı ilan kotalarına sahip olur:

| Paket | İlan Limiti | Açıklama |
|-------|------------|----------|
| **Trucks** | 3 ilan | Temel paket |
| **Trucks Plus** | 5 ilan | Orta paket |
| **TrucksBus** | 10 ilan | Premium paket |

### Doping (Premium Öne Çıkarma)

Admin tarafından yönetilen doping paketleri ile ilanlar öne çıkarılabilir:
- Paket bazlı süre ve fiyatlandırma
- Aktif/pasif durumu takibi
- Kullanıcı başına benzersiz paket kısıtlaması

---

## 🛡 Admin Paneli

Admin paneli aşağıdaki sayfaları içerir:

| Sayfa | Açıklama |
|-------|----------|
| **Dashboard** | Genel istatistikler ve özet bilgiler |
| **Bekleyen İlanlar** | Onay/red bekleyen ilanlar |
| **Tüm İlanlar** | Filtreleme ve yönetim |
| **Moderasyon Paneli** | İlan inceleme & düzenleme |
| **Kullanıcılar** | Kullanıcı listesi ve yönetimi |
| **Şikayet Yönetimi** | Şikayet inceleme ve yanıtlama |
| **Geri Bildirim Yönetimi** | Kullanıcı geri bildirimleri |
| **Anasayfa Yönetimi** | Site ayarları (logo, slogan, renkler) |
| **İşlem Kayıtları** | Admin denetim logları |

---

## 💬 Gerçek Zamanlı Mesajlaşma

**Socket.io** tabanlı gerçek zamanlı mesajlaşma sistemi:

```
Kullanıcı A          Socket.io Server          Kullanıcı B
    │                       │                       │
    │── mesaj gönder ──────▶│                       │
    │                       │──── anlık iletim ────▶│
    │                       │                       │
    │◀── okundu bilgisi ───│◀── mesaj okundu ──────│
```

**Özellikler:**
- İlan bazlı konuşma başlatma
- Okundu/okunmadı durumu
- Otomatik yeniden bağlanma
- Okunmamış mesaj sayacı
- Oda (room) bazlı mesaj yönetimi

---

## 📱 PWA Desteği

Platform Progressive Web App olarak çalışabilir:

- **Service Worker:** Offline erişim ve cache yönetimi
- **Web App Manifest:** Ana ekrana ekleme desteği
- **Offline Sayfası:** Çevrimdışı durumda özel sayfa
- **Cache Stratejisi:** Statik dosyalar ve API yanıtları önbelleğe alınır
- **Install Prompt:** Kullanıcıya yükleme önerisi

---

## 🚢 Deployment

### Railway (Production)

Proje **Railway** üzerinde deploy edilmek üzere yapılandırılmıştır.

```bash
# nixpacks.toml ile otomatik build
# 1. npm install (root + workspaces)
# 2. Prisma generate
# 3. npm run build (client + server)
# 4. npm run start:prod (server başlatma + DB migrate + seed)
```

### Docker

```bash
# Docker imajı oluştur
docker build -t trucksbus .

# Çalıştır
docker run -p 5000:5000 --env-file .env trucksbus
```

### Production URL'ler

| Servis | URL |
|--------|-----|
| Frontend | https://trucksbus.com.tr |
| API | https://trucksbus-production.up.railway.app/api |

---

## 🔧 Ortam Değişkenleri

### Geliştirme (server/.env)

```env
# Veritabanı
DATABASE_URL=postgresql://postgres:12345@localhost:5432/trucksbus

# JWT Anahtarları
JWT_SECRET_ACCESS=dev-secret-access-key
JWT_SECRET_REFRESH=dev-secret-refresh-key

# Sunucu
PORT=5000
NODE_ENV=development

# E-posta (geliştirmede devre dışı bırakılabilir)
DISABLE_EMAIL=true

# Frontend URL (CORS için)
FRONTEND_URL=http://localhost:5173
```

### Geliştirme (client/.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_MAINTENANCE_MODE=false
```

### Production (Railway)

```env
# Veritabanı (Railway tarafından otomatik sağlanır)
DATABASE_URL=postgresql://...

# JWT Anahtarları (güçlü, benzersiz değerler kullanın)
JWT_SECRET_ACCESS=<güçlü-rastgele-anahtar>
JWT_SECRET_REFRESH=<güçlü-rastgele-anahtar>

# Sunucu
PORT=5000
NODE_ENV=production

# E-posta (Gmail App Password)
EMAIL_USER=trucksbus@gmail.com
EMAIL_PASSWORD=<16-haneli-uygulama-sifresi>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=noreply@trucksbus.com.tr

# Frontend
FRONTEND_URL=https://trucksbus.com.tr
VITE_API_URL=https://trucksbus-production.up.railway.app/api
```

---

## 📜 Komut Referansı

### Root Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Client + Server paralel başlat |
| `npm run build` | Her iki projeyi build et |
| `npm run lint` | Lint kontrolü |
| `npm run reset-db` | Veritabanı sıfırla + seed |
| `npm run safe-commit` | Lint + Build + Git commit |
| `npm run safe-push` | Tam CI + Git push |
| `npm run save-state` | Yedek + oto-commit |
| `npm run guard` | Kod koruma script'i |

### Client Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript check + Vite build |
| `npm run build:analyze` | Bundle boyut analizi |
| `npm run preview` | Build çıktısını önizle |
| `npm run lint` | ESLint kontrolü |

### Server Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Nodemon + ts-node (geliştirme) |
| `npm run build` | TypeScript derleme |
| `npm run start` | Production modda başlat |
| `npm run start:prod` | DB migrate + seed + başlat |
| `npm run db:generate` | Prisma Client oluştur |
| `npm run db:push` | Şemayı DB'ye uygula |
| `npm run db:migrate` | Migration oluştur |
| `npm run db:studio` | Prisma görsel editör |
| `npm run db:reset:local` | DB sıfırla + seed |

---

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`npm run safe-commit`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

### Geliştirme Kuralları
- TypeScript strict mode aktif
- Tüm API endpoint'leri için doğrulama middleware'i kullanın
- Yeni route'lar için rate limiting ekleyin
- Admin işlemlerini loglamayı unutmayın
- Çoklu dil desteği için tüm metinleri i18n dosyalarına ekleyin

---

## 📄 Ek Dökümanlar

| Döküman | Açıklama |
|---------|----------|
| [KURULUM.md](KURULUM.md) | Detaylı kurulum kılavuzu (Türkçe) |
| [PROJECT_BLUEPRINT.md](PROJECT_BLUEPRINT.md) | Proje planı ve özellik listesi |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Mevcut geliştirme durumu |
| [MAINTENANCE_GUIDE.md](MAINTENANCE_GUIDE.md) | Bakım modu kılavuzu |
| [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) | E-posta yapılandırma |
| [SUBSCRIPTION_DEPLOYMENT.md](SUBSCRIPTION_DEPLOYMENT.md) | Abonelik sistemi dökümantasyonu |
| [RECOVERY_GUIDE.md](RECOVERY_GUIDE.md) | Kurtarma kılavuzu |

---

<div align="center">

**TrucksBus** &copy; 2025-2026 - Ticari Araç İlan Platformu

</div>
