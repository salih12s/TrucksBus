import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowBack, Security, Gavel, Info } from "@mui/icons-material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {/* Ana Başlık */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Geri Dön
            </Button>
          </Box>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            🚛 TrucksBus Kullanım Sözleşmesi
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Güvenilir ve şeffaf ticaret için hukuki çerçevemiz
          </Typography>
          <Chip
            label="Son Güncelleme: 29 Eylül 2025"
            sx={{
              mt: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { lg: "1fr 300px" },
          }}
        >
          {/* Ana İçerik */}
          <Box>
            {/* Özet Uyarısı */}
            <Alert
              icon={<Info />}
              severity="info"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                <strong>Önemli:</strong> Bu sözleşme hem bireysel hem kurumsal
                üyeler için geçerlidir. Platform kullanımından önce tüm
                maddeleri dikkatlice okuyunuz.
              </Typography>
            </Alert>

            {/* Ana Sözleşme */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
              <Typography
                variant="h4"
                sx={{ mb: 3, color: "#2c3e50", fontWeight: "bold" }}
              >
                📋 Kullanım Şartları ve Koşulları
              </Typography>

              <Divider sx={{ mb: 4 }} />

              {/* Bölüm 1 - Platform Tanımı */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#4A90E2", fontWeight: "600" }}
                >
                  1. 🚛 Platform Tanımı ve Hizmetler
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                  TrucksBus, ticari araç alım-satımı için güvenli bir dijital
                  platform sunar:
                </Typography>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText
                      primary="🚚 Kamyon, çekici, otobüs, minibüs ve dorse ilanları"
                      secondary="Detaylı teknik özellikler ve fotoğraflarla profesyonel sunum"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="💬 Güvenli mesajlaşma sistemi"
                      secondary="Alıcı ve satıcı arasında korumalı iletişim imkanı"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="🔐 Kimlik doğrulamalı üyelik"
                      secondary="TC kimlik ve vergi numarası kontrolü ile güvenli ortam"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="💳 Güvenli ödeme sistemi (yakında)"
                      secondary="Escrow sistemi ile korumalı ödemeler"
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Bölüm 2 - Üyelik Türleri */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#4A90E2", fontWeight: "600" }}
                >
                  2. 👥 Üyelik Türleri ve Sorumluluları
                </Typography>

                <Card sx={{ mb: 3, borderLeft: "4px solid #4CAF50" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ color: "#4CAF50", mb: 2, fontWeight: "bold" }}
                    >
                      👤 Bireysel Üyeler
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="• TC kimlik numarası ile kayıt zorunludur" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Doğru ve güncel bilgi verme sorumluluğu" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Kişisel kullanım için araç alım-satımı" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Maksimum 5 aktif ilan hakkı" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                <Card sx={{ mb: 3, borderLeft: "4px solid #FF9800" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ color: "#FF9800", mb: 2, fontWeight: "bold" }}
                    >
                      🏢 Kurumsal Üyeler
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="• Vergi numarası ve ticaret sicil belgesi gerekli" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Şirket adına ticari faaliyet yetkisi" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Sınırsız ilan verme hakkı" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Özel müşteri destek hattı" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* Bölüm 3 - İlan Kuralları */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#4A90E2", fontWeight: "600" }}
                >
                  3. 📝 İlan Verme Kuralları
                </Typography>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText
                      primary="✅ Sadece gerçek, satışta olan araçlar"
                      secondary="Sahte ilanlar hesap kapatma sebebidir"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="💰 Doğru fiyat ve teknik bilgiler"
                      secondary="Yanıltıcı bilgi paylaşımı yasaktır"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="📸 Kaliteli fotoğraflar zorunlu"
                      secondary="En az 5 adet, net ve güncel fotoğraf"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="⚠️ Hasar durumu belirtme zorunluluğu"
                      secondary="Kazalı, boyalı veya hasarlı durumları mutlaka bildirin"
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Bölüm 4 - Yasaklar */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#d32f2f", fontWeight: "600" }}
                >
                  4. 🚫 Yasaklı Davranışlar
                </Typography>
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Aşağıdaki davranışlar hesap kapatma ile sonuçlanır:
                  </Typography>
                </Alert>
                <List sx={{ ml: 2 }}>
                  <ListItem sx={{ color: "#d32f2f" }}>
                    <ListItemText primary="🚨 Çalıntı araç ilanı vermek" />
                  </ListItem>
                  <ListItem sx={{ color: "#d32f2f" }}>
                    <ListItemText primary="📄 Sahte belge ve bilgi paylaşımı" />
                  </ListItem>
                  <ListItem sx={{ color: "#d32f2f" }}>
                    <ListItemText primary="💳 Platform dışı ödeme yönlendirmesi" />
                  </ListItem>
                  <ListItem sx={{ color: "#d32f2f" }}>
                    <ListItemText primary="📧 Spam mesaj ve taciz edici davranış" />
                  </ListItem>
                  <ListItem sx={{ color: "#d32f2f" }}>
                    <ListItemText primary="🔗 Başka platformlara yönlendirme" />
                  </ListItem>
                </List>
              </Box>

              {/* Bölüm 5 - KVKK */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#4A90E2", fontWeight: "600" }}
                >
                  5. 🔒 Kişisel Verilerin Korunması (KVKK)
                </Typography>
                <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                      6698 sayılı KVKK uyarınca kişisel verileriniz:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="• Sadece platform hizmetleri için kullanılır" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Üçüncü taraflarla paylaşılmaz" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Güvenli sunucularda şifrelenerek saklanır" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Dilediğiniz zaman silinmesini talep edebilirsiniz" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* İletişim Kartı */}
              <Card sx={{ mt: 4, bgcolor: "#2c3e50", color: "white" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: "flex", alignItems: "center" }}
                  >
                    📞 Hukuki Destek ve İletişim
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    <strong>E-posta:</strong> iletisim@trucksbus.com.tr
                    <br />
                    <strong>Adres:</strong> TrucksBus Ltd. Şti., İstanbul,
                    Türkiye
                    <br />
                    <strong>Mesai Saatleri:</strong> Pazartesi-Cuma 09:00-18:00
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Box>

          {/* Yan Panel */}
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Card sx={{ position: "sticky", top: 20 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  <Security sx={{ mr: 1, color: "#4A90E2" }} />
                  Güvenlik Özellikleri
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="🔐 SSL Şifreleme"
                      secondary="256-bit güvenlik"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="✅ Kimlik Doğrulama"
                      secondary="TC/Vergi No kontrolü"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="💬 Güvenli Mesajlaşma"
                      secondary="End-to-end şifreleme"
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  <Gavel sx={{ mr: 1, color: "#4A90E2" }} />
                  Hukuki Bilgiler
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="⚖️ Türk Hukuku"
                      secondary="İstanbul mahkemeleri yetkili"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="📋 KVKK Uyumlu"
                      secondary="6698 sayılı kanun"
                    />
                  </ListItem>
                </List>

                <Button
                  onClick={() => navigate("/privacy-policy")}
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Gizlilik Politikası
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default TermsOfService;
