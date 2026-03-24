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
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import {
  Cookie,
  Settings,
  Security,
  Analytics,
  Campaign,
  ExpandMore,
  Save,
  Info,
  Warning,
} from "@mui/icons-material";

const CerezYonetimi: React.FC = () => {
  const [cookieSettings, setCookieSettings] = React.useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  const cookieTypes = [
    {
      name: "Zorunlu Çerezler",
      key: "necessary",
      icon: <Security sx={{ color: "#f44336" }} />,
      description:
        "Sitenin düzgün çalışması için gerekli çerezler. Devre dışı bırakılamaz.",
      examples: [
        "Oturum bilgileri",
        "Güvenlik ayarları",
        "Dil tercihleri",
        "Çerez onayları",
      ],
      required: true,
    },
    {
      name: "Analitik Çerezler",
      key: "analytics",
      icon: <Analytics sx={{ color: "#2196f3" }} />,
      description:
        "Site kullanımını analiz etmek ve performansı iyileştirmek için kullanılır.",
      examples: [
        "Google Analytics",
        "Sayfa görüntülenme sayıları",
        "Kullanıcı davranış analizi",
      ],
      required: false,
    },
    {
      name: "Pazarlama Çerezleri",
      key: "marketing",
      icon: <Campaign sx={{ color: "#ff9800" }} />,
      description: "Kişiselleştirilmiş reklamlar göstermek için kullanılır.",
      examples: ["Facebook Pixel", "Google Ads", "Retargeting çerezleri"],
      required: false,
    },
    {
      name: "İşlevsel Çerezler",
      key: "functional",
      icon: <Settings sx={{ color: "#4caf50" }} />,
      description: "Gelişmiş özellikler ve kişiselleştirme için kullanılır.",
      examples: ["Favoriler", "Arama filtreleri", "Tema tercihleri"],
      required: false,
    },
  ];

  const cookieDetails = [
    {
      name: "__session",
      purpose: "Kullanıcı oturumu yönetimi",
      duration: "Oturum süresi",
      type: "Zorunlu",
    },
    {
      name: "language",
      purpose: "Dil tercihini hatırlar",
      duration: "1 yıl",
      type: "Zorunlu",
    },
    {
      name: "_ga",
      purpose: "Google Analytics - ziyaretçi ayırma",
      duration: "2 yıl",
      type: "Analitik",
    },
    {
      name: "_gid",
      purpose: "Google Analytics - oturum ayırma",
      duration: "24 saat",
      type: "Analitik",
    },
    {
      name: "_fbp",
      purpose: "Facebook Pixel - kullanıcı izleme",
      duration: "3 ay",
      type: "Pazarlama",
    },
  ];

  const handleSettingChange = (key: string, value: boolean) => {
    if (key === "necessary") return; // Can't change necessary cookies
    setCookieSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Save cookie settings to localStorage or send to server
    localStorage.setItem("cookieSettings", JSON.stringify(cookieSettings));
    alert("Çerez ayarlarınız kaydedildi!");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%)",
            color: "white",
            p: 6,
            borderRadius: 4,
            mb: 6,
            textAlign: "center",
          }}
        >
          <Cookie sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Çerez Yönetimi
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, maxWidth: 600, mx: "auto" }}
          >
            Çerez tercihlerinizi yönetin ve gizliliğinizi kontrol edin
          </Typography>
        </Paper>

        {/* Cookie Info */}
        <Alert severity="info" sx={{ mb: 6, borderRadius: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            <strong>Çerezler Nedir?</strong> Çerezler, web sitesini ziyaret
            ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. Site
            deneyiminizi kişiselleştirmek ve geliştirmek için kullanılır.
          </Typography>
        </Alert>

        {/* Cookie Settings */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 4, textAlign: "center" }}
        >
          Çerez Ayarları
        </Typography>

        {cookieTypes.map((type, index) => (
          <Card key={index} sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Box sx={{ mt: 0.5 }}>{type.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {type.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, lineHeight: 1.6 }}
                    >
                      {type.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Örnekler:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {type.examples.map((example, exampleIndex) => (
                        <Typography
                          key={exampleIndex}
                          variant="caption"
                          sx={{
                            bgcolor: "#f5f5f5",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 12,
                          }}
                        >
                          {example}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ ml: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          cookieSettings[
                            type.key as keyof typeof cookieSettings
                          ]
                        }
                        onChange={(e) =>
                          handleSettingChange(type.key, e.target.checked)
                        }
                        disabled={type.required}
                      />
                    }
                    label={type.required ? "Zorunlu" : "İsteğe bağlı"}
                    labelPlacement="top"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* Save Settings Button */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={saveSettings}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #45a049 0%, #5cb85c 100%)",
              },
            }}
          >
            Ayarları Kaydet
          </Button>
        </Box>

        {/* Detailed Cookie Information */}
        <Accordion
          sx={{ mb: 3, borderRadius: 2, "&:before": { display: "none" } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ bgcolor: "#f5f5f5", borderRadius: "8px 8px 0 0" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detaylı Çerez Bilgileri
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Sitemizde kullanılan çerezlerin detaylı listesi:
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "200px 250px 120px 120px",
                  gap: 2,
                  minWidth: 700,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Çerez Adı
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Amaç
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Süre
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Tür
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {cookieDetails.map((cookie, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "200px 250px 120px 120px",
                    gap: 2,
                    minWidth: 700,
                    py: 1,
                    borderBottom:
                      index < cookieDetails.length - 1
                        ? "1px solid #eee"
                        : "none",
                  }}
                >
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {cookie.name}
                  </Typography>
                  <Typography variant="body2">{cookie.purpose}</Typography>
                  <Typography variant="body2">{cookie.duration}</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        cookie.type === "Zorunlu"
                          ? "#f44336"
                          : cookie.type === "Analitik"
                            ? "#2196f3"
                            : "#ff9800",
                      fontWeight: 500,
                    }}
                  >
                    {cookie.type}
                  </Typography>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Third Party Services */}
        <Paper sx={{ p: 4, mb: 6, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            <Info sx={{ mr: 2, verticalAlign: "middle" }} />
            Üçüncü Taraf Hizmetler
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            Sitemizde kullanılan üçüncü taraf hizmetler ve gizlilik
            politikaları:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Google Analytics"
                secondary="Web sitesi trafiğini analiz etmek için kullanılır. Google'ın gizlilik politikasını inceleyin."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Facebook Pixel"
                secondary="Sosyal medya reklamcılığı için kullanılır. Facebook'un gizlilik politikasını inceleyin."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="YouTube"
                secondary="Video içerikleri için kullanılır. YouTube'un gizlilik politikasını inceleyin."
              />
            </ListItem>
          </List>
        </Paper>

        {/* Browser Settings */}
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Warning />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                Tarayıcı Ayarları
              </Typography>
              <Typography variant="body2">
                Çerezleri tarayıcı ayarlarınızdan da yönetebilirsiniz. Ancak
                bazı çerezleri devre dışı bırakmak sitenin düzgün çalışmamasına
                neden olabilir.
              </Typography>
            </Box>
          </Box>
        </Alert>

        {/* Contact */}
        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "#e3f2fd" }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Çerezler Hakkında Sorular
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Çerez kullanımımız hakkında sorularınız için bizimle iletişime
            geçebilirsiniz:
          </Typography>
          <Typography variant="body2">
            📧 <strong>E-posta:</strong> iletisim@trucksbus.com.tr
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default CerezYonetimi;
