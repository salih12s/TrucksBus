import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import apiClient from "../api/client";

interface Category {
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    description: string | null;
    _count: {
        ads: number;
    };
}

const categoryIcons: Record<string, string> = {
    "kamyon-kamyonet": "🚛",
    cekici: "🚜",
    otobus: "🚌",
    dorse: "🚚",
    romork: "🔗",
    "minibus-midibus": "🚐",
    "minivan-panelvan": "🚙",
    "karoser-ust-yapi": "🏗️",
    "oto-kurtarici-tasiyici": "🛻",
};

// Slug → gerçek dosya adı eşleştirmesi
const categoryImages: Record<string, string> = {
    "kamyon-kamyonet": "/CategoryImage/KamyonKamyonet.png",
    cekici: "/CategoryImage/cekici.png",
    otobus: "/CategoryImage/otobus.png",
    dorse: "/CategoryImage/Dorse.png",
    romork: "/CategoryImage/romork.png",
    "minibus-midibus": "/CategoryImage/minibus-midibus.png",
    "minivan-panelvan": "/CategoryImage/minivan-panelvan.png",
    "karoser-ust-yapi": "/CategoryImage/karoser-ust-yapi.png",
    "oto-kurtarici-tasiyici": "/CategoryImage/oto-kurtarici-tasiyici.png",
};

