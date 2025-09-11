import React from "react";
import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const PrivacyPolicy: React.FC = () => {
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
            Gizlilik Politikası
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
            1. Giriş
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus olarak, kişisel verilerinizin güvenliği bizim için son
            derece önemlidir. Bu gizlilik politikası, ticari araç alım-satım
            platformumuzda toplanan kişisel verilerin nasıl işlendiği, korunduğu
            ve kullanıldığı hakkında detaylı bilgi vermektedir.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. Toplanan Bilgiler
          </Typography>
          <Typography variant="body1" paragraph>
            Platformumuzda aşağıdaki bilgiler toplanmaktadır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Kimlik bilgileri (ad, soyad, T.C. kimlik numarası)
            </Typography>
            <Typography component="li" variant="body1">
              İletişim bilgileri (telefon, e-posta, adres)
            </Typography>
            <Typography component="li" variant="body1">
              Araç bilgileri ve ilan detayları
            </Typography>
            <Typography component="li" variant="body1">
              Platform kullanım verileri
            </Typography>
            <Typography component="li" variant="body1">
              Çerez ve benzeri teknolojilerle toplanan veriler
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
            Toplanan kişisel veriler aşağıdaki amaçlarla kullanılmaktadır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Ticari araç alım-satım hizmetlerinin sunulması
            </Typography>
            <Typography component="li" variant="body1">
              Kullanıcı hesabının oluşturulması ve yönetimi
            </Typography>
            <Typography component="li" variant="body1">
              İlan yayınlama ve görüntüleme hizmetleri
            </Typography>
            <Typography component="li" variant="body1">
              Müşteri destek hizmetlerinin sağlanması
            </Typography>
            <Typography component="li" variant="body1">
              Güvenlik ve dolandırıcılık önleme
            </Typography>
            <Typography component="li" variant="body1">
              Yasal yükümlülüklerin yerine getirilmesi
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. Veri Güvenliği
          </Typography>
          <Typography variant="body1" paragraph>
            Kişisel verilerinizi korumak için teknik ve idari güvenlik önlemleri
            alınmaktadır. Veriler şifreli ortamlarda saklanır ve yetkisiz
            erişimlere karşı korunur. Sadece yetkili personel tarafından,
            belirlenen amaçlar doğrultusunda erişim sağlanır.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. Çerezler (Cookies)
          </Typography>
          <Typography variant="body1" paragraph>
            Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler
            kullanılmaktadır. Çerez tercihleri tarayıcı ayarlarından
            yönetilebilir. Detaylı bilgi için çerez politikamızı
            inceleyebilirsiniz.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. Kullanıcı Hakları
          </Typography>
          <Typography variant="body1" paragraph>
            KVKK kapsamında aşağıdaki haklara sahipsiniz:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin işlenip işlenmediğini öğrenme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin düzeltilmesini isteme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin silinmesini isteme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin aktarıldığı üçüncü kişileri öğrenme
            </Typography>
            <Typography component="li" variant="body1">
              İşleme işleminin otomasyon yoluyla yapılıp yapılmadığını öğrenme
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. İletişim
          </Typography>
          <Typography variant="body1" paragraph>
            Gizlilik politikamız hakkında sorularınız için bizimle iletişime
            geçebilirsiniz:
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
              <strong>E-posta:</strong> privacy@trucksbus.com
            </Typography>
            <Typography variant="body1">
              <strong>Telefon:</strong> +90 (555) 123 45 67
            </Typography>
            <Typography variant="body1">
              <strong>Adres:</strong> İstanbul, Türkiye
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 4, color: "#666", fontStyle: "italic" }}
          >
            Bu gizlilik politikası, yasal değişiklikler ve platform
            güncellemeleri doğrultusunda düzenli olarak gözden geçirilir ve
            güncellenir.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default PrivacyPolicy;
