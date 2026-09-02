"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { CenterPanel } from "./center-panel";
import { HistoryPanel } from "./history-panel";
import { SvgDefs } from "./svg-defs";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const closePanels = () => {
    setSidebarOpen(false);
    setHistoryOpen(false);
  };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closePanels();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const scrimVisible = sidebarOpen || historyOpen;

  return (
    <div className="flex min-h-dvh items-center justify-center p-[clamp(12px,3vw,40px)] max-[520px]:p-0">
      <div className="relative h-[min(880px,calc(100dvh-24px))] w-[min(1400px,100%)] max-[520px]:h-dvh">
        <div
          className={`fixed inset-0 z-50 bg-[rgba(15,15,18,0.4)] transition-opacity duration-200 ${
            scrimVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closePanels}
        />

        <div className="relative grid h-full w-full grid-cols-[240px_1fr] overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-shell max-[860px]:grid-cols-1 max-[520px]:rounded-none">
          <Sidebar open={sidebarOpen} onNavigate={closePanels} />
          <CenterPanel
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onToggleHistory={() => setHistoryOpen((v) => !v)}
          />
        </div>

        <HistoryPanel open={historyOpen} />
      </div>

      <SvgDefs />
    </div>
  );
}
