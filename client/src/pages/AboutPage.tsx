import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            color: "#313B4C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          🚛 Trucksbus Hakkında
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Türkiye'nin En Güvenilir Ticari Araç Platformu
        </Typography>
      </Box>

      {/* Main Content */}
      <Card sx={{ p: 4, mb: 4 }}>
        <CardContent>
          <Typography
            variant="body1"
            paragraph
            sx={{ textAlign: "justify", lineHeight: 1.8 }}
          >
            TrucksBus; kamyon, çekici, otobüs, minibüs–midibüs, dorse ve benzeri
            ağır ticari araçların alım–satımını kolaylaştıran modern bir
            pazaryeridir. Amacımız; alıcıyla satıcıyı aynı masaya hızla, şeffaf
            bilgilerle ve net adımlarla getirip işlemleri güven içinde
            tamamlamanızı sağlamak.
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ textAlign: "justify", lineHeight: 1.8 }}
          >
            Deneyimli ekibimiz ve güncel teknoloji yığınımızla; detaylı ilan
            yapısı, akıllı filtreleme, güçlü arama, mesajlaşma ve destek
            süreçleriyle hem bireysel kullanıcılar hem de kurumsal müşteriler
            için verimli bir deneyim tasarlıyoruz.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 3, color: "#313B4C" }}
          >
            Misyonumuz
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ textAlign: "justify", lineHeight: 1.8 }}
          >
            Ağır ticari araç pazarında, güvenilir bilgiyi standart hâline
            getirip, karar alma süresini kısaltan, pazarlık ve iletişimi
            sadeleştiren bir platform sunmak.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 3, color: "#313B4C" }}
          >
            Vizyonumuz
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ textAlign: "justify", lineHeight: 1.8 }}
          >
            Türkiye'de ticari araç ekosisteminin buluşma noktası olmak; araç
            keşfinden ilana, vitrinden satış sonrası süreçlere kadar uçtan uca
            değeri artırmak.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 3, color: "#313B4C" }}
          >
            Neden TruckBus?
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body1"
              paragraph
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>✅</span>
              <span>
                <strong>Geniş yelpaze & akıllı filtreler:</strong> Araç tipine,
                modele, yıla, km'ye, donanıma göre hızlıca daraltma.
              </span>
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>✅</span>
              <span>
                <strong>Doğrulanmış içerik:</strong> Net başlık, açıklama, medya
                ve teknik bilgilerle şeffaflık.
              </span>
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>✅</span>
              <span>
                <strong>Hızlı iletişim:</strong> İlana özel mesajlaşma ve
                bildirimlerle vakit kaybını azaltan süreç.
              </span>
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>✅</span>
              <span>
                <strong>Kurumsal vitrin:</strong> Galeri ve filo sahipleri için
                düzenli profil, ilan yönetimi ve görünürlük avantajları.
              </span>
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
            >
              <span style={{ color: "#4caf50", fontWeight: "bold" }}>✅</span>
              <span>
                <strong>Mobil uyumlu arayüz:</strong> Telefon, tablet,
                masaüstünde akıcı deneyim.
              </span>
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 3, color: "#313B4C" }}
          >
            Nasıl Çalışır?
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" paragraph>
              <strong>Keşfet & filtrele:</strong> İhtiyacına göre kategorileri
              gez, filtreleri uygula.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>İlanı incele:</strong> Fotoğraflar, açıklama ve teknik
              detayları kontrol et.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>İletişime geç:</strong> Mesaj gönder, sorularını sor ve
              süreci başlat.
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 3, color: "#313B4C" }}
          >
            Kime Hitap Ediyoruz?
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" paragraph>
              <strong>Bireysel kullanıcılar:</strong> Doğru aracı kolayca
              bulmak.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>Filo yöneticileri:</strong> Envanter yönetimine uygun,
              hedefe yönelik arama.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>Galeriler & bayiler:</strong> Düzenli ilan akışı ve
              görünürlük.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>Tedarikçiler:</strong> Üst yapı, yedek parça, aksesuar
              için doğru kitle.
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 3, color: "#313B4C" }}
          >
            Güvenlik ve KVKK
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ textAlign: "justify", lineHeight: 1.8 }}
          >
            Kullanıcı verilerinin korunmasına ve şeffaflığa önem veriyoruz. KVKK
            mevzuatına uygun süreçler ve makul güvenlik önlemleriyle kişisel
            verilerin işlenmesi, saklanması ve paylaşılması konusunda titiz
            davranıyoruz. Platform ilkelerimiz; saygı, dürüstlük ve sorumlu
            kullanım üzerine kurulu.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ mt: 3, color: "#313B4C" }}
          >
            Yol Haritamız
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" paragraph>
              <strong>Gelişmiş arama & sıralama:</strong> Daha isabetli sonuçlar
              için akıllı filtreler.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>Kurumsal mağaza deneyimi:</strong> Vitrin, istatistikler
              ve ekip yönetimi.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>Mobil uygulamalar:</strong> Yol üzerindeyken bile ilan
              yönetimi ve keşif.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* CTA Buttons */}
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mr: 2, mb: 2 }}
        >
          İlan Ver
        </Button>
        <Button variant="outlined" color="primary" size="large" sx={{ mb: 2 }}>
          İletişime Geç
        </Button>
      </Box>
    </Container>
  );
};

export default AboutPage;
