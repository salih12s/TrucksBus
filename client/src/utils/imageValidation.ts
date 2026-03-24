/**
 * Image Validation Utilities
 * 
 * Büyük görsellerin Git push sırasında hata vermesini önlemek için
 * frontend'de dosya boyutu kontrolü yapar.
 */

// Maksimum dosya boyutu: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maksimum önerilen boyut mesajı için: 3MB
const RECOMMENDED_FILE_SIZE = 3 * 1024 * 1024;

/**
 * Dosya boyutunu kontrol eder ve kullanıcıyı bilgilendirir
 * @param file - Kontrol edilecek dosya
 * @returns {boolean} - Dosya geçerliyse true
 */
export function validateImageSize(file: File): {
    valid: boolean;
    error?: string;
    warning?: string;
} {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `Dosya çok büyük! Maksimum dosya boyutu: 5MB. Mevcut dosya: ${formatFileSize(file.size)}`,
        };
    }

    if (file.size > RECOMMENDED_FILE_SIZE) {
        return {
            valid: true,
            warning: `Dosya biraz büyük (${formatFileSize(file.size)}). Yükleme başarılı olacak ancak optimize edilmiş daha küçük dosyalar kullanmanız önerilir.`,
        };
    }

    return { valid: true };
}

/**
 * Birden fazla dosyayı kontrol eder
 * @param files - Kontrol edilecek dosyalar
 * @returns {object} - Geçerli dosyalar ve hata mesajları
 */
export function validateMultipleImages(files: File[]): {
    validFiles: File[];
    errors: string[];
    warnings: string[];
} {
    const validFiles: File[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    files.forEach((file, index) => {
        const result = validateImageSize(file);

        if (result.valid) {
            validFiles.push(file);
            if (result.warning) {
                warnings.push(`Dosya ${index + 1}: ${result.warning}`);
            }
        } else if (result.error) {
            errors.push(`Dosya ${index + 1} (${file.name}): ${result.error}`);
        }
    });

    return { validFiles, errors, warnings };
}

/**
 * Dosya boyutunu okunabilir formata çevirir
 * @param bytes - Byte cinsinden dosya boyutu
 * @returns {string} - Okunabilir format (örn: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Dosyanın image olup olmadığını kontrol eder
 * @param file - Kontrol edilecek dosya
 * @returns {boolean} - Image ise true
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
}
