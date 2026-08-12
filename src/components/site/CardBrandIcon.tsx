// Real card brand SVG icons — Visa, Mastercard, Amex, Discover, JCB, UnionPay, Diners
// Plus a generic card icon. Used in checkout + admin customer cards + dashboard saved cards.

export type CardBrandType = "visa" | "mastercard" | "amex" | "discover" | "jcb" | "unionpay" | "diners" | "card";

export function detectCardBrand(num: string): CardBrandType {
  const n = (num || "").replace(/\s+/g, "");
  if (/^4/.test(n))                                  return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n))                    return "mastercard";
  if (/^3[47]/.test(n))                              return "amex";
  if (/^6(?:011|5|4|22)/.test(n))                    return "discover";
  if (/^35(?:2[89]|[3-8]\d)/.test(n))                return "jcb";
  if (/^(62|81)/.test(n))                            return "unionpay";
  if (/^3(?:0[0-5]|[68]\d)/.test(n))                 return "diners";
  return "card";
}

export function CardBrandIcon({
  brand,
  className = "h-7 w-auto",
}: {
  brand: CardBrandType | string;
  className?: string;
}) {
  const b = (brand as CardBrandType) || "card";
  switch (b) {
    case "visa":
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="Visa">
          <rect width="48" height="32" rx="4" fill="#1A1F71" />
          <path d="M20.4 22.2L22.3 9.8h3l-1.9 12.4h-3zM31.6 10c-.6-.2-1.5-.4-2.7-.4-3 0-5.1 1.5-5.1 3.7 0 1.6 1.5 2.5 2.6 3 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.1-1.9 1.1-1.2 0-1.9-.2-3-.6l-.4-.2-.4 2.6c.7.3 2 .6 3.4.6 3.2 0 5.2-1.5 5.2-3.8 0-1.3-.8-2.3-2.5-3-1-.6-1.7-.9-1.7-1.5 0-.5.5-1 1.7-1 1 0 1.7.2 2.3.4l.3.2.4-2.6z" fill="#fff"/>
          <path d="M36.4 9.8h-2.6c-.8 0-1.4.2-1.8 1l-5 11.4h3.2l.6-1.8h3.9l.4 1.8h2.8l-2.4-12.4zm-3.9 8.4l1.2-3.5.7 3.5h-1.9zM14.8 9.8l-3 8.5-.3-1.7c-.6-2-2.4-4.1-4.4-5.1l2.8 10.7h3.3l4.9-12.4h-3.3z" fill="#fff"/>
        </svg>
      );
    case "mastercard":
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="Mastercard">
          <rect width="48" height="32" rx="4" fill="#16171A" />
          <circle cx="20" cy="16" r="7" fill="#EB001B" />
          <circle cx="28" cy="16" r="7" fill="#F79E1B" />
          <path d="M24 10.5a7 7 0 010 11 7 7 0 000-11z" fill="#FF5F00" />
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="American Express">
          <rect width="48" height="32" rx="4" fill="#1F72CD" />
          <path d="M9 12.5L6 19.5h2.2l.5-1.3h2.7l.5 1.3H14V13l1.7 4.5h1.5L19 13v6.5h-2v-4l-1.2 4h-1.3l-1.2-4v4H8.4l-.5-1.3H5.2l-.5 1.3H3.5l2.5-6h2l.5 1.3.5-1.3H9zm12.5 1.6v1h2.8v1.5h-2.8v1.1h3l1.4-1.8-1.3-1.8h-3zm5.5-2.6l-2 2.3-1.7-2.3h-2.4l3 4.4v3.6h2v-3.6l3-4.4h-2.4zm6.5 0v6h3.5l1.7-2v-4h-2v3l-.7 1h-.5v-4h-2z" fill="#fff" />
        </svg>
      );
    case "discover":
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="Discover">
          <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" />
          <circle cx="32" cy="16" r="6" fill="#F76B1C" opacity="0.85" />
          <text x="6" y="20" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="800" fill="#16171A">DISCOVER</text>
        </svg>
      );
    case "jcb":
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="JCB">
          <rect width="48" height="32" rx="4" fill="#0E4C96" />
          <path d="M15 11h6c1 0 1.5.6 1.3 1.6-.3 1.3-1.2 2-2.5 2H15V11zm6 8c1.4 0 1.8.6 1.5 2-.3 1.2-1.1 1.7-2.4 1.7H15v-3.7h6zm7-8c2 0 3 1 2.7 2.8-.3 1.5-1.2 2.3-2.7 2.3h-2.4l.5-3h2zm5 0c2 0 3 1 2.7 2.8-.3 1.5-1.2 2.3-2.7 2.3h-2.4l.5-3h2z" fill="#fff"/>
        </svg>
      );
    case "unionpay":
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="UnionPay">
          <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" />
          <path d="M16 7h7c1.4 0 2.4 1 2 2.4l-2 13C22.7 24 21 25 19.5 25H13c-1.4 0-2.4-1-2-2.4l2-13C13.3 8 14.5 7 16 7z" fill="#E21836"/>
          <path d="M25 7h7c1.4 0 2.4 1 2 2.4l-2 13C31.7 24 30 25 28.5 25H22c-1.4 0-2.4-1-2-2.4l2-13C22.3 8 23.5 7 25 7z" fill="#00447C"/>
          <path d="M34 7h7c1.4 0 2.4 1 2 2.4l-2 13C40.7 24 39 25 37.5 25H31c-1.4 0-2.4-1-2-2.4l2-13C31.3 8 32.5 7 34 7z" fill="#007B35"/>
        </svg>
      );
    case "diners":
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="Diners Club">
          <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" />
          <circle cx="22" cy="16" r="9" fill="#0079BE" />
          <path d="M19 11.5v9l5-2v-5l-5-2zm1.5 3.5l2 .8v2l-2-.7v-2.1z" fill="#fff"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 32" className={className} aria-label="Credit card">
          <rect width="48" height="32" rx="4" fill="#1F2937" />
          <rect x="4" y="11" width="40" height="3" fill="#9CA3AF" />
          <rect x="4" y="17" width="14" height="3" rx="1.5" fill="#FBBF24" />
          <rect x="20" y="20" width="24" height="2" rx="1" fill="#9CA3AF" />
        </svg>
      );
  }
}

// Accepted brand badges — show all supported brands above the card input
export function AcceptedCardsBadge({ className = "" }: { className?: string }) {
  const brands: CardBrandType[] = ["visa", "mastercard", "amex", "discover", "jcb", "unionpay"];
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Accepted:</span>
      <div className="flex items-center gap-1">
        {brands.map((b) => (
          <span key={b} className="inline-block h-5 w-auto rounded overflow-hidden border border-border shadow-sm">
            <CardBrandIcon brand={b} className="h-5 w-auto" />
          </span>
        ))}
      </div>
    </div>
  );
}
