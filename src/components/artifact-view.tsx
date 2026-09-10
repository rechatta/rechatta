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
  const [tab, setTab] = useState<"preview" | "code">("preview");

  function copy() {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-none items-center justify-between border-b border-border px-4 py-3">
        <span className="truncate text-[13px] font-bold text-text-1">{artifact.title}</span>
        <div className="flex flex-none items-center gap-1.5">
          {artifact.kind === "html" && (
            <div className="flex items-center rounded-lg bg-surface-inset p-0.5 text-[11.5px] font-semibold">
              <button
                className={`rounded-md px-2.5 py-1 transition-colors duration-150 ease-out ${tab === "preview" ? "bg-surface text-text-1 shadow-card" : "text-text-3 hover:text-text-1"}`}
                onClick={() => setTab("preview")}
              >
                Preview
              </button>
              <button
                className={`rounded-md px-2.5 py-1 transition-colors duration-150 ease-out ${tab === "code" ? "bg-surface text-text-1 shadow-card" : "text-text-3 hover:text-text-1"}`}
                onClick={() => setTab("code")}
              >
                Code
              </button>
            </div>
          )}
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

      {artifact.kind === "html" ? (
        tab === "preview" ? (
          // No allow-same-origin: the embedded page can run script but gets
          // an opaque origin, with no access to this app's cookies/storage.
          <iframe
            srcDoc={artifact.content}
            sandbox="allow-scripts"
            title={artifact.title}
            className="min-h-0 flex-1 bg-white"
          />
        ) : (
          <pre className="min-h-0 flex-1 overflow-auto bg-surface-inset px-5 py-4 font-mono text-[12.5px] leading-relaxed text-text-1">
            <code>{artifact.content}</code>
          </pre>
        )
      ) : (
        <div className="artifact-prose min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <ReactMarkdown>{artifact.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
