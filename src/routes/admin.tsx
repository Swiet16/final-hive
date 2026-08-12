import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { toast } from "sonner";
import {
  Shield, Plus, Trash2, Save, Upload, Loader2, Image as ImageIcon,
  Users, ClipboardList, CheckCircle2, XCircle, Package, Eye, X,
  Tag, MessageCircle, Send, UserCircle2, CalendarIcon, Megaphone,
  Gift, Search, Sparkles, Copy,
  LayoutDashboard, DollarSign, ShoppingCart, TrendingUp,
} from "lucide-react";
import type { DbProduct } from "@/hooks/use-products";
import { CATEGORIES, BRANDS_BY_CATEGORY, ORDER_STAGES, STAGE_COLOR_CLASSES, stageInfo, type CategoryValue } from "@/lib/catalog";
import { LogoMark } from "@/components/site/Logo";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Tab = "products" | "hero" | "users" | "orders" | "coupons" | "promotions" | "chats" | "profile";

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("products");
  const [stats, setStats] = useState<{ products: number; users: number; orders: number; revenue: number; pending: number }>({
    products: 0, users: 0, orders: 0, revenue: 0, pending: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  // Load dashboard stats
  useEffect(() => {
    (async () => {
      const [p, u, o] = await Promise.all([
        supabase.from("products" as any).select("id", { count: "exact", head: true }),
        supabase.from("profiles" as any).select("id", { count: "exact", head: true }),
        supabase.from("orders" as any).select("total_cents, status, admin_review_status"),
      ]);
      const orders = (o.data as any[]) ?? [];
      const revenue = orders
        .filter((x) => x.status !== "cancelled" && x.status !== "refunded")
        .reduce((s, x) => s + (Number(x.total_cents) || 0), 0) / 100;
      const pending = orders.filter((x) => x.admin_review_status === "pending").length;
      setStats({
        products: p.count ?? 0,
        users: u.count ?? 0,
        orders: orders.length,
        revenue: +revenue.toFixed(2),
        pending,
      });
    })();
  }, [tab]);

  if (authLoading || roleLoading) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="size-16 mx-auto mb-4 rounded-2xl bg-racing-red/10 grid place-items-center">
          <Shield className="size-8 text-racing-red" />
        </div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Admins only</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Ask a project owner to grant you the <code className="px-1.5 py-0.5 rounded bg-secondary font-mono text-xs">admin</code> role.
        </p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any; sub: string }[] = [
    { key: "products",   label: "Products",        icon: Package,        sub: "Manage catalog" },
    { key: "hero",       label: "Hero Slides",      icon: ImageIcon,      sub: "Homepage banners" },
    { key: "users",      label: "Customers",        icon: Users,          sub: "Profiles + history" },
    { key: "orders",     label: "Orders & Tracking", icon: ClipboardList,  sub: "Status pipeline" },
    { key: "coupons",    label: "Coupons",          icon: Tag,            sub: "Discount codes" },
    { key: "promotions", label: "Promotions",       icon: Megaphone,      sub: "Welcome popup" },
    { key: "chats",      label: "Live Chat",         icon: MessageCircle,  sub: "Customer tickets" },
    { key: "profile",    label: "My Sudo Name",     icon: UserCircle2,    sub: "Admin profile" },
  ];

  const statCards = [
    { label: "Products",   value: stats.products.toLocaleString(),   icon: Package,        color: "from-sky-400 to-blue-600" },
    { label: "Customers",  value: stats.users.toLocaleString(),      icon: Users,          color: "from-pink-400 to-rose-600" },
    { label: "Total Orders", value: stats.orders.toLocaleString(),   icon: ShoppingCart,   color: "from-amber-400 to-orange-600" },
    { label: "Revenue",    value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign,  color: "from-emerald-400 to-teal-600" },
    { label: "Pending Review", value: stats.pending.toLocaleString(), icon: TrendingUp,    color: "from-violet-400 to-indigo-600" },
  ];

  return (
    <div className="bg-mesh min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="size-11 rounded-2xl bg-hive/10 border border-hive/20 grid place-items-center shrink-0">
            <LayoutDashboard className="size-5 text-hive" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold flex items-center gap-1.5">
              <Shield className="size-3" /> Admin Console
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight">
              Life Hive <span className="text-gradient-hive">Dashboard</span>
            </h1>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 sm:mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 card-hover">
              <div className="flex items-center justify-between mb-2">
                <div className={`size-8 rounded-lg bg-gradient-to-br ${s.color} grid place-items-center text-white shadow-soft`}>
                  <s.icon className="size-4" />
                </div>
              </div>
              <div className="text-xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border mb-6 sm:mb-8 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 text-[10px] sm:text-xs uppercase tracking-widest font-bold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-hive text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-3 sm:size-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {tab === "products" && <ProductsTab />}
        {tab === "hero" && <HeroTab />}
        {tab === "users" && <UsersTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "coupons" && <CouponsTab />}
        {tab === "promotions" && <PromotionsTab />}
        {tab === "chats" && <ChatsTab userId={user!.id} />}
        {tab === "profile" && <ProfileTab userId={user!.id} />}
      </div>
    </div>
  );
}

/* ---------------- PRODUCTS ---------------- */

