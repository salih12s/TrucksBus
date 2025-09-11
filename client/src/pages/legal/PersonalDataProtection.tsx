import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import { Security, Shield, Lock, Visibility } from "@mui/icons-material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const PersonalDataProtection: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              color: "#D34237",
              fontWeight: "bold",
              textAlign: "center",
              mb: 4,
            }}
          >
            Kişisel Verilerin Korunması
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              Kişisel verilerinizin güvenliği bizim önceliğimizdir. Bu sayfada
              verilerinizin nasıl korunduğu ve haklarınız hakkında detaylı bilgi
              bulabilirsiniz.
            </Typography>
          </Alert>

          <Typography variant="body1" paragraph sx={{ mb: 3, color: "#666" }}>
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {/* Güvenlik İkonları */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Security sx={{ fontSize: 48, color: "#D34237", mb: 1 }} />
              <Typography variant="caption">Güvenli Saklama</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Shield sx={{ fontSize: 48, color: "#D34237", mb: 1 }} />
              <Typography variant="caption">Veri Koruma</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Lock sx={{ fontSize: 48, color: "#D34237", mb: 1 }} />
              <Typography variant="caption">Şifreli Erişim</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Visibility sx={{ fontSize: 48, color: "#D34237", mb: 1 }} />
              <Typography variant="caption">Şeffaf Süreç</Typography>
            </Box>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            1. Veri Koruma Taahhüdümüz
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus olarak, kullanıcılarımızın kişisel verilerini korumayı en
            önemli sorumluluklarımızdan biri olarak görüyoruz. Bu kapsamda:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Kişisel verilerinizi sadece belirtilen amaçlar için kullanırız
            </Typography>
            <Typography component="li" variant="body1">
              Verilerinizi izniniz olmadan üçüncü kişilerle paylaşmayız
            </Typography>
            <Typography component="li" variant="body1">
              En güncel güvenlik teknolojilerini kullanırız
            </Typography>
            <Typography component="li" variant="body1">
              Veri işleme süreçlerimizi sürekli geliştiririz
            </Typography>
            <Typography component="li" variant="body1">
              Yasal gereklilikleri eksiksiz yerine getiririz
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. Hangi Veriler Toplanır?
          </Typography>
          <Typography variant="body1" paragraph>
            Platform kullanımı sırasında aşağıdaki kişisel veriler
            toplanmaktadır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik
              numarası, doğum tarihi
            </Typography>
            <Typography component="li" variant="body1">
              <strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta
              adresi, posta adresi
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Araç Bilgileri:</strong> Sahip olunan veya satılan
              araçların detayları
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Finansal Bilgiler:</strong> Ödeme bilgileri (güvenli ödeme
              sistemleri aracılığıyla)
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı bilgileri,
              cihaz bilgileri
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Kullanım Bilgileri:</strong> Platform etkileşimleri,
              ziyaret edilen sayfalar
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            3. Verilerin Kullanım Amaçları
          </Typography>
          <Typography variant="body1" paragraph>
            Toplanan kişisel veriler yalnızca aşağıdaki amaçlarla kullanılır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Hesap oluşturma ve kimlik doğrulama
            </Typography>
            <Typography component="li" variant="body1">
              İlan yayınlama ve görüntüleme hizmetleri
            </Typography>
            <Typography component="li" variant="body1">
              Kullanıcılar arası iletişimin sağlanması
            </Typography>
            <Typography component="li" variant="body1">
              Müşteri destek hizmetlerinin sunulması
            </Typography>
            <Typography component="li" variant="body1">
              Platform güvenliğinin sağlanması
            </Typography>
            <Typography component="li" variant="body1">
              Yasal yükümlülüklerin yerine getirilmesi
            </Typography>
            <Typography component="li" variant="body1">
              İstatistiksel analiz ve platform geliştirme
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. Veri Güvenliği Önlemleri
          </Typography>
          <Typography variant="body1" paragraph>
            Verilerinizin güvenliği için aldığımız teknik ve idari önlemler:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              SSL sertifikası ile şifreli veri iletimi
            </Typography>
            <Typography component="li" variant="body1">
              Güvenli sunucularda veri depolama
            </Typography>
            <Typography component="li" variant="body1">
              Düzenli güvenlik denetimleri ve testleri
            </Typography>
            <Typography component="li" variant="body1">
              Personel eğitimleri ve erişim kontrolü
            </Typography>
            <Typography component="li" variant="body1">
              Yedekleme ve felaket kurtarma planları
            </Typography>
            <Typography component="li" variant="body1">
              Güvenlik ihlali durumunda acil müdahale protokolü
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. Veri Saklama Süreleri
          </Typography>
          <Typography variant="body1" paragraph>
            Kişisel verileriniz aşağıdaki süreler boyunca saklanır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Aktif Hesaplar:</strong> Hesap kapatılana kadar
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Pasif Hesaplar:</strong> Son aktiviteden 2 yıl sonra
            </Typography>
            <Typography component="li" variant="body1">
              <strong>İşlem Kayıtları:</strong> Vergi mevzuatı gereği 5 yıl
            </Typography>
            <Typography component="li" variant="body1">
              <strong>İletişim Kayıtları:</strong> Yasal gereklilik süresi
              boyunca
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Log Kayıtları:</strong> Güvenlik amacıyla 1 yıl
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Pazarlama Verileri:</strong> Açık rıza geri alınana kadar
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. Kişisel Veri Haklarınız
          </Typography>
          <Typography variant="body1" paragraph>
            KVKK kapsamında sahip olduğunuz haklar:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Bilgi Alma Hakkı:</strong> Verilerinizin işlenip
              işlenmediğini öğrenme
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Erişim Hakkı:</strong> İşlenen verilerinizin kopyasını
              talep etme
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Düzeltme Hakkı:</strong> Hatalı verilerin düzeltilmesini
              isteme
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Silme Hakkı:</strong> Verilerinizin silinmesini talep etme
            </Typography>
            <Typography component="li" variant="body1">
              <strong>İşlemeyi Durdurma Hakkı:</strong> Veri işlemenin
              durdurulmasını isteme
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Taşınabilirlik Hakkı:</strong> Verilerinizi başka
              platformlara taşıma
            </Typography>
            <Typography component="li" variant="body1">
              <strong>İtiraz Hakkı:</strong> Veri işleme faaliyetlerine itiraz
              etme
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. Veri Paylaşımı ve Aktarımı
          </Typography>
          <Typography variant="body1" paragraph>
            Kişisel verileriniz aşağıdaki durumlar dışında paylaşılmaz:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Açık rızanızın bulunduğu durumlar
            </Typography>
            <Typography component="li" variant="body1">
              Yasal yükümlülükler (mahkeme kararı, resmi talep)
            </Typography>
            <Typography component="li" variant="body1">
              Hizmet sağlayıcılarla sınırlı paylaşım (sadece hizmet amaçlı)
            </Typography>
            <Typography component="li" variant="body1">
              İş ortakları (anonim istatistiksel veriler)
            </Typography>
            <Typography component="li" variant="body1">
              Güvenlik amaçlı resmi kurumlara bildirim
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            8. Çocukların Verilerinin Korunması
          </Typography>
          <Typography variant="body1" paragraph>
            18 yaşından küçük çocukların verilerine özel koruma sağlanır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              18 yaş altı kullanıcılar platform kaydı yapamaz
            </Typography>
            <Typography component="li" variant="body1">
              Çocuk verisi tespit edildiğinde derhal silinir
            </Typography>
            <Typography component="li" variant="body1">
              Yaş doğrulaması sürekli kontrol edilir
            </Typography>
            <Typography component="li" variant="body1">
              Ebeveyn onayı gerektiren durumlar özel işlenir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            9. Veri İhlali Durumunda Yapılacaklar
          </Typography>
          <Typography variant="body1" paragraph>
            Olası veri ihlali durumlarında takip edilen protokol:
          </Typography>
          <Box component="ol" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              İhlal tespit edilir edilmez güvenlik önlemleri alınır
            </Typography>
            <Typography component="li" variant="body1">
              72 saat içinde Kişisel Verileri Koruma Kurulu'na bildirim yapılır
            </Typography>
            <Typography component="li" variant="body1">
              Etkilenen kullanıcılar derhal bilgilendirilir
            </Typography>
            <Typography component="li" variant="body1">
              İhlal nedenleri araştırılır ve önlemler alınır
            </Typography>
            <Typography component="li" variant="body1">
              Sürekli izleme ve iyileştirme çalışmaları yapılır
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            10. Haklarınızı Kullanma
          </Typography>
          <Typography variant="body1" paragraph>
            Kişisel veri haklarınızı kullanmak için aşağıdaki yöntemlerle
            başvurabilirsiniz:
          </Typography>
          <Box
            sx={{
              pl: 2,
              borderLeft: "4px solid #D34237",
              bgcolor: "#f5f5f5",
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography variant="body1">
              <strong>E-posta:</strong> dataprotection@trucksbus.com
            </Typography>
            <Typography variant="body1">
              <strong>Telefon:</strong> +90 (555) 123 45 67
            </Typography>
            <Typography variant="body1">
              <strong>Posta:</strong> İstanbul, Türkiye (Veri Koruma Birimi)
            </Typography>
            <Typography variant="body1">
              <strong>Online Form:</strong> Platform üzerindeki veri talebi
              formu
            </Typography>
          </Box>

          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            Başvurularınız en geç 30 gün içerisinde yanıtlanır. Talep edilen
            işlem ücretsizdir, ancak dosya kopyası gibi maliyetli işlemler için
            makul ücret alınabilir.
          </Typography>

          <Alert severity="success" sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>Güvence Veriyoruz:</strong> Kişisel verileriniz hiçbir
              zaman ticari amaçlarla satılmaz veya kiralanmaz. Verilerinizin
              güvenliği için sürekli yatırım yapıyoruz.
            </Typography>
          </Alert>

          <Typography
            variant="body2"
            sx={{ mt: 4, color: "#666", fontStyle: "italic" }}
          >
            Bu veri koruma politikası, yasal değişiklikler ve teknolojik
            gelişmeler doğrultusunda düzenli olarak gözden geçirilir ve
            güncellenir.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default PersonalDataProtection;
