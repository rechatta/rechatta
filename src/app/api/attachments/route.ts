import { createClient } from "@/lib/supabase/server";
import type { AttachmentPointer } from "@/lib/mock-data";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB — matches common chat-composer limits (Cohere, ChatGPT)

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const sessionId = form.get("sessionId");
  if (!(file instanceof File) || typeof sessionId !== "string") {
    return Response.json({ error: "Missing file or sessionId" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File exceeds 20MB limit" }, { status: 413 });
  }

  // RLS on storage.objects requires the first path segment to match auth.uid().
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${user.id}/${sessionId}/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from("chat-attachments")
    .upload(path, await file.arrayBuffer(), { contentType: file.type || "application/octet-stream" });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const pointer: AttachmentPointer = {
    name: file.name,
    mediaType: file.type || "application/octet-stream",
    size: file.size,
    path,
  };
  return Response.json(pointer);
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { path } = (await req.json()) as { path?: string };
  if (!path || !path.startsWith(`${user.id}/`)) {
    return Response.json({ error: "Invalid path" }, { status: 400 });
  }

  const { error } = await supabase.storage.from("chat-attachments").remove([path]);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
