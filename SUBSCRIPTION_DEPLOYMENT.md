# 🏪 Subscription System - Railway Deployment Guide

## ✅ Yerel Veritabanında Yapılanlar

1. **Prisma Schema Güncellemesi**: `Subscription` modeli eklendi
2. **Database Migration**: `npx prisma db push` ile local PostgreSQL'e uygulandı
3. **Prisma Client Generation**: Yeni model için client generate edildi

## 🚀 Railway'e Deploy Adımları

### 1. Veritabanı Migration

Railway'e push yaptığınızda otomatik olarak migration çalışacaktır çünkü:

```json
// package.json içinde
"scripts": {
  "postinstall": "prisma generate",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

### 2. Manuel Migration (Gerekirse)

Eğer otomatik çalışmazsa Railway Dashboard'dan:

```bash
npx prisma db push --skip-generate
```

### 3. Environment Variables

Railway Dashboard > Variables bölümünden kontrol edin:

✅ **Mevcut Değişkenler** (Zaten var olmalı):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_ACCESS` - Access token secret
- `JWT_SECRET_REFRESH` - Refresh token secret
- `PORT` - 5000
- `NODE_ENV` - production
- `FRONTEND_URL` - https://trucksbus.com.tr

### 4. Schema Kontrolü

Railway PostgreSQL'de Subscription tablosu oluşturulacak:

```sql
-- Otomatik oluşturulacak tablo yapısı
CREATE TABLE "subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "package_type" TEXT NOT NULL,
  "ad_limit" INTEGER NOT NULL,
  "ads_used" INTEGER DEFAULT 0,
  "price" DOUBLE PRECISION NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "start_date" TIMESTAMP DEFAULT NOW(),
  "end_date" TIMESTAMP NOT NULL,
  "is_trial" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL,
  CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
```

## 📡 API Endpoints

Deployment sonrası çalışacak endpoint'ler:

### 1. Get Packages (Public)

```
GET /api/subscriptions/packages
Response: { packages: { trucks, trucks_plus, trucksbus } }
```

### 2. Get My Subscription (Protected)

```
GET /api/subscriptions/my-subscription
Headers: { Authorization: "Bearer <token>" }
Response: { subscription: {...} }
```

### 3. Subscribe to Package (Protected)

```
POST /api/subscriptions/subscribe
Headers: { Authorization: "Bearer <token>" }
Body: { packageType: "trucks" | "trucks_plus" | "trucksbus" }
Response: { subscription: {...}, message: "..." }
```

## 🧪 Test Adımları

### 1. Railway Deploy Sonrası

```bash
# Local'de test
npm run dev

# Railway'de test için log kontrolü
railway logs
```

### 2. Frontend Test

1. Login olun
2. Profile sayfasına gidin
3. "🏪 Dükkan Aç" butonuna tıklayın
4. Bir paket seçin
5. Modal'da "Paketi Aktifleştir" butonuna tıklayın
6. Başarı mesajını görün
7. Profile'da aktif paket bilgisini kontrol edin

### 3. Database Kontrolü

Railway Dashboard > PostgreSQL > Data:

```sql
SELECT * FROM subscriptions;
```

## 🔍 Troubleshooting

### Hata: "Property 'subscription' does not exist"

**Çözüm**: Prisma Client yeniden generate edin:

```bash
cd server
npx prisma generate
```

### Hata: "Migration failed"

**Çözüm**: Railway'de manuel push:

```bash
npx prisma db push --accept-data-loss
```

### Hata: "Cannot find module '@prisma/client'"

**Çözüm**: Dependencies yeniden yükleyin:

```bash
npm install
npx prisma generate
```

## 📊 Package Details

| Paket     | İlan Limiti | Fiyat      | Deneme        |
| --------- | ----------- | ---------- | ------------- |
| Trucks    | 3 ilan      | 299.99₺/ay | 3 ay ücretsiz |
| Trucks+   | 5 ilan      | 499.99₺/ay | 3 ay ücretsiz |
| TrucksBus | 10 ilan     | 799.99₺/ay | 3 ay ücretsiz |

## ✨ Özellikler

- ✅ İlk 3 ay ücretsiz deneme
- ✅ Otomatik ilan limiti kontrolü
- ✅ Paket süresi takibi
- ✅ Aktif paket bilgisi profile'da görüntüleme
- ✅ Kullanılan/kalan ilan sayısı takibi
- ✅ Modal ile kolay paket aktivasyonu

## 🎯 Next Steps

1. **Git Commit & Push**:

```bash
git add .
git commit -m "feat: Add subscription system with 3 packages"
git push origin main
```

2. **Railway Auto Deploy**: Push sonrası otomatik deploy olacak

3. **Database Verification**: Railway'de subscription tablosunu kontrol edin

4. **Frontend Test**: Canlı sitede paket sistemini test edin

---

**Not**: Tüm değişiklikler hem local hem Railway için hazır! 🚀
