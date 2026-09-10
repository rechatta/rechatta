import { createClient } from "@/lib/supabase/server";
import type { StoredMessage } from "@/lib/chat-sessions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // RLS scopes chat_messages to sessions owned by the current user, so a
  // foreign session id just yields an empty array here, not another user's data.
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, agent, artifacts")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const messages: StoredMessage[] = data.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
    agent: m.agent ?? undefined,
    artifacts: m.artifacts ?? undefined,
  }));

  return Response.json(messages);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { favorite }: { favorite: boolean } = await req.json();

  // RLS's own-sessions policy scopes this update to the current user, so a
  // foreign session id just matches zero rows rather than editing someone else's.
  const { error } = await supabase.from("chat_sessions").update({ favorite }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // chat_messages cascades via its FK; RLS scopes this to the current user's own session.
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
