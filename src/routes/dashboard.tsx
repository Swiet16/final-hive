import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";
import { useProducts } from "@/hooks/use-products";
import { toast } from "sonner";
import {
  Package, User as UserIcon, LogOut, MapPin, Phone, Shield,
  CreditCard, Lock, Trash2, ShoppingCart, Tag, Flame, Copy,
  Sparkles, Award, MessageCircle, CheckCircle2, ChevronDown, ChevronRight,
} from "lucide-react";
import { StatusPill, StatusTimeline, OTPEntryForm, useOrderStatusHistory } from "@/components/site/OrderStatus";
import { CardBrandIcon } from "@/components/site/CardBrandIcon";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

type Profile = { id: string; full_name: string | null; phone: string | null; region: string; last_profile_change: string; created_at?: string };
type Order = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  admin_review_status: string;
  payment_method: string;
  card_brand?: string;
  card_last4?: string;
  customer_otp?: string | null;
};
type Card = { id: string; brand: string; last4: string; holder_name: string; exp_month: number; exp_year: number };
type Coupon = { id: string; code: string; description: string; discount_type: string; discount_value: number; expires_at: string | null; target_type: string; min_order_cents: number };
type Ticket = { id: string; ticket_number: string; category: string; subject: string; status: string; last_message_at: string };

const LOCK_DAYS = 60;
const LOCK_MS = LOCK_DAYS * 24 * 60 * 60 * 1000;
type Tab = "overview" | "orders" | "coupons" | "cards" | "profile" | "tickets";

