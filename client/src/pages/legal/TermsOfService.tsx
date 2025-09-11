import React from "react";
import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const TermsOfService: React.FC = () => {
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
            Kullanım Şartları
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
            1. Genel Hükümler
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus platformunu kullanarak bu kullanım şartlarını kabul etmiş
            sayılırsınız. Bu şartlar, ticari araç alım-satım platformumuzun
            kullanımını düzenler ve tüm kullanıcılar için bağlayıcıdır.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. Platform Tanımı
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus, kamyon, kamyonet, çekici, treyler, römork, otobüs,
            midibüs, minibüs ve benzeri ticari araçların alım-satımını
            kolaylaştıran dijital bir platformdur. Platform, alıcı ve satıcıları
            bir araya getiren aracı bir hizmet sunar.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            3. Kullanıcı Yükümlülükleri
          </Typography>
          <Typography variant="body1" paragraph>
            Platform kullanıcıları aşağıdaki yükümlülükleri kabul eder:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Doğru ve güncel bilgi sağlamak
            </Typography>
            <Typography component="li" variant="body1">
              Sahte veya yanıltıcı ilan vermemek
            </Typography>
            <Typography component="li" variant="body1">
              Diğer kullanıcılara saygılı davranmak
            </Typography>
            <Typography component="li" variant="body1">
              Yasal olmayan faaliyetlerde bulunmamak
            </Typography>
            <Typography component="li" variant="body1">
              Platform kurallarına uymak
            </Typography>
            <Typography component="li" variant="body1">
              Telif haklarını ihlal etmemek
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. İlan Verme Kuralları
          </Typography>
          <Typography variant="body1" paragraph>
            İlan verirken dikkat edilmesi gereken kurallar:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Aracın gerçek fotoğraflarını kullanmak
            </Typography>
            <Typography component="li" variant="body1">
              Araç durumunu doğru şekilde belirtmek
            </Typography>
            <Typography component="li" variant="body1">
              Fiyat bilgisini net olarak vermek
            </Typography>
            <Typography component="li" variant="body1">
              İletişim bilgilerini güncel tutmak
            </Typography>
            <Typography component="li" variant="body1">
              Aynı araç için birden fazla ilan vermemek
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. Yasaklı Faaliyetler
          </Typography>
          <Typography variant="body1" paragraph>
            Aşağıdaki faaliyetler kesinlikle yasaktır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Çalıntı araç satışı
            </Typography>
            <Typography component="li" variant="body1">
              Sahte belge kullanımı
            </Typography>
            <Typography component="li" variant="body1">
              Dolandırıcılık faaliyetleri
            </Typography>
            <Typography component="li" variant="body1">
              Spam ve istenmeyen mesajlar
            </Typography>
            <Typography component="li" variant="body1">
              Başka kullanıcıların hesaplarını çalmaya çalışmak
            </Typography>
            <Typography component="li" variant="body1">
              Platform güvenliğini tehdit edici davranışlar
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. Sorumluluk Sınırları
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus, kullanıcılar arasındaki alım-satım işlemlerinde aracı rol
            oynar. Araçların durumu, fiyatı ve satış sonrası sorunlardan
            doğrudan sorumlu değildir. Kullanıcılar kendi araştırmalarını
            yapmalı ve dikkatli davranmalıdır.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. Hesap Askıya Alma ve Sonlandırma
          </Typography>
          <Typography variant="body1" paragraph>
            Kullanım şartlarını ihlal eden kullanıcıların hesapları uyarı
            verilmeksizin askıya alınabilir veya sonlandırılabilir. Bu durumda
            platform yönetimi nihai kararı verme hakkına sahiptir.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            8. Güncelleme Hakları
          </Typography>
          <Typography variant="body1" paragraph>
            Bu kullanım şartları, platform geliştirmeleri ve yasal değişiklikler
            doğrultusunda güncellenebilir. Önemli değişiklikler kullanıcılara
            önceden duyurulur.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            9. İletişim ve Şikayetler
          </Typography>
          <Typography variant="body1" paragraph>
            Kullanım şartları ile ilgili sorularınız için bizimle iletişime
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
              <strong>E-posta:</strong> support@trucksbus.com
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
            Bu kullanım şartlarını kabul ederek, TrucksBus platformunu güvenli
            ve etik bir şekilde kullanacağınızı beyan etmiş olursunuz.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default TermsOfService;
