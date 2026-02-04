# 🚀 CANLI ORTAM E-POSTA KURULUMU (Şifre Sıfırlama)

## ✅ Şifre Sıfırlama Akışı

1. Kullanıcı `/forgot-password` sayfasına gider
2. E-posta adresini girer
3. Sistem JWT token ile reset link oluşturur
4. E-posta gönderilir (1 saat geçerli link)
5. Kullanıcı linke tıklar → `/reset-password?token=xxx`
6. Yeni şifre belirlenir ve kaydedilir

## Hızlı Başlangıç (5 dakikada hazır!)

### Adım 1: Gmail Uygulama Şifresi Oluşturun

1. **https://myaccount.google.com** adresine gidin
2. **Security (Güvenlik)** sekmesine tıklayın
3. **2-Step Verification** açık olmalı (kapalıysa açın)
4. **App passwords (Uygulama şifreleri)** bölümüne gidin
5. **Select app** → "Mail" seçin
6. **Select device** → "Other" seçin, "TrucksBus" yazın
7. **Generate** butonuna tıklayın
8. Oluşan 16 haneli şifreyi kopyalayın (boşluklar olmadan: `xxxxxxxxxxxxxxxx`)

### Adım 2: Railway'de Environment Variables Ayarlayın

Railway dashboard'unda **Variables** sekmesine gidin ve şunları ekleyin:

```
EMAIL_USER=sizin-gmail-adresiniz@gmail.com
EMAIL_PASSWORD=xxxxxxxxxxxxxxxx
DISABLE_EMAIL=false
FRONTEND_URL=https://trucksbus.com.tr
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=noreply@trucksbus.com
```

⚠️ **ÖNEMLİ**: `EMAIL_PASSWORD` değerinde boşluk OLMAMALI!

### Adım 3: Deploy ve Test

1. Railway'de **Deploy** butonuna tıklayın
2. Canlı sitede **Giriş Yap** → **Şifremi Unuttum** tıklayın
3. E-posta adresinizi girin
4. Gmail'inizi kontrol edin (SPAM klasörüne de bakın)
5. E-postadaki linke tıklayın
6. Yeni şifre belirleyin

## 🔍 Sorun Giderme

### E-posta gitmiyor mu?

**Railway Logs'u kontrol edin:**

```bash
railway logs
```

Şu mesajları arayın:

- ✅ `E-posta servisi hazır` = Başarılı
- ❌ `E-posta bağlantı hatası` = Şifre yanlış veya 2FA kapalı

**Kontrol Listesi:**

- [ ] Gmail 2-Step Verification açık mı?
- [ ] App Password kullanıyor musunuz (normal şifre ÇALIŞMAZ)?
- [ ] `DISABLE_EMAIL=false` mu?
- [ ] `EMAIL_PASSWORD` boşluksuz mu?
- [ ] Railway'i yeniden deploy ettiniz mi?

### Test için Console Log'ları

Server loglarında şunları görmelisiniz:

```
📧 E-posta gönderiliyor: kullanici@email.com
✅ E-posta başarıyla gönderildi: <message-id>
```

## 🔧 Alternatif E-posta Servisleri

### SendGrid (Önerilen - Profesyonel)

- **Avantaj**: Aylık 100 e-posta ücretsiz, güvenilir teslimat
- **Kurulum**: sendgrid.com'da hesap açın

### Mailgun (Alternatif)

- **Avantaj**: İlk 5,000 e-posta ücretsiz

### AWS SES (Gelişmiş)

- **Avantaj**: Çok ucuz (1000 e-posta = $0.10)

## 📋 Lokal Test (Development)

Lokal ortamda test etmek için `.env` dosyasında:

```env
# Simülasyon modu - console'a yazdırır
DISABLE_EMAIL=true

# VEYA gerçek e-posta için
DISABLE_EMAIL=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
FRONTEND_URL=http://localhost:5174
```

## 🚨 Gmail Limitleri

- Günlük **~500 e-posta** limiti
- Çok fazla gönderim SPAM olarak işaretlenebilir
- Profesyonel kullanım için **Google Workspace** önerilir
