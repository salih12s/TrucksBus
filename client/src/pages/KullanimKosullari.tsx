import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Gavel,
  Description,
  Person,
  Business,
  Warning,
  ExpandMore,
  CheckCircle,
} from "@mui/icons-material";

const KullanimKosullari: React.FC = () => {
  const termsData = [
    {
      title: "Genel Hükümler",
      icon: <Gavel />,
      content: [
        "Bu kullanım koşulları TrucksBus platformu için geçerlidir.",
        "Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.",
        "Koşullar herhangi bir zamanda güncellenebilir.",
        "Güncel koşullar her zaman bu sayfada yayınlanır.",
      ],
    },
    {
      title: "Kullanıcı Yükümlülükleri",
      icon: <Person />,
      content: [
        "Gerçek ve doğru bilgi paylaşmak zorundasınız.",
        "Kişisel hesap bilgilerinizi güvende tutmalısınız.",
        "Platform kurallarına uygun davranmalısınız.",
        "Yasadışı içerik paylaşmak yasaktır.",
        "Diğer kullanıcılara saygılı davranmalısınız.",
      ],
    },
    {
      title: "İlan Kuralları",
      icon: <Description />,
      content: [
        "İlanlar gerçek araçlar için verilmelidir.",
        "Sahte fotoğraf kullanımı yasaktır.",
        "Yanıltıcı bilgi vermek yasaktır.",
        "Uygun kategori seçimi zorunludur.",
        "İlan başlıkları açıklayıcı olmalıdır.",
      ],
    },
    {
      title: "Platform Sorumlulukları",
      icon: <Business />,
      content: [
        "TrucksBus bir aracı platform olarak hizmet verir.",
        "Alım satım işlemlerinde aracılık yapmaz.",
        "İlan içeriklerinden kullanıcılar sorumludur.",
        "Güvenlik önlemleri sürekli geliştirilir.",
        "Teknik destek sağlanır.",
      ],
    },
  ];

  const prohibitedActivities = [
    "Sahte veya yanıltıcı ilan vermek",
    "Başkalarının hesaplarını kullanmak",
    "Spam veya rahatsız edici mesajlar göndermek",
    "Platformu kötüye kullanmak",
    "Yasadışı aktivitelerde bulunmak",
    "Telif hakkı ihlali yapmak",
    "Sistemi hacklemek veya zarar vermeye çalışmak",
  ];

  const userRights = [
    "Hesabınızı istediğiniz zaman kapatabilirsiniz",
    "Kişisel verilerinizin korunmasını talep edebilirsiniz",
    "İlan verme ve arama yapma hakkınız bulunur",
    "Müşteri hizmetlerinden destek alabilirsiniz",
    "Platform değişikliklerinden haberdar edilirsiniz",
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            color: "white",
            p: 6,
            borderRadius: 4,
            mb: 6,
            textAlign: "center",
          }}
        >
          <Gavel sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Kullanım Koşulları
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, maxWidth: 600, mx: "auto" }}
          >
            TrucksBus platformunu kullanırken uyulması gereken kurallar
          </Typography>
        </Paper>

        {/* Last Updated */}
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body1">
            <strong>Son Güncelleme:</strong> 1 Ocak 2024 tarihinde güncellenen
            bu koşullar, platformumuzun kullanımını düzenlemektedir.
          </Typography>
        </Alert>

        {/* Terms Sections */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}
        >
          Kullanım Koşulları Detayları
        </Typography>

        {termsData.map((section, index) => (
          <Accordion
            key={index}
            sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                "& .MuiAccordionSummary-content": { alignItems: "center" },
                bgcolor: "#f5f5f5",
                borderRadius: "8px 8px 0 0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: "#1976d2" }}>{section.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {section.content.map((item, itemIndex) => (
                  <ListItem key={itemIndex}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: "#4caf50", fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ fontSize: 15 }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Prohibited Activities */}
        <Paper
          sx={{ p: 4, mb: 6, borderRadius: 3, border: "2px solid #f44336" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Warning sx={{ color: "#f44336", fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Yasak Aktiviteler
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Aşağıdaki aktiviteler kesinlikle yasaktır ve hesap kapatılmasına
            neden olabilir:
          </Typography>
          <List>
            {prohibitedActivities.map((activity, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Warning sx={{ color: "#f44336" }} />
                </ListItemIcon>
                <ListItemText
                  primary={activity}
                  primaryTypographyProps={{ fontSize: 16, fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* User Rights */}
        <Paper sx={{ p: 4, mb: 6, borderRadius: 3, bgcolor: "#e8f5e8" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <CheckCircle sx={{ color: "#4caf50", fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Kullanıcı Hakları
            </Typography>
          </Box>
          <List>
            {userRights.map((right, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: "#4caf50" }} />
                </ListItemIcon>
                <ListItemText
                  primary={right}
                  primaryTypographyProps={{ fontSize: 16 }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Liability Disclaimer */}
        <Paper sx={{ p: 4, mb: 6, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Sorumluluk Reddi
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            TrucksBus, kullanıcılar arasındaki alım satım işlemlerinde bir aracı
            platform olarak hizmet vermektedir. Platformumuz üzerinden
            gerçekleştirilen işlemlerden doğan herhangi bir zarar veya kayıptan
            sorumlu tutulamaz.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            Kullanıcılar, platformu kullanırken kendi sorumluluklarında hareket
            ederler ve üçüncü taraflarla yapacakları anlaşmalardan TrucksBus
            sorumlu değildir.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            İletişim Bilgileri
          </Typography>
          <Typography variant="body1">
            Bu kullanım koşulları hakkında sorularınız için:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            📧 <strong>E-posta:</strong> iletisim@trucksbus.com.tr
          </Typography>
        </Paper>

        {/* Agreement Notice */}
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            <strong>Önemli:</strong> Bu platformu kullanmaya devam ederek
            yukarıdaki kullanım koşullarını okuduğunuzu, anladığınızı ve kabul
            ettiğinizi beyan etmiş olursunuz.
          </Typography>
        </Alert>
      </Container>
    </Box>
  );
};

export default KullanimKosullari;
