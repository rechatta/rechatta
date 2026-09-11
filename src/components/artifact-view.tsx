"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Artifact, ChartData, QuizData } from "@/lib/mock-data";
import { IconCopy, IconCheck } from "./icons";
import { RiCloseLine, RiDownloadLine } from "@remixicon/react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Badge } from "./ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "./ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

function QuizView({ data }: { data: QuizData }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = data.questions.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);

  return (
    <div className="flex flex-col gap-4">
      {data.questions.map((q, i) => (
        <Card key={i} className="gap-3 p-4">
          <p className="text-[13.5px] font-semibold text-text-1">
            {i + 1}. {q.question}
          </p>
          <RadioGroup
            value={answers[i] !== undefined ? answers[i].toString() : ""}
            onValueChange={(v) => setAnswers((a) => ({ ...a, [i]: Number(v) }))}
            disabled={submitted}
            className="gap-2"
          >
            {q.options.map((opt, j) => {
              const isCorrect = submitted && j === q.correctIndex;
              const isWrongPick = submitted && answers[i] === j && j !== q.correctIndex;
              return (
                <label
                  key={j}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] ${
                    isCorrect
                      ? "border-agent-code bg-agent-code-bg text-agent-code"
                      : isWrongPick
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border text-text-1"
                  }`}
                >
                  <RadioGroupItem value={j.toString()} />
                  {opt}
                </label>
              );
            })}
          </RadioGroup>
          {submitted && q.explanation && <p className="text-[12px] text-text-3">{q.explanation}</p>}
        </Card>
      ))}
      <div className="flex items-center gap-3">
        {!submitted ? (
          <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < data.questions.length}>
            Check answers
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
            >
              Retake
            </Button>
            <Badge variant="secondary" className="rounded-full">
              {score} / {data.questions.length} correct
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}

function ChartView({ data }: { data: ChartData }) {
  const config = Object.fromEntries(
    data.series.map((s, i) => [s.key, { label: s.label, color: `var(--chart-${(i % 5) + 1})` }])
  ) satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="h-[360px] w-full">
      {data.type === "bar" ? (
        <BarChart data={data.data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={data.xKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {data.series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
          {data.series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={4} isAnimationActive={false} />
          ))}
        </BarChart>
      ) : (
        <LineChart data={data.data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={data.xKey} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {data.series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
          {data.series.map((s) => (
            <Line key={s.key} dataKey={s.key} stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      )}
    </ChartContainer>
  );
}

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
    const ext = artifact.kind === "html" ? "html" : artifact.kind === "quiz" || artifact.kind === "chart" ? "json" : "md";
    const mime = artifact.kind === "html" ? "text/html" : artifact.kind === "quiz" || artifact.kind === "chart" ? "application/json" : "text/markdown";
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

  const actions = (
    <div className="flex flex-none items-center gap-1.5">
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
  );

  if (artifact.kind === "html") {
    return (
      <Tabs value={tab} onValueChange={(v) => setTab(v as "preview" | "code")} className="flex h-full min-h-0 flex-col gap-0">
        <div className="flex flex-none items-center justify-between border-b border-border px-4 py-3">
          <span className="truncate text-[13px] font-bold text-text-1">{artifact.title}</span>
          <div className="flex flex-none items-center gap-1.5">
            <TabsList className="h-auto rounded-lg bg-surface-inset p-0.5">
              <TabsTrigger
                value="preview"
                className="rounded-md px-2.5 py-1 text-[11.5px] font-semibold text-text-3 data-[state=active]:bg-surface data-[state=active]:text-text-1 data-[state=active]:shadow-card"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="rounded-md px-2.5 py-1 text-[11.5px] font-semibold text-text-3 data-[state=active]:bg-surface data-[state=active]:text-text-1 data-[state=active]:shadow-card"
              >
                Code
              </TabsTrigger>
            </TabsList>
            {actions}
          </div>
        </div>
        <TabsContent value="preview" className="m-0 flex min-h-0 flex-1 flex-col">
          {/* No allow-same-origin: the embedded page can run script but gets
              an opaque origin, with no access to this app's cookies/storage.
              allow-forms/allow-popups/allow-modals don't reintroduce that risk —
              they just let generated forms, target="_blank" links, and
              alert()/confirm() actually work instead of silently no-oping. */}
          <iframe
            srcDoc={withScrollSafety(artifact.content)}
            sandbox="allow-scripts allow-forms allow-popups allow-modals"
            title={artifact.title}
            className="min-h-0 w-full flex-1 bg-white"
          />
        </TabsContent>
        <TabsContent value="code" className="m-0 flex min-h-0 flex-1 flex-col bg-surface-inset">
          <ScrollArea className="h-full">
            {/* No horizontal scroll inside the artifact — the panel itself
                expands (drag its left edge) for long lines instead of a nested
                x-scrollbar, so code wraps rather than overflowing sideways. */}
            <pre className="whitespace-pre-wrap break-words px-5 py-4 font-mono text-[12.5px] leading-relaxed text-text-1">
              <code>{artifact.content}</code>
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    );
  }

  if (artifact.kind === "quiz" || artifact.kind === "chart") {
    let parsed: QuizData | ChartData | null = null;
    try {
      parsed = JSON.parse(artifact.content);
    } catch {
      parsed = null;
    }
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex flex-none items-center justify-between border-b border-border px-4 py-3">
          <span className="truncate text-[13px] font-bold text-text-1">{artifact.title}</span>
          {actions}
        </div>
        {!parsed ? (
          <p className="px-5 py-4 text-[13px] text-text-3">This artifact couldn&apos;t be rendered.</p>
        ) : artifact.kind === "quiz" ? (
          <ScrollArea className="min-h-0 flex-1">
            <div className="px-5 py-4">
              <QuizView data={parsed as QuizData} />
            </div>
          </ScrollArea>
        ) : (
          // Recharts' ResponsiveContainer measures its DOM node's size on
          // mount — Radix ScrollArea's viewport (display:table internally)
          // reports 0x0 at that point, so charts get a plain scroll div
          // instead, sidestepping the mismeasure.
          <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
            <ChartView data={parsed as ChartData} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-none items-center justify-between border-b border-border px-4 py-3">
        <span className="truncate text-[13px] font-bold text-text-1">{artifact.title}</span>
        {actions}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="artifact-prose px-5 py-4">
          <ReactMarkdown>{artifact.content}</ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
}
