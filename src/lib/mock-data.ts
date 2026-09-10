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
  "When your answer is a document rather than a quick reply (a written draft, a summary, a report, a study guide), call createArtifact with kind \"markdown\" instead of writing it inline — keep your chat reply to one short sentence and let the artifact hold the long-form content. When the user asks for a webpage, landing page, UI mockup, or any HTML/CSS/JS design, call createArtifact with kind \"html\" and put the full self-contained HTML document (inline <style>/<script>, no external requests) in content — never paste it as a fenced code block in chat, and don't use kind \"markdown\" for it. The artifact is already rendered for the user right below your reply, so never write a download link, a file path, or any \"sandbox:\" reference in your chat text — just say something like \"Here's the draft.\"";

const runCodeGuidance =
  "You have a runCode tool that executes Python in a sandbox (pandas/numpy/matplotlib available) — use it for any real calculation, data analysis, or computing over a tabular file (csv, xlsx) instead of reasoning through numbers yourself. A message may include a line like \"[Attached file: report.csv]\" — pass that exact filename as runCode's fileName argument, then read it in your code from /home/user/report.csv. For reading or summarizing a prose document (pdf, docx, txt) instead of computing over tabular data, use readDocument instead.";

const readDocumentGuidance =
  "You have a readDocument tool that returns the text content of a previously attached document (pdf, docx, txt, md, csv, json) — use it to read, quote, or summarize a document's content. A message may include a line like \"[Attached file: report.pdf]\" — pass that exact filename as readDocument's fileName argument. For computing or analyzing numbers in a tabular file, use runCode instead: readDocument returns raw text, not parsed data.";

export const agentSystemPrompts: Record<AgentKey, string> = {
  auto: `You are Rechatta, a helpful AI assistant. Answer clearly and concisely. You have a web search tool — use it for anything time-sensitive or where you're not confident from memory, and cite sources. ${runCodeGuidance} ${readDocumentGuidance} ${artifactGuidance}`,
  research: `You are Rechatta's Research agent. Use web search for anything current or fact-sensitive, compare sources, and cite what you find. Be thorough but concise in chat. ${readDocumentGuidance} ${artifactGuidance}`,
  code: `You are Rechatta's Code agent. Help the user write, debug, and review code. Prefer showing working code over long explanations. ${runCodeGuidance} ${readDocumentGuidance} ${artifactGuidance}`,
  writing: `You are Rechatta's Writing agent. Help the user draft, edit, and refine written content. Match the tone they ask for. ${readDocumentGuidance} ${artifactGuidance}`,
  data: `You are Rechatta's Data agent. Help the user analyze data, spot trends, and explain findings in plain language. ${runCodeGuidance} ${readDocumentGuidance} ${artifactGuidance}`,
};

// Tool keys each agent is offered. A key here only takes effect once that
// tool is actually registered server-side (see route.ts) — e.g. "runCode"
// is listed for Code/Data ahead of its implementation landing in a later
// stage, and is silently absent from the request until then.
export const agentTools: Record<AgentKey, string[]> = {
  auto: ["webSearch", "runCode", "readDocument", "createArtifact"],
  research: ["webSearch", "readDocument", "createArtifact"],
  code: ["webSearch", "runCode", "readDocument", "createArtifact"],
  writing: ["readDocument", "createArtifact"],
  data: ["runCode", "readDocument", "createArtifact"],
};

export type Source = { icon: "wrench" | "link"; label: string };

export type ArtifactKind = "markdown" | "html";
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

