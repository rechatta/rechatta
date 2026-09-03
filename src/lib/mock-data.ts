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

export type Source = { icon: "wrench" | "link"; label: string };

export type Message = {
  role: "user" | "assistant";
  content: string;
  agent?: AgentKey;
  sources?: Source[];
};

export type Session = {
  id: string;
  title: string;
  description: string;
  time: string;
  agents: AgentKey[];
  preview?: number[];
  messages?: Message[];
};

export const sessions: Session[] = [
  {
    id: "customer-feedback",
    title: "Customer feedback themes",
    description: "Clustering support tickets into recurring issues",
    time: "1d ago",
    agents: ["data"],
    messages: [
      { role: "user", content: "Summarize last week's support tickets by theme" },
      {
        role: "assistant",
        agent: "data",
        content:
          "Three themes stood out: billing confusion (38%), onboarding friction (29%), and API rate-limit questions (18%). Billing tickets spiked right after the Sept 1 pricing update.",
        sources: [
          { icon: "wrench", label: "Queried support_tickets.csv (1,204 rows)" },
          { icon: "wrench", label: "Zendesk API — last 7 days" },
          { icon: "link", label: "pricing-update-sept.md" },
        ],
      },
    ],
  },
  {
    id: "research-sprint",
    title: "Research sprint",
    description: "Comparing three market-entry strategies for the EU launch",
    time: "2h ago",
    agents: ["research"],
  },
  {
    id: "quarterly-report",
    title: "Quarterly report draft",
    description: "Drafting the Q3 investor summary with revenue charts",
    time: "3h ago",
    agents: ["writing", "data"],
    preview: [40, 70, 55, 90, 35],
  },
  {
    id: "code-review-checklist",
    title: "Code review checklist",
    description: "Refactoring the auth middleware and catching edge cases",
    time: "5h ago",
    agents: ["code"],
  },
];
