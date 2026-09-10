"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Artifact } from "@/lib/mock-data";
import { IconCopy, IconCheck } from "./icons";
import { RiCloseLine } from "@remixicon/react";

// Panel content only — the panel's own chrome (border, background, mobile
// overlay vs. desktop column) is owned by CenterPanel, which is also the
// only place this is mounted (the thread now shows an ArtifactChip instead).
export function ArtifactView({ artifact, onClose }: { artifact: Artifact; onClose?: () => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-none items-center justify-between border-b border-border px-4 py-3">
        <span className="truncate text-[13px] font-bold text-text-1">{artifact.title}</span>
        <div className="flex flex-none items-center gap-0.5">
          <button
            className="flex size-7 items-center justify-center rounded-lg text-text-3 transition-colors duration-150 ease-out hover:bg-surface-hover hover:text-text-1"
            onClick={copy}
            title="Copy content"
            aria-label="Copy content"
          >
            {copied ? <IconCheck className="size-[14px]" /> : <IconCopy className="size-[14px]" />}
          </button>
          {onClose && (
            <button
              className="flex size-7 items-center justify-center rounded-lg text-text-3 transition-colors duration-150 ease-out hover:bg-surface-hover hover:text-text-1"
              onClick={onClose}
              title="Close"
              aria-label="Close"
            >
              <RiCloseLine className="size-[16px]" />
            </button>
          )}
        </div>
      </div>
      <div className="artifact-prose min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <ReactMarkdown>{artifact.content}</ReactMarkdown>
      </div>
    </div>
  );
}
