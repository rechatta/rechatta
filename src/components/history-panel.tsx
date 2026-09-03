"use client";

import { useMemo, useState } from "react";
import { IconPlus, IconSearch, IconArchive, IconTrash, IconX, IconCheck } from "./icons";
import { agentBadgeColors, sessions } from "@/lib/mock-data";

export function HistoryPanel({
  open,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: {
  open: boolean;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(
    () => sessions.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <aside
      className={`absolute z-[25] flex w-[340px] flex-col overflow-hidden rounded-[28px] border border-border-soft bg-surface
        top-5 right-5 bottom-5 [animation:pop-in_0.32s_cubic-bezier(0.16,1,0.3,1)_both] [transform-origin:top_right]
        max-[1180px]:top-3 max-[1180px]:right-3 max-[1180px]:bottom-3 max-[1180px]:w-[min(340px,86%)]
        max-[1180px]:animate-none max-[1180px]:transition-transform max-[1180px]:duration-200
        ${open ? "max-[1180px]:translate-x-0" : "max-[1180px]:translate-x-[calc(100%+24px)]"}`}
    >
      <div className="flex items-center justify-between px-4.5 pb-3 pt-5">
        <h2 className="text-base font-bold text-text-1">Chat history</h2>
        <button
          className="flex size-8.5 items-center justify-center rounded-full text-white shadow-deep-glow"
          style={{ background: "linear-gradient(135deg, var(--deep-a), var(--deep-c) 55%, var(--deep-b))" }}
          aria-label="New conversation"
          title="New conversation"
        >
          <IconPlus className="size-[18px]" />
        </button>
      </div>

      <div className="px-4.5 pb-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-inset px-3">
          <IconSearch className="size-[18px] flex-none text-text-3" />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-[13px] text-text-1 outline-none placeholder:text-text-3"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mx-4.5 mb-2.5 flex items-center justify-between rounded-xl bg-surface-inset px-3 py-2.5 text-[12.5px] font-semibold">
          <span>{selected.size} selected</span>
          <div className="flex gap-1">
            <button className="flex rounded-lg p-1.5 text-text-2 hover:bg-surface-hover hover:text-text-1" title="Archive selected">
              <IconArchive className="size-[15px]" />
            </button>
            <button className="flex rounded-lg p-1.5 text-text-2 hover:bg-surface-hover hover:text-text-1" title="Delete selected">
              <IconTrash className="size-[15px]" />
            </button>
            <button
              className="flex rounded-lg p-1.5 text-text-2 hover:bg-surface-hover hover:text-text-1"
              title="Clear selection"
              onClick={() => setSelected(new Set())}
            >
              <IconX className="size-[15px]" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3">
        {visible.map((session) => {
          const checked = selected.has(session.id);
          const active = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              className={`flex cursor-pointer gap-2.5 rounded-2xl p-2 hover:bg-surface-hover ${active ? "bg-surface-inset" : ""}`}
              onClick={() => onSelectSession(session.id)}
            >
              <button
                className={`mt-0.5 flex size-[17px] flex-none items-center justify-center rounded-md border transition-colors ${
                  checked ? "border-text-1 bg-text-1 text-surface" : "border-border bg-surface"
                }`}
                aria-label="Select conversation"
                title="Select for bulk actions"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(session.id);
                }}
              >
                {checked && <IconCheck className="size-[11px]" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-1.5">
                  <span className="truncate text-[13.4px] font-bold text-text-1">{session.title}</span>
                  <span className="flex-none font-mono text-[11px] text-text-3">{session.time}</span>
                </div>
                <div className="mt-0.5 truncate text-[12.2px] text-text-2">{session.description}</div>
                {session.preview && (
                  <div
                    className="mt-2.5 flex h-16 items-end gap-0.5 rounded-xl p-2.5"
                    style={{ background: "linear-gradient(135deg, var(--preview-a), var(--preview-b))" }}
                  >
                    {session.preview.map((h, i) => (
                      <span key={i} className="block w-1.5 rounded-t-sm bg-[rgba(21,21,26,0.55)]" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  {session.agents.map((key) => {
                    const colors = agentBadgeColors[key as Exclude<typeof key, "auto">];
                    return (
                      <span
                        key={key}
                        className="flex items-center gap-1 rounded-full py-0.5 pl-1.5 pr-2 text-[10.5px] font-bold capitalize"
                        style={{ background: colors.bg, color: colors.fg }}
                      >
                        <span className="size-1.5 rounded-full" style={{ background: colors.fg }} />
                        {key}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 pt-2">
        <button className="cta-pill" onClick={onNewChat}>
          <span className="cta-orb orb size-6">
            <IconPlus className="size-[15px]" />
          </span>
          <span className="cta-label">Create new chat</span>
        </button>
      </div>
    </aside>
  );
}
