import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowBack, Info } from "@mui/icons-material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const TermsOfService: React.FC = () => {
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
            background: "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
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
            sx={{
              fontWeight: "bold",
              mb: 2,
              fontSize: { xs: "1.5rem", md: "2.5rem" },
            }}
          >
            📋 Kullanım Şartları ve Sözleşme
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, fontSize: { xs: "0.9rem", md: "1.25rem" } }}
          >
            TrucksBus Platformu Kullanıcı Sözleşmesi
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            <Chip
              icon={<Info />}
              label="Son Güncellenme: 29 Eylül 2025"
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
            />
          </Box>
        </Paper>

        {/* Sözleşme İçeriği */}
        <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "#2c3e50",
              fontWeight: "600",
              fontSize: { xs: "1.25rem", md: "2rem" },
            }}
          >
            1. TARAFLAR VE KONU
          </Typography>

          <Typography
            paragraph
            sx={{
              lineHeight: 1.8,
              mb: 3,
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            İşbu sözleşme, <strong>TrucksBus</strong> platformu
            (trucksbus.com.tr) ile platform üzerinde hesap açan kullanıcılar
            arasında akdedilmiştir. Bu sözleşme, platformumuzun kullanım
            koşullarını ve tarafların hak ve yükümlülüklerini düzenlemektedir.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "#2c3e50",
              fontWeight: "600",
              fontSize: { xs: "1.25rem", md: "2rem" },
            }}
          >
            2. PLATFORM TANıMı VE HİZMETLER
          </Typography>

          <Typography
            paragraph
            sx={{
              lineHeight: 1.8,
              mb: 2,
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            <strong>TrucksBus</strong>, ticari araç alım-satım platformudur.
            Sunulan hizmetler:
          </Typography>

          <Box component="ul" sx={{ pl: { xs: 2, md: 3 }, mb: 3 }}>
            <li>
              <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}>
                🚛 Kamyon, kamyonet, çekici, dorse alım-satım ilanları
              </Typography>
            </li>
            <li>
              <Typography>
                🚌 Otobüs, minibüs, midibüs alım-satım ilanları
              </Typography>
            </li>
            <li>
              <Typography>🔧 Karoser, üst yapı ve aksesuar ilanları</Typography>
            </li>
            <li>
              <Typography>💬 Kullanıcılar arası mesajlaşma sistemi</Typography>
            </li>
            <li>
              <Typography>⭐ Favori ilan kaydetme ve takip</Typography>
            </li>
            <li>
              <Typography>
                📊 Detaylı araç bilgileri ve fotoğraf paylaşımı
              </Typography>
            </li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            3. KULLANICI YÜKÜMLÜLÜKLERI
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#e67e22", fontWeight: "500" }}
          >
            3.1 Doğru Bilgi Verme Yükümlülüğü
          </Typography>
          <Typography paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            Kullanıcı, kayıt olurken ve ilan verirken{" "}
            <strong>gerçek, güncel ve doğru bilgiler</strong> vermeyi taahhüt
            eder. Yanlış bilgi verilmesi durumunda hesap kapatılabilir.
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#e67e22", fontWeight: "500" }}
          >
            3.2 İlan Sorumluluğu
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>
                Sadece <strong>sahip olduğunuz</strong> veya{" "}
                <strong>satış yetkisi</strong> bulunan araçları ilan
                edebilirsiniz
              </Typography>
            </li>
            <li>
              <Typography>
                Araç bilgileri (model, yıl, km, hasar durumu){" "}
                <strong>gerçeği yansıtmalıdır</strong>
              </Typography>
            </li>
            <li>
              <Typography>Güncel ve net fotoğraflar kullanılmalıdır</Typography>
            </li>
            <li>
              <Typography>Fiyat bilgisi doğru ve güncel olmalıdır</Typography>
            </li>
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#e67e22", fontWeight: "500" }}
          >
            3.3 Yasaklanan Davranışlar
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>❌ Sahte ilan verme</Typography>
            </li>
            <li>
              <Typography>❌ Başkasının adına hesap açma</Typography>
            </li>
            <li>
              <Typography>
                ❌ Dolandırıcılık amacıyla platform kullanma
              </Typography>
            </li>
            <li>
              <Typography>❌ Spam mesaj gönderme</Typography>
            </li>
            <li>
              <Typography>❌ Rahatsız edici davranışlarda bulunma</Typography>
            </li>
            <li>
              <Typography>❌ Platform güvenliğini tehlikeye atma</Typography>
            </li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            4. PLATFORM KURALLARI
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#8e44ad", fontWeight: "500" }}
          >
            4.1 Hesap Güvenliği
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>
                Şifrenizi güvenli tutun ve kimseyle paylaşmayın
              </Typography>
            </li>
            <li>
              <Typography>
                Hesabınızda şüpheli aktivite fark ederseniz derhal bildirin
              </Typography>
            </li>
            <li>
              <Typography>
                Hesabınızdan yapılan tüm işlemlerden siz sorumlusunuz
              </Typography>
            </li>
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#8e44ad", fontWeight: "500" }}
          >
            4.2 İletişim Kuralları
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>Saygılı ve kibar bir dil kullanın</Typography>
            </li>
            <li>
              <Typography>
                Kişisel bilgilerinizi (IBAN, adres) mesajlarda paylaşmayın
              </Typography>
            </li>
            <li>
              <Typography>
                Alım-satım işlemlerini güvenli yöntemlerle yapın
              </Typography>
            </li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            5. PLATFORM HAKLARI VE YETKİLERİ
          </Typography>

          <Typography paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            <strong>TrucksBus</strong> aşağıdaki haklara sahiptir:
          </Typography>

          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>
                Uygunsuz ilanları <strong>uyarısız olarak kaldırma</strong>
              </Typography>
            </li>
            <li>
              <Typography>
                Kurallara uymayan kullanıcı hesaplarını{" "}
                <strong>askıya alma veya kapatma</strong>
              </Typography>
            </li>
            <li>
              <Typography>
                Platform özelliklerini <strong>geliştirme ve değiştirme</strong>
              </Typography>
            </li>
            <li>
              <Typography>
                Hizmet kalitesini artırmak için{" "}
                <strong>yeni özellikler ekleme</strong>
              </Typography>
            </li>
            <li>
              <Typography>
                Yasal zorunluluklar çerçevesinde <strong>bilgi paylaşma</strong>
              </Typography>
            </li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            6. GİZLİLİK VE VERİ KORUMA
          </Typography>

          <Typography paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            Kişisel verilerinizin işlenmesi{" "}
            <strong>KVKK (Kişisel Verilerin Korunması Kanunu)</strong>
            kapsamında düzenlenmiştir. Detaylı bilgi için
            <strong> Gizlilik Politikası</strong> sayfamızı inceleyiniz.
          </Typography>

          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>
                Verileriniz sadece hizmet sunumu için kullanılır
              </Typography>
            </li>
            <li>
              <Typography>Üçüncü taraflarla iznisiz paylaşılmaz</Typography>
            </li>
            <li>
              <Typography>Güvenli sunucularda saklanır</Typography>
            </li>
            <li>
              <Typography>
                İstediğiniz zaman hesabınızı kapatabilirsiniz
              </Typography>
            </li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            7. SORUMLULUK SINIRI
          </Typography>

          <Paper
            sx={{
              p: 3,
              bgcolor: "#fff3cd",
              border: "1px solid #ffc107",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#856404", fontWeight: "600", mb: 2 }}
            >
              ⚠️ Önemli Uyarı
            </Typography>
            <Typography sx={{ color: "#856404", lineHeight: 1.7 }}>
              <strong>TrucksBus</strong> bir <strong>aracı platform</strong>dur.
              Alım-satım işlemleri kullanıcılar arasında gerçekleşir. Platform,
              işlemlerin sonucundan, araçların kalitesinden veya kullanıcılar
              arasındaki anlaşmazlıklardan sorumlu değildir.
            </Typography>
          </Paper>

          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>
                Araç muayenesi mutlaka <strong>uzman bir kişi</strong> ile
                yapılmalıdır
              </Typography>
            </li>
            <li>
              <Typography>
                Ödeme işlemleri <strong>güvenli yöntemlerle</strong> (banka,
                noter vb.) yapılmalıdır
              </Typography>
            </li>
            <li>
              <Typography>
                Araç teslim alınmadan <strong>tam ödeme yapılmaması</strong>{" "}
                önerilir
              </Typography>
            </li>
            <li>
              <Typography>
                Şüpheli durumları platform yönetimine{" "}
                <strong>derhal bildirin</strong>
              </Typography>
            </li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            8. SÖZLEŞME DEĞİŞİKLİKLERİ
          </Typography>

          <Typography paragraph sx={{ lineHeight: 1.8, mb: 3 }}>
            <strong>TrucksBus</strong>, bu sözleşmeyi tek taraflı olarak
            değiştirebilir. Değişiklikler platform üzerinden ve/veya e-posta ile
            duyurulacaktır. Değişiklikler yayınlandığı tarihte yürürlüğe girer.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            9. UYUŞMAZLIK ÇÖZÜMÜ
          </Typography>

          <Typography paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
            İşbu sözleşmeden doğacak uyuşmazlıklar öncelikle{" "}
            <strong>dostane görüşmelerle</strong>
            çözülmeye çalışılacaktır. Çözüm sağlanamadığı takdirde:
          </Typography>

          <Box component="ul" sx={{ pl: 3, mb: 3 }}>
            <li>
              <Typography>İstanbul mahkemeleri yetkilidir</Typography>
            </li>
            <li>
              <Typography>Türk hukuku uygulanır</Typography>
            </li>
            <li>
              <Typography>Tüketici mahkemeleri saklıdır</Typography>
            </li>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2c3e50", fontWeight: "600" }}
          >
            10. İLETİŞİM BİLGİLERİ
          </Typography>

          <Paper sx={{ p: 3, bgcolor: "#f8f9fa", border: "1px solid #dee2e6" }}>
            <Typography
              variant="h6"
              sx={{ color: "#495057", fontWeight: "600", mb: 2 }}
            >
              📞 Destek ve İletişim
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: "none" }}>
              <li>
                <Typography>
                  📧 E-posta: <strong>iletisim@trucksbus.com.tr</strong>
                </Typography>
              </li>
              <li>
                <Typography>
                  🌐 Website: <strong>www.trucksbus.com.tr</strong>
                </Typography>
              </li>
              <li>
                <Typography>📱 Canlı Destek: Platform üzerinden</Typography>
              </li>
              <li>
                <Typography>
                  🕐 Çalışma Saatleri:{" "}
                  <strong>Pazartesi-Cuma 09:00-18:00</strong>
                </Typography>
              </li>
            </Box>
          </Paper>

          <Paper
            sx={{
              p: 3,
              mt: 3,
              bgcolor: "#e8f5e8",
              border: "1px solid #4caf50",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#2e7d32", fontWeight: "600", mb: 2 }}
            >
              ✅ Sözleşme Kabulü
            </Typography>
            <Typography sx={{ color: "#2e7d32", lineHeight: 1.7 }}>
              Bu sayfayı okuyarak ve platforma kayıt olarak, yukarıdaki tüm
              şartları{" "}
              <strong>okuduğunuzu, anladığınızı ve kabul ettiğinizi</strong>
              beyan etmiş olursunuz.
            </Typography>
          </Paper>

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
