import React from "react";
import {
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "medium";
}

/**
 * Responsive currency selector component for forms
 * Shows shorter labels on mobile devices
 */
const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  size = "small",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ToggleButtonGroup
      value={value || "TRY"}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      size={size}
      sx={{
        "& .MuiToggleButton-root": {
          py: isMobile ? 0.3 : 0.5,
          px: isMobile ? 0.5 : 1,
          fontSize: isMobile ? "0.65rem" : "0.75rem",
          minWidth: isMobile ? "32px" : "auto",
          "&.Mui-selected": {
            bgcolor: "#D34237",
            color: "#fff",
            "&:hover": {
              bgcolor: "#B73429",
            },
          },
        },
      }}
    >
      <ToggleButton value="TRY">{isMobile ? "₺" : "₺ TL"}</ToggleButton>
      <ToggleButton value="USD">{isMobile ? "$" : "$ USD"}</ToggleButton>
      <ToggleButton value="EUR">{isMobile ? "€" : "€ EUR"}</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default CurrencySelector;
