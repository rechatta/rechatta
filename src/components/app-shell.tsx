"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Sidebar } from "./sidebar";
import { CenterPanel } from "./center-panel";
import { CommandPalette } from "./command-palette";
import { SettingsModal } from "./settings-modal";
import { SvgDefs } from "./svg-defs";
import { SidebarProvider } from "./ui/sidebar";
import type { AuthUser } from "@/lib/auth-user";
import type { ChatSessionSummary, StoredMessage } from "@/lib/chat-sessions";

type MainView = "chat" | "studio";

const COLLAPSE_KEY = "rechatta-sidebar-collapsed";
const collapseListeners = new Set<() => void>();

function subscribeCollapse(onChange: () => void) {
  collapseListeners.add(onChange);
  return () => collapseListeners.delete(onChange);
}
function getCollapseSnapshot() {
  return window.localStorage.getItem(COLLAPSE_KEY) === "true";
}
function getCollapseServerSnapshot() {
  return false;
}
function setCollapsed(value: boolean) {
  window.localStorage.setItem(COLLAPSE_KEY, String(value));
  collapseListeners.forEach((onChange) => onChange());
}

export function AppShell({ user }: { user: AuthUser }) {
  const sidebarCollapsed = useSyncExternalStore(subscribeCollapse, getCollapseSnapshot, getCollapseServerSnapshot);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  // A fresh id for the next unsaved draft. Sent to the server as the real
  // session id from the first message, then promoted into activeSessionId —
  // there's no separate "create session" round trip.
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<StoredMessage[]>([]);
  const [mainView, setMainView] = useState<MainView>("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refreshSessions = useCallback(async () => {
    const res = await fetch("/api/sessions");
    if (res.ok) setSessions(await res.json());
    setSessionsLoaded(true);
  }, []);

  useEffect(() => {
    // One-shot fetch on mount; no external-store equivalent here without
    // adding a data-fetching library for a single GET endpoint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSessions();
  }, [refreshSessions]);

  function startNewChat() {
    setActiveSessionId(null);
    setSessionMessages([]);
    setDraftId(crypto.randomUUID());
    setMainView("chat");
  }

  // Fetches history before flipping activeSessionId, so CenterPanel's
  // useChat always mounts a new session id with its seed data already in
  // hand — no empty-then-repopulate flash, no effect-ordering hazard.
  async function selectSession(id: string) {
    const res = await fetch(`/api/sessions/${id}`);
    setSessionMessages(res.ok ? await res.json() : []);
    setActiveSessionId(id);
    setMainView("chat");
  }

  async function toggleFavorite(id: string, favorite: boolean) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, favorite } : s)));
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite }),
    });
    refreshSessions();
  }

  async function deleteSession(id: string) {
    const title = sessions.find((s) => s.id === id)?.title ?? "Chat";
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (id === activeSessionId) startNewChat();
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    toast.success(`"${title}" deleted`);
  }

  // Escape-to-close is handled by Dialog itself now; only the cmd/ctrl+K
  // toggle still needs a global listener.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setCollapsed(!open)} className="h-full bg-surface">
        <Sidebar
          onNewChat={startNewChat}
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenStudio={() => setMainView("studio")}
          onOpenSettings={() => setSettingsOpen(true)}
          activeSessionId={activeSessionId}
          onSelectSession={selectSession}
          sessions={sessions}
          sessionsLoaded={sessionsLoaded}
          onToggleFavorite={toggleFavorite}
          onDeleteSession={deleteSession}
          user={user}
        />
        <CenterPanel
          mainView={mainView}
          activeSessionId={activeSessionId}
          draftId={draftId}
          sessionMessages={sessionMessages}
          onSessionStart={(id) => setActiveSessionId(id)}
          onSessionSaved={refreshSessions}
          onNewChat={startNewChat}
          user={user}
        />
      </SidebarProvider>

      {paletteOpen && (
        <CommandPalette
          sessions={sessions}
          onClose={() => setPaletteOpen(false)}
          onSelectSession={selectSession}
          onNewChat={startNewChat}
        />
      )}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      <SvgDefs />
    </div>
  );
}
