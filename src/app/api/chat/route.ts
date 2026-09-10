import { convertToModelMessages, isStepCount, streamText, type ToolSet, type UIMessage } from "ai";
import { chatModel } from "@/lib/ai/provider";
import { webSearch } from "@/lib/ai/tools/web-search";
import { createArtifact } from "@/lib/ai/tools/create-artifact";
import { agentSystemPrompts, agentTools, type AgentKey, type Artifact } from "@/lib/mock-data";
import { titleFromMessage } from "@/lib/chat-sessions";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

// Tools actually implemented so far. A key an agent is offered in
// agentTools but that isn't registered here yet (e.g. "runCode", landing in
// a later stage) is simply absent from the request.
function availableTools(): Record<string, ToolSet[string]> {
  const tools: Record<string, ToolSet[string]> = { createArtifact };
  if (process.env.TAVILY_API_KEY) tools.webSearch = webSearch;
  return tools;
}

function latestUserText(messages: UIMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last) return "";
  return last.parts
    .filter((p): p is Extract<UIMessage["parts"][number], { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages, agentKey, sessionId }: { messages: UIMessage[]; agentKey?: AgentKey; sessionId: string } =
    await req.json();
  const key = agentKey ?? "auto";

  const offered = new Set(agentTools[key]);
  const implemented = availableTools();
  const tools = Object.fromEntries(
    Object.entries(implemented).filter(([name]) => offered.has(name))
  ) as ToolSet;

  const userText = latestUserText(messages);

  // Created on the session's first turn; ignored (not overwritten) on later
  // turns for the same id, so the title stays whatever the first message set.
  await supabase
    .from("chat_sessions")
    .upsert(
      { id: sessionId, user_id: user.id, title: titleFromMessage(userText) },
      { onConflict: "id", ignoreDuplicates: true }
    );
  await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);

  if (userText) {
    await supabase.from("chat_messages").insert({ session_id: sessionId, role: "user", content: userText });
  }

  const result = streamText({
    model: chatModel,
    system: agentSystemPrompts[key],
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: isStepCount(6),
    onEnd: async (event) => {
      const artifacts = event.toolResults
        .filter((r) => r.toolName === "createArtifact")
        .map((r) => r.output as Artifact);
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "assistant",
        content: event.text,
        agent: key,
        artifacts: artifacts.length > 0 ? artifacts : null,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
