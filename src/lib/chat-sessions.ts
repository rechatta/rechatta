import type { AgentKey, Artifact } from "@/lib/mock-data";

export type ChatSessionSummary = {
  id: string;
  title: string;
  time: string;
  favorite: boolean;
};

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  agent?: AgentKey;
  artifacts?: Artifact[];
};

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function titleFromMessage(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed || "New chat";
}
