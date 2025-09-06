import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CircularProgress,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  Chip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "@/api/client";
import Header from "../layout/Header";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
  _count?: {
    models: number;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const BrandSelection: React.FC = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching brands for category:", categorySlug);

      // Fetch category info
      const categoryResponse = await apiClient.get(
        `/categories/${categorySlug}`
      );
      console.log("Category response:", categoryResponse.data);
      setCategory(categoryResponse.data as Category);

      // Fetch brands for this category
      const brandsResponse = await apiClient.get(
        `/categories/${categorySlug}/brands`
      );
      console.log("Brands response:", brandsResponse.data);
      setBrands(brandsResponse.data as Brand[]);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBrandSelect = (brandSlug: string) => {
    navigate(`/categories/${categorySlug}/brands/${brandSlug}/models`);
  };

  const handleBackToCategories = () => {
    navigate("/category-selection");
  };

  // Brand resim dosyası belirleme fonksiyonu
  const getBrandImage = (brand: Brand) => {
    // Slug'a göre resim dosyası eşleştirme
    const imageMap: { [key: string]: string } = {
      // Kamyon & Kamyonet markaları
      aixam: "Aixam.png",
      akeso: "Akeso.png",
      alke: "Alke.png",
      anadol: "Anadol.png",
      askam: "Askam.png",
      astra: "Astra.png",
      avia: "Avia.png",
      bmc: "BMC.png",
      bedford: "Bedford.png",
      beemobs: "Beemobs.png",
      cmc: "CMC.png",
      cenntro: "Cenntro.png",
      chrysler: "Chrysler.png",
      citroen: "Citroen.png",
      daf: "DAF.png",
      dfm: "DFM.png",
      dobarta: "DigerMarkalar.png",
      dongfeng: "Dongfeng.png",
      ducati: "DigerMarkalar.png",
      econelo: "DigerMarkalar.png",
      effe: "DigerMarkalar.png",
      eikto: "DigerMarkalar.png",
      fargo: "DigerMarkalar.png",
      fiat: "Fiat.png",
      ford: "FORD.png",
      foton: "DigerMarkalar.png",
      gaz: "GAZ.png",
      goupil: "DigerMarkalar.png",
      guleryuz: "guleryuz-logo.png",
      hanbird: "DigerMarkalar.png",
      hidromek: "DigerMarkalar.png",
      hyundai: "Hyundai.png",
      isuzu: "Isuzu.png",
      iveco: "Iveco-Otoyol.png",
      jac: "JAC.png",
      jmc: "DigerMarkalar.png",
      jinbei: "DigerMarkalar.png",
      karsan: "Karsan.png",
      kia: "Kia.png",
      "kia-bongo": "Kia.png",
      "kia-towner": "Kia.png",
      komatsu: "DigerMarkalar.png",
      lada: "lada.png",
      "land-rover": "DigerMarkalar.png",
      man: "MAN.png",
      mahindra: "DigerMarkalar.png",
      mammoth: "DigerMarkalar.png",
      mazda: "mazda.png",
      mercedes: "Mercedes.png",
      "mercedes-benz": "Mercedes.png",
      mitsubishi: "Mitsubishi.png",
      nissan: "nissan.png",
      opel: "Opel.png",
      otokar: "Otokar.png",
      peugeot: "Peugeot.png",
      piaggio: "Piaggio.png",
      proterra: "DigerMarkalar.png",
      ram: "DigerMarkalar.png",
      renault: "Renault.png",
      runhorse: "Runhorse.png",
      samsung: "Samsung.png",
      sany: "Sany.png",
      scania: "Scania.png",
      shifeng: "Shifeng.png",
      sinotruk: "Sinotruk.png",
      skoda: "Skoda.png",
      suzuki: "Suzuki.png",
      tata: "Tata.png",
      tatra: "Tatra.png",
      tenax: "Tenax.png",
      toyota: "Toyota.png",
      victory: "Victory.png",
      volkswagen: "Volkswagen.png",
      volvo: "Volvo.png",

      // Minibüs & Midibüs markaları
      "ford-otosan": "FordOtosan.png",
      "iveco-otoyol": "Iveco-Otoyol.png",
      magirus: "Magirus.png",
      ssangyong: "SsangYong-Logo.png",
      tezeller: "Tezeller.png",
      vanhool: "VanHool.png",
      temsa: "TemsaLogo.png",

      // Diğer markalar
      tofas: "DigerMarkalar.png",
      atcom: "DigerMarkalar.png",
      agrale: "DigerMarkalar.png",
      beulas: "DigerMarkalar.png",
      cobus: "cobus-logo.png",
    };

    const fileName = imageMap[brand.slug.toLowerCase()];
    return fileName ? `/BrandsImage/${fileName}` : null;
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToCategories}
            sx={{
              textDecoration: "none",
              color: "primary.main",
              cursor: "pointer",
            }}
          >
            Kategoriler
          </Link>
          <Typography color="text.primary">{category?.name}</Typography>
          <Typography color="text.primary">Marka Seçimi</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Marka Seçin
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {category?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {filteredBrands.length} marka bulundu
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Marka ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              mx: "auto",
              display: "block",
            }}
          />
        </Box>

        {/* Brands Grid */}
        {filteredBrands.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {searchQuery
                ? "Arama kriterlerinize uygun marka bulunamadı"
                : "Bu kategoride henüz marka bulunmuyor"}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              maxWidth: "1200px",
              mx: "auto",
            }}
          >
            {filteredBrands.map((brand) => {
              const brandImage = getBrandImage(brand);
              return (
                <Card
                  key={brand.id}
                  sx={{
                    height: 280,
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    },
                  }}
                  onClick={() => handleBrandSelect(brand.slug)}
                >
                  {/* Image Section - 70% */}
                  <Box
                    sx={{
                      height: "70%",
                      position: "relative",
                      backgroundImage: brandImage
                        ? `url(${brandImage})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundSize: brandImage ? "contain" : "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: brandImage ? "#f5f5f5" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!brandImage && (
                      <Typography
                        variant="h2"
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        {brand.name.charAt(0)}
                      </Typography>
                    )}
                  </Box>

                  {/* Text Section - 30% */}
                  <Box
                    sx={{
                      height: "30%",
                      background:
                        "linear-gradient(0deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#1976d2",
                        fontWeight: "bold",
                        mb: 0.5,
                        textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                        fontSize: { xs: "0.9rem", sm: "1.1rem" },
                      }}
                    >
                      {brand.name}
                    </Typography>

                    {brand._count && (
                      <Chip
                        label={`${brand._count.models} model`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(25, 118, 210, 0.1)",
                          color: "#1976d2",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </>
  );
};

export default BrandSelection;
