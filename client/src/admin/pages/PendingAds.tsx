import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  Person,
  DateRange,
  AttachMoney,
  DirectionsCar,
} from "@mui/icons-material";
import apiClient from "../../api/client";

interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  year: number;
  mileage: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  category: {
    id: number;
    name: string;
  };
  customFields: {
    condition?: string;
    engineVolume?: string;
    drivetrain?: string;
    color?: string;
    seatCount?: string;
    roofType?: string;
    chassis?: string;
    transmission?: string;
    fuelType?: string;
    exchange?: string;
    plateType?: string;
    plateNumber?: string;
    cityId?: string;
    districtId?: string;
    detailedInfo?: string;
    detailFeatures?: Record<string, boolean>;
  };
}

const PendingAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Onay bekleyen ilanları yükle
  useEffect(() => {
    fetchPendingAds();
  }, []);

  const fetchPendingAds = async () => {
    try {
      const response = await apiClient.get("/ads/admin/pending");
      setAds(response.data as Ad[]);
    } catch (error) {
      console.error("Onay bekleyen ilanlar alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  // İlanı onayla
  const handleApprove = async (adId: number) => {
    try {
      await apiClient.put(`/ads/admin/${adId}/approve`);
      // İlanı listeden kaldır
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
      alert("İlan başarıyla onaylandı!");
    } catch (error) {
      console.error("İlan onaylanırken hata:", error);
      alert("İlan onaylanırken bir hata oluştu");
    }
  };

  // İlanı reddet
  const handleReject = async () => {
    if (!selectedAd || !rejectReason.trim()) {
      alert("Lütfen reddetme gerekçesi yazın");
      return;
    }

    try {
      await apiClient.put(`/ads/admin/${selectedAd.id}/reject`, {
        reason: rejectReason,
      });
      // İlanı listeden kaldır
      setAds((prev) => prev.filter((ad) => ad.id !== selectedAd.id));
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedAd(null);
      alert("İlan başarıyla reddedildi!");
    } catch (error) {
      console.error("İlan reddedilirken hata:", error);
      alert("İlan reddedilirken bir hata oluştu");
    }
  };

  const openRejectDialog = (ad: Ad) => {
    setSelectedAd(ad);
    setRejectDialogOpen(true);
  };

  const toggleCardExpansion = (adId: number) => {
    setExpandedCard(expandedCard === adId ? null : adId);
  };

  // Değerleri Türkçeleştirme fonksiyonları
  const translateCondition = (condition: string) => {
    const translations: Record<string, string> = {
      "ikinci-el": "İkinci El",
      "yurtdisindan-ithal": "Yurtdışından İthal",
      sifir: "Sıfır",
    };
    return translations[condition] || condition;
  };

  const translateDrivetrain = (drivetrain: string) => {
    const translations: Record<string, string> = {
      "onden-cekis": "Önden Çekiş",
      "arkadan-itis": "Arkadan İtiş",
      "4wd-surekli": "4WD Sürekli",
      "arkadan-itis-elektronik": "Arkadan İtiş Elektronik",
    };
    return translations[drivetrain] || drivetrain;
  };

  const translateTransmission = (transmission: string) => {
    const translations: Record<string, string> = {
      manuel: "Manuel",
      otomatik: "Otomatik",
    };
    return translations[transmission] || transmission;
  };

  const translateFuelType = (fuelType: string) => {
    const translations: Record<string, string> = {
      benzinli: "Benzinli",
      "benzinli-lpg": "Benzinli + LPG",
      dizel: "Dizel",
    };
    return translations[fuelType] || fuelType;
  };

  const translateRoofType = (roofType: string) => {
    const translations: Record<string, string> = {
      "normal-tavan": "Normal Tavan",
      "yuksek-tavan": "Yüksek Tavan",
    };
    return translations[roofType] || roofType;
  };

  const translateChassis = (chassis: string) => {
    const translations: Record<string, string> = {
      kisa: "Kısa",
      orta: "Orta",
      uzun: "Uzun",
      "ekstra-uzun": "Ekstra Uzun",
    };
    return translations[chassis] || chassis;
  };

  const translatePlateType = (plateType: string) => {
    const translations: Record<string, string> = {
      "tr-plakali": "Türkiye TR Plakalı",
      "mavi-plakali": "Mavi MA Plakalı",
    };
    return translations[plateType] || plateType;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Onay Bekleyen İlanlar
      </Typography>

      {ads.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Onay bekleyen ilan bulunmuyor.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {ads.map((ad) => (
            <Box key={ad.id}>
              <Card elevation={3}>
                <CardContent>
                  {/* İlan Başlığı ve Temel Bilgiler */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {ad.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Chip
                          icon={<AttachMoney />}
                          label={`${ad.price?.toLocaleString("tr-TR")} TL`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          icon={<DateRange />}
                          label={`${ad.year} Model`}
                          size="small"
                        />
                        <Chip
                          icon={<DirectionsCar />}
                          label={`${ad.mileage?.toLocaleString("tr-TR")} KM`}
                          size="small"
                        />
                        <Chip
                          label={ad.category.name}
                          color="secondary"
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Aksiyon Butonları */}
                    <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(ad.id)}
                        size="small"
                      >
                        Onayla
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => openRejectDialog(ad)}
                        size="small"
                      >
                        Reddet
                      </Button>
                      <IconButton
                        onClick={() => toggleCardExpansion(ad.id)}
                        color="primary"
                      >
                        {expandedCard === ad.id ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Kullanıcı Bilgileri */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {ad.user.firstName} {ad.user.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ad.user.email}
                        </Typography>
                        {ad.user.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {ad.user.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>

                  {/* Açıklama */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {ad.description}
                  </Typography>

                  {/* Detaylı Bilgiler - Genişletilebilir */}
                  <Collapse in={expandedCard === ad.id}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Araç Detayları
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {ad.customFields?.condition && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Durum
                          </Typography>
                          <Typography variant="body1">
                            {translateCondition(ad.customFields.condition)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.engineVolume && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Motor Hacmi
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.engineVolume}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.drivetrain && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Çekiş
                          </Typography>
                          <Typography variant="body1">
                            {translateDrivetrain(ad.customFields.drivetrain)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.color && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Renk
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.color}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.seatCount && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Koltuk Sayısı
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.seatCount} Kişilik
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.roofType && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Tavan Tipi
                          </Typography>
                          <Typography variant="body1">
                            {translateRoofType(ad.customFields.roofType)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.chassis && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Şasi
                          </Typography>
                          <Typography variant="body1">
                            {translateChassis(ad.customFields.chassis)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.transmission && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Vites
                          </Typography>
                          <Typography variant="body1">
                            {translateTransmission(
                              ad.customFields.transmission
                            )}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.fuelType && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Yakıt Tipi
                          </Typography>
                          <Typography variant="body1">
                            {translateFuelType(ad.customFields.fuelType)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.exchange && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Takaslı
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.exchange === "evet"
                              ? "Evet"
                              : "Hayır"}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.plateType && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Plaka Tipi
                          </Typography>
                          <Typography variant="body1">
                            {translatePlateType(ad.customFields.plateType)}
                          </Typography>
                        </Box>
                      )}

                      {ad.customFields?.plateNumber && (
                        <Box sx={{ flex: "1 1 300px", minWidth: "200px" }}>
                          <Typography variant="body2" color="text.secondary">
                            Plaka
                          </Typography>
                          <Typography variant="body1">
                            {ad.customFields.plateNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Detaylı Açıklama */}
                    {ad.customFields?.detailedInfo && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Detaylı Bilgi
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body2">
                            {ad.customFields.detailedInfo}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {/* Araç Özellikleri */}
                    {ad.customFields?.detailFeatures && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Araç Özellikleri
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {Object.entries(ad.customFields.detailFeatures).map(
                            ([key, value]) => {
                              if (value === true) {
                                const featureNames: Record<string, string> = {
                                  abs: "ABS",
                                  alarm: "Alarm",
                                  alasimJant: "Alaşım Jant",
                                  asr: "ASR",
                                  cdCalar: "CD Çalar",
                                  cekiDemiri: "Çeki Demiri",
                                  deriDoseme: "Deri Döşeme",
                                  elektrikliAynalar: "Elektrikli Aynalar",
                                  elektrikliCam: "Elektrikli Cam",
                                  esp: "ESP",
                                  farSis: "Far (Sis)",
                                  farSensoru: "Far Sensörü",
                                  hizSabitleme: "Hız Sabitleme",
                                  klima: "Klima",
                                  sogutucuFrigo: "Soğutucu / Frigo",
                                };
                                return (
                                  <Chip
                                    key={key}
                                    label={featureNames[key] || key}
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                  />
                                );
                              }
                              return null;
                            }
                          )}
                        </Box>
                      </Box>
                    )}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      İlan Tarihi:{" "}
                      {new Date(ad.createdAt).toLocaleDateString("tr-TR")}
                    </Typography>
                  </Collapse>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Red Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>İlanı Reddet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bu ilan reddedilecek. Lütfen reddetme gerekçesini belirtin:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reddetme Gerekçesi"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="İlanın neden reddedildiğini açıklayın..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
          >
            Reddet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PendingAds;
