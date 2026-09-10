"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RiSearchLine, RiChat1Line } from "@remixicon/react";
import type { ChatSessionSummary } from "@/lib/chat-sessions";

export function CommandPalette({
  sessions,
  onClose,
  onSelectSession,
  onNewChat,
}: {
  sessions: ChatSessionSummary[];
  onClose: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Mounted only while open (see AppShell), so a fresh instance already
  // starts with an empty query — no reset-on-open effect needed.
  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  const results = useMemo(
    () => sessions.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase())),
    [query, sessions]
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[rgba(15,15,18,0.4)] px-4 pt-[14vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] overflow-hidden rounded-[22px] border border-border-soft bg-surface shadow-card-hover [animation:pop-in_0.2s_cubic-bezier(0.16,1,0.3,1)_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <RiSearchLine className="size-[18px] flex-none text-text-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-text-1 outline-none placeholder:text-text-3"
          />
          <kbd className="flex-none rounded-md border border-border bg-surface-inset px-1.5 py-0.5 font-mono text-[10.5px] text-text-3">
            Esc
          </kbd>
        </div>

        <div className="flex flex-col gap-0.5 p-2">
          <button
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[13.4px] font-semibold text-text-1 transition-colors duration-150 ease-out hover:bg-surface-hover"
            onClick={() => {
              onNewChat();
              onClose();
            }}
          >
            <span className="orb size-6 flex-none">
              <RiChat1Line className="size-[13px]" />
            </span>
            Start new chat
          </button>

          {results.length > 0 && (
            <>
              <div className="px-2.5 pb-1 pt-2.5 text-[10.5px] font-bold uppercase tracking-wide text-text-3">
                Chats
              </div>
              <div className="flex max-h-[320px] flex-col gap-0.5 overflow-y-auto">
                {results.map((session) => (
                  <button
                    key={session.id}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-surface-hover"
                    onClick={() => {
                      onSelectSession(session.id);
                      onClose();
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span className="truncate text-[13.2px] font-medium text-text-1">{session.title}</span>
                        <span className="flex-none font-mono text-[10.5px] text-text-3">{session.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {query.trim() && results.length === 0 && (
            <p className="px-2.5 py-3 text-center text-[12.8px] text-text-3">No chats match &ldquo;{query}&rdquo;</p>
          )}
        </div>
      </div>
    </div>
  );
}
