import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AttachmentPointer } from "@/lib/mock-data";

// Keeps the model well under a small model's context budget even for a
// near-cap (20MB) upload — and tells it explicitly when it's seeing a
// fragment instead of silently reasoning over a truncated document.
const MAX_CHARS = 30_000;

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return `${text.slice(0, MAX_CHARS)}\n\n[truncated: showing ${MAX_CHARS} of ${text.length} characters]`;
}

// Same filename-resolution architecture as createRunCodeTool (run-code.ts) —
// the model only ever passes a plain filename, never the opaque storage path,
// for the same reason: a small model reliably mangles opaque tokens copied
// across turns.
export function createReadDocumentTool(attachments: AttachmentPointer[]) {
  return tool({
    description:
      "Read the text content of a previously attached document (pdf, docx, txt, md, csv, json) — use this to summarize, quote, or answer questions about a document's content. For computing or analyzing numbers in a tabular file, use runCode instead: this tool returns raw text, not parsed data.",
    inputSchema: z.object({
      fileName: z.string().describe("Exact filename of a previously attached file, e.g. \"report.pdf\""),
    }),
    execute: async ({ fileName }) => {
      const attachment = attachments.find((a) => a.name === fileName);
      if (!attachment) return { error: `No attached file named "${fileName}" found in this conversation.` };

      const supabase = await createClient();
      const { data, error } = await supabase.storage.from("chat-attachments").download(attachment.path);
      if (error || !data) return { error: `Could not download "${fileName}": ${error?.message ?? "unknown error"}` };

      const buf = Buffer.from(await data.arrayBuffer());
      const mediaType = attachment.mediaType;

      try {
        if (mediaType === "application/pdf") {
          const { PDFParse } = await import("pdf-parse");
          const parser = new PDFParse({ data: buf });
          const result = await parser.getText();
          return { text: truncate(result.text) };
        }

        if (mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const mammoth = await import("mammoth");
          const { value } = await mammoth.extractRawText({ buffer: buf });
          return { text: truncate(value) };
        }

        if (mediaType.startsWith("text/") || mediaType === "application/json") {
          return { text: truncate(buf.toString("utf-8")) };
        }

        return { error: `Unsupported file type for reading: ${mediaType}` };
      } catch (e) {
        return { error: `Failed to read "${fileName}": ${e instanceof Error ? e.message : String(e)}` };
      }
    },
  });
}
