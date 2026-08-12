import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: "electronics", name: "Electronics",  icon: "💻", blurb: "Phones, audio, laptops",   color: "from-sky-400 to-blue-600" },
  { id: "fashion",     name: "Fashion",       icon: "👗", blurb: "Trendy apparel & shoes",   color: "from-pink-400 to-rose-600" },
  { id: "home",        name: "Home & Living", icon: "🛋️", blurb: "Furniture, kitchen, decor", color: "from-amber-400 to-orange-600" },
  { id: "beauty",      name: "Beauty",        icon: "💄", blurb: "Skincare, makeup, fragrance", color: "from-fuchsia-400 to-pink-600" },
  { id: "sports",      name: "Sports",        icon: "⚽", blurb: "Fitness & outdoor gear",   color: "from-emerald-400 to-teal-600" },
  { id: "grocery",     name: "Grocery",       icon: "🛒", blurb: "Daily essentials & gourmet", color: "from-lime-400 to-green-600" },
  { id: "toys",        name: "Toys & Baby",   icon: "🧸", blurb: "Kids, babies & playtime",  color: "from-yellow-400 to-amber-500" },
  { id: "books",       name: "Books",         icon: "📚", blurb: "Bestsellers & stationery",  color: "from-indigo-400 to-violet-600" },
  { id: "auto",        name: "Automotive",    icon: "🚗", blurb: "Parts, accessories, tools", color: "from-zinc-500 to-slate-700" },
  { id: "garden",      name: "Garden",        icon: "🌱", blurb: "Outdoor & green living",   color: "from-green-400 to-emerald-600" },
];

export function BrandStrip() {
  return (
    <section className="bg-background py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold">Browse by category</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mt-2 tracking-tight">
              Everything you need, <span className="text-gradient-hive">in one hive</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg">
              From electronics to groceries — 10+ categories, 200+ brands, millions of products.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-hive hover:gap-2.5 transition-all"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.id } as any}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border p-5 card-hover"
            >
              {/* Gradient swatch */}
              <div className={`size-12 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center text-2xl mb-3 shadow-soft`}>
                {c.icon}
              </div>
              <div className="font-semibold text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.blurb}</div>
              <ArrowRight className="size-4 mt-3 text-muted-foreground group-hover:text-hive group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
