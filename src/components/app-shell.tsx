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
    <div className="relative h-dvh w-full">
      <div
        className={`fixed inset-0 z-50 bg-[rgba(15,15,18,0.4)] transition-opacity duration-200 ${
          scrimVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closePanels}
      />

      <div className="relative grid h-full w-full grid-cols-[240px_1fr] overflow-hidden bg-surface max-[860px]:grid-cols-1">
        <Sidebar open={sidebarOpen} onNavigate={closePanels} />
        <CenterPanel
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onToggleHistory={() => setHistoryOpen((v) => !v)}
        />
      </div>

      <HistoryPanel open={historyOpen} />
      <SvgDefs />
    </div>
  );
}
