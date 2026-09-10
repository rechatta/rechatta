"use client";

import { useState } from "react";
import { RiBrainLine, RiBarChartLine, RiCloseLine } from "@remixicon/react";

const categories = [
  { key: "memory", label: "Memory", icon: RiBrainLine, blurb: "What Rechatta remembers about you across chats." },
  { key: "usage", label: "Usage", icon: RiBarChartLine, blurb: "Your message and agent usage this billing period." },
] as const;

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<(typeof categories)[number]["key"]>("memory");
  const current = categories.find((c) => c.key === active)!;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,15,18,0.4)] px-4" onClick={onClose}>
      <div
        className="flex h-[520px] w-full max-w-[680px] overflow-hidden rounded-[22px] border border-border-soft bg-surface shadow-card-hover [animation:pop-in_0.2s_cubic-bezier(0.16,1,0.3,1)_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-[190px] flex-none flex-col gap-0.5 border-r border-border bg-surface-inset p-3">
          <h2 className="px-2 pb-3 pt-1 text-[13px] font-bold text-text-1">Settings</h2>
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
          <button
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-text-3 transition-colors duration-150 ease-out hover:bg-surface-hover hover:text-text-1"
            onClick={onClose}
            aria-label="Close settings"
            title="Close settings"
          >
            <RiCloseLine className="size-[18px]" />
          </button>
          <h3 className="text-[16px] font-bold text-text-1">{current.label}</h3>
          <p className="mt-1.5 max-w-[380px] text-[13px] text-text-2">{current.blurb}</p>
          <div className="mt-6 flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-border text-[13px] text-text-3">
            Nothing here yet
          </div>
        </div>
      </div>
    </div>
  );
}
