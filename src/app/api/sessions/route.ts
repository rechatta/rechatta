import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/chat-sessions";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, updated_at, favorite")
    .order("favorite", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json(
    data.map((s) => ({ id: s.id, title: s.title, time: relativeTime(s.updated_at), favorite: s.favorite }))
  );
}
