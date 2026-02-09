/**
 * Currency types supported by the system
 */
export type CurrencyType = "TRY" | "USD" | "EUR";

/**
 * Currency configuration
 */
export const CURRENCIES: {
  value: CurrencyType;
  label: string;
  symbol: string;
  flag: string;
}[] = [
  { value: "TRY", label: "TL", symbol: "₺", flag: "🇹🇷" },
  { value: "USD", label: "USD", symbol: "$", flag: "🇺🇸" },
  { value: "EUR", label: "EUR", symbol: "€", flag: "🇪🇺" },
];

/**
 * Get currency info by code
 */
export const getCurrencyInfo = (currency: CurrencyType | string = "TRY") => {
  return CURRENCIES.find((c) => c.value === currency) || CURRENCIES[0];
};

/**
 * Format price with currency - unified function for the entire app
 * @param price - The price value (number or null)
 * @param currency - Currency code: "TRY" | "USD" | "EUR"
 * @param fallback - Fallback text when price is null/0
 * @returns Formatted price string like "150.000 TL" or "$150,000" or "€150.000"
 */
export const formatPrice = (
  price: number | null | undefined,
  currency: CurrencyType | string = "TRY",
  fallback: string = "Belirtilmemiş",
): string => {
  if (!price || price === 0) return fallback;

  switch (currency) {
    case "USD":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);

    case "EUR":
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);

    case "TRY":
    default:
      return (
        new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price) + " TL"
      );
  }
};

/**
 * Format price input value with thousand separators (for form inputs)
 */
export const formatPriceInput = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  return new Intl.NumberFormat("tr-TR").format(parseInt(numbers));
};

/**
 * Extract raw number from formatted price string
 */
export const parsePriceInput = (value: string): string => {
  return value.replace(/\D/g, "");
};
