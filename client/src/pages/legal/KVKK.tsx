import React from "react";
import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const KVKK: React.FC = () => {
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
            KVKK Aydınlatma Metni
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 3, color: "#666" }}>
            Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme
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
            1. Veri Sorumlusu
          </Typography>
          <Typography variant="body1" paragraph>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca,
            kişisel verileriniz; TrucksBus tarafından, aşağıda açıklanan
            kapsamda işlenmektedir. Bu metinle, kişisel verilerinizin nasıl
            işlendiği konusunda sizleri bilgilendirmek istiyoruz.
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            2. Kişisel Verilerin İşlenme Amacı
          </Typography>
          <Typography variant="body1" paragraph>
            Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Ticari araç alım-satım platformu hizmetlerinin sunulması
            </Typography>
            <Typography component="li" variant="body1">
              Kullanıcı kaydının oluşturulması ve yönetimi
            </Typography>
            <Typography component="li" variant="body1">
              İlan yayınlama ve iletişim hizmetlerinin sağlanması
            </Typography>
            <Typography component="li" variant="body1">
              Müşteri memnuniyeti faaliyetlerinin yürütülmesi
            </Typography>
            <Typography component="li" variant="body1">
              Güvenlik ve dolandırıcılık önleme faaliyetleri
            </Typography>
            <Typography component="li" variant="body1">
              Yasal yükümlülüklerin yerine getirilmesi
            </Typography>
            <Typography component="li" variant="body1">
              İstatistiksel analiz ve raporlama
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            3. İşlenen Kişisel Veri Kategorileri
          </Typography>
          <Typography variant="body1" paragraph>
            Platform kapsamında işlenen kişisel veri kategorileri:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              <strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası
            </Typography>
            <Typography component="li" variant="body1">
              <strong>İletişim Bilgileri:</strong> Telefon, e-posta, adres
              bilgileri
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Müşteri İşlem Bilgileri:</strong> İlan detayları, araç
              bilgileri
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Pazarlama Bilgileri:</strong> Tercihler, etkileşim geçmişi
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Teknik Bilgiler:</strong> IP adresi, çerez bilgileri,
              cihaz bilgileri
            </Typography>
            <Typography component="li" variant="body1">
              <strong>Görsel ve İşitsel Kayıtlar:</strong> Araç fotoğrafları,
              profil resimleri
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            4. Kişisel Verilerin İşlenme Hukuki Sebepleri
          </Typography>
          <Typography variant="body1" paragraph>
            Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen
            aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Açık rızanızın bulunması
            </Typography>
            <Typography component="li" variant="body1">
              Sözleşmenin kurulması veya ifasının gerekli olması
            </Typography>
            <Typography component="li" variant="body1">
              Kanuni yükümlülüğün yerine getirilmesi
            </Typography>
            <Typography component="li" variant="body1">
              Meşru menfaatlerimizin bulunması
            </Typography>
            <Typography component="li" variant="body1">
              Temel hak ve özgürlüklerinize zarar vermemek kaydıyla işlenmesi
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            5. Kişisel Verilerin Aktarılması
          </Typography>
          <Typography variant="body1" paragraph>
            Kişisel verileriniz aşağıdaki durumlarda üçüncü kişilerle
            paylaşılabilir:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Yasal yükümlülüklerin yerine getirilmesi amacıyla kamu kurum ve
              kuruluşları
            </Typography>
            <Typography component="li" variant="body1">
              Hizmet sağlayıcılar (sunucu, analitik hizmetleri, ödeme
              sistemleri)
            </Typography>
            <Typography component="li" variant="body1">
              İş ortakları (sadece gerekli durumlarda ve sınırlı kapsamda)
            </Typography>
            <Typography component="li" variant="body1">
              Açık rızanızın bulunduğu durumlarda diğer üçüncü kişiler
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            6. Kişisel Veri Sahibinin Hakları
          </Typography>
          <Typography variant="body1" paragraph>
            KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </Typography>
          <Box component="ul" sx={{ pl: 4, mb: 3 }}>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin işlenip işlenmediğini öğrenme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin işlenme amacını ve bunların amacına uygun
              kullanılıp kullanılmadığını öğrenme
            </Typography>
            <Typography component="li" variant="body1">
              Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü
              kişileri bilme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde
              bunların düzeltilmesini isteme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin silinmesini veya yok edilmesini isteme
            </Typography>
            <Typography component="li" variant="body1">
              İşleme işleminin otomatik sistemler yoluyla yapılması hâlinde
              sonuca itiraz etme
            </Typography>
            <Typography component="li" variant="body1">
              Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle
              zarara uğramanız hâlinde zararın giderilmesini talep etme
            </Typography>
          </Box>

          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#313B4C", fontWeight: "bold", mt: 4 }}
          >
            7. Başvuru Yöntemleri
          </Typography>
          <Typography variant="body1" paragraph>
            Yukarıda sayılan haklarınızı kullanmak için aşağıdaki yöntemlerle
            başvurabilirsiniz:
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
              <strong>E-posta:</strong> kvkk@trucksbus.com.tr
            </Typography>
            <Typography variant="body1">
              <strong>Telefon:</strong> +90 (555) 123 45 67
            </Typography>
            <Typography variant="body1">
              <strong>Adres:</strong> İstanbul, Türkiye
            </Typography>
          </Box>

          <Typography variant="body1" paragraph sx={{ mt: 3 }}>
            Başvurularınız en geç 30 gün içerisinde ücretsiz olarak
            sonuçlandırılacaktır. Ancak işlemin ayrıca bir maliyeti gerektirmesi
            hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen
            tarifedeki ücret alınacaktır.
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 4, color: "#666", fontStyle: "italic" }}
          >
            Bu aydınlatma metni, KVKK ve ilgili mevzuattaki değişiklikler
            doğrultusunda güncellenebilir. Güncellemeler platform üzerinden
            duyurulacaktır.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
};

export default KVKK;
