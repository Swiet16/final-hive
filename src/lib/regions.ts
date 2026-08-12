// Region metadata. The selected region is stored on user_metadata.region
// at signup (selected in the registration form) and used for shipping/tax
// calculations. Stored in the `profiles.region` text column on the DB.

export type Region = {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
  shippingBase: number;
  taxRate: number; // 0..1
};

export const REGIONS: Region[] = [
  { code: "US", name: "United States",  currency: "USD", symbol: "$",   flag: "🇺🇸", shippingBase: 5.99,  taxRate: 0.07 },
  { code: "CA", name: "Canada",         currency: "CAD", symbol: "C$",  flag: "🇨🇦", shippingBase: 6.49,  taxRate: 0.05 },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£",   flag: "🇬🇧", shippingBase: 4.99,  taxRate: 0.20 },
  { code: "AU", name: "Australia",      currency: "AUD", symbol: "A$",  flag: "🇦🇺", shippingBase: 7.99,  taxRate: 0.10 },
  { code: "IN", name: "India",          currency: "INR", symbol: "₹",   flag: "🇮🇳", shippingBase: 199,   taxRate: 0.18 },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "د.إ", flag: "🇦🇪", shippingBase: 25, taxRate: 0.05 },
  { code: "SG", name: "Singapore",      currency: "SGD", symbol: "S$",  flag: "🇸🇬", shippingBase: 8.5,   taxRate: 0.08 },
  { code: "DE", name: "Germany",        currency: "EUR", symbol: "€",   flag: "🇩🇪", shippingBase: 4.5,   taxRate: 0.19 },
  { code: "FR", name: "France",         currency: "EUR", symbol: "€",   flag: "🇫🇷", shippingBase: 4.5,   taxRate: 0.20 },
  { code: "JP", name: "Japan",          currency: "JPY", symbol: "¥",   flag: "🇯🇵", shippingBase: 800,   taxRate: 0.10 },
];

export function getRegion(code?: string | null): Region {
  if (!code) return REGIONS[0];
  return REGIONS.find((r) => r.code === code) ?? REGIONS[0];
}
