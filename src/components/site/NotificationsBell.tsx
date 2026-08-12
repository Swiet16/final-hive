import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/hooks/use-role";

/**
 * Header bell. For customers: counts unread admin replies across their conversation(s).
 * For admins: counts conversations with unread customer messages.
 */
export function NotificationsBell() {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    let cancelled = false;

    async function refresh() {
      if (isAdmin) {
        const { data } = await supabase
          .from("chat_conversations" as any)
          .select("unread_admin");
        if (cancelled) return;
        const total = (data ?? []).reduce(
          (s: number, r: any) => s + (r.unread_admin ?? 0),
          0,
        );
        setCount(total);
      } else {
        const { data } = await supabase
          .from("chat_conversations" as any)
          .select("unread_customer")
          .eq("user_id", user!.id);
        if (cancelled) return;
        const total = (data ?? []).reduce(
          (s: number, r: any) => s + (r.unread_customer ?? 0),
          0,
        );
        setCount(total);
      }
    }
    refresh();

    const channel = supabase
      .channel(`bell-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  if (!user) return null;

  return (
    <div className="relative hidden sm:flex items-center" aria-label={`${count} unread messages`}>
      <Bell className="size-4 text-silver/70" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[1.05rem] h-[1.05rem] px-1 rounded-full bg-racing-red text-white text-[10px] font-bold grid place-items-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}
