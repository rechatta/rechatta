"use client";

import { useState } from "react";
import {
  RiAppsLine,
  RiStackLine,
  RiArchiveLine,
  RiSettingsLine,
  RiSearchLine,
  RiMore2Fill,
  RiStarLine,
  RiStarFill,
  RiDeleteBin6Line,
  RiLogoutBoxRLine,
  RiSideBarLine,
  RiEditBoxLine,
} from "@remixicon/react";
import { IconSparkle } from "./icons";
import { Avatar, AvatarFallback, AvatarBadge } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { signOut } from "@/app/auth/actions";
import type { AuthUser } from "@/lib/auth-user";
import type { ChatSessionSummary } from "@/lib/chat-sessions";

const simpleNavItems = [
  { label: "Collections", icon: RiStackLine },
  { label: "Library", icon: RiArchiveLine },
];

export function Sidebar({
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
  const [deleteTarget, setDeleteTarget] = useState<ChatSessionSummary | null>(null);
  const { state, setOpenMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  // Every nav action also dismisses the mobile Sheet drawer — Sidebar's own
  // primitive, replacing the app's previous hand-rolled overlay/backdrop.
  function navigate(action: () => void) {
    action();
    setOpenMobile(false);
  }

  return (
    <>
    <ShadcnSidebar collapsible="icon" className="border-border">
      <SidebarHeader className="gap-0 px-2 pb-2.5 pt-2">
        <div className={`flex items-center gap-2.5 px-1.5 py-1 ${collapsed ? "flex-col gap-2" : ""}`}>
          {collapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="group/logo relative flex size-[30px] flex-none items-center justify-center rounded-[10px] text-white"
              style={{ background: "linear-gradient(135deg, var(--sparkle-a), var(--sparkle-b))" }}
            >
              <IconSparkle className="size-[16px] transition-opacity duration-150 group-hover/logo:opacity-0" />
              <RiSideBarLine className="absolute size-[16px] opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100" />
            </button>
          ) : (
            <>
              <span
                className="flex size-[30px] flex-none items-center justify-center rounded-[10px] text-white"
                style={{ background: "linear-gradient(135deg, var(--sparkle-a), var(--sparkle-b))" }}
              >
                <IconSparkle className="size-[16px]" />
              </span>
              <span className="font-heading text-[16.5px] font-bold tracking-tight text-text-1">Rechatta</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-7 text-text-3 hover:text-text-1"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
              >
                <RiSideBarLine className="size-[16px]" />
              </Button>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New chat" onClick={() => navigate(onNewChat)}>
              <RiEditBoxLine className="size-[18px] flex-none" />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Search chats" onClick={() => navigate(onOpenSearch)}>
              <RiSearchLine className="size-[18px]" />
              <span>Search chats</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarContent className="overflow-hidden">
       <ScrollArea className="min-h-0 flex-1">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Studio" onClick={() => navigate(onOpenStudio)}>
                <RiAppsLine className="size-[18px]" />
                <span>Studio</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {simpleNavItems.map(({ label, icon: Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  tooltip={label}
                  isActive={active === label}
                  onClick={() => navigate(() => setActive(label))}
                >
                  <Icon className="size-[18px]" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings" onClick={() => navigate(onOpenSettings)}>
                <RiSettingsLine className="size-[18px]" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {!collapsed && (
          <>
            {sessions.some((s) => s.favorite) && (
              <SidebarGroup>
                <SidebarGroupLabel>Favorites</SidebarGroupLabel>
                <SidebarMenu>
                  {sessions
                    .filter((s) => s.favorite)
                    .map((session) => (
                      <ChatRow
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={() => navigate(() => onSelectSession(session.id))}
                        onToggleFavorite={onToggleFavorite}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                </SidebarMenu>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel>Chats</SidebarGroupLabel>
              <SidebarMenu>
                {!sessionsLoaded && [0, 1, 2].map((i) => <Skeleton key={i} className="mx-1 h-8 rounded-md" />)}
                {sessionsLoaded && sessions.length === 0 && (
                  <p className="px-2 py-2 text-[12px] text-text-3">No chats yet</p>
                )}
                {sessions
                  .filter((s) => !s.favorite)
                  .map((session) => (
                    <ChatRow
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => navigate(() => onSelectSession(session.id))}
                      onToggleFavorite={onToggleFavorite}
                      onDelete={setDeleteTarget}
                    />
                  ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
       </ScrollArea>
      </SidebarContent>

      <SidebarFooter className={collapsed ? "items-center" : ""}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-xl p-1 text-left transition-colors duration-150 ease-out hover:bg-surface-hover">
              <Avatar className="flex-none bg-linear-to-br from-sparkle-a to-sparkle-b text-[12.5px] font-bold text-white">
                <AvatarFallback className="bg-transparent text-[12.5px] font-bold text-white">
                  {user.initials}
                </AvatarFallback>
                <AvatarBadge className="bg-[#2fb463] ring-surface-inset" />
              </Avatar>
              {!collapsed && (
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text-1">{user.name}</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-[220px] rounded-xl p-1.5">
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
        {!collapsed && (
          <button className="cta-pill">
            <span className="cta-orb orb size-6">
              <IconSparkle className="size-[15px]" />
            </span>
            <span className="cta-label">Upgrade now</span>
          </button>
        )}
      </SidebarFooter>
    </ShadcnSidebar>

    <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-text-1">Delete chat?</DialogTitle>
          <DialogDescription className="text-[13px] text-text-2">
            &ldquo;{deleteTarget?.title}&rdquo; will be permanently deleted. This can&rsquo;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleteTarget) onDeleteSession(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
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
  onDelete: (session: ChatSessionSummary) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} onClick={onSelect} className="pr-7">
        <span className="min-w-0 flex-1 truncate">{session.title}</span>
        <span className="flex-none font-mono text-[10.5px] text-text-3 group-hover/menu-item:hidden">
          {session.time}
        </span>
      </SidebarMenuButton>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            showOnHover
            className="text-text-3 hover:text-text-1 data-[state=open]:bg-surface-hover"
            onClick={(e) => e.stopPropagation()}
            aria-label="Chat options"
          >
            <RiMore2Fill className="size-[14px]" />
          </SidebarMenuAction>
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
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(session)}>
            <RiDeleteBin6Line className="size-[15px] flex-none" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