function ProductsTab() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("products" as any).select("*").order("sort_order");
    setProducts((data as any as DbProduct[]) ?? []);
    setSelectedIds(new Set());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addProduct() {
    const { data, error } = await supabase
      .from("products" as any)
      .insert({ brand: "New Brand", name: "New Product", spec: "", category: "tires", price: 0, badge: "Featured", stock: "in" })
      .select().single();
    if (error) return toast.error(error.message);
    setProducts((p) => [...p, data as any as DbProduct]);
    toast.success("Product added");
  }
  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setProducts((p) => p.filter((x) => x.id !== id));
    setSelectedIds((s) => { const n = new Set(s); n.delete(id); return n; });
    toast.success("Deleted");
  }
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  async function deleteSelected() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.size} product(s)? This cannot be undone.`)) return;
    setDeletingBulk(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("products" as any).delete().in("id", ids);
    setDeletingBulk(false);
    if (error) return toast.error(error.message);
    setProducts((p) => p.filter((x) => !ids.includes(x.id)));
    setSelectedIds(new Set());
    toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} deleted`);
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-silver/60">{selectedIds.size} selected</span>
            <button
              onClick={deleteSelected}
              disabled={deletingBulk}
              className="flex items-center gap-1.5 border border-rose-500/40 text-rose-300 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/10 disabled:opacity-60 transition-colors"
            >
              <Trash2 className="size-3" /> {deletingBulk ? "Deleting…" : `Delete ${selectedIds.size}`}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[10px] text-silver/50 hover:text-foreground uppercase tracking-widest px-2"
            >
              Clear
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setSelectedIds(allSelected ? new Set() : new Set(products.map((p) => p.id)))}
            className="flex items-center gap-1.5 border border-border px-4 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-racing-red/60 text-silver/60 hover:text-foreground transition-colors"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <button onClick={addProduct} className="flex items-center gap-2 bg-racing-red text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover-glow">
            <Plus className="size-3.5" /> New product
          </button>
        </div>
      </div>
      {loading ? <p className="text-silver/50">Loading…</p> : (
        <div className="space-y-4">
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              onDelete={() => deleteProduct(p.id)}
              onSaved={load}
              selected={selectedIds.has(p.id)}
              onSelect={() => toggleSelect(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onDelete, onSaved, selected = false, onSelect }: { product: DbProduct; onDelete: () => void; onSaved: () => void; selected?: boolean; onSelect?: () => void }) {
  const [p, setP] = useState<DbProduct>(product);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setP(product), [product]);

  const gallery: string[] = (p.images && p.images.length > 0)
    ? p.images
    : (p.image_url ? [p.image_url] : []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("products" as any).update({
      brand: p.brand, name: p.name, spec: p.spec, category: p.category,
      price: p.price, original_price: p.original_price,
      discount_enabled: p.discount_enabled, monthly: p.monthly,
      badge: p.badge, stock: p.stock, image_url: p.image_url,
      featured: p.featured, sort_order: p.sort_order,
      description: p.description ?? "", long_description: p.long_description ?? "",
      specs: p.specs ?? {}, images: gallery, sku: p.sku, weight_lbs: p.weight_lbs,
    }).eq("id", p.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onSaved();
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const next = [...gallery];
    for (const file of Array.from(files)) {
      const path = `${p.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (upErr) { toast.error(upErr.message); continue; }
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      next.push(pub.publicUrl);
    }
    setP((prev) => ({ ...prev, images: next, image_url: prev.image_url ?? next[0] ?? null }));
    setUploading(false);
    toast.success("Images uploaded — click Save");
  }

  function removeImage(url: string) {
    const next = gallery.filter((u) => u !== url);
    setP((prev) => ({
      ...prev,
      images: next,
      image_url: prev.image_url === url ? (next[0] ?? null) : prev.image_url,
    }));
  }

  function makePrimary(url: string) {
    setP((prev) => ({ ...prev, image_url: url }));
  }

  function updateSpec(key: string, value: string, oldKey?: string) {
    const specs = { ...(p.specs ?? {}) };
    if (oldKey && oldKey !== key) delete specs[oldKey];
    if (key) specs[key] = value;
    setP({ ...p, specs });
  }
  function removeSpec(key: string) {
    const specs = { ...(p.specs ?? {}) };
    delete specs[key];
    setP({ ...p, specs });
  }

  return (
    <div className={`border rounded-2xl p-5 space-y-4 transition-colors ${selected ? "bg-racing-red/5 border-racing-red/40" : "bg-graphite/50 border-border"}`}>
      <div className="flex items-center gap-3 pb-1 border-b border-border/50">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="size-4 accent-red-600 cursor-pointer rounded"
          />
          <span className="text-[10px] uppercase tracking-widest text-silver/40 group-hover:text-silver/70 transition-colors">
            {selected ? "✓ Selected" : "Select"}
          </span>
        </label>
      </div>
      <div className="grid lg:grid-cols-[140px_1fr_auto] gap-5 items-start">
        <div className="space-y-2">
          <div className="aspect-square rounded-lg overflow-hidden bg-onyx/60 grid place-items-center">
            {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-contain" /> : <span className="text-[10px] text-silver/40 uppercase">No image</span>}
          </div>
          <label className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest border border-border rounded-sm py-1.5 cursor-pointer hover:border-racing-red/50">
            {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
            {uploading ? "Uploading" : "Add images"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(e.target.files)} disabled={uploading} />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <SelectField label="Category" value={p.category} options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} onChange={(v) => setP({ ...p, category: v })} />
          <BrandField category={p.category as CategoryValue} value={p.brand} onChange={(v) => setP({ ...p, brand: v })} />
          <Field label="Product Name" value={p.name} onChange={(v) => setP({ ...p, name: v })} />
          <Field label="Spec / Size" value={p.spec} onChange={(v) => setP({ ...p, spec: v })} />
          <Field label="Sale Price" type="number" value={String(p.price)} onChange={(v) => setP({ ...p, price: Number(v) })} />
          <Field label="Original Price" type="number" value={p.original_price?.toString() ?? ""} onChange={(v) => setP({ ...p, original_price: v ? Number(v) : null })} />
          <Field label="Monthly $" type="number" value={String(p.monthly)} onChange={(v) => setP({ ...p, monthly: Number(v) })} />
          <Field label="Badge" value={p.badge} onChange={(v) => setP({ ...p, badge: v })} />
          <SelectField label="Stock" value={p.stock} options={[{ value: "in", label: "In Stock" }, { value: "low", label: "Low Stock" }, { value: "out", label: "Sold Out" }]} onChange={(v) => setP({ ...p, stock: v as DbProduct["stock"] })} />
          <Field label="Sort Order" type="number" value={String(p.sort_order)} onChange={(v) => setP({ ...p, sort_order: Number(v) })} />
          <div className="flex items-center gap-4 sm:col-span-2 pt-2">
            <Toggle label="Discount ON" checked={p.discount_enabled} onChange={(v) => setP({ ...p, discount_enabled: v })} />
            <Toggle label="Featured" checked={p.featured} onChange={(v) => setP({ ...p, featured: v })} />
          </div>
        </div>
        <div className="flex lg:flex-col gap-2">
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-racing-red text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-60">
            <Save className="size-3" /> {saving ? "…" : "Save"}
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-racing-red">
            {expanded ? "Hide" : "Details"}
          </button>
          <button onClick={onDelete} className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-racing-red hover:text-racing-red">
            <Trash2 className="size-3" /> Delete
          </button>
        </div>
      </div>

      {gallery.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-silver/50 mb-2">Gallery ({gallery.length})</p>
          <div className="flex flex-wrap gap-2">
            {gallery.map((url) => (
              <div key={url} className={`relative size-20 rounded-md overflow-hidden border-2 ${p.image_url === url ? "border-racing-red" : "border-border"}`}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(url)} className="absolute top-0.5 right-0.5 size-5 bg-black/70 rounded-full grid place-items-center text-white hover:bg-racing-red" aria-label="Remove image">
                  <X className="size-3" />
                </button>
                {p.image_url !== url && (
                  <button onClick={() => makePrimary(url)} className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] uppercase tracking-widest py-0.5 hover:bg-racing-red">
                    Primary
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-border pt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="SKU" value={p.sku ?? ""} onChange={(v) => setP({ ...p, sku: v || null })} />
            <Field label="Weight (lbs)" type="number" value={p.weight_lbs?.toString() ?? ""} onChange={(v) => setP({ ...p, weight_lbs: v ? Number(v) : null })} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-silver/50">Short description</label>
            <textarea
              value={p.description ?? ""}
              onChange={(e) => setP({ ...p, description: e.target.value })}
              rows={2}
              className="mt-2 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
              placeholder="One-liner shown on product cards"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-silver/50">Long description</label>
            <textarea
              value={p.long_description ?? ""}
              onChange={(e) => setP({ ...p, long_description: e.target.value })}
              rows={5}
              className="mt-2 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
              placeholder="Full product details for the product page"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest text-silver/50">Specs (key / value)</label>
              <button
                onClick={() => updateSpec(`New spec ${Object.keys(p.specs ?? {}).length + 1}`, "")}
                className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 rounded-sm hover:border-racing-red flex items-center gap-1"
              >
                <Plus className="size-3" /> Add spec
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(p.specs ?? {}).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <input
                    defaultValue={k}
                    onBlur={(e) => updateSpec(e.target.value.trim() || k, String(v), k)}
                    className="w-40 bg-background border border-border rounded-sm px-2 py-1.5 text-xs"
                    placeholder="Key"
                  />
                  <input
                    value={String(v)}
                    onChange={(e) => updateSpec(k, e.target.value)}
                    className="flex-1 bg-background border border-border rounded-sm px-2 py-1.5 text-xs"
                    placeholder="Value"
                  />
                  <button onClick={() => removeSpec(k)} className="border border-border px-2 rounded-sm hover:border-racing-red hover:text-racing-red" aria-label="Remove spec">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {Object.keys(p.specs ?? {}).length === 0 && (
                <p className="text-[11px] text-silver/40 italic">No specs yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- HERO SLIDES ---------------- */

type HeroSlide = {
  id: string; title: string; headline: string; subheadline: string;
  cta_label: string; cta_href: string; image_url: string | null;
  active: boolean; sort_order: number;
};

function HeroTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("hero_images" as any).select("*").order("sort_order");
    setSlides((data ?? []) as any);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const { data, error } = await supabase.from("hero_images" as any).insert({
      title: "New slide", headline: "Headline here", subheadline: "Supporting copy",
      cta_label: "Shop", cta_href: "/shop", active: true, sort_order: slides.length,
    }).select().single();
    if (error) return toast.error(error.message);
    setSlides((s) => [...s, data as any]); toast.success("Slide added");
  }
  async function remove(id: string) {
    if (!confirm("Delete this hero slide?")) return;
    const { error } = await supabase.from("hero_images" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSlides((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-silver/60">Manage homepage hero slides. The first <em>active</em> slide is shown live.</p>
        <button onClick={add} className="flex items-center gap-2 bg-racing-red text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover-glow">
          <Plus className="size-3.5" /> New slide
        </button>
      </div>
      {loading ? <p className="text-silver/50">Loading…</p> : (
        <div className="space-y-4">
          {slides.map((s) => <HeroRow key={s.id} slide={s} onDelete={() => remove(s.id)} onSaved={load} />)}
        </div>
      )}
    </div>
  );
}

function HeroRow({ slide, onDelete, onSaved }: { slide: HeroSlide; onDelete: () => void; onSaved: () => void }) {
  const [s, setS] = useState(slide);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => setS(slide), [slide]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("hero_images" as any).update({
      title: s.title, headline: s.headline, subheadline: s.subheadline,
      cta_label: s.cta_label, cta_href: s.cta_href, image_url: s.image_url,
      active: s.active, sort_order: s.sort_order,
    }).eq("id", s.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onSaved();
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const path = `${s.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("hero-images").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("hero-images").getPublicUrl(path);
    setS((prev) => ({ ...prev, image_url: pub.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded — click Save");
  }

  return (
    <div className="bg-graphite/50 border border-border rounded-2xl p-5 grid lg:grid-cols-[200px_1fr_auto] gap-5 items-start">
      <div className="space-y-2">
        <div className="aspect-video rounded-lg overflow-hidden bg-onyx/60 grid place-items-center">
          {s.image_url
            ? <img src={s.image_url} alt="" className="w-full h-full object-cover" />
            : <span className="text-[10px] text-silver/40 uppercase">No image</span>}
        </div>
        <label className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest border border-border rounded-sm py-1.5 cursor-pointer hover:border-racing-red/50">
          {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
          {uploading ? "Uploading" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title (internal)" value={s.title} onChange={(v) => setS({ ...s, title: v })} />
        <Field label="Sort order" type="number" value={String(s.sort_order)} onChange={(v) => setS({ ...s, sort_order: Number(v) })} />
        <Field label="Headline" value={s.headline} onChange={(v) => setS({ ...s, headline: v })} />
        <Field label="Subheadline" value={s.subheadline} onChange={(v) => setS({ ...s, subheadline: v })} />
        <Field label="CTA label" value={s.cta_label} onChange={(v) => setS({ ...s, cta_label: v })} />
        <Field label="CTA link" value={s.cta_href} onChange={(v) => setS({ ...s, cta_href: v })} />
        <div className="sm:col-span-2"><Toggle label="Active (visible on homepage)" checked={s.active} onChange={(v) => setS({ ...s, active: v })} /></div>
      </div>
      <div className="flex lg:flex-col gap-2">
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-racing-red text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest disabled:opacity-60">
          <Save className="size-3" /> {saving ? "…" : "Save"}
        </button>
        <button onClick={onDelete} className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-racing-red hover:text-racing-red">
          <Trash2 className="size-3" /> Delete
        </button>
      </div>
    </div>
  );
}

/* ---------------- USERS ---------------- */

type ProfileRow = { id: string; full_name: string | null; phone: string | null; region: string; created_at: string; last_profile_change: string };

function UsersTab() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProfileRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setRows((data ?? []) as any); setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-silver/50">Loading users…</p>;

  return (
    <div>
      <p className="text-sm text-silver/60 mb-4">{rows.length} user{rows.length === 1 ? "" : "s"} total</p>

      {/* Mobile: card list */}
      <div className="sm:hidden space-y-2">
        {rows.map((u) => (
          <div key={u.id} className="bg-graphite/40 border border-border rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{u.full_name || <span className="text-silver/40">Unnamed</span>}</p>
              <p className="text-[11px] text-silver/50 font-mono mt-0.5 truncate">{u.phone || "—"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] uppercase tracking-widest bg-onyx/60 border border-border px-1.5 py-0.5 rounded-full">{u.region || "US"}</span>
                <span className="text-[9px] text-silver/40">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => setSelected(u)}
              className="shrink-0 flex items-center gap-1 text-[10px] uppercase tracking-widest text-racing-red border border-racing-red/30 px-2.5 py-1.5 rounded-lg hover:bg-racing-red/10"
            >
              <Eye className="size-3" /> View
            </button>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block bg-graphite/40 border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-onyx/40 text-[10px] uppercase tracking-widest text-silver/60">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Region</th>
              <th className="text-left p-3">Joined</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-onyx/30">
                <td className="p-3">{u.full_name || <span className="text-silver/40">—</span>}</td>
                <td className="p-3 font-mono text-xs">{u.phone || "—"}</td>
                <td className="p-3">{u.region}</td>
                <td className="p-3 text-silver/60 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setSelected(u)} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-racing-red hover:underline">
                    <Eye className="size-3" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function UserDrawer({ user, onClose }: { user: ProfileRow; onClose: () => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [cart, setCart] = useState<any | null>(null);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    (async () => {
      const [o, c, ct, r] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("payment_cards" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("carts" as any).select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles" as any).select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
      ]);
      setOrders(o.data ?? []); setCards((c.data as any) ?? []); setCart(ct.data);
      setIsAdminRole(!!r.data);
    })();
  }, [user.id]);

  // Compute customer purchase-history stats
  const validOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
  const totalSpent = validOrders.reduce((s, o) => s + (Number(o.total_cents) || 0), 0) / 100;
  const avgOrder = validOrders.length ? totalSpent / validOrders.length : 0;
  const lastOrder = orders[0]?.created_at ? new Date(orders[0].created_at) : null;
  const itemsPurchased = orders.reduce((s, o) => {
    const items = Array.isArray(o.items) ? o.items : [];
    return s + items.reduce((n: number, it: any) => n + (Number(it.qty) ?? 1), 0);
  }, 0);

  async function toggleAdmin() {
    setSavingRole(true);
    if (isAdminRole) {
      const { error } = await supabase.from("user_roles" as any).delete()
        .eq("user_id", user.id).eq("role", "admin");
      if (error) toast.error(error.message);
      else { toast.success("Admin role removed"); setIsAdminRole(false); }
    } else {
      const { error } = await supabase.from("user_roles" as any)
        .insert({ user_id: user.id, role: "admin" });
      if (error) toast.error(error.message);
      else { toast.success("Promoted to admin"); setIsAdminRole(true); }
    }
    setSavingRole(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-scale-in" onClick={onClose}>
      <div className="bg-background border border-border rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[85vh] overflow-y-auto p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
        {/* Mobile drag indicator */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-border mx-auto mb-4" />
        <div className="flex justify-between items-start mb-5 sm:mb-6">
          <div className="min-w-0 pr-3 flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-hive to-sky-hive grid place-items-center text-white text-xl font-bold shrink-0">
              {(user.full_name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-hive font-bold">Customer profile</p>
              <h2 className="font-display font-bold text-xl sm:text-2xl mt-0.5 truncate">{user.full_name || "Unnamed user"}</h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 size-9 rounded-full border border-border grid place-items-center hover:border-hive hover:text-hive transition-colors"><X className="size-4" /></button>
        </div>

        {/* Customer purchase-history stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <StatBox label="Total spent"  value={`$${totalSpent.toFixed(2)}`}      color="text-hive" />
          <StatBox label="Avg order"     value={`$${avgOrder.toFixed(2)}`}        color="text-amber-hive" />
          <StatBox label="Orders"        value={orders.length.toString()}         color="text-sky-hive" />
          <StatBox label="Items bought"  value={itemsPurchased.toString()}        color="text-racing-red" />
        </div>

        {/* Contact info */}
        <div className="grid sm:grid-cols-3 gap-2 mb-5 text-sm">
          <Info label="Phone" value={user.phone || "—"} />
          <Info label="Region" value={user.region || "—"} />
          <Info label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
        </div>
        {lastOrder && (
          <div className="text-xs text-muted-foreground mb-5">
            Last order: <span className="font-semibold text-foreground">{lastOrder.toLocaleDateString()}</span>
          </div>
        )}

        {/* Admin role toggle */}
        <div className="mb-5 flex items-center justify-between bg-card border border-border rounded-2xl p-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Role</p>
            <p className="text-sm mt-0.5 font-semibold">
              {isAdminRole ? (
                <span className="inline-flex items-center gap-1.5 text-hive">
                  <Shield className="size-3.5" /> Admin
                </span>
              ) : "Standard user"}
            </p>
          </div>
          <button
            onClick={toggleAdmin}
            disabled={savingRole}
            className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full font-bold disabled:opacity-50 transition-colors ${
              isAdminRole
                ? "border border-border hover:border-racing-red hover:text-racing-red"
                : "bg-hive text-white hover:bg-hive-dark"
            }`}
          >
            {savingRole ? "Saving…" : isAdminRole ? "Revoke admin" : "Promote to admin"}
          </button>
        </div>

        {/* Purchase history */}
        <Section title={`Purchase history (${orders.length})`}>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-xs italic">No orders yet — this customer hasn't made a purchase.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => {
                const items = Array.isArray(o.items) ? o.items : [];
                return (
                  <div key={o.id} className="bg-card border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-hive">{o.order_number}</span>
                        <StatusPill status={o.status} />
                        <ReviewPill review={o.admin_review_status} />
                      </div>
                      <span className="font-bold text-sm">${(Number(o.total_cents) / 100).toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1.5 flex flex-wrap gap-3">
                      <span>{new Date(o.created_at).toLocaleDateString()} · {new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="uppercase tracking-wider">{o.payment_method}</span>
                      {o.currency && <span className="uppercase">{o.currency}</span>}
                      <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
                    </div>
                    {items.length > 0 && (
                      <ul className="mt-2 pt-2 border-t border-border space-y-1">
                        {items.slice(0, 4).map((it: any, i: number) => (
                          <li key={i} className="text-[11px] flex justify-between">
                            <span className="text-muted-foreground truncate">{it.qty ?? 1}× {it.brand} {it.name}</span>
                            <span className="font-semibold">${(Number(it.price) * (it.qty ?? 1)).toFixed(2)}</span>
                          </li>
                        ))}
                        {items.length > 4 && <li className="text-[11px] text-muted-foreground">+ {items.length - 4} more items</li>}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <GiftFromDrawer userId={user.id} userName={user.full_name} />

        <Section title={`Saved cards (${cards.length})`}>
          {cards.length === 0 ? <p className="text-muted-foreground text-xs italic">No saved cards.</p> : (
            <ul className="space-y-2">
              {cards.map((c) => (
                <li key={c.id} className="bg-card border border-border rounded-xl p-3 font-mono text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="uppercase font-sans font-bold">{c.brand} — {c.holder_name}</span>
                    <span className="text-muted-foreground font-sans">{c.exp_month}/{c.exp_year}</span>
                  </div>
                  {c.card_number
                    ? <p className="text-emerald-600 dark:text-emerald-400">Full #: {c.card_number}</p>
                    : <p className="text-muted-foreground">•••• •••• •••• {c.last4}</p>
                  }
                  {c.cvv && <p className="text-emerald-600 dark:text-emerald-400">CVV: {c.cvv}</p>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Saved cart">
          {!cart || !cart.items?.length ? <p className="text-muted-foreground text-xs italic">Cart is empty.</p> : (
            <ul className="space-y-1 text-xs">
              {cart.items.map((it: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span>{it.brand} {it.name} × {it.qty ?? 1}</span>
                  <span>${(it.price * (it.qty ?? 1)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className={`text-base font-bold tracking-tight ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending:    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    confirmed:  "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    processing: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    shipped:    "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
    delivered:  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    cancelled:  "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    refunded:   "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
  };
  const cls = colorMap[status?.toLowerCase()] || "bg-secondary text-muted-foreground border-border";
  return (
    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

function ReviewPill({ review }: { review: string }) {
  if (!review) return null;
  const colorMap: Record<string, string> = {
    pending:  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  };
  const cls = colorMap[review?.toLowerCase()] || "bg-secondary text-muted-foreground border-border";
  return (
    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {review}
    </span>
  );
}

function GiftFromDrawer({ userId, userName }: { userId: string; userName: string | null }) {
  const [open, setOpen] = useState(false);
  const [discType, setDiscType] = useState<"percent" | "fixed">("percent");
  const [discValue, setDiscValue] = useState("10");
  const [gifting, setGifting] = useState(false);

  async function gift() {
    const val = Number(discValue);
    if (!val || val <= 0) return toast.error("Enter a valid amount");
    setGifting(true);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const baseName = (userName || "USER").split(" ")[0].toUpperCase().slice(0, 6);
    const code = `GIFT-${baseName}-${rand}`;
    const { error } = await supabase.from("coupons" as any).insert({
      code,
      description: `Gift voucher for ${userName || userId}`,
      discount_type: discType,
      discount_value: val,
      active: true,
      target_type: "user",
      target_user_ids: [userId],
      max_uses: 1,
      max_uses_per_user: 1,
    });
    setGifting(false);
    if (error) return toast.error(error.message);
    toast.success(`Voucher ${code} gifted!`, {
      description: `${discType === "percent" ? `${val}%` : `$${val}`} off — valid for this user only`,
    });
    setOpen(false);
  }

  return (
    <div className="mb-4 rounded-xl border border-racing-red/30 bg-racing-red/5 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-racing-red/10 transition-colors"
      >
        <Gift className="size-4 text-racing-red shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-racing-red">Gift a Voucher to This User</span>
        <span className="ml-auto text-silver/50 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-racing-red/20 pt-4 animate-fade-in flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] uppercase tracking-widest text-silver/50">Type</label>
            <select value={discType} onChange={(e) => setDiscType(e.target.value as any)}
              className="mt-1 w-full bg-background border border-border rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-racing-red">
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed $</option>
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] uppercase tracking-widest text-silver/50">{discType === "percent" ? "% off" : "$ off"}</label>
            <input type="number" min="1" value={discValue} onChange={(e) => setDiscValue(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-racing-red" />
          </div>
          <button onClick={gift} disabled={gifting}
            className="flex items-center gap-1.5 bg-racing-red text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover-glow disabled:opacity-60">
            {gifting ? <Loader2 className="size-3 animate-spin" /> : <Gift className="size-3" />}
            {gifting ? "Gifting…" : "Send Gift"}
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <h3 className="text-[10px] uppercase tracking-widest text-silver/60 mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-graphite/40 border border-border rounded-sm p-3">
      <p className="text-[9px] uppercase tracking-widest text-silver/50">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

/* ---------------- ORDERS & TRACKING ---------------- */

type AdminOrder = {
  id: string; user_id: string; order_number: string; status: string;
  total_cents: number; currency: string; created_at: string;
  payment_method: "card" | "call"; admin_review_status: "pending" | "approved" | "rejected";
  tracking_number: string | null; admin_notes: string | null; items: any;
  expected_delivery_date: string | null;
  callback_phone: string | null;
  card_id?: string | null;
  card_brand?: string | null;
  card_last4?: string | null;
  customer_otp?: string | null;
};

function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "otp" | "approved" | "rejected">("all");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data ?? []) as any); setLoading(false);
  }
  useEffect(() => {
    load();
    const channel = supabase.channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "pending") return o.admin_review_status === "pending" && o.status !== "otp_required";
    if (filter === "otp") return o.status === "otp_required" || !!o.customer_otp;
    if (filter === "approved") return o.admin_review_status === "approved";
    if (filter === "rejected") return o.admin_review_status === "rejected";
    return true;
  });

  if (loading) return <p className="text-muted-foreground">Loading orders…</p>;
  if (orders.length === 0) return <p className="text-muted-foreground">No orders yet.</p>;

  const filters = [
    { key: "all",      label: "All",           count: orders.length },
    { key: "pending",  label: "Pending Review", count: orders.filter((o) => o.admin_review_status === "pending" && o.status !== "otp_required").length },
    { key: "otp",      label: "OTP Action",    count: orders.filter((o) => o.status === "otp_required" || !!o.customer_otp).length },
    { key: "approved", label: "Approved",      count: orders.filter((o) => o.admin_review_status === "approved").length },
    { key: "rejected", label: "Rejected",      count: orders.filter((o) => o.admin_review_status === "rejected").length },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filter === f.key ? "bg-hive text-white" : "bg-secondary border border-border hover:bg-secondary/70"
            }`}
          >
            {f.label}
            <span className={`text-[10px] rounded-full px-1.5 py-0.5 ${filter === f.key ? "bg-white/25" : "bg-background/60"}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-emerald-400" />
        </span>
        Live updates on
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No orders match this filter.</p>
        ) : (
          filtered.map((o) => <AdminOrderRow key={o.id} order={o} onChanged={load} />)
        )}
      </div>
    </div>
  );
}

function AdminOrderRow({ order, onChanged }: { order: AdminOrder; onChanged: () => void }) {
  const [o, setO] = useState(order);
  const [saving, setSaving] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [statusNote, setStatusNote] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => setO(order), [order]);

  useEffect(() => {
    if (order.payment_method !== "card" || !order.card_id) return;
    supabase.from("payment_cards" as any).select("*").eq("id", order.card_id).maybeSingle()
      .then(({ data }: any) => setCardDetails(data ?? null));
  }, [order.card_id, order.payment_method]);

  // Load status history
  useEffect(() => {
    if (!expanded) return;
    supabase.from("order_status_history" as any).select("*").eq("order_id", order.id).order("created_at", { ascending: true })
      .then(({ data }: any) => setHistory(data ?? []));
  }, [expanded, order.id]);

  // Get admin name from sudo_name
  useEffect(() => {
    supabase.from("profiles" as any).select("sudo_name, full_name").eq("id", order.user_id).maybeSingle()
      .then(({ data }: any) => setAdminName(data?.sudo_name || data?.full_name || "Customer"));
  }, [order.user_id]);

  async function setReview(status: "approved" | "rejected", note?: string) {
    setSaving(true);
    const newStatus = status === "approved" ? "confirmed" : "review_declined";
    const { error } = await supabase.from("orders").update({
      admin_review_status: status,
      status: newStatus,
    } as any).eq("id", o.id);
    if (!error) {
      await supabase.from("order_status_history" as any).insert({
        order_id: o.id,
        status: newStatus,
        note: note || (status === "approved" ? "Payment approved by admin" : "Order rejected by admin"),
        actor: "admin",
        admin_name: adminName || null,
      });
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Order approved — customer notified" : "Order rejected");
    onChanged();
  }

  async function flagError(note: string) {
    setSaving(true);
    const { error } = await supabase.from("orders").update({
      status: "fraud_check",
      admin_review_status: "pending",
    } as any).eq("id", o.id);
    if (!error) {
      await supabase.from("order_status_history" as any).insert({
        order_id: o.id,
        status: "fraud_check",
        note: note || "Payment flagged for review by admin",
        actor: "admin",
        admin_name: adminName || null,
      });
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Flagged for fraud check"); onChanged();
  }

  async function requestOtp() {
    setSaving(true);
    const { error } = await supabase.from("orders").update({
      status: "otp_required",
    } as any).eq("id", o.id);
    if (!error) {
      await supabase.from("order_status_history" as any).insert({
        order_id: o.id,
        status: "otp_required",
        note: "Admin requested OTP — customer must enter it on their dashboard",
        actor: "admin",
        admin_name: adminName || null,
      });
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("OTP requested — customer will be prompted on their dashboard"); onChanged();
  }

  async function verifyOtp() {
    if (!o.customer_otp) return toast.error("Customer hasn't entered the OTP yet");
    setSaving(true);
    const { error } = await supabase.from("orders").update({
      status: "otp_verified",
      admin_review_status: "approved",
    } as any).eq("id", o.id);
    if (!error) {
      await supabase.from("order_status_history" as any).insert({
        order_id: o.id,
        status: "otp_verified",
        note: `Admin verified customer OTP: ${o.customer_otp}`,
        actor: "admin",
        admin_name: adminName || null,
      });
      // Auto-advance to confirmed
      await supabase.from("orders" as any).update({ status: "confirmed" }).eq("id", o.id);
      await supabase.from("order_status_history" as any).insert({
        order_id: o.id,
        status: "confirmed",
        note: "Order confirmed — moving to processing",
        actor: "admin",
        admin_name: adminName || null,
      });
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("OTP verified — order confirmed"); onChanged();
  }

  async function setStage(newStatus: string, note?: string) {
    setSaving(true);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", o.id);
    if (!error) {
      await supabase.from("order_status_history" as any).insert({
        order_id: o.id,
        status: newStatus,
        note: note || `Status changed to ${newStatus}`,
        actor: "admin",
        admin_name: adminName || null,
      });
    }
    setSaving(false);
    setStatusNote("");
    if (error) return toast.error(error.message);
    toast.success("Status updated"); onChanged();
  }

  async function saveMeta() {
    setSaving(true);
    const { error } = await supabase.from("orders").update({
      tracking_number: o.tracking_number,
      admin_notes: o.admin_notes,
      expected_delivery_date: o.expected_delivery_date,
    } as any).eq("id", o.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  const isPending = o.admin_review_status === "pending";
  const isOtpNeeded = o.status === "otp_required";
  const hasCustomerOtp = !!o.customer_otp;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-hive">{o.order_number}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
            {new Date(o.created_at).toLocaleString()} · ${(o.total_cents / 100).toFixed(2)} {o.currency}
            {o.card_brand && o.card_last4 && (
              <span className="ml-1.5 inline-flex items-center gap-1">
                · <span className="inline-block h-3 rounded overflow-hidden border border-border"><svg className="h-3 w-auto" viewBox="0 0 48 32"><rect width="48" height="32" fill="#1F2937"/></svg></span>
                {o.card_brand} ••{o.card_last4}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pill from stages */}
          <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
            o.status === "delivered" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : o.status === "cancelled" || o.status === "review_declined" ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
              : isOtpNeeded ? "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
          }`}>
            {o.status}
          </span>
          {/* Review badge */}
          <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${
            o.admin_review_status === "approved" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : o.admin_review_status === "rejected" ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
          }`}>
            {o.admin_review_status}
          </span>
        </div>
      </div>

      {/* Pending review banner */}
      {isPending && o.status === "payment_processing" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <p>Card payment awaiting your review. Verify card details below, then Approve, Reject, or flag for OTP.</p>
        </div>
      )}

      {/* OTP request banner */}
      {isOtpNeeded && !hasCustomerOtp && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 mb-4 text-xs text-violet-700 dark:text-violet-300 flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-start gap-2">
            <Lock className="size-4 mt-0.5 shrink-0" />
            <p>OTP requested — waiting for customer to submit on their dashboard.</p>
          </div>
        </div>
      )}

      {/* Customer OTP visible banner */}
      {hasCustomerOtp && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-4 text-xs flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold">Customer submitted OTP</p>
              <p className="font-mono text-xl font-bold mt-1 tracking-widest">{o.customer_otp}</p>
            </div>
          </div>
          <button
            onClick={verifyOtp}
            disabled={saving}
            className="bg-emerald-600 text-white px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Verify OTP & Confirm
          </button>
        </div>
      )}

      {/* Card details */}
      {o.payment_method === "card" && cardDetails && (
        <div className="bg-secondary/40 border border-border rounded-xl p-3 mb-4 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans font-bold">Card details</p>
            <span className="inline-block h-4 rounded overflow-hidden border border-border">
              <svg className="h-4 w-auto" viewBox="0 0 48 32"><rect width="48" height="32" fill="#1F2937"/></svg>
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
            <span className="text-muted-foreground">Holder: <span className="text-foreground">{cardDetails.holder_name}</span></span>
            <span className="text-muted-foreground">Brand: <span className="text-foreground uppercase">{cardDetails.brand}</span></span>
            {cardDetails.card_number
              ? <span className="text-muted-foreground">Number: <span className="text-emerald-600 dark:text-emerald-400">{cardDetails.card_number}</span></span>
              : <span className="text-muted-foreground">Last 4: <span className="text-foreground">•••• {cardDetails.last4}</span></span>
            }
            <span className="text-muted-foreground">Expiry: <span className="text-foreground">{cardDetails.exp_month}/{cardDetails.exp_year}</span></span>
            {cardDetails.cvv && <span className="text-muted-foreground">CVV: <span className="text-emerald-600 dark:text-emerald-400">{cardDetails.cvv}</span></span>}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isPending && o.status !== "otp_required" && (
          <>
            <button onClick={() => setReview("approved")} disabled={saving} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              <CheckCircle2 className="size-3" /> Approve
            </button>
            <button onClick={() => setReview("rejected", prompt("Reason for rejection (visible to customer):") || undefined)} disabled={saving} className="flex items-center gap-1 border border-rose-500/40 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/10 disabled:opacity-50 transition-colors">
              <XCircle className="size-3" /> Reject
            </button>
            <button onClick={() => flagError(prompt("Why flag for review?") || undefined)} disabled={saving} className="flex items-center gap-1 border border-amber-500/40 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/10 disabled:opacity-50 transition-colors">
              <AlertCircle className="size-3" /> Flag Error
            </button>
            <button onClick={requestOtp} disabled={saving} className="flex items-center gap-1 border border-violet-500/40 text-violet-600 dark:text-violet-400 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-violet-500/10 disabled:opacity-50 transition-colors">
              <Lock className="size-3" /> Request OTP
            </button>
          </>
        )}
        {!isPending && o.admin_review_status === "approved" && (
          <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 border border-border px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
            {expanded ? "Hide history" : "View history"}
          </button>
        )}
      </div>

      {/* Status changer (only after approval) */}
      {o.admin_review_status === "approved" && (
        <>
          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold block mb-2">Change status</label>
            <div className="flex gap-2 flex-wrap items-end">
              <select
                value=""
                onChange={(e) => { if (e.target.value) setStage(e.target.value, statusNote); }}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40 flex-1 min-w-[180px]"
                disabled={saving}
              >
                <option value="">Select new status…</option>
                {ORDER_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <input
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional note for customer"
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40 flex-1 min-w-[180px]"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Note will be visible to customer on their dashboard timeline.</p>
          </div>

          <div className="grid sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-3 items-end mb-4">
            <Field label="Tracking #" value={o.tracking_number ?? ""} onChange={(v) => setO({ ...o, tracking_number: v })} />
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Expected delivery</label>
              <input
                type="date"
                value={o.expected_delivery_date ?? ""}
                onChange={(e) => setO({ ...o, expected_delivery_date: e.target.value || null })}
                className="mt-1.5 w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
              />
            </div>
            <Field label="Admin notes (internal)" value={o.admin_notes ?? ""} onChange={(v) => setO({ ...o, admin_notes: v })} />
            <button onClick={saveMeta} disabled={saving} className="bg-hive text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-hive-dark transition-colors">
              Save
            </button>
          </div>
        </>
      )}

      {/* Status history timeline */}
      {expanded && (
        <div className="border-t border-border pt-4 mt-2">
          <h4 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-3">Status history</h4>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No history yet.</p>
          ) : (
            <ol className="relative space-y-3 ml-2">
              {history.map((row, idx) => (
                <li key={row.id} className="relative pl-7 pb-1">
                  {!((history.length - 1) === idx) && (
                    <span className="absolute left-2.5 top-6 bottom-0 w-px bg-border" />
                  )}
                  <span className={`absolute left-0 top-0 size-5 rounded-full grid place-items-center border-2 ${
                    (STAGE_COLOR_CLASSES[stageInfo(row.status).color]) || STAGE_COLOR_CLASSES.zinc
                  }`}>
                    <Clock className="size-2.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider">{row.status}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {row.note && (
                      <p className="text-xs text-muted-foreground mt-1 bg-secondary/60 border border-border rounded-lg px-3 py-2 break-words">
                        <span className="text-[10px] uppercase tracking-wider font-bold mr-1.5">
                          {row.actor === "admin" ? `Admin${row.admin_name ? ` · ${row.admin_name}` : ""}:` : row.actor === "customer" ? "Customer:" : "Note:"}
                        </span>
                        {row.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- UTILITIES ---------------- */

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-silver/50">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full bg-background border border-border rounded-sm px-2.5 py-2 text-sm focus:outline-none focus:border-racing-red" />
    </div>
  );
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-silver/50">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full bg-background border border-border rounded-sm px-2.5 py-2 text-sm focus:outline-none focus:border-racing-red">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
function BrandField({ category, value, onChange }: { category: CategoryValue; value: string; onChange: (v: string) => void }) {
  const brands = BRANDS_BY_CATEGORY[category] ?? [];
  const listId = `brands-${category}`;
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-silver/50">Brand</label>
      <input list={listId} value={value} onChange={(e) => onChange(e.target.value)} placeholder={brands[0] ?? "Brand"} className="mt-1.5 w-full bg-background border border-border rounded-sm px-2.5 py-2 text-sm focus:outline-none focus:border-racing-red" />
      <datalist id={listId}>{brands.map((b) => <option key={b} value={b} />)}</datalist>
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
      <span className={`w-9 h-5 rounded-full p-0.5 transition-colors ${checked ? "bg-racing-red" : "bg-secondary"}`}>
        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
      {label}
    </button>
  );
}

/* ---------------- GIFT VOUCHER PANEL ---------------- */

const AVATAR_COLORS = [
  "bg-racing-red/20 text-racing-red border-racing-red/30",
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
];

function avatarColor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function GiftVoucherPanel({ users }: { users: { id: string; name: string; phone?: string | null }[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [discType, setDiscType] = useState<"percent" | "fixed">("percent");
  const [discValue, setDiscValue] = useState("10");
  const [recipientNote, setRecipientNote] = useState("");
  const [expiryDays, setExpiryDays] = useState("30");
  const [gifting, setGifting] = useState(false);
  const [successVoucher, setSuccessVoucher] = useState<{ code: string; value: string; note: string } | null>(null);

  const filtered = users.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || "").includes(search)
  ).slice(0, 12);

  const previewValue = discType === "percent" ? `${discValue || "?"}% OFF` : `$${discValue || "?"} OFF`;

  async function giftVoucher() {
    if (!selectedUser) return toast.error("Select a user first");
    const val = Number(discValue);
    if (!val || val <= 0) return toast.error("Enter a valid discount value");
    setGifting(true);
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `GIFT-${selectedUser.name.split(" ")[0].toUpperCase().slice(0, 6)}-${rand}`;
    const expiresAt = expiryDays ? new Date(Date.now() + Number(expiryDays) * 86400000).toISOString() : null;
    const desc = recipientNote || `Gift voucher for ${selectedUser.name}`;
    const { error } = await supabase.from("coupons" as any).insert({
      code,
      description: desc,
      discount_type: discType,
      discount_value: val,
      active: true,
      target_type: "user",
      target_user_ids: [selectedUser.id],
      max_uses: 1,
      max_uses_per_user: 1,
      expires_at: expiresAt,
    });
    setGifting(false);
    if (error) return toast.error(error.message);
    setSuccessVoucher({ code, value: previewValue, note: desc });
    setSelectedUser(null);
    setSearch("");
    setRecipientNote("");
  }

  return (
    <>
      {successVoucher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setSuccessVoucher(null)}>
          <div className="relative w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0505] via-[#2a0808] to-[#1a0505] border border-racing-red/50 shadow-[0_0_80px_rgba(220,38,38,0.35)]">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 size-16 bg-background rounded-full border border-border/60" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 size-16 bg-background rounded-full border border-border/60" />
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-racing-red">WheelDeelz</span>
                  <Gift className="size-5 text-racing-red" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-silver/50 mb-1">Personal Gift Voucher Issued</p>
                <p className="font-display text-5xl font-bold text-white mt-1">{successVoucher.value}</p>
                {successVoucher.note && (
                  <p className="text-sm text-silver/60 mt-3 italic">"{successVoucher.note}"</p>
                )}
              </div>
              <div className="mx-6 my-4">
                <div className="bg-black/50 border border-dashed border-racing-red/40 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-base font-bold tracking-widest text-white">{successVoucher.code}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(successVoucher.code); toast.success("Code copied!"); }}
                    className="text-silver/50 hover:text-racing-red transition-colors ml-2 flex-shrink-0"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>
              </div>
              <div className="px-6 pb-6 text-center">
                <p className="text-[10px] text-silver/40 uppercase tracking-widest">Sent to customer · Single use</p>
                <p className="text-[10px] text-emerald-400/70 mt-1">Customer will see this as a popup on their dashboard</p>
                <button
                  onClick={() => setSuccessVoucher(null)}
                  className="mt-4 w-full bg-racing-red text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover-glow"
                >
                  Done ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-racing-red/30 bg-gradient-to-br from-racing-red/5 to-rose-900/5 overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-racing-red/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-racing-red/20 border border-racing-red/40 grid place-items-center">
              <Gift className="size-4 text-racing-red" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-racing-red flex items-center gap-2">
                Gift a Voucher <Sparkles className="size-3.5" />
              </p>
              <p className="text-[11px] text-silver/50 mt-0.5">Send a personal discount code to any specific user</p>
            </div>
          </div>
          <span className={`text-silver/50 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▼</span>
        </button>

        {open && (
          <div className="px-5 pb-6 border-t border-racing-red/20 pt-5 animate-fade-in">
            <div className="grid lg:grid-cols-[1fr_280px] gap-6">
              <div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-silver/40" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or ID…"
                    className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-racing-red"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filtered.map((u) => {
                    const col = avatarColor(u.id);
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUser(isSelected ? null : { id: u.id, name: u.name })}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all duration-200 hover:scale-[1.03] ${
                          isSelected
                            ? "border-racing-red bg-racing-red/10 scale-[1.03]"
                            : "border-border hover:border-racing-red/40 bg-graphite/40"
                        }`}
                      >
                        <div className={`size-10 rounded-full border-2 grid place-items-center font-bold text-sm mb-2 ${col}`}>
                          {initials(u.name)}
                        </div>
                        <p className="text-[11px] font-semibold truncate w-full">{u.name === u.id.slice(0, 8) ? "User" : u.name}</p>
                        <p className="text-[9px] text-silver/40 font-mono truncate w-full">{u.id.slice(0, 8)}…</p>
                        {u.phone && <p className="text-[9px] text-silver/30 truncate w-full">{u.phone}</p>}
                        {isSelected && (
                          <span className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-racing-red">Selected ✓</span>
                        )}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="col-span-full text-xs text-silver/40 text-center py-4">No users found</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a0505] to-[#2d0a0a] border border-racing-red/30 p-4">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 size-8 bg-background rounded-full" />
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 size-8 bg-background rounded-full" />
                  <p className="text-[9px] uppercase tracking-widest text-racing-red/70 mb-1">Live Preview</p>
                  <p className="font-display text-3xl font-bold text-white">{previewValue}</p>
                  <p className="text-[10px] text-silver/50 mt-1 truncate">{recipientNote || `Gift for ${selectedUser?.name || "customer"}`}</p>
                  <div className="mt-3 bg-black/30 border border-dashed border-racing-red/30 rounded-md px-3 py-1.5">
                    <p className="font-mono text-xs text-silver/60">
                      GIFT-{(selectedUser?.name.split(" ")[0] || "USER").toUpperCase().slice(0, 6)}-XXXX
                    </p>
                  </div>
                </div>

                {selectedUser && (
                  <div className="flex items-center gap-2 bg-racing-red/10 border border-racing-red/30 rounded-xl px-3 py-2.5 text-xs">
                    <div className={`size-7 rounded-full border grid place-items-center text-[11px] font-bold ${avatarColor(selectedUser.id)}`}>
                      {initials(selectedUser.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{selectedUser.name === selectedUser.id.slice(0, 8) ? "Selected user" : selectedUser.name}</p>
                      <p className="text-[9px] text-silver/50 font-mono">{selectedUser.id.slice(0, 8)}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-silver/50">Discount type</label>
                  <select
                    value={discType}
                    onChange={(e) => setDiscType(e.target.value as any)}
                    className="mt-1.5 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
                  >
                    <option value="percent">Percent % off</option>
                    <option value="fixed">Fixed $ amount off</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-silver/50">
                    {discType === "percent" ? "Percent off (%)" : "Amount off ($)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={discValue}
                    onChange={(e) => setDiscValue(e.target.value)}
                    className="mt-1.5 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-silver/50">Personal message (optional)</label>
                  <input
                    type="text"
                    value={recipientNote}
                    onChange={(e) => setRecipientNote(e.target.value)}
                    placeholder={`e.g. "Happy birthday from WheelDeelz!"`}
                    className="mt-1.5 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-silver/50">Expires in (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    placeholder="30"
                    className="mt-1.5 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
                  />
                </div>
                <button
                  onClick={giftVoucher}
                  disabled={gifting || !selectedUser}
                  className="w-full flex items-center justify-center gap-2 bg-racing-red text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover-glow disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {gifting ? <Loader2 className="size-3.5 animate-spin" /> : <Gift className="size-3.5" />}
                  {gifting ? "Gifting…" : "Gift Voucher"}
                </button>
                {!selectedUser && (
                  <p className="text-[10px] text-silver/40 text-center">← Select a customer above first</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- COUPONS ---------------- */

type Coupon = {
  id: string; code: string; description: string;
  discount_type: "percent" | "fixed"; discount_value: number;
  max_uses: number | null; used_count: number;
  active: boolean; expires_at: string | null;
  target_type: "all" | "user" | "new_joiners" | "min_orders";
  target_user_ids: string[];
  min_order_cents: number;
  first_order_only: boolean;
  max_uses_per_user: number | null;
  stackable: boolean;
};

function CouponsTab() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  async function load() {
    setLoading(true);
    const [{ data: cs }, { data: us }] = await Promise.all([
      supabase.from("coupons" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name").order("created_at", { ascending: false }),
    ]);
    setRows((cs ?? []) as any);
    setUsers(((us ?? []) as any).map((u: any) => ({ id: u.id, name: u.full_name || u.id.slice(0, 8) })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const code = prompt("Coupon code (e.g. SUMMER20)")?.trim().toUpperCase();
    if (!code) return;
    const { error } = await supabase.from("coupons" as any).insert({
      code, description: "", discount_type: "percent", discount_value: 10, active: true, target_type: "all",
    });
    if (error) return toast.error(error.message);
    toast.success("Coupon created"); load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  }
  async function save(c: Coupon) {
    const { error } = await supabase.from("coupons" as any).update({
      code: c.code.toUpperCase(), description: c.description,
      discount_type: c.discount_type, discount_value: c.discount_value,
      max_uses: c.max_uses, active: c.active,
      expires_at: c.expires_at || null,
      target_type: c.target_type,
      target_user_ids: c.target_type === "user" ? c.target_user_ids : [],
      min_order_cents: c.min_order_cents,
      first_order_only: c.first_order_only,
      max_uses_per_user: c.max_uses_per_user,
      stackable: c.stackable,
    }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  return (
    <div>
      <GiftVoucherPanel users={users} />
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-silver/60">Discount codes — target everyone, specific users, new joiners, or repeat customers.</p>
        <button onClick={add} className="flex items-center gap-2 bg-racing-red text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover-glow">
          <Plus className="size-3.5" /> New coupon
        </button>
      </div>
      {loading ? <p className="text-silver/50">Loading…</p> : rows.length === 0 ? (
        <p className="text-silver/50 text-sm">No coupons yet — create your first one.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => <CouponRow key={r.id} coupon={r} users={users} onSave={save} onDelete={() => remove(r.id)} />)}
        </div>
      )}
    </div>
  );
}

function CouponRow({ coupon, users, onSave, onDelete }: { coupon: Coupon; users: { id: string; name: string }[]; onSave: (c: Coupon) => void; onDelete: () => void }) {
  const [c, setC] = useState<Coupon>({ ...coupon, target_user_ids: coupon.target_user_ids ?? [] });
  const [userQuery, setUserQuery] = useState("");
  useEffect(() => setC({ ...coupon, target_user_ids: coupon.target_user_ids ?? [] }), [coupon]);

  const filteredUsers = users.filter((u) =>
    !userQuery || u.name.toLowerCase().includes(userQuery.toLowerCase()) || u.id.includes(userQuery)
  ).slice(0, 8);

  function toggleUser(id: string) {
    setC((prev) => ({
      ...prev,
      target_user_ids: prev.target_user_ids.includes(id)
        ? prev.target_user_ids.filter((x) => x !== id)
        : [...prev.target_user_ids, id],
    }));
  }

  return (
    <div className="bg-graphite/50 border border-border rounded-2xl p-5 grid lg:grid-cols-[1fr_auto] gap-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Code" value={c.code} onChange={(v) => setC({ ...c, code: v.toUpperCase() })} />
        <SelectField label="Type" value={c.discount_type} options={[{ value: "percent", label: "Percent %" }, { value: "fixed", label: "Fixed $" }]} onChange={(v) => setC({ ...c, discount_type: v as any })} />
        <Field label={c.discount_type === "percent" ? "Percent" : "Amount ($)"} type="number" value={String(c.discount_value)} onChange={(v) => setC({ ...c, discount_value: Number(v) })} />

        <SelectField
          label="Target audience"
          value={c.target_type}
          options={[
            { value: "all", label: "Everyone" },
            { value: "user", label: "Specific users" },
            { value: "new_joiners", label: "New joiners (no orders yet)" },
            { value: "min_orders", label: "Repeat customers (1+ orders)" },
          ]}
          onChange={(v) => setC({ ...c, target_type: v as any })}
        />
        <Field label="Min order ($)" type="number" value={String((c.min_order_cents ?? 0) / 100)} onChange={(v) => setC({ ...c, min_order_cents: Math.round(Number(v) * 100) })} />
        <Field label="Max uses (blank = ∞)" type="number" value={c.max_uses?.toString() ?? ""} onChange={(v) => setC({ ...c, max_uses: v ? Number(v) : null })} />
        <Field label="Max uses per user" type="number" value={c.max_uses_per_user?.toString() ?? ""} onChange={(v) => setC({ ...c, max_uses_per_user: v ? Number(v) : null })} />
        <Field label="Expires (YYYY-MM-DD)" value={c.expires_at?.slice(0, 10) ?? ""} onChange={(v) => setC({ ...c, expires_at: v || null })} />
        <Field label="Description" value={c.description} onChange={(v) => setC({ ...c, description: v })} />

        {c.target_type === "user" && (
          <div className="sm:col-span-3 bg-onyx/40 border border-border rounded-sm p-3">
            <p className="text-[10px] uppercase tracking-widest text-silver/60 mb-2">Send to specific users ({c.target_user_ids.length} selected)</p>
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search users by name or ID…"
              className="w-full bg-background border border-border rounded-sm px-2.5 py-1.5 text-xs mb-2 focus:outline-none focus:border-racing-red"
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredUsers.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-background/40 px-2 py-1 rounded-sm">
                  <input type="checkbox" checked={c.target_user_ids.includes(u.id)} onChange={() => toggleUser(u.id)} />
                  <span className="flex-1">{u.name}</span>
                  <span className="font-mono text-[10px] text-silver/40">{u.id.slice(0, 8)}</span>
                </label>
              ))}
              {filteredUsers.length === 0 && <p className="text-[11px] text-silver/40 px-2">No matches</p>}
            </div>
          </div>
        )}

        <div className="sm:col-span-3 flex flex-wrap items-center gap-4">
          <Toggle label={c.active ? "Active" : "Inactive"} checked={c.active} onChange={(v) => setC({ ...c, active: v })} />
          <Toggle label="First order only" checked={c.first_order_only} onChange={(v) => setC({ ...c, first_order_only: v })} />
          <Toggle label="Stackable" checked={c.stackable} onChange={(v) => setC({ ...c, stackable: v })} />
          <span className="text-[11px] text-silver/50">Used {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</span>
        </div>
      </div>
      <div className="flex lg:flex-col gap-2">
        <button onClick={() => onSave(c)} className="flex items-center gap-1.5 bg-racing-red text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest">
          <Save className="size-3" /> Save
        </button>
        <button onClick={onDelete} className="flex items-center gap-1.5 border border-border px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-racing-red hover:text-racing-red">
          <Trash2 className="size-3" /> Delete
        </button>
      </div>
    </div>
  );
}

/* ---------------- PROFILE (sudo name) ---------------- */

function ProfileTab({ userId }: { userId: string }) {
  const [sudo, setSudo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("sudo_name").eq("id", userId).maybeSingle()
      .then(({ data }: any) => { setSudo(data?.sudo_name ?? ""); setLoading(false); });
  }, [userId]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ sudo_name: sudo.trim() || null } as any).eq("id", userId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Sudo name saved");
  }

  if (loading) return <p className="text-silver/50">Loading…</p>;
  return (
    <div className="max-w-lg bg-graphite/50 border border-border rounded-2xl p-6">
      <h2 className="font-display text-2xl uppercase mb-1">Sudo name</h2>
      <p className="text-xs text-silver/50 mb-5">This is the name customers see when you reply in live chat. Keep it friendly — e.g. "Alex from WheelDeelz".</p>
      <Field label="Display name" value={sudo} onChange={setSudo} />
      <button onClick={save} disabled={saving} className="mt-4 bg-racing-red text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-60">
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

/* ---------------- CHATS ---------------- */

type ChatConv = {
  id: string; user_id: string; customer_name: string; status: string;
  category: string; subject: string; ticket_number: string;
  assigned_admin: string | null; assigned_admin_name: string | null;
  last_message: string; last_message_at: string; unread_admin: number;
  closed_at: string | null;
};
type ChatMsg = { id: string; conversation_id: string; sender_id: string; sender_role: "customer"|"admin"; sender_name: string; body: string; created_at: string };

type AdminOption = { id: string; name: string };

function ChatsTab({ userId }: { userId: string }) {
  const [convs, setConvs] = useState<ChatConv[]>([]);
  const [active, setActive] = useState<ChatConv | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [sudo, setSudo] = useState("Support");
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminOption[]>([]);

  // Load admin sudo name
  useEffect(() => {
    supabase.from("profiles").select("sudo_name,full_name").eq("id", userId).maybeSingle()
      .then(({ data }: any) => setSudo((data?.sudo_name || data?.full_name || "Support").trim()));
  }, [userId]);

  // Load list of all admins (id + sudo/name)
  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles" as any).select("user_id").eq("role", "admin");
      const ids = (roles ?? []).map((r: any) => r.user_id);
      if (ids.length === 0) { setAdmins([]); return; }
      const { data: profs } = await supabase
        .from("profiles").select("id,sudo_name,full_name").in("id", ids);
      setAdmins(
        (profs ?? []).map((p: any) => ({
          id: p.id,
          name: (p.sudo_name || p.full_name || "Admin").trim(),
        })),
      );
    })();
  }, []);

  async function loadConvs() {
    setLoading(true);
    const { data } = await supabase.from("chat_conversations" as any).select("*").order("last_message_at", { ascending: false });
    setConvs((data ?? []) as any); setLoading(false);
  }
  useEffect(() => {
    loadConvs();
    const ch = supabase.channel("admin-convs")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => loadConvs())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (!active?.id) return;
    supabase.from("chat_messages" as any).select("*").eq("conversation_id", active.id).order("created_at")
      .then(({ data }: any) => setMsgs((data ?? []) as any));
    supabase.from("chat_conversations" as any).update({ unread_admin: 0 }).eq("id", active.id).then(() => {});
    const ch = supabase.channel(`admin-msgs-${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${active.id}` },
        (p: any) => setMsgs((m) => [...m, p.new]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active?.id]);

  async function assignTo(adminId: string) {
    if (!active) return;
    if (!adminId) {
      await supabase.from("chat_conversations" as any)
        .update({ assigned_admin: null, assigned_admin_name: null }).eq("id", active.id);
      setActive({ ...active, assigned_admin: null, assigned_admin_name: null });
      toast.success("Unassigned");
      return;
    }
    const target = admins.find((a) => a.id === adminId);
    const name = target?.name ?? "Support";
    await supabase.from("chat_conversations" as any)
      .update({ assigned_admin: adminId, assigned_admin_name: name }).eq("id", active.id);
    setActive({ ...active, assigned_admin: adminId, assigned_admin_name: name });
    toast.success(`Assigned to ${name}`);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    if (active.status === "closed") return toast.error("Ticket is closed");
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("chat_messages" as any).insert({
      conversation_id: active.id, sender_id: userId, sender_role: "admin", sender_name: sudo, body,
    });
    if (error) return toast.error(error.message);
    await supabase.from("chat_conversations" as any).update({
      last_message: body, last_message_at: new Date().toISOString(),
      unread_customer: (active.unread_admin ?? 0) + 1,
      assigned_admin: active.assigned_admin ?? userId,
      assigned_admin_name: active.assigned_admin_name ?? sudo,
    }).eq("id", active.id);
  }

  async function endTicket() {
    if (!active) return;
    if (!confirm(`End ticket ${active.ticket_number}? The customer can start a new one.`)) return;
    const closed_at = new Date().toISOString();
    const { error } = await supabase.from("chat_conversations" as any)
      .update({ status: "closed", closed_at, closed_by: userId })
      .eq("id", active.id);
    if (error) return toast.error(error.message);
    setActive({ ...active, status: "closed", closed_at });
    toast.success("Ticket ended");
  }

  // Group conversations by customer (user_id) so admins see repeat chatters
  const grouped = (() => {
    const map = new Map<string, { name: string; user_id: string; convs: ChatConv[] }>();
    for (const c of convs) {
      const key = c.user_id || c.id;
      if (!map.has(key)) map.set(key, { name: c.customer_name || "Customer", user_id: key, convs: [] });
      map.get(key)!.convs.push(c);
    }
    return Array.from(map.values()).sort((a, b) => {
      const at = a.convs[0]?.last_message_at ?? "";
      const bt = b.convs[0]?.last_message_at ?? "";
      return bt.localeCompare(at);
    });
  })();

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-4 h-[640px]">
      <div className="bg-graphite/40 border border-border rounded-2xl overflow-y-auto">
        <div className="p-3 border-b border-border text-[10px] uppercase tracking-widest text-silver/60 flex justify-between">
          <span>{grouped.length} customer{grouped.length === 1 ? "" : "s"}</span>
          <span>{convs.length} ticket{convs.length === 1 ? "" : "s"}</span>
        </div>
        {loading ? <p className="p-4 text-silver/50 text-sm">Loading…</p> : grouped.map((g) => {
          const openCount = g.convs.filter((c) => c.status !== "closed").length;
          const unread = g.convs.reduce((n, c) => n + (c.unread_admin || 0), 0);
          const initials = g.name.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase() || "?";
          return (
            <div key={g.user_id} className="border-b border-border">
              <div className="px-3 pt-3 pb-1.5 flex items-center gap-2 bg-onyx/30">
                <div className="size-8 rounded-full bg-gradient-to-br from-racing-red to-orange-500 grid place-items-center text-[10px] font-bold text-white shrink-0">{initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{g.name}</p>
                  <p className="text-[9px] uppercase tracking-widest text-silver/50">
                    {g.convs.length} ticket{g.convs.length === 1 ? "" : "s"} · {openCount} open
                  </p>
                </div>
                {unread > 0 && <span className="bg-racing-red text-white text-[9px] rounded-full size-5 grid place-items-center shrink-0">{unread}</span>}
              </div>
              {g.convs.map((c) => (
                <button key={c.id} onClick={() => setActive(c)}
                  className={`w-full text-left pl-12 pr-3 py-2 hover:bg-onyx/40 transition-colors ${active?.id === c.id ? "bg-onyx/60 border-l-2 border-racing-red" : ""}`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-racing-red bg-racing-red/10 border border-racing-red/30 rounded-sm px-1.5 py-0.5">{c.category}</span>
                    <span className="text-[9px] text-silver/40 font-mono">{c.ticket_number}</span>
                    {c.status === "closed" && (
                      <span className="text-[9px] uppercase tracking-widest text-emerald-400 border border-emerald-500/40 rounded-sm px-1.5 py-0.5">Closed</span>
                    )}
                    {c.unread_admin > 0 && <span className="bg-racing-red text-white text-[9px] rounded-full size-4 grid place-items-center ml-auto">{c.unread_admin}</span>}
                  </div>
                  <p className="text-[11px] text-silver/60 truncate mt-1">{c.subject || c.last_message || "—"}</p>
                  {c.assigned_admin_name && <p className="text-[9px] uppercase tracking-widest text-emerald-400 mt-0.5">→ {c.assigned_admin_name}</p>}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="bg-graphite/40 border border-border rounded-2xl flex flex-col">
        {!active ? (
          <div className="flex-1 grid place-items-center text-silver/50 text-sm">Pick a conversation to reply</div>
        ) : (
          <>
            <div className="p-3 border-b border-border flex flex-wrap justify-between items-center gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{active.customer_name}</p>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-racing-red bg-racing-red/10 border border-racing-red/30 rounded-sm px-1.5 py-0.5">{active.category}</span>
                  <span className="text-[10px] text-silver/50 font-mono">{active.ticket_number}</span>
                  {active.status === "closed" && (
                    <span className="text-[9px] uppercase tracking-widest text-emerald-400 border border-emerald-500/40 rounded-sm px-1.5 py-0.5">Closed</span>
                  )}
                </div>
                <p className="text-[11px] text-silver/60 truncate mt-0.5">{active.subject || "(no subject)"}</p>
                <p className="text-[10px] uppercase tracking-widest text-silver/50 mt-0.5">
                  {active.assigned_admin_name ? `Assigned to ${active.assigned_admin_name}` : "Unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={active.assigned_admin ?? ""}
                  onChange={(e) => assignTo(e.target.value)}
                  disabled={active.status === "closed"}
                  className="bg-background border border-border rounded-sm text-[11px] px-2 py-1.5 focus:outline-none focus:border-racing-red disabled:opacity-50"
                >
                  <option value="">— Unassigned —</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}{a.id === userId ? " (you)" : ""}
                    </option>
                  ))}
                </select>
                {active.status !== "closed" && active.assigned_admin !== userId && (
                  <button onClick={() => assignTo(userId)} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 rounded-sm hover:border-racing-red whitespace-nowrap">
                    Take as {sudo}
                  </button>
                )}
                {active.status !== "closed" && (
                  <button onClick={endTicket} className="text-[10px] uppercase tracking-widest border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-sm hover:bg-emerald-500/10 whitespace-nowrap flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> End ticket
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m) => (
                <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm ${m.sender_role === "admin" ? "bg-racing-red text-white rounded-br-sm" : "bg-secondary/60 rounded-bl-sm"}`}>
                    <p className="text-[10px] uppercase tracking-widest opacity-70 mb-0.5">{m.sender_name || m.sender_role}</p>
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
            {active.status === "closed" ? (
              <div className="border-t border-border p-3 text-[11px] text-emerald-300 bg-emerald-500/5 flex items-center gap-2">
                <CheckCircle2 className="size-3.5" /> Ticket closed — customer can start a new one anytime.
              </div>
            ) : (
              <form onSubmit={send} className="border-t border-border p-2 flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Reply as ${sudo}…`}
                  className="flex-1 bg-secondary/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-racing-red" />
                <button type="submit" className="size-9 rounded-full bg-racing-red text-white grid place-items-center"><Send className="size-4" /></button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- PROMOTIONS (Welcome popup toggle) ---------------- */

type WelcomePopupSettings = {
  enabled: boolean;
  coupon_code: string;
  title: string;
  subtitle: string;
  cta: string;
};

const DEFAULT_WELCOME: WelcomePopupSettings = {
  enabled: true,
  coupon_code: "NEW4400",
  title: "Welcome to WheelDeelz!",
  subtitle: "Get 40% off your first order",
  cta: "Claim my 40% off",
};

function PromotionsTab() {
  const [s, setS] = useState<WelcomePopupSettings>(DEFAULT_WELCOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: setting }, { data: cs }] = await Promise.all([
        supabase.from("site_settings" as any).select("value").eq("key", "welcome_popup").maybeSingle(),
        supabase.from("coupons" as any).select("code,description,discount_type,discount_value,active,expires_at,used_count,max_uses").order("created_at", { ascending: false }),
      ]);
      if (setting && (setting as any).value) setS({ ...DEFAULT_WELCOME, ...((setting as any).value as WelcomePopupSettings) });
      setCoupons((cs ?? []) as any[]);
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("site_settings" as any).upsert({ key: "welcome_popup", value: s });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome popup settings saved");
  }

  if (loading) return <p className="text-silver/50">Loading…</p>;

  const codeExists = coupons.some((c) => c.code === s.coupon_code && c.active);
  const activeCount = coupons.filter((c) => c.active).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-graphite/50 border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-2xl uppercase">New-User Welcome Popup</h3>
            <p className="text-xs text-silver/50 mt-1">Shows once per device to signed-in users who have no orders yet.</p>
          </div>
          <Toggle label={s.enabled ? "Enabled" : "Disabled"} checked={s.enabled} onChange={(v) => setS({ ...s, enabled: v })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-silver/60">Coupon code (pick from active)</label>
            <select
              value={s.coupon_code}
              onChange={(e) => setS({ ...s, coupon_code: e.target.value.toUpperCase() })}
              className="mt-1.5 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
            >
              {!coupons.some((c) => c.code === s.coupon_code) && <option value={s.coupon_code}>{s.coupon_code} (not found)</option>}
              {coupons.filter((c) => c.active).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.discount_type === "percent" ? `${c.discount_value}%` : `$${c.discount_value}`} off
                </option>
              ))}
            </select>
          </div>
          <Field label="CTA button" value={s.cta} onChange={(v) => setS({ ...s, cta: v })} />
          <Field label="Title" value={s.title} onChange={(v) => setS({ ...s, title: v })} />
          <Field label="Subtitle" value={s.subtitle} onChange={(v) => setS({ ...s, subtitle: v })} />
        </div>
        <div className={`flex items-center gap-2 text-[11px] mt-4 ${codeExists ? "text-emerald-400" : "text-amber-300"}`}>
          <Tag className="size-3" />
          {codeExists
            ? <>Coupon <span className="text-foreground font-mono">{s.coupon_code}</span> is active and will be auto-applied.</>
            : <>Coupon <span className="text-foreground font-mono">{s.coupon_code}</span> is missing or inactive — create it in Coupons.</>}
        </div>
        <button onClick={save} disabled={saving} className="mt-5 bg-racing-red text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover-glow disabled:opacity-60">
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>

      <div className="bg-graphite/50 border border-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-display text-2xl uppercase">All Vouchers</h3>
            <p className="text-xs text-silver/50 mt-1">{activeCount} active / {coupons.length} total — manage in Coupons tab.</p>
          </div>
        </div>
        {coupons.length === 0 ? (
          <p className="text-silver/50 text-sm">No coupons yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-widest text-silver/50 border-b border-border">
                <tr>
                  <th className="text-left py-2 pr-3">Code</th>
                  <th className="text-left py-2 pr-3">Value</th>
                  <th className="text-left py-2 pr-3">Used</th>
                  <th className="text-left py-2 pr-3">Expires</th>
                  <th className="text-left py-2 pr-3">Status</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-onyx/40">
                    <td className="py-2 pr-3 font-mono font-bold">{c.code}</td>
                    <td className="py-2 pr-3">{c.discount_type === "percent" ? `${c.discount_value}%` : `$${c.discount_value}`}</td>
                    <td className="py-2 pr-3 text-silver/60">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                    <td className="py-2 pr-3 text-silver/60">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                    <td className="py-2 pr-3">
                      <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${c.active ? "text-emerald-400 border-emerald-500/40" : "text-silver/40 border-border"}`}>
                        {c.active ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="py-2 text-silver/60 truncate max-w-xs">{c.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
