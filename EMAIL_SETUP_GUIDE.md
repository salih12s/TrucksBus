# E-posta Konfigürasyonu Rehberi

## Gmail ile E-posta Gönderme Kurulumu

### 1. Gmail Hesabı Hazırlama

1. TrucksBus için ayrı bir Gmail hesabı oluşturun (örn: noreply@trucksbus.com.tr şeklinde bir Google Workspace hesabı)
2. 2 Faktörlü Doğrulamayı aktif edin
3. Uygulama Şifresi oluşturun:
   - Google Hesap > Güvenlik > 2 Adımlı Doğrulama > Uygulama şifreleri
   - "Mail" seçin ve 16 haneli şifreyi alın

### 2. Production .env Ayarları

```env
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-16-digit-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=https://trucksbus.com.tr
```

### 3. Domain Bazlı Çözüm (Profesyonel)

- Google Workspace kullanarak @trucksbus.com.tr e-posta adresi
- Yıllık maliyet: ~$72 (kullanıcı başına $6/ay)
- Avantajları: Profesyonel görünüm, güvenilirlik

## Seçenek 2: SendGrid (Ücretsiz Plan)

- Aylık 100 e-posta ücretsiz
- Kolay kurulum
- Güvenilir teslimat

## Seçenek 3: AWS SES

- Çok uygun maliyetli
- Railway ile kolay entegrasyon
- İlk 62,000 e-posta ücretsiz

## Önerilen Çözüm

Başlangıç için Gmail kullanın, büyüdükçe SendGrid veya AWS SES'e geçin.