const CategorySelection: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/categories");
            setCategories(response.data as Category[]);
        } catch (err) {
            console.error("Kategoriler yüklenirken hata:", err);
            setError("Kategoriler yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (categorySlug: string) => {
        navigate(`/categories/${categorySlug}/brands`);
    };

    const getImagePath = (slug: string, imageUrl: string | null) => {
        if (categoryImages[slug]) return categoryImages[slug];
        if (!imageUrl) return "/CategoryImage/default.png";
        if (imageUrl.startsWith("http")) return imageUrl;
        if (imageUrl.startsWith("/")) return imageUrl;
        return `/CategoryImage/${imageUrl}`;
    };

    const totalAds = categories.reduce(
        (sum, cat) => sum + (cat._count?.ads || 0),
        0,
    );

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    background: "#F8FAFC",
                    gap: 3,
                }}
            >
                <CircularProgress
                    size={48}
                    thickness={3}
                    sx={{ color: "#2563EB" }}
                />
                <Typography
                    sx={{
                        color: "#94A3B8",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                    }}
                >
                    Kategoriler yükleniyor...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    background: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Container maxWidth="sm">
                    <Alert severity="error" sx={{ borderRadius: 3 }}>
                        {error}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                background: "#F8FAFC",
                minHeight: "100vh",
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    pt: { xs: 5, md: 7 },
                    pb: { xs: 3, md: 5 },
                }}
            >
                <Container maxWidth="lg">
                    {/* Badge */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                px: 2,
                                py: 0.75,
                                borderRadius: "100px",
                                background: "#EFF6FF",
                                border: "1px solid #DBEAFE",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#2563EB",
                                }}
                            />
                            <Typography
                                sx={{
                                    color: "#2563EB",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    letterSpacing: 1.5,
                                    textTransform: "uppercase",
                                }}
                            >
                                İlan Ver
                            </Typography>
                        </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: "center",
                            fontWeight: 800,
                            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                            color: "#0F172A",
                            mb: 1.5,
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Araç Kategorisi Seçin
                    </Typography>

                    <Typography
                        sx={{
                            textAlign: "center",
                            color: "#64748B",
                            fontSize: { xs: "0.95rem", md: "1.05rem" },
                            maxWidth: 480,
                            mx: "auto",
                            lineHeight: 1.6,
                        }}
                    >
                        İlanınıza uygun kategoriyi seçerek hızlıca başlayın
                    </Typography>

                    {/* Stats */}
                    {totalAds > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2.5,
                                mt: 3,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Typography
                                    sx={{
                                        color: "#0F172A",
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {totalAds.toLocaleString("tr-TR")}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "#94A3B8",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    aktif ilan
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background: "#CBD5E1",
                                }}
                            />
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Typography
                                    sx={{
                                        color: "#0F172A",
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {categories.length}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "#94A3B8",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    kategori
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Categories Grid */}
            <Container maxWidth="lg" sx={{ pb: 8 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 3,
                    }}
                >
                    {categories.map((category, index) => {
                        const isHovered = hoveredId === category.id;
                        const emoji = categoryIcons[category.slug] || "📦";

                        return (
                            <Box
                                key={category.id}
                                onClick={() => handleCategoryClick(category.slug)}
                                onMouseEnter={() => setHoveredId(category.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                sx={{
                                    background: "#FFFFFF",
                                    borderRadius: "16px",
                                    border: isHovered
                                        ? "1px solid #2563EB"
                                        : "1px solid #E5E7EB",
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                                    transform: isHovered
                                        ? "translateY(-4px)"
                                        : "translateY(0)",
                                    boxShadow: isHovered
                                        ? "0 10px 30px rgba(37,99,235,0.12), 0 4px 12px rgba(0,0,0,0.04)"
                                        : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
                                    animation: `fadeUp 0.45s ease ${index * 0.05}s both`,
                                    "@keyframes fadeUp": {
                                        "0%": {
                                            opacity: 0,
                                            transform: "translateY(16px)",
                                        },
                                        "100%": {
                                            opacity: 1,
                                            transform: "translateY(0)",
                                        },
                                    },
                                }}
                            >
                                {/* Image area */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        height: { xs: 160, sm: 180 },
                                        overflow: "hidden",
                                        background: "#F1F5F9",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={getImagePath(category.slug, category.imageUrl)}
                                        alt={category.name}
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            transition: "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
                                            transform: isHovered ? "scale(1.05)" : "scale(1)",
                                        }}
                                    />

                                    {/* Ad count badge */}
                                    {category._count?.ads > 0 && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 12,
                                                right: 12,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: "8px",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                color: "#1E40AF",
                                                background: "rgba(255,255,255,0.92)",
                                                backdropFilter: "blur(8px)",
                                                border: "1px solid rgba(37,99,235,0.15)",
                                            }}
                                        >
                                            {category._count.ads.toLocaleString("tr-TR")} ilan
                                        </Box>
                                    )}
                                </Box>

                                {/* Card content */}
                                <Box
                                    sx={{
                                        p: { xs: 2, md: 2.5 },
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        {/* Emoji icon container */}
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.4rem",
                                                background: isHovered ? "#EFF6FF" : "#F1F5F9",
                                                border: isHovered
                                                    ? "1px solid #DBEAFE"
                                                    : "1px solid #E2E8F0",
                                                flexShrink: 0,
                                                transition: "all 0.3s ease",
                                            }}
                                        >
                                            {emoji}
                                        </Box>

                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    color: "#0F172A",
                                                    fontWeight: 650,
                                                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {category.name}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: "#94A3B8",
                                                    fontSize: "0.8rem",
                                                    mt: 0.25,
                                                }}
                                            >
                                                Kategoriyi keşfet
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Arrow */}
                                    <Box
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: isHovered ? "#2563EB" : "#F1F5F9",
                                            border: isHovered
                                                ? "1px solid #2563EB"
                                                : "1px solid #E2E8F0",
                                            transition: "all 0.3s ease",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <ArrowForward
                                            sx={{
                                                color: isHovered ? "#FFFFFF" : "#94A3B8",
                                                fontSize: 18,
                                                transition: "all 0.3s ease",
                                                transform: isHovered
                                                    ? "translateX(2px)"
                                                    : "translateX(0)",
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                {/* Empty state */}
                {categories.length === 0 && (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 12,
                            px: 4,
                        }}
                    >
                        <Typography
                            sx={{
                                color: "#94A3B8",
                                fontSize: "1rem",
                            }}
                        >
                            Henüz kategori bulunmamaktadır
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default CategorySelection;
