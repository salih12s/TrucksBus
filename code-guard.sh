#!/bin/bash
# Kod Kaybını Önleme Sistemi

# 1. Anlık durum kontrolü
check_git_status() {
    echo "=== Git Status Kontrolü ==="
    git status
    echo "=== Son 3 Commit ==="
    git log --oneline -3
    echo "=========================="
}

# 2. Acil durum yedeklemesi
emergency_backup() {
    echo "ACIL DURUM YEDEKLEMESİ BAŞLANIYOR..."
    
    # Timestamp ile yedek branch oluştur
    BACKUP_BRANCH="emergency-backup-$(date +%Y%m%d-%H%M%S)"
    
    # Tüm değişiklikleri kaydet
    git add .
    git commit -m "Emergency backup: $(date)"
    
    # Yedek branch oluştur
    git branch $BACKUP_BRANCH
    
    echo "Acil durum yedeklemesi tamamlandı: $BACKUP_BRANCH"
}

# 3. Kod geri yükleme
restore_from_backup() {
    echo "Mevcut backup branch'leri:"
    git branch | grep backup
    
    read -p "Hangi backup'tan geri yüklemek istiyorsunuz? " backup_branch
    
    if [ ! -z "$backup_branch" ]; then
        git checkout $backup_branch
        echo "Backup'tan geri yükleme tamamlandı"
    fi
}

# Ana menü
echo "=== TrucksBus Kod Koruma Sistemi ==="
echo "1. Git durumu kontrol et"
echo "2. Acil durum yedeklemesi yap"
echo "3. Backup'tan geri yükle"
echo "4. Çıkış"

read -p "Seçiminiz (1-4): " choice

case $choice in
    1) check_git_status ;;
    2) emergency_backup ;;
    3) restore_from_backup ;;
    4) echo "Çıkılıyor..." ;;
    *) echo "Geçersiz seçim!" ;;
esac
