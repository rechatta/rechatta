import { tool } from "ai";
import { z } from "zod";

// Additional kinds (image, docx) may land later — the tool-output extraction
// on the client doesn't change when they're added, since content always
// stays a plain string (JSON-encoded for quiz/chart) inside {kind,title,content}.
export const createArtifact = tool({
  description:
    "Produce a rich, user-facing document artifact (rendered separately from your reply text) instead of putting long-form content inline in the chat. Use kind \"markdown\" for written content, kind \"html\" for a webpage/landing-page/UI design (content is the full self-contained HTML document, rendered live in a sandboxed preview), kind \"quiz\" for interactive quiz questions (content is a JSON string: {questions:[{question,options,correctIndex,explanation?}]}), and kind \"chart\" for a bar/line chart of data (content is a JSON string: {type:\"bar\"|\"line\",data:object[],xKey,series:[{key,label}]}).",
  inputSchema: z.object({
    kind: z.enum(["markdown", "html", "quiz", "chart"]).describe("The artifact type"),
    title: z.string().describe("Short title shown above the artifact"),
    content: z
      .string()
      .describe(
        "The markdown content; a full self-contained HTML document when kind is \"html\"; or a JSON-encoded string matching the quiz/chart shape when kind is \"quiz\"/\"chart\""
      ),
  }),
  execute: async ({ kind, title, content }) => {
    return { kind, title, content };
  },
});
