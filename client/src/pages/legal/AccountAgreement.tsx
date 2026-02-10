import React from "react";
import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const AccountAgreement: React.FC = () => {
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
            Hesap Sözleşmesi
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 3, color: "#666" }}>
            TrucksBus platformunda hesap açma ve kullanım sözleşmesi
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
            1. Sözleşme Tarafları
          </Typography>
          <Typography variant="body1" paragraph>
            Bu sözleşme, TrucksBus platformunu işleten şirket ile platform
            üzerinde hesap açan kullanıcılar arasında akdedilmiştir. Hesap
            açarak bu sözleşmeyi kabul etmiş sayılırsınız.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. Hesap Açma Şartları
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus platformunda hesap açabilmek için aşağıdaki şartları
            sağlamalısınız:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              18 yaşından büyük olmak
            </Typography>
            <Typography component="li" variant="body1">
              Geçerli kimlik bilgilerine sahip olmak
            </Typography>
            <Typography component="li" variant="body1">
              Doğru ve güncel iletişim bilgileri sağlamak
            </Typography>
            <Typography component="li" variant="body1">
              Telefon numarası doğrulaması yapmak
            </Typography>
            <Typography component="li" variant="body1">
              E-posta adresini onaylamak
            </Typography>
            <Typography component="li" variant="body1">
              Platform kurallarını kabul etmek
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            3. Hesap Güvenliği
          </Typography>
          <Typography variant="body1" paragraph>
            Hesabınızın güvenliğinden tamamen siz sorumlusunuz. Bu kapsamda:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Şifrenizi güçlü ve benzersiz tutmalısınız
            </Typography>
            <Typography component="li" variant="body1">
              Giriş bilgilerinizi kimseyle paylaşmamalısınız
            </Typography>
            <Typography component="li" variant="body1">
              Şüpheli aktivite durumunda derhal şifrenizi değiştirmelisiniz
            </Typography>
            <Typography component="li" variant="body1">
              Hesabınızdan çıkış yapmayı unutmamalısınız
            </Typography>
            <Typography component="li" variant="body1">
              İki faktörlü doğrulamayı aktif etmenizi tavsiye ederiz
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. Hesap Kullanım Hakları
          </Typography>
          <Typography variant="body1" paragraph>
            Geçerli bir hesaba sahip kullanıcılar şu haklara sahiptir:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Platform üzerinde ilan verme ve görüntüleme
            </Typography>
            <Typography component="li" variant="body1">
              Diğer kullanıcılarla iletişim kurma
            </Typography>
            <Typography component="li" variant="body1">
              Favori ilanları kaydetme
            </Typography>
            <Typography component="li" variant="body1">
              Profil bilgilerini düzenleme
            </Typography>
            <Typography component="li" variant="body1">
              İlan geçmişini görüntüleme
            </Typography>
            <Typography component="li" variant="body1">
              Platform destek hizmetlerinden faydalanma
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. Hesap Kullanım Yükümlülükleri
          </Typography>
          <Typography variant="body1" paragraph>
            Hesap sahibi olarak aşağıdaki yükümlülükleri kabul edersiniz:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Sadece kendi adınıza hesap kullanmak
            </Typography>
            <Typography component="li" variant="body1">
              Gerçek ve doğru bilgiler sağlamak
            </Typography>
            <Typography component="li" variant="body1">
              Platform kurallarına uymak
            </Typography>
            <Typography component="li" variant="body1">
              Yasal olmayan faaliyetlerde bulunmamak
            </Typography>
            <Typography component="li" variant="body1">
              Diğer kullanıcılara saygı göstermek
            </Typography>
            <Typography component="li" variant="body1">
              Hesap bilgilerini güncel tutmak
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. Hesap Türleri ve Özellikler
          </Typography>
          <Typography variant="body1" paragraph>
            TrucksBus platformunda farklı hesap türleri bulunmaktadır:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Bireysel Hesap:</strong> Şahıs kullanıcılar için temel
              özellikler
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Kurumsal Hesap:</strong> Şirketler için genişletilmiş
              özellikler
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Bayi Hesabı:</strong> Yetkili bayiler için özel yetkiler
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Premium Hesap:</strong> Ek özellikler ve öncelikli destek
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. Hesap Askıya Alma ve Kapatma
          </Typography>
          <Typography variant="body1" paragraph>
            Aşağıdaki durumlarda hesabınız askıya alınabilir veya kapatılabilir:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Platform kurallarının ihlal edilmesi
            </Typography>
            <Typography component="li" variant="body1">
              Yasal olmayan faaliyetlerde bulunma
            </Typography>
            <Typography component="li" variant="body1">
              Sahte bilgi sağlama
            </Typography>
            <Typography component="li" variant="body1">
              Diğer kullanıcıları rahatsız etme
            </Typography>
            <Typography component="li" variant="body1">
              Teknik güvenlik ihlalleri
            </Typography>
            <Typography component="li" variant="body1">
              Uzun süreli hesap kullanmama (12 ay)
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            8. Veri Saklama ve Silme
          </Typography>
          <Typography variant="body1" paragraph>
            Hesap verileriniz aşağıdaki şekilde yönetilir:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Aktif hesaplar için veriler süresiz saklanır
            </Typography>
            <Typography component="li" variant="body1">
              Hesap kapatma sonrası veriler 2 yıl arşivlenir
            </Typography>
            <Typography component="li" variant="body1">
              Yasal yükümlülük gerektiren veriler daha uzun saklanabilir
            </Typography>
            <Typography component="li" variant="body1">
              Silme talebi durumunda 30 gün içinde işlem yapılır
            </Typography>
            <Typography component="li" variant="body1">
              Yedekleme sistemlerinde veriler 6 ay daha kalabilir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            9. Hesap Transfer ve Devir
          </Typography>
          <Typography variant="body1" paragraph>
            Hesaplar kişisel kullanım içindir ve devredilemez. Ancak:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Kurumsal hesaplarda yetki devri yapılabilir
            </Typography>
            <Typography component="li" variant="body1">
              Miras durumlarında özel prosedür uygulanır
            </Typography>
            <Typography component="li" variant="body1">
              Şirket satışlarında hesap devri değerlendirilir
            </Typography>
            <Typography component="li" variant="body1">
              Tüm devirler platform onayına tabidir
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            10. Değişiklik ve Güncellemeler
          </Typography>
          <Typography variant="body1" paragraph>
            Bu sözleşme platform geliştirmeleri doğrultusunda güncellenebilir.
            Önemli değişiklikler 30 gün önceden duyurulur. Devam eden kullanım
            değişiklikleri kabul ettiğiniz anlamına gelir.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            11. İletişim ve Destek
          </Typography>
          <Typography variant="body1" paragraph>
            Hesap sözleşmesi ile ilgili sorularınız için:
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
              <strong>Destek Merkezi:</strong> 7/24 platform üzerinden
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 4, color: "#666", fontStyle: "italic" }}
          >
            Bu sözleşmeyi kabul ederek, TrucksBus platformunda sorumlu bir
            kullanıcı olacağınızı ve hesabınızı kurallara uygun şekilde
            kullanacağınızı taahhüt edersiniz.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default AccountAgreement;
