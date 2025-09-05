# TrucksBus Kod Koruma Sistemi - PowerShell

function Show-GitStatus {
    Write-Host "=== Git Status Kontrolü ===" -ForegroundColor Green
    git status
    Write-Host "=== Son 3 Commit ===" -ForegroundColor Green
    git log --oneline -3
    Write-Host "==========================" -ForegroundColor Green
}

function New-EmergencyBackup {
    Write-Host "ACIL DURUM YEDEKLEMESİ BAŞLANIYOR..." -ForegroundColor Red
    
    # Timestamp ile yedek branch oluştur
    $backupBranch = "emergency-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    # Tüm değişiklikleri kaydet
    git add .
    git commit -m "Emergency backup: $(Get-Date)"
    
    # Yedek branch oluştur
    git branch $backupBranch
    
    Write-Host "Acil durum yedeklemesi tamamlandı: $backupBranch" -ForegroundColor Green
}

function Restore-FromBackup {
    Write-Host "Mevcut backup branch'leri:" -ForegroundColor Yellow
    git branch | Where-Object { $_ -match "backup" }
    
    $backupBranch = Read-Host "Hangi backup'tan geri yüklemek istiyorsunuz?"
    
    if ($backupBranch) {
        git checkout $backupBranch
        Write-Host "Backup'tan geri yükleme tamamlandı" -ForegroundColor Green
    }
}

function Start-AutoBackup {
    Write-Host "Otomatik yedekleme başlatılıyor..." -ForegroundColor Cyan
    
    while ($true) {
        $changes = git status --porcelain
        if ($changes) {
            Write-Host "$(Get-Date): Değişiklikler tespit edildi, yedekleme yapılıyor..." -ForegroundColor Yellow
            git add .
            git commit -m "Auto-backup: $(Get-Date)"
            Write-Host "$(Get-Date): Yedekleme tamamlandı" -ForegroundColor Green
        }
        
        Start-Sleep -Seconds 300  # 5 dakika bekle
    }
}

# Ana menü
do {
    Clear-Host
    Write-Host "=== TrucksBus Kod Koruma Sistemi ===" -ForegroundColor Cyan
    Write-Host "1. Git durumu kontrol et"
    Write-Host "2. Acil durum yedeklemesi yap"
    Write-Host "3. Backup'tan geri yükle"
    Write-Host "4. Otomatik yedekleme başlat"
    Write-Host "5. Çıkış"
    
    $choice = Read-Host "Seçiminiz (1-5)"
    
    switch ($choice) {
        1 { Show-GitStatus; Read-Host "Devam etmek için Enter'a basın" }
        2 { New-EmergencyBackup; Read-Host "Devam etmek için Enter'a basın" }
        3 { Restore-FromBackup; Read-Host "Devam etmek için Enter'a basın" }
        4 { Start-AutoBackup }
        5 { Write-Host "Çıkılıyor..." -ForegroundColor Green; break }
        default { Write-Host "Geçersiz seçim!" -ForegroundColor Red; Start-Sleep 2 }
    }
} while ($choice -ne 5)
