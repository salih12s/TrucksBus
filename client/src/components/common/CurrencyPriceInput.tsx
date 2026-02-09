import React from "react";
import {
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  InputAdornment,
} from "@mui/material";
import { AttachMoney, Euro, CurrencyLira } from "@mui/icons-material";
import type { CurrencyType } from "../../utils/formatPrice";
import {
  CURRENCIES,
  formatPriceInput,
  parsePriceInput,
  getCurrencyInfo,
} from "../../utils/formatPrice";

interface CurrencyPriceInputProps {
  price: string;
  currency: CurrencyType | string;
  onPriceChange: (price: string) => void;
  onCurrencyChange: (currency: CurrencyType) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

const currencyIcons: Record<string, React.ReactNode> = {
  TRY: <CurrencyLira sx={{ fontSize: 18 }} />,
  USD: <AttachMoney sx={{ fontSize: 18 }} />,
  EUR: <Euro sx={{ fontSize: 18 }} />,
};

const CurrencyPriceInput: React.FC<CurrencyPriceInputProps> = ({
  price,
  currency = "TRY",
  onPriceChange,
  onCurrencyChange,
  required = false,
  label = "Fiyat",
  placeholder = "150.000",
}) => {
  const currencyInfo = getCurrencyInfo(currency);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parsePriceInput(e.target.value);
    onPriceChange(raw);
  };

  const handleCurrencyChange = (
    _: React.MouseEvent<HTMLElement>,
    newCurrency: CurrencyType | null,
  ) => {
    if (newCurrency) {
      onCurrencyChange(newCurrency);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <TextField
        fullWidth
        label={label}
        value={formatPriceInput(price)}
        onChange={handlePriceChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {currencyIcons[currency] || currencyIcons.TRY}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">{currencyInfo.label}</InputAdornment>
          ),
        }}
        placeholder={placeholder}
        required={required}
      />
      <ToggleButtonGroup
        value={currency}
        exclusive
        onChange={handleCurrencyChange}
        size="small"
        sx={{
          minHeight: 56,
          "& .MuiToggleButton-root": {
            px: 1.5,
            fontWeight: 600,
            fontSize: "0.8rem",
            "&.Mui-selected": {
              backgroundColor: "#D34237",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#b5362d",
              },
            },
          },
        }}
      >
        {CURRENCIES.map((c) => (
          <ToggleButton key={c.value} value={c.value}>
            {c.symbol} {c.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default CurrencyPriceInput;
