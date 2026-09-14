import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { visit } from "unist-util-visit";
import type { Root, Element, Text } from "hast";
import { IconLink } from "./icons";

// Model output is typically "...as needed. [Read more](url)." — the period
// closes the sentence in source markdown, but once the link renders as a
// citation chip that trailing "." reads as a stray character glued to the
// chip. Strip a lone leading "." (and one optional space) off the text node
// immediately following a link, everywhere in the tree.
function rehypeStripCitationPeriod() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      const children = node.children;
      for (let i = 0; i < children.length - 1; i++) {
        const link = children[i];
        const after = children[i + 1];
        if (link.type === "element" && link.tagName === "a" && after.type === "text") {
          (after as Text).value = after.value.replace(/^\.\s?/, "");
        }
      }
    });
  };
}

function hostnameOf(href: string | undefined) {
  if (!href) return null;
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// A citation chip: the source's domain instead of the model's own anchor
// text ("Read more") — matches how Cohere/Perplexity-style citations show
// the site name, not a generic call-to-action.
const citationLink: Components["a"] = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="mx-0.5 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 align-middle text-xs font-medium text-text-2 no-underline transition-colors duration-150 ease-out hover:bg-surface-hover hover:text-text-1"
  >
    <IconLink className="size-[11px] flex-none" />
    {hostnameOf(href) ?? children}
  </a>
);

// Shared rendering for any LLM-authored text: chat replies and markdown-kind
// artifacts both need GFM (tables, strikethrough, autolinks) and math, not
// just the bold/italic/code CommonMark subset react-markdown supports alone.
export function Markdown({
  children,
  linkVariant = "inline",
}: {
  children: string;
  // "citation" turns links into source-name chips — chat replies use this
  // for search citations. Long-form artifact prose keeps plain inline links
  // since a chip mid-sentence would break reading flow, and its links are
  // usually real references, not throwaway "read more" citations.
  linkVariant?: "inline" | "citation";
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={linkVariant === "citation" ? [rehypeKatex, rehypeStripCitationPeriod] : [rehypeKatex]}
      components={{
        // A wide table would otherwise overflow the bubble/panel it sits in —
        // scope the scrollbar to the table itself instead of the whole message.
        table: (props) => (
          <div className="overflow-x-auto">
            <table {...props} />
          </div>
        ),
        ...(linkVariant === "citation" ? { a: citationLink } : {}),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
