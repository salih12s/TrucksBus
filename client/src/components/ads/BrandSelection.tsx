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

// Brand Image Component with fallback
const BrandImage: React.FC<{
  brand: Brand;
  getBrandImage: (brand: Brand) => string | null;
}> = ({ brand, getBrandImage }) => {
  const [imageError, setImageError] = useState(false);
  const brandImage = getBrandImage(brand);

  if (!brandImage || imageError) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#000000",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            lineHeight: 1.2,
          }}
        >
          {brand.name}
        </Typography>
      </Box>
    );
  }

  return (
    <img
      src={brandImage}
      alt={brand.name}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
      onError={() => setImageError(true)}
    />
  );
};

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

  // Markaları filtrele ve tekrarları kaldır
  const filteredBrands = brands
    .filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (brand, index, self) =>
        // Aynı slug'a sahip ilk markayı tut, tekrarları kaldır
        index === self.findIndex((b) => b.slug === brand.slug)
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
      akia: "AKIA.png",
      alke: "Alke.png",
      anadol: "Anadol.png",
      askam: "Askam.png",
      astra: "Astra.png",
      avia: "Avia.png",
      bedford: "Bedford.png",
      beemobs: "Beemobs.png",
      bmc: "BMC.png",
      "breda-menarinibus": "Breda.png",
      cenntro: "Cenntro.png",
      chrysler: "Chrysler.png",
      citroen: "Citroen.png",
      cmc: "CMC.png",
      cobus: "cobus-logo.png",
      "coklu-arac": "Coklu Arac.png",
      dacia: "Dacia.png",
      daewoo: "Daewoo.png",
      daf: "DAF.png",
      daihatsu: "Daihatsu.png",
      damperli: "Damperli.png",
      "damperli-grup": "Damperli Grup.png",
      dfm: "DFM.png",
      dfsk: "DFSK.png",
      "diger-markalar": "DigerMarkalar.png",
      dodge: "dodge.png",
      dongfeng: "Dongfeng.png",
      faw: "FAW.png",
      fiat: "Fiat.png",
      folkvan: "folkvan.png",
      ford: "FORD.png",
      "ford-otosan": "FordOtosan.png",
      "ford-trucks": "FordTuck.png",
      frigorifik: "Frigofirik.png",
      gaz: "GAZ.png",
      "green-car": "GreenCar.png",
      guleryuz: "guleryuz-logo.png",
      habas: "Habas.png",
      hfkanuni: "HFKanuni.png",
      hino: "Hino.png",
      hyundai: "Hyundai.png",
      international: "International.png",
      irizar: "Irizar.png",
      isobus: "Isobus.png",
      isuzu: "Isuzu.png",
      iveco: "Iveco-Otoyol.png",
      "iveco-otoyol": "Iveco-Otoyol.png",
      jac: "JAC.png",
      junda: "Junda.png",
      "kamyon-romorklari": "Kamyon Römorkları Tasarımı.png",
      karsan: "Karsan.png",
      kenworth: "Kenworth.png",
      kia: "Kia.png",
      "konteyner-tasiyici-sasi-gr": "Konteyner taşıyıcı & şasi grubu.png",
      kuba: "kuba.png",
      "kuru-yuk": "Kuruyük.png",
      lada: "lada.png",
      liaz: "LIAZ.png",
      lowbed: "Lowbed.png",
      mack: "Mack.png",
      magirus: "Magirus.png",
      man: "MAN.png",
      maxus: "maxus.png",
      maz: "MAZ.png",
      mazda: "mazda.png",
      "mercedes-benz": "Mercedes.png",
      mitsubishi: "Mitsubishi.png",
      "mitsubishi-fuso": "Mitsubishi fuso.png",
      "mitsubishi-temsa": "MitsubishiTemsa.png",
      musatti: "Musatti.png",
      neoplan: "Neoplan.png",
      nissan: "nissan.png",
      opel: "Opel.png",
      ortimobil: "Ortimobil.png",
      otokar: "Otokar.png",
      "ozel-amacli-dorseler": "Ozel-Amacli-Dorseler.png",
      "ozel-amacli-romorklar": "Özel Amaçlı Römorklar.png",
      peugeot: "Peugeot.png",
      piaggio: "Piaggio.png",
      pilotcar: "Pilotcar.png",
      proton: "Proton.png",
      regis: "Regis.png",
      renault: "Renault.png",
      "renault-trucks": "RenaultTruck.png",
      runhorse: "Runhorse.png",
      "sabit-kabin": "Sabit Kabin.png",
      samsung: "Samsung.png",
      sany: "Sany.png",
      scania: "Scania.png",
      setra: "Setra.png",
      shifeng: "Shifeng.png",
      silobas: "Silobas.png",
      sinotruk: "Sinotruk.png",
      skoda: "Skoda.png",
      ssangyong: "SsangYong-Logo.png",
      suzuki: "Suzuki.png",
      tanker: "Tanker.png",
      "tarim-romorklari": "Tarım Römorklar.png",
      "tasima-romorklari": "Taşıma Römorklar.png",
      tata: "Tata.png",
      tatra: "Tatra.png",
      tcv: "TCV.png",
      "tekli-arac": "Tekli Arac.png",
      tekstil: "tekstil.png",
      temsa: "TemsaLogo.png",
      tenax: "Tenax.png",
      tenteli: "Tenteli.png",
      tezeller: "Tezeller.png",
      toyota: "Toyota.png",
      turkkar: "Turkkar.png",
      vanhool: "VanHool.png",
      victory: "Victory.png",
      viseon: "Viseon.png",
      volkswagen: "Volkswagen.png",
      volvo: "Volvo.png",
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
                xs: "repeat(3, 1fr)", // Mobilde 3 tane
                sm: "repeat(4, 1fr)", // Küçük tablette 4 tane
                md: "repeat(6, 1fr)", // Tablette 6 tane
                lg: "repeat(8, 1fr)", // Masaüstünde 8 tane
                xl: "repeat(8, 1fr)", // Büyük ekranlarda 8 tane
              },
              gap: { xs: 1, sm: 1.5, md: 2 }, // Gap'leri de küçülttük
              maxWidth: "1400px", // Max genişliği artırdık
              mx: "auto",
            }}
          >
            {filteredBrands.map((brand) => {
              return (
                <Card
                  key={brand.id}
                  sx={{
                    height: { xs: 120, sm: 140, md: 160 }, // Yüksekliği %50-60 küçülttük (280'den 160'a)
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-4px)", // Hover efektini de küçülttük
                      boxShadow: "0 8px 25px rgba(0,0,0,0.12)", // Shadow'u da küçülttük
                    },
                  }}
                  onClick={() => handleBrandSelect(brand.slug)}
                >
                  {/* Image Section - 75% */}
                  <Box
                    sx={{
                      height: "75%",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      padding: { xs: 0.5, sm: 0.75, md: 1 }, // Padding'leri küçülttük
                    }}
                  >
                    <BrandImage brand={brand} getBrandImage={getBrandImage} />
                  </Box>

                  {/* Text Section - 25% */}
                  <Box
                    sx={{
                      height: "25%",
                      background:
                        "linear-gradient(0deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: { xs: 0.5, sm: 0.75, md: 1 }, // Padding'leri küçülttük
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body2" // h6'dan body2'ye küçülttük
                      sx={{
                        color: "#1976d2",
                        fontWeight: "bold",
                        mb: 0, // Margin'i kaldırdık
                        textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                        fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" }, // Font boyutlarını küçülttük
                        lineHeight: 1.2, // Satır yüksekliğini ayarladık
                      }}
                    >
                      {brand.name}
                    </Typography>
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
