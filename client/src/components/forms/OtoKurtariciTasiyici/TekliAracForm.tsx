import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../layout/Header";
import apiClient from "../../../api/client";

interface City {
  id: number;
  name: string;
  plateCode: string;
}

interface District {
  id: number;
  name: string;
  cityId: number;
}

interface FormData {
  title: string;
  description: string;
  productionYear: string;
  price: string;

  // Araç Bilgileri
  marka: string;
  model: string;
  motor: string;
  motorGucu: string;
  vites: string;
  yakit: string;
  cekisTipi: string;

  // Tekli Araç Kurtarıcı Özellikleri
  kurtariciTipi: string;
  kaldirmaKapasitesi: string;
  aracTipi: string;
  platformUzunlugu: string;
  platformGenisligi: string;
  vinc: string;
  vincKapasitesi: string;
  hidrolik: string;
  teleskopik: string;
  yan_yukleme: string;
  acil_durum: string;

  // Teknik Özellikler
  km: string;
  beygirGucu: string;
  motorHacmi: string;
  agirlik: string;
  azamiYuklenebilirAgirlik: string;
  koltukSayisi: string;

  // Konum
  cityId: string;
  districtId: string;

  // Fotoğraflar
  photos: File[];
  showcasePhoto: File | null;

  // İletişim Bilgileri
  sellerName: string;
  phone: string;
  email: string;

  // Ekstra
  warranty: string;
  negotiable: string;
  exchange: string;
  detailedInfo: string;
}

