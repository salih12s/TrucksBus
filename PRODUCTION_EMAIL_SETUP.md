# 🚀 CANLI ORTAM E-POSTA KURULUMU

## Hızlı Başlangıç (5 dakikada hazır!)

### Adım 1: Gmail Hesabı Hazırlayın

1. **Gmail hesabınıza gidin** (mevcut hesabınızı kullanabilirsiniz)
2. **2FA'yı aktifleştirin**: Hesap > Güvenlik > 2 Adımlı Doğrulama
3. **Uygulama şifresi oluşturun**:
   - Google Hesap > Güvenlik > 2 Adımlı Doğrulama > Uygulama şifreleri
   - "Mail" seçin
   - 16 haneli şifreyi kopyalayın (xxxx xxxx xxxx xxxx formatında)

### Adım 2: Railway'de Environment Variables Ayarlayın

Railway dashboard'unda **Variables** sekmesine gidin ve şunları ekleyin:

```
EMAIL_USER=sizin-gmail-adresiniz@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  (16 haneli uygulama şifresi)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=noreply@trucksbus.com.tr
FRONTEND_URL=https://trucksbus.com.tr
```

### Adım 3: Test Edin

1. Railway'de deploy edin
2. Canlı sitede "Şifremi Unuttum"a tıklayın
3. E-posta adresinizi girin
4. Gmail'inizi kontrol edin

## 🔧 Alternatif Çözümler

### SendGrid (Önerilen - Profesyonel)

- **Avantaj**: Aylık 100 e-posta ücretsiz, güvenilir teslimat
- **Kurulum**: sendgrid.com'da hesap açın
- **Railway Variables**:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@trucksbus.com.tr
```

### Mailgun (Alternatif)

- **Avantaj**: İlk 5,000 e-posta ücretsiz
- **Kurulum**: mailgun.com'da hesap açın

### AWS SES (Gelişmiş)

- **Avantaj**: Çok ucuz (1000 e-posta = $0.10)
- **Kurulum**: AWS hesabı gerekli

## 🚨 Önemli Notlar

1. **Gmail Limitleri**:

   - Günlük ~500 e-posta limiti
   - Spam klasörüne düşebilir

2. **Profesyonel Görünüm İçin**:

   - Google Workspace kullanın (@trucksbus.com.tr e-posta)
   - SPF/DKIM kayıtları ekleyin

3. **Test Environment**:
   - Geliştirme ortamında console.log kullanılıyor
   - Canlıda gerçek e-posta gönderilecek

## ⚡ Hızlı Başlangıç Komutu

Railway'de bu değişkenleri ekledikten sonra:

```bash
railway redeploy
```

Veya Railway dashboard'unda "Deploy" butonuna tıklayın.

## 🔍 Sorun Giderme

**E-posta gitmiyor?**

1. Railway logs kontrol edin: `railway logs`
2. Gmail uygulama şifresi doğru mu?
3. 2FA aktif mi?
4. SPAM klasörünü kontrol edin

**Hala sorun var?**

- Console'da "✅ E-posta servisi hazır" mesajını görüyor musunuz?
- Variables'lar doğru yazıldı mı?
