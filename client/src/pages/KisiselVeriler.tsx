import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import {
  Shield,
  Person,
  Security,
  Delete,
  Edit,
  Visibility,
  Lock,
  ExpandMore,
  Info,
  Email,
  Phone,
} from "@mui/icons-material";

const KisiselVeriler: React.FC = () => {
  const dataTypes = [
    {
      category: "Kimlik Bilgileri",
      icon: <Person sx={{ color: "#1976d2" }} />,
      items: ["Ad, Soyad", "TC Kimlik Numarası", "Doğum Tarihi", "Cinsiyet"],
    },
    {
      category: "İletişim Bilgileri",
      icon: <Email sx={{ color: "#4caf50" }} />,
      items: ["E-posta Adresi", "Telefon Numarası", "Adres Bilgileri"],
    },
    {
      category: "İşlem Bilgileri",
      icon: <Security sx={{ color: "#ff9800" }} />,
      items: [
        "İlan Geçmişi",
        "Arama Kayıtları",
        "Favori İlanlar",
        "Mesajlaşma Geçmişi",
      ],
    },
    {
      category: "Teknik Bilgiler",
      icon: <Shield sx={{ color: "#9c27b0" }} />,
      items: [
        "IP Adresi",
        "Tarayıcı Bilgileri",
        "Cihaz Bilgileri",
        "Çerez Verileri",
      ],
    },
  ];

  const userRights = [
    {
      title: "Bilgilendirilme Hakkı",
      description:
        "Hangi kişisel verilerinizin işlendiğini öğrenme hakkınız bulunur.",
      icon: <Info sx={{ color: "#2196f3" }} />,
    },
    {
      title: "Erişim Hakkı",
      description:
        "İşlenen kişisel verilerinize erişim talep etme hakkınız bulunur.",
      icon: <Visibility sx={{ color: "#4caf50" }} />,
    },
    {
      title: "Düzeltme Hakkı",
      description:
        "Yanlış veya eksik kişisel verilerinizin düzeltilmesini talep edebilirsiniz.",
      icon: <Edit sx={{ color: "#ff9800" }} />,
    },
    {
      title: "Silme Hakkı",
      description:
        "Kişisel verilerinizin silinmesini talep etme hakkınız bulunur.",
      icon: <Delete sx={{ color: "#f44336" }} />,
    },
  ];

  const processingPurposes = [
    "Kullanıcı hesabı oluşturma ve yönetimi",
    "İlan verme ve arama hizmetlerinin sağlanması",
    "Müşteri destek hizmetlerinin verilmesi",
    "Güvenlik ve dolandırıcılık önleme",
    "Yasal yükümlülüklerin yerine getirilmesi",
    "Hizmet kalitesinin iyileştirilmesi",
    "Pazarlama ve reklam faaliyetleri (onay verilen durumlarda)",
  ];

  const securityMeasures = [
    "SSL şifreleme ile veri transferi güvenliği",
    "Güçlü parola politikaları",
    "Düzenli güvenlik güncellemeleri",
    "Yetkisiz erişim koruması",
    "Veri yedekleme sistemleri",
    "Çalışan eğitim programları",
    "Düzenli güvenlik denetimleri",
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)",
            color: "white",
            p: 6,
            borderRadius: 4,
            mb: 6,
            textAlign: "center",
          }}
        >
          <Shield sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Kişisel Verilerin Korunması
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, maxWidth: 700, mx: "auto" }}
          >
            KVKK kapsamında kişisel verilerinizin korunması ve işlenmesi
            hakkında bilgiler
          </Typography>
        </Paper>

        {/* KVKK Info */}
        <Alert severity="info" sx={{ mb: 6, borderRadius: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            <strong>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)
            </strong>{" "}
            kapsamında, kişisel verilerinizin güvenliği bizim için önceliklidir.
            Bu sayfada verilerinizin nasıl toplandığı, işlendiği ve korunduğu
            hakkında detaylı bilgi bulabilirsiniz.
          </Typography>
        </Alert>

        {/* Data Types */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}
        >
          Toplanan Kişisel Veriler
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 3,
            mb: 6,
          }}
        >
          {dataTypes.map((type, index) => (
            <Paper key={index} sx={{ p: 3, height: "100%", borderRadius: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                {type.icon}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {type.category}
                </Typography>
              </Box>
              <List dense>
                {type.items.map((item, itemIndex) => (
                  <ListItem key={itemIndex} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontSize: 14 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ))}
        </Box>

        {/* Processing Purposes */}
        <Accordion
          sx={{ mb: 3, borderRadius: 2, "&:before": { display: "none" } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: "#f5f5f5", borderRadius: "8px 8px 0 0" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Veri İşleme Amaçları
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {processingPurposes.map((purpose, index) => (
                <Chip
                  key={index}
                  label={purpose}
                  variant="outlined"
                  sx={{ margin: 0.5 }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* User Rights */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}
        >
          KVKK Kapsamındaki Haklarınız
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 3,
            mb: 6,
          }}
        >
          {userRights.map((right, index) => (
            <Paper key={index} sx={{ p: 3, height: "100%", borderRadius: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                {right.icon}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {right.title}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {right.description}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Security Measures */}
        <Paper sx={{ p: 4, mb: 6, borderRadius: 3, bgcolor: "#e8f5e8" }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            <Lock sx={{ mr: 2, verticalAlign: "middle" }} />
            Güvenlik Önlemleri
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Kişisel verilerinizin güvenliği için aldığımız önlemler:
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {securityMeasures.map((measure, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Security sx={{ color: "#4caf50", fontSize: 20 }} />
                <Typography variant="body2">{measure}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Data Retention */}
        <Accordion
          sx={{ mb: 3, borderRadius: 2, "&:before": { display: "none" } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: "#f5f5f5", borderRadius: "8px 8px 0 0" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Veri Saklama Süreleri
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemText
                  primary="Hesap Bilgileri"
                  secondary="Hesap aktif olduğu sürece + 3 yıl"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="İlan Geçmişi"
                  secondary="İlan yayınlandığı tarihten itibaren 5 yıl"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="İletişim Kayıtları"
                  secondary="İletişim tarihinden itibaren 2 yıl"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Teknik Loglar"
                  secondary="Log kaydı oluşturulduğu tarihten itibaren 1 yıl"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Contact for Rights */}
        <Paper sx={{ p: 4, borderRadius: 3, border: "2px solid #1976d2" }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: 3, color: "#1976d2" }}
          >
            Haklarınızı Kullanmak İçin
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki kanallardan
            bizimle iletişime geçebilirsiniz:
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                <Email sx={{ mr: 1, verticalAlign: "middle" }} />
                E-posta
              </Typography>
              <Typography variant="body2">kvkk@trucksbus.com</Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                <Phone sx={{ mr: 1, verticalAlign: "middle" }} />
                Telefon
              </Typography>
              <Typography variant="body2">0 850 222 44 44</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Başvuru Süreci:</strong> Talebiniz 30 gün içinde
              değerlendirilip sonuçlandırılacaktır. Kimlik doğrulama sürecinden
              geçtikten sonra işlemleriniz gerçekleştirilecektir.
            </Typography>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
};

export default KisiselVeriler;
