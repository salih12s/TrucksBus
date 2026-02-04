import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  Gavel,
  Security,
  AccountBalance,
  Description,
} from "@mui/icons-material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const ContractsAndRules: React.FC = () => {
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
            Sözleşmeler ve Kurallar
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ mb: 3, color: "#666", textAlign: "center" }}
          >
            TrucksBus platformunu düzenleyen temel sözleşme ve kurallar
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {/* Kural Kategorileri */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              mb: 4,
            }}
          >
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Gavel sx={{ color: "#D34237", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Platform Kuralları
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Platform kullanımını düzenleyen temel kurallar ve yaptırımlar
                </Typography>
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Security sx={{ color: "#D34237", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Güvenlik Politikaları
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Kullanıcı güvenliği ve veri koruma politikaları
                </Typography>
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AccountBalance sx={{ color: "#D34237", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Ticari Kurallar
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Alım-satım işlemlerini düzenleyen ticari kurallar
                </Typography>
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Description sx={{ color: "#D34237", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    İlan Kuralları
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  İlan verme ve yönetme süreçlerinin kuralları
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            1. Genel Platform Kuralları
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus platformunu kullanırken uymanız gereken temel kurallar:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Gerçek kimlik bilgilerinizi kullanmak zorunludur
            </Typography>
            <Typography component="li" variant="body1">
              18 yaşından küçük kişiler platformu kullanamaz
            </Typography>
            <Typography component="li" variant="body1">
              Sadece ticari araçlar için ilan verilebilir
            </Typography>
            <Typography component="li" variant="body1">
              Her kullanıcı maksimum 10 aktif ilan verebilir
            </Typography>
            <Typography component="li" variant="body1">
              Satılan araçların ilanları 24 saat içinde kaldırılmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              Aynı araç için birden fazla ilan verilemez
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. İlan Verme Kuralları
          </Typography>
          <Typography variant="body1" paragraph>
            Kaliteli ve güvenilir ilanlar için uyulması gereken kurallar:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              İlan başlığı açık ve net olmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              Araç fotoğrafları gerçek ve güncel olmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              Minimum 3, maksimum 20 fotoğraf yüklenebilir
            </Typography>
            <Typography component="li" variant="body1">
              Fiyat bilgisi TL cinsinden belirtilmelidir
            </Typography>
            <Typography component="li" variant="body1">
              Araç durumu dürüstçe açıklanmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              İletişim bilgileri doğru ve güncel olmalıdır
            </Typography>
            <Typography component="li" variant="body1">
              Hasar geçmişi varsa mutlaka belirtilmelidir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            3. Güvenlik ve Dolandırıcılık Önleme
          </Typography>
          <Typography variant="body1" paragraph>
            Platform güvenliği için alınan önlemler ve kullanıcı sorumlulukları:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Şüpheli ilanlar otomatik olarak incelemeye alınır
            </Typography>
            <Typography component="li" variant="body1">
              Kimlik doğrulaması yapılmamış kullanıcılarla dikkatli olun
            </Typography>
            <Typography component="li" variant="body1">
              Ön ödeme talep eden satıcılardan kaçının
            </Typography>
            <Typography component="li" variant="body1">
              Araç görme ve test sürüşü yapmadan ödeme yapmayın
            </Typography>
            <Typography component="li" variant="body1">
              Şüpheli durumları derhal platform yönetimine bildirin
            </Typography>
            <Typography component="li" variant="body1">
              Bankacılık bilgilerinizi asla paylaşmayın
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. Yasak Faaliyetler ve Yaptırımlar
          </Typography>
          <Typography variant="body1" paragraph>
            Aşağıdaki faaliyetler kesinlikle yasak olup, tespit edildiğinde
            hesap kapatma ve yasal işlem başlatma dahil çeşitli yaptırımlar
            uygulanır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Çalıntı araç satışı
            </Typography>
            <Typography component="li" variant="body1">
              Sahte belge veya fotoğraf kullanımı
            </Typography>
            <Typography component="li" variant="body1">
              Dolandırıcılık amaçlı ilan verme
            </Typography>
            <Typography component="li" variant="body1">
              Başka kişiler adına yetkisiz ilan verme
            </Typography>
            <Typography component="li" variant="body1">
              Platform dışı iletişim zorlaması
            </Typography>
            <Typography component="li" variant="body1">
              Spam veya kötü amaçlı mesaj gönderme
            </Typography>
            <Typography component="li" variant="body1">
              Rekabet karşıtı faaliyetlerde bulunma
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. Ticari İşlem Kuralları
          </Typography>
          <Typography variant="body1" paragraph>
            Alım-satım işlemlerinde dikkat edilmesi gereken kurallar:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Tüm ödemeler alıcı-satıcı arasında gerçekleşir
            </Typography>
            <Typography component="li" variant="body1">
              Platform işlem komisyonu almaz
            </Typography>
            <Typography component="li" variant="body1">
              Sözleşme imzalamadan önce aracı mutlaka inceleyin
            </Typography>
            <Typography component="li" variant="body1">
              Trafik çıkış işlemleri alıcı sorumluluğundadır
            </Typography>
            <Typography component="li" variant="body1">
              Satış sonrası sorunlarda platform aracılık edebilir
            </Typography>
            <Typography component="li" variant="body1">
              Garanti şartları alıcı-satıcı arasında belirlenir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. İhlaller ve Şikayet Süreci
          </Typography>
          <Typography variant="body1" paragraph>
            Kural ihlalleri durumunda izlenecek süreç:
          </Typography>
          <Box component="ol" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Şikayet platform üzerinden veya destek hattından yapılır
            </Typography>
            <Typography component="li" variant="body1">
              İhlal iddiası 24-48 saat içinde incelenir
            </Typography>
            <Typography component="li" variant="body1">
              Gerekirse ilgili kullanıcıdan açıklama istenir
            </Typography>
            <Typography component="li" variant="body1">
              İhlal tespit edilirse uygun yaptırım uygulanır
            </Typography>
            <Typography component="li" variant="body1">
              Ciddi ihlallerde yasal süreç başlatılabilir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. İletişim ve Destek
          </Typography>
          <Typography variant="body1" paragraph>
            Kurallar hakkında sorularınız için iletişim bilgilerimiz:
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
              <strong>Canlı Destek:</strong> 7/24 platform üzerinden
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 4, color: "#666", fontStyle: "italic" }}
          >
            Bu kurallar, platform geliştirmeleri ve kullanıcı geri
            bildirimlerine göre düzenli olarak gözden geçirilir ve güncellenir.
            Güncellemeler platform üzerinden duyurulur.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default ContractsAndRules;
