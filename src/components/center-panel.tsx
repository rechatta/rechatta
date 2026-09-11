"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  IconSparkle,
  IconClip,
  IconSliders,
  IconMic,
  IconArrowUp,
  IconChevron,
  IconCopy,
  IconThumbsUp,
  IconThumbsDown,
  IconWrench,
  IconLink,
} from "./icons";
import { RiChat1Line, RiEditFill, RiCompassDiscoverFill, RiFileLine, RiCloseLine, RiLoader4Line } from "@remixicon/react";
import { agents, agentBadgeColors, type AgentKey, type Artifact, type AttachmentPointer, type Message, type Source } from "@/lib/mock-data";
import type { StoredMessage } from "@/lib/chat-sessions";
import { ArtifactView } from "./artifact-view";
import { ArtifactChip } from "./artifact-chip";
import { StudioView } from "./studio-view";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Marker, MarkerIcon, MarkerContent } from "./ui/marker";
import { ScrollArea } from "./ui/scroll-area";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentGroup,
} from "./ui/attachment";

type ChatMetadata = { agent?: AgentKey; sources?: Source[] };
type ChatMessage = UIMessage<ChatMetadata>;
type ToolPart = { type: string; state?: string; output?: unknown };
type FilePartData = { type: string; filename?: string; mediaType?: string; path?: string; size?: number };
type PointerFilePart = { type: "file"; filename: string; mediaType: string; url: string; path: string; size: number };

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Re-hydrates messages loaded from the database into the shape useChat
// expects, including synthesizing a tool-output part for any saved artifact
// so toDisplayMessages's extraction logic doesn't need a separate code path.
function toSeedChatMessages(stored: StoredMessage[], sessionId: string): ChatMessage[] {
  return stored.map((m, i) => {
    const parts: unknown[] = [];
    if (m.content) parts.push({ type: "text", text: m.content });
    m.artifacts?.forEach((artifact, j) => {
      parts.push({
        type: "tool-createArtifact",
        toolCallId: `${sessionId}-${i}-${j}`,
        state: "output-available",
        // convertToModelMessages requires input on an output-available tool
        // part to reconstruct a valid tool_calls entry — the createArtifact
        // inputSchema is exactly {kind, title, content}, i.e. the artifact itself.
        input: artifact,
        output: artifact,
      });
    });
    // url is unused (files are never re-fetched from the client) — path is
    // what route.ts's withFilePointers reads to rebuild the model-visible pointer.
    m.files?.forEach((f) => {
      parts.push({ type: "file", filename: f.name, mediaType: f.mediaType, url: "", path: f.path, size: f.size });
    });
    return {
      id: `${sessionId}-${i}`,
      role: m.role,
      parts,
      metadata: { agent: m.agent },
    };
  }) as unknown as ChatMessage[];
}

function toDisplayMessages(messages: ChatMessage[], fallbackAgent: AgentKey): Message[] {
  return messages.map((m) => {
    const toolParts = (m.parts as ToolPart[]).filter((p) => p.type.startsWith("tool-"));
    const artifacts = toolParts
      .filter((p) => p.type === "tool-createArtifact" && p.state === "output-available")
      .map((p) => p.output as Artifact);
    const pending = toolParts.find((p) => p.state !== "output-available");
    const files = (m.parts as FilePartData[])
      .filter((p) => p.type === "file" && p.path)
      .map((p) => ({ name: p.filename ?? "file", mediaType: p.mediaType ?? "application/octet-stream", size: p.size ?? 0, path: p.path! }));

    return {
      role: m.role === "user" ? "user" : "assistant",
      content: m.parts
        .filter((p): p is Extract<ChatMessage["parts"][number], { type: "text" }> => p.type === "text")
        .map((p) => p.text)
        .join(""),
      agent: m.role === "assistant" ? (m.metadata?.agent ?? fallbackAgent) : undefined,
      sources: m.metadata?.sources,
      artifacts: artifacts.length > 0 ? artifacts : undefined,
      pendingTool: pending?.type.replace(/^tool-/, ""),
      files: files.length > 0 ? files : undefined,
    };
  });
}

const quickActions = [
  { icon: IconSparkle, title: "Ask an agent", desc: "Chat with any specialized AI agent instantly" },
  { icon: RiEditFill, title: "Improve prompt", desc: "Enhance your prompt automatically" },
  { icon: RiCompassDiscoverFill, title: "Explore agents", desc: "Browse curated agents for every task" },
];

