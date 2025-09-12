import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Breadcrumbs,
  Link,
  Divider,
  Paper,
  Container,
  Chip,
} from "@mui/material";
import { Message, LocationOn, Star } from "@mui/icons-material";

interface Ad {
  id: number;
  title: string;
  description?: string;
  price: number;
  year?: number;
  city?: { name: string };
  category?: { name: string };
  brand?: { name: string };
  model?: string;
  fuel?: string;
  transmission?: string;
  mileage?: number;
  enginePower?: string;
  engineVolume?: string;
  wheelDrive?: string;
  seatCount?: number;
  color?: string;
  damage?: string;
  plateType?: string;
  takas?: string;
  images?: string[];
  user?: {
    name: string;
    phone?: string;
  };
  createdAt: string;
}

const AdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/ads/${id}`);
        const data = await response.json();
        setAd(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ad:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchAd();
    }
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price) + " TL";
  };

  const getImageUrl = (images?: string[]): string => {
    if (!images || images.length === 0) return "/placeholder-image.jpg";
    const firstImage = images[0];
    if (firstImage.startsWith("http")) return firstImage;
    return `http://localhost:5000${firstImage}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (!ad) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>İlan bulunamadı.</Typography>
        <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Ana Sayfaya Dön
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Breadcrumbs sx={{ color: "#666", fontSize: "14px" }}>
            <Link
              color="inherit"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              sx={{
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Vasıta
            </Link>
            <Link color="inherit">Minivan & Panelvan</Link>
            <Link color="inherit">{ad.brand?.name || "Citroen"}</Link>
            <Link color="inherit">{ad.model || "Berlingo"}</Link>
            <Typography color="text.primary">1.6 HDi Combi</Typography>
          </Breadcrumbs>

          {/* Right side navigation links */}
          <Box
            sx={{
              ml: "auto",
              display: "flex",
              gap: 2,
              fontSize: "12px",
              color: "#666",
            }}
          >
            <Link href="#" sx={{ color: "#666", textDecoration: "none" }}>
              Favori İlanlarım
            </Link>
            <Link href="#" sx={{ color: "#666", textDecoration: "none" }}>
              Favori Aramalarım
            </Link>
            <Link href="#" sx={{ color: "#666", textDecoration: "none" }}>
              Size Özel İlanlar
            </Link>
            <Link href="#" sx={{ color: "#666", textDecoration: "none" }}>
              Karşılaştır
            </Link>
          </Box>
        </Box>

        {/* Main Title */}
        <Typography
          variant="h4"
          sx={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
            mb: 3,
            textTransform: "uppercase",
          }}
        >
          {ad.title || "KOCAMAN OTOMOTIV'DEN 2009 MODEL CİTROEN BERLINGO"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left Side - Images */}
          <Box sx={{ flex: { md: "0 0 58%" } }}>
            {/* Main Image */}
            <Card sx={{ mb: 2, position: "relative" }}>
              <CardMedia
                component="img"
                sx={{
                  height: 400,
                  objectFit: "contain",
                  backgroundColor: "#f8f9fa",
                }}
                image={
                  ad.images && ad.images.length > 0
                    ? getImageUrl([ad.images[selectedImageIndex]])
                    : "/placeholder-image.jpg"
                }
                alt={ad.title}
              />

              {/* Büyük Fotoğraf Button */}
              <Button
                variant="outlined"
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  backgroundColor: "white",
                  color: "#333",
                  border: "1px solid #ddd",
                  fontSize: "12px",
                }}
              >
                📸 Büyük Fotoğraf
              </Button>
            </Card>

            {/* Thumbnail Images */}
            {ad.images && ad.images.length > 1 && (
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                {ad.images.slice(0, 7).map((image, index) => (
                  <Box key={index} sx={{ flex: "0 0 calc(100%/7 - 6px)" }}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        border:
                          selectedImageIndex === index
                            ? "2px solid #1976d2"
                            : "1px solid #e0e0e0",
                        "&:hover": { border: "2px solid #1976d2" },
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          height: 60,
                          objectFit: "cover",
                        }}
                        image={getImageUrl([image])}
                        alt={`${ad.title} ${index + 1}`}
                      />
                    </Card>
                  </Box>
                ))}
              </Box>
            )}

            {/* Fotoğraf sayısı */}
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                color: "#666",
                mb: 3,
              }}
            >
              7 / 7 Fotoğraf
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<span>🔍</span>}
                sx={{ color: "#666", borderColor: "#ddd" }}
              >
                Araç Hasar Sorgula
              </Button>
              <Button
                variant="outlined"
                startIcon={<span>⚡</span>}
                sx={{ color: "#666", borderColor: "#ddd" }}
              >
                Ekspertiz Yaptır
              </Button>
              <Button
                variant="outlined"
                startIcon={<span>🔄</span>}
                sx={{ color: "#666", borderColor: "#ddd" }}
              >
                Sıfır Araçları İncele
              </Button>
            </Box>
          </Box>

          {/* Right Side - Details */}
          <Box sx={{ flex: { md: "0 0 42%" } }}>
            {/* Price Section */}
            <Paper sx={{ p: 3, mb: 2, border: "1px solid #e0e0e0" }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#e74c3c",
                  mb: 1,
                }}
              >
                {formatPrice(ad.price || 325000)}
                <Chip
                  icon={<span>🕐</span>}
                  label="Kredi Teklifi Al"
                  size="small"
                  sx={{ ml: 2, backgroundColor: "#f39c12", color: "white" }}
                />
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationOn sx={{ fontSize: 16, mr: 0.5, color: "#666" }} />
                <Typography variant="body2" sx={{ color: "#666", mr: 2 }}>
                  {ad.city?.name || "Ankara"} / Mamak / Dirilik Mh.
                </Typography>
              </Box>

              {/* Premium Galeri Badge */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    backgroundColor: "#333",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: "4px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Star sx={{ fontSize: 14, mr: 0.5, color: "#f39c12" }} />
                  Premium Galeri
                </Box>
                <Typography
                  sx={{ ml: 2, fontSize: "16px", fontWeight: "bold" }}
                >
                  KOCAMAN OTOMOTİV
                </Typography>
              </Box>

              {/* Seller Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Oğuzhan Samet Kocaman
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Button variant="outlined" size="small">
                    Tüm İlanları
                  </Button>
                  <Button variant="outlined" size="small">
                    Favori Satıcılarına Ekle
                  </Button>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ mr: 2, fontWeight: "bold" }}>
                    Cep
                  </Typography>
                  <Typography variant="h6">0 (531) 467 07 21</Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Message />}
                  sx={{ mt: 1, color: "#1976d2", borderColor: "#1976d2" }}
                >
                  📨 Mesaj Gönder
                </Button>
              </Box>
            </Paper>

            {/* Vehicle Details */}
            <Paper sx={{ p: 3, border: "1px solid #e0e0e0" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    İlan No
                  </Typography>
                  <Typography>{ad.id || "1270338024"}</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    İlan Tarihi
                  </Typography>
                  <Typography>11 Eylül 2025</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Marka
                  </Typography>
                  <Typography>{ad.brand?.name || "Citroen"}</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Seri
                  </Typography>
                  <Typography>{ad.model || "Berlingo"}</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Model
                  </Typography>
                  <Typography>1.6 HDi Combi</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Yıl
                  </Typography>
                  <Typography>{ad.year || "2009"}</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Yakıt Tipi
                  </Typography>
                  <Typography>{ad.fuel || "Dizel"}</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Vites
                  </Typography>
                  <Typography>{ad.transmission || "Manuel"}</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Araç Durumu
                  </Typography>
                  <Typography>İkinci El</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    KM
                  </Typography>
                  <Typography>
                    {ad.mileage?.toLocaleString() || "175.000"}
                  </Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Kasa Tipi
                  </Typography>
                  <Typography>Camlı Van</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Şasi
                  </Typography>
                  <Typography>Kısa (Standart)</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Motor Gücü
                  </Typography>
                  <Typography>75 hp</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Motor Hacmi
                  </Typography>
                  <Typography>1560 cc</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Çekiş
                  </Typography>
                  <Typography>4x2 (Önden Çekişli)</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Koltuk Sayısı
                  </Typography>
                  <Typography>4+1</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Renk
                  </Typography>
                  <Typography>Beyaz</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Ruhsat Kaydı
                  </Typography>
                  <Typography>Kamyonet</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Ağır Hasar Kaydı
                  </Typography>
                  <Typography>Evet</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Kimden
                  </Typography>
                  <Typography>Galeriden</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Plaka / Uyruk
                  </Typography>
                  <Typography>Türkiye (TR) Plakalı</Typography>
                </Box>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "#666" }}>
                    Takas
                  </Typography>
                  <Typography>Evet</Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<span>📞</span>}
                  size="small"
                  sx={{ color: "#666", borderColor: "#ddd" }}
                >
                  İlan ile İlgili Şikayetin Var
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AdDetail;
