"use client";

import type { Artifact } from "@/lib/mock-data";
import { RiFileTextLine, RiCodeSSlashLine } from "@remixicon/react";

export function ArtifactChip({ artifact, onOpen }: { artifact: Artifact; onOpen: () => void }) {
  const Icon = artifact.kind === "html" ? RiCodeSSlashLine : RiFileTextLine;
  return (
    <button
      onClick={onOpen}
      className="my-1.5 flex max-w-[320px] items-center gap-2.5 rounded-2xl border border-border bg-surface px-3.5 py-3 text-left shadow-card transition hover:-translate-y-0.5 hover:border-border-soft hover:shadow-card-hover"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-xl bg-surface-inset text-text-1">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-text-1">{artifact.title}</span>
        <span className="block text-[11.5px] text-text-3">Click to open</span>
      </span>
    </button>
  );
}
