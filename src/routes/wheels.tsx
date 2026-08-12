import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";

export const Route = createFileRoute("/wheels")({
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-hive font-bold">
          <Sparkles className="size-3" />
          All Categories
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight mt-2">
          Everything you need, <span className="text-gradient-hive">in one hive</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm sm:text-base">
          Browse 10+ categories and millions of products — from electronics to groceries, all in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            to="/shop"
            search={{ category: c.value } as any}
            className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 card-hover"
          >
            <CategoryIcon id={c.value} />
            <h3 className="font-display font-bold text-lg mt-4 tracking-tight">{c.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">Shop {c.label.toLowerCase()} →</p>
            <ArrowRight className="absolute top-5 right-5 size-4 text-muted-foreground group-hover:text-hive group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Promo banner */}
      <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-hive to-sky-hive p-8 sm:p-12 text-white">
        <div className="absolute -bottom-8 -right-8 size-40 opacity-20 animate-float-slow pointer-events-none">
          <Hex />
        </div>
        <div className="relative">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
            Can't find what you need?
          </h2>
          <p className="text-white/85 mt-2 max-w-md text-sm">
            With millions of products across every category, Life Hive is your one-stop marketplace. Try searching.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 mt-5 bg-white text-hive-dark font-bold uppercase tracking-widest text-xs px-5 py-3 rounded-full hover:bg-amber-hive hover:text-ink transition-colors"
          >
            Browse the full shop <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoryIcon({ id }: { id: string }) {
  const map: Record<string, { icon: string; gradient: string }> = {
    electronics: { icon: "💻", gradient: "from-sky-400 to-blue-600" },
    fashion:     { icon: "👗", gradient: "from-pink-400 to-rose-600" },
    home:        { icon: "🛋️", gradient: "from-amber-400 to-orange-600" },
    beauty:      { icon: "💄", gradient: "from-fuchsia-400 to-pink-600" },
    sports:      { icon: "⚽", gradient: "from-emerald-400 to-teal-600" },
    grocery:     { icon: "🛒", gradient: "from-lime-400 to-green-600" },
    toys:        { icon: "🧸", gradient: "from-yellow-400 to-amber-500" },
    books:       { icon: "📚", gradient: "from-indigo-400 to-violet-600" },
    auto:        { icon: "🚗", gradient: "from-zinc-500 to-slate-700" },
    garden:      { icon: "🌱", gradient: "from-green-400 to-emerald-600" },
  };
  const { icon, gradient } = map[id] ?? { icon: "📦", gradient: "from-zinc-400 to-zinc-600" };
  return (
    <div className={`size-14 rounded-2xl bg-gradient-to-br ${gradient} grid place-items-center text-3xl shadow-soft`}>
      {icon}
    </div>
  );
}

function Hex() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" fill="none" stroke="white" strokeWidth="3" />
      <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="white" opacity="0.3" />
    </svg>
  );
}
