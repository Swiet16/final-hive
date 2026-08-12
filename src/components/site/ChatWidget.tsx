import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, X, Send, Loader2, ChevronLeft, HelpCircle, CheckCircle2 } from "lucide-react";

type Conversation = {
  id: string;
  user_id: string;
  customer_name: string;
  status: string;
  category: string;
  subject: string;
  ticket_number: string;
  assigned_admin_name: string | null;
  last_message: string;
  last_message_at: string;
  unread_customer: number;
  closed_at: string | null;
};
type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "customer" | "admin";
  sender_name: string;
  body: string;
  created_at: string;
};

const CATEGORIES = [
  { value: "Account", label: "Account & login", emoji: "👤" },
  { value: "Discount", label: "Coupons & discounts", emoji: "🏷️" },
  { value: "Order", label: "Order issue", emoji: "📦" },
  { value: "Shipping", label: "Shipping & tracking", emoji: "🚚" },
  { value: "Product", label: "Product question", emoji: "🛞" },
  { value: "Other", label: "Something else", emoji: "💬" },
];

type View = "list" | "newTicket" | "ticket";

export function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [creating, setCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!open || !user) return;
    loadConversations();
    const ch = supabase
      .channel(`user-convs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations", filter: `user_id=eq.${user.id}` },
        () => loadConversations(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  async function loadConversations() {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });
    setConversations((data ?? []) as any);
  }

  // Load messages for active
  useEffect(() => {
    if (!active?.id) return;
    supabase
      .from("chat_messages" as any)
      .select("*")
      .eq("conversation_id", active.id)
      .order("created_at")
      .then(({ data }: any) => setMessages((data ?? []) as any));

    supabase
      .from("chat_conversations" as any)
      .update({ unread_customer: 0 })
      .eq("id", active.id)
      .then(() => {});

    const channel = supabase
      .channel(`chat-${active.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${active.id}` },
        (payload: any) => setMessages((m) => [...m, payload.new as Message]),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_conversations", filter: `id=eq.${active.id}` },
        (payload: any) => setActive((c) => (c ? { ...c, ...(payload.new as Conversation) } : c)),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [active?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function createTicket() {
    if (!user || !category) return;
    // Hard guard: one open ticket per customer
    const { data: existing } = await supabase
      .from("chat_conversations" as any)
      .select("id")
      .eq("user_id", user.id)
      .neq("status", "closed")
      .limit(1);
    if (existing && existing.length > 0) {
      await loadConversations();
      setView("list");
      return;
    }
    setCreating(true);
    const subj = subject.trim() || `${category} request`;
    const { data, error } = await supabase
      .from("chat_conversations" as any)
      .insert({
        user_id: user.id,
        customer_name: user.email?.split("@")[0] ?? "Customer",
        category,
        subject: subj,
        last_message: subj,
        unread_admin: 1,
        status: "open",
      })
      .select()
      .single();
    setCreating(false);
    if (error || !data) {
      if (error) console.error("createTicket error", error);
      return;
    }
    const conv = data as any as Conversation;
    await supabase.from("chat_messages" as any).insert({
      conversation_id: conv.id,
      sender_id: user.id,
      sender_role: "customer",
      sender_name: conv.customer_name,
      body: subj,
    });
    setActive(conv);
    setView("ticket");
    setCategory("");
    setSubject("");
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user || !active || active.status === "closed") return;
    setSending(true);
    const body = text.trim();
    setText("");
    const { error } = await supabase.from("chat_messages" as any).insert({
      conversation_id: active.id,
      sender_id: user.id,
      sender_role: "customer",
      sender_name: active.customer_name,
      body,
    });
    if (!error) {
      await supabase
        .from("chat_conversations" as any)
        .update({
          last_message: body,
          last_message_at: new Date().toISOString(),
          unread_admin: (active.unread_customer ?? 0) + 1,
        })
        .eq("id", active.id);
    }
    setSending(false);
  }

  if (!user) return null;

  const openTickets = conversations.filter((c) => c.status !== "closed");
  const closedTickets = conversations.filter((c) => c.status === "closed");
  const totalUnread = conversations.reduce((n, c) => n + (c.unread_customer || 0), 0);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-racing-red text-white grid place-items-center shadow-2xl shadow-racing-red/40 hover:scale-105 transition-transform"
          aria-label="Open chat"
        >
          <MessageCircle className="size-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-racing-red text-[10px] font-bold rounded-full size-5 grid place-items-center border-2 border-racing-red">
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-br from-graphite/80 to-onyx/60">
            <div className="flex items-center gap-2">
              {view !== "list" && (
                <button onClick={() => { setView("list"); setActive(null); }} className="size-7 rounded-full hover:bg-secondary/40 grid place-items-center" aria-label="Back">
                  <ChevronLeft className="size-4" />
                </button>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-racing-red font-bold">Help Center</p>
                <p className="text-sm font-semibold mt-0.5">
                  {view === "ticket" && active ? `${active.ticket_number}` : view === "newTicket" ? "New ticket" : "Your tickets"}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="size-8 rounded-full hover:bg-secondary/40 grid place-items-center" aria-label="Close chat">
              <X className="size-4" />
            </button>
          </div>

          {/* List view */}
          {view === "list" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <button
                  onClick={() => {
                    if (openTickets.length > 0) {
                      setActive(openTickets[0]);
                      setView("ticket");
                      return;
                    }
                    setView("newTicket");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-racing-red text-white py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover-glow"
                >
                  <HelpCircle className="size-4" />
                  {openTickets.length > 0 ? "Continue your open ticket" : "Start new ticket"}
                </button>
                {openTickets.length > 0 && (
                  <p className="text-[10px] text-silver/50 mt-2 text-center">
                    One open ticket at a time — resolve this one first, then you can start a new one.
                  </p>
                )}
              </div>

              {openTickets.length > 0 && (
                <div>
                  <p className="px-4 text-[10px] uppercase tracking-widest text-silver/50 mb-2">Open ({openTickets.length})</p>
                  {openTickets.map((c) => (
                    <TicketItem key={c.id} conv={c} onSelect={() => { setActive(c); setView("ticket"); }} />
                  ))}
                </div>
              )}

              {closedTickets.length > 0 && (
                <div className="mt-4">
                  <p className="px-4 text-[10px] uppercase tracking-widest text-silver/50 mb-2">Resolved ({closedTickets.length})</p>
                  {closedTickets.map((c) => (
                    <TicketItem key={c.id} conv={c} onSelect={() => { setActive(c); setView("ticket"); }} closed />
                  ))}
                </div>
              )}

              {conversations.length === 0 && (
                <p className="text-xs text-silver/50 text-center mt-8 px-4">No tickets yet — start one anytime.</p>
              )}
            </div>
          )}

          {/* New ticket view */}
          {view === "newTicket" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-xs text-silver/70">Pick a topic so we can route you to the right specialist.</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`text-left p-3 rounded-sm border transition-colors ${
                      category === c.value ? "border-racing-red bg-racing-red/5" : "border-border hover:border-racing-red/50"
                    }`}
                  >
                    <span className="text-lg">{c.emoji}</span>
                    <p className="text-[11px] mt-1 font-medium leading-tight">{c.label}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-silver/50">Brief subject (optional)</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Can't apply my coupon"
                  maxLength={120}
                  className="mt-1.5 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-racing-red"
                />
              </div>
              <button
                onClick={createTicket}
                disabled={!category || creating}
                className="w-full bg-racing-red text-white py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest disabled:opacity-50"
              >
                {creating ? "Creating…" : "Open ticket"}
              </button>
            </div>
          )}

          {/* Ticket view */}
          {view === "ticket" && active && (
            <>
              <div className="px-4 py-2 border-b border-border bg-onyx/40 text-[11px]">
                <span className="text-silver/60">{active.category} · </span>
                <span className="font-medium">{active.subject || "(no subject)"}</span>
                {active.assigned_admin_name && (
                  <p className="text-[10px] text-emerald-400 mt-0.5">→ {active.assigned_admin_name}</p>
                )}
              </div>
              {active.status === "closed" && (
                <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="size-3.5" /> This ticket is resolved. Start a new one if you need more help.
                </div>
              )}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-xs text-silver/50 text-center mt-8">No messages yet.</p>}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_role === "customer" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.sender_role === "customer" ? "bg-racing-red text-white rounded-br-sm" : "bg-secondary/60 rounded-bl-sm"
                      }`}
                    >
                      {m.sender_role === "admin" && (
                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-0.5">{m.sender_name || "Support"}</p>
                      )}
                      <p className="leading-snug whitespace-pre-wrap break-words">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              {active.status !== "closed" && (
                <form onSubmit={send} className="border-t border-border p-2 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 bg-secondary/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-racing-red"
                  />
                  <button type="submit" disabled={sending || !text.trim()} className="size-9 rounded-full bg-racing-red text-white grid place-items-center disabled:opacity-50">
                    {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

function TicketItem({ conv, onSelect, closed }: { conv: Conversation; onSelect: () => void; closed?: boolean }) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-3 border-b border-border/60 hover:bg-onyx/40 transition-colors"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-racing-red">{conv.category}</span>
            <span className="text-[10px] text-silver/40 font-mono">{conv.ticket_number}</span>
          </div>
          <p className="text-sm font-medium truncate mt-0.5">{conv.subject || conv.last_message || "—"}</p>
          <p className="text-[11px] text-silver/50 truncate">{conv.last_message || "No replies yet"}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {conv.unread_customer > 0 && !closed && (
            <span className="bg-racing-red text-white text-[9px] rounded-full size-4 grid place-items-center">{conv.unread_customer}</span>
          )}
          {closed && <CheckCircle2 className="size-3.5 text-emerald-400" />}
        </div>
      </div>
    </button>
  );
}
