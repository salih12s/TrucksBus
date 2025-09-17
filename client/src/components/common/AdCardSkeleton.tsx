import React from "react";
import { Box, Card, Skeleton } from "@mui/material";

interface AdCardSkeletonProps {
  count?: number;
  gridView?: boolean;
}

const AdCardSkeleton: React.FC<AdCardSkeletonProps> = ({
  count = 8,
  gridView = true,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: gridView
          ? {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(6, 1fr)",
              xl: "repeat(6, 1fr)",
            }
          : "1fr",
        gap: { xs: 1, sm: 1.5, md: 2 },
        width: "100%",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          sx={{
            display: "flex",
            flexDirection: gridView ? "column" : "row",
            borderRadius: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Image Skeleton */}
          <Box
            sx={
              gridView
                ? {
                    width: "100%",
                    height: { xs: 120, sm: 140, md: 160 },
                  }
                : {
                    width: 120,
                    height: 80,
                    flexShrink: 0,
                  }
            }
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
            />
          </Box>

          {/* Content Skeleton */}
          <Box
            sx={{
              p: { xs: 1, sm: 1.5 },
              flex: 1,
              minHeight: gridView ? 80 : 60,
            }}
          >
            {/* Title */}
            <Skeleton
              variant="text"
              width="90%"
              height={20}
              sx={{ mb: 0.5 }}
              animation="wave"
            />

            {/* Price */}
            <Skeleton
              variant="text"
              width="60%"
              height={18}
              sx={{ mb: 0.5 }}
              animation="wave"
            />

            {/* Location & Year */}
            <Skeleton variant="text" width="70%" height={14} animation="wave" />
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default AdCardSkeleton;