function WelcomeView({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center [animation:fade-in_0.2s_ease-out_both]">
      <IconSparkle className="mb-3.5 size-[88px] animate-[drift_7s_ease-in-out_infinite] [&_path]:fill-[url(#sparkleGrad)]" />
      <h1 className="text-center text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-text-1">Welcome, {name}!</h1>
      <p className="mt-1.5 text-center text-[15px] text-text-2">Which agent should we bring in today?</p>

      <div className="mt-7.5 grid w-full max-w-[720px] grid-cols-3 gap-3.5 max-[860px]:grid-cols-1">
        {quickActions.map(({ icon: Icon, title, desc }) => (
          <Card
            key={title}
            className="gap-0 rounded-[26px] border-border p-4.5 shadow-card transition hover:-translate-y-0.5 hover:border-border-soft hover:shadow-card-hover"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-surface-inset text-text-1">
              <Icon className="size-[19px]" />
            </div>
            <div className="mb-1 text-[14.5px] font-bold text-text-1">{title}</div>
            <div className="text-[12.8px] leading-snug text-text-2">{desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssistantMessage({ message, onOpenArtifact }: { message: Message; onOpenArtifact: (artifact: Artifact) => void }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  function copy() {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  }
  const agent = agents.find((a) => a.key === message.agent);
  const badgeColors = message.agent && message.agent !== "auto" ? agentBadgeColors[message.agent] : undefined;

  return (
    <div className="[animation:fade-in_0.2s_ease-out_both]">
      {agent && badgeColors && (
        <div className="mb-1.5">
          <Badge
            className="rounded-full border-transparent font-semibold"
            style={{ background: badgeColors.bg, color: badgeColors.fg }}
          >
            {agent.name} agent
          </Badge>
        </div>
      )}
      {message.pendingTool && (
        <Marker className="mb-1.5 w-auto text-[12.5px]">
          <MarkerIcon>
            <span className="block size-1.5 animate-pulse rounded-full bg-sparkle-a" />
          </MarkerIcon>
          <MarkerContent>
            {message.pendingTool === "webSearch"
              ? "Searching the web…"
              : message.pendingTool === "runCode"
                ? "Running code…"
                : message.pendingTool === "readDocument"
                  ? "Reading document…"
                  : "Working…"}
          </MarkerContent>
        </Marker>
      )}
      {message.content && (
        <div className="inline-block max-w-[80%] min-w-0 [overflow-wrap:anywhere] rounded-2xl rounded-bl-md bg-surface-inset px-3.5 py-2.5 text-[13.8px] leading-relaxed text-text-1">
          {message.content}
        </div>
      )}
      {message.artifacts?.map((artifact, i) => (
        <ArtifactChip key={i} artifact={artifact} onOpen={() => onOpenArtifact(artifact)} />
      ))}
      <div className="mt-2 flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="size-7 rounded-lg text-text-3 hover:text-text-1" onClick={copy}>
              <IconCopy className="size-[15px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy response</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={`size-7 rounded-lg hover:text-text-1 ${feedback === "up" ? "bg-surface-inset text-text-1" : "text-text-3"}`}
              onClick={() => setFeedback((f) => (f === "up" ? null : "up"))}
            >
              <IconThumbsUp className="size-[15px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Good response</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={`size-7 rounded-lg hover:text-text-1 ${feedback === "down" ? "bg-surface-inset text-text-1" : "text-text-3"}`}
              onClick={() => setFeedback((f) => (f === "down" ? null : "down"))}
            >
              <IconThumbsDown className="size-[15px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bad response</TooltipContent>
        </Tooltip>
        <span className="flex-1" />
        {agent && message.sources && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 pl-2 text-[11.5px] font-semibold text-text-2 transition-colors duration-150 ease-out hover:bg-surface-hover hover:text-text-1">
                {message.sources.length} sources
                <IconChevron className="size-[15px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-[270px] rounded-xl p-2.5">
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
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function ThreadView({ messages, onOpenArtifact }: { messages: Message[]; onOpenArtifact: (artifact: Artifact) => void }) {
  return (
    <div className="flex w-full max-w-[720px] flex-col gap-4">
      {messages.map((message, i) =>
        message.role === "user" ? (
          <div key={i} className="flex flex-col items-end gap-1.5 [animation:fade-in_0.2s_ease-out_both]">
            {message.files && message.files.length > 0 && (
              <AttachmentGroup className="max-w-[80%] justify-end">
                {message.files.map((f, j) => (
                  <Attachment key={j} size="sm">
                    <AttachmentMedia>
                      <RiFileLine className="size-[14px]" />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle className="max-w-[160px] truncate">{f.name}</AttachmentTitle>
                      <AttachmentDescription>{formatFileSize(f.size)}</AttachmentDescription>
                    </AttachmentContent>
                  </Attachment>
                ))}
              </AttachmentGroup>
            )}
            {message.content && (
              <div className="max-w-[80%] min-w-0 [overflow-wrap:anywhere] rounded-2xl rounded-br-md bg-surface-inset px-3.5 py-2.5 text-[13.8px]">
                {message.content}
              </div>
            )}
          </div>
        ) : (
          <AssistantMessage key={i} message={message} onOpenArtifact={onOpenArtifact} />
        )
      )}
    </div>
  );
}

export function CenterPanel({
  mainView,
  activeSessionId,
  draftId,
  sessionMessages,
  onSessionStart,
  onSessionSaved,
  onNewChat,
  user,
}: {
  mainView: "chat" | "studio";
  activeSessionId: string | null;
  draftId: string;
  sessionMessages: StoredMessage[];
  onSessionStart: (id: string) => void;
  onSessionSaved: () => void;
  onNewChat: () => void;
  user: { name: string };
}) {
  const [agentKey, setAgentKey] = useState<AgentKey>("auto");
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<AttachmentPointer[]>([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const selectedAgent = agents.find((a) => a.key === agentKey)!;
  const sessionId = activeSessionId ?? draftId;

  // Ephemeral UI state — closes whichever artifact was open in the previous
  // session rather than carrying it over when the user switches chats.
  // Adjusted during render (React's documented pattern for resetting state
  // on a prop change) rather than an effect, to avoid a cascading extra render.
  const [openArtifact, setOpenArtifact] = useState<Artifact | null>(null);
  const [openArtifactSession, setOpenArtifactSession] = useState(sessionId);
  if (openArtifactSession !== sessionId) {
    setOpenArtifactSession(sessionId);
    setOpenArtifact(null);
  }

  const { messages, sendMessage, status, error } = useChat<ChatMessage>({
    id: sessionId,
    messages: toSeedChatMessages(sessionMessages, sessionId),
    transport: new DefaultChatTransport({ api: "/api/chat", body: () => ({ agentKey, sessionId }) }),
    onFinish: () => onSessionSaved(),
  });
  const displayMessages = toDisplayMessages(messages, agentKey);
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (error?.message === "Unauthorized") {
      toast.error("Your session expired. Please sign in again.");
      router.replace("/login");
    }
  }, [error, router]);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const form = new FormData();
          form.append("file", file);
          form.append("sessionId", sessionId);
          const res = await fetch("/api/attachments", { method: "POST", body: form });
          if (!res.ok) return null;
          return (await res.json()) as AttachmentPointer;
        })
      );
      const failed = uploaded.filter((p) => p === null).length;
      if (failed > 0) toast.error(failed === 1 ? "Failed to upload 1 file" : `Failed to upload ${failed} files`);
      setAttachments((prev) => [...prev, ...uploaded.filter((p): p is AttachmentPointer => p !== null)]);
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(path: string) {
    setAttachments((prev) => prev.filter((a) => a.path !== path));
    fetch("/api/attachments", { method: "DELETE", body: JSON.stringify({ path }) }).catch(() => {});
  }

  function submit() {
    const text = value.trim();
    if ((!text && attachments.length === 0) || isBusy || uploading) return;
    if (!activeSessionId) onSessionStart(draftId);
    // url is a placeholder — route.ts strips file parts before the model
    // ever sees them and reconstructs a path-based pointer instead.
    const files: PointerFilePart[] = attachments.map((a) => ({
      type: "file",
      filename: a.name,
      mediaType: a.mediaType,
      url: "",
      path: a.path,
      size: a.size,
    }));
    sendMessage(
      { text, files: files.length > 0 ? files : undefined },
      attachments.length > 0 ? { body: { attachments } } : undefined
    );
    setValue("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const chatColumn = (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5 min-[861px]:hidden">
        <SidebarTrigger className="size-9 text-text-1" />
        <span className="font-heading text-sm font-bold">Rechatta</span>
        <Button variant="ghost" size="icon" className="text-text-1" onClick={onNewChat} aria-label="Start new chat">
          <RiChat1Line className="size-[18px]" />
        </Button>
      </div>

      {mainView === "studio" ? (
        <StudioView />
      ) : (
        <div className="relative min-h-0 flex-1">
          {/* Fades content approaching the header/composer edges instead of
              the hard clip a plain overflow container leaves. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-surface to-transparent" />
          <ScrollArea className="h-full">
            <div className="flex min-h-0 flex-col items-center px-8 pb-4 pt-9">
              {displayMessages.length > 0 ? (
                <ThreadView messages={displayMessages} onOpenArtifact={setOpenArtifact} />
              ) : (
                <WelcomeView name={user.name} />
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {mainView === "chat" && (
      <div className="flex-none px-8 pb-6 pt-4.5">
        {error && error.message !== "Unauthorized" && (
          <p className="mx-auto mb-2 max-w-[720px] text-center text-[12.5px] text-red-500">{error.message}</p>
        )}
        <div className="mx-auto max-w-[720px] rounded-[22px] border border-border bg-surface px-3.5 pb-2.5 pt-3 shadow-card">
          {attachments.length > 0 && (
            <AttachmentGroup className="mb-2.5">
              {attachments.map((a) => (
                <Attachment key={a.path} size="sm" state={uploading ? "uploading" : "done"}>
                  <AttachmentMedia>
                    <RiFileLine className="size-[14px]" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle className="max-w-[160px] truncate">{a.name}</AttachmentTitle>
                    <AttachmentDescription>{formatFileSize(a.size)}</AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction onClick={() => removeAttachment(a.path)} aria-label={`Remove ${a.name}`}>
                      <RiCloseLine className="size-[13px]" />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}
          <div className="flex items-start gap-2.5">
            <IconSparkle className="mt-0.5 size-[18px] flex-none text-sparkle-a" />
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, or type @ to bring in an agent..."
              className="thin-scroll min-h-6 max-h-[120px] flex-1 resize-none border-none bg-transparent text-[14.5px] text-text-1 outline-none placeholder:text-text-3"
            />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-8.5 flex-none rounded-full text-text-2 hover:text-text-1"
                  aria-label="Attach file"
                  disabled={uploading}
                >
                  {uploading ? <RiLoader4Line className="size-[16px] animate-spin" /> : <IconClip className="size-[16px]" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[200px] rounded-xl p-1.5">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <IconClip className="size-[15px] flex-none" />
                  Upload from computer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu open={agentMenuOpen} onOpenChange={setAgentMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="pill-btn">
                  <span className="size-2.5 flex-none rounded-full" style={{ background: selectedAgent.color }} />
                  {selectedAgent.name}
                  <IconChevron className="size-[15px]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[190px] rounded-xl p-1.5">
                {agents.map((a) => (
                  <DropdownMenuItem key={a.key} className="items-start py-2 font-semibold" onClick={() => setAgentKey(a.key)}>
                    <span className="mt-1 size-2.5 flex-none rounded-full" style={{ background: a.color }} />
                    <span>
                      {a.name}
                      <span className="block text-[11px] font-normal text-text-3">{a.description}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="icon" className="size-8.5 flex-none rounded-full text-text-2 hover:text-text-1" aria-label="Options">
                  <IconSliders className="size-[16px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Options</TooltipContent>
            </Tooltip>
            <div className="flex-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" size="icon" className="size-8.5 rounded-full text-text-2 hover:text-text-1" aria-label="Voice input">
                  <IconMic className="size-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice input</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="orb size-8.5 rounded-full hover:bg-transparent disabled:opacity-40"
                  aria-label="Send message"
                  onClick={submit}
                  disabled={isBusy || uploading || (!value.trim() && attachments.length === 0)}
                >
                  {isBusy ? <Spinner className="size-[16px]" /> : <IconArrowUp className="size-[18px]" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      )}
    </div>
  );

  const showArtifact = mainView === "chat" && openArtifact;

  return (
    <SidebarInset className="relative min-h-0 min-w-0 bg-surface">
      {showArtifact ? (
        <>
          {/* Desktop: side-by-side resizable panels — drag the handle left to
              grow the artifact panel, same direction as before. */}
          <ResizablePanelGroup orientation="horizontal" className="hidden min-h-0 flex-1 min-[861px]:flex">
            <ResizablePanel minSize={480}>{chatColumn}</ResizablePanel>
            <ResizableHandle withHandle className="border-border bg-border" />
            <ResizablePanel defaultSize={560} minSize={400} maxSize={960} className="flex flex-col">
              <ArtifactView artifact={openArtifact} onClose={() => setOpenArtifact(null)} />
            </ResizablePanel>
          </ResizablePanelGroup>
          {/* Mobile: artifact is a full-screen overlay instead, so the chat
              column here just needs to fill the width on its own. */}
          <div className="flex min-h-0 flex-1 min-[861px]:hidden">{chatColumn}</div>
          <div className="fixed inset-0 z-40 flex flex-col bg-surface min-[861px]:hidden">
            <ArtifactView artifact={openArtifact} onClose={() => setOpenArtifact(null)} />
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1">{chatColumn}</div>
      )}
    </SidebarInset>
  );
}
