"use client";

import { useRef, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  IconSparkle,
  IconPencil,
  IconCompass,
  IconClip,
  IconSliders,
  IconMic,
  IconArrowUp,
  IconChevron,
  IconMenu,
  IconColumns,
  IconCopy,
  IconThumbsUp,
  IconThumbsDown,
  IconWrench,
  IconLink,
} from "./icons";
import { agents, sessions, type AgentKey, type Message, type Session, type Source } from "@/lib/mock-data";

type ChatMetadata = { agent?: AgentKey; sources?: Source[] };
type ChatMessage = UIMessage<ChatMetadata>;

function seedMessages(session?: Session): ChatMessage[] {
  if (!session?.messages) return [];
  return session.messages.map((m, i) => ({
    id: `${session.id}-${i}`,
    role: m.role,
    parts: [{ type: "text", text: m.content }],
    metadata: { agent: m.agent, sources: m.sources },
  }));
}

function toDisplayMessages(messages: ChatMessage[], fallbackAgent: AgentKey): Message[] {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.parts
      .filter((p): p is Extract<ChatMessage["parts"][number], { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join(""),
    agent: m.role === "assistant" ? (m.metadata?.agent ?? fallbackAgent) : undefined,
    sources: m.metadata?.sources,
  }));
}

const quickActions = [
  { icon: IconSparkle, title: "Ask an agent", desc: "Chat with any specialized AI agent instantly" },
  { icon: IconPencil, title: "Improve prompt", desc: "Enhance your prompt automatically" },
  { icon: IconCompass, title: "Explore agents", desc: "Browse curated agents for every task" },
];

