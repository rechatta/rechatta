"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Artifact } from "@/lib/mock-data";
import { IconCopy, IconCheck } from "./icons";

export function ArtifactView({ artifact }: { artifact: Artifact }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="my-2.5 max-w-[560px] overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <span className="truncate text-[12.8px] font-bold text-text-1">{artifact.title}</span>
        <button
          className="flex size-7 flex-none items-center justify-center rounded-lg text-text-3 transition-colors duration-150 ease-out hover:bg-surface-hover hover:text-text-1"
          onClick={copy}
          title="Copy content"
          aria-label="Copy content"
        >
          {copied ? <IconCheck className="size-[14px]" /> : <IconCopy className="size-[14px]" />}
        </button>
      </div>
      <div
        className="max-h-[420px] overflow-y-auto px-4 py-3 text-[13.4px] leading-relaxed text-text-1
          [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-[17px] [&_h1]:font-bold [&_h1]:first:mt-0
          [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:first:mt-0
          [&_h3]:mb-1 [&_h3]:mt-2.5 [&_h3]:text-[13.8px] [&_h3]:font-bold
          [&_p]:mb-2.5 [&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5
          [&_li]:mb-0.5 [&_strong]:font-bold [&_a]:text-agent-research [&_a]:underline
          [&_code]:rounded [&_code]:bg-surface-inset [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]
          [&_pre]:mb-2.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-inset [&_pre]:p-2.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0"
      >
        <ReactMarkdown>{artifact.content}</ReactMarkdown>
      </div>
    </div>
  );
}
