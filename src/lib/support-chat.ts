import { supabase } from "@/integrations/supabase/client";

/**
 * Create a fresh ticket (chat conversation) and post a message captured from a
 * public form (financing / contact). One ticket per submission — never reuses
 * an existing conversation so admins can resolve and close each independently.
 */
export async function postFormToChat(opts: {
  userId: string;
  customerName: string;
  kind: "Financing" | "Contact";
  fields: Record<string, string | number | undefined | null>;
  message?: string;
}) {
  const { userId, customerName, kind, fields, message } = opts;

  const subject = kind === "Financing" ? "Financing application" : "Contact request";

  const { data: created, error } = await supabase
    .from("chat_conversations" as any)
    .insert({
      user_id: userId,
      customer_name: customerName,
      category: kind,
      subject,
      last_message: "",
      unread_admin: 1,
      status: "open",
    })
    .select("id")
    .single();
  if (error) throw error;
  const convId = (created as any).id;

  const lines = [
    `📩 New ${kind} request`,
    ...Object.entries(fields)
      .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
      .map(([k, v]) => `• ${k}: ${v}`),
  ];
  if (message?.trim()) lines.push("", message.trim());
  const body = lines.join("\n");

  const { error: msgErr } = await supabase.from("chat_messages" as any).insert({
    conversation_id: convId,
    sender_id: userId,
    sender_role: "customer",
    sender_name: customerName,
    body,
  });
  if (msgErr) throw msgErr;

  await supabase
    .from("chat_conversations" as any)
    .update({
      last_message: body.slice(0, 140),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", convId);

  return convId as string;
}
