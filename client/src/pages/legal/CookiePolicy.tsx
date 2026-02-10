import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Cookie, Settings, Analytics, Security } from "@mui/icons-material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const CookiePolicy: React.FC = () => {
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
            Çerez Yönetimi
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
            >
              Bu sayfa, TrucksBus platformunda kullanılan çerezler hakkında
              detaylı bilgi ve yönetim seçenekleri sunar. Çerez tercihlerinizi
              istediğiniz zaman değiştirebilirsiniz.
            </Typography>
          </Alert>

          <Typography
            variant="body1"
            paragraph
            sx={{
              mb: 3,
              color: "#666",
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {/* Çerez Türleri İkonları */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: { xs: 2, md: 4 },
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Cookie
                sx={{ fontSize: { xs: 36, md: 48 }, color: "#D34237", mb: 1 }}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
              >
                Temel Çerezler
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Analytics
                sx={{ fontSize: { xs: 36, md: 48 }, color: "#D34237", mb: 1 }}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
              >
                Analitik Çerezler
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Settings
                sx={{ fontSize: { xs: 36, md: 48 }, color: "#D34237", mb: 1 }}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
              >
                Fonksiyonel Çerezler
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Security sx={{ fontSize: 48, color: "#D34237", mb: 1 }} />
              <Typography variant="caption">Güvenlik Çerezleri</Typography>
            </Box>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            1. Çerez Nedir?
          </Typography>
          <Typography variant="body1" paragraph>
            Çerezler, web sitelerinin kullanıcıların bilgisayarlarına veya mobil
            cihazlarına yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar, web
            sitesinin daha iyi çalışmasını ve kullanıcı deneyiminin
            geliştirilmesini sağlar.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. TrucksBus'ta Kullanılan Çerez Türleri
          </Typography>

          <TableContainer component={Paper} elevation={1} sx={{ mt: 2, mb: 4 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <strong>Çerez Türü</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Amaç</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Süre</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Zorunluluk</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Temel Çerezler</TableCell>
                  <TableCell>Platform çalışması için gerekli</TableCell>
                  <TableCell>Oturum süresi</TableCell>
                  <TableCell>Zorunlu</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Analitik Çerezler</TableCell>
                  <TableCell>Kullanım istatistikleri</TableCell>
                  <TableCell>2 yıl</TableCell>
                  <TableCell>İsteğe bağlı</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Fonksiyonel Çerezler</TableCell>
                  <TableCell>Kişiselleştirme</TableCell>
                  <TableCell>1 yıl</TableCell>
                  <TableCell>İsteğe bağlı</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pazarlama Çerezleri</TableCell>
                  <TableCell>Hedefli reklamlar</TableCell>
                  <TableCell>6 ay</TableCell>
                  <TableCell>İsteğe bağlı</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Güvenlik Çerezleri</TableCell>
                  <TableCell>Dolandırıcılık önleme</TableCell>
                  <TableCell>30 gün</TableCell>
                  <TableCell>Zorunlu</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            3. Zorunlu Çerezler
          </Typography>
          <Typography variant="body1" paragraph>
            Bu çerezler platformun temel işlevlerini yerine getirmek için
            gereklidir ve devre dışı bırakılamaz:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Oturum Çerezleri:</strong> Giriş durumunuzu korur
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Güvenlik Çerezleri:</strong> Dolandırıcılık ve saldırıları
              önler
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Form Çerezleri:</strong> Form verilerini geçici olarak
              saklar
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Yük Dengeleme Çerezleri:</strong> Sunucu performansını
              optimize eder
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Tercih Çerezleri:</strong> Dil ve bölge ayarlarınızı
              hatırlar
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. İsteğe Bağlı Çerezler
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 3 }}
          >
            4.1 Analitik Çerezler
          </Typography>
          <Typography variant="body1" paragraph>
            Platform kullanımını anlamamızı sağlayan çerezler:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Sayfa ziyaret sayıları ve süresi
            </Typography>
            <Typography component="li" variant="body1">
              En popüler içerik ve özellikler
            </Typography>
            <Typography component="li" variant="body1">
              Kullanıcı davranış analizi
            </Typography>
            <Typography component="li" variant="body1">
              Hata raporlama ve performans ölçümü
            </Typography>
            <Typography component="li" variant="body1">
              A/B test sonuçları
            </Typography>
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 3 }}
          >
            4.2 Fonksiyonel Çerezler
          </Typography>
          <Typography variant="body1" paragraph>
            Kullanıcı deneyimini geliştiren kişiselleştirme çerezleri:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Arama filtreleri ve sıralama tercihleri
            </Typography>
            <Typography component="li" variant="body1">
              Favori ilanlar ve kayıtlı aramalar
            </Typography>
            <Typography component="li" variant="body1">
              Son görüntülenen araçlar
            </Typography>
            <Typography component="li" variant="body1">
              Karşılaştırma listesi
            </Typography>
            <Typography component="li" variant="body1">
              Özelleştirilmiş öneriler
            </Typography>
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 3 }}
          >
            4.3 Pazarlama Çerezleri
          </Typography>
          <Typography variant="body1" paragraph>
            Size uygun reklamları göstermek için kullanılan çerezler:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              İlgi alanlarınıza göre reklam gösterimi
            </Typography>
            <Typography component="li" variant="body1">
              Sosyal medya entegrasyonu
            </Typography>
            <Typography component="li" variant="body1">
              Remarketing kampanyaları
            </Typography>
            <Typography component="li" variant="body1">
              Reklam verimliliği ölçümü
            </Typography>
            <Typography component="li" variant="body1">
              Cross-device tracking (cihazlar arası takip)
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. Üçüncü Taraf Çerezleri
          </Typography>
          <Typography variant="body1" paragraph>
            Platform üzerinde kullanılan üçüncü taraf hizmetlerin çerezleri:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Google Analytics:</strong> Ziyaretçi istatistikleri ve
              davranış analizi
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Facebook Pixel:</strong> Sosyal medya entegrasyonu ve
              reklam optimizasyonu
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Google Ads:</strong> Reklam gösterimi ve ölçüm
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Hotjar:</strong> Kullanıcı deneyimi analizi
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Zendesk:</strong> Müşteri destek sistemi
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. Çerez Yönetimi
          </Typography>
          <Typography variant="body1" paragraph>
            Çerez tercihlerinizi yönetmek için aşağıdaki seçenekleri
            kullanabilirsiniz:
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 3 }}
          >
            6.1 Platform Ayarları
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Hesap ayarlarından çerez tercihlerini yönetin
            </Typography>
            <Typography component="li" variant="body1">
              Çerez kategorilerini ayrı ayrı açıp kapatın
            </Typography>
            <Typography component="li" variant="body1">
              Çerez geçmişini görüntüleyin
            </Typography>
            <Typography component="li" variant="body1">
              Anlık bildirimler alın
            </Typography>
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 3 }}
          >
            6.2 Tarayıcı Ayarları
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Tarayıcı ayarlarından tüm çerezleri engelleyin
            </Typography>
            <Typography component="li" variant="body1">
              Belirli web sitelerinin çerezlerini engelleyin
            </Typography>
            <Typography component="li" variant="body1">
              Mevcut çerezleri silin
            </Typography>
            <Typography component="li" variant="body1">
              Çerez uyarılarını aktifleştirin
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. Çerez Silme ve Etkiler
          </Typography>
          <Typography variant="body1" paragraph>
            Çerezleri silme durumunda yaşanabilecek etkiler:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Temel Çerezler:</strong> Platform düzgün çalışmayabilir
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Oturum Çerezleri:</strong> Tekrar giriş yapmanız
              gerekebilir
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Tercih Çerezleri:</strong> Ayarlarınız sıfırlanabilir
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Fonksiyonel Çerezler:</strong> Kişiselleştirme
              kaybolabilir
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Analitik Çerezler:</strong> Kullanım analizi yapılamaz
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            8. Mobil Uygulama Çerezleri
          </Typography>
          <Typography variant="body1" paragraph>
            Mobil uygulamada çerez benzeri teknolojiler:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Local Storage: Uygulama verilerini saklar
            </Typography>
            <Typography component="li" variant="body1">
              Push Notification Tokens: Bildirim gönderimi için
            </Typography>
            <Typography component="li" variant="body1">
              Device ID: Cihaz tanımlama için
            </Typography>
            <Typography component="li" variant="body1">
              App Cache: Performans optimizasyonu için
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            9. Çerez Politikası Güncellemeleri
          </Typography>
          <Typography variant="body1" paragraph>
            Bu çerez politikası düzenli olarak gözden geçirilir ve
            güncellenebilir. Önemli değişiklikler platform üzerinden duyurulur
            ve kullanıcıların onayı tekrar alınır.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            10. İletişim ve Destek
          </Typography>
          <Typography variant="body1" paragraph>
            Çerez politikası hakkında sorularınız için:
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
              <strong>Canlı Destek:</strong> Platform üzerinden 7/24
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>Önemli:</strong> Zorunlu çerezleri devre dışı bırakmanız
              durumunda platform düzgün çalışmayabilir. İsteğe bağlı çerezleri
              istediğiniz zaman yönetebilirsiniz.
            </Typography>
          </Alert>

          <Typography
            variant="body2"
            sx={{ mt: 4, color: "#666", fontStyle: "italic" }}
          >
            Bu çerez politikası, teknolojik gelişmeler ve yasal değişiklikler
            doğrultusunda düzenli olarak güncellenir.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default CookiePolicy;
