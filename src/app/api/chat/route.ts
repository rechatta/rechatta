import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { chatModel } from "@/lib/ai/provider";
import { agentSystemPrompts, type AgentKey } from "@/lib/mock-data";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, agentKey }: { messages: UIMessage[]; agentKey?: AgentKey } = await req.json();

  const result = streamText({
    model: chatModel,
    system: agentSystemPrompts[agentKey ?? "auto"],
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
