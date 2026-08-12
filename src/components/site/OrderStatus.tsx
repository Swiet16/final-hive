// Reusable components for order status display across dashboard, track-order, and admin.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle2, Clock, XCircle, AlertCircle, Loader2, Lock,
  ClipboardCheck, Package, Truck, PackageCheck, MapPin,
} from "lucide-react";
import { ORDER_STAGES, STAGE_COLOR_CLASSES, stageInfo } from "@/lib/catalog";

// ────────────────────────────────────────────────────────────────────
// StatusPill — colored pill for a single status
// ────────────────────────────────────────────────────────────────────
export function StatusPill({ status, size = "sm" }: { status: string; size?: "xs" | "sm" | "md" }) {
  const info = stageInfo(status);
  const cls = STAGE_COLOR_CLASSES[info.color] || STAGE_COLOR_CLASSES.zinc;
  const sz = size === "xs" ? "text-[9px] px-2 py-0.5" : size === "md" ? "text-xs px-3 py-1" : "text-[10px] px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-full border ${cls} ${sz}`}>
      {status === "delivered" && <CheckCircle2 className="size-3" />}
      {status === "cancelled" && <XCircle className="size-3" />}
      {(status === "pending" || status === "on_hold") && <Clock className="size-3" />}
      {status === "otp_required" && <Lock className="size-3" />}
      {status === "review_declined" && <AlertCircle className="size-3" />}
      {status === "payment_processing" && <Loader2 className="size-3 animate-spin" />}
      {info.label}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────
// StatusTimeline — vertical timeline showing status history + admin notes
// Reads from `order_status_history` table.
// ────────────────────────────────────────────────────────────────────
export type StatusHistoryRow = {
  id: string;
  status: string;
  note: string | null;
  actor: string; // 'system' | 'admin' | 'customer'
  created_at: string;
  admin_name?: string | null;
};

const STAGE_ICON: Record<string, any> = {
  pending: Clock,
  payment_processing: Loader2,
  otp_required: Lock,
  otp_verified: CheckCircle2,
  confirmed: CheckCircle2,
  review_declined: XCircle,
  fraud_check: AlertCircle,
  processing: ClipboardCheck,
  quality_check: ClipboardCheck,
  packing: Package,
  ready_to_ship: PackageCheck,
  shipped: Truck,
  in_transit: Truck,
  out_for_delivery: MapPin,
  delivered: PackageCheck,
  delivery_failed: XCircle,
  returned: AlertCircle,
  return_requested: AlertCircle,
  return_approved: CheckCircle2,
  refunded: CheckCircle2,
  cancelled: XCircle,
  on_hold: Clock,
};

export function StatusTimeline({ history }: { history: StatusHistoryRow[] }) {
  if (!history || history.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No status updates yet.</p>;
  }
  return (
    <ol className="relative space-y-4 ml-2">
      {history.map((row, idx) => {
        const Icon = STAGE_ICON[row.status?.toLowerCase()] || Clock;
        const info = stageInfo(row.status);
        const isLast = idx === history.length - 1;
        return (
          <li key={row.id} className="relative pl-7 pb-1">
            {/* Vertical line */}
            {!isLast && (
              <span className="absolute left-2.5 top-6 bottom-0 w-px bg-border" />
            )}
            {/* Icon dot */}
            <span className={`absolute left-0 top-0 size-5 rounded-full grid place-items-center border-2 ${
              STAGE_COLOR_CLASSES[info.color] || STAGE_COLOR_CLASSES.zinc
            }`}>
              <Icon className="size-2.5" />
            </span>
            {/* Content */}
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <StatusPill status={row.status} />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(row.created_at).toLocaleString([], {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              {row.note && (
                <p className="text-xs text-muted-foreground mt-1.5 bg-secondary/60 border border-border rounded-lg px-3 py-2 break-words">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mr-1.5">
                    {row.actor === "admin" ? `Admin${row.admin_name ? ` · ${row.admin_name}` : ""}:` : row.actor === "customer" ? "Customer:" : "Note:"}
                  </span>
                  {row.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ────────────────────────────────────────────────────────────────────
// OTP entry form — shown on customer dashboard when order needs OTP.
// Customer enters the 6-digit code admin asked for, admin sees it.
// ────────────────────────────────────────────────────────────────────
export function OTPEntryForm({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const [otp, setOtp] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.trim();
    if (!/^\d{4,8}$/.test(code)) {
      toast.error("Please enter a valid 4–8 digit OTP");
      return;
    }
    setSaving(true);
    // Update order with the OTP, then push a status history note
    const { error: updErr } = await supabase
      .from("orders" as any)
      .update({ customer_otp: code, status: "otp_verified" } as any)
      .eq("id", orderId);
    if (updErr) { setSaving(false); return toast.error(updErr.message); }

    await supabase.from("order_status_history" as any).insert({
      order_id: orderId,
      status: "otp_verified",
      note: `Customer submitted OTP: ${code}`,
      actor: "customer",
    });

    setSaving(false);
    setSubmitted(true);
    toast.success("OTP submitted — admin will verify and continue your order.");
  }

  if (submitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm">
        <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="size-4" /> OTP submitted
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Admin will review your OTP and continue processing order <span className="font-mono font-semibold">{orderNumber}</span>. You'll see the next status update here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
      <div className="flex items-start gap-2 mb-3">
        <Lock className="size-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">OTP Verification Required</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            We've requested a one-time password from your bank or phone for security.
            Please enter the 4–8 digit code below — admin will verify it.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter OTP"
          inputMode="numeric"
          maxLength={8}
          className="flex-1 min-w-0 bg-background border border-border rounded-xl px-3 py-2.5 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        <button
          type="submit"
          disabled={saving || otp.length < 4}
          className="px-4 sm:px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Submit OTP"}
        </button>
      </form>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// useOrderStatusHistory — hook to load + subscribe to status history
// ────────────────────────────────────────────────────────────────────
export function useOrderStatusHistory(orderId: string | undefined) {
  const [history, setHistory] = useState<StatusHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("order_status_history" as any)
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (!cancelled) { setHistory((data as any) ?? []); setLoading(false); }
    })();
    const ch = supabase
      .channel(`order-status-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_status_history", filter: `order_id=eq.${orderId}` },
        (payload: any) => setHistory((h) => [...h, payload.new as StatusHistoryRow]),
      )
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [orderId]);

  return { history, loading };
}