function Dashboard() {
  const { user, loading } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [saving, setSaving] = useState(false);
  const [voucherPopup, setVoucherPopup] = useState<{ id: string; code: string; value: string; desc: string; expires: string | null } | null>(null);
  const { products: deals } = useProducts({ dealsOnly: true });

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  async function loadAll() {
    if (!user) return;
    const [p, o, c, ct, cp, tk] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("payment_cards" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("carts" as any).select("items").eq("user_id", user.id).maybeSingle(),
      supabase.from("coupons" as any).select("*").eq("active", true).order("created_at", { ascending: false }),
      supabase.from("chat_conversations" as any).select("id,ticket_number,category,subject,status,last_message_at").eq("user_id", user.id).order("last_message_at", { ascending: false }),
    ]);
    setProfile(p.data as any);
    setOrders((o.data ?? []) as any);
    setCards((c.data ?? []) as any);
    setCart(((ct.data as any)?.items ?? []) as any[]);
    setCoupons((cp.data ?? []) as any);
    setTickets((tk.data ?? []) as any);
    const seenIds: string[] = JSON.parse(localStorage.getItem("wd-seen-vouchers") || "[]");
    const gift = ((cp.data ?? []) as any[]).find(
      (c: any) => c.target_type === "user" && c.active && !seenIds.includes(c.id)
    );
    if (gift) {
      setVoucherPopup({
        id: gift.id,
        code: gift.code,
        value: gift.discount_type === "percent" ? `${gift.discount_value}% OFF` : `$${gift.discount_value} OFF`,
        desc: gift.description || "A special gift for you!",
        expires: gift.expires_at,
      });
    }
  }
  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [user]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`user-orders-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [user]);

  const lockMsLeft = profile ? LOCK_MS - (Date.now() - new Date(profile.last_profile_change).getTime()) : 0;
  const locked = lockMsLeft > 0;
  const daysLeft = Math.ceil(lockMsLeft / (24 * 60 * 60 * 1000));

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    const original = await supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle();
    const orig = original.data as any;
    const nameChanged = (orig?.full_name ?? "") !== (profile.full_name ?? "");
    const phoneChanged = (orig?.phone ?? "") !== (profile.phone ?? "");
    const regionChanged = (orig as any)?.region !== profile.region;

    if ((nameChanged || phoneChanged) && locked) {
      return toast.error(`Name and phone are locked for ${daysLeft} more day(s)`);
    }
    setSaving(true);
    const patch: any = { region: profile.region };
    if (nameChanged) patch.full_name = profile.full_name;
    if (phoneChanged) patch.phone = profile.phone;
    if (nameChanged || phoneChanged) patch.last_profile_change = new Date().toISOString();

    if (!nameChanged && !phoneChanged && !regionChanged) {
      setSaving(false); return toast.info("No changes to save");
    }
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(nameChanged || phoneChanged ? "Saved — name & phone locked for 60 days" : "Region updated"); loadAll(); }
  }

  async function deleteCard(id: string) {
    if (!confirm("Remove this saved card?")) return;
    const { error } = await supabase.from("payment_cards" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCards((c) => c.filter((x) => x.id !== id));
    toast.success("Card removed");
  }

  async function signOut() { await supabase.auth.signOut(); navigate({ to: "/" }); }

  function dismissVoucherPopup() {
    if (!voucherPopup) return;
    const seenIds: string[] = JSON.parse(localStorage.getItem("wd-seen-vouchers") || "[]");
    if (!seenIds.includes(voucherPopup.id)) seenIds.push(voucherPopup.id);
    localStorage.setItem("wd-seen-vouchers", JSON.stringify(seenIds));
    setVoucherPopup(null);
  }

  if (loading || !user) return <div className="min-h-[60vh] flex items-center justify-center text-silver/50">Loading…</div>;

  // Filter to coupons this user can use (all, or specifically targeted)
  const visibleCoupons = coupons;

  const stats = {
    orders: orders.length,
    coupons: visibleCoupons.length,
    tickets: tickets.filter(t => t.status !== "closed").length,
  };

  const tabs: { key: Tab; label: string; icon: any; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: Sparkles },
    { key: "orders", label: "Orders", icon: Package, badge: orders.length },
    { key: "coupons", label: "My Coupons", icon: Tag, badge: visibleCoupons.length },
    { key: "tickets", label: "Support", icon: MessageCircle, badge: stats.tickets },
    { key: "cards", label: "Cards", icon: CreditCard },
    { key: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div>
    {voucherPopup && <VoucherReceivedPopup voucher={voucherPopup} onClose={dismissVoucherPopup} />}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hive/20 via-sky-hive/10 to-amber-hive/15 border border-hive/20 p-6 sm:p-8 mb-6">
        <div className="absolute -top-20 -right-20 size-72 bg-hive/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-16 -left-16 size-56 bg-amber-hive/15 blur-3xl rounded-full" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold flex items-center gap-2">
              <Award className="size-3" /> Member dashboard
              {isAdmin && (
                <Link to="/admin" className="inline-flex items-center gap-1 bg-hive text-white px-2 py-0.5 rounded-full">
                  <Shield className="size-3" /> Admin
                </Link>
              )}
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl mt-2 tracking-tight">
              Hey, <span className="text-gradient-hive">{profile?.full_name?.split(" ")[0] || user.email?.split("@")[0]}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Track orders, claim coupons & get support — all in one place.</p>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 text-xs uppercase tracking-widest border border-border px-4 py-2 rounded-full hover:bg-secondary transition-colors">
            <LogOut className="size-3.5" /> Sign Out
          </button>
        </div>
        <div className="relative grid grid-cols-3 gap-3 sm:gap-6 mt-6 max-w-md">
          <StatPill label="Orders" value={stats.orders} />
          <StatPill label="Coupons" value={stats.coupons} accent />
          <StatPill label="Open tickets" value={stats.tickets} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-widest font-bold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? "border-hive text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="size-3.5" />
            {t.label}
            {!!t.badge && t.badge > 0 && (
              <span className={`text-[9px] px-1.5 rounded-full ${tab === t.key ? "bg-hive text-white" : "bg-secondary text-muted-foreground"}`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          {visibleCoupons.length > 0 && (
            <Section title="Your coupons" icon={Tag}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleCoupons.slice(0, 6).map((c) => <CouponCard key={c.id} coupon={c} />)}
              </div>
            </Section>
          )}

          {deals.length > 0 && (
            <Section title="Hot deals for you" icon={Flame}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {deals.slice(0, 4).map((d) => (
                  <Link key={d.id} to="/product/$id" params={{ id: d.id }} className="group bg-graphite/50 border border-border rounded-xl p-3 hover:border-racing-red/50 transition-colors">
                    <div className="aspect-square bg-onyx/40 rounded-lg overflow-hidden grid place-items-center mb-2">
                      <img
                        src={d.image_url || "https://images.unsplash.com/photo-1606577924006-27d39b132ae2?auto=format&fit=crop&w=600&q=80"}
                        alt={d.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-[10px] text-racing-red uppercase tracking-widest font-bold">{d.brand}</p>
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-base font-bold text-racing-red">${Number(d.price).toFixed(2)}</p>
                      {d.original_price && <p className="text-[11px] text-silver/40 line-through">${Number(d.original_price).toFixed(2)}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {cart.length > 0 && (
            <Section title="Continue shopping" icon={ShoppingCart} action={<Link to="/checkout" className="text-[10px] uppercase tracking-widest text-racing-red hover:underline">Checkout →</Link>}>
              <ul className="divide-y divide-border bg-graphite/40 border border-border rounded-xl">
                {cart.map((it: any, i: number) => (
                  <li key={i} className="px-4 py-3 flex justify-between text-sm">
                    <span>{it.brand} {it.name} × {it.qty ?? 1}</span>
                    <span className="font-semibold">${(it.price * (it.qty ?? 1)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Recent orders" icon={Package} action={<button onClick={() => setTab("orders")} className="text-[10px] uppercase tracking-widest text-racing-red hover:underline">See all →</button>}>
            {orders.length === 0 ? (
              <div className="bg-graphite/40 border border-border rounded-xl p-8 text-center">
                <p className="text-silver/60 mb-4">No orders yet.</p>
                <Link to="/shop" className="inline-block bg-racing-red text-white px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover-glow">Shop Tires</Link>
              </div>
            ) : (
              <ul className="divide-y divide-border bg-graphite/40 border border-border rounded-xl">
                {orders.slice(0, 3).map((o) => <OrderRow key={o.id} o={o} />)}
              </ul>
            )}
          </Section>
        </div>
      )}

      {tab === "orders" && (
        <Section title={`All orders (${orders.length})`} icon={Package}>
          {orders.length === 0 ? <p className="text-muted-foreground text-sm">No orders yet — start shopping!</p> : (
            <div className="space-y-3">
              {orders.map((o) => <OrderRow key={o.id} o={o} />)}
            </div>
          )}
        </Section>
      )}

      {tab === "coupons" && (
        <Section title="My coupons" icon={Tag}>
          {visibleCoupons.length === 0 ? (
            <p className="text-silver/50">No active coupons available right now. Check back later!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleCoupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          )}
        </Section>
      )}

      {tab === "tickets" && (
        <Section title="Support tickets" icon={MessageCircle}>
          {tickets.length === 0 ? (
            <p className="text-silver/50">No tickets yet. Open the chat bubble (bottom-right) to start one.</p>
          ) : (
            <ul className="divide-y divide-border bg-graphite/40 border border-border rounded-xl">
              {tickets.map((t) => (
                <li key={t.id} className="p-4 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-racing-red">{t.category}</span>
                      <span className="text-[10px] text-silver/40 font-mono">{t.ticket_number}</span>
                    </div>
                    <p className="text-sm mt-0.5">{t.subject || "—"}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border ${
                    t.status === "closed" ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" : "border-amber-500/40 text-amber-300 bg-amber-500/10"
                  }`}>
                    {t.status === "closed" ? <><CheckCircle2 className="size-3 inline -mt-0.5 mr-1" /> Resolved</> : "Open"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {tab === "cards" && (
        <Section title="Saved cards" icon={CreditCard} action={<Link to="/checkout" className="text-[10px] uppercase tracking-widest text-racing-red hover:underline">Add at checkout</Link>}>
          {cards.length === 0 ? (
            <p className="text-sm text-silver/50">No saved cards. Add one at checkout — your full card details are securely stored and only visible to our admin team for order verification.</p>
          ) : (
            <ul className="space-y-3">
              {cards.map((c) => (
                <li key={c.id} className="flex items-center justify-between bg-graphite/40 border border-border rounded-xl p-5 group">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-onyx/60 border border-border grid place-items-center shrink-0">
                      <span className="text-[10px] font-bold uppercase text-silver/60">{c.brand?.slice(0, 4) ?? "CARD"}</span>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold uppercase tracking-wider">
                        {c.brand?.toUpperCase()} •••• •••• •••• {c.last4}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-silver/50 mt-1">
                        {c.holder_name} · Exp {String(c.exp_month).padStart(2, "0")}/{c.exp_year} · CVV: •••
                      </p>
                      <p className="text-[9px] text-silver/30 mt-0.5 uppercase tracking-widest">Card details secured · Admin-reviewed only</p>
                    </div>
                  </div>
                  <button onClick={() => deleteCard(c.id)} className="text-silver/30 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all" aria-label="Remove">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {tab === "profile" && (
        <Section title="Profile" icon={UserIcon}>
          <form onSubmit={saveProfile} className="bg-graphite/40 border border-border rounded-xl p-5 space-y-4 max-w-2xl">
            {locked && (
              <p className="text-[11px] text-amber-300/80 bg-amber-500/5 border border-amber-500/20 rounded-sm p-2 flex items-center gap-2">
                <Lock className="size-3.5" /> Name & phone are locked. Unlock in {daysLeft} day{daysLeft === 1 ? "" : "s"}. Region can still be updated.
              </p>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-silver/50">Email (permanent)</label>
              <input disabled value={user.email ?? ""} className="mt-2 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm opacity-60" />
              <p className="text-[10px] text-silver/40 mt-1">Email is your account identifier and cannot be changed.</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-silver/50">Full Name</label>
              <input disabled={locked} value={profile?.full_name ?? ""} onChange={(e) => setProfile((p) => (p ? { ...p, full_name: e.target.value } : p))} className="mt-2 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-racing-red disabled:opacity-50" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-silver/50 flex items-center gap-1"><Phone className="size-3" /> Phone</label>
              <input disabled={locked} value={profile?.phone ?? ""} onChange={(e) => setProfile((p) => (p ? { ...p, phone: e.target.value } : p))} className="mt-2 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-racing-red disabled:opacity-50" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-silver/50 flex items-center gap-1"><MapPin className="size-3" /> Region</label>
              <select value={profile?.region ?? "US"} onChange={(e) => setProfile((p) => (p ? { ...p, region: e.target.value } : p))} className="mt-2 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-racing-red">
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
            <button type="submit" disabled={saving || !profile} className="w-full bg-racing-red text-white py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-40">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </Section>
      )}
    </div>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`text-center bg-background/40 backdrop-blur-sm border rounded-xl py-3 ${accent ? "border-racing-red/40" : "border-border"}`}>
      <p className={`text-2xl font-bold ${accent ? "text-racing-red" : ""}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-silver/60 mt-0.5">{label}</p>
    </div>
  );
}

function Section({ title, icon: Icon, action, children }: { title: string; icon: any; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.25em] text-silver/60 flex items-center gap-2 font-bold">
          <Icon className="size-3.5" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  function copy() {
    navigator.clipboard.writeText(coupon.code);
    toast.success(`Copied ${coupon.code}`);
  }
  const value = coupon.discount_type === "percent" ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`;
  return (
    <div className="relative bg-gradient-to-br from-racing-red/20 to-graphite/60 border border-racing-red/40 rounded-xl p-4 overflow-hidden">
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 size-12 bg-background rounded-full" />
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 size-12 bg-background rounded-full" />
      <p className="text-[10px] uppercase tracking-widest text-racing-red font-bold">{coupon.target_type === "user" ? "Personal offer" : coupon.target_type === "new_joiners" ? "Welcome gift" : "Available"}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
      {coupon.description && <p className="text-[11px] text-silver/70 mt-1 line-clamp-2">{coupon.description}</p>}
      {coupon.min_order_cents > 0 && <p className="text-[10px] text-silver/50 mt-1">Min spend ${(coupon.min_order_cents / 100).toFixed(2)}</p>}
      <button onClick={copy} className="mt-3 w-full flex items-center justify-between bg-background/60 border border-dashed border-racing-red/50 px-3 py-2 rounded-md hover:bg-racing-red/10">
        <span className="font-mono text-sm font-bold">{coupon.code}</span>
        <Copy className="size-3.5 text-silver/60" />
      </button>
      {coupon.expires_at && <p className="text-[10px] text-silver/40 mt-2">Expires {new Date(coupon.expires_at).toLocaleDateString()}</p>}
    </div>
  );
}

function OrderRow({ o }: { o: Order }) {
  const [expanded, setExpanded] = useState(false);
  const needsOtp = o.status === "otp_required";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-3 sm:p-4 flex flex-wrap justify-between items-center gap-2 sm:gap-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs sm:text-sm font-semibold text-hive">{o.order_number}</span>
            <StatusPill status={o.status} />
            {needsOtp && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30 animate-pulse">
                Action required
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {new Date(o.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} · {o.payment_method === "card" ? "Card" : o.payment_method}
            {o.card_brand && o.card_last4 && (
              <span className="ml-1.5 inline-flex items-center gap-1">
                · <span className="inline-block h-3 rounded overflow-hidden border border-border"><CardBrandIcon brand={o.card_brand} className="h-3 w-auto" /></span> ••{o.card_last4}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-sm font-bold">${(o.total_cents / 100).toFixed(2)}</span>
          {expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-3 sm:p-4 space-y-3 bg-secondary/20">
          {/* OTP entry if needed */}
          {needsOtp && (
            <OTPEntryForm orderId={o.id} orderNumber={o.order_number} />
          )}

          {/* Status history timeline */}
          <OrderTimelineSection orderId={o.id} />

          {/* Admin review banner */}
          {o.admin_review_status === "pending" && o.status === "payment_processing" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs flex items-start gap-2">
              <Lock className="size-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-muted-foreground">
                Payment pending admin review — you'll see a status update here shortly. No need to do anything.
              </p>
            </div>
          )}

          <Link
            to="/track-order"
            search={{ q: o.order_number } as any}
            className="inline-flex items-center gap-1 text-xs font-semibold text-hive hover:gap-1.5 transition-all"
          >
            Full tracking page →
          </Link>
        </div>
      )}
    </div>
  );
}

function OrderTimelineSection({ orderId }: { orderId: string }) {
  const { history, loading } = useOrderStatusHistory(orderId);
  if (loading) return <p className="text-xs text-muted-foreground">Loading status history…</p>;
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold mb-2">Status history</h4>
      <StatusTimeline history={history} />
    </div>
  );
}

function VoucherReceivedPopup({
  voucher,
  onClose,
}: {
  voucher: { id: string; code: string; value: string; desc: string; expires: string | null };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Code ${voucher.code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-sm"
        style={{ animation: "voucherIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#140303] via-[#250808] to-[#140303] border border-racing-red/60 shadow-[0_0_100px_rgba(220,38,38,0.5)]">
          {/* Notches */}
          <div className="absolute -left-5 top-[54%] -translate-y-1/2 size-10 bg-[#050506] rounded-full border border-racing-red/20 z-10" />
          <div className="absolute -right-5 top-[54%] -translate-y-1/2 size-10 bg-[#050506] rounded-full border border-racing-red/20 z-10" />

          {/* Glow pulse */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 30%, rgba(220,38,38,0.4) 0%, transparent 65%)" }} />

          {/* Header */}
          <div className="relative px-7 pt-7 pb-4">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-racing-red">WheelDeelz Gift</span>
              <button onClick={onClose} className="size-7 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors" aria-label="Close">
                <span className="text-white text-lg leading-none">×</span>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="size-12 rounded-2xl bg-racing-red/20 border border-racing-red/40 grid place-items-center">
                <Tag className="size-5 text-racing-red" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-silver/50">You received a gift!</p>
                <p className="text-sm font-bold text-white mt-0.5">A special voucher just for you</p>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="font-display text-7xl font-black text-white" style={{ textShadow: "0 0 40px rgba(220,38,38,0.7)" }}>
                {voucher.value}
              </p>
            </div>

            {voucher.desc && (
              <p className="text-center text-[13px] text-silver/70 italic mt-2 px-2">"{voucher.desc}"</p>
            )}
          </div>

          {/* Dashed divider */}
          <div className="mx-7 border-t border-dashed border-racing-red/25" />

          {/* Code section */}
          <div className="relative px-7 py-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-silver/40 text-center mb-3">Your discount code</p>
            <button
              onClick={copyCode}
              className="w-full flex items-center justify-between bg-black/60 border border-dashed border-racing-red/40 hover:border-racing-red/70 rounded-xl px-4 py-3.5 transition-all group hover:bg-racing-red/5"
            >
              <span className="font-mono text-lg font-bold tracking-widest text-white">{voucher.code}</span>
              <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${copied ? "text-emerald-400" : "text-silver/50 group-hover:text-racing-red"}`}>
                {copied ? "Copied ✓" : <Copy className="size-4" />}
              </span>
            </button>

            {voucher.expires && (
              <p className="text-[10px] text-silver/40 text-center mt-2">
                Valid until {new Date(voucher.expires).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="px-7 pb-7 flex flex-col gap-2">
            <Link
              to="/shop"
              onClick={onClose}
              className="w-full bg-racing-red text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 hover-glow transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="size-3.5" /> Shop Now &amp; Use Code
            </Link>
            <button
              onClick={onClose}
              className="w-full text-silver/40 py-2 text-[11px] uppercase tracking-widest hover:text-silver/60 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes voucherIn {
          from { opacity: 0; transform: scale(0.7) translateY(40px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
