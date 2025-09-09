const fs = require('fs');
const path = require('path');

// adController.ts dosyasının yolunu belirt
const filePath = path.join(__dirname, 'server', 'src', 'controllers', 'adController.ts');

// Dosyayı oku
let content = fs.readFileSync(filePath, 'utf-8');

// base64Image, -> imageUrl: base64Image, olarak değiştir
content = content.replace(/              base64Image,/g, '              imageUrl: base64Image,');

// Dosyayı güncelle
fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ base64Image referansları düzeltildi!');
