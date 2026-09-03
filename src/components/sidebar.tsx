"use client";

import { useState } from "react";
import {
  IconSparkle,
  IconHome,
  IconLayers,
  IconStack,
  IconLibrary,
  IconDatabase,
  IconBarChart,
  IconBell,
  IconGear,
  IconChevron,
  IconBot,
  IconWand,
} from "./icons";

const navItems = [
  { label: "Home", icon: IconHome },
  { label: "Studio", icon: IconLayers },
  { label: "Collections", icon: IconStack },
  { label: "Library", icon: IconLibrary },
  { label: "Memory", icon: IconDatabase },
  { label: "Usage", icon: IconBarChart },
];

export function Sidebar({
  open,
  onNavigate,
  onHomeClick,
}: {
  open: boolean;
  onNavigate: () => void;
  onHomeClick: () => void;
}) {
  const [active, setActive] = useState("Home");
  const [toolsOpen, setToolsOpen] = useState(true);

  return (
    <aside
      className={`z-30 flex flex-col gap-1 overflow-y-auto border-r border-border bg-surface p-4 pt-[22px]
        max-[860px]:absolute max-[860px]:inset-y-0 max-[860px]:left-0 max-[860px]:w-[min(260px,84%)]
        max-[860px]:shadow-[16px_0_40px_-20px_rgba(0,0,0,0.3)] max-[860px]:transition-transform max-[860px]:duration-200
        ${open ? "max-[860px]:translate-x-0" : "max-[860px]:-translate-x-full"}`}
    >
      <div className="flex items-center gap-2.5 px-2.5 pb-4.5 pt-1">
        <IconSparkle className="size-[30px] flex-none text-text-1" />
        <span className="font-heading text-[16.5px] font-bold tracking-tight text-text-1">Rechatta</span>
      </div>

      <nav className="mb-1.5 flex flex-col gap-px">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="nav-item"
            aria-current={active === label ? "page" : undefined}
            onClick={() => {
              setActive(label);
              onNavigate();
              if (label === "Home") onHomeClick();
            }}
          >
            <Icon className="size-[18px] flex-none" />
            {label}
          </button>
        ))}
        <button
          className="nav-item"
          aria-current={active === "Notifications" ? "page" : undefined}
          onClick={() => {
            setActive("Notifications");
            onNavigate();
          }}
        >
          <IconBell className="size-[18px] flex-none" />
          Notifications
          <span className="ml-auto rounded-full bg-text-1 px-1.5 py-px font-mono text-[10.5px] font-bold text-surface">5</span>
        </button>
        <button
          className="nav-item"
          aria-current={active === "Settings" ? "page" : undefined}
          onClick={() => {
            setActive("Settings");
            onNavigate();
          }}
        >
          <IconGear className="size-[18px] flex-none" />
          Settings
        </button>
      </nav>

      <button
        className="flex w-full items-center justify-between px-3 py-1.5 pt-4 text-[11px] font-bold uppercase tracking-wider text-text-3"
        aria-expanded={toolsOpen}
        onClick={() => setToolsOpen((v) => !v)}
      >
        AI tools
        <IconChevron className={`size-[15px] text-text-3 transition-transform ${toolsOpen ? "" : "-rotate-90"}`} />
      </button>
      {toolsOpen && (
        <div className="flex flex-col gap-px">
          <button className="nav-item">
            <IconBot className="size-[18px] flex-none" />
            Agent builder
          </button>
          <button className="nav-item">
            <IconWand className="size-[18px] flex-none" />
            Prompt assist
          </button>
        </div>
      )}

      <div className="flex-1" />

      <div className="mt-2.5 flex flex-col gap-2.5 rounded-2xl bg-surface-inset p-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-8 flex-none items-center justify-center rounded-full bg-linear-to-br from-sparkle-a to-sparkle-b text-[12.5px] font-bold text-white">
            MC
            <span className="absolute -bottom-px -right-px size-2 rounded-full border-2 border-surface-inset bg-[#2fb463]" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-bold text-text-1">Maya Chen</div>
            <div className="truncate text-[11.5px] text-text-3">@maya_chen</div>
          </div>
        </div>
        <button className="cta-pill">
          <span className="cta-orb orb size-6">
            <IconSparkle className="size-[15px]" />
          </span>
          <span className="cta-label">Upgrade now</span>
        </button>
      </div>
    </aside>
  );
}
