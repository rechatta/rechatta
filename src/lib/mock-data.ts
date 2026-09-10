export type AgentKey = "auto" | "research" | "code" | "writing" | "data";

export const agents: { key: AgentKey; name: string; description: string; color: string }[] = [
  { key: "auto", name: "Auto", description: "Routes to the best agent", color: "var(--text-2)" },
  { key: "research", name: "Research", description: "Web + document analysis", color: "var(--agent-research)" },
  { key: "code", name: "Code", description: "Build & debug software", color: "var(--agent-code)" },
  { key: "writing", name: "Writing", description: "Drafts & editing", color: "var(--agent-writing)" },
  { key: "data", name: "Data", description: "Analysis & charts", color: "var(--agent-data)" },
];

export const agentBadgeColors: Record<Exclude<AgentKey, "auto">, { fg: string; bg: string }> = {
  research: { fg: "var(--agent-research)", bg: "var(--agent-research-bg)" },
  code: { fg: "var(--agent-code)", bg: "var(--agent-code-bg)" },
  writing: { fg: "var(--agent-writing)", bg: "var(--agent-writing-bg)" },
  data: { fg: "var(--agent-data)", bg: "var(--agent-data-bg)" },
};

const artifactGuidance =
  "When your answer is a document rather than a quick reply (a written draft, a summary, a report, a study guide), call createArtifact with kind \"markdown\" instead of writing it inline — keep your chat reply to one short sentence and let the artifact hold the long-form content. The artifact is already rendered for the user right below your reply, so never write a download link, a file path, or any \"sandbox:\" reference in your chat text — just say something like \"Here's the draft.\"";

export const agentSystemPrompts: Record<AgentKey, string> = {
  auto: `You are Rechatta, a helpful AI assistant. Answer clearly and concisely. You have a web search tool — use it for anything time-sensitive or where you're not confident from memory, and cite sources. ${artifactGuidance}`,
  research: `You are Rechatta's Research agent. Use web search for anything current or fact-sensitive, compare sources, and cite what you find. Be thorough but concise in chat. ${artifactGuidance}`,
  code: `You are Rechatta's Code agent. Help the user write, debug, and review code. Prefer showing working code over long explanations. ${artifactGuidance}`,
  writing: `You are Rechatta's Writing agent. Help the user draft, edit, and refine written content. Match the tone they ask for. ${artifactGuidance}`,
  data: `You are Rechatta's Data agent. Help the user analyze data, spot trends, and explain findings in plain language. ${artifactGuidance}`,
};

// Tool keys each agent is offered. A key here only takes effect once that
// tool is actually registered server-side (see route.ts) — e.g. "runCode"
// is listed for Code/Data ahead of its implementation landing in a later
// stage, and is silently absent from the request until then.
export const agentTools: Record<AgentKey, string[]> = {
  auto: ["webSearch", "runCode", "createArtifact"],
  research: ["webSearch", "createArtifact"],
  code: ["webSearch", "runCode", "createArtifact"],
  writing: ["createArtifact"],
  data: ["runCode", "createArtifact"],
};

export type Source = { icon: "wrench" | "link"; label: string };

export type ArtifactKind = "markdown";
export type Artifact = { kind: ArtifactKind; title: string; content: string };

// path is the permanent Supabase Storage object path ("{user_id}/{session_id}/...") —
// this is what runCode re-fetches a file by on a later turn, not the filename.
export type AttachmentPointer = { name: string; mediaType: string; size: number; path: string };

export type Message = {
  role: "user" | "assistant";
  content: string;
  agent?: AgentKey;
  sources?: Source[];
  artifacts?: Artifact[];
  pendingTool?: string;
  files?: AttachmentPointer[];
};