const TekliAracForm: React.FC = () => {
  const navigate = useNavigate();

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    productionYear: "",
    price: "",
    marka: "",
    model: "",
    motor: "",
    motorGucu: "",
    vites: "",
    yakit: "",
    cekisTipi: "",
    kurtariciTipi: "Tekli Araç Kurtarıcı",
    kaldirmaKapasitesi: "",
    aracTipi: "",
    platformUzunlugu: "",
    platformGenisligi: "",
    vinc: "Hayır",
    vincKapasitesi: "",
    hidrolik: "Hayır",
    teleskopik: "Hayır",
    yan_yukleme: "Hayır",
    acil_durum: "Hayır",
    km: "",
    beygirGucu: "",
    motorHacmi: "",
    agirlik: "",
    azamiYuklenebilirAgirlik: "",
    koltukSayisi: "",
    cityId: "",
    districtId: "",
    photos: [],
    showcasePhoto: null,
    sellerName: "",
    phone: "",
    email: "",
    warranty: "Yok",
    negotiable: "Evet",
    exchange: "Hayır",
    detailedInfo: "",
  });

  // Seçenekler
  const uretimYillari = Array.from(
    { length: 2024 - 1990 + 1 },
    (_, i) => 2024 - i
  );

  const markalar = [
    "Mercedes-Benz",
    "Volvo",
    "Scania",
    "MAN",
    "DAF",
    "Iveco",
    "Renault",
    "Ford",
    "Isuzu",
    "Mitsubishi",
    "Hyundai",
    "BMC",
    "Otokar",
    "Temsa",
  ];

  const motorlar = [
    "Euro 3",
    "Euro 4",
    "Euro 5",
    "Euro 6",
    "Euro 6c",
    "Euro 6d",
  ];

  const vitesler = ["Manuel", "Otomatik", "Yarı Otomatik", "CVT"];

  const yakitlar = ["Dizel", "Benzin", "LPG", "CNG", "Elektrik", "Hibrit"];

  const cekisTipleri = [
    "Önden Çekiş",
    "Arkadan İtiş",
    "4x2",
    "4x4",
    "6x2",
    "6x4",
    "8x4",
  ];

  const aracTipleri = [
    "Otomobil",
    "SUV",
    "Minivan",
    "Pick-up",
    "Ticari Araç",
    "Motosiklet",
    "ATV",
  ];

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (formData.cityId) {
      loadDistricts(parseInt(formData.cityId));
    }
  }, [formData.cityId]);

  const loadCities = async () => {
    try {
      const response = await apiClient.get("/cities");
      setCities(response.data as City[]);
    } catch (error) {
      console.error("Şehirler yüklenirken hata:", error);
    }
  };

  const loadDistricts = async (cityId: number) => {
    try {
      const response = await apiClient.get(`/districts/${cityId}`);
      setDistricts(response.data as District[]);
    } catch (error) {
      console.error("İlçeler yüklenirken hata:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const setShowcasePhoto = (photo: File) => {
    setFormData((prev) => ({
      ...prev,
      showcasePhoto: photo,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Form verilerini ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "photos" && key !== "showcasePhoto") {
          submitData.append(key, value as string);
        }
      });

      // Fotoğrafları ekle
      formData.photos.forEach((photo) => {
        submitData.append("photos", photo);
      });

      if (formData.showcasePhoto) {
        submitData.append("showcasePhoto", formData.showcasePhoto);
      }

      const response = await apiClient.post("/ads/oto-kurtarici", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate("/ilanlarim");
        }, 2000);
      }
    } catch (error) {
      console.error("İlan oluşturulurken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <Box sx={{ padding: 3 }}>
        <Header />
        <Alert severity="success" sx={{ mb: 3 }}>
          İlanınız başarıyla oluşturuldu! İlanlarım sayfasına
          yönlendiriliyorsunuz...
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Header />

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 4, textAlign: "center" }}
      >
        Tekli Araç Kurtarıcı İlanı Oluştur
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Temel Bilgiler */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Temel Bilgiler
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="İlan Başlığı"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Açıklama"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Üretim Yılı</InputLabel>
                  <Select
                    name="productionYear"
                    value={formData.productionYear}
                    onChange={handleSelectChange}
                    required
                  >
                    {uretimYillari.map((yil) => (
                      <MenuItem key={yil} value={yil.toString()}>
                        {yil}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Fiyat (TL)"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  type="number"
                  required
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Araç Bilgileri */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Araç Bilgileri
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Marka</InputLabel>
                <Select
                  name="marka"
                  value={formData.marka}
                  onChange={handleSelectChange}
                  required
                >
                  {markalar.map((marka) => (
                    <MenuItem key={marka} value={marka}>
                      {marka}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
              />

              <FormControl fullWidth>
                <InputLabel>Motor</InputLabel>
                <Select
                  name="motor"
                  value={formData.motor}
                  onChange={handleSelectChange}
                  required
                >
                  {motorlar.map((motor) => (
                    <MenuItem key={motor} value={motor}>
                      {motor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Motor Gücü (HP)"
                name="motorGucu"
                value={formData.motorGucu}
                onChange={handleInputChange}
                type="number"
              />

              <FormControl fullWidth>
                <InputLabel>Vites</InputLabel>
                <Select
                  name="vites"
                  value={formData.vites}
                  onChange={handleSelectChange}
                  required
                >
                  {vitesler.map((vites) => (
                    <MenuItem key={vites} value={vites}>
                      {vites}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Yakıt</InputLabel>
                <Select
                  name="yakit"
                  value={formData.yakit}
                  onChange={handleSelectChange}
                  required
                >
                  {yakitlar.map((yakit) => (
                    <MenuItem key={yakit} value={yakit}>
                      {yakit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Çekiş Tipi</InputLabel>
                <Select
                  name="cekisTipi"
                  value={formData.cekisTipi}
                  onChange={handleSelectChange}
                  required
                >
                  {cekisTipleri.map((tip) => (
                    <MenuItem key={tip} value={tip}>
                      {tip}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Kurtarıcı Özellikleri */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kurtarıcı Özellikleri
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Kaldırma Kapasitesi (Ton)"
                name="kaldirmaKapasitesi"
                value={formData.kaldirmaKapasitesi}
                onChange={handleInputChange}
                type="number"
              />

              <FormControl fullWidth>
                <InputLabel>Araç Tipi</InputLabel>
                <Select
                  name="aracTipi"
                  value={formData.aracTipi}
                  onChange={handleSelectChange}
                >
                  {aracTipleri.map((tip) => (
                    <MenuItem key={tip} value={tip}>
                      {tip}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Platform Uzunluğu (m)"
                name="platformUzunlugu"
                value={formData.platformUzunlugu}
                onChange={handleInputChange}
                type="number"
              />

              <TextField
                fullWidth
                label="Platform Genişliği (m)"
                name="platformGenisligi"
                value={formData.platformGenisligi}
                onChange={handleInputChange}
                type="number"
              />

              <FormControl fullWidth>
                <InputLabel>Vinç</InputLabel>
                <Select
                  name="vinc"
                  value={formData.vinc}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              {formData.vinc === "Evet" && (
                <TextField
                  fullWidth
                  label="Vinç Kapasitesi (Ton)"
                  name="vincKapasitesi"
                  value={formData.vincKapasitesi}
                  onChange={handleInputChange}
                  type="number"
                />
              )}

              <FormControl fullWidth>
                <InputLabel>Hidrolik</InputLabel>
                <Select
                  name="hidrolik"
                  value={formData.hidrolik}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Teleskopik</InputLabel>
                <Select
                  name="teleskopik"
                  value={formData.teleskopik}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Yan Yükleme</InputLabel>
                <Select
                  name="yan_yukleme"
                  value={formData.yan_yukleme}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Acil Durum Donanımı</InputLabel>
                <Select
                  name="acil_durum"
                  value={formData.acil_durum}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Teknik Özellikler */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Teknik Özellikler
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Kilometre"
                name="km"
                value={formData.km}
                onChange={handleInputChange}
                type="number"
              />

              <TextField
                fullWidth
                label="Beygir Gücü (HP)"
                name="beygirGucu"
                value={formData.beygirGucu}
                onChange={handleInputChange}
                type="number"
              />

              <TextField
                fullWidth
                label="Motor Hacmi (cc)"
                name="motorHacmi"
                value={formData.motorHacmi}
                onChange={handleInputChange}
                type="number"
              />

              <TextField
                fullWidth
                label="Ağırlık (kg)"
                name="agirlik"
                value={formData.agirlik}
                onChange={handleInputChange}
                type="number"
              />

              <TextField
                fullWidth
                label="Azami Yüklenebilir Ağırlık (kg)"
                name="azamiYuklenebilirAgirlik"
                value={formData.azamiYuklenebilirAgirlik}
                onChange={handleInputChange}
                type="number"
              />

              <TextField
                fullWidth
                label="Koltuk Sayısı"
                name="koltukSayisi"
                value={formData.koltukSayisi}
                onChange={handleInputChange}
                type="number"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Konum */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Konum
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Şehir</InputLabel>
                <Select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleSelectChange}
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id.toString()}>
                      {city.plateCode} - {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>İlçe</InputLabel>
                <Select
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleSelectChange}
                  required
                  disabled={!formData.cityId}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.id} value={district.id.toString()}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Fotoğraflar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fotoğraflar
            </Typography>

            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="photo-upload"
                multiple
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Fotoğraf Ekle
                </Button>
              </label>
            </Box>

            {formData.photos.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {formData.photos.map((photo, index) => (
                  <Box
                    key={index}
                    sx={{ position: "relative", display: "inline-block" }}
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Fotoğraf ${index + 1}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        bgcolor: "white",
                      }}
                      onClick={() => removePhoto(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {formData.showcasePhoto === photo && (
                      <Chip
                        label="Vitrin"
                        size="small"
                        color="primary"
                        sx={{ position: "absolute", bottom: 0, left: 0 }}
                      />
                    )}
                    {formData.showcasePhoto !== photo && (
                      <Button
                        size="small"
                        sx={{ position: "absolute", bottom: 0, left: 0 }}
                        onClick={() => setShowcasePhoto(photo)}
                      >
                        Vitrin Yap
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* İletişim Bilgileri */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              İletişim Bilgileri
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Satıcı Adı"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="E-posta"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Ekstra Bilgiler */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ekstra Bilgiler
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Garanti</InputLabel>
                <Select
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Var">Var</MenuItem>
                  <MenuItem value="Yok">Yok</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Pazarlık</InputLabel>
                <Select
                  name="negotiable"
                  value={formData.negotiable}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Takas</InputLabel>
                <Select
                  name="exchange"
                  value={formData.exchange}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Evet">Evet</MenuItem>
                  <MenuItem value="Hayır">Hayır</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Detaylı Bilgi"
              name="detailedInfo"
              value={formData.detailedInfo}
              onChange={handleInputChange}
              multiline
              rows={4}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? "İlan Oluşturuluyor..." : "İlanı Yayınla"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TekliAracForm;
