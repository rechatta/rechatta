"use client";

import { useState } from "react";
import {
  RiAppsLine,
  RiStackLine,
  RiArchiveLine,
  RiSettingsLine,
  RiChat1Line,
  RiSearchLine,
  RiSideBarLine,
  RiMore2Fill,
  RiStarLine,
  RiStarFill,
  RiDeleteBin6Line,
  RiLogoutBoxRLine,
} from "@remixicon/react";
import { IconSparkle } from "./icons";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarBadge } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "@/app/auth/actions";
import type { AuthUser } from "@/lib/auth-user";
import type { ChatSessionSummary } from "@/lib/chat-sessions";

const simpleNavItems = [
  { label: "Collections", icon: RiStackLine },
  { label: "Library", icon: RiArchiveLine },
];

export function Sidebar({
  open,
  collapsed,
  onToggleCollapse,
  onNavigate,
  onNewChat,
  onOpenSearch,
  onOpenStudio,
  onOpenSettings,
  activeSessionId,
  onSelectSession,
  sessions,
  sessionsLoaded,
  onToggleFavorite,
  onDeleteSession,
  user,
}: {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: () => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  onOpenStudio: () => void;
  onOpenSettings: () => void;
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  sessions: ChatSessionSummary[];
  sessionsLoaded: boolean;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onDeleteSession: (id: string) => void;
  user: AuthUser;
}) {
  const [active, setActive] = useState("");

  // Collapsed-only classes are gated to min-[861px]: so a persisted desktop
  // collapse never shrinks the mobile overlay drawer, which always renders
  // at full width regardless of this flag.
  const label = collapsed
    ? "min-[861px]:w-0 min-[861px]:opacity-0 min-[861px]:ml-0"
    : "w-auto opacity-100";
  const labelBase = "overflow-hidden whitespace-nowrap transition-[width,opacity,margin] duration-200 ease-out";
  const hideBlock = collapsed ? "min-[861px]:hidden" : "";
  // Horizontal inset for every section. The scroll container itself (below)
  // gets none of this, so its native scrollbar sits flush at the sidebar's
  // true right border instead of floating inset from it.
  const pad = `px-4 ${collapsed ? "min-[861px]:px-2.5" : ""}`;

  return (
    <aside
      className={`z-30 flex flex-col gap-1 overflow-x-hidden overflow-y-hidden border-r border-border bg-surface pb-4 pt-[22px]
        max-[860px]:absolute max-[860px]:inset-y-0 max-[860px]:left-0 max-[860px]:w-[min(260px,84%)]
        max-[860px]:shadow-[16px_0_40px_-20px_rgba(0,0,0,0.3)] max-[860px]:transition-transform max-[860px]:duration-200
        ${open ? "max-[860px]:translate-x-0" : "max-[860px]:-translate-x-full"}`}
    >
      <div className={`flex items-center gap-2.5 pb-4.5 pt-1 ${pad} ${collapsed ? "min-[861px]:flex-col min-[861px]:gap-2" : ""}`}>
        <span
          className="flex size-[30px] flex-none items-center justify-center rounded-[10px] text-white"
          style={{ background: "linear-gradient(135deg, var(--sparkle-a), var(--sparkle-b))" }}
        >
          <IconSparkle className="size-[16px]" />
        </span>
        <span className={`font-heading text-[16.5px] font-bold tracking-tight text-text-1 ${labelBase} ${label}`}>
          Rechatta
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={`ml-auto flex-none text-text-3 hover:text-text-1 ${collapsed ? "min-[861px]:ml-0" : ""}`}
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <RiSideBarLine className="size-[16px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
        </Tooltip>
      </div>

      <div className={`flex flex-col gap-1 ${pad}`}>
        <button
          className="nav-item"
          onClick={() => {
            onNewChat();
            onNavigate();
          }}
        >
          <span
            className="flex size-6 flex-none items-center justify-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg, var(--deep-a), var(--deep-c) 55%, var(--deep-b))" }}
          >
            <RiChat1Line className="size-[13px]" />
          </span>
          <span className={`${labelBase} ${label}`}>New chat</span>
        </button>

        <button className="nav-item" onClick={onOpenSearch}>
          <RiSearchLine className="size-[18px] flex-none" />
          <span className={`${labelBase} ${label}`}>Search chats</span>
        </button>
      </div>

      <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className={pad}>
          <nav className="mb-1.5 mt-1.5 flex flex-col gap-px">
            <button className="nav-item" title={collapsed ? "Studio" : undefined} onClick={onOpenStudio}>
              <RiAppsLine className="size-[18px] flex-none" />
              <span className={`${labelBase} ${label}`}>Studio</span>
            </button>

            {simpleNavItems.map(({ label: itemLabel, icon: Icon }) => (
              <button
                key={itemLabel}
                className="nav-item"
                aria-current={active === itemLabel ? "page" : undefined}
                title={collapsed ? itemLabel : undefined}
                onClick={() => {
                  setActive(itemLabel);
                  onNavigate();
                }}
              >
                <Icon className="size-[18px] flex-none" />
                <span className={`${labelBase} ${label}`}>{itemLabel}</span>
              </button>
            ))}

            <button className="nav-item" title={collapsed ? "Settings" : undefined} onClick={onOpenSettings}>
              <RiSettingsLine className="size-[18px] flex-none" />
              <span className={`${labelBase} ${label}`}>Settings</span>
            </button>
          </nav>

          <div className={hideBlock}>
            {sessions.some((s) => s.favorite) && (
              <>
                <div className="px-3 py-1.5 pt-3.5 text-[11px] font-bold uppercase tracking-wider text-text-3">
                  Favorites
                </div>
                <div className="flex flex-col gap-0.5">
                  {sessions
                    .filter((s) => s.favorite)
                    .map((session) => (
                      <ChatRow
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={() => {
                          onSelectSession(session.id);
                          onNavigate();
                        }}
                        onToggleFavorite={onToggleFavorite}
                        onDelete={onDeleteSession}
                      />
                    ))}
                </div>
              </>
            )}

            <div className="px-3 py-1.5 pt-3.5 text-[11px] font-bold uppercase tracking-wider text-text-3">Chats</div>
            <div className="flex flex-col gap-0.5">
              {!sessionsLoaded &&
                [0, 1, 2].map((i) => <Skeleton key={i} className="mx-3 my-1 h-[30px] rounded-lg" />)}
              {sessionsLoaded && sessions.length === 0 && (
                <p className="px-3 py-2 text-[12px] text-text-3">No chats yet</p>
              )}
              {sessions
                .filter((s) => !s.favorite)
                .map((session) => (
                  <ChatRow
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => {
                      onSelectSession(session.id);
                      onNavigate();
                    }}
                    onToggleFavorite={onToggleFavorite}
                    onDelete={onDeleteSession}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className={pad}>
        <div
          className={`mt-2.5 flex flex-col gap-2.5 rounded-2xl bg-surface-inset p-2.5 ${collapsed ? "min-[861px]:items-center min-[861px]:bg-transparent min-[861px]:p-0" : ""}`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-xl p-1 text-left transition-colors duration-150 ease-out hover:bg-surface-hover">
                <Avatar className="flex-none bg-linear-to-br from-sparkle-a to-sparkle-b text-[12.5px] font-bold text-white">
                  <AvatarFallback className="bg-transparent text-[12.5px] font-bold text-white">
                    {user.initials}
                  </AvatarFallback>
                  <AvatarBadge className="bg-[#2fb463] ring-surface-inset" />
                </Avatar>
                <span className={`min-w-0 flex-1 truncate text-[13px] font-semibold text-text-1 ${labelBase} ${label}`}>
                  {user.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-[220px] rounded-xl p-1.5">
              <div className="truncate px-2.5 py-2 text-[12px] text-text-3">{user.email}</div>
              <form action={signOut} className="w-full">
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full font-medium">
                    <RiLogoutBoxRLine className="size-[15px] flex-none" />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className={`cta-pill ${hideBlock}`}>
            <span className="cta-orb orb size-6">
              <IconSparkle className="size-[15px]" />
            </span>
            <span className="cta-label">Upgrade now</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function ChatRow({
  session,
  isActive,
  onSelect,
  onToggleFavorite,
  onDelete,
}: {
  session: ChatSessionSummary;
  isActive: boolean;
  onSelect: () => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`group relative flex w-full items-center gap-1 rounded-xl px-3 py-2 transition-colors duration-150 ease-out hover:bg-surface-hover ${isActive ? "bg-surface-inset" : ""}`}
    >
      <button className="min-w-0 flex-1 text-left" onClick={onSelect}>
        <span className="block truncate text-[12.8px] font-medium text-text-1">{session.title}</span>
      </button>
      <span className="flex-none font-mono text-[10.5px] text-text-3 group-hover:hidden">{session.time}</span>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className={`text-text-3 hover:text-text-1 ${menuOpen ? "flex" : "hidden group-hover:flex"}`}
            onClick={(e) => e.stopPropagation()}
            aria-label="Chat options"
          >
            <RiMore2Fill className="size-[14px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="w-[180px] rounded-xl p-1.5">
          <DropdownMenuItem onClick={() => onToggleFavorite(session.id, !session.favorite)}>
            {session.favorite ? (
              <RiStarFill className="size-[15px] flex-none text-sparkle-b" />
            ) : (
              <RiStarLine className="size-[15px] flex-none" />
            )}
            {session.favorite ? "Remove favorite" : "Add to favorites"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(session.id)}>
            <RiDeleteBin6Line className="size-[15px] flex-none" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
