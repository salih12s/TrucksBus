import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Container,
    Typography,
    Avatar,
    Button,
    Chip,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Skeleton,
    TextField,
    MenuItem,
    Pagination,
    IconButton,
    Paper,
} from "@mui/material";
import {
    Phone as PhoneIcon,
    WhatsApp as WhatsAppIcon,
    Language as WebsiteIcon,
    LocationOn,
    AccessTime,
    Storefront,
    ArrowBack,
    FilterList,
    Email as EmailIcon,
    Verified,
} from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storeApi } from "../../api/store";
import type { Store, StoreAd, StoreAdsResponse } from "../../api/store";
import { formatPrice } from "../../utils/formatPrice";

// Günler Türkçe
const DAY_LABELS: Record<string, string> = {
    monday: "Pazartesi",
    tuesday: "Salı",
    wednesday: "Çarşamba",
    thursday: "Perşembe",
    friday: "Cuma",
    saturday: "Cumartesi",
    sunday: "Pazar",
};

const DAY_ORDER = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

function getImageUrl(ad: StoreAd): string {
    if (ad.images && ad.images.length > 0) {
        return ad.images[0].url || ad.images[0].imageUrl || "";
    }
    return "";
}

export default function StorePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ads state
    const [ads, setAds] = useState<StoreAd[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [adsLoading, setAdsLoading] = useState(true);
    const [sort, setSort] = useState("newest");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Load store
    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        storeApi
            .getBySlug(slug)
            .then((data) => {
                setStore(data);
                document.title = `${data.name} - TrucksBus`;
                setLoading(false);
            })
            .catch(() => {
                setError("Mağaza bulunamadı");
                setLoading(false);
            });
    }, [slug]);

    // Load ads
    const loadAds = useCallback(
        (page = 1) => {
            if (!slug) return;
            setAdsLoading(true);
            const params: Record<string, string | number> = { page, sort };
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

            storeApi
                .getAds(slug, params)
                .then((data: StoreAdsResponse) => {
                    setAds(data.ads);
                    setPagination(data.pagination);
                    setAdsLoading(false);
                })
                .catch(() => {
                    setAds([]);
                    setAdsLoading(false);
                });
        },
        [slug, sort, minPrice, maxPrice],
    );

    useEffect(() => {
        if (store) loadAds(1);
    }, [store, loadAds]);

    const handlePageChange = (_: unknown, page: number) => {
        loadAds(page);
        window.scrollTo({ top: 500, behavior: "smooth" });
    };

    // Loading state
    if (loading) {
        return (
            <Box>
                <Skeleton variant="rectangular" height={260} />
                <Container maxWidth="lg" sx={{ mt: -6, position: "relative" }}>
                    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
                        <Skeleton variant="circular" width={96} height={96} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton width={200} height={40} />
                            <Skeleton width={150} height={24} />
                        </Box>
                    </Box>
                    <Grid container spacing={2} sx={{ mt: 4 }}>
                        {[...Array(6)].map((_, i) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                                <Skeleton width="60%" sx={{ mt: 1 }} />
                                <Skeleton width="40%" />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        );
    }

    // Error state
    if (error || !store) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
                <Storefront sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    Mağaza Bulunamadı
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Bu mağaza mevcut değil veya kaldırılmış olabilir.
                </Typography>
                <Button variant="contained" onClick={() => navigate("/")}>
                    Ana Sayfaya Dön
                </Button>
            </Container>
        );
    }

    const isOpen = () => {
        if (!store.workingHours) return null;
        const now = new Date();
        const dayNames = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
        ];
        const today = dayNames[now.getDay()];
        const hours = store.workingHours[today];
        if (!hours || hours.closed) return false;
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        return currentTime >= hours.open && currentTime <= hours.close;
    };

    const openStatus = isOpen();

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            {/* Banner */}
            <Box
                sx={{
                    position: "relative",
                    height: { xs: 180, md: 260 },
                    overflow: "hidden",
                    bgcolor: "#1a237e",
                }}
            >
                {store.bannerUrl ? (
                    <Box
                        component="img"
                        src={store.bannerUrl}
                        alt={store.name}
                        sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            background:
                                "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)",
                        }}
                    />
                )}
                {/* Gradient overlay */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60%",
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    }}
                />

                {/* Back button */}
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        bgcolor: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                    }}
                >
                    <ArrowBack />
                </IconButton>
            </Box>

            {/* Store Info Section */}
            <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -6 }, position: "relative", zIndex: 1, px: { xs: 2, md: 3 } }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 3,
                        mb: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: { xs: 2, sm: 3 },
                            alignItems: { xs: "center", sm: "flex-start" },
                        }}
                    >
                        {/* Logo */}
                        <Avatar
                            src={store.logoUrl || store.user?.profileImageUrl || undefined}
                            sx={{
                                width: { xs: 80, md: 96 },
                                height: { xs: 80, md: 96 },
                                border: "4px solid white",
                                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                                bgcolor: "#1976d2",
                                fontSize: 36,
                                mt: { xs: -5, sm: -5 },
                            }}
                        >
                            {store.name.charAt(0).toUpperCase()}
                        </Avatar>

                        {/* Name & Meta */}
                        <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" }, minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: { xs: "center", sm: "flex-start" }, flexWrap: "wrap" }}>
                                <Typography variant="h5" fontWeight={700} noWrap>
                                    {store.name}
                                </Typography>
                                {store.user?.role === "CORPORATE" && (
                                    <Chip
                                        icon={<Verified sx={{ fontSize: 16 }} />}
                                        label="Kurumsal"
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            {(store.city || store.district) && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: { xs: "center", sm: "flex-start" }, mt: 0.5, color: "text.secondary" }}>
                                    <LocationOn sx={{ fontSize: 18 }} />
                                    <Typography variant="body2">
                                        {[store.district, store.city].filter(Boolean).join(", ")}
                                    </Typography>
                                </Box>
                            )}

                            {openStatus !== null && (
                                <Chip
                                    icon={<AccessTime sx={{ fontSize: 16 }} />}
                                    label={openStatus ? "Açık" : "Kapalı"}
                                    size="small"
                                    color={openStatus ? "success" : "default"}
                                    sx={{ mt: 1 }}
                                />
                            )}

                            {store.user?._count && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {store.user._count.ads} aktif ilan
                                </Typography>
                            )}
                        </Box>

                        {/* Contact Buttons */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                            {store.whatsapp && (
                                <Button
                                    variant="contained"
                                    startIcon={<WhatsAppIcon />}
                                    href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        bgcolor: "#25D366",
                                        "&:hover": { bgcolor: "#1da851" },
                                        fontWeight: 600,
                                        textTransform: "none",
                                    }}
                                >
                                    WhatsApp
                                </Button>
                            )}
                            {store.phone && (
                                <Button
                                    variant="outlined"
                                    startIcon={<PhoneIcon />}
                                    href={`tel:${store.phone}`}
                                    sx={{ fontWeight: 600, textTransform: "none" }}
                                >
                                    Ara
                                </Button>
                            )}
                            {store.email && (
                                <IconButton
                                    href={`mailto:${store.email}`}
                                    color="primary"
                                    title="E-posta"
                                >
                                    <EmailIcon />
                                </IconButton>
                            )}
                            {store.website && (
                                <IconButton
                                    href={store.website.startsWith("http") ? store.website : `https://${store.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="primary"
                                    title="Web Sitesi"
                                >
                                    <WebsiteIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {/* Description */}
                    {store.description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 2, whiteSpace: "pre-line", lineHeight: 1.7 }}
                        >
                            {store.description}
                        </Typography>
                    )}

                    {/* Working Hours & Map row */}
                    {(store.workingHours || (store.latitude && store.longitude)) && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {/* Working Hours */}
                            {store.workingHours && (
                                <Grid size={{ xs: 12, md: store.latitude ? 6 : 12 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <AccessTime sx={{ fontSize: 18 }} /> Çalışma Saatleri
                                    </Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5 }}>
                                        {DAY_ORDER.map((day) => {
                                            const h = store.workingHours?.[day];
                                            return (
                                                <Box
                                                    key={day}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        px: 1,
                                                        py: 0.3,
                                                        borderRadius: 1,
                                                        bgcolor: h && !h.closed ? "rgba(25,118,210,0.04)" : "transparent",
                                                    }}
                                                >
                                                    <Typography variant="caption" fontWeight={500}>
                                                        {DAY_LABELS[day]}
                                                    </Typography>
                                                    <Typography variant="caption" color={h && !h.closed ? "text.primary" : "text.disabled"}>
                                                        {h && !h.closed ? `${h.open} - ${h.close}` : "Kapalı"}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Grid>
                            )}

                            {/* Map */}
                            {store.latitude && store.longitude && (
                                <Grid size={{ xs: 12, md: store.workingHours ? 6 : 12 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <LocationOn sx={{ fontSize: 18 }} /> Konum
                                    </Typography>
                                    <Box
                                        sx={{
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            height: 200,
                                            border: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <iframe
                                            title="Mağaza Konumu"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`}
                                        />
                                    </Box>
                                    {store.address && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                            {store.address}
                                        </Typography>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Paper>

                {/* Ads Section */}
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                            flexWrap: "wrap",
                            gap: 1,
                        }}
                    >
                        <Typography variant="h6" fontWeight={600}>
                            İlanlar ({pagination.total})
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                size="small"
                                startIcon={<FilterList />}
                                variant={showFilters ? "contained" : "outlined"}
                                onClick={() => setShowFilters(!showFilters)}
                                sx={{ textTransform: "none" }}
                            >
                                Filtrele
                            </Button>
                            <TextField
                                select
                                size="small"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                sx={{ minWidth: 140 }}
                            >
                                <MenuItem value="newest">En Yeni</MenuItem>
                                <MenuItem value="price_asc">Fiyat: Düşükten Yükseğe</MenuItem>
                                <MenuItem value="price_desc">Fiyat: Yüksekten Düşüğe</MenuItem>
                            </TextField>
                        </Box>
                    </Box>

                    {/* Filters */}
                    {showFilters && (
                        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                                <TextField
                                    size="small"
                                    label="Min Fiyat"
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    sx={{ width: 140 }}
                                />
                                <TextField
                                    size="small"
                                    label="Max Fiyat"
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    sx={{ width: 140 }}
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => loadAds(1)}
                                    sx={{ textTransform: "none" }}
                                >
                                    Uygula
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setMinPrice("");
                                        setMaxPrice("");
                                    }}
                                    sx={{ textTransform: "none" }}
                                >
                                    Temizle
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* Ads Grid */}
                    {adsLoading ? (
                        <Grid container spacing={2}>
                            {[...Array(6)].map((_, i) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                                    <Card sx={{ borderRadius: 2 }}>
                                        <Skeleton variant="rectangular" height={180} />
                                        <CardContent>
                                            <Skeleton width="70%" />
                                            <Skeleton width="50%" />
                                            <Skeleton width="40%" />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : ads.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                            <Storefront sx={{ fontSize: 60, color: "text.disabled", mb: 1 }} />
                            <Typography variant="h6" color="text.secondary">
                                Henüz ilan bulunmuyor
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                Bu mağazada henüz aktif ilan yok.
                            </Typography>
                        </Paper>
                    ) : (
                        <>
                            <Grid container spacing={2}>
                                {ads.map((ad) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ad.id}>
                                        <Card
                                            component={Link}
                                            to={`/ad/${ad.id}`}
                                            sx={{
                                                textDecoration: "none",
                                                color: "inherit",
                                                borderRadius: 2,
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                    transform: "translateY(-2px)",
                                                    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                                                },
                                                display: "flex",
                                                flexDirection: "column",
                                                height: "100%",
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height={180}
                                                image={getImageUrl(ad) || "/placeholder-vehicle.png"}
                                                alt={ad.title}
                                                sx={{ objectFit: "cover" }}
                                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                    e.currentTarget.src = "/placeholder-vehicle.png";
                                                }}
                                            />
                                            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={600}
                                                    noWrap
                                                    title={ad.title}
                                                >
                                                    {ad.title}
                                                </Typography>

                                                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                                                    {ad.category && (
                                                        <Chip label={ad.category.name} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                                                    )}
                                                    {ad.brand && (
                                                        <Chip label={ad.brand.name} size="small" sx={{ fontSize: 11 }} />
                                                    )}
                                                </Box>

                                                <Box sx={{ mt: "auto", pt: 1 }}>
                                                    <Typography variant="h6" fontWeight={700} color="primary">
                                                        {ad.price ? formatPrice(ad.price, ad.currency || "TRY") : "Fiyat Sorunuz"}
                                                    </Typography>

                                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                                                        {ad.year && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {ad.year}
                                                            </Typography>
                                                        )}
                                                        {ad.city && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {ad.city.name}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                    <Pagination
                                        count={pagination.totalPages}
                                        page={pagination.page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Container>
        </Box>
    );
}
