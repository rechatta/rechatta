"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Artifact } from "@/lib/mock-data";
import { IconCopy, IconCheck } from "./icons";
import { RiCloseLine, RiDownloadLine } from "@remixicon/react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// A generated page can set `overflow: hidden` / fixed heights on html/body
// (e.g. a full-viewport hero) which leaves no way to reach the rest of the
// content from outside the iframe. Force it scrollable regardless — !important
// so it wins no matter where the page's own rules fall in the cascade.
const SCROLL_SAFETY_CSS =
  "<style>html,body{overflow:auto!important;height:auto!important;min-height:100%!important;}</style>";

function withScrollSafety(html: string) {
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${SCROLL_SAFETY_CSS}</head>`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}${SCROLL_SAFETY_CSS}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${SCROLL_SAFETY_CSS}</head>`);
  return `${SCROLL_SAFETY_CSS}${html}`;
}

function slugify(title: string) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "artifact";
}

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

  function download() {
    const ext = artifact.kind === "html" ? "html" : "md";
    const mime = artifact.kind === "html" ? "text/html" : "text/markdown";
    const blob = new Blob([artifact.content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(artifact.title)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="size-7 rounded-lg text-text-3 hover:text-text-1" onClick={copy} aria-label="Copy content">
                {copied ? <IconCheck className="size-[14px]" /> : <IconCopy className="size-[14px]" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy content</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="size-7 rounded-lg text-text-3 hover:text-text-1" onClick={download} aria-label="Download">
                <RiDownloadLine className="size-[15px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
          {onClose && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-7 rounded-lg text-text-3 hover:text-text-1" onClick={onClose} aria-label="Close">
                  <RiCloseLine className="size-[16px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {artifact.kind === "html" ? (
        tab === "preview" ? (
          // No allow-same-origin: the embedded page can run script but gets
          // an opaque origin, with no access to this app's cookies/storage.
          // allow-forms/allow-popups/allow-modals don't reintroduce that risk —
          // they just let generated forms, target="_blank" links, and
          // alert()/confirm() actually work instead of silently no-oping.
          <iframe
            srcDoc={withScrollSafety(artifact.content)}
            sandbox="allow-scripts allow-forms allow-popups allow-modals"
            title={artifact.title}
            className="min-h-0 w-full flex-1 bg-white"
          />
        ) : (
          // No horizontal scroll inside the artifact — the panel itself
          // expands (drag its left edge) for long lines instead of a nested
          // x-scrollbar, so code wraps rather than overflowing sideways.
          <pre className="thin-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words bg-surface-inset px-5 py-4 font-mono text-[12.5px] leading-relaxed text-text-1">
            <code>{artifact.content}</code>
          </pre>
        )
      ) : (
        <div className="artifact-prose thin-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
          <ReactMarkdown>{artifact.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
