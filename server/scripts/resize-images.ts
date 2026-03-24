/**
 * Mevcut Büyük Görselleri Optimize Et
 * 
 * Bu script client/public klasöründeki tüm görselleri tarar
 * ve 1600px'den geniş olanları otomatik olarak küçültür.
 * 
 * Kullanım:
 * cd server
 * npx ts-node scripts/resize-images.ts
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

// Optimize edilecek klasörler
const FOLDERS_TO_OPTIMIZE = [
    path.join(__dirname, "../../client/public/BrandsImage"),
    path.join(__dirname, "../../client/public/CategoryImage"),
];

// Maksimum genişlik (px)
const MAX_WIDTH = 1600;

// İstatistikler
let totalProcessed = 0;
let totalOptimized = 0;
let totalErrors = 0;
let totalSizeBefore = 0;
let totalSizeAfter = 0;

/**
 * Dosya boyutunu okunabilir formata çevirir
 */
function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Bir görseli optimize eder
 */
async function optimizeImage(filePath: string): Promise<void> {
    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();
        const width = metadata.width || 0;

        // Dosya boyutunu al
        const stats = fs.statSync(filePath);
        const sizeBefore = stats.size;
        totalSizeBefore += sizeBefore;

        if (width > MAX_WIDTH) {
            console.log(`  📐 Optimizing: ${path.basename(filePath)} (${width}px → ${MAX_WIDTH}px)`);

            // Geçici dosya oluştur
            const tempPath = filePath + "_tmp";

            await image
                .resize(MAX_WIDTH)
                .jpeg({ quality: 85 })
                .toFile(tempPath);

            // Orijinal dosyayı değiştir
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);

            // Yeni boyutu al
            const newStats = fs.statSync(filePath);
            const sizeAfter = newStats.size;
            totalSizeAfter += sizeAfter;

            const savedSize = sizeBefore - sizeAfter;
            const savedPercent = ((savedSize / sizeBefore) * 100).toFixed(1);

            console.log(`  ✅ Optimized! Saved: ${formatFileSize(savedSize)} (${savedPercent}%)`);
            totalOptimized++;
        } else {
            totalSizeAfter += sizeBefore;
            console.log(`  ✓ ${path.basename(filePath)} already optimized (${width}px)`);
        }

        totalProcessed++;
    } catch (error) {
        console.error(`  ❌ Error processing ${path.basename(filePath)}:`, error);
        totalErrors++;
    }
}

/**
 * Klasördeki tüm görselleri işler (recursive)
 */
async function processFolder(folderPath: string): Promise<void> {
    if (!fs.existsSync(folderPath)) {
        console.log(`⚠️  Folder not found: ${folderPath}`);
        return;
    }

    console.log(`\n📁 Processing folder: ${folderPath}`);

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Alt klasörleri recursive olarak işle
            await processFolder(fullPath);
        } else {
            // Sadece görsel dosyalarını işle
            const ext = path.extname(file).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
                await optimizeImage(fullPath);
            }
        }
    }
}

/**
 * Ana fonksiyon
 */
async function main(): Promise<void> {
    console.log("🚀 Starting image optimization...\n");
    console.log(`Max width: ${MAX_WIDTH}px`);
    console.log(`Target folders: ${FOLDERS_TO_OPTIMIZE.length}\n`);

    const startTime = Date.now();

    // Tüm klasörleri işle
    for (const folder of FOLDERS_TO_OPTIMIZE) {
        await processFolder(folder);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Sonuçları göster
    console.log("\n" + "=".repeat(60));
    console.log("📊 OPTIMIZATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total images processed: ${totalProcessed}`);
    console.log(`Images optimized: ${totalOptimized}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Total size before: ${formatFileSize(totalSizeBefore)}`);
    console.log(`Total size after: ${formatFileSize(totalSizeAfter)}`);

    if (totalSizeBefore > 0) {
        const totalSaved = totalSizeBefore - totalSizeAfter;
        const totalSavedPercent = ((totalSaved / totalSizeBefore) * 100).toFixed(1);
        console.log(`Total saved: ${formatFileSize(totalSaved)} (${totalSavedPercent}%)`);
    }

    console.log(`Duration: ${duration}s`);
    console.log("=".repeat(60));
    console.log("\n✅ Optimization complete!\n");
}

// Script'i çalıştır
main().catch(console.error);
