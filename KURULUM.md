# TrucksBus - Kurulum Rehberi

## Gereksinimler

1. **Node.js v18+** → https://nodejs.org (LTS sürümü indir)
2. **PostgreSQL v14+** → https://postgresql.org/download/windows
   - Kurulum sırasında belirlediğin şifreyi not al (varsayılan: `12345`)

---

## Kurulum (3 Adım)

### Adım 1: PostgreSQL şifresini ayarla

`server\.env.default` dosyasını aç, `DATABASE_URL` satırındaki `12345` kısmını
PostgreSQL kurulumunda belirlediğin şifreyle değiştir.

> Eğer şifreni `12345` olarak belirlediysen hiçbir şey yapma, direkt devam et.

### Adım 2: SETUP.bat çalıştır

`SETUP.bat` dosyasına **çift tıkla** ve bekle. Bu işlem:
- Tüm bağımlılıkları yükler (npm install)
- Veritabanı tablolarını oluşturur
- Örnek verileri yükler

> İlk kurulumda internet bağlantısı gereklidir (~5-10 dakika)

### Adım 3: START.bat çalıştır

`START.bat` dosyasına **çift tıkla**, iki terminal penceresi açılır.

Tarayıcında aç: **http://localhost:5173**

---

## Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| "Prisma db push başarısız" | PostgreSQL çalışıyor mu? .env'deki şifreyi kontrol et |
| "Port 5000 already in use" | Başka bir uygulama aynı portu kullanıyor, bilgisayarı yeniden başlat |
| "npm install başarısız" | Node.js v18+ kurulu mu? `node --version` komutuyla kontrol et |
| Sayfa açılmıyor | SERVER penceresini kontrol et, hata mesajı var mı? |

---

## Tekrar Başlatmak İçin

Kurulum bir kez yapıldıktan sonra her seferinde sadece **START.bat** çalıştır.
