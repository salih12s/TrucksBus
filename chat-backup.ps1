# Chat History Backup System
# Bu dosya her önemli adımda güncellenir

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = "chat-backups"

# Backup klasörü oluştur
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

# Mevcut proje durumunu kaydet
@"
=== TRUCKSBUS CHAT BACKUP - $timestamp ===

PROJE DURUMU:
- Phase 7-9 Tamamlandı (Performance, PWA, Backend Integration)
- Frontend: React + TypeScript + Material-UI çalışıyor
- Backend: Node.js + Express + PostgreSQL çalışıyor
- PWA: Service Worker + Manifest aktif
- Database: Kategoriler ve markalar seed edildi

ÖNEMLI DOSYALAR:
- client/src/pages/Homepage.tsx: Ana sayfa + API entegrasyonu
- client/src/utils/pwa.ts: PWA yönetim sistemi
- server/src/controllers/: API endpoint'leri
- server/prisma/schema.prisma: Database şeması

SON DEĞİŞİKLİKLER:
$(git log --oneline -5)

VSCode WORKSPACE STATE:
- Auto-save: Aktif
- Git auto-fetch: Aktif  
- Backup system: Kurulu
- Guard system: Hazır

ÇALIŞAN SERVİSLER:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Database: PostgreSQL local

KORUMA SİSTEMLERİ:
✅ Git hooks
✅ Auto backup
✅ Emergency restore
✅ Code guard
✅ VSCode settings

SIRADAKİ ADIMLAR:
- Real-time messaging
- Advanced search
- Authentication
- Ad management

Bu backup'ı restore etmek için:
1. Bu dosyayı okuyun
2. Git log'u kontrol edin
3. npm run guard ile koruma menüsünü açın
4. Gerekirse emergency backup'tan restore edin

=== BACKUP END ===
"@ | Out-File -FilePath "$backupDir\chat-backup-$timestamp.txt" -Encoding UTF8

Write-Host "Chat backup created: $backupDir\chat-backup-$timestamp.txt" -ForegroundColor Green

# Son 10 backup'ı tut, eskilerini sil
Get-ChildItem $backupDir -Name "chat-backup-*.txt" | 
    Sort-Object -Descending | 
    Select-Object -Skip 10 | 
    ForEach-Object { Remove-Item "$backupDir\$_" -Force }

Write-Host "Chat history backed up successfully!" -ForegroundColor Cyan
