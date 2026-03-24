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
import { ArrowBack, Security, Shield, Info } from "@mui/icons-material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 }, flex: 1 }}
      >
        {/* Ana Başlık */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            mb: 3,
            background: "linear-gradient(135deg, #8E24AA 0%, #7B1FA2 100%)",
            color: "white",
            borderRadius: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              size="small"
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
            sx={{ mb: 1, fontSize: { xs: "1.5rem", md: "2.5rem" } }}
          >
            🔒 Gizlilik Politikası ve KVKK
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Kişisel verilerinizin korunması bizim önceliğimizdir
          </Typography>
          <Chip
            label="6698 Sayılı KVKK Uyumlu"
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
                <strong>KVKK Bildirimi:</strong> Bu doküman, kişisel
                verilerinizin TrucksBus tarafından nasıl işlendiğini ve
                haklarınızın neler olduğunu açıklar.
              </Typography>
            </Alert>

            {/* Ana İçerik */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
              <Typography
                variant="h4"
                sx={{ mb: 3, color: "#2c3e50", fontWeight: "bold" }}
              >
                🛡️ Kişisel Verilerin Korunması Politikası
              </Typography>

              <Divider sx={{ mb: 4 }} />

              {/* Bölüm 1 - Veri Sorumlusu */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#8E24AA", fontWeight: "600" }}
                >
                  1. 📋 Veri Sorumlusu Bilgileri
                </Typography>
                <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                      <strong>Şirket Unvanı:</strong> TrucksBus Limited Şirketi
                      <br />
                      <strong>Adres:</strong> İstanbul, Türkiye
                      <br />
                      <strong>E-posta:</strong> iletisim@trucksbus.com.tr
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
                      veri sorumlusu sıfatıyla faaliyet göstermekteyiz.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Bölüm 2 - Toplanan Veriler */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#8E24AA", fontWeight: "600" }}
                >
                  2. 📊 Toplanan Kişisel Veriler
                </Typography>

                <Card sx={{ mb: 3, borderLeft: "4px solid #4CAF50" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ color: "#4CAF50", mb: 2, fontWeight: "bold" }}
                    >
                      👤 Bireysel Üyeler İçin
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="• Ad, soyad, TC kimlik numarası" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• E-posta adresi ve telefon numarası" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Adres bilgileri" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Araç ilan bilgileri ve fotoğrafları" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Platform kullanım verileri (IP, çerez)" />
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
                      🏢 Kurumsal Üyeler İçin
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="• Şirket unvanı ve vergi numarası" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Yetkili kişi bilgileri" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Ticaret sicil belgesi bilgileri" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="• Fatura ve ödeme bilgileri" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* Bölüm 3 - İşleme Amaçları */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#8E24AA", fontWeight: "600" }}
                >
                  3. 🎯 Veri İşleme Amaçları
                </Typography>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText
                      primary="✅ Platform üyeliği ve kimlik doğrulama"
                      secondary="Güvenli hesap oluşturma ve doğrulama işlemleri"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="🚛 İlan yayınlama ve yönetimi"
                      secondary="Araç ilanlarınızın platform üzerinde yayınlanması"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="💬 Kullanıcılar arası iletişim"
                      secondary="Güvenli mesajlaşma ve iletişim hizmetleri"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="🔒 Güvenlik ve dolandırıcılık önleme"
                      secondary="Platform güvenliğinin sağlanması"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="📊 İstatistik ve analiz"
                      secondary="Hizmet kalitesinin artırılması (anonim)"
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Bölüm 4 - Haklarınız */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#8E24AA", fontWeight: "600" }}
                >
                  4. ⚖️ KVKK Kapsamındaki Haklarınız
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    6698 sayılı KVKK'nın 11. maddesi uyarınca sahip olduğunuz
                    haklar:
                  </Typography>
                </Alert>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText
                      primary="📋 Bilgi talep etme hakkı"
                      secondary="Hangi verilerinizin işlendiğini öğrenebilirsiniz"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="✏️ Düzeltme hakkı"
                      secondary="Yanlış verilerin düzeltilmesini talep edebilirsiniz"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="🗑️ Silme hakkı"
                      secondary="Verilerinizin silinmesini talep edebilirsiniz"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="🚫 İşleme itiraz hakkı"
                      secondary="Belirli işlemler için itiraz edebilirsiniz"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="📤 Veri taşınabilirliği"
                      secondary="Verilerinizi başka platformlara aktarabilirsiniz"
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Bölüm 5 - Güvenlik */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#8E24AA", fontWeight: "600" }}
                >
                  5. 🔐 Veri Güvenliği Önlemleri
                </Typography>
                <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e9ecef" }}>
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="🔒 SSL/TLS şifreleme"
                          secondary="Tüm veri transferleri şifrelenir"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="🏰 Güvenli sunucular"
                          secondary="Veriler güvenli veri merkezlerinde saklanır"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="👥 Erişim kontrolü"
                          secondary="Sadece yetkili personel erişebilir"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="📝 Düzenli denetim"
                          secondary="Güvenlik süreçleri sürekli izlenir"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* Bölüm 6 - Çerezler */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ mb: 2, color: "#8E24AA", fontWeight: "600" }}
                >
                  6. 🍪 Çerez (Cookie) Politikası
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                  Platformumuzda kullanılan çerez türleri:
                </Typography>
                <List sx={{ ml: 2 }}>
                  <ListItem>
                    <ListItemText
                      primary="🔑 Zorunlu çerezler"
                      secondary="Platform işleyişi için gerekli (oturum, güvenlik)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="📊 Analitik çerezler"
                      secondary="Kullanım istatistikleri için (anonim)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="⚙️ Fonksiyonel çerezler"
                      secondary="Kullanıcı tercihlerini hatırlama"
                    />
                  </ListItem>
                </List>
              </Box>

              {/* İletişim Kartı */}
              <Card sx={{ mt: 4, bgcolor: "#8E24AA", color: "white" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: "flex", alignItems: "center" }}
                  >
                    📞 KVKK Başvuru ve İletişim
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 2 }}>
                    KVKK haklarınızı kullanmak için aşağıdaki yollarla
                    başvurabilirsiniz:
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    <strong>E-posta:</strong> iletisim@trucksbus.com.tr
                    <br />
                    <strong>Posta:</strong> TrucksBus Ltd. Şti., KVKK Sorumlusu,
                    İstanbul
                    <br />
                    <strong>Platform:</strong> Hesap ayarları → Veri hakları
                    bölümü
                    <br />
                    <strong>Yanıt süresi:</strong> 30 gün içinde cevaplanır
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
                  <Security sx={{ mr: 1, color: "#8E24AA" }} />
                  Güvenlik Sertifikaları
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="🏆 ISO 27001"
                      secondary="Bilgi güvenliği"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="✅ KVKK Uyumlu"
                      secondary="6698 sayılı kanun"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="🔒 SSL Sertifikalı"
                      secondary="256-bit şifreleme"
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  <Shield sx={{ mr: 1, color: "#8E24AA" }} />
                  Hızlı Erişim
                </Typography>
                <Button
                  onClick={() => navigate("/terms")}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Kullanım Şartları
                </Button>
                <Button
                  href="mailto:iletisim@trucksbus.com.tr"
                  variant="outlined"
                  fullWidth
                >
                  KVKK Başvuru
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

export default PrivacyPolicy;
