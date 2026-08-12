import { CheckCircle2, AlertCircle, Flame, ShoppingCart, Eye, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

const FALLBACK_EMOJI = "📦";

export interface Product {
  id?: string;
  brand: string;
  name: string;
  spec: string;
  price: number;
  originalPrice?: number | null;
  discountEnabled?: boolean;
  monthly: number;
  badge: string;
  stock: "in" | "low" | "out";
  image?: string | null;
  category?: string;
  rating?: number;
  reviews?: number;
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);

  const showDiscount = !!(p.discountEnabled && p.originalPrice && p.originalPrice > p.price);
  const discountPct = showDiscount
    ? Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)
    : 0;
  const savings = showDiscount ? p.originalPrice! - p.price : 0;
  const soldOut = p.stock === "out";
  const stockLabel = p.stock === "in" ? "In Stock" : p.stock === "low" ? "Low Stock" : "Sold Out";
  const stockColor =
    p.stock === "in" ? "text-emerald-600 dark:text-emerald-400" : p.stock === "low" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";

  const rating = p.rating ?? (4 + Math.floor(Math.random() * 10) / 10);
  const reviews = p.reviews ?? Math.floor(50 + Math.random() * 2000);

  const isEmojiImage = p.image && /^[\p{Emoji}]+$/u.test(p.image.trim());
  const img = isEmojiImage ? p.image : (p.image && p.image.startsWith("http") ? p.image : null);

  function handleAdd() {
    if (soldOut) return toast.error("This product is sold out");
    setAdding(true);
    add({
      id: p.id ?? `${p.brand}-${p.name}`,
      brand: p.brand,
      name: p.name,
      price: p.price,
      image: p.image,
    });
    toast.success(`${p.brand} ${p.name} added to cart`, {
      description: `$${p.price.toFixed(2)} — view cart in header`,
    });
    setTimeout(() => setAdding(false), 900);
  }

  return (
    <article className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden card-hover">
      {/* Image area — fixed aspect ratio, no overlap with body */}
      {p.id ? (
        <Link
          to="/product/$id"
          params={{ id: p.id }}
          className="block relative aspect-square bg-gradient-to-br from-secondary/60 to-background overflow-hidden shrink-0"
        >
          {img ? (
            <img
              src={img}
              alt={`${p.brand} ${p.name}`}
              loading="lazy"
              className="w-full h-full object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-6xl sm:text-7xl group-hover:scale-105 transition-transform duration-300">
              {isEmojiImage ? p.image : FALLBACK_EMOJI}
            </div>
          )}

          {/* Top-left badges — absolute positioned, no overlap */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {p.badge && (
              <span className="bg-background/95 backdrop-blur text-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-full border border-border">
                {p.badge}
              </span>
            )}
            {showDiscount && (
              <span className="bg-racing-red text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-full flex items-center gap-0.5">
                <Flame className="size-2.5 sm:size-3" />
                -{discountPct}%
              </span>
            )}
          </div>

          {p.stock === "low" && (
            <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
              Only a few left
            </div>
          )}
        </Link>
      ) : (
        <div className="relative aspect-square bg-gradient-to-br from-secondary/60 to-background overflow-hidden shrink-0">
          {img ? (
            <img src={img} alt={`${p.brand} ${p.name}`} loading="lazy" className="w-full h-full object-contain p-3 sm:p-4" />
          ) : (
            <div className="w-full h-full grid place-items-center text-6xl sm:text-7xl">
              {isEmojiImage ? p.image : FALLBACK_EMOJI}
            </div>
          )}
        </div>
      )}

      {/* Body — clearly separated from image */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
        {/* Brand + rating */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-hive truncate">{p.brand}</span>
          <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium shrink-0">
            <Star className="size-2.5 sm:size-3 fill-amber-hive text-amber-hive" />
            {rating.toFixed(1)}
            <span className="text-muted-foreground hidden sm:inline">({reviews > 1000 ? `${(reviews/1000).toFixed(1)}k` : reviews})</span>
          </span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem]">
          {p.id ? (
            <Link to="/product/$id" params={{ id: p.id }} className="hover:text-hive transition-colors">
              {p.name}
            </Link>
          ) : (
            <span>{p.name}</span>
          )}
        </h3>
        {p.spec && <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">{p.spec}</p>}

        {/* Price + stock — stacked on mobile to avoid overlap */}
        <div className="mt-2 sm:mt-3 flex items-baseline justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            {showDiscount && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through mr-1.5 align-baseline">
                ${p.originalPrice!.toFixed(2)}
              </span>
            )}
            <span className={`text-base sm:text-xl font-bold tracking-tight align-baseline ${showDiscount ? "text-racing-red" : "text-foreground"}`}>
              ${p.price.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <p className={`text-[9px] sm:text-[10px] font-semibold flex items-center gap-0.5 justify-end ${stockColor}`}>
              {p.stock === "in" ? <CheckCircle2 className="size-2.5 sm:size-3" /> : <AlertCircle className="size-2.5 sm:size-3" />}
              {stockLabel}
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">${p.monthly}/mo</p>
          </div>
        </div>

        {/* Actions — single column on mobile to avoid cramped buttons */}
        <div className="mt-3 sm:mt-4 flex flex-col gap-2 mt-auto">
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`w-full px-3 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 transition-all ${
              soldOut
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : adding
                ? "bg-emerald-500 text-white"
                : "bg-hive text-white hover:bg-hive-dark hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            }`}
          >
            {adding ? (
              <>
                <CheckCircle2 className="size-3.5" /> Added!
              </>
            ) : soldOut ? (
              "Sold Out"
            ) : (
              <>
                <ShoppingCart className="size-3.5" /> Add to Cart
              </>
            )}
          </button>

          {p.id && (
            <Link
              to="/product/$id"
              params={{ id: p.id }}
              className="w-full px-3 py-2 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 border border-border text-muted-foreground hover:text-hive hover:border-hive/40 transition-colors"
              aria-label="View details"
            >
              <Eye className="size-3.5" /> View Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
