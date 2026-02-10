import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  ExpandMore,
  Help,
  Email,
  Chat,
  VideoCall,
  Search,
  Security,
  Payment,
  DirectionsCar,
} from "@mui/icons-material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const HelpGuide: React.FC = () => {
  const helpCategories = [
    {
      icon: <DirectionsCar sx={{ fontSize: 48, color: "#D34237" }} />,
      title: "İlan Verme",
      description: "Araç ilanı nasıl verilir, fotoğraf ekleme ve düzenleme",
      badge: "Popüler",
    },
    {
      icon: <Search sx={{ fontSize: 48, color: "#D34237" }} />,
      title: "Araç Arama",
      description: "Filtreleme, karşılaştırma ve gelişmiş arama özellikları",
      badge: "Yeni",
    },
    {
      icon: <Payment sx={{ fontSize: 48, color: "#D34237" }} />,
      title: "Ödeme ve Paketler",
      description: "Premium üyelik, ödeme yöntemleri ve faturalama",
      badge: "",
    },
    {
      icon: <Security sx={{ fontSize: 48, color: "#D34237" }} />,
      title: "Güvenlik",
      description:
        "Hesap güvenliği, dolandırıcılık önleme ve güvenli alışveriş",
      badge: "Önemli",
    },
  ];

  const faqData = [
    {
      category: "Genel",
      questions: [
        {
          q: "TrucksBus nedir ve nasıl çalışır?",
          a: "TrucksBus, ticari araç alım-satım platformudur. Kamyon, otobüs, minibüs, dorsе ve diğer ticari araçların güvenli bir şekilde alınıp satılabileceği bir platformdur. Satıcılar araçlarını listeler, alıcılar arama yapar ve güvenli iletişim kurar.",
        },
        {
          q: "Ücretsiz mi kullanabilirim?",
          a: "Evet! TrucksBus'ı ücretsiz kullanabilirsiniz. Temel araç arama, iletişim kurma ve ilan görüntüleme ücretsizdir. Premium özellikler için ücretli paketlerimiz mevcuttur.",
        },
        {
          q: "Hangi araç türlerini bulabilirim?",
          a: "Platformumuzda kamyon, otobüs, minibüs, dorsе, çekici, damperli, tanker, silobas, lowbed, konteyner taşıyıcı ve daha birçok ticari araç türünü bulabilirsiniz.",
        },
      ],
    },
    {
      category: "İlan Verme",
      questions: [
        {
          q: "Nasıl ilan verebirim?",
          a: "1. Hesabınıza giriş yapın, 2. 'İlan Ver' butonuna tıklayın, 3. Araç türünü seçin, 4. Detayları doldurun, 5. Fotoğrafları ekleyin, 6. İlanınızı yayınlayın. İlan verme tamamen ücretsizdir.",
        },
        {
          q: "Kaç fotoğraf ekleyebilirim?",
          a: "Ücretsiz üyelikte 5 adet, Premium üyelikte 20 adete kadar fotoğraf ekleyebilirsiniz. Fotoğraflar araç satışında çok önemlidir, mümkün olduğunca fazla açıdan fotoğraf eklemenizi öneririz.",
        },
        {
          q: "İlanım ne kadar süre yayında kalır?",
          a: "Ücretsiz ilanlar 30 gün, Premium ilanlar 90 gün yayında kalır. İlan süreniz dolmadan önce e-posta ile uyarı alırsınız.",
        },
      ],
    },
    {
      category: "Güvenlik",
      questions: [
        {
          q: "Dolandırıcılıktan nasıl korunurum?",
          a: "1. Sadece güvenilir satıcılarla çalışın, 2. Ödemeden önce aracı mutlaka görün, 3. Ön ödeme isteyenlere dikkat edin, 4. Şüpheli durumları bize bildirin, 5. Resmi evrakları kontrol edin.",
        },
        {
          q: "Güvenli ödeme yöntemleri nelerdir?",
          a: "Kredi kartı, havale/EFT, çek ve nakit ödeme güvenli yöntemlerdir. Kripto para, yurt dışı havalesi gibi yöntemlerden kaçının. Büyük meblağlarda bankacılık kanallarını tercih edin.",
        },
        {
          q: "Şüpheli bir ilan nasıl bildirerim?",
          a: "İlan sayfasında 'Şikayet Et' butonunu kullanın veya iletisim@trucksbus.com.tr adresine yazın. Ekibimiz 24 saat içinde inceleme yapar.",
        },
      ],
    },
    {
      category: "Teknik Destek",
      questions: [
        {
          q: "Mobil uygulamanız var mı?",
          a: "Evet! iOS ve Android uygulamalarımızı App Store ve Google Play'den indirebilirsiniz. Web sitemizdeki tüm özelliklere mobil uygulamadan da erişebilirsiniz.",
        },
        {
          q: "Şifremi unuttum, ne yapmalıyım?",
          a: "Giriş sayfasında 'Şifremi Unuttum' linkini tıklayın. E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderilecektir.",
        },
        {
          q: "Fotoğraf yükleyemiyorum, sorun nedir?",
          a: "Fotoğraf boyutu 5MB'dan küçük olmalı ve JPG/PNG formatında olmalıdır. İnternet bağlantınızı kontrol edin. Sorun devam ederse teknik ekibimizle iletişime geçin.",
        },
      ],
    },
  ];

  const contactMethods = [
    {
      icon: <Email sx={{ fontSize: 32, color: "#D34237" }} />,
      title: "E-posta Desteği",
      description: "Detaylı sorularınız için",
      contact: "iletisim@trucksbus.com.tr",
      hours: "24 saat içinde yanıt",
    },
    {
      icon: <Chat sx={{ fontSize: 32, color: "#D34237" }} />,
      title: "Canlı Sohbet",
      description: "Anında destek alın",
      contact: "Platform üzerinden",
      hours: "09:00-22:00 arası",
    },
    {
      icon: <VideoCall sx={{ fontSize: 32, color: "#D34237" }} />,
      title: "Video Görüşme",
      description: "Teknik konularda detaylı yardım",
      contact: "Randevu ile",
      hours: "İş günleri 09:00-18:00",
    },
  ];

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
            Yardım Rehberi
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
            >
              TrucksBus platformunu en verimli şekilde kullanmanız için
              hazırlanmış kapsamlı yardım rehberi. Aradığınızı bulamazsanız
              destek ekibimizle iletişime geçin.
            </Typography>
          </Alert>

          {/* Ana Yardım Kategorileri */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "#313B4C",
              fontWeight: "bold",
              mb: 3,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            Ana Yardım Konuları
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, md: 3 },
              mb: { xs: 4, md: 6 },
            }}
          >
            {helpCategories.map((category, index) => (
              <Box
                key={index}
                sx={{
                  flex: "1 1 280px",
                  minWidth: { xs: "100%", sm: "280px" },
                }}
              >
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": { elevation: 4, transform: "translateY(-2px)" },
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  <CardContent
                    sx={{ flex: 1, textAlign: "center", p: { xs: 2, md: 3 } }}
                  >
                    {category.badge && (
                      <Chip
                        label={category.badge}
                        color="primary"
                        size="small"
                        sx={{ position: "absolute", top: 8, right: 8 }}
                      />
                    )}
                    {category.icon}
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        mt: 2,
                        mb: 1,
                        fontWeight: "bold",
                        fontSize: { xs: "1rem", md: "1.25rem" },
                      }}
                    >
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Sıkça Sorulan Sorular */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mb: 3 }}
          >
            <Help sx={{ mr: 1, verticalAlign: "middle" }} />
            Sıkça Sorulan Sorular
          </Typography>

          {faqData.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#D34237", fontWeight: "bold", mb: 2 }}
              >
                {category.category}
              </Typography>

              {category.questions.map((faq, faqIndex) => (
                <Accordion key={faqIndex} elevation={1} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                      {faq.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ color: "#666" }}>
                      {faq.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}

          <Divider sx={{ mb: 4 }} />

          {/* İletişim Yöntemleri */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mb: 3 }}
          >
            Destek İletişim Kanalları
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
            {contactMethods.map((method, index) => (
              <Box key={index} sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <Card elevation={1} sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {method.icon}
                      <Typography
                        variant="h6"
                        sx={{ ml: 2, fontWeight: "bold" }}
                      >
                        {method.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {method.description}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#D34237", mb: 1 }}
                    >
                      {method.contact}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.hours}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Hızlı Başlangıç Rehberi */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 6, mb: 3 }}
          >
            Hızlı Başlangıç Rehberi
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
            <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
              <Paper elevation={1} sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#D34237", fontWeight: "bold" }}
                >
                  Alıcılar İçin
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Ücretsiz hesap oluşturun
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Arama filtrelerini kullanarak araç bulun
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    İlan detaylarını inceleyin
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Satıcı ile güvenli iletişim kurun
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Aracı inceleyip güvenli ödeme yapın
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
              <Paper elevation={1} sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#D34237", fontWeight: "bold" }}
                >
                  Satıcılar İçin
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Hesabınızı doğrulayın
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Araç bilgilerini detaylı doldurun
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Kaliteli fotoğraflar ekleyin
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Rekabetçi fiyat belirleyin
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Alıcı sorularını hızlı yanıtlayın
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Güvenlik İpuçları */}
          <Alert severity="warning" sx={{ mb: 4 }}>
            <Typography variant="body2">
              <strong>Güvenlik İpuçları:</strong> Hiçbir zaman ön ödeme
              yapmayın, aracı görmeden para transferi yapmayın, şüpheli ilanları
              bildirin, resmi evrakları mutlaka kontrol edin.
            </Typography>
          </Alert>

          {/* Video Rehberler */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 6, mb: 3 }}
          >
            Video Rehberler
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
            <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    İlan Verme Rehberi
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Adım adım ilan verme süreci
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#D34237", fontWeight: "bold" }}
                  >
                    ⏱️ 5 dakika
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Güvenli Alışveriş
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Dolandırıcılıktan korunma yolları
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#D34237", fontWeight: "bold" }}
                  >
                    ⏱️ 8 dakika
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Gelişmiş Arama
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Filtreleme ve karşılaştırma
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#D34237", fontWeight: "bold" }}
                  >
                    ⏱️ 6 dakika
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 4,
              color: "#666",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            Bu rehber düzenli olarak güncellenir. Güncel bilgiler için platform
            duyurularını takip edin.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default HelpGuide;
