#!/bin/bash
# Otomatik Git Backup Script

# Her 10 dakikada bir çalışacak backup script
backup_changes() {
    cd "$(dirname "$0")"
    
    # Değişiklik var mı kontrol et
    if [ -n "$(git status --porcelain)" ]; then
        echo "$(date): Changes detected, creating backup..."
        
        # Tüm değişiklikleri ekle
        git add .
        
        # Otomatik commit yap
        git commit -m "Auto-backup: $(date '+%Y-%m-%d %H:%M:%S')"
        
        echo "$(date): Backup completed"
    else
        echo "$(date): No changes to backup"
    fi
}

backup_changes
