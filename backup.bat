@echo off
REM Windows Otomatik Backup Script

cd /d "%~dp0"

echo %date% %time%: Checking for changes...

REM Git durumunu kontrol et
git status --porcelain > temp_status.txt
set /p changes=<temp_status.txt
del temp_status.txt

if not "%changes%"=="" (
    echo %date% %time%: Changes detected, creating backup...
    
    REM Tüm değişiklikleri ekle
    git add .
    
    REM Otomatik commit yap
    git commit -m "Auto-backup: %date% %time%"
    
    echo %date% %time%: Backup completed
) else (
    echo %date% %time%: No changes to backup
)
