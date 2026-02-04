# 🚀 Araç İlan Platformu - Proje Blueprint (Sıfırdan Kurulum Rehberi)

Bu döküman, TrucksBus benzeri bir ticari araç ilan platformunu sıfırdan kurma rehberidir.
Database yapısı mevcut olduğu varsayılarak, tüm frontend ve backend geliştirme adımlarını içerir.

---

## 📋 İÇİNDEKİLER

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Teknoloji Stack](#2-teknoloji-stack)
3. [Proje Yapısı](#3-proje-yapısı)
4. [Veritabanı Modelleri](#4-veritabanı-modelleri)
5. [Backend Geliştirme Planı](#5-backend-geliştirme-planı)
6. [Frontend Geliştirme Planı](#6-frontend-geliştirme-planı)
7. [Özellik Geliştirme Sırası](#7-özellik-geliştirme-sırası)
8. [Güvenlik Önlemleri](#8-güvenlik-önlemleri)
9. [Deployment Checklist](#9-deployment-checklist)

---

## 1. Proje Genel Bakış

### 🎯 Proje Amacı
Ticari araçların (kamyon, otobüs, çekici, dorse vb.) ilan edildiği, alınıp satıldığı modern bir marketplace platformu.

### 👥 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Guest (Misafir)** | İlanları görüntüleme, arama yapma |
| **User (Bireysel)** | İlan oluşturma, mesajlaşma, favori ekleme |
| **Corporate (Kurumsal)** | Toplu ilan, mağaza sayfası, özel özellikler |
| **Moderator** | İlan onaylama, şikayet yönetimi |
| **Admin** | Tüm sistem erişimi, kullanıcı yönetimi |

### 📦 Ana Özellikler
- ✅ Çoklu kategori ilan sistemi (8 kategori)
- ✅ Dinamik form oluşturma (kategoriye göre)
- ✅ Admin onay workflow'u
- ✅ Real-time mesajlaşma (Socket.io)
- ✅ Kurumsal mağaza sayfaları
- ✅ Gelişmiş arama ve filtreleme
- ✅ Doping (öne çıkarma) sistemi
- ✅ Abonelik paketi sistemi
- ✅ Şikayet ve geri bildirim yönetimi
- ✅ Çoklu dil desteği (i18n)
- ✅ PWA desteği

---

## 2. Teknoloji Stack

### Frontend
```
React 19 + TypeScript
├── Build Tool: Vite 7
├── State Management: Redux Toolkit + Redux Persist
├── API Calls: TanStack React Query + Axios
├── UI Library: Material-UI (MUI) 7
├── Styling: Tailwind CSS 4
├── Forms: React Hook Form + Yup validation
├── Routing: React Router DOM 7
├── i18n: i18next + react-i18next
├── Charts: Recharts
├── Real-time: Socket.io-client
└── PWA: Custom Service Worker
```

### Backend
```
Node.js + Express 5 + TypeScript
├── ORM: Prisma 6
├── Database: PostgreSQL
├── Auth: JWT (jsonwebtoken)
├── Password: bcryptjs
├── Validation: Joi + express-validator
├── File Upload: Multer
├── Email: Nodemailer
├── Real-time: Socket.io
└── Security: helmet, cors, hpp, rate-limit, xss-clean
```

### Infrastructure
```
├── Containerization: Docker
├── Reverse Proxy: Nginx
├── Cloud: Railway / Vercel / AWS
├── Image Storage: Cloudinary / AWS S3
└── CI/CD: GitHub Actions
```

---

## 3. Proje Yapısı

### Monorepo Yapısı
```
project-root/
├── package.json              # Root package (workspaces)
├── client/                   # Frontend (React)
├── server/                   # Backend (Express)
├── docker-compose.yml        # Development
├── Dockerfile               # Production
└── docs/                    # Documentation
```

### Client Klasör Yapısı
```
client/
├── public/
│   ├── BrandsImage/         # Marka logoları
│   ├── CategoryImage/       # Kategori görselleri
│   ├── manifest.json        # PWA manifest
│   └── sw.js               # Service Worker
├── src/
│   ├── admin/              # Admin paneli
│   │   ├── components/     # Admin bileşenleri
│   │   └── pages/          # Admin sayfaları
│   ├── api/                # API client modülleri
│   │   ├── client.ts       # Axios instance
│   │   ├── ads.ts          # İlan API'leri
│   │   ├── auth.ts         # Auth API'leri
│   │   ├── messaging.ts    # Mesaj API'leri
│   │   └── ...
│   ├── components/         # Paylaşılan bileşenler
│   │   ├── ads/           # İlan bileşenleri
│   │   ├── auth/          # Auth bileşenleri
│   │   ├── common/        # Ortak bileşenler
│   │   ├── forms/         # Form bileşenleri
│   │   ├── layout/        # Layout bileşenleri
│   │   ├── maps/          # Harita bileşenleri
│   │   ├── messaging/     # Mesaj bileşenleri
│   │   ├── modals/        # Modal bileşenleri
│   │   ├── pwa/           # PWA bileşenleri
│   │   ├── search/        # Arama bileşenleri
│   │   └── subscription/  # Abonelik bileşenleri
│   ├── constants/          # Sabit değerler
│   ├── hooks/              # Custom hooks
│   ├── i18n/               # Çeviri dosyaları
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── tr.json
│   │       └── en.json
│   ├── pages/              # Sayfa bileşenleri
│   ├── routes/             # Route tanımları
│   ├── services/           # Servis modülleri
│   ├── store/              # Redux store
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   └── messagingSlice.ts
│   └── utils/              # Yardımcı fonksiyonlar
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Server Klasör Yapısı
```
server/
├── prisma/
│   ├── schema.prisma       # Database şeması
│   └── seed.ts            # Seed verileri
├── src/
│   ├── config/            # Yapılandırma
│   ├── controllers/       # Route controller'ları
│   │   ├── adController.ts
│   │   ├── authController.ts
│   │   ├── categoryController.ts
│   │   ├── complaintController.ts
│   │   ├── dopingController.ts
│   │   ├── favoriteController.ts
│   │   ├── feedbackController.ts
│   │   ├── locationController.ts
│   │   ├── messaging.ts
│   │   ├── notificationController.ts
│   │   └── subscriptionController.ts
│   ├── middleware/        # Express middleware'leri
│   │   ├── auth.ts        # JWT doğrulama
│   │   ├── requireAdmin.ts
│   │   ├── security.ts    # Güvenlik middleware'leri
│   │   └── validation.ts  # Input validation
│   ├── routes/            # API route tanımları
│   │   ├── index.ts
│   │   ├── ads.ts
│   │   ├── auth.ts
│   │   ├── brands.ts
│   │   ├── categories.ts
│   │   ├── cities.ts
│   │   ├── complaint.ts
│   │   ├── doping.ts
│   │   ├── favorites.ts
│   │   ├── feedback.ts
│   │   ├── messaging.ts
│   │   ├── models.ts
│   │   ├── notifications.ts
│   │   └── subscriptionRoutes.ts
│   ├── services/          # Business logic
│   │   └── emailService.ts
│   ├── types/             # TypeScript tipleri
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── app.ts             # Express app
│   └── index.ts           # Entry point
├── package.json
└── tsconfig.json
```

---

## 4. Veritabanı Modelleri

### Ana Modeller (Prisma Schema)

#### User (Kullanıcı)
```prisma
model User {
  id               Int            @id @default(autoincrement())
  email            String         @unique
  passwordHash     String
  firstName        String?
  lastName         String?
  phone            String?
  role             UserRole       @default(USER)  // GUEST, USER, CORPORATE, ADMIN, MODERATOR
  isVerified       Boolean        @default(false)
  isActive         Boolean        @default(true)
  
  // Kurumsal bilgiler
  companyName      String?
  taxId            String?
  tradeRegistryNo  String?
  
  // Adres bilgileri
  address          String?
  city             String?
  country          String?
  
  profileImageUrl  String?
  kvkkAccepted     Boolean        @default(false)
  kvkkAcceptedAt   DateTime?
  lastLoginAt      DateTime?
  userType         String?        @default("individual")  // individual, corporate
  
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  
  // İlişkiler
  ads              Ad[]
  favorites        Favorite[]
  sentMessages     Message[]      @relation("SentMessages")
  receivedMessages Message[]      @relation("ReceivedMessages")
  notifications    Notification[]
  complaints       Complaint[]
  feedback         Feedback[]
  subscriptions    Subscription[]
  userDopings      UserDoping[]
  adminLogs        AdminLog[]
}
```

#### Category (Kategori)
```prisma
model Category {
  id           Int             @id @default(autoincrement())
  name         String
  slug         String          @unique
  iconUrl      String?
  displayOrder Int
  isActive     Boolean         @default(true)
  description  String?
  
  // İlişkiler
  ads          Ad[]
  brands       CategoryBrand[]
  models       Model[]
  formFields   AdFormField[]
}
```

#### Brand (Marka)
```prisma
model Brand {
  id         Int             @id @default(autoincrement())
  name       String
  slug       String          @unique
  logoUrl    String?
  isActive   Boolean         @default(true)
  
  // İlişkiler
  ads        Ad[]
  categories CategoryBrand[]
  models     Model[]
}
```

#### Model (Model)
```prisma
model Model {
  id         Int       @id @default(autoincrement())
  brandId    Int
  categoryId Int
  name       String
  slug       String
  isActive   Boolean   @default(true)
  
  // İlişkiler
  brand      Brand
  category   Category
  variants   Variant[]
  ads        Ad[]
}
```

#### Ad (İlan)
```prisma
model Ad {
  id                 Int               @id @default(autoincrement())
  userId             Int
  categoryId         Int
  brandId            Int?
  modelId            Int?
  variantId          Int?
  
  // Temel bilgiler
  title              String
  description        String?
  price              Decimal?
  year               Int?
  mileage            Int?
  
  // Konum
  location           String?
  cityId             Int?
  districtId         Int?
  latitude           Float?
  longitude          Float?
  address            String?
  
  // Durum
  status             AdStatus          @default(PENDING)  // PENDING, APPROVED, REJECTED, SOLD, EXPIRED
  viewCount          Int               @default(0)
  
  // Doping
  isPromoted         Boolean           @default(false)
  promotedUntil      DateTime?
  
  // Araç özellikleri
  vehicleCondition   VehicleCondition?  // NEW, USED, IMPORTED, DAMAGED
  fuelType           FuelType?
  transmissionType   TransmissionType?
  driveType          DriveType?
  color              String?
  engineCapacity     String?
  chassisType        ChassisType?
  roofType           RoofType?
  plateType          PlateType?
  seatCount          String?
  isExchangeable     Boolean?
  hasAccidentRecord  Boolean?
  hasTramerRecord    Boolean?
  
  // Özel alanlar (JSON)
  customFields       Json?
  detailFeatures     Json?
  
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  
  // İlişkiler
  user               User
  category           Category
  brand              Brand?
  model              Model?
  city               City?
  district           District?
  images             AdImage[]
  videos             AdVideo[]
  favorites          Favorite[]
  messages           Message[]
  complaints         Complaint[]
  pendingAd          PendingAd?
}
```

#### Subscription (Abonelik)
```prisma
model Subscription {
  id             Int      @id @default(autoincrement())
  userId         Int
  packageType    String   // "trucks", "trucks_plus", "trucksbus"
  adLimit        Int      // 3, 5, 10
  adsUsed        Int      @default(0)
  price          Float
  isActive       Boolean  @default(true)
  startDate      DateTime @default(now())
  endDate        DateTime
  isTrial        Boolean  @default(true)  // İlk 3 ay ücretsiz
  
  user           User
}
```

#### Diğer Modeller
- **AdImage**: İlan görselleri
- **AdVideo**: İlan videoları
- **AdFormField**: Kategoriye özel dinamik form alanları
- **PendingAd**: Onay bekleyen ilanlar
- **Message**: Kullanıcı mesajları
- **Favorite**: Favori ilanlar
- **Complaint**: İlan şikayetleri
- **Feedback**: Genel geri bildirim
- **Notification**: Bildirimler
- **City/District**: Şehir/İlçe
- **DopingPackage/UserDoping**: Doping paketleri
- **AdminLog**: Admin işlem logları

---

## 5. Backend Geliştirme Planı

### Faz 1: Temel Altyapı (1-2 Gün)

#### 1.1 Proje Kurulumu
```bash
mkdir server && cd server
npm init -y
npm install express typescript ts-node @types/node @types/express
npm install -D nodemon
npx tsc --init
```

#### 1.2 Express App Yapısı
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
// ... diğer route'lar

export default app;
```

#### 1.3 Prisma Kurulumu
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
# schema.prisma'yı düzenle
npx prisma db push
npx prisma generate
```

### Faz 2: Authentication Sistemi (2-3 Gün)

#### 2.1 Auth Controller
```typescript
// controllers/authController.ts
- register()           # Yeni kullanıcı kaydı
- registerCorporate()  # Kurumsal kayıt
- login()              # Giriş
- logout()             # Çıkış
- getCurrentUser()     # Mevcut kullanıcı bilgisi
- updateProfile()      # Profil güncelleme
- changePassword()     # Şifre değiştirme
- forgotPassword()     # Şifre sıfırlama isteği
- resetPassword()      # Şifre sıfırlama
```

#### 2.2 Auth Middleware
```typescript
// middleware/auth.ts
- verifyToken()        # JWT doğrulama
- optionalAuth()       # Opsiyonel auth (guest access)
- requireRoles([])     # Rol kontrolü
```

#### 2.3 Auth Routes
```
POST   /api/auth/register
POST   /api/auth/register-corporate
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Faz 3: Kategori & Marka Sistemi (1 Gün)

#### 3.1 Category Endpoints
```
GET    /api/categories              # Tüm kategoriler
GET    /api/categories/:slug        # Tek kategori
GET    /api/categories/:id/brands   # Kategoriye ait markalar
GET    /api/categories/:id/form-fields  # Dinamik form alanları
```

#### 3.2 Brand & Model Endpoints
```
GET    /api/brands                  # Tüm markalar
GET    /api/brands/:id/models       # Markaya ait modeller
GET    /api/models/:id/variants     # Modele ait varyantlar
```

### Faz 4: İlan Sistemi (3-4 Gün)

#### 4.1 Ad Controller
```typescript
// controllers/adController.ts
- getAds()             # İlan listesi (filtreleme, sayfalama)
- getAdById()          # Tek ilan detayı
- createAd()           # Yeni ilan oluştur
- updateAd()           # İlan güncelle
- deleteAd()           # İlan sil
- uploadImages()       # Görsel yükleme
- uploadVideo()        # Video yükleme
- getMyAds()           # Kullanıcının ilanları
- getUserAds()         # Belirli kullanıcının ilanları
- incrementView()      # Görüntüleme sayacı
```

#### 4.2 Ad Routes
```
GET    /api/ads                     # Liste (query params ile filtre)
GET    /api/ads/:id                 # Detay
POST   /api/ads                     # Oluştur (auth gerekli)
PUT    /api/ads/:id                 # Güncelle (owner/admin)
DELETE /api/ads/:id                 # Sil (owner/admin)
POST   /api/ads/:id/images          # Görsel ekle
POST   /api/ads/:id/video           # Video ekle
GET    /api/ads/my                  # Kendi ilanlarım
GET    /api/ads/user/:userId        # Kullanıcının ilanları
POST   /api/ads/:id/view            # View sayacı
```

### Faz 5: Admin Paneli API (2-3 Gün)

#### 5.1 Admin Endpoints
```
# Onay Sistemi
GET    /api/admin/pending-ads       # Onay bekleyen ilanlar
PUT    /api/admin/ads/:id/approve   # Onayla
PUT    /api/admin/ads/:id/reject    # Reddet

# Kullanıcı Yönetimi
GET    /api/admin/users             # Kullanıcı listesi
PUT    /api/admin/users/:id         # Kullanıcı güncelle
PUT    /api/admin/users/:id/role    # Rol değiştir
PUT    /api/admin/users/:id/status  # Aktif/Pasif

# İstatistikler
GET    /api/admin/stats             # Dashboard istatistikleri
GET    /api/admin/logs              # Admin işlem logları
```

### Faz 6: Mesajlaşma Sistemi (2 Gün)

#### 6.1 Messaging Endpoints
```
GET    /api/messages/conversations  # Konuşma listesi
GET    /api/messages/:conversationId # Konuşma detayı
POST   /api/messages                # Mesaj gönder
PUT    /api/messages/:id/read       # Okundu işaretle
GET    /api/messages/unread-count   # Okunmamış sayısı
```

#### 6.2 Socket.io Entegrasyonu
```typescript
// Real-time mesajlaşma
io.on('connection', (socket) => {
  socket.on('join', (userId) => {...});
  socket.on('send_message', (data) => {...});
  socket.on('typing', (data) => {...});
});
```

### Faz 7: Ek Özellikler (2-3 Gün)

#### 7.1 Favoriler
```
GET    /api/favorites               # Favori listesi
POST   /api/favorites/:adId         # Favoriye ekle
DELETE /api/favorites/:adId         # Favoriden çıkar
```

#### 7.2 Şikayetler
```
GET    /api/complaints              # Şikayet listesi
POST   /api/complaints              # Şikayet oluştur
PUT    /api/complaints/:id          # Durum güncelle (admin)
```

#### 7.3 Bildirimler
```
GET    /api/notifications           # Bildirim listesi
PUT    /api/notifications/:id/read  # Okundu işaretle
PUT    /api/notifications/read-all  # Tümünü okundu işaretle
```

#### 7.4 Doping
```
GET    /api/doping/packages         # Paket listesi
POST   /api/doping/purchase         # Paket satın al
GET    /api/doping/my-packages      # Aktif paketlerim
```

#### 7.5 Abonelik
```
GET    /api/subscription/packages   # Abonelik paketleri
POST   /api/subscription/create     # Abonelik oluştur
GET    /api/subscription/my         # Mevcut aboneliğim
PUT    /api/subscription/cancel     # Abonelik iptal
```

---

## 6. Frontend Geliştirme Planı

### Faz 1: Proje Kurulumu (0.5 Gün)

```bash
npm create vite@latest client -- --template react-ts
cd client
npm install

# Core dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux redux-persist
npm install @tanstack/react-query axios
npm install react-router-dom
npm install react-hook-form yup @hookform/resolvers
npm install socket.io-client
npm install i18next react-i18next i18next-browser-languagedetector
npm install recharts date-fns

# Dev dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
```

### Faz 2: Temel Yapılandırma (1 Gün)

#### 2.1 Vite Config
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

#### 2.2 Redux Store
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

// store/authSlice.ts
- credentials (token, user)
- login/logout actions
- getCurrentUser thunk

// store/messagingSlice.ts
- unreadCount
- activeConversation
```

#### 2.3 API Client
```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptors
- Request: Token ekleme
- Response: 401 handling, refresh token
```

### Faz 3: Auth Modülü (2 Gün)

#### 3.1 Auth Bileşenleri
```
components/auth/
├── LoginNew.tsx           # Giriş formu
├── RegisterNew.tsx        # Bireysel kayıt
├── RegisterCorporate.tsx  # Kurumsal kayıt
├── ForgotPassword.tsx     # Şifre sıfırlama isteği
├── ResetPassword.tsx      # Şifre sıfırlama
└── ProtectedRoute.tsx     # Route guard
```

#### 3.2 Auth Sayfaları
```
pages/auth/
├── MembershipSelection.tsx  # Üyelik tipi seçimi
└── LoginSelection.tsx       # Giriş tipi seçimi
```

### Faz 4: Ana Sayfa & Layout (2 Gün)

#### 4.1 Layout Bileşenleri
```
components/layout/
├── Header.tsx             # Üst menü
├── Footer.tsx             # Alt bilgi
├── Sidebar.tsx            # Yan menü
├── MobileNav.tsx          # Mobil navigasyon
└── SearchBar.tsx          # Arama çubuğu
```

#### 4.2 Ana Sayfa
```
pages/MainLayout.tsx
├── Hero section
├── Kategori kartları
├── Öne çıkan ilanlar
├── Son ilanlar
└── İstatistikler
```

### Faz 5: İlan Modülü (3-4 Gün)

#### 5.1 İlan Listesi
```
components/ads/
├── AdCard.tsx             # İlan kartı
├── AdGrid.tsx             # İlan grid görünümü
├── AdList.tsx             # İlan liste görünümü
├── AdFilters.tsx          # Filtreleme paneli
├── AdSorting.tsx          # Sıralama
└── Pagination.tsx         # Sayfalama
```

#### 5.2 İlan Detay
```
pages/AdDetail.tsx
├── Görsel galerisi
├── Araç bilgileri
├── Satıcı bilgileri
├── Mesaj gönderme
├── Favoriye ekleme
├── Paylaşma
└── Benzer ilanlar
```

#### 5.3 İlan Oluşturma
```
components/forms/
├── CreateAdForm.tsx       # Ana form wrapper
├── CekiciAdForm.tsx       # Çekici formu
├── DorseAdForm.tsx        # Dorse formu
├── KamyonAdForm.tsx       # Kamyon formu
├── OtobusAdForm.tsx       # Otobüs formu
├── MinibusAdForm.tsx      # Minibüs formu
└── ... (her kategori için özel form)

# Alt form bileşenleri
├── ImageUploader.tsx      # Görsel yükleme
├── VideoUploader.tsx      # Video yükleme
├── LocationPicker.tsx     # Konum seçici
└── DynamicFormField.tsx   # Dinamik alan
```

### Faz 6: Arama & Filtreleme (2 Gün)

```
components/search/
├── AdvancedSearch.tsx     # Gelişmiş arama
├── CategoryFilter.tsx     # Kategori filtresi
├── BrandModelFilter.tsx   # Marka/Model filtresi
├── PriceRangeFilter.tsx   # Fiyat aralığı
├── LocationFilter.tsx     # Konum filtresi
├── YearFilter.tsx         # Yıl filtresi
└── SearchResults.tsx      # Arama sonuçları
```

### Faz 7: Mesajlaşma Modülü (2 Gün)

```
components/messaging/
├── ConversationList.tsx   # Konuşma listesi
├── MessageThread.tsx      # Mesaj akışı
├── MessageInput.tsx       # Mesaj girişi
├── MessageItem.tsx        # Tek mesaj
└── TypingIndicator.tsx    # Yazıyor göstergesi

pages/MessagesPage.tsx     # Ana mesaj sayfası
```

### Faz 8: Kullanıcı Sayfaları (2 Gün)

```
pages/
├── Profile.tsx            # Profil sayfası
├── MyAds.tsx              # İlanlarım
├── Bookmarks.tsx          # Favorilerim
├── Dukkanim.tsx           # Mağazam (kurumsal)
├── Doping.tsx             # Doping satın alma
└── Notifications.tsx      # Bildirimler
```

### Faz 9: Admin Paneli (3-4 Gün)

```
admin/
├── pages/
│   ├── AdminDashboard.tsx     # Dashboard
│   ├── PendingAds.tsx         # Onay bekleyenler
│   ├── AllAds.tsx             # Tüm ilanlar
│   ├── UsersPage.tsx          # Kullanıcılar
│   ├── ComplaintManagement.tsx # Şikayetler
│   ├── FeedbackManagement.tsx  # Geri bildirimler
│   └── AdminLogsPage.tsx      # Admin logları
└── components/
    ├── AdminLayout.tsx        # Admin layout
    ├── StatCard.tsx           # İstatistik kartı
    ├── DataTable.tsx          # Veri tablosu
    └── Charts/                # Grafikler
```

### Faz 10: Ek Özellikler (2 Gün)

#### 10.1 PWA
```
public/
├── manifest.json
├── sw.js                  # Service Worker
└── offline.html

components/pwa/
├── PWAInstall.tsx         # Kurulum prompt
└── PWAStatus.tsx          # PWA durumu
```

#### 10.2 i18n
```
i18n/
├── config.ts
└── locales/
    ├── tr.json            # Türkçe
    └── en.json            # İngilizce
```

#### 10.3 Ortak Bileşenler
```
components/common/
├── ErrorBoundary.tsx      # Hata yakalama
├── LoadingScreen.tsx      # Yükleniyor
├── SplashScreen.tsx       # Açılış ekranı
├── Modal.tsx              # Modal wrapper
├── ConfirmDialog.tsx      # Onay dialogu
├── Toast.tsx              # Bildirim toast
└── EmptyState.tsx         # Boş durum
```

---

## 7. Özellik Geliştirme Sırası

### Sprint 1: Temel Altyapı (1 Hafta)
```
✅ Backend proje kurulumu
✅ Frontend proje kurulumu
✅ Prisma & database bağlantısı
✅ Express app yapısı
✅ Redux store & persist
✅ API client (Axios + interceptors)
✅ Route yapısı
```

### Sprint 2: Authentication (1 Hafta)
```
✅ User model & migrations
✅ Register endpoint (bireysel + kurumsal)
✅ Login endpoint
✅ JWT middleware
✅ Auth slice (Redux)
✅ Login/Register forms
✅ Protected routes
✅ Profile sayfası
```

### Sprint 3: Kategori & Marka (0.5 Hafta)
```
✅ Category endpoints
✅ Brand/Model/Variant endpoints
✅ Kategori seçim UI
✅ Marka/Model cascading dropdown
```

### Sprint 4: İlan Sistemi (2 Hafta)
```
✅ Ad CRUD endpoints
✅ Image upload (Cloudinary/S3)
✅ İlan listesi sayfası
✅ İlan detay sayfası
✅ İlan oluşturma formları (8 kategori)
✅ Dinamik form alanları
✅ Filtreleme & sıralama
✅ Sayfalama
```

### Sprint 5: Admin Paneli (1 Hafta)
```
✅ Admin middleware
✅ Pending ads management
✅ User management
✅ Admin dashboard
✅ İstatistikler
```

### Sprint 6: Mesajlaşma (1 Hafta)
```
✅ Message endpoints
✅ Socket.io kurulumu
✅ Konuşma listesi
✅ Mesaj thread
✅ Real-time bildirimler
```

### Sprint 7: Ek Özellikler (1 Hafta)
```
✅ Favoriler
✅ Şikayetler
✅ Bildirimler
✅ Doping sistemi
✅ Abonelik sistemi
```

### Sprint 8: Polish & Deploy (1 Hafta)
```
✅ i18n
✅ PWA
✅ SEO optimizasyonu
✅ Performance optimizasyonu
✅ Error handling
✅ Testing
✅ Docker setup
✅ CI/CD
✅ Production deployment
```

---

## 8. Güvenlik Önlemleri

### Backend Güvenlik
```typescript
// middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

// Helmet - HTTP headers
app.use(helmet());

// CORS
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // request limit
});
app.use('/api', limiter);

// Auth rate limiting (daha sıkı)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5
});
app.use('/api/auth/login', authLimiter);

// XSS prevention
app.use(xss());

// HTTP Parameter Pollution
app.use(hpp());

// NoSQL Injection prevention
app.use(mongoSanitize());
```

### Input Validation
```typescript
// Joi veya express-validator kullanımı
import { body, validationResult } from 'express-validator';

const validateAd = [
  body('title').trim().isLength({ min: 5, max: 100 }),
  body('price').isNumeric().optional(),
  body('categoryId').isInt(),
  // ...
];
```

### JWT Best Practices
```typescript
// Token yapısı
{
  userId: number,
  role: string,
  iat: timestamp,
  exp: timestamp  // 24 saat
}

// Refresh token mekanizması
// HttpOnly cookie kullanımı
// Token blacklist (logout için)
```

### Frontend Güvenlik
```typescript
// XSS önleme
- dangerouslySetInnerHTML kullanmama
- Input sanitization

// CSRF
- CSRF token kullanımı

// Sensitive data
- Token'ı localStorage yerine memory'de tutma
- Redux persist encryption
```

---

## 9. Deployment Checklist

### Pre-deployment
```
□ Environment variables (.env) kontrolü
□ API URL'leri production'a güncelleme
□ Database migration/push
□ Seed data (production için)
□ SSL sertifikaları
□ Domain DNS ayarları
```

### Backend Deployment (Railway/Heroku)
```bash
# Railway
railway login
railway init
railway up

# Environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=https://yourdomain.com
CLOUDINARY_URL=...
SMTP_HOST=...
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Vercel
vercel login
vercel --prod

# Environment variables
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=wss://api.yourdomain.com
```

### Post-deployment
```
□ SSL çalışıyor mu?
□ API endpoints erişilebilir mi?
□ Auth flow çalışıyor mu?
□ File upload çalışıyor mu?
□ Socket.io bağlantısı kurulabiliyor mu?
□ Email gönderimi çalışıyor mu?
□ Performance testleri
□ Mobile responsive kontrol
□ SEO meta tags
□ Analytics kurulumu
```

### Monitoring
```
□ Error tracking (Sentry)
□ Logging (Winston/Pino)
□ Uptime monitoring (UptimeRobot)
□ Performance monitoring (New Relic)
□ Database backup otomasyonu
```

---

## 📁 Ek Dosyalar

### .env.example (Backend)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# SMTP
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

### .env.example (Frontend)
```env
VITE_API_URL="http://localhost:3000/api"
VITE_SOCKET_URL="http://localhost:3000"
VITE_GOOGLE_MAPS_API_KEY=""
VITE_MAINTENANCE_MODE="false"
```

---

## 🎯 Özet

Bu blueprint, aşağıdaki sürede tamamlanabilir:

| Faz | Süre |
|-----|------|
| Temel Altyapı | 1-2 gün |
| Authentication | 3-4 gün |
| Kategori & Marka | 1 gün |
| İlan Sistemi | 5-6 gün |
| Admin Paneli | 3-4 gün |
| Mesajlaşma | 2-3 gün |
| Ek Özellikler | 3-4 gün |
| Polish & Deploy | 2-3 gün |
| **TOPLAM** | **~3-4 Hafta** |

---

## 📌 Notlar

1. **Database Mevcut**: Bu rehber, Prisma schema'nın hazır olduğunu varsayar
2. **Modüler Geliştirme**: Her modülü bağımsız test edin
3. **Git Kullanımı**: Her feature için ayrı branch açın
4. **Code Review**: Her merge öncesi code review yapın
5. **Testing**: Unit test ve integration test yazın
6. **Documentation**: API dokümantasyonu (Swagger/OpenAPI) ekleyin

---

*Son güncelleme: Şubat 2026*
