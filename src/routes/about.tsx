import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart, ShieldCheck, Truck, RotateCcw, Award, Users, Globe,
  Sparkles, TrendingUp, Lock, Star, PackageCheck, HandCoins,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const VALUES = [
  { icon: Heart,        title: "Customer-First",       body: "Every decision starts with: 'Is this good for the customer?' If not, we don't ship it." },
  { icon: ShieldCheck,  title: "Buyer Protection",     body: "30-day money-back guarantee on every order. Your card is secured with 256-bit SSL encryption." },
  { icon: Truck,        title: "Fast Worldwide Shipping", body: "Free over $50 — delivering to 10+ regions with tracked, insured shipping." },
  { icon: RotateCcw,    title: "Easy Returns",         body: "Changed your mind? Return any item within 30 days for a full refund. No questions asked." },
  { icon: Award,        title: "Quality Promise",       body: "Every product is hand-checked by our team before it leaves the warehouse. If it's not good enough for our family, it's not good enough for yours." },
  { icon: HandCoins,    title: "Honest Pricing",         body: "No fake markdowns, no hidden fees. What you see is what you pay — and member prices go lower." },
];

const STATS = [
  { value: "2M+",  label: "Happy customers" },
  { value: "10+",   label: "Regions served" },
  { value: "200+",  label: "Premium brands" },
  { value: "4.8/5", label: "Average rating" },
];

function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-hive/10 via-sky-hive/5 to-amber-hive/10 py-16 sm:py-24">
        <div className="absolute inset-0 bg-hive-pattern opacity-40 pointer-events-none" />
        <div className="absolute top-20 right-[8%] size-24 opacity-20 animate-float-slow pointer-events-none">
          <Hex />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur text-hive text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border border-hive/20">
            <Sparkles className="size-3" /> Our Story
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-4 leading-[1.1]">
            We deliver products we'd<br className="hidden sm:block" />{" "}
            <span className="text-gradient-hive">proudly use ourselves</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl mx-auto text-sm sm:text-base">
            Life Hive started with a simple frustration: online shopping felt impersonal, dishonest, and risky.
            So we built a marketplace where every order is reviewed by a real human, every product is hand-checked,
            and every customer is treated like a neighbor — not a number.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5 text-center card-hover">
              <div className="text-2xl sm:text-3xl font-extrabold text-gradient-hive">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1 font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mb-6">
          Why we built <span className="text-gradient-hive">Life Hive</span>
        </h2>
        <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground space-y-4 leading-relaxed">
          <p>
            Three years ago, our founder ordered a "premium" pair of headphones from a major marketplace.
            They arrived broken, the seller vanished, and customer service treated him like a ticket number.
            That moment sparked a question: <span className="text-foreground font-semibold">"What if online shopping felt like buying from a friend who actually cared?"</span>
          </p>
          <p>
            Life Hive is the answer. We're not the biggest marketplace, and we don't try to be.
            We're the <span className="text-foreground font-semibold">most trusted</span> one.
            Every order placed on Life Hive goes through a real human review — we check the card,
            verify the shipping details, and confirm the order is legitimate before charging you.
            It's slower than instant-checkout giants. It's also why our fraud rate is 90% lower.
          </p>
          <p>
            We're loyal to our customers because they're loyal to us. Members get 5% back on every order,
            early access to deals, and a direct line to a real support human — usually replying in under 5 minutes.
            That's not a marketing promise; that's our team's KPI.
          </p>
          <p>
            <span className="text-foreground font-semibold">If we ever let you down</span>, tell us —
            and we'll make it right with a refund, a discount, or a personal call from our team.
            That's the Hive Way.
          </p>
        </div>
      </section>

      {/* Values grid */}
      <section className="bg-card border-y border-border py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold">What we stand for</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mt-2">
              Our six promises to you
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-background border border-border rounded-2xl p-6 card-hover">
                <div className="size-12 rounded-2xl bg-hive/10 text-hive grid place-items-center mb-4">
                  <v.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-hive font-bold">How it works</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mt-2">
            From cart to doorstep
          </h2>
        </div>
        <div className="grid sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { n: "1", icon: PackageCheck, title: "Place order", body: "Add to cart, enter card, checkout. Payment is held, not charged." },
            { n: "2", icon: ShieldCheck,  title: "Admin reviews", body: "Our team verifies your card & shipping details. We may request an OTP for security." },
            { n: "3", icon: Truck,        title: "Packed & shipped", body: "Items hand-checked, packed with care, and shipped with tracking + insurance." },
            { n: "4", icon: Star,         title: "Delivered & loved", body: "Get your order. Not happy? 30-day returns — full refund, no questions." },
          ].map(({ n, icon: Icon, title, body }) => (
            <div key={n} className="relative bg-card border border-border rounded-2xl p-5">
              <div className="absolute -top-3 -left-3 size-9 rounded-full bg-hive text-white grid place-items-center font-bold text-sm shadow-card">
                {n}
              </div>
              <Icon className="size-6 text-hive mb-3 mt-2" />
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hive via-sky-hive to-amber-hive p-8 sm:p-12 text-white text-center">
          <div className="absolute -top-8 -right-8 size-40 opacity-20 animate-float-slow pointer-events-none">
            <Hex />
          </div>
          <div className="relative">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Ready to shop the Hive Way?
            </h2>
            <p className="text-white/85 mt-3 max-w-md mx-auto text-sm">
              Join 2M+ customers who shop with confidence. Free shipping over $50, member prices, and real human support.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/shop" className="bg-white text-hive-dark px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-hive hover:text-ink transition-colors">
                Start shopping
              </Link>
              <Link to="/login" className="bg-white/10 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
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
