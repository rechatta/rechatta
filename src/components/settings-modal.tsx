"use client";

import { useState } from "react";
import { RiBrainLine, RiBarChartLine } from "@remixicon/react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

const categories = [
  { key: "memory", label: "Memory", icon: RiBrainLine, blurb: "What Rechatta remembers about you across chats." },
  { key: "usage", label: "Usage", icon: RiBarChartLine, blurb: "Your message and agent usage this billing period." },
] as const;

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<(typeof categories)[number]["key"]>("memory");
  const current = categories.find((c) => c.key === active)!;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton
        className="flex h-[520px] w-full max-w-[680px] flex-row gap-0 overflow-hidden rounded-[22px] border-border-soft bg-surface p-0 shadow-card-hover sm:max-w-[680px]"
      >
        <DialogDescription className="sr-only">Manage your Rechatta account settings.</DialogDescription>
        <div className="flex w-[190px] flex-none flex-col gap-0.5 border-r border-border bg-surface-inset p-3">
          <DialogTitle className="px-2 pb-3 pt-1 text-[13px] font-bold text-text-1">Settings</DialogTitle>
          {categories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className="nav-item"
              aria-current={active === key ? "page" : undefined}
              onClick={() => setActive(key)}
            >
              <Icon className="size-[17px] flex-none" />
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 p-6">
          <h3 className="text-[16px] font-bold text-text-1">{current.label}</h3>
          <p className="mt-1.5 max-w-[380px] text-[13px] text-text-2">{current.blurb}</p>
          <div className="mt-6 flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-border text-[13px] text-text-3">
            Nothing here yet
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
