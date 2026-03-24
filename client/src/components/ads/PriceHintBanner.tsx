import React, { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { getPriceHint, type PriceHintResponse } from "../../api/ads";

interface PriceHintProps {
    categoryId: number | null | undefined;
    brandId?: number | null;
    modelId?: number | null;
    year?: number | null;
}

const PriceHintBanner: React.FC<PriceHintProps> = ({
    categoryId,
    brandId,
    modelId,
    year,
}) => {
    const [hint, setHint] = useState<PriceHintResponse | null>(null);

    useEffect(() => {
        if (!categoryId) {
            setHint(null);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const result = await getPriceHint({
                    categoryId,
                    brandId: brandId || null,
                    modelId: modelId || null,
                    year: year || null,
                });
                if (!cancelled) setHint(result);
            } catch {
                if (!cancelled) setHint(null);
            }
        }, 500); // debounce

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [categoryId, brandId, modelId, year]);

    if (!hint?.available || !hint.minPrice || !hint.maxPrice) return null;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                mb: 1,
                bgcolor: "#e3f2fd",
                borderRadius: 2,
                border: "1px solid #90caf9",
            }}
        >
            <Typography variant="body2" sx={{ color: "#1565c0" }}>
                💡 Bu araç için ortalama fiyat aralığı:{" "}
                <strong>
                    {hint.minPrice.toLocaleString("tr-TR")} ₺ –{" "}
                    {hint.maxPrice.toLocaleString("tr-TR")} ₺
                </strong>
            </Typography>
            <Chip
                label={hint.source === "database" ? `${hint.sampleSize || 0} ilan` : "Referans"}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20, color: "#1565c0", borderColor: "#90caf9" }}
            />
        </Box>
    );
};

export default PriceHintBanner;
