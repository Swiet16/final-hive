import { Clock, ShieldCheck, Zap, Crown, Gift, Percent } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function FinancingCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      {/* Membership banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-hive-dark via-hive to-sky-hive p-8 sm:p-12 md:p-16 text-white">
        {/* Decorative hexes */}
        <div className="absolute top-6 right-8 size-20 opacity-20 animate-float-slow pointer-events-none">
          <Hex />
        </div>
        <div className="absolute bottom-6 right-24 size-12 opacity-25 animate-float-slow pointer-events-none" style={{ animationDelay: "1s" }}>
          <Hex />
        </div>
        <div className="absolute -bottom-10 -left-10 size-40 bg-amber-hive/30 blur-3xl rounded-full pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border border-white/20">
              <Crown className="size-3" />
              Hive Membership
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight mt-4 leading-[1.1]">
              Shop more.<br />
              <span className="text-amber-hive">Save more.</span>
            </h2>
            <p className="text-white/85 mt-4 max-w-md text-sm sm:text-base">
              Join Life Hive membership for exclusive deals, free express shipping, member-only
              prices, and 5% back on every order. Free trial — cancel anytime.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/financing"
                className="bg-white text-hive-dark px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-hive hover:text-ink transition-colors flex items-center gap-2"
              >
                <Zap className="size-3.5" /> Join Now
              </Link>
              <Link
                to="/track-order"
                className="bg-white/10 backdrop-blur border border-white/30 text-white px-6 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors"
              >
                Track Order
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <Stat icon={<Percent className="size-4" />}     title="5% back on every order"      desc="Earn hive points redeemable at checkout, every time you shop." />
            <Stat icon={<Clock className="size-4" />}       title="24/7 priority support"      desc="Real humans, every day — average reply under 5 minutes." />
            <Stat icon={<ShieldCheck className="size-4" />} title="Buyer protection"          desc="30-day returns, secure payments, money-back guarantee." />
            <Stat icon={<Gift className="size-4" />}        title="Member-only deals"          desc="Early access to drops, flash sales, and exclusive bundles." />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl p-4 flex gap-3 items-start hover:bg-white/15 transition-colors">
      <div className="size-9 rounded-lg bg-amber-hive/30 border border-amber-hive/40 text-amber-hive grid place-items-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-sm text-white">{title}</h4>
        <p className="text-white/70 text-xs mt-0.5">{desc}</p>
      </div>
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
