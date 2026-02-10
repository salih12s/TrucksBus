import React from "react";
import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const UsageConditions: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 }, flex: 1 }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              color: "#D34237",
              fontWeight: "bold",
              textAlign: "center",
              mb: 4,
              fontSize: { xs: "1.5rem", md: "2.5rem" },
            }}
          >
            Kullanım Koşulları
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 3, color: "#666" }}>
            TrucksBus platformunun kullanım koşulları ve şartları
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3, color: "#666" }}>
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            1. Kabul ve Onay
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus platformunu kullanarak bu kullanım koşullarını tam olarak
            okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Bu
            koşulları kabul etmiyorsanız platformu kullanmamalısınız.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. Platform Tanımı ve Hizmetler
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus, ticari araçların alım-satımını kolaylaştıran dijital bir
            platformdur:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Kamyon, kamyonet, çekici alım-satım hizmetleri
            </Typography>
            <Typography component="li" variant="body1">
              Otobüs, midibüs, minibüs pazarlama platformu
            </Typography>
            <Typography component="li" variant="body1">
              Treyler, römork, dorse ilanları
            </Typography>
            <Typography component="li" variant="body1">
              Ticari araç yedek parça ve aksesuar satışı
            </Typography>
            <Typography component="li" variant="body1">
              Araç değerlendirme ve karşılaştırma araçları
            </Typography>
            <Typography component="li" variant="body1">
              Kullanıcı iletişim ve mesajlaşma sistemi
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            3. Kullanıcı Kategorileri
          </Typography>
          <Typography variant="body1" paragraph>
            Platform farklı kullanıcı kategorilerine hizmet verir:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Bireysel Kullanıcılar:</strong> Şahsi araç alım-satımı
              yapanlar
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Ticari Kullanıcılar:</strong> Profesyonel araç ticareti
              yapanlar
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Yetkili Bayiler:</strong> Marka bayisi statüsündeki
              kullanıcılar
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Kurumsal Müşteriler:</strong> Filo yönetimi yapan
              şirketler
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Ziyaretçiler:</strong> Kayıt olmadan ilan görüntüleyenler
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. Platform Kullanım Şartları
          </Typography>
          <Typography variant="body1" paragraph>
            Platformu kullanabilmek için aşağıdaki şartları sağlamalısınız:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              18 yaşından büyük olmak veya yasal vasi onayına sahip olmak
            </Typography>
            <Typography component="li" variant="body1">
              Türkiye Cumhuriyeti sınırları içinde bulunmak
            </Typography>
            <Typography component="li" variant="body1">
              Geçerli kimlik ve iletişim bilgilerine sahip olmak
            </Typography>
            <Typography component="li" variant="body1">
              Platform kurallarını kabul etmek
            </Typography>
            <Typography component="li" variant="body1">
              Teknik gereksinimleri karşılayan cihaz kullanmak
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. İlan Yayınlama Koşulları
          </Typography>
          <Typography variant="body1" paragraph>
            Platform üzerinde ilan yayınlamak için uyulması gereken koşullar:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Sadece sahip olduğunuz veya satış yetkisine sahip olduğunuz
              araçları ilan edebilirsiniz
            </Typography>
            <Typography component="li" variant="body1">
              İlan başlığı ve açıklaması gerçeği yansıtmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              Fotoğraflar araçtan çekilmiş gerçek görüntüler olmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              Fiyat bilgisi net ve güncel olarak belirtilmelidir
            </Typography>
            <Typography component="li" variant="body1">
              İletişim bilgileri doğru ve ulaşılabilir olmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              Teknik özellikler eksiksiz ve doğru girilmelidir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. Ödeme ve Ücretlendirme
          </Typography>
          <Typography variant="body1" paragraph>
            Platform kullanımı ile ilgili ücretlendirme politikası:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Temel platform kullanımı ücretsizdir
            </Typography>
            <Typography component="li" variant="body1">
              Premium özellikler için ücret alınabilir
            </Typography>
            <Typography component="li" variant="body1">
              İlan öne çıkarma hizmetleri ücretlidir
            </Typography>
            <Typography component="li" variant="body1">
              Kurumsal hesaplar için özel paketler mevcuttur
            </Typography>
            <Typography component="li" variant="body1">
              Ödeme işlemleri güvenli sistemler üzerinden yapılır
            </Typography>
            <Typography component="li" variant="body1">
              İade koşulları hizmet türüne göre değişir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. Sorumluluk ve Garantiler
          </Typography>
          <Typography variant="body1" paragraph>
            Platform kullanımında sorumluluk dağılımı:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              TrucksBus, kullanıcılar arasındaki işlemlerde aracı rol oynar
            </Typography>
            <Typography component="li" variant="body1">
              Araç kalitesi, durumu ve fiyatından satıcılar sorumludur
            </Typography>
            <Typography component="li" variant="body1">
              Alıcılar, satın alma öncesi araç incelemesi yapmakla yükümlüdür
            </Typography>
            <Typography component="li" variant="body1">
              Platform, ilanda verilen bilgilerin doğruluğunu garanti etmez
            </Typography>
            <Typography component="li" variant="body1">
              Teknik arızalar durumunda mümkün olan en kısa sürede müdahale
              edilir
            </Typography>
            <Typography component="li" variant="body1">
              Veri kaybı risklerine karşı düzenli yedekleme yapılır
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            8. Fikri Mülkiyet Hakları
          </Typography>
          <Typography variant="body1" paragraph>
            Platform ve içeriklerinin fikri mülkiyet hakları:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              TrucksBus markası ve logosu tescilli markadır
            </Typography>
            <Typography component="li" variant="body1">
              Platform yazılımı telif hakkı koruması altındadır
            </Typography>
            <Typography component="li" variant="body1">
              Kullanıcılar yükledikleri içerikler için lisans verirler
            </Typography>
            <Typography component="li" variant="body1">
              Üçüncü kişi içerikleri izin alınarak kullanılır
            </Typography>
            <Typography component="li" variant="body1">
              İzinsiz kullanım yasal takip gerektirir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            9. Hesap Sonlandırma
          </Typography>
          <Typography variant="body1" paragraph>
            Hesap sonlandırma durumları ve süreçleri:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Kullanıcılar hesaplarını istediği zaman kapatabilir
            </Typography>
            <Typography component="li" variant="body1">
              Kural ihlalleri durumunda hesap askıya alınabilir
            </Typography>
            <Typography component="li" variant="body1">
              Yasal gereklilikler durumunda hesap dondurulabilir
            </Typography>
            <Typography component="li" variant="body1">
              12 ay kullanılmayan hesaplar otomatik silinir
            </Typography>
            <Typography component="li" variant="body1">
              Sonlandırma sonrası veriler belirli süre arşivlenir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            10. Değişiklik Hakları
          </Typography>
          <Typography variant="body1" paragraph>
            Bu kullanım koşulları, platform geliştirmeleri ve yasal
            gerekliliklere göre güncellenebilir. Önemli değişiklikler
            kullanıcılara önceden duyurulur.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            11. Uygulanacak Hukuk
          </Typography>
          <Typography variant="body1" paragraph>
            Bu kullanım koşulları Türkiye Cumhuriyeti hukukuna tabidir.
            Uyuşmazlıklar İstanbul mahkemelerinde çözümlenir.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            12. İletişim Bilgileri
          </Typography>
          <Typography variant="body1" paragraph>
            Kullanım koşulları hakkında sorularınız için:
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
              <strong>E-posta:</strong> iletisim@trucksbus.com.tr
            </Typography>
            <Typography variant="body1">
              <strong>Adres:</strong> İstanbul, Türkiye
            </Typography>
            <Typography variant="body1">
              <strong>Çalışma Saatleri:</strong> Pazartesi-Cuma 09:00-18:00
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 4, color: "#666", fontStyle: "italic" }}
          >
            Bu kullanım koşullarını kabul ederek TrucksBus platformunu sorumlu
            bir şekilde kullanacağınızı taahhüt edersiniz.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default UsageConditions;
