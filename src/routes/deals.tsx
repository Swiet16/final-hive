import { createFileRoute } from "@tanstack/react-router";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/site/ProductCard";
import { Flame, Zap, Clock, Gift } from "lucide-react";

export const Route = createFileRoute("/deals")({
  component: DealsPage,
});

function DealsPage() {
  const { products, loading } = useProducts({ dealsOnly: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-hive via-orange-400 to-racing-red p-8 sm:p-12 mb-8 sm:mb-10 text-white">
        <div className="absolute -top-8 -right-8 size-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border border-white/20">
            <Flame className="size-3" /> Limited time
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight mt-3 leading-tight">
            Today's hottest deals
          </h1>
          <p className="text-white/85 mt-3 max-w-lg text-sm sm:text-base">
            Save up to 60% on hand-picked items across every category. Original price crossed out, sale price highlighted.
            New deals drop weekly — member-only deals drop daily.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/90">
            <span className="flex items-center gap-1.5"><Zap className="size-3.5" /> Flash sale prices</span>
            <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> Refreshed every 24h</span>
            <span className="flex items-center gap-1.5"><Gift className="size-3.5" /> Members get extra 5%</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {loading ? "Loading deals…" : `${products.length} active offers`}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl border border-border bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <div className="text-5xl mb-3">🔥</div>
          <p className="font-semibold text-lg">No active deals right now</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon — new deals drop weekly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              p={{
                id: p.id, brand: p.brand, name: p.name, spec: p.spec,
                price: Number(p.price),
                originalPrice: p.original_price ? Number(p.original_price) : null,
                discountEnabled: p.discount_enabled,
                monthly: p.monthly, badge: p.badge, stock: p.stock, image: p.image_url,
                category: p.category,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
