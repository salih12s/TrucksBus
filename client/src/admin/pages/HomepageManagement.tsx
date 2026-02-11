import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Divider,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Palette as PaletteIcon,
  ContactMail as ContactMailIcon,
  Announcement as AnnouncementIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
  fetchSiteSettings,
  updateSiteSettings,
  clearSettingsCache,
  type SiteSettings,
  DEFAULT_SETTINGS,
} from "../../api/settings";

const HomepageManagement: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] =
    useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });
  const [hasChanges, setHasChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      clearSettingsCache();
      const data = await fetchSiteSettings();
      setSettings(data);
      setOriginalSettings(data);
      setHasChanges(false);
    } catch {
      setSnackbar({
        open: true,
        message: "Ayarlar yüklenirken hata oluştu",
        severity: "error",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const changed =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleChange = (
    field: keyof SiteSettings,
    value: string | number | boolean | null,
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSiteSettings(settings);
      setSettings(updated);
      setOriginalSettings(updated);
      setHasChanges(false);
      setSnackbar({
        open: true,
        message: "✅ Ayarlar başarıyla kaydedildi!",
        severity: "success",
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Bilinmeyen hata";
      setSnackbar({
        open: true,
        message: "❌ Kaydetme hatası: " + errMsg,
        severity: "error",
      });
    }
    setSaving(false);
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
    setSnackbar({
      open: true,
      message: "Değişiklikler geri alındı",
      severity: "info",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Ayarlar yükleniyor...</Typography>
      </Box>
    );
  }

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
    gap: 2,
  };

  const gridStyle3Col = {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
    gap: 2,
  };

  return (
    <Box>
      {/* Başlık */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#313B4C" }}
          >
            🏠 Anasayfa Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Anasayfadaki tüm içerikleri buradan yönetebilirsiniz
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          {hasChanges && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
            >
              Geri Al
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={!hasChanges || saving}
            sx={{
              backgroundColor: "#D34237",
              "&:hover": { backgroundColor: "#b5352c" },
            }}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </Box>
      </Box>

      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Kaydedilmemiş değişiklikler var. Kaydetmeyi unutmayın!
        </Alert>
      )}

      {/* HEADER / SLOGAN */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HomeIcon sx={{ mr: 1, color: "#D34237" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Header & Slogan
          </Typography>
          <Chip label="Üst Menü" size="small" sx={{ ml: 2 }} />
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={gridStyle}>
            <TextField
              fullWidth
              label="Sol Slogan"
              value={settings.sloganLeft}
              onChange={(e) => handleChange("sloganLeft", e.target.value)}
              helperText="Logo'nun solundaki metin"
              size="small"
            />
            <TextField
              fullWidth
              label="Sağ Slogan"
              value={settings.sloganRight}
              onChange={(e) => handleChange("sloganRight", e.target.value)}
              helperText="Logo'nun sağındaki metin"
              size="small"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Logo URL (opsiyonel)"
              value={settings.logoUrl || ""}
              onChange={(e) => handleChange("logoUrl", e.target.value || null)}
              helperText="Boş bırakılırsa varsayılan logo kullanılır"
              size="small"
            />
          </Box>
          <Card
            variant="outlined"
            sx={{ p: 2, mt: 2, backgroundColor: settings.headerBgColor }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Önizleme:
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                {settings.sloganLeft}
              </Typography>
              <Box
                sx={{
                  width: 60,
                  height: 40,
                  backgroundColor: "#ccc",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                LOGO
              </Box>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                {settings.sloganRight}
              </Typography>
            </Box>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* ANA SAYFA İÇERİK */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon sx={{ mr: 1, color: "#D34237" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Ana Sayfa İçerik
          </Typography>
          <Chip label="Vitrin & Arama" size="small" sx={{ ml: 2 }} />
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={gridStyle}>
            <TextField
              fullWidth
              label="Vitrin Başlığı"
              value={settings.showcaseTitle}
              onChange={(e) => handleChange("showcaseTitle", e.target.value)}
              helperText="Ana sayfadaki sayfa başlığı"
              size="small"
            />
            <TextField
              fullWidth
              label="Arama Çubuğu Placeholder"
              value={settings.searchPlaceholder}
              onChange={(e) =>
                handleChange("searchPlaceholder", e.target.value)
              }
              helperText="Arama kutusundaki ipucu metni"
              size="small"
            />
          </Box>
          <Box sx={{ ...gridStyle3Col, mt: 2 }}>
            <TextField
              fullWidth
              label="Sayfa Başına İlan"
              type="number"
              value={settings.adsPerPage}
              onChange={(e) =>
                handleChange("adsPerPage", parseInt(e.target.value) || 20)
              }
              helperText="Tek sayfada gösterilecek ilan sayısı"
              size="small"
            />
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showExampleBadge}
                    onChange={(e) =>
                      handleChange("showExampleBadge", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Örnek İlan Rozeti Göster"
              />
            </Box>
            <TextField
              fullWidth
              label="Fiyat Rengi"
              type="color"
              value={settings.cardPriceColor}
              onChange={(e) => handleChange("cardPriceColor", e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "4px",
                        backgroundColor: settings.cardPriceColor,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {settings.showExampleBadge && (
            <Box sx={{ ...gridStyle, mt: 2 }}>
              <TextField
                fullWidth
                label="Rozet Metni"
                value={settings.exampleBadgeText}
                onChange={(e) =>
                  handleChange("exampleBadgeText", e.target.value)
                }
                size="small"
              />
              <TextField
                fullWidth
                label="Rozet Rengi"
                type="color"
                value={settings.exampleBadgeColor}
                onChange={(e) =>
                  handleChange("exampleBadgeColor", e.target.value)
                }
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "4px",
                          backgroundColor: settings.exampleBadgeColor,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
          {/* Kart Önizleme */}
          <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Kart Önizleme:
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Card
                sx={{
                  width: 180,
                  p: 1,
                  position: "relative",
                  overflow: "visible",
                }}
              >
                {settings.showExampleBadge && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: -20,
                      backgroundColor: settings.exampleBadgeColor,
                      color: "white",
                      padding: "2px 25px",
                      fontSize: "8px",
                      fontWeight: "bold",
                      transform: "rotate(45deg)",
                      zIndex: 10,
                    }}
                  >
                    {settings.exampleBadgeText}
                  </Box>
                )}
                <Box
                  sx={{
                    height: 80,
                    backgroundColor: "#f0f0f0",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  🚛
                </Box>
                <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
                  Örnek İlan Başlığı
                </Typography>
                <Typography sx={{ fontSize: "10px", color: "#666" }}>
                  İstanbul | 2024
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: settings.cardPriceColor,
                    textAlign: "right",
                  }}
                >
                  1.500.000 TL
                </Typography>
              </Card>
            </Box>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* RENK TEMASI */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <PaletteIcon sx={{ mr: 1, color: "#D34237" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Renk Teması
          </Typography>
          <Chip label="Renkler" size="small" sx={{ ml: 2 }} />
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={gridStyle3Col}>
            <TextField
              fullWidth
              label="Ana Renk (Butonlar)"
              type="color"
              value={settings.primaryColor}
              onChange={(e) => handleChange("primaryColor", e.target.value)}
              helperText="Butonlar, ikonlar için ana renk"
              size="small"
            />
            <TextField
              fullWidth
              label="Header Arka Plan"
              type="color"
              value={settings.headerBgColor}
              onChange={(e) => handleChange("headerBgColor", e.target.value)}
              helperText="Üst menü arka plan rengi"
              size="small"
            />
            <TextField
              fullWidth
              label="Footer Arka Plan"
              type="color"
              value={settings.footerBgColor}
              onChange={(e) => handleChange("footerBgColor", e.target.value)}
              helperText="Alt bilgi arka plan rengi"
              size="small"
            />
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
            <Box
              sx={{
                p: 2,
                backgroundColor: settings.headerBgColor,
                borderRadius: 1,
                border: "1px solid #ddd",
              }}
            >
              <Typography variant="body2">Header</Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                backgroundColor: settings.primaryColor,
                borderRadius: 1,
                color: "white",
              }}
            >
              <Typography variant="body2">Buton</Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                backgroundColor: settings.footerBgColor,
                borderRadius: 1,
                border: "1px solid #ddd",
              }}
            >
              <Typography variant="body2">Footer</Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* İLETİŞİM */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <ContactMailIcon sx={{ mr: 1, color: "#D34237" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            İletişim Bilgileri
          </Typography>
          <Chip label="E-posta & Adres" size="small" sx={{ ml: 2 }} />
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={gridStyle}>
            <TextField
              fullWidth
              label="E-posta Adresi"
              value={settings.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              helperText="İletişim sayfası ve footer'da görünür"
              size="small"
            />
            <TextField
              fullWidth
              label="Telefon (opsiyonel)"
              value={settings.contactPhone || ""}
              onChange={(e) =>
                handleChange("contactPhone", e.target.value || null)
              }
              helperText="Boş bırakılırsa görünmez"
              size="small"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Adres"
              value={settings.contactAddress}
              onChange={(e) => handleChange("contactAddress", e.target.value)}
              helperText="İletişim sayfasında görünür"
              size="small"
              multiline
              rows={2}
            />
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
            Sosyal Medya Linkleri
          </Typography>
          <Box sx={gridStyle}>
            <TextField
              fullWidth
              label="Facebook URL"
              value={settings.facebookUrl || ""}
              onChange={(e) =>
                handleChange("facebookUrl", e.target.value || null)
              }
              size="small"
            />
            <TextField
              fullWidth
              label="Twitter/X URL"
              value={settings.twitterUrl || ""}
              onChange={(e) =>
                handleChange("twitterUrl", e.target.value || null)
              }
              size="small"
            />
            <TextField
              fullWidth
              label="Instagram URL"
              value={settings.instagramUrl || ""}
              onChange={(e) =>
                handleChange("instagramUrl", e.target.value || null)
              }
              size="small"
            />
            <TextField
              fullWidth
              label="LinkedIn URL"
              value={settings.linkedinUrl || ""}
              onChange={(e) =>
                handleChange("linkedinUrl", e.target.value || null)
              }
              size="small"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* SEO */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon sx={{ mr: 1, color: "#D34237" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            SEO Ayarları
          </Typography>
          <Chip label="Başlık & Açıklama" size="small" sx={{ ml: 2 }} />
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Site Başlığı"
            value={settings.siteTitle}
            onChange={(e) => handleChange("siteTitle", e.target.value)}
            helperText="Tarayıcı sekmesinde görünecek başlık"
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Site Açıklaması"
            value={settings.siteDescription}
            onChange={(e) => handleChange("siteDescription", e.target.value)}
            helperText="Arama motorlarında görünecek açıklama"
            size="small"
            multiline
            rows={2}
          />
        </AccordionDetails>
      </Accordion>

      {/* DUYURU & BAKIM */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AnnouncementIcon sx={{ mr: 1, color: "#D34237" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Duyuru & Bakım Modu
          </Typography>
          <Chip label="Bildirimler" size="small" sx={{ ml: 2 }} />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Duyuru Bandı
          </Typography>
          <Box sx={gridStyle3Col}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showAnnouncement}
                    onChange={(e) =>
                      handleChange("showAnnouncement", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {settings.showAnnouncement ? (
                      <VisibilityIcon fontSize="small" />
                    ) : (
                      <VisibilityOffIcon fontSize="small" />
                    )}
                    Duyuru Göster
                  </Box>
                }
              />
            </Box>
            <TextField
              fullWidth
              label="Duyuru Metni"
              value={settings.announcementText || ""}
              onChange={(e) =>
                handleChange("announcementText", e.target.value || null)
              }
              disabled={!settings.showAnnouncement}
              size="small"
            />
            <TextField
              fullWidth
              label="Duyuru Rengi"
              type="color"
              value={settings.announcementColor}
              onChange={(e) =>
                handleChange("announcementColor", e.target.value)
              }
              disabled={!settings.showAnnouncement}
              size="small"
            />
          </Box>
          {settings.showAnnouncement && settings.announcementText && (
            <Box
              sx={{
                p: 1.5,
                mt: 2,
                backgroundColor: settings.announcementColor,
                color: "white",
                borderRadius: 1,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              📢 {settings.announcementText}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", mb: 1, color: "#d32f2f" }}
          >
            ⚠️ Bakım Modu
          </Typography>
          <Box sx={gridStyle}>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      handleChange("maintenanceMode", e.target.checked)
                    }
                    color="error"
                  />
                }
                label="Bakım Modu Aktif"
              />
              {settings.maintenanceMode && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  DİKKAT: Bakım modu aktif! Site ziyaretçilere kapalı.
                </Alert>
              )}
            </Box>
            <TextField
              fullWidth
              label="Bakım Mesajı"
              value={settings.maintenanceMsg}
              onChange={(e) => handleChange("maintenanceMsg", e.target.value)}
              disabled={!settings.maintenanceMode}
              size="small"
              multiline
              rows={2}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Son güncelleme */}
      <Box mt={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          {settings.updatedAt
            ? `Son güncelleme: ${new Date(settings.updatedAt).toLocaleString("tr-TR")}`
            : "Henüz güncelleme yapılmadı"}
        </Typography>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomepageManagement;
