import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Sparkles, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type WelcomePopupSettings = {
  enabled: boolean;
  coupon_code: string;
  title: string;
  subtitle: string;
  cta: string;
};

const STORAGE_KEY = "lh_welcome_popup_seen_v1";

export function WelcomePopup() {
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState<WelcomePopupSettings | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    let cancelled = false;
    (async () => {
      const [{ data: setting }, { count }] = await Promise.all([
        supabase.from("site_settings" as any).select("value").eq("key", "welcome_popup").maybeSingle(),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (cancelled) return;
      const s = (setting as any)?.value as WelcomePopupSettings | undefined;
      if (!s?.enabled) return;
      if ((count ?? 0) > 0) return; // not a "new" user — they've already ordered
      setSettings(s);
      setOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  function dismiss() {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  async function claim() {
    if (!settings) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(settings.coupon_code);
      }
      toast.success(`Coupon ${settings.coupon_code} copied — apply it at checkout`);
    } catch {
      toast.success(`Use coupon ${settings.coupon_code} at checkout`);
    }
    dismiss();
  }

  if (!open || !settings) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-scale-in">
      <button
        type="button"
        aria-label="Close"
        onClick={dismiss}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md bg-card border border-hive/30 rounded-3xl p-8 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 size-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
          aria-label="Close popup"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-hive font-bold mb-4">
          <Sparkles className="size-3" /> Welcome offer
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight">
          {settings.title}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">{settings.subtitle}</p>

        <div className="mt-6 flex items-center justify-between bg-hive/10 border-2 border-dashed border-hive/40 rounded-2xl px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your code</p>
            <p className="font-mono text-2xl text-hive font-bold">{settings.coupon_code}</p>
          </div>
          <Tag className="size-7 text-hive/70" />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={claim}
            className="flex-1 bg-hive text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-hive-dark transition-colors"
          >
            {settings.cta}
          </button>
          <Link
            to="/shop"
            onClick={dismiss}
            className="flex-1 text-center border border-border py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:border-hive hover:text-hive transition-colors"
          >
            Shop now
          </Link>
        </div>

        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 text-center">
          Apply the code at checkout
        </p>
      </div>
    </div>
  );
}
