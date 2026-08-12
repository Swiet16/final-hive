import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORIES, isValidCategory } from "@/lib/catalog";
import { Search, SlidersHorizontal, Grid2x2, LayoutGrid, X, ChevronDown, PackageSearch } from "lucide-react";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    category: (search.category as string) || "",
    brand: (search.brand as string) || "",
  }),
});

type SortKey = "popular" | "price-asc" | "price-desc" | "name";

function ShopPage() {
  const search = useSearch({ from: "/shop" }) as { q?: string; category?: string; brand?: string };
  const initialCat = isValidCategory(search.category) ? search.category : "all";
  const initialQ = search.q || "";
  const initialBrand = search.brand || "all";

  // Load all products (no category filter at the hook level — we filter client-side)
  const { products, loading } = useProducts({});

  const [query, setQuery] = useState(initialQ);
  const [cat, setCat] = useState<string>(initialCat);
  const [brand, setBrand] = useState<string>(initialBrand);
  const [sort, setSort] = useState<SortKey>("popular");
  const [view, setView] = useState<"grid" | "compact">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL → state
  useEffect(() => {
    setQuery(search.q || "");
    setCat(isValidCategory(search.category) ? search.category : "all");
    setBrand(search.brand || "all");
  }, [search.q, search.category, search.brand]);

  const brands = useMemo(() => {
    const all = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    return ["all", ...all.sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let arr = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${p.brand} ${p.name} ${p.spec} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc":  arr = [...arr].sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "price-desc": arr = [...arr].sort((a, b) => Number(b.price) - Number(a.price)); break;
      case "name":       arr = [...arr].sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           arr = [...arr].sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1)); break;
    }
    return arr;
  }, [products, cat, brand, query, sort]);

  const activeCount = (cat !== "all" ? 1 : 0) + (brand !== "all" ? 1 : 0) + (query ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <span className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold">Catalog</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight mt-2">
          Shop everything <span className="text-gradient-hive">in one hive</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm sm:text-base">
          {products.length}+ products across 10+ categories — fast shipping, secure checkout, member prices.
        </p>
      </div>

      {/* Mobile category scroller */}
      <div className="lg:hidden mb-5 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <CatPill active={cat === "all"} onClick={() => setCat("all")} label="All" icon="✨" />
        {CATEGORIES.map((c) => (
          <CatPill key={c.value} active={cat === c.value} onClick={() => setCat(c.value)} label={c.label} />
        ))}
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6 sm:gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block sticky top-28 h-fit">
          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-2.5 rounded-full bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
            />
          </div>

          {/* Categories */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setCat("all")}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${cat === "all" ? "bg-hive text-white font-semibold" : "hover:bg-secondary"}`}
              >
                ✨ All categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCat(c.value)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors capitalize ${cat === c.value ? "bg-hive text-white font-semibold" : "hover:bg-secondary"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-3">Brands</h3>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
            >
              {brands.map((b) => (
                <option key={b} value={b}>{b === "all" ? "All Brands" : b}</option>
              ))}
            </select>
          </div>

          {(cat !== "all" || brand !== "all" || query) && (
            <button
              onClick={() => { setCat("all"); setBrand("all"); setQuery(""); }}
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="size-3.5" /> Clear filters
            </button>
          )}
        </aside>

        {/* Mobile filter button + content */}
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-border rounded-full text-xs font-semibold"
              >
                <SlidersHorizontal className="size-3.5" />
                Filters
                {activeCount > 0 && <span className="bg-hive text-white text-[10px] rounded-full size-4 grid place-items-center">{activeCount}</span>}
              </button>
              <span className="text-sm text-muted-foreground">
                {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none bg-secondary border border-border rounded-full pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-hive/40"
                >
                  <option value="popular">Popular</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                  <option value="name">Name A-Z</option>
                </select>
                <ChevronDown className="size-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="hidden sm:flex items-center bg-secondary border border-border rounded-full p-0.5">
                <button
                  onClick={() => setView("grid")}
                  className={`size-7 grid place-items-center rounded-full transition-colors ${view === "grid" ? "bg-hive text-white" : "text-muted-foreground"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  onClick={() => setView("compact")}
                  className={`size-7 grid place-items-center rounded-full transition-colors ${view === "compact" ? "bg-hive text-white" : "text-muted-foreground"}`}
                  aria-label="Compact view"
                >
                  <Grid2x2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="lg:hidden mb-5 bg-card border border-border rounded-2xl p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-full bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold block mb-2">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>{b === "all" ? "All Brands" : b}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl border border-border bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border">
              <PackageSearch className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">No products match your filters</p>
              <p className="text-sm text-muted-foreground mt-1">Try clearing filters or searching something else.</p>
              <button
                onClick={() => { setCat("all"); setBrand("all"); setQuery(""); }}
                className="mt-4 text-sm text-hive font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-3 sm:gap-5 ${view === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
              {filtered.map((p) => (
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
      </div>
    </div>
  );
}

function CatPill({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${active ? "bg-hive text-white" : "bg-secondary border border-border hover:bg-secondary/70"}`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </button>
  );
}
