@echo off
chcp 65001 >nul
echo ============================================
echo   TrucksBus - Uygulama Baslatiliyor
echo ============================================
echo.

:: Kurulum yapılmış mı kontrol et
if not exist "server\node_modules" (
    echo [HATA] Kurulum bulunamadi!
    echo        Once SETUP.bat dosyasini calistirin.
    pause
    exit /b 1
)

if not exist "client\node_modules" (
    echo [HATA] Client kurulumu bulunamadi!
    echo        Once SETUP.bat dosyasini calistirin.
    pause
    exit /b 1
)

echo Frontend : http://localhost:5173
echo Backend  : http://localhost:5000
echo.
echo Durdurmak icin bu pencereyi kapatabilirsiniz.
echo ============================================
echo.

:: Server ve client'ı ayrı pencerelerde başlat
start "TrucksBus - SERVER" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak >nul
start "TrucksBus - CLIENT" cmd /k "cd /d %~dp0client && npm run dev"

echo [OK] Sunucular baslatildi!
echo      Tarayicinizda http://localhost:5173 adresini acin.
echo.
pause
