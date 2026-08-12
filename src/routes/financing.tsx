import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Crown, ShieldCheck, Clock, Lock, Percent, Truck, Gift, Star,
  Sparkles, ArrowRight, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { postFormToChat } from "@/lib/support-chat";

export const Route = createFileRoute("/financing")({
  component: MembershipPage,
});

const TIERS = [
  {
    name: "Free",
    price: "$0",
    sub: "/month",
    color: "from-zinc-400 to-zinc-600",
    perks: [
      "Access to all 10+ categories",
      "Free shipping over $50",
      "Standard 5-day delivery",
      "30-day easy returns",
      "Buyer protection",
    ],
    cta: "Your current plan",
    current: true,
  },
  {
    name: "Hive Plus",
    price: "$9.99",
    sub: "/month",
    color: "from-hive to-sky-hive",
    perks: [
      "Everything in Free",
      "5% back on every order",
      "Free express shipping (no min)",
      "Early access to flash deals",
      "Priority support — under 5 min reply",
      "Member-only prices",
    ],
    cta: "Upgrade",
    popular: true,
  },
  {
    name: "Hive Pro",
    price: "$19.99",
    sub: "/month",
    color: "from-amber-hive to-orange-500",
    perks: [
      "Everything in Hive Plus",
      "10% back on every order",
      "Free same-day delivery (in select cities)",
      "Exclusive Pro-only drops",
      "Personal shopping concierge",
      "Annual $50 gift card",
    ],
    cta: "Go Pro",
  },
];

function MembershipPage() {
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first so we can reply to your application.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const fields = {
      "Full name": String(fd.get("full_name") ?? ""),
      Email: String(fd.get("email") ?? ""),
      Phone: String(fd.get("phone") ?? ""),
      Plan: String(fd.get("plan") ?? "Hive Plus"),
    };
    try {
      await postFormToChat({
        userId: user.id,
        customerName: fields["Full name"] || user.email?.split("@")[0] || "Customer",
        kind: "Membership",
        fields,
      });
      (e.target as HTMLFormElement).reset();
      toast.success("Application sent — our team will reply in your chat within 24 hours.");
    } catch (err: any) {
      toast.error(err.message ?? "Could not send. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 bg-hive/10 text-hive text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border border-hive/20">
          <Crown className="size-3" /> Hive Membership
        </span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-4">
          Shop more. <span className="text-gradient-hive">Save more.</span>
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm sm:text-base">
          Unlock exclusive deals, free express shipping, and cashback on every order.
          Cancel anytime — your first 30 days are on us.
        </p>
      </div>

      {/* Pricing tiers */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative bg-card border rounded-3xl p-6 sm:p-7 flex flex-col ${
              tier.popular ? "border-hive shadow-card ring-2 ring-hive/20 scale-[1.02]" : "border-border"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-hive text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                ★ Most popular
              </span>
            )}
            <div className={`size-12 rounded-2xl bg-gradient-to-br ${tier.color} grid place-items-center text-white mb-4 shadow-soft`}>
              {tier.name === "Free" ? <Sparkles className="size-5" /> : tier.name === "Hive Plus" ? <Crown className="size-5" /> : <Star className="size-5" />}
            </div>
            <h3 className="font-display font-bold text-xl tracking-tight">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold">{tier.price}</span>
              <span className="text-sm text-muted-foreground">{tier.sub}</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm flex-1">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <Check className="size-4 text-hive mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{perk}</span>
                </li>
              ))}
            </ul>
            <button
              disabled={tier.current || submitting}
              className={`mt-6 w-full py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                tier.current
                  ? "bg-secondary text-muted-foreground cursor-default"
                  : tier.popular
                  ? "bg-hive text-white hover:bg-hive-dark"
                  : "border border-border hover:border-hive hover:text-hive"
              }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Feature highlights */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
        {[
          { icon: Percent,      title: "5-10% cashback",     body: "Earn hive points redeemable at checkout." },
          { icon: Truck,        title: "Free express ship", body: "Members get free express shipping, no minimum." },
          { icon: Gift,         title: "Member-only deals",   body: "Early access to flash sales and exclusive bundles." },
          { icon: ShieldCheck,  title: "Buyer protection",    body: "30-day returns + money-back guarantee." },
        ].map((b) => (
          <div key={b.title} className="bg-card border border-border rounded-2xl p-5">
            <b.icon className="size-5 text-hive mb-3" />
            <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
            <p className="text-xs text-muted-foreground">{b.body}</p>
          </div>
        ))}
      </div>

      {/* Sign-in notice + application form */}
      {!loading && !user && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 flex items-start gap-3 text-sm">
          <Lock className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-300">Sign in to apply</p>
            <p className="text-muted-foreground mt-1">
              We send your membership application to your private chat so our team can reply with confirmation.{" "}
              <Link to="/login" className="text-hive font-semibold hover:underline">Create an account or sign in →</Link>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <h2 className="font-display font-bold text-2xl tracking-tight mb-1">Apply for membership</h2>
        <p className="text-sm text-muted-foreground mb-6">Fill in your details — we'll get back to you within 24 hours.</p>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "full_name", label: "Full Name", type: "text", required: true },
            { name: "email",     label: "Email",     type: "email", required: true },
            { name: "phone",     label: "Phone",     type: "tel",   required: true },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold block mb-2">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                required={f.required}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold block mb-2">Plan</label>
            <select
              name="plan"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hive/40"
              defaultValue="Hive Plus"
            >
              <option>Hive Plus</option>
              <option>Hive Pro</option>
            </select>
          </div>
        </div>

        <button
          disabled={submitting}
          className="mt-6 w-full sm:w-auto bg-hive text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-60 hover:bg-hive-dark transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? "Sending…" : "Submit Application"}
          {!submitting && <ArrowRight className="size-3.5" />}
        </button>
      </form>
    </div>
  );
}
