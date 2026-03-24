@echo off
chcp 65001 >nul
echo ============================================
echo   TrucksBus - Otomatik Kurulum
echo ============================================
echo.

:: Node.js kontrolü
where node >nul 2>nul
if errorlevel 1 (
    echo [HATA] Node.js bulunamadi!
    echo Lutfen https://nodejs.org adresinden Node.js v18+ kurun.
    pause
    exit /b 1
)

:: Node sürümünü göster
echo [OK] Node.js bulundu:
node --version
echo.

:: PostgreSQL bağlantısını kontrol et
echo [?] PostgreSQL durumu kontrol ediliyor...
psql --version >nul 2>nul
if errorlevel 1 (
    echo [UYARI] psql komutu bulunamadi - PostgreSQL path'te olmayabilir.
    echo         Devam ediliyor, ancak veritabani basarirsiz olabilir.
) else (
    echo [OK] PostgreSQL bulundu.
)
echo.

:: .env dosyası yoksa oluştur
if not exist "server\.env" (
    echo [INFO] server\.env dosyasi olusturuluyor...
    copy "server\.env.default" "server\.env" >nul
    echo [OK] server\.env olusturuldu.
    echo.
    echo ============================================
    echo   ONEMLI: Veritabani sifrenizi ayarlayin!
    echo ============================================
    echo   server\.env dosyasini acin ve
    echo   DATABASE_URL icindeki sifreyi
    echo   PostgreSQL kurulum sifrenizle degistirin.
    echo   Varsayilan sifre: 12345
    echo ============================================
    echo.
    pause
) else (
    echo [OK] server\.env zaten mevcut.
    echo.
)

:: Kök bağımlılıkları
echo [1/4] Kok bagimliliklari yukleniyor...
call npm install --silent
if errorlevel 1 (
    echo [HATA] Kok npm install basarisiz!
    pause
    exit /b 1
)
echo [OK] Kok bagimliliklari yuklendi.
echo.

:: Server bağımlılıkları
echo [2/4] Server bagimliliklari yukleniyor...
cd server
call npm install --silent
if errorlevel 1 (
    echo [HATA] Server npm install basarisiz!
    pause
    exit /b 1
)
echo [OK] Server bagimliliklari yuklendi.
echo.

:: Prisma / veritabanı kurulumu
echo [3/4] Veritabani olusturuluyor (Prisma)...
call npx prisma db push
if errorlevel 1 (
    echo [HATA] Prisma db push basarisiz!
    echo        server\.env icindeki DATABASE_URL'yi kontrol edin.
    echo        PostgreSQL calistigindan emin olun.
    cd ..
    pause
    exit /b 1
)
echo [OK] Veritabani tablolari olusturuldu.
echo.

echo [3/4] Ornek veriler yukleniyor...
call npx ts-node prisma/seed.ts
if errorlevel 1 (
    echo [UYARI] Seed basarisiz - devam ediliyor (zorunlu degil).
) else (
    echo [OK] Ornek veriler yuklendi.
)
echo.

cd ..

:: Client bağımlılıkları
echo [4/4] Client bagimliliklari yukleniyor...
cd client
call npm install --silent
if errorlevel 1 (
    echo [HATA] Client npm install basarisiz!
    pause
    exit /b 1
)
echo [OK] Client bagimliliklari yuklendi.
echo.

cd ..

echo ============================================
echo   KURULUM TAMAMLANDI!
echo ============================================
echo.
echo Uygulamayi baslatmak icin START.bat dosyasini calistirin.
echo.
pause