function WelcomeView() {
  return (
    <>
      <IconSparkle className="mb-3.5 size-[88px] animate-[drift_7s_ease-in-out_infinite] [&_path]:fill-[url(#sparkleGrad)]" />
      <h1 className="text-center text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-text-1">Welcome, Maya!</h1>
      <p className="mt-1.5 text-center text-[15px] text-text-2">Which agent should we bring in today?</p>

      <div className="mt-7.5 grid w-full max-w-[720px] grid-cols-3 gap-3.5 max-[860px]:grid-cols-1">
        {quickActions.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            className="rounded-2xl border border-border bg-surface p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-border-soft hover:shadow-card-hover"
          >
            <div className="mb-3 flex size-8.5 items-center justify-center rounded-[10px] bg-surface-inset text-text-1">
              <Icon className="size-[18px]" />
            </div>
            <div className="mb-1 text-[14.5px] font-bold text-text-1">{title}</div>
            <div className="text-[12.8px] leading-snug text-text-2">{desc}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const agent = agents.find((a) => a.key === message.agent);

  return (
    <div>
      <div className="inline-block max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2.5 text-[13.8px] leading-relaxed text-text-1 shadow-card">
        {message.content}
      </div>
      <div className="mt-2 flex items-center gap-0.5">
        <button className="flex size-7 items-center justify-center rounded-lg text-text-3 hover:bg-surface-hover hover:text-text-1" title="Copy response">
          <IconCopy className="size-[15px]" />
        </button>
        <button
          className={`flex size-7 items-center justify-center rounded-lg hover:bg-surface-hover hover:text-text-1 ${feedback === "up" ? "bg-surface-inset text-text-1" : "text-text-3"}`}
          title="Good response"
          onClick={() => setFeedback((f) => (f === "up" ? null : "up"))}
        >
          <IconThumbsUp className="size-[15px]" />
        </button>
        <button
          className={`flex size-7 items-center justify-center rounded-lg hover:bg-surface-hover hover:text-text-1 ${feedback === "down" ? "bg-surface-inset text-text-1" : "text-text-3"}`}
          title="Bad response"
          onClick={() => setFeedback((f) => (f === "down" ? null : "down"))}
        >
          <IconThumbsDown className="size-[15px]" />
        </button>
        <span className="flex-1" />
        {agent && message.sources && (
          <div className="relative">
            <button
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 pl-2 text-[11.5px] font-semibold text-text-2 hover:bg-surface-hover hover:text-text-1"
              onClick={() => setSourceOpen((v) => !v)}
            >
              <span className="size-1.5 rounded-full" style={{ background: agent.color }} />
              {agent.name} agent · {message.sources.length} sources
              <IconChevron className="size-[15px]" />
            </button>
            {sourceOpen && (
              <div className="absolute bottom-[34px] right-0 z-40 flex w-[270px] flex-col gap-0.5 rounded-xl border border-border bg-surface p-2.5 shadow-card-hover">
                <div className="px-1 pb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-text-3">Tools used</div>
                {message.sources.map((source) => {
                  const Icon = source.icon === "link" ? IconLink : IconWrench;
                  return (
                    <div key={source.label} className="flex items-start gap-2 px-1 py-1.5 text-[12.2px] leading-snug text-text-2">
                      <Icon className="mt-px size-[15px] flex-none text-text-3" />
                      {source.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadView({ messages }: { messages: Message[] }) {
  return (
    <div className="flex w-full max-w-[720px] flex-col gap-4">
      {messages.map((message, i) =>
        message.role === "user" ? (
          <div key={i} className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md bg-surface-inset px-3.5 py-2.5 text-[13.8px]">{message.content}</div>
          </div>
        ) : (
          <AssistantMessage key={i} message={message} />
        )
      )}
    </div>
  );
}

export function CenterPanel({
  activeSessionId,
  onToggleSidebar,
  onToggleHistory,
}: {
  activeSessionId: string | null;
  onToggleSidebar: () => void;
  onToggleHistory: () => void;
}) {
  const [agentKey, setAgentKey] = useState<AgentKey>("auto");
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedAgent = agents.find((a) => a.key === agentKey)!;
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    id: activeSessionId ?? "draft",
    messages: seedMessages(activeSession),
    transport: new DefaultChatTransport({ api: "/api/chat", body: () => ({ agentKey }) }),
  });
  const displayMessages = toDisplayMessages(messages, agentKey);
  const isBusy = status === "submitted" || status === "streaming";

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function submit() {
    const text = value.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <main className="relative flex min-h-0 min-w-0 flex-col bg-surface min-[1181px]:pr-[360px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5 min-[1181px]:hidden">
        <button className="flex rounded-xl p-2 text-text-1 hover:bg-surface-hover" onClick={onToggleSidebar} aria-label="Open navigation" title="Open navigation">
          <IconMenu className="size-[18px]" />
        </button>
        <span className="font-heading text-sm font-bold">Rechatta</span>
        <button className="flex rounded-xl p-2 text-text-1 hover:bg-surface-hover" onClick={onToggleHistory} aria-label="Open chat history" title="Open chat history">
          <IconColumns className="size-[18px]" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-8 pb-4 pt-9">
        {displayMessages.length > 0 ? <ThreadView messages={displayMessages} /> : <WelcomeView />}
      </div>

      <div className="flex-none px-8 pb-6 pt-4.5">
        <div className="mx-auto max-w-[720px] rounded-[22px] border border-border bg-surface px-3.5 pb-2.5 pt-3 shadow-card">
          <div className="flex items-start gap-2.5">
            <IconSparkle className="mt-0.5 size-[18px] flex-none text-sparkle-a" />
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, or type @ to bring in an agent..."
              className="min-h-6 max-h-[120px] flex-1 resize-none border-none bg-transparent text-[14.5px] text-text-1 outline-none placeholder:text-text-3"
            />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button className="pill-btn">
              <IconClip className="size-[15px]" />
              Attach
            </button>
            <div className="relative">
              <button className="pill-btn" onClick={() => setAgentMenuOpen((v) => !v)}>
                <span className="size-2.5 flex-none rounded-full" style={{ background: selectedAgent.color }} />
                {selectedAgent.name}
                <IconChevron className="size-[15px]" />
              </button>
              {agentMenuOpen && (
                <div className="agent-menu-panel absolute bottom-[38px] left-0 z-40">
                  {agents.map((a) => (
                    <button
                      key={a.key}
                      className="agent-opt"
                      onClick={() => {
                        setAgentKey(a.key);
                        setAgentMenuOpen(false);
                      }}
                    >
                      <span className="size-2.5 flex-none rounded-full" style={{ background: a.color }} />
                      <span>
                        {a.name}
                        <span className="block text-[11px] font-normal text-text-3">{a.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="pill-btn">
              <IconSliders className="size-[15px]" />
              Options
            </button>
            <div className="flex-1" />
            <button className="flex size-8.5 items-center justify-center rounded-full bg-surface-inset text-text-2 hover:bg-surface-hover hover:text-text-1" aria-label="Voice input" title="Voice input">
              <IconMic className="size-[18px]" />
            </button>
            <button
              className="orb size-8.5 disabled:opacity-40"
              aria-label="Send message"
              title="Send message"
              onClick={submit}
              disabled={isBusy || !value.trim()}
            >
              <IconArrowUp className="size-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
